import { Router } from "express";
import { adminMiddleware } from "../../middleware/admin";
import { authMiddleware } from "../../middleware/auth";
import { recepcaoOuAdminMiddleware } from "../../middleware/recepcao-ou-admin";
import { validate } from "../../middleware/validate";
import { asyncHandler } from "../../utils/async-handler";
import { comandasController } from "./comandas.controller";
import {
  createComandaBodySchema,
  idParamSchema,
  numeroParamSchema,
  updateComandaBodySchema,
} from "./comandas.schemas";

export const comandasRouter = Router();

comandasRouter.use(authMiddleware);

comandasRouter.get(
  "/",
  recepcaoOuAdminMiddleware,
  asyncHandler(comandasController.list),
);

comandasRouter.get(
  "/numero/:numero/consumo",
  recepcaoOuAdminMiddleware,
  validate({ params: numeroParamSchema }),
  asyncHandler(comandasController.getConsumoPorNumero),
);
comandasRouter.post(
  "/numero/:numero/encerrar-pagamento",
  recepcaoOuAdminMiddleware,
  validate({ params: numeroParamSchema }),
  asyncHandler(comandasController.encerrarPagamento),
);
comandasRouter.get(
  "/:id/consumo",
  recepcaoOuAdminMiddleware,
  validate({ params: idParamSchema }),
  asyncHandler(comandasController.getConsumo),
);
comandasRouter.get(
  "/:id",
  recepcaoOuAdminMiddleware,
  validate({ params: idParamSchema }),
  asyncHandler(comandasController.getById),
);
comandasRouter.post(
  "/",
  recepcaoOuAdminMiddleware,
  validate({ body: createComandaBodySchema }),
  asyncHandler(comandasController.create),
);
comandasRouter.patch(
  "/:id",
  recepcaoOuAdminMiddleware,
  validate({ params: idParamSchema, body: updateComandaBodySchema }),
  asyncHandler(comandasController.update),
);
comandasRouter.delete(
  "/:id",
  adminMiddleware,
  validate({ params: idParamSchema }),
  asyncHandler(comandasController.remove),
);
