import { Router } from "express";
import {
  getCampaigns,
  getCampaignById,
  createCampaign,
  endCampaign,
  getMyCampaigns,
  updateCampaign,
  getEndedCampaigns,
  markAsImplemented,
} from "../controllers/campaigns.controller";
import { protect } from "../middleware/auth.middleware";

const router = Router();

router.get("/", getCampaigns);
router.get("/ended", getEndedCampaigns); // Public endpoint for ended campaigns
router.get("/my", protect(["ADMIN", "CREATOR"]), getMyCampaigns);
router.get("/:id", getCampaignById);
router.post("/", protect(["ADMIN", "CREATOR"]), createCampaign);
router.put("/:id", protect(["ADMIN", "CREATOR"]), updateCampaign);
router.patch("/:id/end", protect(["ADMIN", "CREATOR"]), endCampaign);
router.patch("/:id/implemented", protect(["ADMIN", "CREATOR"]), markAsImplemented);

export default router;
