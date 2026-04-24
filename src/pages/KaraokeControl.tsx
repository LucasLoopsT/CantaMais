import { useState } from "react";

type Musica = {
  id: number;
  ordem: number;
  mesa: number;
  hora: string;
  musica: string;
  artista: string;
  link: string;
  status: "Aguardando" | "Cantando" | "Cantou";
};

export default function KaraokeControl() {
  const [search, setSearch] = useState("");
  const [modalSave, setModalSave] = useState<{
    show: boolean;
    musica: Musica | null;
  }>({ show: false, musica: null });

  const [musicas, setMusicas] = useState<Musica[]>([
    {
      id: 1,
      ordem: 1,
      mesa: 4,
      hora: "20:10",
      musica: "Baby",
      artista: "Justin Bieber",
      link: "https://youtube.com",
      status: "Cantou",
    },
    {
      id: 2,
      ordem: 2,
      mesa: 7,
      hora: "20:15",
      musica: "O Sol",
      artista: "Vitor Kley",
      link: "https://youtube.com",
      status: "Cantando",
    },
    {
      id: 3,
      ordem: 3,
      mesa: 5,
      hora: "20:20",
      musica: "Feiticeira",
      artista: "Claudia Leitte",
      link: "https://youtube.com",
      status: "Aguardando",
    },
    {
      id: 4,
      ordem: 4,
      mesa: 6,
      hora: "20:25",
      musica: "Plutão",
      artista: "Jão",
      link: "https://youtube.com",
      status: "Aguardando",
    },
  ]);

  const filtered = musicas.filter(
    (m) =>
      m.musica.toLowerCase().includes(search.toLowerCase()) ||
      m.artista.toLowerCase().includes(search.toLowerCase()) ||
      m.mesa.toString().includes(search),
  );

  function updateStatus(id: number, status: Musica["status"]) {
    setMusicas((prev) => prev.map((m) => (m.id === id ? { ...m, status } : m)));
  }

  function confirmSave() {
    setModalSave({ show: false, musica: null });
  }

  function getStatusColor(status: string) {
    switch (status) {
      case "Cantando":
        return "text-yellow-400";
      case "Cantou":
        return "text-green-400";
      default:
        return "text-pink-400";
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center gap-3">
        <h1 className="text-2xl sm:text-3xl text-white font-bold">Karaokê</h1>
      </div>

      {/* SEARCH */}
      <input
        placeholder="Pesquisar música, artista ou mesa..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full p-3 text-sm sm:text-base rounded bg-purple-4 text-white outline-none"
      />

      <div className="overflow-x-auto rounded-t-xl -mx-1 px-1 sm:mx-0 sm:px-0">
        {/* THEAD FIXO */}
        <div className="text-pink-400 sticky top-0 bg-pink-glass-2 z-10 rounded-t-xl p-3 sm:p-4 sm:pr-8 min-w-[640px]">
          <ul className="flex text-center font-semibold text-xs sm:text-sm">
            <li className="w-[8%] shrink-0">Ordem</li>
            <li className="w-[8%] shrink-0">Mesa</li>
            <li className="w-[12%] shrink-0">Hora</li>
            <li className="w-[18%] shrink-0 px-0.5">Música</li>
            <li className="w-[18%] shrink-0 px-0.5">Artista</li>
            <li className="w-[12%] shrink-0">Link</li>
            <li className="w-[10%] shrink-0">Status</li>
            <li className="w-[10%] shrink-0">Salvar</li>
          </ul>
        </div>

        {/* BODY */}
        <div className="bg-pink-glass rounded-b-xl p-3 sm:p-4 space-y-0 max-h-[50vh] sm:max-h-[65vh] overflow-y-auto min-w-[640px]">
        {filtered.map((m) => (
          <div
            key={m.id}
            className="flex items-center text-white border-t border-purple-3 py-2 sm:py-3 text-center text-xs sm:text-sm"
          >
            <div className="w-[8%] shrink-0">{m.ordem}</div>
            <div className="w-[8%] shrink-0">{m.mesa}</div>
            <div className="w-[12%] shrink-0">{m.hora}</div>

            <div className="w-[18%] shrink-0 px-0.5 truncate" title={m.musica}>
              {m.musica}
            </div>
            <div className="w-[18%] shrink-0 px-0.5 truncate" title={m.artista}>
              {m.artista}
            </div>

            {/* LINK */}
            <div className="w-[12%] shrink-0">
              <a
                href={m.link}
                target="_blank"
                className="text-blue-400 underline hover:text-blue-300"
              >
                Abrir
              </a>
            </div>

            {/* STATUS EDITÁVEL */}
            <div className="w-[10%] shrink-0 flex justify-center">
              <select
                value={m.status}
                onChange={(e) =>
                  updateStatus(m.id, e.target.value as Musica["status"])
                }
                className={`max-w-full bg-purple-4 rounded px-1 sm:px-2 py-1 text-[10px] sm:text-xs ${getStatusColor(
                  m.status,
                )}`}
              >
                <option>Aguardando</option>
                <option>Cantando</option>
                <option>Cantou</option>
              </select>
            </div>

            {/* SAVE */}
            <div className="w-[10%] shrink-0 flex justify-center">
              <button
                onClick={() => setModalSave({ show: true, musica: m })}
                className="bg-pink-600 hover:bg-pink-700 transition px-2 sm:px-3 py-1 rounded cursor-pointer text-[10px] sm:text-xs whitespace-nowrap"
              >
                Salvar
              </button>
            </div>
          </div>
        ))}
        </div>
      </div>

      {/* MODAL CONFIRMAÇÃO */}
      {modalSave.show && modalSave.musica && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-purple-4 border border-purple-3 rounded-xl p-6 w-[90%] max-w-md space-y-4">
            <h2 className="text-white text-lg font-semibold text-center">
              Confirmar alteração
            </h2>

            <p className="text-white text-center text-sm">
              Deseja atualizar o status da música:
              <br />
              <b>{modalSave.musica.musica}</b> - {modalSave.musica.artista}?
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setModalSave({ show: false, musica: null })}
                className="flex-1 border border-white text-white py-2 rounded hover:bg-white/10 cursor-pointer"
              >
                Cancelar
              </button>

              <button
                onClick={confirmSave}
                className="flex-1 bg-pink-600 hover:bg-pink-700 text-white py-2 rounded cursor-pointer"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
