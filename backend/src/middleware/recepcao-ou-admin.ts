import type { RequestHandler } from "express";
import { HttpError } from "../lib/http-error";

/** Recepção ou admin: operações de mesa/comanda no salão. */
export const recepcaoOuAdminMiddleware: RequestHandler = (req, _res, next) => {
  const level = req.auth?.level;
  if (level !== "ADMIN" && level !== "RECEPCAO") {
    return next(new HttpError(403, "Recepção ou administrador necessário"));
  }
  next();
};
