import { KaraokeStatus } from "@prisma/client";
import { z } from "zod";

export const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const createSalaKaraokeBodySchema = z.object({
  nome: z.string().min(1),
});

export const getSalaBodySchema = z.object({
  mesaNumero: z.number().int().positive(),
  comandaNumero: z.number().int().positive(),
});

export const updateSalaKaraokeBodySchema =
  createSalaKaraokeBodySchema.partial();

export const createKaraokePedidoBodySchema = z
  .object({
    salaKaraokeId: z.number().int().positive(),
    mesaNumero: z.number().int().positive(),
    comandaNumero: z.number().int().positive(),
    nomeMusica: z.string().min(1),
    artista: z.string().min(1),
    link: z.string().min(1),
    status: z.nativeEnum(KaraokeStatus).optional(),
  })
  .refine((d) => d.comandaId != null || d.comandaNumero != null, {
    message: "Informe comandaId ou comandaNumero",
    path: ["comandaNumero"],
  })
  .refine((d) => !(d.comandaId != null && d.comandaNumero != null), {
    message: "Use apenas comandaId ou comandaNumero",
    path: ["comandaId"],
  });

export const updateKaraokePedidoBodySchema = z.object({
  salaKaraokeId: z.number().int().positive().optional(),
  mesaId: z.number().int().positive().optional(),
  comandaId: z.number().int().positive().optional(),
  nomeMusica: z.string().min(1).optional(),
  artista: z.string().min(1).optional(),
  link: z.string().min(1).optional(),
  status: z.nativeEnum(KaraokeStatus).optional(),
  ordem: z.number().int().optional(),
});
