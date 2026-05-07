import type { Server as HttpServer } from "http";
import { Server } from "socket.io";

let io: Server | null = null;

function parseCorsOrigin(): string | string[] | boolean {
  const raw = process.env.CORS_ORIGIN;
  if (!raw || raw === "*") return true;
  const parts = raw.split(",").map((s) => s.trim()).filter(Boolean);
  if (parts.length === 0) return true;
  if (parts.length === 1) return parts[0]!;
  return parts;
}

export function initSocket(httpServer: HttpServer): Server {
  const origin = parseCorsOrigin();
  io = new Server(httpServer, {
    cors: {
      origin,
      methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
    },
  });
  return io;
}

export function getIO(): Server | null {
  return io;
}
