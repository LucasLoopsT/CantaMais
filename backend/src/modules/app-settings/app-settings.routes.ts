import { Router } from "express";
import { adminMiddleware } from "../../middleware/admin";
import { authMiddleware } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { asyncHandler } from "../../utils/async-handler";
import { appSettingsController } from "./app-settings.controller";
import { updateAppSettingsBodySchema } from "./app-settings.schemas";

export const appSettingsRouter = Router();

appSettingsRouter.use(authMiddleware, adminMiddleware);

appSettingsRouter.get("/", asyncHandler(appSettingsController.get));
appSettingsRouter.patch(
  "/",
  validate({ body: updateAppSettingsBodySchema }),
  asyncHandler(appSettingsController.update)
);
