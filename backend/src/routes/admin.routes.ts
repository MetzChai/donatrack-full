import { Router } from "express";
import { getUsers, updateUserRole, deleteUser, getAdminStats } from "../controllers/admin.controller";
import { protect } from "../middleware/auth.middleware";

const router = Router();

router.get("/users", protect(["ADMIN"]), getUsers);
router.get("/stats", protect(["ADMIN"]), getAdminStats);
router.patch("/users/:id/role", protect(["ADMIN"]), updateUserRole);
router.delete("/users/:id", protect(["ADMIN"]), deleteUser);

export default router;
