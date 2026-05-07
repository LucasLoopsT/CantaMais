import type { Request, Response } from "express";
import { z } from "zod";
import {
  createMesaBodySchema,
  idParamSchema,
  updateMesaBodySchema,
} from "./mesas.schemas";
import { mesasService } from "./mesas.service";

type CreateBody = z.infer<typeof createMesaBodySchema>;
type UpdateBody = z.infer<typeof updateMesaBodySchema>;
type IdParam = z.infer<typeof idParamSchema>;

export const mesasController = {
  async create(req: Request, res: Response) {
    const body = req.validatedBody as CreateBody;
    res.status(201).json(await mesasService.create(body));
  },

  async list(_req: Request, res: Response) {
    res.json(await mesasService.list());
  },

  async getById(req: Request, res: Response) {
    const { id } = req.validatedParams as IdParam;
    res.json(await mesasService.getById(id));
  },

  async update(req: Request, res: Response) {
    const { id } = req.validatedParams as IdParam;
    const body = req.validatedBody as UpdateBody;
    res.json(await mesasService.update(id, body));
  },

  async remove(req: Request, res: Response) {
    const { id } = req.validatedParams as IdParam;
    await mesasService.remove(id);
    res.status(204).send();
  },
};
