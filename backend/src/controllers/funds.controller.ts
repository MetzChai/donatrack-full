import { Request, Response } from "express";
import prisma from "../services/prisma.service";
import { calculatePlatformFee } from "../services/xendit.service";

// Recalculate and persist a user's balances from completed donations minus withdrawals
async function recalcUserBalances(userId: string) {
  // Sum donations to campaigns owned by the user that are completed
  const donations = await prisma.donation.findMany({
    where: {
      status: "COMPLETED",
      campaign: { userId },
    },
    select: { amount: true },
  });

  const totalDonations = donations.reduce((sum, d) => sum + Number(d.amount), 0);
  const totalWithdrawable = donations.reduce(
    (sum, d) => sum + (Number(d.amount) - calculatePlatformFee(Number(d.amount))),
    0
  );

  // Sum all withdrawals by this user (regardless of campaign scope)
  const withdrawals = await prisma.withdrawal.aggregate({
    where: { userId },
    _sum: { amount: true },
  });
  const totalWithdrawn = Number(withdrawals._sum.amount || 0);

  const currentFunds = Math.max(totalDonations - totalWithdrawn, 0);
  const withdrawableFunds = Math.max(totalWithdrawable - totalWithdrawn, 0);

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      currentFunds,
      withdrawableFunds,
    },
    select: {
      id: true,
      currentFunds: true,
      withdrawableFunds: true,
      campaigns: {
        select: { id: true, title: true, collected: true, goalAmount: true },
      },
    },
  });

  return updated;
}

