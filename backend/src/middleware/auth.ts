import type { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { HttpError } from "../lib/http-error";

export const authMiddleware: RequestHandler = (req, _res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      throw new HttpError(401, "Missing or invalid Authorization header");
    }
    const token = header.slice(7);
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new HttpError(500, "JWT_SECRET is not set");
    const decoded = jwt.verify(token, secret);
    if (typeof decoded !== "object" || decoded === null || !("sub" in decoded)) {
      throw new HttpError(401, "Invalid token payload");
    }
    const rawSub = (decoded as { sub?: unknown }).sub;
    const sub =
      typeof rawSub === "number"
        ? rawSub
        : typeof rawSub === "string"
          ? Number.parseInt(rawSub, 10)
          : NaN;
    if (!Number.isFinite(sub)) {
      throw new HttpError(401, "Invalid token payload");
    }
    const email = (decoded as { email?: unknown }).email;
    const level = (decoded as { level?: unknown }).level;
    req.auth = {
      sub,
      email: typeof email === "string" ? email : undefined,
      level: typeof level === "string" ? level : undefined,
    };
    next();
  } catch (e) {
    if (e instanceof HttpError) return next(e);
    next(new HttpError(401, "Invalid or expired token"));
  }
};
