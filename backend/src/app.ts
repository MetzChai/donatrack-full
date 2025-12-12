import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.routes";
import campaignsRoutes from "./routes/campaigns.routes";
import donationsRoutes from "./routes/donations.routes";
import adminRoutes from "./routes/admin.routes";
import fundsRoutes from "./routes/funds.routes";
import proofRoutes from "./routes/proof.routes";
import passport from "./config/passport";
import { FRONTEND_URL } from "./config";

dotenv.config();

const app = express();

// Configure CORS with proper origin handling
const allowedOrigins = [
  FRONTEND_URL,
  'http://localhost:3000',
  'http://localhost:3001',
  // Allow Vercel preview deployments (wildcard pattern)
  ...(process.env.VERCEL_URL ? [`https://${process.env.VERCEL_URL}`] : []),
  // Allow any Vercel deployment if FRONTEND_URL contains vercel.app
  ...(FRONTEND_URL.includes('vercel.app') ? [FRONTEND_URL] : []),
].filter(Boolean); // Remove any undefined values

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // Check if origin matches exactly
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // Check if origin is a Vercel deployment (handles preview deployments)
    // Vercel URLs: https://project-name.vercel.app or https://project-name-git-branch.vercel.app
    const isVercelOrigin = origin.includes('.vercel.app') || origin.includes('.vercel-demo.com');
    if (isVercelOrigin) {
      // Extract base domain to allow all Vercel previews of the same project
      const vercelBaseMatch = origin.match(/https:\/\/([^.]+)\.vercel\.app/);
      if (vercelBaseMatch) {
        console.log(`✅ CORS: Allowing Vercel origin ${origin}`);
        return callback(null, true);
      }
    }
    
    // In development, be more permissive
    if (process.env.NODE_ENV === 'development') {
      console.warn(`⚠️  CORS: Allowing origin ${origin} in development`);
      return callback(null, true);
    }
    
    // Production: strict check
    console.warn(`❌ CORS: Blocked origin ${origin}. Allowed origins:`, allowedOrigins);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true, // Allow cookies/auth headers
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(cookieParser());
app.use(express.json());

app.use(passport.initialize());

// Test route to verify server is running
app.get("/api/test", (_req, res) => {
  res.json({ message: "API routes are working", timestamp: new Date().toISOString() });
});

// API routes with version prefix
app.use("/api/auth/v1", authRoutes);
app.use("/campaigns", campaignsRoutes);
app.use("/donations", donationsRoutes);
app.use("/admin", adminRoutes);
app.use("/funds", fundsRoutes);
app.use("/proofs", proofRoutes);

// Legacy auth routes (for backward compatibility)
app.use("/auth", authRoutes);

app.get("/", (_req, res) => res.json({ message: "Donatrack backend running" }));

export default app;
