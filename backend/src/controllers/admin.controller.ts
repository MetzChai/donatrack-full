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

    await prisma.user.delete({ where: { id } });

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

    return res.json({
      totalUsers,
      totalCampaigns,
      totalDonations,
      totalFunds: totalFunds._sum.currentFunds || 0,
      totalDonationAmount: totalDonationAmount._sum.amount || 0,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch admin stats" });
  }
};
