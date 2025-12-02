import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";
import prisma from "../services/prisma.service";

export const protect = (roles: ("USER" | "CREATOR" | "ADMIN")[] = []) => {
  return async (req: any, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const token = authHeader.split(" ")[1];
      const decoded: any = verifyToken(token);

      const user = await prisma.user.findUnique({ where: { id: decoded.id } });
      if (!user) return res.status(401).json({ error: "Unauthorized" });

      req.user = { id: user.id, role: user.role };

      if (roles.length && !roles.includes(user.role as "USER" | "CREATOR" | "ADMIN")) {
        return res.status(403).json({ error: "Forbidden" });
      }

      next();
    } catch (err) {
      console.error(err);
      return res.status(401).json({ error: "Invalid token" });
    }
  };
};
