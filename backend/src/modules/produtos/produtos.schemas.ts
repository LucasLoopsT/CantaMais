import { z } from "zod";

export const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const extraIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
  extraProdutoId: z.coerce.number().int().positive(),
});

export const listProdutosQuerySchema = z.object({
  apenasCardapio: z.enum(["0", "1"]).optional(),
});

export const createProdutoBodySchema = z.object({
  nome: z.string().min(1),
  preco: z.number().nonnegative(),
  disponivel: z.boolean().optional(),
  categoria: z.array(z.string().min(1)).min(1),
  descricao: z.string().optional().nullable(),
  imagem: z.string().optional().nullable(),
});

export const updateProdutoBodySchema = createProdutoBodySchema.partial();

export const addExtraBodySchema = z.object({
  extraProdutoId: z.number().int().positive(),
});
