import { useState } from "react";
import CustomerShell from "../components/CustomerShell";
import AddMusicModal from "../components/addMusic";
import clave from "../assets/clave.png";
import { FaAngleRight, FaMicrophone } from "react-icons/fa";

export default function Karaoke() {
  const [openModal, setOpenModal] = useState(false);
  const [tableId, setTableId] = useState("");

  const queue = [
    { mesa: "04", musica: "BABY JUSTIN", status: "CANTARAM" },
    { mesa: "07", musica: "O SOL", status: "AGORA" },
    { mesa: "05", musica: "FEITICEIRA", status: "PRÓXIMO!" },
    { mesa: "06", musica: "PLUTÃO", status: "FALTAM 2" },
  ];

  const nextTable = "05";

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
          <img
            src={clave}
            alt=""
            className="pointer-events-none absolute -left-2 top-1/2 w-14 -translate-y-1/2 opacity-30 sm:left-2 sm:w-16"
            aria-hidden
          />
          <div className="ml-12 flex gap-3 sm:ml-16">
            <input
              placeholder="ID da comanda"
              value={tableId}
              onChange={(e) => setTableId(e.target.value)}
              className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white outline-none placeholder:text-pink-200/40 focus:ring-2 focus:ring-pink-500/40 sm:text-base"
            />
            <button
              type="button"
              onClick={() => setOpenModal(true)}
              className="flex shrink-0 cursor-pointer items-center justify-center rounded-xl bg-gradient-to-r from-pink-600 to-pink-500 p-3 text-xl text-white shadow-md shadow-pink-900/30 transition hover:from-pink-500 hover:to-pink-400"
              aria-label="Adicionar música"
            >
              <FaAngleRight />
            </button>
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
              <strong className="text-pink-300">Mesa:</strong> 04
            </p>
            <p>
              <strong className="text-pink-300">Karaokê:</strong> Sala 01
            </p>
            <p>
              <strong className="text-pink-300">Músicas disponíveis:</strong> 1
            </p>
          </div>
        </div>

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
                </tr>
              </thead>

              <tbody className="divide-y divide-white/5 text-sm sm:text-base">
                {queue.map((item, i) => {
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
                      key={i}
                      className={`transition hover:bg-white/5 ${rowBg}`}
                    >
                      <td className="p-4 font-medium">Mesa {item.mesa}</td>
                      <td className="p-4 text-pink-100/90">{item.musica}</td>
                      <td
                        className={`p-4 text-center text-sm font-semibold ${statusColor}`}
                      >
                        {item.status}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setOpenModal(true)}
          className="w-full cursor-pointer rounded-2xl border border-cyan-400/35 bg-gradient-to-r from-cyan-950/60 to-cyan-900/40 py-4 text-base font-bold text-white shadow-lg transition hover:border-cyan-400/50 hover:from-cyan-900/70 sm:text-lg"
        >
          Adicionar música à fila
        </button>
      </div>

      <AddMusicModal open={openModal} setOpen={setOpenModal} />
    </CustomerShell>
  );
}
