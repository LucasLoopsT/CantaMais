import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { api } from "../lib/api";
import Field from "../components/Field";
import { FaLink } from "react-icons/fa";
import { IoPerson, IoMusicalNotes } from "react-icons/io5";

type EditMusicModalProps = {
  open: boolean;
  setOpen: (value: boolean) => void;
  musicaId: number | null;
  onEdited?: () => void;
};

export default function EditMusicModal({
  open,
  setOpen,
  musicaId,
  onEdited,
}: EditMusicModalProps) {
  const [music, setMusic] = useState("");
  const [artist, setArtist] = useState("");
  const [link, setLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [canEdit, setCanEdit] = useState(true);

  async function load() {
    try {
      const { data } = await api.get(`/karaoke/pedidos/${musicaId}`);

      setMusic(data.nomeMusica || "");
      setArtist(data.artista || "");
      setLink(data.link || "");

      setCanEdit(data.status === "AGUARDANDO");
    } catch {
      toast.error("Erro ao carregar música");
    }
  }

  useEffect(() => {
    if (!open || !musicaId) return;

    load();
  }, [open, musicaId]);

  useEffect(() => {
    if (!open) {
      setMusic("");
      setArtist("");
      setLink("");
      setCanEdit(true);
    }
  }, [open]);

  if (!open) return null;

  async function updateMusic() {
    if (!music.trim()) {
      toast.error("Digite o nome da música");
      return;
    }

    if (!musicaId) return;

    if (!canEdit) {
      toast.error("Essa música não pode mais ser editada");
      return;
    }

    try {
      setLoading(true);

      await api.patch(`/karaoke/pedidos/${musicaId}/cliente`, {
        nomeMusica: music.trim(),
        artista: artist.trim() || "—",
        link: link.trim() || "https://",
      });

      toast.success("Música atualizada!");

      setOpen(false);
      onEdited?.();
    } catch (error: any) {
      const msg =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        "Não foi possível atualizar";

      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md space-y-4 rounded-2xl border border-white/10 bg-purple-4/95 p-6 shadow-2xl backdrop-blur-md">
        <h2 className="text-xl font-bold text-white">Editar música</h2>

        {!canEdit && (
          <p className="text-sm text-yellow-300">
            Essa música já está em andamento ou foi cantada
          </p>
        )}
        <Field
          label="Música"
          icon={<IoMusicalNotes className="text-lg mr-1 text-pink-300" />}
        >
          <input
            value={music}
            onChange={(e) => setMusic(e.target.value)}
            disabled={!canEdit}
            placeholder="Nome da música"
            className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-white disabled:opacity-50"
          />
        </Field>
        <Field
          label="Artista (opcional)"
          icon={<IoPerson className="text-lg mr-1 text-pink-300" />}
        >
          <input
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
            disabled={!canEdit}
            placeholder="Artista (opcional)"
            className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-white disabled:opacity-50"
          />
        </Field>
        <Field
          label="Link (opcional)"
          icon={<FaLink className="text-lg mr-1 text-pink-300" />}
        >
          <input
            value={link}
            onChange={(e) => setLink(e.target.value)}
            disabled={!canEdit}
            placeholder="Link (opcional)"
            className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-white disabled:opacity-50"
          />
        </Field>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="flex-1 rounded-xl border border-white/15 py-3 text-white hover:bg-white/10 cursor-pointer transition"
          >
            Cancelar
          </button>

          <button
            type="button"
            disabled={loading || !canEdit}
            onClick={() => void updateMusic()}
            className={`flex-1 rounded-xl bg-gradient-to-r from-pink-600 to-pink-500 py-3 text-white disabled:opacity-50 ${!loading ? "cursor-pointer transition hover:from-pink-500 hover:to-pink-400" : ""}`}
          >
            {loading ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
}
