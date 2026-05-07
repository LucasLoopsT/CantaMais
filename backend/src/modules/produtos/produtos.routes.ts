import { Router } from "express";
import { adminMiddleware } from "../../middleware/admin";
import { authMiddleware } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { asyncHandler } from "../../utils/async-handler";
import { produtosController } from "./produtos.controller";
import {
  addExtraBodySchema,
  createProdutoBodySchema,
  extraIdParamSchema,
  idParamSchema,
  updateProdutoBodySchema,
} from "./produtos.schemas";

export const produtosRouter = Router();

produtosRouter.get("/", asyncHandler(produtosController.list));
produtosRouter.get(
  "/:id",
  validate({ params: idParamSchema }),
  asyncHandler(produtosController.getById)
);

produtosRouter.use(authMiddleware, adminMiddleware);

produtosRouter.post(
  "/",
  validate({ body: createProdutoBodySchema }),
  asyncHandler(produtosController.create)
);
produtosRouter.patch(
  "/:id",
  validate({ params: idParamSchema, body: updateProdutoBodySchema }),
  asyncHandler(produtosController.update)
);
produtosRouter.delete(
  "/:id",
  validate({ params: idParamSchema }),
  asyncHandler(produtosController.remove)
);
produtosRouter.post(
  "/:id/extras",
  validate({ params: idParamSchema, body: addExtraBodySchema }),
  asyncHandler(produtosController.addExtra)
);
produtosRouter.delete(
  "/:id/extras/:extraProdutoId",
  validate({ params: extraIdParamSchema }),
  asyncHandler(produtosController.removeExtra)
);
