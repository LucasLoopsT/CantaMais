import { Router } from "express";
import { adminMiddleware } from "../../middleware/admin";
import { authMiddleware } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { asyncHandler } from "../../utils/async-handler";
import { produtoExtrasController } from "./produto-extras.controller";
import { createVinculoBodySchema, vinculoParamsSchema } from "./produto-extras.schemas";

export const produtoExtrasRouter = Router();

produtoExtrasRouter.use(authMiddleware, adminMiddleware);

produtoExtrasRouter.get("/", asyncHandler(produtoExtrasController.list));
produtoExtrasRouter.post(
  "/",
  validate({ body: createVinculoBodySchema }),
  asyncHandler(produtoExtrasController.create)
);
produtoExtrasRouter.delete(
  "/:produtoId/:extraProdutoId",
  validate({ params: vinculoParamsSchema }),
  asyncHandler(produtoExtrasController.remove)
);
