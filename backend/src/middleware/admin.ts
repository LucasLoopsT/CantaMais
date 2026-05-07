import type { RequestHandler } from "express";
import { HttpError } from "../lib/http-error";

export const adminMiddleware: RequestHandler = (req, _res, next) => {
  const level = req.auth?.level;
  if (level !== "ADMIN") {
    return next(new HttpError(403, "Admin access required"));
  }
  next();
};
