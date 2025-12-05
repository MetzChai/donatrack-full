import { Request, Response } from "express";
import prisma from "../services/prisma.service";

// Test function to verify Proof model is accessible
const testProofModel = async () => {
  try {
    const count = await prisma.proof.count();
    console.log("Proof model is accessible. Current count:", count);
    return { accessible: true, count };
  } catch (err: any) {
    console.error("Proof model test failed:", err);
    console.error("Error code:", err.code);
    console.error("Error message:", err.message);
    return { accessible: false, error: err.message, code: err.code };
  }
};

// Get all proofs (public)
export const getAllProofs = async (_req: Request, res: Response) => {
  try {
    const proofs = await prisma.proof.findMany({
      include: {
        campaign: {
          select: {
            id: true,
            title: true,
            description: true,
            imageUrl: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return res.json(proofs);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch proofs" });
  }
};

// Get proofs by campaign
export const getProofsByCampaign = async (req: Request, res: Response) => {
  try {
    const { campaignId } = req.params;
    const proofs = await prisma.proof.findMany({
      where: { campaignId },
      include: {
        campaign: {
          select: {
            id: true,
            title: true,
            description: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return res.json(proofs);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch proofs" });
  }
};

// Create proof (Admin only)
export const createProof = async (req: any, res: Response) => {
  try {
    // Test if Proof model is accessible
    const modelTest = await testProofModel();
    if (!modelTest.accessible) {
      return res.status(500).json({ 
        error: "Proof model is not accessible. Database may not be properly configured.",
        details: modelTest.error,
        code: modelTest.code,
        hint: "Run 'npx prisma migrate deploy' or 'npx prisma db push' to ensure the Proof table exists."
      });
    }

    console.log("Create proof request received:", req.body);
    console.log("User making request:", req.user);
    
    const { title, description, imageUrl, campaignId } = req.body;
    
    // Validate all required fields
    if (!title || !description || !imageUrl || !campaignId) {
      console.log("Validation failed - missing fields:", { title: !!title, description: !!description, imageUrl: !!imageUrl, campaignId: !!campaignId });
      return res.status(400).json({ 
        error: "Missing required fields",
        missing: {
          title: !title,
          description: !description,
          imageUrl: !imageUrl,
          campaignId: !campaignId
        }
      });
    }

    // Verify campaign exists
    console.log("Checking campaign exists:", campaignId);
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
    });
    if (!campaign) {
      console.log("Campaign not found:", campaignId);
      return res.status(404).json({ error: "Campaign not found" });
    }
    console.log("Campaign found:", campaign.title);

    // Create proof
    console.log("Creating proof with data:", { title, description, imageUrl, campaignId });
    const proof = await prisma.proof.create({
      data: {
        title,
        description,
        imageUrl,
        campaignId,
      },
      include: {
        campaign: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    console.log("Proof created successfully:", proof.id);
    return res.status(201).json(proof);
  } catch (err: any) {
    console.error("Error creating proof - Full error:", err);
    console.error("Error code:", err.code);
    console.error("Error meta:", err.meta);
    
    // Handle specific Prisma errors
    if (err.code === 'P2003') {
      return res.status(400).json({ 
        error: "Invalid campaign ID. Campaign does not exist.",
        details: err.meta
      });
    }
    
    if (err.code === 'P2025') {
      return res.status(404).json({ 
        error: "Record not found",
        details: err.meta
      });
    }

    // Return more detailed error message
    const errorMessage = err.message || "Failed to create proof";
    return res.status(500).json({ 
      error: errorMessage,
      code: err.code,
      details: process.env.NODE_ENV === "development" ? err.stack : undefined,
      meta: err.meta
    });
  }
};

// Update proof (Admin only)
export const updateProof = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, imageUrl, campaignId } = req.body;

    const proof = await prisma.proof.findUnique({ where: { id } });
    if (!proof) {
      return res.status(404).json({ error: "Proof not found" });
    }

    const updateData: any = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (imageUrl) updateData.imageUrl = imageUrl;
    if (campaignId) {
      // Verify campaign exists
      const campaign = await prisma.campaign.findUnique({
        where: { id: campaignId },
      });
      if (!campaign) {
        return res.status(404).json({ error: "Campaign not found" });
      }
      updateData.campaignId = campaignId;
    }

    const updated = await prisma.proof.update({
      where: { id },
      data: updateData,
      include: {
        campaign: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    return res.json(updated);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to update proof" });
  }
};

// Delete proof (Admin only)
export const deleteProof = async (req: any, res: Response) => {
  try {
    const { id } = req.params;

    const proof = await prisma.proof.findUnique({ where: { id } });
    if (!proof) {
      return res.status(404).json({ error: "Proof not found" });
    }

    await prisma.proof.delete({ where: { id } });

    return res.json({ message: "Proof deleted successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to delete proof" });
  }
};

