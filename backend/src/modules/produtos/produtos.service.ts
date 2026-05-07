import { prisma } from "../../db/prisma";
import { HttpError } from "../../lib/http-error";

const produtoInclude = {
  extrasPermitidos: { include: { extraProduto: true } },
} as const;

function categoriaIncluiExtra(categorias: string[]): boolean {
  return categorias.some((c) => c.trim().toLowerCase() === "extra");
}

function isSomenteExtra(categorias: string[]): boolean {
  const n = categorias.map((c) => c.trim().toLowerCase());
  return n.length > 0 && n.every((c) => c === "extra");
}

export const produtosService = {
  async list(opts?: { apenasCardapio?: boolean }) {
    const rows = await prisma.produto.findMany({
      orderBy: { id: "asc" },
      include: produtoInclude,
    });
    if (!opts?.apenasCardapio) return rows;
    return rows.filter((p) => p.disponivel && !isSomenteExtra(p.categoria));
  },

  async getById(id: number) {
    const row = await prisma.produto.findUnique({
      where: { id },
      include: produtoInclude,
    });
    if (!row) throw new HttpError(404, "Produto not found");
    return row;
  },

  async create(data: {
    nome: string;
    preco: number;
    disponivel?: boolean;
    categoria: string[];
    descricao?: string | null;
    imagem?: string | null;
  }) {
    return prisma.produto.create({
      data: {
        nome: data.nome,
        preco: data.preco,
        disponivel: data.disponivel,
        categoria: data.categoria,
        descricao: data.descricao ?? undefined,
        imagem: data.imagem || undefined,
      },
      include: produtoInclude,
    });
  },

  async update(
    id: number,
    data: {
      nome?: string;
      preco?: number;
      disponivel?: boolean;
      categoria?: string[];
      descricao?: string | null;
      imagem?: string | null;
    }
  ) {
    await this.getById(id);
    return prisma.produto.update({
      where: { id },
      data: {
        ...data,
        descricao: data.descricao === undefined ? undefined : data.descricao,
        imagem: data.imagem === undefined ? undefined : data.imagem || null,
      },
      include: produtoInclude,
    });
  },

  async remove(id: number) {
    await this.getById(id);
    try {
      await prisma.produto.delete({ where: { id } });
    } catch {
      throw new HttpError(409, "Cannot delete product in use");
    }
  },

  async addExtra(produtoId: number, extraProdutoId: number) {
    if (produtoId === extraProdutoId) {
      throw new HttpError(400, "Product cannot be extra of itself");
    }
    await this.getById(produtoId);
    const extra = await prisma.produto.findUnique({ where: { id: extraProdutoId } });
    if (!extra) throw new HttpError(404, "Extra product not found");
    if (!categoriaIncluiExtra(extra.categoria)) {
      throw new HttpError(400, "Extra product must include category 'extra'");
    }
    try {
      return await prisma.produtoExtra.create({
        data: { produtoId, extraProdutoId },
        include: { extraProduto: true },
      });
    } catch {
      throw new HttpError(409, "Link already exists");
    }
  },

  async removeExtra(produtoId: number, extraProdutoId: number) {
    await this.getById(produtoId);
    try {
      await prisma.produtoExtra.delete({
        where: {
          produtoId_extraProdutoId: { produtoId, extraProdutoId },
        },
      });
    } catch {
      throw new HttpError(404, "Link not found");
    }
  },

  async listAllVinculos() {
    return prisma.produtoExtra.findMany({
      orderBy: [{ produtoId: "asc" }, { id: "asc" }],
      include: {
        produto: { select: { id: true, nome: true } },
        extraProduto: { select: { id: true, nome: true, preco: true } },
      },
    });
  },
};
