import { Router } from "express";
import { getMyFunds, withdrawFunds, updateXenditKeys } from "../controllers/funds.controller";
import { protect } from "../middleware/auth.middleware";

const router = Router();

router.get("/", protect(["ADMIN"]), getMyFunds);
router.post("/withdraw", protect(["ADMIN"]), withdrawFunds);
router.put("/xendit-keys", protect(["ADMIN"]), updateXenditKeys);

export default router;


