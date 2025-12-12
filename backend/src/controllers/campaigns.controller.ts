import { Request, Response } from "express";
import prisma from "../services/prisma.service";

export const getCampaigns = async (_req: Request, res: Response) => {
  try {
    const campaigns = await prisma.campaign.findMany({
      where: { isEnded: false }, // Only show active campaigns
      include: { user: { select: { id: true, email: true, fullName: true } } },
      orderBy: { createdAt: "desc" },
    });
    return res.json(campaigns);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch campaigns" });
  }
};

// Get all ended campaigns (public endpoint)
export const getEndedCampaigns = async (_req: Request, res: Response) => {
  try {
    console.log("=== getEndedCampaigns called ===");
    
    // First check total campaigns and ended campaigns count
    const totalCount = await prisma.campaign.count();
    const endedCount = await prisma.campaign.count({ where: { isEnded: true } });
    console.log(`Total campaigns: ${totalCount}, Ended campaigns: ${endedCount}`);
    
    let campaigns: any[];
    
    try {
      // Try to fetch with proofs included
      campaigns = await prisma.campaign.findMany({
        where: { isEnded: true },
        include: { 
          user: { select: { id: true, email: true, fullName: true } },
          proofs: { orderBy: { createdAt: "desc" } }
        },
        orderBy: { createdAt: "desc" },
      });
      console.log(`✓ Fetched ${campaigns.length} ended campaigns using Prisma`);
    } catch (prismaError: any) {
      // If Prisma fails (likely due to Proof.imageUrls), fetch without proofs first, then add proofs manually
      if (prismaError.code === 'P2022' || prismaError.message?.includes('imageUrls') || prismaError.message?.includes('Proof')) {
        console.warn("Prisma query with proofs failed, fetching campaigns without proofs first");
        
        // Fetch campaigns without proofs
        campaigns = await prisma.campaign.findMany({
          where: { isEnded: true },
          include: { 
            user: { select: { id: true, email: true, fullName: true } }
          },
          orderBy: { createdAt: "desc" },
        });
        
        // Fetch proofs separately using raw SQL to handle old schema
        for (const campaign of campaigns) {
          try {
            // First check if imageUrls column exists
            const columnCheck = await prisma.$queryRawUnsafe<any[]>(
              `SELECT column_name 
               FROM information_schema.columns 
               WHERE table_name = 'Proof' AND column_name = 'imageUrls'`
            );
            
            const hasImageUrlsColumn = columnCheck && columnCheck.length > 0;
            
            let rawProofs: any[];
            if (hasImageUrlsColumn) {
              // New schema: use imageUrls column
              rawProofs = await prisma.$queryRawUnsafe<any[]>(
                `SELECT p.id, p.title, p.description, p."createdAt", p."updatedAt", p."campaignId",
                        COALESCE(p."imageUrls", ARRAY[]::TEXT[]) as "imageUrls"
                 FROM "Proof" p
                 WHERE p."campaignId" = $1
                 ORDER BY p."createdAt" DESC`,
                campaign.id
              );
            } else {
              // Old schema: use imageUrl column and convert to array
              rawProofs = await prisma.$queryRawUnsafe<any[]>(
                `SELECT p.id, p.title, p.description, p."createdAt", p."updatedAt", p."campaignId",
                        CASE 
                          WHEN p."imageUrl" IS NOT NULL THEN ARRAY[p."imageUrl"]
                          ELSE ARRAY[]::TEXT[]
                        END as "imageUrls"
                 FROM "Proof" p
                 WHERE p."campaignId" = $1
                 ORDER BY p."createdAt" DESC`,
                campaign.id
              );
            }
            
            campaign.proofs = (rawProofs || []).map((proof: any) => ({
              id: proof.id,
              title: proof.title,
              description: proof.description,
              imageUrls: proof.imageUrls || [],
              createdAt: proof.createdAt,
              updatedAt: proof.updatedAt,
              campaignId: proof.campaignId,
            }));
          } catch (proofError: any) {
            // If proofs query fails, just set empty array
            console.warn(`Could not fetch proofs for campaign ${campaign.id}:`, proofError.message);
            campaign.proofs = [];
          }
        }
        
        console.log(`✓ Fetched ${campaigns.length} ended campaigns with manual proof fetching`);
      } else {
        throw prismaError;
      }
    }
    
    console.log(`✓ Returning ${campaigns.length} ended campaigns`);
    console.log("Sample campaign:", campaigns[0] ? { id: campaigns[0].id, title: campaigns[0].title, proofsCount: campaigns[0].proofs?.length || 0 } : "None");
    console.log("=== getEndedCampaigns completed ===");
    
    return res.json(campaigns);
  } catch (err: any) {
    console.error("✗ Error fetching ended campaigns:", err);
    console.error("Error details:", err.message, err.code);
    return res.status(500).json({ 
      error: "Failed to fetch ended campaigns",
      details: process.env.NODE_ENV === "development" ? err.message : undefined
    });
  }
};

// Mark campaign as implemented
export const markAsImplemented = async (req: any, res: Response) => {
  try {
    const { id } = req.params;

    const campaign = await prisma.campaign.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!campaign) return res.status(404).json({ error: "Campaign not found" });

    if (!campaign.isEnded) {
      return res.status(400).json({ error: "Campaign must be ended before marking as implemented" });
    }

    // Only campaign creator or admin can mark as implemented
    if (campaign.userId !== req.user.id && req.user.role !== "ADMIN") {
      return res.status(403).json({ error: "Forbidden: Only campaign creator or admin can mark as implemented" });
    }

    const updatedCampaign = await prisma.campaign.update({
      where: { id },
      data: { isImplemented: true },
      include: { user: { select: { id: true, email: true, fullName: true } } },
    });

    return res.json(updatedCampaign);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to mark campaign as implemented" });
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

    if (campaign.isEnded) {
      return res.status(400).json({ error: "Campaign is already ended" });
    }

    // Only campaign creator or admin can end campaign
    if (campaign.userId !== req.user.id && req.user.role !== "ADMIN") {
      return res.status(403).json({ error: "Forbidden: Only campaign creator or admin can end campaign" });
    }

    // Admin can only end campaigns when goal is met
    if (req.user.role === "ADMIN" && campaign.userId !== req.user.id && campaign.collected < campaign.goalAmount) {
      return res.status(400).json({ error: "Cannot end campaign: Goal amount not yet met" });
    }

    const updatedCampaign = await prisma.$transaction(async (tx) => {
      // Mark campaign as ended
      const ended = await tx.campaign.update({
        where: { id },
        data: { isEnded: true },
        include: { user: { select: { id: true, email: true, fullName: true } } },
      });

      // Add the campaign's collected funds to the creator's balances
      if (ended.collected > 0) {
        await tx.user.update({
          where: { id: ended.userId },
          data: {
            currentFunds: { increment: ended.collected },
            withdrawableFunds: { increment: ended.collected },
          },
        });
      }

      return ended;
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
