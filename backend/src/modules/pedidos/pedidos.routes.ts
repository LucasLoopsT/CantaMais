import { Router } from "express";
import { authMiddleware } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { asyncHandler } from "../../utils/async-handler";
import { pedidosController } from "./pedidos.controller";
import {
  createPedidoBodySchema,
  createPedidoItemBodySchema,
  idParamSchema,
  pedidoIdParamSchema,
  pedidoItemParamsSchema,
  updatePedidoBodySchema,
  updatePedidoItemBodySchema,
} from "./pedidos.schemas";

export const pedidosRouter = Router();
pedidosRouter.post(
  "/",
  validate({ body: createPedidoBodySchema }),
  asyncHandler(pedidosController.create),
);
pedidosRouter.post(
  "/:pedidoId/items",
  validate({ params: pedidoIdParamSchema, body: createPedidoItemBodySchema }),
  asyncHandler(pedidosController.createItem),
);

pedidosRouter.use(authMiddleware);

pedidosRouter.get("/", asyncHandler(pedidosController.list));

pedidosRouter.get(
  "/:pedidoId/items",
  validate({ params: pedidoIdParamSchema }),
  asyncHandler(pedidosController.listItems),
);
pedidosRouter.get(
  "/:pedidoId/items/:itemId",
  validate({ params: pedidoItemParamsSchema }),
  asyncHandler(pedidosController.getItem),
);
pedidosRouter.patch(
  "/:pedidoId/items/:itemId",
  validate({
    params: pedidoItemParamsSchema,
    body: updatePedidoItemBodySchema,
  }),
  asyncHandler(pedidosController.updateItem),
);
pedidosRouter.delete(
  "/:pedidoId/items/:itemId",
  validate({ params: pedidoItemParamsSchema }),
  asyncHandler(pedidosController.removeItem),
);
pedidosRouter.delete("/limpar", asyncHandler(pedidosController.limparFila));

pedidosRouter.get(
  "/:id",
  validate({ params: idParamSchema }),
  asyncHandler(pedidosController.getById),
);
pedidosRouter.patch(
  "/:id",
  validate({ params: idParamSchema, body: updatePedidoBodySchema }),
  asyncHandler(pedidosController.update),
);
pedidosRouter.delete(
  "/:id",
  validate({ params: idParamSchema }),
  asyncHandler(pedidosController.remove),
);