// Get user's fund balance
export const getMyFunds = async (req: any, res: Response) => {
  try {
    // Recalculate to ensure funds reflect all completed donations minus withdrawals
    const user = await recalcUserBalances(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    return res.json({
      currentFunds: user.currentFunds,
      withdrawableFunds: user.withdrawableFunds,
      campaigns: user.campaigns,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch funds" });
  }
};

// Withdraw funds (Option 2 - Platform-handled)
export const withdrawFunds = async (req: any, res: Response) => {
  try {
    const { amount, campaignId } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Invalid withdrawal amount" });
    }

    // Recalculate balances before validating withdrawal limits
    const user = await recalcUserBalances(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (user.withdrawableFunds < amount) {
      return res.status(400).json({ error: "Insufficient withdrawable funds" });
    }

    // Validate campaign if provided (before transaction)
    let campaign = null;
    if (campaignId) {
      campaign = await prisma.campaign.findUnique({
        where: { id: campaignId },
      });

      if (!campaign) {
        return res.status(404).json({ error: "Campaign not found" });
      }

      // Allow withdrawals only after campaign is ended (implementation stage)
      if (!campaign.isEnded) {
        return res.status(400).json({ error: "Campaign must be ended before withdrawing for implementation" });
      }

      // Only campaign creator or admin can withdraw from their campaign
      if (campaign.userId !== req.user.id && req.user.role !== "ADMIN") {
        return res.status(403).json({ error: "Forbidden: You can only withdraw from your own campaigns" });
      }

      // Prevent withdrawing from implemented campaigns (preserve history)
      if (campaign.isImplemented) {
        return res.status(400).json({ error: "Cannot withdraw from implemented campaigns. The collected amount is preserved for transparency." });
      }

      // Check if campaign has enough collected amount
      if (campaign.collected < amount) {
        return res.status(400).json({ error: "Insufficient campaign funds. Campaign collected amount is less than withdrawal amount" });
      }
    }

    // Update user funds, campaign, and log withdrawal in a single transaction
    const updated = await prisma.$transaction(async (tx) => {
      // Update user funds
      const updatedUser = await tx.user.update({
        where: { id: req.user.id },
        data: {
          currentFunds: { decrement: amount },
          withdrawableFunds: { decrement: amount },
        },
      });

      // Validate funds are not negative after update
      if (updatedUser.currentFunds < 0 || updatedUser.withdrawableFunds < 0) {
        throw new Error("Insufficient funds: balance would go negative");
      }

      // Update campaign collected amount if provided
      if (campaignId && campaign) {
        const updatedCampaign = await tx.campaign.update({
          where: { id: campaignId },
          data: {
            collected: { decrement: amount },
          },
        });

        // Validate campaign collected is not negative
        if (updatedCampaign.collected < 0) {
          throw new Error("Insufficient campaign funds: balance would go negative");
        }
      }

      // Create withdrawal record
      await tx.withdrawal.create({
        data: {
          amount,
          status: "PENDING",
          userId: req.user.id,
          campaignId: campaignId || null,
        },
      });

      return updatedUser;
    });

    // In a real system, you would integrate with a payment gateway here
    // to transfer funds to the user's bank account or e-wallet
    // For now, we just update the database

    return res.json({
      message: "Withdrawal request processed",
      withdrawableFunds: updated.withdrawableFunds,
      currentFunds: updated.currentFunds,
      withdrawnAmount: amount,
      campaignId: campaignId || null,
    });
  } catch (err: any) {
    console.error("Withdrawal error:", err);
    console.error("Error code:", err.code);
    console.error("Error message:", err.message);
    console.error("Error stack:", err.stack);
    
    // Return more specific error messages
    if (err.code === "P2002") {
      return res.status(400).json({ error: "Database constraint violation. Please try again." });
    }
    if (err.code === "P2003") {
      return res.status(400).json({ error: "Invalid reference. Campaign or user not found." });
    }
    if (err.message?.includes("insufficient") || err.message?.includes("negative")) {
      return res.status(400).json({ error: err.message });
    }
    if (err.message?.includes("would go negative")) {
      return res.status(400).json({ error: err.message });
    }
    
    // Return detailed error - always show the actual error message
    const errorMessage = err.message || err.toString() || "Withdrawal failed. Please check your balance and try again.";
    
    return res.status(500).json({ 
      error: errorMessage,
      code: err.code || "UNKNOWN_ERROR",
      ...(process.env.NODE_ENV === "development" && { 
        details: {
          message: err.message,
          code: err.code,
          stack: err.stack
        }
      })
    });
  }
};

// Get current user's withdrawal history
export const getMyWithdrawals = async (req: any, res: Response) => {
  try {
    const logs = await prisma.withdrawal.findMany({
      where: { userId: req.user.id },
      include: {
        campaign: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return res.json(logs);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch withdrawals" });
  }
};

// Admin: get all withdrawal history
export const getAllWithdrawals = async (_req: any, res: Response) => {
  try {
    const logs = await prisma.withdrawal.findMany({
      include: {
        user: { select: { id: true, email: true, fullName: true, role: true } },
        campaign: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return res.json(logs);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch all withdrawals" });
  }
};

// Admin: update withdrawal status (e.g., mark paid)
export const updateWithdrawalStatus = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowed = ["PENDING", "COMPLETED", "FAILED"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const withdrawal = await prisma.withdrawal.findUnique({ where: { id } });
    if (!withdrawal) return res.status(404).json({ error: "Withdrawal not found" });

    const updated = await prisma.withdrawal.update({
      where: { id },
      data: { status },
    });

    return res.json({ message: "Withdrawal status updated", withdrawal: updated });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to update withdrawal status" });
  }
};

// Update Xendit API keys (Option 1 - Creator's own keys)
export const updateXenditKeys = async (req: any, res: Response) => {
  try {
    const { xenditApiKey, xenditSecretKey, xenditClientKey } = req.body;

    // Only CREATOR or ADMIN can update Xendit keys
    if (req.user.role !== "CREATOR" && req.user.role !== "ADMIN") {
      return res.status(403).json({ error: "Forbidden: Only creators can update Xendit keys" });
    }

    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(xenditApiKey && { xenditApiKey }),
        ...(xenditSecretKey && { xenditSecretKey }),
        ...(xenditClientKey && { xenditClientKey }),
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        xenditApiKey: true,
        xenditClientKey: true,
        // Don't return secret key for security
      },
    });

    return res.json({
      message: "Xendit keys updated successfully",
      user: updated,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to update Xendit keys" });
  }
};


