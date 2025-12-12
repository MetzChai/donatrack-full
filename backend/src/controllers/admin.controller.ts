import { Request, Response } from "express";
import prisma from "../services/prisma.service";

export const getUsers = async (_req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        createdAt: true,
        currentFunds: true,
        withdrawableFunds: true,
        _count: {
          select: {
            campaigns: true,
            donations: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return res.json(users);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch users" });
  }
};

export const updateUserRole = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!["USER", "CREATOR", "ADMIN"].includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }

    // Prevent changing own role
    if (id === req.user.id) {
      return res.status(400).json({ error: "Cannot change your own role" });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        createdAt: true,
      },
    });

    return res.json(updated);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to update user role" });
  }
};

export const deleteUser = async (req: any, res: Response) => {
  try {
    const { id } = req.params;

    // Prevent deleting yourself
    if (id === req.user.id) {
      return res.status(400).json({ error: "Cannot delete yourself" });
    }

    // Gather campaigns owned by this user to clean up dependent records
    const ownedCampaigns = await prisma.campaign.findMany({
      where: { userId: id },
      select: { id: true },
    });
    const ownedCampaignIds = ownedCampaigns.map((c) => c.id);

    // Delete dependent records first to satisfy foreign keys
    await prisma.$transaction([
      // Donations made by the user or to their campaigns
      prisma.donation.deleteMany({
        where: {
          OR: [
            { userId: id },
            { campaignId: { in: ownedCampaignIds } },
          ],
        },
      }),
      // Withdrawals requested by the user or tied to their campaigns
      prisma.withdrawal.deleteMany({
        where: {
          OR: [
            { userId: id },
            { campaignId: { in: ownedCampaignIds } },
          ],
        },
      }),
      // Proofs for campaigns they own
      prisma.proof.deleteMany({
        where: { campaignId: { in: ownedCampaignIds } },
      }),
      // Campaigns owned by the user
      prisma.campaign.deleteMany({ where: { userId: id } }),
      // Finally, delete the user
      prisma.user.delete({ where: { id } }),
    ]);

    return res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to delete user" });
  }
};

export const getAdminStats = async (_req: Request, res: Response) => {
  try {
    const [totalUsers, totalCampaigns, totalDonations, totalFunds] = await Promise.all([
      prisma.user.count(),
      prisma.campaign.count(),
      prisma.donation.count({ where: { status: "COMPLETED" } }),
      prisma.user.aggregate({
        _sum: { currentFunds: true },
      }),
    ]);

    const totalDonationAmount = await prisma.donation.aggregate({
      where: { status: "COMPLETED" },
      _sum: { amount: true },
    });

    // Get total unique donors
    const uniqueDonors = await prisma.donation.findMany({
      where: { status: "COMPLETED" },
      select: { userId: true },
      distinct: ["userId"],
    });

    return res.json({
      totalUsers,
      totalCampaigns,
      totalDonations,
      totalDonors: uniqueDonors.length,
      totalFunds: totalFunds._sum.currentFunds || 0,
      totalDonationAmount: totalDonationAmount._sum.amount || 0,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch admin stats" });
  }
};

export const getActiveCampaigns = async (_req: Request, res: Response) => {
  try {
    const campaigns = await prisma.campaign.findMany({
      where: { isEnded: false },
      include: { user: { select: { id: true, email: true, fullName: true } } },
      orderBy: { createdAt: "desc" },
    });
    return res.json(campaigns);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch active campaigns" });
  }
};

export const getCampaignHistory = async (_req: Request, res: Response) => {
  try {
    const campaigns = await prisma.campaign.findMany({
      where: { isEnded: true },
      include: { user: { select: { id: true, email: true, fullName: true } } },
      orderBy: { createdAt: "desc" },
    });
    return res.json(campaigns);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch campaign history" });
  }
};

export const deleteCampaign = async (req: any, res: Response) => {
  try {
    const { id } = req.params;

    const campaign = await prisma.campaign.findUnique({ where: { id } });
    if (!campaign) return res.status(404).json({ error: "Campaign not found" });

    // Prevent deleting ended campaigns (history)
    if (campaign.isEnded) {
      return res.status(400).json({ error: "Cannot delete ended campaigns. They are part of history." });
    }

    // Explicitly remove dependents first to avoid foreign key violations
    await prisma.$transaction([
      prisma.donation.deleteMany({ where: { campaignId: id } }),
      prisma.proof.deleteMany({ where: { campaignId: id } }),
      prisma.withdrawal.deleteMany({ where: { campaignId: id } }),
      prisma.campaign.delete({ where: { id } }),
    ]);

    return res.json({ message: "Campaign deleted successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to delete campaign" });
  }
};

// Admin - get all donations from all users
export const getAllDonations = async (_req: Request, res: Response) => {
  try {
    const donations = await prisma.donation.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
          },
        },
        campaign: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return res.json(donations);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch all donations" });
  }
};
