import { z } from "zod";

export const updateAppSettingsBodySchema = z.object({
  taxaKaraokePorPessoa: z.number().nonnegative(),
});
