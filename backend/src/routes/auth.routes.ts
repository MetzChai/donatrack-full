import { Router } from "express";
import passport from "../config/passport";
import { register, login, googleAuthRedirect, getCurrentUser, forgotPassword, resetPassword } from "../controllers/auth.controller";
import { protect } from "../middleware/auth.middleware";

const router = Router();
const failureRedirect = `${process.env.FRONTEND_URL || "http://localhost:3000"}/auth/login?error=google`;

router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/me", protect(), getCurrentUser);

// Test route to verify auth routes are working
router.get("/test", (_req, res) => {
  res.json({ message: "Auth routes are working", path: "/api/auth/v1/test" });
});

// Google OAuth routes
router.get(
  "/google",
  (req, res, next) => {
    console.log("Google OAuth route hit:", req.url);
    next();
  },
  passport.authenticate("google", { scope: ["profile", "email"], session: false })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect }),
  googleAuthRedirect
);

export default router;
