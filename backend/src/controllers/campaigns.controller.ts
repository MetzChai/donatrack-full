import { Request, Response } from "express";
import prisma from "../services/prisma.service";

export const getCampaigns = async (_req: Request, res: Response) => {
  try {
    const campaigns = await prisma.campaign.findMany({
      include: { user: { select: { id: true, email: true, fullName: true } } },
      orderBy: { createdAt: "desc" },
    });
    return res.json(campaigns);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch campaigns" });
  }
};

export const getCampaignById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const campaign = await prisma.campaign.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, email: true, fullName: true } },
        donations: { include: { user: { select: { id: true, email: true, fullName: true } } } },
      },
    });
    if (!campaign) return res.status(404).json({ error: "Campaign not found" });
    return res.json(campaign);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch campaign" });
  }
};

export const createCampaign = async (req: any, res: Response) => {
  try {
    const { title, description, goalAmount, imageUrl } = req.body;
    if (!title || !description || !goalAmount) return res.status(400).json({ error: "Missing fields" });

    const campaign = await prisma.campaign.create({
      data: {
        title,
        description,
        goalAmount: Number(goalAmount),
        collected: 0,
        imageUrl: imageUrl || null,
        userId: req.user.id,
      },
    });

    return res.status(201).json(campaign);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to create campaign" });
  }
};

export const endCampaign = async (req: any, res: Response) => {
  try {
    const { id } = req.params;

    const campaign = await prisma.campaign.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!campaign) return res.status(404).json({ error: "Campaign not found" });

    // Only campaign creator or admin can end campaign
    if (campaign.userId !== req.user.id && req.user.role !== "ADMIN") {
      return res.status(403).json({ error: "Forbidden: Only campaign creator or admin can end campaign" });
    }

    // Admin can only end campaigns when goal is met
    if (req.user.role === "ADMIN" && campaign.userId !== req.user.id && campaign.collected < campaign.goalAmount) {
      return res.status(400).json({ error: "Cannot end campaign: Goal amount not yet met" });
    }

    const updatedCampaign = await prisma.campaign.update({
      where: { id },
      data: { isEnded: true },
      include: { user: { select: { id: true, email: true, fullName: true } } },
    });

    return res.json(updatedCampaign);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to end campaign" });
  }
};

export const getMyCampaigns = async (req: any, res: Response) => {
  try {
    const campaigns = await prisma.campaign.findMany({
      where: { userId: req.user.id },
      include: {
        donations: {
          include: { user: { select: { id: true, fullName: true, email: true } } },
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return res.json(campaigns);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch your campaigns" });
  }
};

export const updateCampaign = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, goalAmount, imageUrl } = req.body;

    const campaign = await prisma.campaign.findUnique({ where: { id } });
    if (!campaign) return res.status(404).json({ error: "Campaign not found" });

    if (campaign.userId !== req.user.id && req.user.role !== "ADMIN") {
      return res.status(403).json({ error: "Forbidden" });
    }

    const updated = await prisma.campaign.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(goalAmount && { goalAmount: Number(goalAmount) }),
        ...(imageUrl !== undefined && { imageUrl }),
      },
      include: { user: { select: { id: true, email: true, fullName: true } } },
    });

    return res.json(updated);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to update campaign" });
  }
};
