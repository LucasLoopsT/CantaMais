import { PedidoStatus } from "@prisma/client";
import { z } from "zod";

export const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const pedidoIdParamSchema = z.object({
  pedidoId: z.coerce.number().int().positive(),
});

export const pedidoItemParamsSchema = z.object({
  pedidoId: z.coerce.number().int().positive(),
  itemId: z.coerce.number().int().positive(),
});

export const createPedidoBodySchema = z.object({
  mesaNumero: z.number().int().positive(),
  comandaNumero: z.number().int().positive(),
});

export const updatePedidoBodySchema = z.object({
  mesaId: z.number().int().positive().optional(),
  comandaId: z.number().int().positive().optional(),
  status: z.nativeEnum(PedidoStatus).optional(),
});

export const pedidoItemExtraLinhaSchema = z.object({
  extraProdutoId: z.number().int().positive(),
  quantidade: z.number().int().positive().optional(),
});

export const createPedidoItemBodySchema = z.object({
  produtoId: z.number().int().positive(),
  quantidade: z.number().int().positive(),
  extras: z.array(pedidoItemExtraLinhaSchema).optional(),
  observacao: z.string().max(500).optional().nullable(),
});

export const updatePedidoItemBodySchema = z.object({
  nome: z.string().min(1).optional(),
  preco: z.number().nonnegative().optional(),
  quantidade: z.number().int().positive().optional(),
  extras: z.array(pedidoItemExtraLinhaSchema).nullable().optional(),
  observacao: z.string().max(500).optional().nullable(),
});
