import bcrypt from "bcryptjs";
import { prisma } from "../../db/prisma";
import { HttpError } from "../../lib/http-error";

function omitPassword<T extends { password: string }>(user: T) {
  const { password: _p, ...rest } = user;
  return rest;
}

export const usersService = {
  async list() {
    const rows = await prisma.user.findMany({ orderBy: { id: "asc" } });
    return rows.map(omitPassword);
  },

  async getById(id: number) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new HttpError(404, "User not found");
    return omitPassword(user);
  },

  async update(
    id: number,
    data: { name?: string; email?: string; password?: string; level?: string }
  ) {
    const exists = await prisma.user.findUnique({ where: { id } });
    if (!exists) throw new HttpError(404, "User not found");
    const updateData: {
      name?: string;
      email?: string;
      level?: string;
      password?: string;
    } = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.level !== undefined) updateData.level = data.level;
    if (data.password !== undefined) updateData.password = await bcrypt.hash(data.password, 10);
    const user = await prisma.user.update({ where: { id }, data: updateData });
    return omitPassword(user);
  },

  async remove(id: number) {
    try {
      await prisma.user.delete({ where: { id } });
    } catch {
      throw new HttpError(404, "User not found");
    }
  },
};
