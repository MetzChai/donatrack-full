import { Router } from "express";
import {
  getCampaigns,
  getCampaignById,
  createCampaign,
  endCampaign,
  getMyCampaigns,
  updateCampaign,
} from "../controllers/campaigns.controller";
import { protect } from "../middleware/auth.middleware";

const router = Router();

router.get("/", getCampaigns);
router.get("/my", protect(["ADMIN"]), getMyCampaigns);
router.get("/:id", getCampaignById);
router.post("/", protect(["ADMIN"]), createCampaign);
router.put("/:id", protect(["ADMIN"]), updateCampaign);
router.patch("/:id/end", protect(["ADMIN"]), endCampaign);

export default router;
