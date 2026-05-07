import { PedidoStatus, type Prisma } from "@prisma/client";
import { prisma } from "../../db/prisma";

export type LinhaExtraResumo = {
  nome: string;
  quantidade: number;
  precoUnit: number;
  subtotal: number;
};

export type LinhaConsumo = {
  pedidoId: number;
  pedidoItemId: number;
  nome: string;
  quantidade: number;
  precoUnit: number;
  subtotalProduto: number;
  extras: LinhaExtraResumo[];
  subtotalExtras: number;
  subtotalLinha: number;
  observacao: string | null;
};

async function extrasLinhasResumo(
  extras: Prisma.JsonValue | null | undefined
): Promise<{ extrasLines: LinhaExtraResumo[]; extrasSubtotal: number }> {
  if (extras == null || !Array.isArray(extras) || extras.length === 0) {
    return { extrasLines: [], extrasSubtotal: 0 };
  }
  const extrasLines: LinhaExtraResumo[] = [];
  let extrasSubtotal = 0;
  for (const raw of extras) {
    if (raw === null || typeof raw !== "object" || Array.isArray(raw)) {
      continue;
    }
    const o = raw as Record<string, unknown>;
    const exId = Number(o.extraProdutoId);
    const q = Number(o.quantidade);
    const quantidade =
      Number.isInteger(q) && q > 0 ? q : 1;
    if (!Number.isInteger(exId) || exId <= 0) continue;
    const p = await prisma.produto.findUnique({ where: { id: exId } });
    const nome = p?.nome ?? `Extra #${exId}`;
    const precoUnit = p?.preco ?? 0;
    const subtotal = precoUnit * quantidade;
    extrasSubtotal += subtotal;
    extrasLines.push({ nome, quantidade, precoUnit, subtotal });
  }
  return { extrasLines, extrasSubtotal };
}

export async function montarResumoConsumoComanda(comandaId: number): Promise<{
  linhas: LinhaConsumo[];
  subtotalItens: number;
}> {
  const pedidos = await prisma.pedido.findMany({
    where: {
      comandaId,
      status: { not: PedidoStatus.CANCELADO },
    },
    include: { items: true },
    orderBy: { id: "asc" },
  });

  const linhas: LinhaConsumo[] = [];
  let subtotalItens = 0;

  for (const p of pedidos) {
    for (const it of p.items) {
      const { extrasLines, extrasSubtotal } = await extrasLinhasResumo(
        it.extras as Prisma.JsonValue | null
      );
      const subtotalProduto = it.preco * it.quantidade;
      const subtotalLinha = subtotalProduto + extrasSubtotal;
      subtotalItens += subtotalLinha;
      linhas.push({
        pedidoId: p.id,
        pedidoItemId: it.id,
        nome: it.nome,
        quantidade: it.quantidade,
        precoUnit: it.preco,
        subtotalProduto,
        extras: extrasLines,
        subtotalExtras: extrasSubtotal,
        subtotalLinha,
        observacao: it.observacao,
      });
    }
  }

  return { linhas, subtotalItens };
}
