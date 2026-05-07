import jwt, { type Secret, type SignOptions } from "jsonwebtoken";

const secret = (): string => {
  const s = process.env.JWT_SECRET;
  if (!s) throw new Error("JWT_SECRET is not set");
  return s;
};

export function signAccessToken(payload: {
  sub: number;
  email: string;
  level: string;
}): string {
  const options: SignOptions = {
    expiresIn: (process.env.JWT_EXPIRES_IN ?? "7d") as NonNullable<SignOptions["expiresIn"]>,
  };
  return jwt.sign(
    { sub: payload.sub, email: payload.email, level: payload.level },
    secret() as Secret,
    options
  );
}
