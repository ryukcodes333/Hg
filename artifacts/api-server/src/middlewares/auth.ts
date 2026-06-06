import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  user?: { phone: string; name: string };
}

export function requireAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback-secret") as {
      phone: string;
      name: string;
    };
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}

export function optionalAuth(
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): void {
  const token = req.headers.authorization?.split(" ")[1];
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback-secret") as {
        phone: string;
        name: string;
      };
      req.user = decoded;
    } catch {
      // ignore invalid tokens for optional auth
    }
  }
  next();
}
