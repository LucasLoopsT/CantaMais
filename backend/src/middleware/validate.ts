import type { RequestHandler } from "express";
import type { z } from "zod";

type Schemas = {
  body?: z.ZodTypeAny;
  params?: z.ZodTypeAny;
  query?: z.ZodTypeAny;
};

export function validate(schemas: Schemas): RequestHandler {
  return (req, _res, next) => {
    try {
      if (schemas.body) req.validatedBody = schemas.body.parse(req.body);
      if (schemas.params) req.validatedParams = schemas.params.parse(req.params);
      if (schemas.query) req.validatedQuery = schemas.query.parse(req.query);
      next();
    } catch (e) {
      next(e);
    }
  };
}
