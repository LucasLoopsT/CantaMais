import { Router } from "express";
import { adminMiddleware } from "../../middleware/admin";
import { authMiddleware } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { asyncHandler } from "../../utils/async-handler";
import { karaokeController } from "./karaoke.controller";
import {
  createKaraokePedidoBodySchema,
  createSalaKaraokeBodySchema,
  getSalaBodySchema,
  idParamSchema,
  updateKaraokePedidoBodySchema,
  updateSalaKaraokeBodySchema,
} from "./karaoke.schemas";

export const karaokeRouter = Router();

karaokeRouter.get("/salas", asyncHandler(karaokeController.listSalas));
karaokeRouter.get(
  "/salas/:id",
  validate({ params: idParamSchema }),
  asyncHandler(karaokeController.getSalaById),
);

karaokeRouter.get("/pedidos", asyncHandler(karaokeController.listPedidos));
karaokeRouter.delete(
  "/pedidos/limparSala/:id",
  validate({ params: idParamSchema }),
  asyncHandler(karaokeController.limparFila),
);

karaokeRouter.post(
  "/salaByMesaComanda",
  validate({ body: getSalaBodySchema }),
  asyncHandler(karaokeController.getSalaByMesaAndComanda),
);

karaokeRouter.post(
  "/pedidos",
  validate({ body: createKaraokePedidoBodySchema }),
  asyncHandler(karaokeController.createPedido),
);

karaokeRouter.get(
  "/pedidos/:id",
  validate({ params: idParamSchema }),
  asyncHandler(karaokeController.getPedidoById),
);

karaokeRouter.patch(
  "/pedidos/:id/cliente",
  validate({ params: idParamSchema }),
  asyncHandler(karaokeController.updatePedidoCliente),
);

karaokeRouter.use(authMiddleware);

karaokeRouter.post(
  "/salas",
  adminMiddleware,
  validate({ body: createSalaKaraokeBodySchema }),
  asyncHandler(karaokeController.createSala),
);
karaokeRouter.patch(
  "/salas/:id",
  adminMiddleware,
  validate({ params: idParamSchema, body: updateSalaKaraokeBodySchema }),
  asyncHandler(karaokeController.updateSala),
);
karaokeRouter.delete(
  "/salas/:id",
  adminMiddleware,
  validate({ params: idParamSchema }),
  asyncHandler(karaokeController.removeSala),
);
karaokeRouter.patch(
  "/pedidos/:id",
  validate({ params: idParamSchema, body: updateKaraokePedidoBodySchema }),
  asyncHandler(karaokeController.updatePedido),
);
karaokeRouter.delete(
  "/pedidos/:id",
  validate({ params: idParamSchema }),
  asyncHandler(karaokeController.removePedido),
);
karaokeRouter.delete(
  "/karaoke/pedidos/limparSala/:id",
  validate({ params: idParamSchema }),
  asyncHandler(karaokeController.limparFila),
);
