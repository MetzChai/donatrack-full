import { Router } from "express";
import passport from "../config/passport";
import { register, login, googleAuthRedirect } from "../controllers/auth.controller";

const router = Router();
const googleConfigured = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
const failureRedirect = `${process.env.FRONTEND_URL || "http://localhost:3000"}/auth/login?error=google`;

router.post("/register", register);
router.post("/login", login);

if (googleConfigured) {
  router.get(
    "/google",
    passport.authenticate("google", { scope: ["profile", "email"], session: false })
  );

  router.get(
    "/google/callback",
    passport.authenticate("google", { session: false, failureRedirect }),
    googleAuthRedirect
  );
} else {
  router.get("/google", (_req, res) => {
    res.status(503).json({ error: "Google OAuth is not configured" });
  });
  router.get("/google/callback", (_req, res) => {
    res.redirect(failureRedirect);
  });
}

export default router;
