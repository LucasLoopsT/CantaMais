import { prisma } from "../db/prisma";
import { HttpError } from "./http-error";

export async function validarComandaEMesa({
  comandaNumero,
  mesaNumero,
}: {
  comandaNumero: number;
  mesaNumero: number;
}) {
  const comanda = await prisma.comanda.findFirst({
    where: { numero: comandaNumero },
    select: {
      id: true,
      status: true,
      mesaId: true,
    },
  });

  if (!comanda) {
    throw new HttpError(400, "Comanda não encontrada");
  }

  if (comanda.status !== "EM_USO") {
    throw new HttpError(400, "Comanda não está ativa");
  }

  if (!comanda.mesaId) {
    throw new HttpError(400, "Comanda não vinculada a mesa");
  }

  const mesa = await prisma.mesa.findFirst({
    where: { numero: mesaNumero },
    select: {
      id: true,
      karaokeId: true,
      musicas: true,
      musicasDefault: true,
    },
  });

  if (!mesa) {
    throw new HttpError(400, "Mesa não encontrada");
  }

  if (mesa.id !== comanda.mesaId) {
    throw new HttpError(400, "Comanda não pertence a mesa informada");
  }

  return {
    comanda,
    mesa,
  };
}
