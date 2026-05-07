import { Prisma, type PedidoStatus } from "@prisma/client";
import { prisma } from "../../db/prisma";
import { socketEvents } from "../../lib/events";
import { HttpError } from "../../lib/http-error";
import { validarComandaEMesa } from "../../lib/resolve-comanda-mesa";
import { getIO } from "../../lib/socket";

function categoriaIncluiExtra(categorias: string[]): boolean {
  return categorias.some((c) => c.trim().toLowerCase() === "extra");
}

async function normalizarEValidarExtras(
  produtoPrincipalId: number,
  extras: unknown,
): Promise<Prisma.InputJsonValue> {
  if (!Array.isArray(extras)) {
    throw new HttpError(400, "extras must be a JSON array");
  }

  const vinculos = await prisma.produtoExtra.findMany({
    where: { produtoId: produtoPrincipalId },
    select: { extraProdutoId: true },
  });
  const permitidos = new Set(vinculos.map((v) => v.extraProdutoId));

  const linhas: { extraProdutoId: number; quantidade: number }[] = [];

  for (const raw of extras) {
    if (raw === null || typeof raw !== "object" || Array.isArray(raw)) {
      throw new HttpError(400, "Invalid extra line");
    }
    const o = raw as Record<string, unknown>;
    const exId = Number(o.extraProdutoId);
    if (!Number.isInteger(exId) || exId <= 0) {
      throw new HttpError(400, "Each extra must have extraProdutoId");
    }
    if (!permitidos.has(exId)) {
      throw new HttpError(400, "Extra not linked to this product");
    }

    const extraProd = await prisma.produto.findUnique({ where: { id: exId } });
    if (!extraProd) {
      throw new HttpError(400, "Extra product not found");
    }
    if (!categoriaIncluiExtra(extraProd.categoria)) {
      throw new HttpError(400, "Extra product must have category 'extra'");
    }

    const q = o.quantidade !== undefined ? Number(o.quantidade) : 1;
    if (!Number.isInteger(q) || q <= 0) {
      throw new HttpError(400, "Invalid extra quantity");
    }
    linhas.push({ extraProdutoId: exId, quantidade: q });
  }

  return linhas as unknown as Prisma.InputJsonValue;
}

const itemInclude = { produto: true } as const;

export const pedidosService = {
  async list() {
    return prisma.pedido.findMany({
      orderBy: { id: "asc" },
      include: {
        items: { include: itemInclude },
        mesa: {
          select: { numero: true },
        },
        comanda: {
          select: { numero: true },
        },
      },
    });
  },

  async getById(id: number) {
    const row = await prisma.pedido.findUnique({
      where: { id },
      include: { items: { include: itemInclude } },
    });
    if (!row) throw new HttpError(404, "Pedido not found");
    return row;
  },

  async create(data: { mesaNumero: number; comandaNumero: number }) {
    const { comanda, mesa } = await validarComandaEMesa({
      mesaNumero: data.mesaNumero,
      comandaNumero: data.comandaNumero,
    });

    const created = await prisma.pedido.create({
      data: {
        mesaId: mesa.id,
        comandaId: comanda.id,
      },
      include: { items: { include: itemInclude } },
    });

    getIO()?.emit(socketEvents.pedidoNovo, created);
    return created;
  },

  async update(
    id: number,
    data: { mesaId?: number; comandaId?: number; status?: PedidoStatus },
  ) {
    await this.getById(id);
    const updated = await prisma.pedido.update({
      where: { id },
      data,
      include: { items: { include: itemInclude } },
    });
    getIO()?.emit(socketEvents.pedidoUpdate, updated);
    return updated;
  },

  async remove(id: number) {
    await this.getById(id);
    getIO()?.emit(socketEvents.pedidoDelete, { id });
    await prisma.pedido.delete({ where: { id } });
  },

  async limparFila() {
    await prisma.pedido.deleteMany();
    getIO()?.emit(socketEvents.pedidoDelete);
  },

  items: {
    async listByPedido(pedidoId: number) {
      await pedidosService.getById(pedidoId);
      return prisma.pedidoItem.findMany({
        where: { pedidoId },
        orderBy: { id: "asc" },
        include: itemInclude,
      });
    },

    async getById(pedidoId: number, itemId: number) {
      await pedidosService.getById(pedidoId);
      const row = await prisma.pedidoItem.findFirst({
        where: { id: itemId, pedidoId },
        include: itemInclude,
      });
      if (!row) throw new HttpError(404, "Pedido item not found");
      return row;
    },

    async create(
      pedidoId: number,
      data: {
        produtoId: number;
        quantidade: number;
        extras?: Prisma.InputJsonValue;
        observacao?: string | null;
      },
    ) {
      await pedidosService.getById(pedidoId);

      const produto = await prisma.produto.findUnique({
        where: { id: data.produtoId },
      });
      if (!produto) throw new HttpError(400, "Product not found");
      if (!produto.disponivel) {
        throw new HttpError(400, "Product is not available");
      }

      let extrasJson:
        | Prisma.InputJsonValue
        | typeof Prisma.JsonNull
        | undefined;
      if (data.extras === undefined || data.extras === null) {
        extrasJson = undefined;
      } else {
        extrasJson = await normalizarEValidarExtras(
          data.produtoId,
          data.extras,
        );
      }

      return prisma.pedidoItem.create({
        data: {
          pedidoId,
          produtoId: data.produtoId,
          nome: produto.nome,
          preco: produto.preco,
          quantidade: data.quantidade,
          extras: extrasJson ?? undefined,
          observacao:
            data.observacao === undefined || data.observacao === null
              ? undefined
              : data.observacao.trim() === ""
                ? null
                : data.observacao.trim(),
        },
        include: itemInclude,
      });
    },

    async update(
      pedidoId: number,
      itemId: number,
      data: {
        nome?: string;
        preco?: number;
        quantidade?: number;
        extras?: Prisma.InputJsonValue | null;
        observacao?: string | null;
      },
    ) {
      const existing = await this.getById(pedidoId, itemId);

      let extras: Prisma.InputJsonValue | typeof Prisma.JsonNull | undefined;
      if (data.extras === undefined) {
        extras = undefined;
      } else if (data.extras === null) {
        extras = Prisma.JsonNull;
      } else {
        extras = await normalizarEValidarExtras(
          existing.produtoId,
          data.extras,
        );
      }

      const obs =
        data.observacao === undefined
          ? undefined
          : data.observacao === null
            ? null
            : data.observacao.trim() === ""
              ? null
              : data.observacao.trim();

      return prisma.pedidoItem.update({
        where: { id: itemId },
        data: {
          nome: data.nome,
          preco: data.preco,
          quantidade: data.quantidade,
          extras,
          observacao: obs,
        },
        include: itemInclude,
      });
    },

    async remove(pedidoId: number, itemId: number) {
      await this.getById(pedidoId, itemId);
      await prisma.pedidoItem.delete({ where: { id: itemId } });
    },
  },
};
