/// <reference types="vite/client" />
import { useCallback, useEffect, useState } from "react";
import CustomerShell from "../components/CustomerShell";
import AddMusicModal from "../components/addMusic";
import EditMusicModal from "../components/editMusic";
import Field from "../components/Field";
import { RiMusicAiLine } from "react-icons/ri";
import { FaAngleRight, FaMicrophone } from "react-icons/fa";
import { TbEdit } from "react-icons/tb";
import { BiFoodMenu } from "react-icons/bi";
import { MdTableBar } from "react-icons/md";
import toast from "react-hot-toast";
import { api } from "../lib/api";
import { getSocket } from "../lib/socket";

type ApiKaraokePedido = {
  id: number;
  salaKaraokeId: number;
  mesaId: number;
  nomeMusica: string;
  status: string;
  ordem: number;
  round: number;
};

type QueueRow = {
  mesa: string;
  musicaId: number;
  musica: string;
  status: string;
};

function displayStatus(
  row: ApiKaraokePedido,
  sorted: ApiKaraokePedido[],
): string {
  if (row.status === "CANTOU") return "CANTARAM";
  if (row.status === "CANTANDO") return "AGORA";
  if (row.status === "AGUARDANDO") {
    const firstWait = sorted.find((p) => p.status === "AGUARDANDO");
    if (firstWait?.id === row.id) return "PRÓXIMO!";
    const waitList = sorted.filter((p) => p.status === "AGUARDANDO");
    const pos = waitList.findIndex((p) => p.id === row.id);
    if (pos >= 1) return `FALTAM ${pos}`;
  }
  return row.status;
}

