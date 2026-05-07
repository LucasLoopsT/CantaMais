import cors from "cors";
import express from "express";
import { errorHandler } from "./middleware/error-handler";
import { appSettingsRouter } from "./modules/app-settings/app-settings.routes";
import { comandasRouter } from "./modules/comandas/comandas.routes";
import { karaokeRouter } from "./modules/karaoke/karaoke.routes";
import { mesasRouter } from "./modules/mesas/mesas.routes";
import { pedidosRouter } from "./modules/pedidos/pedidos.routes";
import { produtoExtrasRouter } from "./modules/produto-extras/produto-extras.routes";
import { produtosRouter } from "./modules/produtos/produtos.routes";
import { usersRouter } from "./modules/users/users.routes";

export const app = express();

const corsOrigin =
  !process.env.CORS_ORIGIN || process.env.CORS_ORIGIN === "*"
    ? true
    : process.env.CORS_ORIGIN.split(",").map((s) => s.trim());

app.use(
  cors({
    origin: corsOrigin,
    credentials: true,
  })
);
app.use(express.json());

app.get("/health", (_req, res) => {
  res.send("ok");
});

app.use("/settings", appSettingsRouter);
app.use("/produtos", produtosRouter);
app.use("/produto-extras", produtoExtrasRouter);
app.use("/mesas", mesasRouter);
app.use("/comandas", comandasRouter);
app.use("/pedidos", pedidosRouter);
app.use("/karaoke", karaokeRouter);
app.use("/users", usersRouter);

app.use(errorHandler);
