import { Router } from "express";
import { adminMiddleware } from "../../middleware/admin";
import { authMiddleware } from "../../middleware/auth";
import { recepcaoOuAdminMiddleware } from "../../middleware/recepcao-ou-admin";
import { validate } from "../../middleware/validate";
import { asyncHandler } from "../../utils/async-handler";
import { mesasController } from "./mesas.controller";
import {
  createMesaBodySchema,
  idParamSchema,
  updateMesaBodySchema,
} from "./mesas.schemas";

export const mesasRouter = Router();

mesasRouter.use(authMiddleware);
mesasRouter.post(
  "/",
  adminMiddleware,
  validate({ body: createMesaBodySchema }),
  asyncHandler(mesasController.create),
);

mesasRouter.get("/", asyncHandler(mesasController.list));
mesasRouter.get(
  "/:id",
  validate({ params: idParamSchema }),
  asyncHandler(mesasController.getById),
);
mesasRouter.patch(
  "/:id",
  recepcaoOuAdminMiddleware,
  validate({ params: idParamSchema, body: updateMesaBodySchema }),
  asyncHandler(mesasController.update),
);
mesasRouter.delete(
  "/:id",
  adminMiddleware,
  validate({ params: idParamSchema }),
  asyncHandler(mesasController.remove),
);
