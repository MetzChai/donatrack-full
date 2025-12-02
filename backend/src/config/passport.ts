import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import crypto from "crypto";

import prisma from "../services/prisma.service";
import { hashPassword } from "../utils/hash";

// Google OAuth Configuration
const clientID = process.env.GOOGLE_CLIENT_ID || "1019521833556-ramdciom66hg6gtg3pahh4g1g0idgn74.apps.googleusercontent.com";
const clientSecret = process.env.GOOGLE_CLIENT_SECRET || "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";
const callbackURL = process.env.GOOGLE_CALLBACK_URL || "http://localhost:4000/api/auth/v1/google/callback";

console.log("Google OAuth configured with credentials");
console.log("Callback URL:", callbackURL);

passport.use(
  "google",
  new GoogleStrategy(
    {
      clientID,
      clientSecret,
      callbackURL,
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) {
          return done(new Error("Google account does not have a public email address"));
        }

        let user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
          const randomPassword = crypto.randomBytes(16).toString("hex");
          const hashed = await hashPassword(randomPassword);

          user = await prisma.user.create({
            data: {
              fullName: profile.displayName || "Google User",
              email,
              password: hashed,
              role: "USER",
            },
          });
        }

        return done(null, user);
      } catch (error) {
        return done(error as Error);
      }
    }
  )
);

export default passport;

