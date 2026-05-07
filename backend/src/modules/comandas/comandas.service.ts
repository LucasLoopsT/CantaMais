import { prisma } from "../../db/prisma";
import { socketEvents } from "../../lib/events";
import { HttpError } from "../../lib/http-error";
import { getIO } from "../../lib/socket";
import { appSettingsService } from "../app-settings/app-settings.service";
import { montarResumoConsumoComanda } from "./comandas-consumo";
import { TypeStatus } from "@prisma/client";
import { mesasService } from "../mesas/mesas.service";

export const comandasService = {
  async resolveIdByNumero(numero: number): Promise<number> {
    const row = await prisma.comanda.findFirst({
      where: { numero },
      orderBy: { id: "desc" },
      select: { id: true },
    });
    if (!row) {
      throw new HttpError(404, "Nenhuma comanda com este número");
    }
    return row.id;
  },

  async list() {
    return prisma.comanda.findMany({ orderBy: { id: "asc" } });
  },

  async getById(id: number) {
    const row = await prisma.comanda.findUnique({ where: { id } });
    if (!row) throw new HttpError(404, "Comanda not found");
    return row;
  },

  async create(data: {
    pessoas?: number;
    status?: TypeStatus;
    mesaId?: number | null;
    numero?: number | null;
    nome?: string | null;
  }) {
    const temMesa = data.mesaId != null;
    const status = temMesa
      ? TypeStatus.EM_USO
      : (data.status ?? TypeStatus.LIVRE);
    return prisma.comanda.create({
      data: {
        pessoas: data.pessoas,
        status: status,
        mesaId: data.mesaId ?? undefined,
        numero: data.numero === undefined ? undefined : data.numero,
        nome: data.nome === undefined ? undefined : data.nome,
      },
    });
  },

  async update(
    id: number,
    data: {
      pessoas?: number;
      status?: TypeStatus;
      mesaId?: number | null;
      numero?: number | null;
      nome?: string | null;
    },
  ) {
    await this.getById(id);

    const oldComanda = await prisma.comanda.findUnique({
      where: { id },
      select: { mesaId: true },
    });

    const patch = { ...data };

    if (data.status === TypeStatus.LIVRE) {
      patch.mesaId = null;
    }

    if (data.mesaId !== undefined) {
      patch.status =
        data.mesaId === null ? TypeStatus.LIVRE : TypeStatus.EM_USO;
    }

    const updated = await prisma.comanda.update({
      where: { id },
      data: {
        ...patch,
        mesaId: patch.mesaId === undefined ? undefined : patch.mesaId,
        numero: patch.numero === undefined ? undefined : patch.numero,
        nome: patch.nome === undefined ? undefined : patch.nome,
      },
    });

    const oldMesaId = oldComanda?.mesaId;
    const newMesaId = updated.mesaId;

    if (oldMesaId) {
      await mesasService.recalcularStatusMesa(oldMesaId);
    }

    if (newMesaId && newMesaId !== oldMesaId) {
      await mesasService.recalcularStatusMesa(newMesaId);
    }

    getIO()?.emit(socketEvents.comandaUpdate, updated);
    return updated;
  },

  async getResumoConsumo(id: number) {
    const comanda = await this.getById(id);
    const { linhas, subtotalItens } = await montarResumoConsumoComanda(id);
    const settings = await appSettingsService.get();
    const taxaKaraokePorPessoa = settings.taxaKaraokePorPessoa;
    const taxaKaraokeTotal = taxaKaraokePorPessoa * comanda.pessoas;
    const total = subtotalItens + taxaKaraokeTotal;
    return {
      comanda,
      linhas,
      subtotalItens,
      taxaKaraokePorPessoa,
      pessoasComanda: comanda.pessoas,
      taxaKaraokeTotal,
      total,
    };
  },

  async encerrarPagamento(id: number) {
    await this.getById(id);

    const oldComanda = await prisma.comanda.findUnique({
      where: { id },
      select: { mesaId: true },
    });

    const updated = await prisma.$transaction(async (tx) => {
      const mesaId = oldComanda?.mesaId;

      const pedidos = await tx.pedido.findMany({
        where: {
          comandaId: id,
        },
        select: {
          id: true,
        },
      });

      const pedidosIds = pedidos.map((p) => p.id);

      // 🔥 remove itens
      await tx.pedidoItem.deleteMany({
        where: {
          pedidoId: {
            in: pedidosIds,
          },
        },
      });

      // 🔥 remove pedidos
      await tx.pedido.deleteMany({
        where: {
          id: {
            in: pedidosIds,
          },
        },
      });

      const outrasComandas = await tx.comanda.count({
        where: {
          mesaId,
          id: { not: id },
          status: { not: "LIVRE" },
        },
      });

      if (outrasComandas === 0 && mesaId) {
        await tx.karaokePedido.deleteMany({
          where: {
            mesaId,
          },
        });
      }

      const comanda = await tx.comanda.findFirst({
        where: { id },
        select: { numero: true },
      });

      return tx.comanda.update({
        where: { id },
        data: {
          status: "LIVRE",
          mesaId: null,
          pessoas: 1,
          numero: comanda?.numero,
          nome: null,
        },
      });
    });

    if (oldComanda?.mesaId) {
      await mesasService.recalcularStatusMesa(oldComanda.mesaId);
    }

    getIO()?.emit(socketEvents.comandaUpdate, updated);
    getIO()?.emit(socketEvents.karaokeFilaUpdate);

    return updated;
  },

  async remove(id: number) {
    await this.getById(id);
    await prisma.comanda.delete({ where: { id } });
  },

  async abrirComanda(data?: { pessoas?: number; mesaId?: number | null }) {
    const temMesa = data?.mesaId != null;
    return prisma.comanda.create({
      data: {
        pessoas: data?.pessoas,
        status: temMesa ? TypeStatus.EM_USO : TypeStatus.LIVRE,
        mesaId: data?.mesaId ?? undefined,
      },
    });
  },

  async vincularComandaMesa(comandaId: number, mesaId: number) {
    await this.getById(comandaId);
    const mesa = await prisma.mesa.findUnique({ where: { id: mesaId } });
    if (!mesa) throw new HttpError(404, "Mesa not found");
    return prisma.comanda.update({
      where: { id: comandaId },
      data: { mesaId, status: TypeStatus.EM_USO },
    });
  },

  async removerComandaDaMesa(comandaId: number) {
    await this.getById(comandaId);
    return prisma.comanda.update({
      where: { id: comandaId },
      data: { mesaId: null, status: TypeStatus.LIVRE },
    });
  },
};
