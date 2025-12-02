import { Router } from "express";
import { donate, getDonationsByCampaign, getMyDonations } from "../controllers/donations.controller";
import { protect } from "../middleware/auth.middleware";

const router = Router();

router.post("/", protect(["USER", "ADMIN"]), donate);
router.get("/campaign/:id", getDonationsByCampaign);
router.get("/history", protect(["USER", "ADMIN"]), getMyDonations);

export default router;
