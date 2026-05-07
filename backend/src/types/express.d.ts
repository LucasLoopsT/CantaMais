declare global {
  namespace Express {
    interface Request {
      auth?: { sub: number; email?: string; level?: string };
      validatedBody?: unknown;
      validatedParams?: unknown;
      validatedQuery?: unknown;
    }
  }
}

export {};
