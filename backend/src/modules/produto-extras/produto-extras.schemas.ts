import { z } from "zod";

export const vinculoParamsSchema = z.object({
  produtoId: z.coerce.number().int().positive(),
  extraProdutoId: z.coerce.number().int().positive(),
});

export const createVinculoBodySchema = z.object({
  produtoId: z.number().int().positive(),
  extraProdutoId: z.number().int().positive(),
});
