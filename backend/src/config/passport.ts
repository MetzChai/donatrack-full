import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import crypto from "crypto";

import prisma from "../services/prisma.service";
import { hashPassword } from "../utils/hash";

const clientID = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
const callbackURL = process.env.GOOGLE_CALLBACK_URL || "http://localhost:4000/auth/google/callback";

if (!clientID || !clientSecret) {
  console.warn("Google OAuth is not fully configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to enable it.");
} else {
  passport.use(
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
}

export default passport;

