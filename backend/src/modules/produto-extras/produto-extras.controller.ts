import type { Request, Response } from "express";
import { z } from "zod";
import { createVinculoBodySchema, vinculoParamsSchema } from "./produto-extras.schemas";
import { produtoExtrasService } from "./produto-extras.service";

type CreateBody = z.infer<typeof createVinculoBodySchema>;
type VinculoParams = z.infer<typeof vinculoParamsSchema>;

export const produtoExtrasController = {
  async list(_req: Request, res: Response) {
    res.json(await produtoExtrasService.list());
  },

  async create(req: Request, res: Response) {
    const body = req.validatedBody as CreateBody;
    res
      .status(201)
      .json(await produtoExtrasService.create(body.produtoId, body.extraProdutoId));
  },

  async remove(req: Request, res: Response) {
    const { produtoId, extraProdutoId } = req.validatedParams as VinculoParams;
    await produtoExtrasService.remove(produtoId, extraProdutoId);
    res.status(204).send();
  },
};
