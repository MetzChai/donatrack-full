import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.routes";
import campaignsRoutes from "./routes/campaigns.routes";
import donationsRoutes from "./routes/donations.routes";
import adminRoutes from "./routes/admin.routes";
import fundsRoutes from "./routes/funds.routes";
import passport from "./config/passport";

dotenv.config();

const app = express();

app.use(cors());
app.use(cookieParser());
app.use(express.json());

app.use(passport.initialize());

app.use("/auth", authRoutes);
app.use("/campaigns", campaignsRoutes);
app.use("/donations", donationsRoutes);
app.use("/admin", adminRoutes);
app.use("/funds", fundsRoutes);

app.get("/", (_req, res) => res.json({ message: "Donatrack backend running" }));

export default app;