export default function Karaoke() {
  const [openModal, setOpenModal] = useState(false);
  const [comandaNumeroInput, setComandaNumeroInput] = useState<number | null>(
    null,
  );
  const [comandaNumero, setComandaNumero] = useState<number | null>(null);
  const [allMesas, setAllMesas] = useState<any>(null);
  const [mesaNumeroInput, setMesaNumeroInput] = useState<number | null>(null);
  const [mesaNumero, setMesaNumero] = useState<number | null>(null);
  const [mesaMusicas, setMesaMusicas] = useState<number | null>(null);
  const [salaId, setSalaId] = useState<number | null>(null);
  const [salaNome, setSalaNome] = useState<string | null>(null);
  const [salaRound, setSalaRound] = useState<number>(1);
  const [editModal, setEditModal] = useState(false);
  const [queue, setQueue] = useState<QueueRow[]>([]);
  const [nextTable, setNextTable] = useState("—");
  const [editMusicId, setEditMusicId] = useState<number | null>(null);

  async function confirmOrder() {
    if (!comandaNumeroInput || comandaNumeroInput < 1) {
      toast.error("Informe o número da comanda");
      return;
    }
    if (!mesaNumeroInput || mesaNumeroInput < 1) {
      toast.error("Informe o número da mesa");
      return;
    }

    try {
      const { data: salaKaraoke } = await api.post<{
        salaKaraoke: { id: number; nome: string; roundAtual: number };
        mesa: { id: number; musicas: number };
      }>("karaoke/salaByMesaComanda", {
        mesaNumero: mesaNumeroInput,
        comandaNumero: comandaNumeroInput,
      });
      setSalaId(salaKaraoke.salaKaraoke.id);
      setSalaNome(salaKaraoke.salaKaraoke.nome);
      setSalaRound(salaKaraoke.salaKaraoke.roundAtual);
      setMesaMusicas(salaKaraoke.mesa.musicas);
      setComandaNumero(comandaNumeroInput);
      setMesaNumero(mesaNumeroInput);
      loadFila(salaKaraoke.salaKaraoke.id);
      toast.success("Comanda confirmada!");
    } catch (err: any) {
      const msg = err?.response?.data?.error;
      toast.error(msg ?? "Erro ao validar comanda");
    }
  }

  const loadFila = useCallback(
    async (salaKaraokeId?: number) => {
      let sid = salaId;
      if (!Number.isFinite(sid)) {
        if (salaKaraokeId) {
          sid = salaKaraokeId;
        } else {
          return;
        }
      }
      try {
        const { data } = await api.get<ApiKaraokePedido[]>("/karaoke/pedidos");
        const filtered = data.filter((p) => p.salaKaraokeId === sid);
        const sorted = [...filtered].sort((a, b) => a.ordem - b.ordem);
        setQueue(
          sorted.map((p) => ({
            mesa: String(p.mesaId).padStart(2, "0"),
            musica: p.nomeMusica,
            status: displayStatus(p, sorted),
            musicaId: p.id,
          })),
        );
        const singing = sorted.find((p) => p.status === "CANTANDO");
        const firstWait = sorted.find((p) => p.status === "AGUARDANDO");
        const next = singing ?? firstWait;
        api.get(`/mesas/${next?.mesaId}`).then(({ data }) => {
          setNextTable(next ? String(data.numero).padStart(2, "0") : "—");
        });
      } catch {
        setQueue([]);
        setNextTable("—");
      }
    },
    [salaId],
  );

  const loadMesa = useCallback(async () => {
    if (!mesaNumero || !comandaNumero) return;
    try {
      const { data } = await api.post<{
        salaKaraoke: { id: number; nome: string };
        mesa: { id: number; musicas: number };
      }>("/karaoke/salaByMesaComanda", {
        mesaNumero,
        comandaNumero,
      });

      setMesaMusicas(data.mesa.musicas);
    } catch {
      // silencioso
    }
  }, [mesaNumero, comandaNumero]);

  async function loadAllMesas() {
    try {
      const { data } = await api.get(`/mesas`);
      setAllMesas(data);
    } catch {
      return console.error("Erro ao carregar mesas");
    }
  }

  useEffect(() => {
    const socket = getSocket();

    socket.on("karaoke:fila:update", () => {
      loadFila();
      loadMesa();
    });

    socket.on("mesa:update", () => {
      loadFila();
      loadMesa();
      loadAllMesas();
    });

    socket.on("karaoke:round:update", (data) => {
      if (data?.salaId === salaId) {
        setSalaRound(data.roundAtual);

        loadFila();
        loadMesa();

        toast(`Nova rodada iniciada: ${data.roundAtual}!`);
      }
    });

    return () => {
      socket.off("karaoke:fila:update");
      socket.off("mesa:update");
      socket.off("karaoke:round:update");
    };
  }, [loadFila, loadMesa, salaId]);

  useEffect(() => {
    void loadAllMesas();
  }, []);

  function decodeMesaNumero(mesaId): number | null {
    let result = null;
    allMesas.map((m) => {
      if (m.id === Number(mesaId)) {
        result = m.numero;
      }
    });
    return result;
  }

  function openEditModal(musicId: number) {
    setEditMusicId(musicId);
    setEditModal(true);
  }

  return (
    <CustomerShell
      title="Karaokê"
      description="Fila ao vivo e pedido de músicas"
    >
      <div className="space-y-8 pb-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-fuchsia-500/30 bg-fuchsia-950/20 px-3 py-1 text-xs font-medium text-fuchsia-200 sm:text-sm">
          <FaMicrophone className="text-fuchsia-300" aria-hidden />
          Use sua comanda para entrar na fila
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-purple-4/50 p-3 shadow-lg backdrop-blur-sm sm:p-4">
          <RiMusicAiLine
            className="absolute -left-2 top-1/2 w-16 -translate-y-1/2 opacity-30 sm:left-2 text-5xl"
            aria-hidden
          />
          <div className="ml-12 flex flex-col gap-2 sm:ml-16">
            <div className="flex gap-3">
              <Field
                label="Comanda"
                icon={<BiFoodMenu className="text-lg mr-1 text-pink-300" />}
              >
                <input
                  type="number"
                  min={1}
                  placeholder="Número da comanda"
                  value={comandaNumeroInput ?? ""}
                  onChange={(e) =>
                    setComandaNumeroInput(parseInt(e.target.value) || null)
                  }
                  className="min-w-0 w-full flex-1 rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white outline-none placeholder:text-pink-200/40 focus:ring-2 focus:ring-pink-500/40 sm:text-base"
                />
              </Field>
              <Field
                label="Mesa"
                icon={<MdTableBar className="text-lg mr-1 text-pink-300" />}
              >
                <input
                  type="number"
                  min={1}
                  placeholder="Número da Mesa"
                  value={mesaNumeroInput ?? ""}
                  onChange={(e) =>
                    setMesaNumeroInput(parseInt(e.target.value) || null)
                  }
                  className="min-w-0 w-full flex-1 rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white outline-none placeholder:text-pink-200/40 focus:ring-2 focus:ring-pink-500/40 sm:text-base"
                />
              </Field>
              <button
                type="button"
                onClick={confirmOrder}
                className="flex shrink-0 cursor-pointer items-center justify-center rounded-xl bg-gradient-to-r from-pink-600 to-pink-500 p-3 text-xl text-white shadow-md shadow-pink-900/30 transition hover:from-pink-500 hover:to-pink-400"
                aria-label="Adicionar música"
              >
                <FaAngleRight />
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 rounded-2xl border border-cyan-400/25 bg-gradient-to-br from-cyan-950/40 to-purple-4/30 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <h2 className="text-xl font-bold leading-tight text-white sm:text-2xl">
            Próxima mesa
            <br />
            <span className="text-pink-200/90">a cantar</span>
          </h2>
          <div className="flex items-center justify-center rounded-2xl border border-cyan-400/40 bg-cyan-950/50 px-8 py-5 text-4xl font-bold tabular-nums text-white shadow-inner sm:text-5xl">
            {nextTable}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-pink-glass/80 to-purple-4/40 p-5 sm:p-6">
          <h3 className="mb-4 text-lg font-bold text-pink-200 sm:text-xl">
            Suas infos
          </h3>
          <div className="flex flex-col gap-2 text-sm text-white sm:text-base">
            <p>
              <strong className="text-pink-300">Comanda:</strong>{" "}
              {comandaNumero || "—"}
            </p>
            <p>
              <strong className="text-pink-300">Mesa:</strong>{" "}
              {mesaNumero || "—"}
            </p>
            <p>
              <strong className="text-pink-300">Karaokê: </strong>
              {salaNome || "—"}
            </p>
            <p>
              <strong className="text-pink-300">Rodada: </strong>
              {salaRound || "—"}
            </p>
            <p>
              <strong className="text-pink-300">Créditos Músicas: </strong>
              {mesaMusicas || "—"}
            </p>
          </div>
        </div>

        {salaId && mesaNumero && comandaNumero && (
          <>
            <div className="rounded-2xl border border-white/10 bg-purple-4/40 p-5 shadow-lg backdrop-blur-sm sm:p-6">
              <h3 className="mb-4 text-lg font-bold text-fuchsia-200 sm:text-xl">
                Fila atual
              </h3>

              <div className="overflow-x-auto rounded-xl border border-white/5">
                <table className="min-w-[500px] w-full text-left text-white">
                  <thead className="border-b border-white/10 bg-purple-2/80 text-xs uppercase tracking-wide text-pink-200/90">
                    <tr>
                      <th className="p-4">Mesa</th>
                      <th className="p-4">Música</th>
                      <th className="p-4 text-center">Status</th>
                      <th className="py-4 px-1 text-center">Editar</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-white/5 text-sm sm:text-base">
                    {queue.length === 0 ? (
                      <tr>
                        <td
                          colSpan={3}
                          className="p-4 text-center text-pink-200/70"
                        >
                          0 músicas na fila.
                        </td>
                      </tr>
                    ) : (
                      queue.map((item, i) => {
                        const statusColor =
                          item.status === "AGORA"
                            ? "text-green-400"
                            : item.status === "PRÓXIMO!"
                              ? "text-yellow-400"
                              : item.status === "CANTARAM"
                                ? "text-gray-400"
                                : "text-purple-300";

                        const rowBg =
                          item.status === "AGORA"
                            ? "bg-green-950/25"
                            : item.status === "PRÓXIMO!"
                              ? "bg-yellow-950/20"
                              : "bg-transparent";

                        return (
                          <tr
                            key={`${item.mesa}-${item.musica}-${i}`}
                            className={`transition hover:bg-white/5 ${rowBg}`}
                          >
                            <td className="p-4 font-medium">
                              Mesa {decodeMesaNumero(item.mesa)}
                            </td>
                            <td className="p-4 text-pink-100/90">
                              {item.musica}
                            </td>
                            <td
                              className={`p-4 text-center text-sm font-semibold ${statusColor}`}
                            >
                              {item.status}
                            </td>
                            <td
                              className={`p-4 text-center text-sm font-semibold ${statusColor}`}
                            >
                              {decodeMesaNumero(item.mesa) != mesaNumero ||
                              item.status == "CANTARAM" ||
                              item.status == "AGORA" ||
                              item.status == "PRÓXIMO!" ? (
                                "-"
                              ) : (
                                <TbEdit
                                  onClick={() => openEditModal(item.musicaId)}
                                  className="cursor-pointer text-lg m-auto"
                                />
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                if (!comandaNumero || comandaNumero < 1) {
                  toast.error("Informe o número da comanda");
                  return;
                }
                if (!mesaNumero || mesaNumero < 1) {
                  toast.error("Selecione a mesa");
                  return;
                }
                setOpenModal(true);
              }}
              className="w-full cursor-pointer rounded-2xl border border-cyan-400/35 bg-gradient-to-r from-cyan-950/60 to-cyan-900/40 py-4 text-base font-bold text-white shadow-lg transition hover:border-cyan-400/50 hover:from-cyan-900/70 sm:text-lg"
            >
              Adicionar música à fila
            </button>
          </>
        )}
      </div>
      {salaId && mesaNumero && comandaNumero && (
        <AddMusicModal
          open={openModal}
          setOpen={setOpenModal}
          salaKaraokeId={salaId}
          mesaNumero={mesaNumero}
          comandaNumero={comandaNumero}
          onAdded={() => void loadFila()}
        />
      )}
      {editModal && (
        <EditMusicModal
          open={editModal}
          setOpen={setEditModal}
          musicaId={editMusicId}
          onEdited={() => void loadFila()}
        />
      )}
    </CustomerShell>
  );
}
