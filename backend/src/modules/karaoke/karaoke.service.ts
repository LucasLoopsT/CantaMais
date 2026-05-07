import { KaraokeStatus } from "@prisma/client";
import { prisma } from "../../db/prisma";
import { socketEvents } from "../../lib/events";
import { HttpError } from "../../lib/http-error";
import { validarComandaEMesa } from "../../lib/resolve-comanda-mesa";
import { getIO } from "../../lib/socket";

export const karaokeService = {
  salas: {
    async list() {
      return prisma.salaKaraoke.findMany({ orderBy: { id: "asc" } });
    },

    async getById(id: number) {
      const row = await prisma.salaKaraoke.findUnique({ where: { id } });
      if (!row) throw new HttpError(404, "Sala de karaoke não encontrada");
      return row;
    },

    async create(data: { nome: string }) {
      return prisma.salaKaraoke.create({ data });
    },

    async getSalaByMesaAndComanda(data: {
      mesaNumero: number;
      comandaNumero: number;
    }) {
      const { comanda, mesa } = await validarComandaEMesa({
        mesaNumero: data.mesaNumero,
        comandaNumero: data.comandaNumero,
      });

      if (!mesa.karaokeId) {
        throw new HttpError(
          400,
          "Mesa não está vinculada a nenhuma sala de karaoke",
        );
      }

      const salaKaraoke = await prisma.salaKaraoke.findUnique({
        where: { id: mesa.karaokeId },
      });

      return { salaKaraoke, mesa };
    },

    async update(id: number, data: { nome?: string }) {
      await this.getById(id);
      return prisma.salaKaraoke.update({ where: { id }, data });
    },

    async remove(id: number) {
      await this.getById(id);
      await prisma.salaKaraoke.delete({ where: { id } });
    },
  },

  pedidos: {
    async list() {
      return prisma.karaokePedido.findMany({
        orderBy: { id: "asc" },
        include: {
          mesa: true,
        },
      });
    },

    async listarFilaPorSala(salaId: number) {
      await karaokeService.salas.getById(salaId);
      return prisma.karaokePedido.findMany({
        where: { salaKaraokeId: salaId },
        orderBy: { ordem: "asc" },
      });
    },

    async getById(id: number) {
      const row = await prisma.karaokePedido.findUnique({ where: { id } });
      if (!row) throw new HttpError(404, "Karaoke pedido not found");
      return row;
    },

    async create(data: {
      salaKaraokeId: number;
      mesaNumero: number;
      comandaNumero: number;
      nomeMusica: string;
      artista: string;
      link: string;
      status?: KaraokeStatus;
    }) {
      const result = await prisma.$transaction(async (tx) => {
        const { comanda, mesa } = await validarComandaEMesa({
          mesaNumero: data.mesaNumero,
          comandaNumero: data.comandaNumero,
        });

        const sala = await tx.salaKaraoke.findUnique({
          where: { id: data.salaKaraokeId },
        });

        if (!sala) throw new HttpError(404, "Sala não encontrada");

        if (!mesa.karaokeId || mesa.karaokeId !== data.salaKaraokeId) {
          throw new HttpError(400, "Mesa não pertence a essa sala");
        }

        if (mesa.musicas <= 0) {
          throw new HttpError(400, "Sem créditos");
        }

        const round = sala.roundAtual;

        const created = await tx.karaokePedido.create({
          data: {
            salaKaraokeId: sala.id,
            mesaId: mesa.id,
            comandaId: comanda.id,
            nomeMusica: data.nomeMusica,
            artista: data.artista,
            link: data.link,
            status: data.status ?? KaraokeStatus.AGUARDANDO,
            ordem: 0,
            round,
          },
        });

        await tx.mesa.update({
          where: { id: mesa.id },
          data: { musicas: { decrement: 1 } },
        });

        return { created, salaId: sala.id, mesaId: mesa.id };
      });

      await this.reordenarFila(result.salaId);

      getIO()?.emit(socketEvents.karaokeFilaUpdate);
      getIO()?.emit(socketEvents.mesaUpdate, { mesaId: result.mesaId });

      return result.created;
    },

    async update(id: number, data: { status?: KaraokeStatus }) {
      const result = await prisma.$transaction(async (tx) => {
        const atual = await tx.karaokePedido.findUnique({
          where: { id },
        });

        if (!atual) throw new HttpError(404, "Pedido não encontrado");

        const updated = await tx.karaokePedido.update({
          where: { id },
          data,
        });

        let deveAvancarRound = false;

        if (data.status === "CANTOU" && atual.status !== "CANTOU") {
          const sala = await tx.salaKaraoke.findUnique({
            where: { id: atual.salaKaraokeId },
          });

          const restantes = await tx.karaokePedido.count({
            where: {
              salaKaraokeId: sala!.id,
              round: sala!.roundAtual,
              status: {
                in: ["AGUARDANDO", "CANTANDO"],
              },
            },
          });

          if (restantes === 0) {
            deveAvancarRound = true;
          }
        }

        return {
          updated,
          salaId: atual.salaKaraokeId,
          deveAvancarRound,
        };
      });

      if (result.deveAvancarRound) {
        await karaokeService.avancarRound(result.salaId);
      }

      getIO()?.emit(socketEvents.karaokeFilaUpdate);

      return result.updated;
    },

    async updateCliente(
      id: number,
      data: {
        nomeMusica?: string;
        artista?: string;
        link?: string;
      },
    ) {
      const pedido = await prisma.karaokePedido.findUnique({
        where: { id },
      });

      if (!pedido) {
        throw new HttpError(404, "Pedido não encontrado");
      }

      if (pedido.status !== "AGUARDANDO") {
        throw new HttpError(400, "Só pode editar músicas aguardando");
      }

      getIO()?.emit(socketEvents.karaokeFilaUpdate);

      return prisma.karaokePedido.update({
        where: { id },
        data: {
          nomeMusica: data.nomeMusica,
          artista: data.artista,
          link: data.link,
        },
      });
    },

    async remove(id: number) {
      await this.getById(id);
      await prisma.karaokePedido.delete({ where: { id } });
    },

    async reordenarFila(salaId: number) {
      await karaokeService.salas.getById(salaId);

      const fila = await prisma.karaokePedido.findMany({
        where: {
          salaKaraokeId: salaId,
          status: {
            in: ["AGUARDANDO", "CANTANDO"],
          },
        },
        include: {
          mesa: {
            select: { numero: true },
          },
        },
        orderBy: {
          createdAt: "asc",
        },
      });

      const grupos = new Map<string, typeof fila>();

      for (const item of fila) {
        const key = `${item.round}-${item.mesaId}`;

        if (!grupos.has(key)) {
          grupos.set(key, []);
        }

        grupos.get(key)!.push(item);
      }

      const gruposArray = Array.from(grupos.values());

      gruposArray.sort((a, b) => {
        const rA = a[0].round;
        const rB = b[0].round;

        if (rA !== rB) return rA - rB;

        const mesaA = a[0].mesa.numero;
        const mesaB = b[0].mesa.numero;

        return mesaA - mesaB;
      });

      const filaFinal = gruposArray.flat();

      await prisma.$transaction(
        filaFinal.map((item, index) =>
          prisma.karaokePedido.update({
            where: { id: item.id },
            data: { ordem: index + 1 },
          }),
        ),
      );

      const filaAtualizada = await prisma.karaokePedido.findMany({
        where: { salaKaraokeId: salaId },
        orderBy: { ordem: "asc" },
      });

      getIO()?.emit(socketEvents.karaokeFilaUpdate, {
        salaKaraokeId: salaId,
        fila: filaAtualizada,
      });

      return filaAtualizada;
    },

    async limparFila(salaKaraokeId: number) {
      return prisma
        .$transaction(async (tx) => {
          const pedidos = await tx.karaokePedido.findMany({
            where: { salaKaraokeId },
            select: {
              mesaId: true,
              status: true,
            },
          });

          const aguardando = pedidos.filter((p) => p.status === "AGUARDANDO");
          const creditosPorMesa: Record<number, number> = {};

          for (const p of aguardando) {
            creditosPorMesa[p.mesaId] = (creditosPorMesa[p.mesaId] || 0) + 1;
          }

          const updates = Object.entries(creditosPorMesa).map(([mesaId, qtd]) =>
            tx.mesa.update({
              where: { id: Number(mesaId) },
              data: {
                musicas: { increment: qtd },
              },
            }),
          );

          await Promise.all(updates);

          await tx.karaokePedido.deleteMany({
            where: { salaKaraokeId },
          });

          await tx.salaKaraoke.update({
            where: { id: salaKaraokeId },
            data: {
              roundAtual: 1,
            },
          });

          return { creditosPorMesa };
        })
        .then(() => {
          getIO()?.emit(socketEvents.karaokeFilaUpdate, {
            salaKaraokeId,
          });
          getIO()?.emit(socketEvents.karaokeRoundUpdate, {
            salaId: salaKaraokeId,
            roundAtual: 1,
          });
        });
    },
  },

  async avancarRound(salaId: number) {
    const sala = await prisma.salaKaraoke.findUnique({
      where: { id: salaId },
    });

    if (!sala) throw new HttpError(404, "Sala não encontrada");

    const updatedSala = await prisma.salaKaraoke.update({
      where: { id: salaId },
      data: {
        roundAtual: { increment: 1 },
      },
    });

    const mesas = await prisma.mesa.findMany({
      where: { karaokeId: salaId },
    });

    await prisma.$transaction(
      mesas.map((mesa) =>
        prisma.mesa.update({
          where: { id: mesa.id },
          data: {
            musicas: mesa.musicasDefault,
          },
        }),
      ),
    );

    getIO()?.emit(socketEvents.karaokeRoundUpdate, {
      salaId,
      roundAtual: updatedSala.roundAtual,
    });

    return updatedSala;
  },
};
