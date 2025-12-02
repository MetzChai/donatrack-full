import { Request, Response } from "express";
import prisma from "../services/prisma.service";

// Get user's fund balance
export const getMyFunds = async (req: any, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        currentFunds: true,
        withdrawableFunds: true,
        campaigns: {
          select: {
            id: true,
            title: true,
            collected: true,
            goalAmount: true,
          },
        },
      },
    });

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
    const { amount } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Invalid withdrawal amount" });
    }

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) return res.status(404).json({ error: "User not found" });

    if (user.withdrawableFunds < amount) {
      return res.status(400).json({ error: "Insufficient withdrawable funds" });
    }

    // Update user funds
    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        currentFunds: { decrement: amount },
        withdrawableFunds: { decrement: amount },
      },
    });

    // In a real system, you would integrate with a payment gateway here
    // to transfer funds to the user's bank account or e-wallet
    // For now, we just update the database

    return res.json({
      message: "Withdrawal request processed",
      withdrawableFunds: updated.withdrawableFunds,
      currentFunds: updated.currentFunds,
      withdrawnAmount: amount,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Withdrawal failed" });
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


