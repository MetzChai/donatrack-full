import { Router } from "express";
import { getMyFunds, withdrawFunds, updateXenditKeys, getMyWithdrawals, getAllWithdrawals, updateWithdrawalStatus } from "../controllers/funds.controller";
import { protect } from "../middleware/auth.middleware";

const router = Router();

router.get("/", protect(["ADMIN", "CREATOR"]), getMyFunds);
// Only admins can perform withdrawals
router.post("/withdraw", protect(["ADMIN"]), withdrawFunds);

// Withdrawal history visible to all authenticated roles
router.get("/withdrawals", protect(["USER", "CREATOR", "ADMIN"]), getAllWithdrawals);
router.get("/withdrawals/my", protect(["USER", "CREATOR", "ADMIN"]), getMyWithdrawals);
router.patch("/withdrawals/:id/status", protect(["ADMIN"]), updateWithdrawalStatus);
router.put("/xendit-keys", protect(["ADMIN"]), updateXenditKeys);

export default router;


