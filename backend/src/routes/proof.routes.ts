import { Router } from "express";
import {
  getAllProofs,
  getProofsByCampaign,
  createProof,
  updateProof,
  deleteProof,
} from "../controllers/proof.controller";
import { protect } from "../middleware/auth.middleware";

const router = Router();

// Test endpoint to verify Proof model
router.get("/test", async (_req, res) => {
  try {
    const prisma = (await import("../services/prisma.service")).default;
    const count = await prisma.proof.count();
    res.json({ 
      success: true, 
      message: "Proof model is accessible",
      count,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    console.error("Proof test endpoint error:", err);
    res.status(500).json({ 
      success: false, 
      error: err.message,
      code: err.code,
      meta: err.meta,
      hint: "Run 'npx prisma migrate deploy' or 'npx prisma db push'"
    });
  }
});

// Public routes
router.get("/", getAllProofs);
router.get("/campaign/:campaignId", getProofsByCampaign);

// Diagnostic endpoint
router.get("/debug", async (_req, res) => {
  try {
    const prisma = (await import("../services/prisma.service")).default;
    const count = await prisma.proof.count();
    const sample = await prisma.proof.findFirst();
    
    res.json({
      success: true,
      count,
      hasProofs: count > 0,
      sample: sample || null,
      message: count > 0 
        ? `Found ${count} proof(s) in database` 
        : "No proofs found in database. Create a proof from the admin dashboard first.",
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err.message,
      code: err.code,
    });
  }
});

// Admin-only routes
router.post("/", protect(["ADMIN"]), createProof);
router.put("/:id", protect(["ADMIN"]), updateProof);
router.delete("/:id", protect(["ADMIN"]), deleteProof);

export default router;

