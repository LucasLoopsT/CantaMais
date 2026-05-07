import { TypeStatus } from "@prisma/client";
import { z } from "zod";

export const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const createMesaBodySchema = z.object({
  numero: z.number().int().nonnegative(),
  qtClientes: z.number().int().nonnegative(),
  status: z.nativeEnum(TypeStatus),
  musicas: z.number().int().nonnegative(),
  musicasDefault: z.number().int().nonnegative().optional(),
  karaokeId: z.number().int().positive(),
});

export const updateMesaBodySchema = createMesaBodySchema.partial();
