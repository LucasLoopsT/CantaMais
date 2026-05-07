import type { Request, Response } from "express";
import { z } from "zod";
import {
  createKaraokePedidoBodySchema,
  createSalaKaraokeBodySchema,
  getSalaBodySchema,
  idParamSchema,
  updateKaraokePedidoBodySchema,
  updateSalaKaraokeBodySchema,
} from "./karaoke.schemas";
import { karaokeService } from "./karaoke.service";

type SalaCreate = z.infer<typeof createSalaKaraokeBodySchema>;
type GetSala = z.infer<typeof getSalaBodySchema>;
type SalaUpdate = z.infer<typeof updateSalaKaraokeBodySchema>;
type KpCreate = z.infer<typeof createKaraokePedidoBodySchema>;
type KpUpdate = z.infer<typeof updateKaraokePedidoBodySchema>;
type IdParam = z.infer<typeof idParamSchema>;

export const karaokeController = {
  async createSala(req: Request, res: Response) {
    const body = req.validatedBody as SalaCreate;
    res.status(201).json(await karaokeService.salas.create(body));
  },

  async listSalas(_req: Request, res: Response) {
    res.json(await karaokeService.salas.list());
  },

  async getSalaById(req: Request, res: Response) {
    const { id } = req.validatedParams as IdParam;
    res.json(await karaokeService.salas.getById(id));
  },

  async getSalaByMesaAndComanda(req: Request, res: Response) {
    const body = req.validatedBody as GetSala;
    res
      .status(201)
      .json(await karaokeService.salas.getSalaByMesaAndComanda(body));
  },

  async updateSala(req: Request, res: Response) {
    const { id } = req.validatedParams as IdParam;
    const body = req.validatedBody as SalaUpdate;
    res.json(await karaokeService.salas.update(id, body));
  },

  async removeSala(req: Request, res: Response) {
    const { id } = req.validatedParams as IdParam;
    await karaokeService.salas.remove(id);
    res.status(204).send();
  },

  async createPedido(req: Request, res: Response) {
    const body = req.validatedBody as KpCreate;
    res.status(201).json(await karaokeService.pedidos.create(body));
  },

  async listPedidos(_req: Request, res: Response) {
    res.json(await karaokeService.pedidos.list());
  },

  async getPedidoById(req: Request, res: Response) {
    const { id } = req.validatedParams as IdParam;
    res.json(await karaokeService.pedidos.getById(id));
  },

  async updatePedido(req: Request, res: Response) {
    const { id } = req.validatedParams as IdParam;
    const body = req.validatedBody as KpUpdate;
    res.json(await karaokeService.pedidos.update(id, body));
  },

  async updatePedidoCliente(req: Request, res: Response) {
    const { id } = req.validatedParams as IdParam;
    const { nomeMusica, artista, link } = req.body;

    const updated = await karaokeService.pedidos.updateCliente(id, {
      nomeMusica,
      artista,
      link,
    });

    res.json(updated);
  },

  async removePedido(req: Request, res: Response) {
    const { id } = req.validatedParams as IdParam;
    await karaokeService.pedidos.remove(id);
    res.status(204).send();
  },

  async limparFila(req: Request, res: Response) {
    const { id } = req.validatedParams as IdParam;
    const salaKaraokeId = Number(id);
    await karaokeService.pedidos.limparFila(salaKaraokeId);

    res.status(204).send();
  },
};
