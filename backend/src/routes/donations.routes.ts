import { Router } from "express";
import { donate, getDonationsByCampaign, getMyDonations, handleXenditWebhook, refreshDonationStatus } from "../controllers/donations.controller";
import { protect } from "../middleware/auth.middleware";

const router = Router();

// Allow regular users and creators to donate (admins are blocked in the UI)
router.post("/", protect(["USER", "CREATOR"]), donate);
router.get("/campaign/:id", getDonationsByCampaign);
router.get("/history", protect(["USER", "CREATOR"]), getMyDonations);
router.post("/xendit/webhook", handleXenditWebhook);
router.post("/refresh-status", protect(["ADMIN", "CREATOR", "USER"]), refreshDonationStatus);

export default router;
