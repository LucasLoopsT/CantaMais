import { useCallback, useEffect, useState, useRef } from "react";
import toast from "react-hot-toast";
import { api } from "../lib/api";
import { getSocket } from "../lib/socket";

type Extra = {
  name: string;
  price: number;
};

type Item = {
  name: string;
  quantity: number;
  extras: Extra[];
  observacao?: string | null;
};

type Order = {
  id: number;
  mesaNumero: number;
  comandaNumero: number;
  time: string;
  items: Item[];
};

type ApiPedidoItem = {
  id: number;
  nome: string;
  quantidade: number;
  preco: number;
  extras: unknown;
  observacao?: string | null;
};

type ApiPedido = {
  id: number;
  mesaId: number;
  comandaId: number;
  status: string;
  createdAt: string;
  mesa: { numero: number };
  comanda: { numero: number | null };
  items: ApiPedidoItem[];
};

function extrasFromJson(extras: unknown): Extra[] {
  if (extras == null) return [];
  if (Array.isArray(extras)) {
    const first = extras[0];
    if (
      first &&
      typeof first === "object" &&
      !Array.isArray(first) &&
      "extraProdutoId" in first
    ) {
      return (extras as { extraProdutoId: number; quantidade?: number }[]).map(
        (e) => ({
          name: `Extra #${e.extraProdutoId}${e.quantidade != null ? ` (${e.quantidade}x)` : ""}`,
          price: 0,
        }),
      );
    }
    return extras.map(
      (e: {
        name?: string;
        nome?: string;
        price?: number;
        preco?: number;
      }) => ({
        name: e.name ?? e.nome ?? "?",
        price: e.price ?? e.preco ?? 0,
      }),
    );
  }
  if (typeof extras === "object" && extras !== null && "itens" in extras) {
    const it = (extras as { itens: unknown }).itens;
    if (Array.isArray(it)) return extrasFromJson(it);
  }
  return [];
}

function mapPedido(p: ApiPedido): Order {
  return {
    id: p.id,
    mesaNumero: p.mesa.numero,
    comandaNumero: p.comanda.numero ?? p.comandaId,
    time: new Date(p.createdAt).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    items: p.items.map((i) => ({
      name: i.nome,
      quantity: i.quantidade,
      extras: extrasFromJson(i.extras),
      observacao: i.observacao,
    })),
  };
}

