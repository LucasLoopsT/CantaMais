import { useState } from "react";

type Comanda = {
  id: number;
  pessoas: number;
  status: string;
};

type Mesa = {
  id: number;
  comandas: Comanda[];
  musicas: number;
};

export default function Mesas() {
  const [tab, setTab] = useState<"comandas" | "mesas">("comandas");
  const [search, setSearch] = useState("");
  const [modalSave, setModalSave] = useState<{
    show: boolean;
    type: "comanda" | "mesa" | null;
  }>({ show: false, type: null });
  const [modalMesa, setModalMesa] = useState<Mesa | null>(null);
  const [selectedComanda, setSelectedComanda] = useState<number | "">("");
  const [selectedItemSave, setSelectedItemSave] = useState<number | "">("");

  const [comandas, setComandas] = useState<Comanda[]>([
    { id: 101, pessoas: 2, status: "Ativa" },
    { id: 102, pessoas: 3, status: "Ativa" },
    { id: 103, pessoas: 1, status: "Fechada" },
    { id: 104, pessoas: 4, status: "Ativa" },
    { id: 105, pessoas: 2, status: "Ativa" },
    { id: 106, pessoas: 3, status: "Ativa" },
  ]);

  const [mesas, setMesas] = useState<Mesa[]>([
    { id: 1, musicas: 2, comandas: [comandas[0]] },
    { id: 2, musicas: 2, comandas: [comandas[1]] },
    { id: 3, musicas: 2, comandas: [] },
    { id: 4, musicas: 2, comandas: [] },
    { id: 5, musicas: 2, comandas: [comandas[3]] },
    { id: 6, musicas: 2, comandas: [] },
    { id: 7, musicas: 2, comandas: [] },
    { id: 8, musicas: 2, comandas: [] },
  ]);

  function totalPessoas(mesa: Mesa) {
    return mesa.comandas.reduce((acc, c) => acc + c.pessoas, 0);
  }

  function attachComanda() {
    if (!modalMesa || !selectedComanda) return;

    const comanda = comandas.find((c) => c.id === selectedComanda);

    if (!comanda) return;

    setMesas((prev) =>
      prev.map((m) =>
        m.id === modalMesa.id
          ? { ...m, comandas: [...m.comandas, comanda] }
          : m,
      ),
    );

    setSelectedComanda("");
    setModalMesa(null);
  }

  const filtered = comandas.filter((c) => c.id.toString().includes(search));

  const comandasAtivas = comandas.filter((c) => c.status === "Ativa");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between max-h[20vh]">
        <h1 className="text-3xl text-white font-bold">Controle de Mesas</h1>

        {/* Tabs */}
        <div className="flex gap-4">
          <button
            onClick={() => setTab("comandas")}
            className={`px-5 py-2 rounded-lg cursor-pointer transition hover:opacity-90 ${
              tab === "comandas"
                ? "bg-pink-600 text-white"
                : "bg-purple-4 text-pink-300"
            }`}
          >
            Comandas
          </button>

          <button
            onClick={() => setTab("mesas")}
            className={`px-5 py-2 rounded-lg cursor-pointer transition hover:opacity-90 ${
              tab === "mesas"
                ? "bg-pink-600 text-white"
                : "bg-purple-4 text-pink-300"
            }`}
          >
            Mesas
          </button>
        </div>
      </div>

      {tab === "comandas" && (
        <input
          placeholder="Pesquisar comanda..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full p-3 rounded bg-purple-4 text-white outline-none"
        />
      )}

      {/* THEAD */}
      <div className="text-pink-400 sticky top-0 bg-purple-5 z-10 bg-pink-glass-2 rounded-t-2xl p-4 pr-8 m-0">
        <ul className="flex">
          {tab === "comandas" ? (
            <>
              <li className="w-1/4 text-center font-semibold border-r-4 border-pink-glass-2">
                Comanda
              </li>
              <li className="w-1/4 text-center font-semibold border-r-4 border-pink-glass-2">
                Pessoas
              </li>
              <li className="w-1/4 text-center font-semibold border-r-4 border-pink-glass-2">
                Status
              </li>
              <li className="w-1/4 text-center font-semibold">Salvar</li>
            </>
          ) : (
            <>
              <li className="w-1/6 text-center font-semibold border-r-4 border-pink-glass-2">
                Mesa
              </li>
              <li className="w-1/6 text-center font-semibold border-r-4 border-pink-glass-2">
                Comandas
              </li>
              <li className="w-1/6 text-center font-semibold border-r-4 border-pink-glass-2">
                Pessoas
              </li>
              <li className="w-1/6 text-center font-semibold border-r-4 border-pink-glass-2">
                Músicas
              </li>
              <li className="w-1/6 text-center font-semibold border-r-4 border-pink-glass-2">
                Adicionar
              </li>
              <li className="w-1/6 text-center font-semibold">Salvar</li>
            </>
          )}
        </ul>
      </div>

      {/* COMANDAS */}
      {tab === "comandas" && (
        <div className="bg-pink-glass rounded-b-xl p-4 space-y-4 max-h-[65vh] overflow-y-auto">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <tbody className="text-white">
                {filtered.map((c) => (
                  <tr key={c.id} className="border-t border-purple-3">
                    <td className="w-1/4 text-center py-2">{c.id}</td>

                    <td className="w-1/4 text-center">
                      <input
                        type="number"
                        value={c.pessoas}
                        className="w-16 bg-purple-4 rounded px-2 py-1"
                        onChange={(e) => {
                          const value = Number(e.target.value);

                          setComandas((prev) =>
                            prev.map((cmd) =>
                              cmd.id === c.id
                                ? { ...cmd, pessoas: value }
                                : cmd,
                            ),
                          );
                        }}
                      />
                    </td>

                    <td className="w-1/4 text-center">
                      <select
                        value={c.status}
                        className="bg-purple-4 rounded px-2 py-1"
                        onChange={(e) => {
                          const value = e.target.value;

                          setComandas((prev) =>
                            prev.map((cmd) =>
                              cmd.id === c.id ? { ...cmd, status: value } : cmd,
                            ),
                          );
                        }}
                      >
                        <option>Ativa</option>
                        <option>Fechada</option>
                        <option>Cancelada</option>
                      </select>
                    </td>

                    <td className="w-1/4 text-center">
                      <button
                        onClick={() => {
                          setModalSave({ show: true, type: "comanda" });
                          setSelectedItemSave(c.id);
                        }}
                        className="bg-pink-600 hover:bg-pink-700 transition text-white px-3 py-1 rounded cursor-pointer"
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

      {/* MESAS */}

      {tab === "mesas" && (
        <div className="bg-pink-glass rounded-b-xl p-6 max-h-[75vh] overflow-y-auto">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <tbody className="text-white">
                {mesas.map((mesa) => (
                  <tr key={mesa.id} className="border-t border-purple-3">
                    <td className="w-1/6 text-center py-3 font-semibold">
                      {mesa.id}
                    </td>

                    {/* comandas */}

                    <td className="w-1/6 text-center">
                      <div className="flex flex-wrap gap-2 justify-center">
                        {mesa.comandas.length === 0 && (
                          <span className="text-pink-400 text-sm">
                            Sem comandas
                          </span>
                        )}

                        {mesa.comandas.map((c) => (
                          <span
                            key={c.id}
                            className="bg-purple-4 px-2 py-1 rounded text-xs"
                          >
                            {c.id}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="w-1/6 text-center">{totalPessoas(mesa)}</td>

                    <div className="flex justify-center">
                      <input
                        type="number"
                        value={mesa.musicas}
                        className="w-16 bg-purple-4 rounded px-2 py-1"
                        onChange={(e) => {
                          const value = Number(e.target.value);

                          setMesas((prev) =>
                            prev.map((m) =>
                              m.id === mesa.id ? { ...m, musicas: value } : m,
                            ),
                          );
                        }}
                      />
                    </div>

                    <td className="w-1/6 text-center">
                      <button
                        onClick={() => setModalMesa(mesa)}
                        className="bg-pink-600 hover:bg-pink-700 transition text-white px-3 py-1 rounded cursor-pointer"
                      >
                        + Comanda
                      </button>
                    </td>

                    <td className="w-1/6 text-center">
                      <button
                        onClick={() => {
                          setModalSave({ show: true, type: "mesa" });
                          setSelectedItemSave(mesa.id);
                        }}
                        className="bg-pink-600 hover:bg-pink-700 transition text-white px-3 py-1 rounded cursor-pointer"
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

      {/* MODAL */}

      {modalSave.show == true && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-purple-4 border border-purple-3 rounded-xl p-6 w-[90%] max-w-md space-y-4">
            <h2 className="text-white text-lg font-semibold text-center">
              {modalSave.type === "comanda"
                ? "Salvar Comanda?"
                : "Salvar Mesa?"}
            </h2>
            <p className="text-white text-sm text-center">
              {modalSave.type === "comanda"
                ? `Deseja salvar as alterações da comanda ${selectedItemSave}?`
                : `Deseja salvar as alterações da mesa ${selectedItemSave}?`}
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setModalSave({ show: false, type: null })}
                className="flex-1 border border-white text-white py-2 rounded transition cursor-pointer hover:bg-white/10"
              >
                Cancelar
              </button>

              <button
                onClick={attachComanda}
                className="flex-1 bg-pink-600 hover:bg-pink-700 text-white py-2 rounded cursor-pointer"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {modalMesa && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-purple-4 border border-purple-3 rounded-xl p-6 w-[90%] max-w-md space-y-4">
            <h2 className="text-white text-lg font-semibold">
              Adicionar comanda na mesa {modalMesa.id}
            </h2>

            <select
              value={selectedComanda}
              onChange={(e) => setSelectedComanda(Number(e.target.value))}
              className="w-full p-3 rounded bg-purple-3 text-white"
            >
              <option value="">Selecione uma comanda</option>

              {comandasAtivas.map((c) => (
                <option key={c.id} value={c.id}>
                  Comanda {c.id}
                </option>
              ))}
            </select>

            <div className="flex gap-3">
              <button
                onClick={() => setModalMesa(null)}
                className="flex-1 border border-white text-white py-2 rounded cursor-pointer hover:bg-white/10"
              >
                Cancelar
              </button>

              <button
                onClick={attachComanda}
                className="flex-1 bg-pink-600 hover:bg-pink-700 text-white py-2 rounded cursor-pointer"
              >
                Adicionar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
