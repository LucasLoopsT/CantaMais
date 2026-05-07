import { io, Socket } from "socket.io-client";

declare module "socket.io-client" {
  export interface Socket {
    on(event: string, callback: (...args: any[]) => void): this;
    emit(event: string, ...args: any[]): this;
    disconnect(): void;
  }

  export function io(url: string, opts?: any): Socket;
}

let socket: Socket | null = null;

export function getSocket() {
  if (!socket) {
    socket = io(import.meta.env.VITE_API_URL || "http://localhost:3000", {
      transports: ["websocket"],
    });
  }

  return socket;
}
