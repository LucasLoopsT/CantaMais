import type { Request, Response } from "express";
import { z } from "zod";
import { updateAppSettingsBodySchema } from "./app-settings.schemas";
import { appSettingsService } from "./app-settings.service";

type UpdateBody = z.infer<typeof updateAppSettingsBodySchema>;

export const appSettingsController = {
  async get(_req: Request, res: Response) {
    const row = await appSettingsService.get();
    res.json({
      taxaKaraokePorPessoa: row.taxaKaraokePorPessoa,
    });
  },

  async update(req: Request, res: Response) {
    const body = req.validatedBody as UpdateBody;
    const row = await appSettingsService.update(body);
    res.json({
      taxaKaraokePorPessoa: row.taxaKaraokePorPessoa,
    });
  },
};
