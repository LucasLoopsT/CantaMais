import bcrypt from "bcryptjs";
import { prisma } from "../../db/prisma";
import { HttpError } from "../../lib/http-error";
import { signAccessToken } from "../../lib/jwt";

function omitPassword<T extends { password: string }>(user: T) {
  const { password: _p, ...rest } = user;
  return rest;
}

export const authService = {
  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new HttpError(401, "Invalid email or password");
    }
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      throw new HttpError(401, "Invalid email or password");
    }
    const token = signAccessToken({
      sub: user.id,
      email: user.email,
      level: user.level,
    });
    return { token, user: omitPassword(user) };
  },

  async register(data: { name: string; email: string; password: string; level: string }) {
    const hash = await bcrypt.hash(data.password, 10);
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hash,
        level: data.level,
      },
    });
    return omitPassword(user);
  },
};
