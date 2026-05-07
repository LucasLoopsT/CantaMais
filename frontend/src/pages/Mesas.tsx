import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { api } from "../lib/api";
import { getSocket } from "../lib/socket";

type ApiComanda = {
  id: number;
  pessoas: number;
  status: string;
  mesaId: number | null;
  numero: number;
  nome: string;
};

type ApiMesa = {
  id: number;
  numero: number;
  qtClientes: number;
  status: string;
  musicas: number;
  karaokeId: number | null;
  comandas: ApiComanda[];
};

type SelectedItem = {
  id: number;
  nome: string | number;
};

const MESA_STATUS = ["LIVRE", "EM USO", "OCUPADA", "RESERVADA"] as const;

function comandaLabel(c: ApiComanda) {
  const n = c.numero != null ? `nº ${c.numero}` : "sem nº";
  const nm = c.nome?.trim() ? ` · ${c.nome}` : "";
  return `Comanda ${n}${nm}`;
}

export default function Mesas() {
  const [tab, setTab] = useState<"comandas" | "mesas">("comandas");
  const [searchComanda, setSearchComanda] = useState("");
  const [searchMesa, setSearchMesa] = useState("");
  const [comandas, setComandas] = useState<ApiComanda[]>([]);
  const [mesas, setMesas] = useState<ApiMesa[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalSave, setModalSave] = useState<{
    show: boolean;
    type: "comanda" | "mesa" | null;
  }>({ show: false, type: null });
  const [modalMesa, setModalMesa] = useState<ApiMesa | null>(null);
  const [selectedComanda, setSelectedComanda] = useState<number | "">("");
  const [selectedItemSave, setSelectedItemSave] = useState<SelectedItem | null>(
    null,
  );

  const refresh = useCallback(async () => {
    try {
      const [cRes, mRes] = await Promise.all([
        api.get<ApiComanda[]>("/comandas"),
        api.get<ApiMesa[]>("/mesas"),
      ]);
      setComandas(cRes.data);
      setMesas(mRes.data);
    } catch {
      toast.error("Erro ao carregar mesas/comandas");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    const socket = getSocket();

    const handler = () => {
      refresh();
    };

    socket.on("comanda:update", handler);
    socket.on("mesa:update", handler);
    socket.on("karaoke:fila:update", handler);

    return () => {
      socket.off("comanda:update", handler);
      socket.off("mesa:update", handler);
      socket.off("karaoke:fila:update", handler);
    };
  }, [refresh]);

  async function desvincularComandaDaMesa(comandaId: number) {
    try {
      await api.patch(`/comandas/${comandaId}`, { mesaId: null });
      toast.success("Comanda retirada da mesa");
      await refresh();
    } catch {
      toast.error("Não foi possível retirar a comanda da mesa");
    }
  }

  async function vincularComandaNaMesa() {
    if (!modalMesa || selectedComanda === "") return;
    try {
      await api.patch(`/comandas/${selectedComanda}`, {
        mesaId: modalMesa.id,
      });
      toast.success("Comanda vinculada à mesa");
      setSelectedComanda("");
      setModalMesa(null);
      await refresh();
    } catch {
      toast.error("Não foi possível vincular a comanda");
    }
  }

  async function confirmModalSave() {
    try {
      if (modalSave.type === "comanda" && selectedItemSave !== null) {
        const c = comandas.find((x) => x.id === selectedItemSave?.id);
        console.log("Salvando comanda", c);
        if (!c) return;
        await api.patch(`/comandas/${c.id}`, {
          pessoas: c.pessoas,
          status: c.status,
          numero: c.numero,
          nome: c.nome?.trim() ? c.nome.trim() : null,
        });

        toast.success("Comanda atualizada");
      } else if (modalSave.type === "mesa" && selectedItemSave !== null) {
        const m = mesas.find((x) => x.id === selectedItemSave.id);
        if (!m) return;
        await api.patch(`/mesas/${m.id}`, {
          numero: m.numero,
          qtClientes: m.qtClientes,
          status: m.status as (typeof MESA_STATUS)[number],
          musicas: m.musicas,
          musicasDefault: m.musicas,
          karaokeId: m.karaokeId,
        });
        toast.success("Mesa atualizada");
      }
      setModalSave({ show: false, type: null });
      setSelectedItemSave(null);
      await refresh();
    } catch {
      toast.error("Não foi possível salvar");
    }
  }

  const filteredComandas = comandas.filter((c) => {
    const q = searchComanda.trim().toLowerCase();
    if (!q) return true;
    return (
      String(c.id).includes(q) ||
      (c.numero != null && String(c.numero).includes(q)) ||
      (c.nome?.toLowerCase().includes(q) ?? false)
    );
  });

  const filteredMesas = mesas.filter((m) => {
    const q = searchMesa.trim().toLowerCase();
    if (!q) return true;
    return (
      String(m.id).includes(q) ||
      (m.numero != null && String(m.numero).includes(q))
    );
  });

  function comandaPodeSerAnexada(c: ApiComanda, mesa: ApiMesa) {
    if (c.status !== "LIVRE") return false;
    if (mesa.comandas.some((x) => x.id === c.id)) return false;
    if (c.mesaId != null && c.mesaId !== mesa.id) return false;
    return true;
  }

  const comandasDisponiveisParaMesa = (mesa: ApiMesa) =>
    comandas.filter((c) => comandaPodeSerAnexada(c, mesa));

  function getMesa(mesaId: number | null) {
    if (!mesaId) return null;

    const mesa = mesas.find((m) => m.id === mesaId);
    return mesa ? mesa.numero : null;
  }

  function sumClientsInMesa(mesaId: number) {
    return comandas
      .filter((c) => c.mesaId === mesaId)
      .reduce((acc, c) => acc + (c.pessoas ?? 0), 0);
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white sm:text-3xl">
            Mesas e Comandas
          </h1>
          <p className="text-sm text-pink-400 sm:text-base">
            Gerencie comandas vinculando mesas, atualize o status e infos
            gerais.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 sm:gap-4">
          <button
            type="button"
            onClick={() => setTab("comandas")}
            className={`cursor-pointer rounded-lg px-5 py-2 transition hover:opacity-90 ${
              tab === "comandas"
                ? "bg-pink-600 text-white"
                : "bg-purple-4 text-pink-300"
            }`}
          >
            Comandas
          </button>
          <button
            type="button"
            onClick={() => setTab("mesas")}
            className={`cursor-pointer rounded-lg px-5 py-2 transition hover:opacity-90 ${
              tab === "mesas"
                ? "bg-pink-600 text-white"
                : "bg-purple-4 text-pink-300"
            }`}
          >
            Mesas
          </button>
        </div>
      </div>

      {loading && <p className="text-sm text-pink-200/80">Carregando dados…</p>}

      {tab === "comandas" ? (
        <input
          placeholder="Buscar por número ou nome da comanda…"
          value={searchComanda}
          onChange={(e) => setSearchComanda(e.target.value)}
          className="w-full rounded bg-purple-4 p-3 text-white outline-none"
        />
      ) : tab === "mesas" ? (
        <input
          placeholder="Buscar por nome da mesa…"
          value={searchMesa}
          onChange={(e) => setSearchMesa(e.target.value)}
          className="w-full rounded bg-purple-4 p-3 text-white outline-none"
        />
      ) : null}

      {tab === "comandas" && (
        <div className="max-h-[55vh] space-y-4 overflow-y-auto rounded-xl bg-pink-glass sm:max-h-[65vh] pb-2">
          <div className="overflow-x-auto rounded-xl">
            <table className="w-full text-left text-sm text-white">
              <thead className="sticky top-0 z-20 bg-pink-glass-2 text-pink-400 rounded-t-2xl">
                <tr>
                  <th className="p-2 text-center">Comanda</th>
                  <th className="p-2 text-center">Nº mesa</th>
                  <th className="p-2 text-center">Nome</th>
                  <th className="p-2 text-center">Pessoas</th>
                  <th className="p-2 text-center">Status</th>
                  <th className="p-2 text-center">Salvar</th>
                </tr>
              </thead>
              <tbody>
                {filteredComandas.map((c) => (
                  <tr key={c.id} className="border-t border-white/10">
                    <td className="w-1/6 text-center p-2">
                      <p>{c.numero ?? "—"}</p>
                    </td>
                    <td className="w-1/6 text-center p-2">
                      <p>{getMesa(c.mesaId) ?? "—"}</p>
                    </td>
                    <td className="w-1/6 text-center p-2">
                      <input
                        value={c.nome ?? ""}
                        placeholder="—"
                        className="w-full min-w-[5rem] max-w-[8rem] rounded bg-purple-4 px-1 py-1 text-xs"
                        onChange={(e) =>
                          setComandas((prev) =>
                            prev.map((x) =>
                              x.id === c.id
                                ? { ...x, nome: e.target.value }
                                : x,
                            ),
                          )
                        }
                      />
                    </td>
                    <td className="w-1/6 text-center p-2">
                      <input
                        type="number"
                        min={1}
                        value={c.pessoas}
                        className="w-14 rounded bg-purple-4 px-1 py-1"
                        onChange={(e) => {
                          const value = Number(e.target.value);
                          setComandas((prev) =>
                            prev.map((cmd) =>
                              cmd.id === c.id
                                ? {
                                    ...cmd,
                                    pessoas: Number.isFinite(value)
                                      ? value
                                      : cmd.pessoas,
                                  }
                                : cmd,
                            ),
                          );
                        }}
                      />
                    </td>
                    <td className="w-1/6 text-center p-2">
                      <p
                        className={`w-1/2 m-auto rounded px-1 font-bold py-1 text-xs ${c.status === "LIVRE" ? "bg-green-700/25 text-green-400" : "bg-red-900/25 text-red-400"}`}
                      >
                        {c.status}
                      </p>
                    </td>
                    <td className="w-1/6 text-center p-2">
                      <button
                        type="button"
                        onClick={() => {
                          setModalSave({ show: true, type: "comanda" });
                          setSelectedItemSave({ id: c.id, nome: c.numero });
                          console.log("Selected item save", {
                            id: c.id,
                            nome: c.numero,
                          });
                        }}
                        className="rounded bg-pink-600 px-2 py-1 text-xs text-white hover:bg-pink-700"
                      >
                        Salvar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "mesas" && (
        <div className="max-h-[55vh] space-y-4 overflow-y-auto rounded-xl bg-pink-glass sm:max-h-[65vh] pb-2">
          <div className="overflow-x-auto rounded-xl">
            <table className="w-full text-left text-sm text-white">
              <thead className="sticky top-0 z-20 bg-pink-glass-2 text-pink-400">
                <tr>
                  <th className="p-2 text-center">Nº mesa</th>
                  <th className="p-2 text-center">Clientes MAX</th>
                  <th className="p-2 text-center">Clientes Atual</th>
                  <th className="p-2 text-center">Status</th>
                  <th className="p-2 text-center">Músicas</th>
                  <th className="p-2 text-center">Comandas</th>
                  <th className="p-2 text-center">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredMesas.map((mesa) => (
                  <tr key={mesa.id} className="border-t border-white/10">
                    <td className="w-1/7 text-center p-2">
                      <p>{mesa.numero ?? "—"}</p>
                    </td>
                    <td className="w-1/7 text-center p-2">
                      <input
                        type="number"
                        min={0}
                        value={mesa.qtClientes}
                        className="w-14 rounded bg-purple-4 px-1 py-1"
                        onChange={(e) => {
                          const value = Number(e.target.value);

                          setMesas((prev) =>
                            prev.map((m) =>
                              m.id === mesa.id
                                ? {
                                    ...m,
                                    qtClientes: Number.isFinite(value)
                                      ? value
                                      : m.qtClientes,
                                  }
                                : m,
                            ),
                          );
                        }}
                      />
                    </td>
                    <td className="w-1/7 text-center p-2">
                      <p>{sumClientsInMesa(mesa.id) ?? "—"}</p>
                    </td>
                    <td className="w-1/7 text-center p-2">
                      <p
                        className={`min-w-max w-1/2 m-auto rounded px-1 font-bold py-1 text-xs ${mesa.status === "LIVRE" ? "bg-green-700/25 text-green-400" : mesa.status === "EM_USO" ? "bg-yellow-700/25 text-yellow-400" : "bg-red-900/25 text-red-400"}`}
                      >
                        {mesa.status}
                      </p>
                    </td>
                    <td className="w-1/7 text-center p-2">
                      <input
                        type="number"
                        min={0}
                        value={mesa.musicas}
                        className="w-14 rounded bg-purple-4 px-1 py-1"
                        onChange={(e) => {
                          const value = Number(e.target.value);
                          setMesas((prev) =>
                            prev.map((m) =>
                              m.id === mesa.id
                                ? {
                                    ...m,
                                    musicas: Number.isFinite(value)
                                      ? value
                                      : m.musicas,
                                  }
                                : m,
                            ),
                          );
                        }}
                      />
                    </td>
                    <td className="w-1/7 text-center p-2">
                      <div className="flex flex-wrap justify-center gap-1">
                        {mesa.comandas.length === 0 && (
                          <span className="text-xs text-pink-400">—</span>
                        )}
                        {mesa.comandas.map((cmd) => {
                          const full = comandas.find((x) => x.id === cmd.id);
                          const label = full
                            ? comandaLabel(full)
                            : `#${cmd.id}`;
                          return (
                            <span
                              key={cmd.id}
                              className="inline-flex items-center gap-0.5 rounded bg-purple-4 py-0.5 pl-1 pr-0.5 text-xs"
                              title={label}
                            >
                              <span>
                                {full?.numero != null
                                  ? `nº${full.numero}`
                                  : `#${cmd.id}`}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  void desvincularComandaDaMesa(cmd.id)
                                }
                                className="flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded text-pink-300/90 hover:bg-red-950/50 hover:text-red-300"
                                aria-label={`Retirar comanda ${label} desta mesa`}
                                title="Retirar da mesa"
                              >
                                ×
                              </button>
                            </span>
                          );
                        })}
                      </div>
                    </td>
                    <td className="w-1/7 space-y-1 text-center">
                      <button
                        type="button"
                        onClick={() => setModalMesa(mesa)}
                        className="mr-1 rounded bg-pink-600 px-2 py-1 text-xs text-white hover:bg-pink-700"
                      >
                        + Comanda
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setModalSave({ show: true, type: "mesa" });
                          setSelectedItemSave({
                            id: mesa.id,
                            nome: mesa.numero,
                          });
                        }}
                        className="rounded bg-purple-3 px-2 py-1 text-xs text-white hover:bg-purple-2"
                      >
                        Salvar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {modalSave.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md space-y-4 rounded-xl border border-white/10 bg-purple-4/95 p-6 shadow-2xl">
            <h2 className="text-center text-lg font-semibold text-white">
              {modalSave.type === "comanda"
                ? "Salvar comanda?"
                : "Salvar mesa?"}
            </h2>
            <p className="text-center text-sm text-pink-100/80">
              {modalSave.type === "comanda"
                ? `Confirmar alterações na comanda #${selectedItemSave?.nome}?`
                : `Confirmar alterações na mesa #${selectedItemSave?.nome}?`}
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setModalSave({ show: false, type: null });
                  setSelectedItemSave(null);
                }}
                className="flex-1 rounded-lg border border-white/20 py-2 text-white hover:bg-white/10"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => void confirmModalSave()}
                className="flex-1 rounded-lg bg-pink-600 py-2 text-white hover:bg-pink-700"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {modalMesa && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md space-y-4 rounded-xl border border-white/10 bg-purple-4/95 p-6 shadow-2xl">
            <h2 className="text-lg font-semibold text-white">
              Vincular comanda: Mesa #{modalMesa.id}
            </h2>
            <select
              value={selectedComanda === "" ? "" : selectedComanda}
              onChange={(e) => {
                const v = e.target.value;
                setSelectedComanda(v === "" ? "" : Number(v));
              }}
              className="w-full rounded-lg bg-purple-3 p-3 text-white"
            >
              <option value="">Selecione uma comanda ativa</option>
              {comandasDisponiveisParaMesa(modalMesa).map((c) => (
                <option key={c.id} value={c.id}>
                  {comandaLabel(c)} - {c.pessoas} pessoa(s)
                </option>
              ))}
            </select>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setModalMesa(null)}
                className="flex-1 rounded-lg border border-white/20 py-2 text-white hover:bg-white/10"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => void vincularComandaNaMesa()}
                className="flex-1 rounded-lg bg-pink-600 py-2 text-white hover:bg-pink-700"
              >
                Vincular
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
