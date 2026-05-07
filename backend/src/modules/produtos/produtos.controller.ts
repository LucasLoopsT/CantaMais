import type { Request, Response } from "express";
import { z } from "zod";
import {
  addExtraBodySchema,
  createProdutoBodySchema,
  extraIdParamSchema,
  idParamSchema,
  listProdutosQuerySchema,
  updateProdutoBodySchema,
} from "./produtos.schemas";
import { produtosService } from "./produtos.service";

type IdParam = z.infer<typeof idParamSchema>;
type CreateBody = z.infer<typeof createProdutoBodySchema>;
type UpdateBody = z.infer<typeof updateProdutoBodySchema>;
type AddExtraBody = z.infer<typeof addExtraBodySchema>;
type ExtraParams = z.infer<typeof extraIdParamSchema>;
type ListQuery = z.infer<typeof listProdutosQuerySchema>;

export const produtosController = {
  async list(req: Request, res: Response) {
    const q = listProdutosQuerySchema.safeParse(req.query);
    const apenasCardapio = q.success && q.data.apenasCardapio === "1";
    res.json(await produtosService.list({ apenasCardapio }));
  },

  async getById(req: Request, res: Response) {
    const { id } = req.validatedParams as IdParam;
    res.json(await produtosService.getById(id));
  },

  async create(req: Request, res: Response) {
    const body = req.validatedBody as CreateBody;
    res.status(201).json(await produtosService.create(body));
  },

  async update(req: Request, res: Response) {
    const { id } = req.validatedParams as IdParam;
    const body = req.validatedBody as UpdateBody;
    res.json(await produtosService.update(id, body));
  },

  async remove(req: Request, res: Response) {
    const { id } = req.validatedParams as IdParam;
    await produtosService.remove(id);
    res.status(204).send();
  },

  async addExtra(req: Request, res: Response) {
    const { id } = req.validatedParams as IdParam;
    const body = req.validatedBody as AddExtraBody;
    res.status(201).json(await produtosService.addExtra(id, body.extraProdutoId));
  },

  async removeExtra(req: Request, res: Response) {
    const { id, extraProdutoId } = req.validatedParams as ExtraParams;
    await produtosService.removeExtra(id, extraProdutoId);
    res.status(204).send();
  },
};
