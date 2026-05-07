import type { Request, Response } from "express";
import { z } from "zod";
import {
  createPedidoBodySchema,
  createPedidoItemBodySchema,
  idParamSchema,
  pedidoIdParamSchema,
  pedidoItemParamsSchema,
  updatePedidoBodySchema,
  updatePedidoItemBodySchema,
} from "./pedidos.schemas";
import { pedidosService } from "./pedidos.service";

type CreatePedido = z.infer<typeof createPedidoBodySchema>;
type UpdatePedido = z.infer<typeof updatePedidoBodySchema>;
type IdParam = z.infer<typeof idParamSchema>;
type PedidoIdParam = z.infer<typeof pedidoIdParamSchema>;
type PedidoItemParams = z.infer<typeof pedidoItemParamsSchema>;
type CreateItem = z.infer<typeof createPedidoItemBodySchema>;
type UpdateItem = z.infer<typeof updatePedidoItemBodySchema>;

export const pedidosController = {
  async list(_req: Request, res: Response) {
    res.json(await pedidosService.list());
  },

  async getById(req: Request, res: Response) {
    const { id } = req.validatedParams as IdParam;
    res.json(await pedidosService.getById(id));
  },

  async create(req: Request, res: Response) {
    const body = req.validatedBody as CreatePedido;
    res.status(201).json(
      await pedidosService.create({
        mesaNumero: body.mesaNumero,
        comandaNumero: body.comandaNumero,
      }),
    );
  },

  async update(req: Request, res: Response) {
    const { id } = req.validatedParams as IdParam;
    const body = req.validatedBody as UpdatePedido;
    res.json(await pedidosService.update(id, body));
  },

  async remove(req: Request, res: Response) {
    const { id } = req.validatedParams as IdParam;
    await pedidosService.remove(id);
    res.status(204).send();
  },

  async limparFila(req: Request, res: Response) {
    await pedidosService.limparFila();
    res.status(204).send();
  },

  async listItems(req: Request, res: Response) {
    const { pedidoId } = req.validatedParams as PedidoIdParam;
    res.json(await pedidosService.items.listByPedido(pedidoId));
  },

  async getItem(req: Request, res: Response) {
    const { pedidoId, itemId } = req.validatedParams as PedidoItemParams;
    res.json(await pedidosService.items.getById(pedidoId, itemId));
  },

  async createItem(req: Request, res: Response) {
    const { pedidoId } = req.validatedParams as PedidoIdParam;
    const body = req.validatedBody as CreateItem;
    res.status(201).json(
      await pedidosService.items.create(pedidoId, {
        produtoId: body.produtoId,
        quantidade: body.quantidade,
        extras: body.extras as
          | import("@prisma/client").Prisma.InputJsonValue
          | undefined,
        observacao: body.observacao,
      }),
    );
  },

  async updateItem(req: Request, res: Response) {
    const { pedidoId, itemId } = req.validatedParams as PedidoItemParams;
    const body = req.validatedBody as UpdateItem;
    res.json(
      await pedidosService.items.update(pedidoId, itemId, {
        nome: body.nome,
        preco: body.preco,
        quantidade: body.quantidade,
        extras: body.extras as
          | import("@prisma/client").Prisma.InputJsonValue
          | null
          | undefined,
        observacao: body.observacao,
      }),
    );
  },

  async removeItem(req: Request, res: Response) {
    const { pedidoId, itemId } = req.validatedParams as PedidoItemParams;
    await pedidosService.items.remove(pedidoId, itemId);
    res.status(204).send();
  },
};