export default function Cozinha() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [doneOrders, setDoneOrders] = useState<Order[]>([]);
  const [confirmOrder, setConfirmOrder] = useState<Order | null>(null);
  const [tab, setTab] = useState<"preparar" | "entregues">("preparar");

  const loadPedidos = useCallback(async () => {
    try {
      const { data } = await api.get<ApiPedido[]>("/pedidos");
      const preparar = data
        .filter((p) => p.status === "PREPARANDO")
        .map(mapPedido);
      const entregues = data
        .filter((p) => p.status !== "PREPARANDO")
        .map(mapPedido);
      setOrders(preparar);
      setDoneOrders(entregues);
    } catch {
      toast.error("Erro ao carregar pedidos");
    }
  }, []);

  useEffect(() => {
    void loadPedidos();
  }, []);

  const loadRef = useRef(loadPedidos);

  useEffect(() => {
    const socket = getSocket();

    const handler = () => {
      loadRef.current();
    };

    socket.on("pedido:novo", handler);
    socket.on("pedido:update", handler);
    socket.on("pedido:delete", handler);

    return () => {
      socket.off("pedido:novo", handler);
      socket.off("pedido:update", handler);
      socket.off("pedido:delete", handler);
    };
  }, []);

  async function confirmReady() {
    if (!confirmOrder) return;
    try {
      await api.patch(`/pedidos/${confirmOrder.id}`, { status: "PRONTO" });
      toast.success("Pedido marcado como pronto");
      setConfirmOrder(null);
      await loadPedidos();
    } catch {
      toast.error("Não foi possível atualizar o pedido");
    }
  }

  const list = tab === "preparar" ? orders : doneOrders;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white sm:text-3xl">Cozinha</h1>
          <p className="text-sm text-pink-400 sm:text-base">
            Gerencie os pedidos da cozinha, marque como prontos para entrega.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 sm:gap-4 shrink-0">
          <button
            type="button"
            onClick={() => setTab("preparar")}
            className={`px-4 sm:px-5 py-2 rounded-lg text-sm sm:text-base transition cursor-pointer ${
              tab === "preparar"
                ? "bg-pink-600 text-white hover:bg-pink-800"
                : "bg-purple-4 text-pink-300 hover:bg-purple-3"
            }`}
          >
            Preparar
          </button>
          <button
            type="button"
            onClick={() => setTab("entregues")}
            className={`px-4 sm:px-5 py-2 rounded-lg text-sm sm:text-base transition cursor-pointer ${
              tab === "entregues"
                ? "bg-pink-600 text-white hover:bg-pink-800"
                : "bg-purple-4 text-pink-300 hover:bg-purple-3"
            }`}
          >
            Entregues
          </button>
        </div>
      </div>
      <div className="min-w-0">
        {list.length > 0 && (
          <p className="text-sm sm:text-base text-green-400">
            {list.length} pedidos{" "}
            {tab === "preparar" ? "pendentes" : "finalizados"}
          </p>
        )}
      </div>
      <div
        className={`rounded-xl p-4 sm:p-6 overflow-y-auto h-full max-h-[calc(100dvh-12rem)] sm:max-h-[80vh] ${
          tab === "preparar" ? "bg-pink-glass" : "bg-green-500/10"
        } border`}
      >
        {list.length === 0 && (
          <p
            className={tab === "preparar" ? "text-pink-400" : "text-green-400"}
          >
            {tab === "preparar"
              ? "Nenhum pedido pendente"
              : "Nenhum pedido finalizado"}
          </p>
        )}
        <div className="space-y-4">
          {list.map((order) => (
            <div
              key={order.id}
              className={`border rounded-xl p-4 ${
                tab === "preparar"
                  ? "bg-purple-4 border-purple-3"
                  : "bg-green-900/40 border-green-900"
              }`}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center mb-3">
                <div className="min-w-0">
                  <p className="text-white font-semibold text-sm sm:text-base">
                    Mesa {order.mesaNumero} - Comanda {order.comandaNumero}
                  </p>
                  <p
                    className={`text-xs ${
                      tab === "preparar" ? "text-pink-400" : "text-green-300"
                    }`}
                  >
                    Pedido às {order.time}
                  </p>
                </div>
                {tab === "preparar" && (
                  <button
                    type="button"
                    onClick={() => setConfirmOrder(order)}
                    className="bg-green-600 hover:bg-green-800 cursor-pointer transition text-white px-4 py-2 rounded-lg text-sm shrink-0 self-start sm:self-auto"
                  >
                    Marcar pronto
                  </button>
                )}
              </div>
              <div className="space-y-2">
                {order.items.map((item, index) => (
                  <div
                    key={`${order.id}-${index}`}
                    className="border-t border-purple-3 pt-2"
                  >
                    <p className="text-white">
                      {item.quantity}x {item.name}
                    </p>
                    {item.observacao != null &&
                      String(item.observacao).trim() !== "" && (
                        <p className="mt-1 text-xs italic text-amber-200/90">
                          Obs: {item.observacao}
                        </p>
                      )}
                    {item.extras.length > 0 && (
                      <ul
                        className={`text-xs ${
                          tab === "preparar"
                            ? "text-pink-400"
                            : "text-green-300"
                        } list-disc ml-4`}
                      >
                        {item.extras.map((extra, i) => (
                          <li key={i}>{extra.name}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      {confirmOrder && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-purple-4 border border-purple-3 rounded-xl w-[90%] max-w-md p-6 space-y-4">
            <h2 className="text-white text-lg font-semibold">
              Confirmar pedido pronto
            </h2>
            <div className="text-pink-400 text-sm">
              <p>
                Mesa <b>{confirmOrder.mesaNumero}</b>
              </p>
              <p>
                Comanda <b>{confirmOrder.comandaNumero}</b>
              </p>
            </div>
            <div className="bg-pink-glass rounded-lg p-3 space-y-2 max-h-40 overflow-y-auto">
              {confirmOrder.items.map((item, index) => (
                <div key={index} className="text-white">
                  <p>
                    {item.quantity}x {item.name}
                  </p>
                  {item.observacao != null &&
                    String(item.observacao).trim() !== "" && (
                      <p className="text-xs italic text-amber-200/90">
                        Obs: {item.observacao}
                      </p>
                    )}
                  {item.extras.length > 0 && (
                    <ul className="text-xs text-pink-400 ml-4 list-disc">
                      {item.extras.map((extra, i) => (
                        <li key={i}>{extra.name}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setConfirmOrder(null)}
                className="flex-1 border border-white text-white py-2 rounded-lg transition hover:bg-white/10 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => void confirmReady()}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg cursor-pointer"
              >
                Confirmar pronto
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
