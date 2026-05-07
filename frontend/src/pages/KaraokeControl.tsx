/// <reference types="vite/client" />
import { use, useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { api } from "../lib/api";
import { getSocket } from "../lib/socket";

type Musica = {
  id: number;
  ordem: number;
  mesa: number;
  salaKaraokeId: number;
  hora: string;
  musica: string;
  artista: string;
  link: string;
  status: "Aguardando" | "Cantando" | "Cantou";
};

type ApiKaraokePedido = {
  id: number;
  ordem: number;
  mesa: any;
  mesaId: number;
  salaKaraokeId: number;
  nomeMusica: string;
  artista: string;
  link: string;
  status: string;
  createdAt: string;
};

type SalaKaraoke = { id: number; nome: string };

const KARAOKE_STATUS = ["Aguardando", "Cantando", "Cantou"] as const;

function apiToLabel(s: string): Musica["status"] {
  if (s === "CANTANDO") return "Cantando";
  if (s === "CANTOU") return "Cantou";
  return "Aguardando";
}

function labelToApi(s: Musica["status"]): string {
  if (s === "Cantando") return "CANTANDO";
  if (s === "Cantou") return "CANTOU";
  return "AGUARDANDO";
}

function mapApi(p: ApiKaraokePedido): Musica {
  return {
    id: p.id,
    ordem: p.ordem,
    mesa: p.mesa.numero,
    salaKaraokeId: p.salaKaraokeId,
    hora: new Date(p.createdAt).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    musica: p.nomeMusica,
    artista: p.artista,
    link: p.link,
    status: apiToLabel(p.status),
  };
}

export default function KaraokeControl() {
  const [search, setSearch] = useState("");
  const [modalSave, setModalSave] = useState<{
    show: boolean;
    musica: Musica | null;
  }>({ show: false, musica: null });

  const [musicas, setMusicas] = useState<Musica[]>([]);
  const [salas, setSalas] = useState<SalaKaraoke[]>([]);
  const [salaSelected, setSalaSelected] = useState<number | null>(null);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const load = useCallback(async () => {
    try {
      const { data } = await api.get<ApiKaraokePedido[]>("/karaoke/pedidos");
      const sorted = [...data].sort((a, b) => a.ordem - b.ordem);
      setMusicas(sorted.map(mapApi));
    } catch {
      toast.error("Erro ao carregar fila");
    }
  }, []);

  useEffect(() => {
    const socket = getSocket();

    socket.on("karaoke:fila:update", () => load());

    return () => {
      socket.off("karaoke:fila:update");
    };
  }, [load]);

  useEffect(() => {
    async function loadSalas() {
      try {
        const { data } = await api.get<SalaKaraoke[]>("/karaoke/salas");
        setSalas(data);
      } catch {
        toast.error("Erro ao carregar salas");
      }
    }

    loadSalas();
  }, []);

  useEffect(() => {
    if (salaSelected) {
      load();
    } else {
      setMusicas([]);
    }
  }, [salaSelected]);

  const filtered = musicas.filter((m) => {
    const matchSearch =
      m.musica.toLowerCase().includes(search.toLowerCase()) ||
      m.artista.toLowerCase().includes(search.toLowerCase()) ||
      m.mesa.toString().includes(search);

    const matchSala = !salaSelected || m.salaKaraokeId === salaSelected;

    return matchSearch && matchSala;
  });
  function updateStatus(id: number, status: Musica["status"]) {
    setMusicas((prev) => prev.map((m) => (m.id === id ? { ...m, status } : m)));
  }

  async function deleteFila() {
    try {
      setDeleteLoading(true);
      await api.delete(`/karaoke/pedidos/limparSala/${Number(salaSelected)}`);
      toast.success("Fila limpa com sucesso");
      await load();
    } catch (error: any) {
      const msg = error?.response?.data?.error || "Erro ao limpar fila";
      toast.error(msg);
    } finally {
      setDeleteModal(false);
      setDeleteLoading(false);
    }
  }

  async function confirmSave() {
    const m = modalSave.musica;
    if (!m) return;
    try {
      await api.patch(`/karaoke/pedidos/${m.id}`, {
        status: labelToApi(m.status),
      });
      toast.success("Status atualizado");
      setModalSave({ show: false, musica: null });
      await load();
    } catch {
      toast.error("Não foi possível salvar");
    }
  }

  function getStatusColor(status: string) {
    switch (status) {
      case "Cantando":
        return "!bg-yellow-900/50";
      case "Cantou":
        return "!bg-green-900/50";
      default:
        return "!bg-pink-900/50";
    }
  }

  function isValidYoutubeLink(url: string) {
    if (!url) return false;

    try {
      const parsed = new URL(url);
      return (
        parsed.hostname.includes("youtube.com") ||
        parsed.hostname.includes("youtu.be")
      );
    } catch {
      return false;
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="w-full flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white sm:text-3xl">Karaokê</h1>
          <p className="text-sm text-pink-400 sm:text-base">
            Gerencie os pedidos de músicas nas filas do Karaokê!
          </p>
        </div>
        {salaSelected && filtered.length > 0 && (
          <button
            onClick={() => setDeleteModal(true)}
            className="bg-red-600 hover:bg-red-700 transition px-4 py-2 rounded-lg text-white text-sm"
          >
            Limpar fila
          </button>
        )}
      </div>
      <select
        onChange={(e) =>
          setSalaSelected(e.target.value ? Number(e.target.value) : null)
        }
        className="w-full rounded-lg border border-white/10 bg-purple-4 px-3 py-2 text-white outline-none ring-pink-500/20 focus:ring-2"
      >
        <option value="">Selecionar Sala</option>
        {salas.map((sala) => (
          <option key={sala.id} value={sala.id}>
            {sala.nome}
          </option>
        ))}
      </select>
      <input
        placeholder="Pesquisar música, artista ou mesa..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full p-3 text-sm sm:text-base rounded bg-purple-4 text-white outline-none"
      />
      <div className="max-h-[55vh] space-y-4 overflow-y-auto rounded-xl bg-pink-glass sm:max-h-[65vh] pb-2">
        <div className="overflow-x-auto rounded-xl">
          <table className="w-full text-left text-sm text-white">
            <thead className="sticky top-0 z-20 bg-pink-glass-2 text-pink-400 rounded-t-2xl">
              <tr>
                <th className="p-2 text-center">Ordem</th>
                <th className="p-2 text-center">Mesa</th>
                <th className="p-2 text-center">Hora</th>
                <th className="p-2 text-center">Música</th>
                <th className="p-2 text-center">Artista</th>
                <th className="p-2 text-center">Link</th>
                <th className="p-2 text-center">Status</th>
                <th className="p-2 text-center">Salvar</th>
              </tr>
            </thead>

            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={9}
                    className="text-center text-white/50 py-6 italic text-sm"
                  >
                    Nenhuma música encontrada
                  </td>
                </tr>
              )}
              {filtered.map((m) => (
                <tr key={m.id} className="border-t border-white/10">
                  <th className="w-1/8 text-center p-2">{m.ordem}</th>
                  <th className="w-1/8 text-center p-2">{m.mesa}</th>
                  <th className="w-1/8 text-center p-2">{m.hora}</th>
                  <th className="w-1/8 text-center p-2">{m.musica}</th>
                  <th className="w-1/8 text-center p-2" title={m.artista}>
                    {m.artista}
                  </th>
                  <th className="w-1/8 text-center p-2">
                    {isValidYoutubeLink(m.link) ? (
                      <a
                        href={m.link}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2 py-1 rounded bg-green-500/20 text-green-400 hover:bg-green-500/30 transition text-[10px] sm:text-xs"
                      >
                        Abrir
                      </a>
                    ) : (
                      <span className="px-2 py-1 rounded bg-white/5 text-white/40 text-[10px] sm:text-xs">
                        Sem link
                      </span>
                    )}
                  </th>

                  <th className="w-1/8 text-center p-2">
                    <select
                      value={m.status}
                      onChange={(e) =>
                        updateStatus(m.id, e.target.value as Musica["status"])
                      }
                      className={`bg-purple-4 border border-white/10 rounded-lg px-2 py-1 text-[10px] sm:text-xs outline-none cursor-pointer transition hover:border-pink-400 appearance-none ${getStatusColor(m.status)}`}
                    >
                      {KARAOKE_STATUS.map((s) => (
                        <option
                          key={s}
                          value={s}
                          className="text-gray-800 font-medium"
                        >
                          {s}
                        </option>
                      ))}
                    </select>
                  </th>

                  <th className="w-1/8 text-center p-2">
                    <button
                      type="button"
                      onClick={() => setModalSave({ show: true, musica: m })}
                      className="bg-pink-600 hover:bg-pink-700 transition px-2 sm:px-3 py-1 rounded cursor-pointer text-[10px] sm:text-xs whitespace-nowrap"
                    >
                      Salvar
                    </button>
                  </th>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {modalSave.show && modalSave.musica && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-purple-4 border border-purple-3 rounded-xl p-6 w-[90%] max-w-md space-y-4">
            <h2 className="text-white text-lg font-semibold text-center">
              Confirmar alteração
            </h2>

            <p className="text-white text-center text-sm">
              Deseja atualizar o status da música:
              <br />
              {modalSave.musica.musica}?
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setModalSave({ show: false, musica: null })}
                className="flex-1 border border-white text-white py-2 rounded hover:bg-white/10 cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={() => void confirmSave()}
                className="flex-1 bg-pink-600 hover:bg-pink-700 text-white py-2 rounded cursor-pointer"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md space-y-4 rounded-2xl border border-white/10 bg-purple-4/95 p-6 shadow-2xl backdrop-blur-md">
            <h2 className="text-lg font-semibold text-white">
              Confirmar exclusão
            </h2>
            <p className="text-sm text-pink-100/80">
              Ao confirmar, toda a fila será excluída permanentemente.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setDeleteModal(false)}
                className="flex-1 cursor-pointer rounded-xl border border-white/15 py-3 text-white transition hover:bg-white/10 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={deleteFila}
                className="flex-1 cursor-pointer rounded-xl bg-red-600 py-3 font-medium text-white transition hover:bg-red-700 disabled:opacity-50"
              >
                {deleteLoading ? "Excluindo…" : "Excluir"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
