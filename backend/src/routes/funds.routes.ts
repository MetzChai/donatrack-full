import { Router } from "express";
import { getMyFunds, withdrawFunds, updateXenditKeys, getMyWithdrawals, getAllWithdrawals, updateWithdrawalStatus } from "../controllers/funds.controller";
import { protect } from "../middleware/auth.middleware";

const router = Router();

router.get("/", protect(["ADMIN", "CREATOR"]), getMyFunds);
router.post("/withdraw", protect(["ADMIN", "CREATOR"]), withdrawFunds);
router.get("/withdrawals", protect(["ADMIN"]), getAllWithdrawals);
router.get("/withdrawals/my", protect(["USER", "CREATOR", "ADMIN"]), getMyWithdrawals);
router.patch("/withdrawals/:id/status", protect(["ADMIN"]), updateWithdrawalStatus);
router.put("/xendit-keys", protect(["ADMIN"]), updateXenditKeys);

export default router;


