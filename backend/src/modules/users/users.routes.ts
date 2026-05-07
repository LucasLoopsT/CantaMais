import { Router } from "express";
import { adminMiddleware } from "../../middleware/admin";
import { authMiddleware } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { asyncHandler } from "../../utils/async-handler";
import { usersController } from "./users.controller";
import {
  createUserBodySchema,
  idParamSchema,
  loginBodySchema,
  updateUserBodySchema,
} from "./users.schemas";

export const usersRouter = Router();

usersRouter.post(
  "/login",
  validate({ body: loginBodySchema }),
  asyncHandler(usersController.login)
);
usersRouter.use(authMiddleware);
usersRouter.use(adminMiddleware);

usersRouter.post(
  "/",
  validate({ body: createUserBodySchema }),
  asyncHandler(usersController.create)
);

usersRouter.get("/", asyncHandler(usersController.list));
usersRouter.get(
  "/:id",
  validate({ params: idParamSchema }),
  asyncHandler(usersController.getById)
);
usersRouter.patch(
  "/:id",
  validate({ params: idParamSchema, body: updateUserBodySchema }),
  asyncHandler(usersController.update)
);
usersRouter.delete(
  "/:id",
  validate({ params: idParamSchema }),
  asyncHandler(usersController.remove)
);
