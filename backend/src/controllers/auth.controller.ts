import { Request, Response } from "express";
import prisma from "../services/prisma.service";
import { hashPassword, comparePassword } from "../utils/hash";
import { signToken } from "../utils/jwt";
import { sendPasswordResetEmail } from "../utils/email";
import crypto from "crypto";

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

export const getCurrentUser = async (req: any, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json(user);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch user" });
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

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    
    // Don't reveal if user exists or not for security
    if (!user) {
      // Still return success to prevent email enumeration
      return res.json({ message: "If that email exists, a password reset link has been sent." });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Save token to database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpiry: resetTokenExpiry,
      },
    });

    // Send email
    try {
      await sendPasswordResetEmail(user.email, resetToken);
      return res.json({ message: "If that email exists, a password reset link has been sent." });
    } catch (emailError) {
      console.error("Error sending password reset email:", emailError);
      // Clear the token if email fails
      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetPasswordToken: null,
          resetPasswordExpiry: null,
        },
      });
      return res.status(500).json({ error: "Failed to send password reset email" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to process password reset request" });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ error: "Token and password are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    // Find user with valid token
    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpiry: {
          gt: new Date(), // Token not expired
        },
      },
    });

    if (!user) {
      return res.status(400).json({ error: "Invalid or expired reset token" });
    }

    // Hash new password
    const hashedPassword = await hashPassword(password);

    // Update password and clear reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpiry: null,
      },
    });

    return res.json({ message: "Password has been reset successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to reset password" });
  }
};