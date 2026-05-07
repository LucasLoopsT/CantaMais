import type { Request, Response } from "express";
import { z } from "zod";
import {
  createUserBodySchema,
  idParamSchema,
  loginBodySchema,
  updateUserBodySchema,
} from "./users.schemas";
import { authService } from "../auth/auth.service";
import { usersService } from "./users.service";

type LoginBody = z.infer<typeof loginBodySchema>;
type CreateUserBody = z.infer<typeof createUserBodySchema>;
type UpdateUserBody = z.infer<typeof updateUserBodySchema>;
type IdParam = z.infer<typeof idParamSchema>;

export const usersController = {
  async login(req: Request, res: Response) {
    const body = req.validatedBody as LoginBody;
    const result = await authService.login(body.email, body.password);
    res.json(result);
  },

  async list(_req: Request, res: Response) {
    const rows = await usersService.list();
    res.json(rows);
  },

  async getById(req: Request, res: Response) {
    const { id } = req.validatedParams as IdParam;
    const row = await usersService.getById(id);
    res.json(row);
  },

  async create(req: Request, res: Response) {
    const body = req.validatedBody as CreateUserBody;
    const row = await authService.register(body);
    res.status(201).json(row);
  },

  async update(req: Request, res: Response) {
    const { id } = req.validatedParams as IdParam;
    const body = req.validatedBody as UpdateUserBody;
    const row = await usersService.update(id, body);
    res.json(row);
  },

  async remove(req: Request, res: Response) {
    const { id } = req.validatedParams as IdParam;
    await usersService.remove(id);
    res.status(204).send();
  },
};
