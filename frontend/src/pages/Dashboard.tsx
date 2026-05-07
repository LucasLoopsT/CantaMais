import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { api } from "../lib/api";

type PedidoApi = {
  id: number;
  mesaId: number;
  comandaId: number;
  status: string;
  createdAt: string;
  items: { nome: string }[];
};

type MesaApi = {
  id: number;
  status: string;
};

type ComandaApi = {
  id: number;
  pessoas: number;
  status: string;
  mesaId: number | null;
};

type KaraokePedidoApi = {
  id: number;
  status: string;
};

function pedidoStatusLabel(s: string) {
  switch (s) {
    case "PREPARANDO":
      return "Preparando";
    case "PRONTO":
      return "Pronto";
    case "ENTREGUE":
      return "Entregue";
    case "CANCELADO":
      return "Cancelado";
    default:
      return s;
  }
}

function pedidoStatusClass(s: string) {
  switch (s) {
    case "PREPARANDO":
      return "text-yellow-400";
    case "PRONTO":
      return "text-green-400";
    case "ENTREGUE":
      return "text-emerald-300";
    case "CANCELADO":
      return "text-gray-400";
    default:
      return "text-pink-200";
  }
}

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export default function Dashboard() {
  const [pedidos, setPedidos] = useState<PedidoApi[]>([]);
  const [mesas, setMesas] = useState<MesaApi[]>([]);
  const [pessoas, setPessoas] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [pRes, mRes, cRes] = await Promise.all([
        api.get<PedidoApi[]>("/pedidos"),
        api.get<MesaApi[]>("/mesas"),
        api.get<ComandaApi[]>("/comandas"),
      ]);
      setPedidos(pRes.data);
      setMesas(mRes.data);
      let totalPessoas = 0;
      cRes.data.forEach((c) => {
        if (c.status !== "LIVRE") {
          totalPessoas += c.pessoas ?? 0;
        }
      });
      setPessoas(totalPessoas);
    } catch {
      toast.error("Erro ao carregar dashboard (login/API)");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const t0 = startOfToday();
  const pedidosHoje = pedidos.filter((p) => new Date(p.createdAt) >= t0).length;
  const mesasOcupadas = mesas.filter(
    (m) => m.status === "OCUPADA" || m.status === "EM_USO",
  ).length;
  const pessoasPresentes = pessoas;

  const ultimosPedidos = [...pedidos]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 6);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white sm:text-3xl">
          Visão Geral
        </h1>
        <p className="text-sm text-pink-400 sm:text-base">
          Acompanhe métricas do sistema
        </p>
      </div>

      {loading && <p className="text-sm text-pink-200/80">Carregando…</p>}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-xl bg-pink-glass p-6">
          <p className="text-sm text-pink-400">Pedidos hoje</p>
          <h2 className="mt-2 text-3xl font-bold text-white">{pedidosHoje}</h2>
        </div>
        <div className="rounded-xl bg-pink-glass p-6">
          <p className="text-sm text-pink-400">Mesas ocupadas</p>
          <h2 className="mt-2 text-3xl font-bold text-white">
            {mesasOcupadas}
          </h2>
        </div>
        <div className="rounded-xl bg-pink-glass p-6">
          <p className="text-sm text-pink-400">Pessoas presentes</p>
          <h2 className="mt-2 text-3xl font-bold text-white">
            {pessoasPresentes}
          </h2>
        </div>
      </div>

      <div className="rounded-xl bg-pink-glass p-6">
        <h2 className="mb-4 font-semibold text-white">Últimos pedidos</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="text-pink-400">
              <tr>
                <th className="pb-2">Mesa</th>
                <th className="pb-2">Itens</th>
                <th className="pb-2">Status</th>
              </tr>
            </thead>
            <tbody className="text-white">
              {ultimosPedidos.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-4 text-pink-200/70">
                    Nenhum pedido registrado.
                  </td>
                </tr>
              ) : (
                ultimosPedidos.map((p) => {
                  const preview =
                    p.items.length === 0
                      ? "—"
                      : p.items.length === 1
                        ? p.items[0].nome
                        : `${p.items.length} itens`;
                  return (
                    <tr key={p.id} className="border-t border-purple-3">
                      <td className="py-2">Mesa {p.mesaId}</td>
                      <td className="max-w-[200px] truncate">{preview}</td>
                      <td
                        className={`font-medium ${pedidoStatusClass(p.status)}`}
                      >
                        {pedidoStatusLabel(p.status)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
