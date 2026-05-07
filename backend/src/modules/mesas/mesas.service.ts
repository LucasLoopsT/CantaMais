import { prisma } from "../../db/prisma";
import { socketEvents } from "../../lib/events";
import { HttpError } from "../../lib/http-error";
import { getIO } from "../../lib/socket";
import { TypeStatus } from "@prisma/client";

const mesaInclude = { comandas: true } as const;

export const mesasService = {
  async create(data: {
    numero: number;
    qtClientes?: number;
    status?: import("@prisma/client").TypeStatus;
    musicas?: number;
    karaokeId?: number | null;
  }) {
    return prisma.mesa.create({
      data: {
        numero: data.numero,
        qtClientes: data.qtClientes,
        status: data.status,
        musicas: data.musicas,
        karaokeId: data.karaokeId ?? undefined,
        musicasDefault: data.musicas,
      },
    });
  },

  async list() {
    return prisma.mesa.findMany({
      orderBy: { id: "asc" },
      include: mesaInclude,
    });
  },

  async getById(id: number) {
    const row = await prisma.mesa.findUnique({
      where: { id },
      include: mesaInclude,
    });
    if (!row) throw new HttpError(404, "Mesa not found");
    return row;
  },

  async update(
    id: number,
    data: {
      numero?: number;
      qtClientes?: number;
      status?: import("@prisma/client").TypeStatus;
      musicas?: number;
      musicasDefault?: number;
      karaokeId?: number | null;
    },
  ) {
    await this.getById(id);
    const updated = await prisma.mesa.update({
      where: { id },
      data: {
        ...data,
        karaokeId: data.karaokeId === undefined ? undefined : data.karaokeId,
      },
    });

    await this.recalcularStatusMesa(updated.id);

    getIO()?.emit(socketEvents.mesaUpdate, updated);
    return updated;
  },

  recalcularStatusMesa: async function (mesaId: number) {
    const [mesa, pessoasAgg] = await Promise.all([
      prisma.mesa.findUnique({
        where: { id: mesaId },
        select: { qtClientes: true },
      }),
      prisma.comanda.aggregate({
        where: { mesaId },
        _sum: { pessoas: true },
      }),
    ]);

    if (!mesa) return;

    const totalPessoas = pessoasAgg._sum.pessoas ?? 0;

    let status: TypeStatus;

    if (totalPessoas === 0) {
      status = TypeStatus.LIVRE;
    } else if (totalPessoas >= (mesa.qtClientes ?? 0)) {
      status = TypeStatus.OCUPADA;
    } else {
      status = TypeStatus.EM_USO;
    }

    await prisma.mesa.update({
      where: { id: mesaId },
      data: { status },
    });
  },

  async remove(id: number) {
    await this.getById(id);
    await prisma.mesa.delete({ where: { id } });
  },
};
