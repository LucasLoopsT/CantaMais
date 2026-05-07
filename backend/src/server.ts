import "dotenv/config";
import http from "http";
import { app } from "./app";
import { prisma } from "./db/prisma";
import { initSocket } from "./lib/socket";

const PORT = Number(process.env.PORT) || 3000;

async function bootstrap() {
  await prisma.$connect();

  const httpServer = http.createServer(app);
  initSocket(httpServer);

  httpServer.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
