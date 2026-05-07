import { prisma } from "../../db/prisma";

const SETTINGS_ID = 1;

export const appSettingsService = {
  async get() {
    let row = await prisma.appSetting.findUnique({
      where: { id: SETTINGS_ID },
    });
    if (!row) {
      row = await prisma.appSetting.create({
        data: { id: SETTINGS_ID, taxaKaraokePorPessoa: 0 },
      });
    }
    return row;
  },

  async update(data: { taxaKaraokePorPessoa: number }) {
    await this.get();
    return prisma.appSetting.update({
      where: { id: SETTINGS_ID },
      data: { taxaKaraokePorPessoa: data.taxaKaraokePorPessoa },
    });
  },
};
