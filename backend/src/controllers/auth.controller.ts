import { Request, Response } from "express";
import prisma from "../services/prisma.service";
import { hashPassword, comparePassword } from "../utils/hash";
import { signToken } from "../utils/jwt";

export const register = async (req: Request, res: Response) => {
  try {
    const { fullName, email, password } = req.body;
    if (!fullName || !email || !password) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ error: "Email already exists" });

    const hashed = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        fullName,
        email,
        password: hashed,
        role: "USER",
      },
    });

    const token = signToken({ id: user.id, role: user.role });
    return res.status(201).json({
      user: { id: user.id, fullName: user.fullName, email: user.email, role: user.role },
      token,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Registration failed" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Missing credentials" });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ error: "Invalid credentials" });

    const valid = await comparePassword(password, user.password);
    if (!valid) return res.status(400).json({ error: "Invalid credentials" });

    const token = signToken({ id: user.id, role: user.role });
    return res.json({
      user: { id: user.id, fullName: user.fullName, email: user.email, role: user.role },
      token,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Login failed" });
  }
};

export const googleAuthRedirect = async (req: any, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(400).json({ error: "Google authentication failed" });
    }

    const token = signToken({ id: user.id, role: user.role });
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

    const userPayload = Buffer.from(
      JSON.stringify({
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      })
    ).toString("base64");

    const redirectUrl = new URL("/auth/login", frontendUrl);
    redirectUrl.searchParams.set("token", token);
    redirectUrl.searchParams.set("user", userPayload);

    return res.redirect(redirectUrl.toString());
  } catch (err) {
    console.error(err);
    return res.redirect(
      `${process.env.FRONTEND_URL || "http://localhost:3000"}/auth/login?error=google`
    );
  }
};