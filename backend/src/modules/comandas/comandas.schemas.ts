import { TypeStatus } from "@prisma/client";
import { z } from "zod";

export const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const numeroParamSchema = z.object({
  numero: z.coerce.number().int().positive(),
});

export const createComandaBodySchema = z.object({
  pessoas: z.number().int().positive().optional(),
  status: z.nativeEnum(TypeStatus),
  mesaId: z.number().int().positive().nullable().optional(),
  numero: z.number().int().positive().nullable().optional(),
  nome: z.string().max(120).nullable().optional(),
});

export const updateComandaBodySchema = createComandaBodySchema.partial();
