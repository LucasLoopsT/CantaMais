import type { Request, Response } from "express";
import { z } from "zod";
import {
  createComandaBodySchema,
  idParamSchema,
  numeroParamSchema,
  updateComandaBodySchema,
} from "./comandas.schemas";
import { comandasService } from "./comandas.service";

type CreateBody = z.infer<typeof createComandaBodySchema>;
type UpdateBody = z.infer<typeof updateComandaBodySchema>;
type IdParam = z.infer<typeof idParamSchema>;
type NumeroParam = z.infer<typeof numeroParamSchema>;

export const comandasController = {
  async list(_req: Request, res: Response) {
    res.json(await comandasService.list());
  },

  async getById(req: Request, res: Response) {
    const { id } = req.validatedParams as IdParam;
    res.json(await comandasService.getById(id));
  },

  async getConsumo(req: Request, res: Response) {
    const { id } = req.validatedParams as IdParam;
    res.json(await comandasService.getResumoConsumo(id));
  },

  async getConsumoPorNumero(req: Request, res: Response) {
    const { numero } = req.validatedParams as NumeroParam;
    const id = await comandasService.resolveIdByNumero(numero);
    res.json(await comandasService.getResumoConsumo(id));
  },

  async encerrarPagamento(req: Request, res: Response) {
    const { numero } = req.validatedParams as NumeroParam;
    const id = await comandasService.resolveIdByNumero(numero);
    res.json(await comandasService.encerrarPagamento(id));
  },

  async create(req: Request, res: Response) {
    const body = req.validatedBody as CreateBody;
    res.status(201).json(await comandasService.create(body));
  },

  async update(req: Request, res: Response) {
    const { id } = req.validatedParams as IdParam;
    const body = req.validatedBody as UpdateBody;
    res.json(await comandasService.update(id, body));
  },

  async remove(req: Request, res: Response) {
    const { id } = req.validatedParams as IdParam;
    await comandasService.remove(id);
    res.status(204).send();
  },
};
