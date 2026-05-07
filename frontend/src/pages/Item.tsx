import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { NavLink } from "react-router-dom";
import { IoArrowUndo } from "react-icons/io5";
import toast from "react-hot-toast";
import { api } from "../lib/api";
import type { ApiProduto } from "../types/produto";
import { appendCartLine, type CartExtra } from "../lib/cartStorage";

const PLACEHOLDER_IMG =
  "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800";

const EXTRAS_LIMIT = 8;

type ExtrasState = Record<number, number>;

export default function Item() {
  const { id } = useParams();
  const [openRedirectModal, setOpenRedirectModal] = useState(false);
  const [observacao, setObservacao] = useState("");
  const [extras, setExtras] = useState<ExtrasState>({});
  const [produto, setProduto] = useState<ApiProduto | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [openQuantityModal, setOpenQuantityModal] = useState(false);

  const load = useCallback(async () => {
    const pid = Number.parseInt(String(id), 10);
    if (!Number.isFinite(pid)) {
      setNotFound(true);
      setProduto(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setNotFound(false);
    try {
      const { data } = await api.get<ApiProduto>(`/produtos/${pid}`);
      setProduto(data);
      setExtras({});
      setObservacao("");
    } catch {
      setProduto(null);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  const alterarExtra = (extraId: number, valor: number) => {
    setExtras((prev) => {
      const atual = prev[extraId] || 0;
      const novo = Math.max(0, atual + valor);
      const prevTotal = Object.values(prev).reduce((a, b) => a + b, 0);
      if (valor > 0 && prevTotal >= EXTRAS_LIMIT) return prev;
      return { ...prev, [extraId]: novo };
    });
  };

  const img =
    produto?.imagem?.trim() && produto.imagem.length > 0
      ? produto.imagem
      : PLACEHOLDER_IMG;

  const extrasRows =
    produto?.extrasPermitidos?.filter((row) => row.extraProduto.disponivel) ??
    [];

  function adicionarAoPedido() {
    if (!produto?.disponivel) return;

    const cartExtras: CartExtra[] = [];

    for (const row of extrasRows) {
      const ex = row.extraProduto;
      const q = extras[ex.id] || 0;

      if (q > 0) {
        cartExtras.push({
          id: ex.id,
          name: ex.nome,
          price: ex.preco,
          quantity: q,
        });
      }
    }

    const obsTrim = observacao.trim().slice(0, 500);

    appendCartLine({
      lineId: crypto.randomUUID(),
      id: produto.id,
      name: produto.nome,
      price: produto.preco,
      img,
      quantity,
      extras: cartExtras,
      available: produto.disponivel,
      observacao: obsTrim.length > 0 ? obsTrim : null,
    });

    toast.success(`${produto.nome} adicionado ao carrinho!`);

    setOpenQuantityModal(false);
    setOpenRedirectModal(true);

    // reset
    setQuantity(1);
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-pri text-pink-200">
        Carregando…
      </div>
    );
  }

  if (notFound || !produto) {
    return (
      <div className="min-h-screen bg-pri p-8 text-center text-white">
        <p className="mb-6">Produto não encontrado.</p>
        <NavLink
          to="/cardapio"
          className="text-pink-400 underline"
          viewTransition
        >
          Voltar ao cardápio
        </NavLink>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen pb-28 text-white">
      <div className="fixed left-4 top-4 z-50 flex h-16 w-16 items-center justify-center">
        <NavLink
          to="/cardapio"
          viewTransition
          onClick={() => window.scrollTo({ top: 0 })}
          className="cursor-pointer rounded-full bg-white p-3 text-purple-800 shadow transition hover:bg-gray-200"
        >
          <IoArrowUndo className="text-xl" />
        </NavLink>
      </div>

      <div className="h-80 w-full overflow-hidden">
        <img src={img} className="h-full w-full object-cover" alt="" />
      </div>

      <div className="flex flex-col gap-4 p-6">
        <h1 className="text-3xl font-bold">{produto.nome}</h1>
        <p className="text-xl font-semibold text-pink-400">
          R$ {produto.preco.toFixed(2)}
        </p>
        <p className="text-gray-300">{produto.descricao ?? ""}</p>

        {extrasRows.length > 0 && (
          <div className="mt-6 flex flex-col gap-4">
            <h2 className="text-xl font-semibold">Adicionais</h2>
            {extrasRows.map((row) => {
              const ex = row.extraProduto;
              const quantidade = extras[ex.id] || 0;
              const rowTotal = Object.values(extras).reduce((a, b) => a + b, 0);
              return (
                <div
                  key={row.id}
                  className="flex items-center justify-between rounded-xl bg-pink-glass p-4"
                >
                  <div className="cursor-default">
                    <p>{ex.nome}</p>
                    <span className="text-sm text-pink-300">
                      + R$ {ex.preco.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => alterarExtra(ex.id, -1)}
                      disabled={quantidade === 0}
                      className="rounded bg-gray-800 px-3 py-1"
                    >
                      -
                    </button>
                    <span className="cursor-default">{quantidade}</span>
                    <button
                      type="button"
                      onClick={() => alterarExtra(ex.id, 1)}
                      disabled={rowTotal >= EXTRAS_LIMIT}
                      className={`rounded px-3 py-1 ${
                        rowTotal >= EXTRAS_LIMIT
                          ? "cursor-default bg-gray-700"
                          : "cursor-pointer bg-pink-600"
                      }`}
                    >
                      +
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-6 flex flex-col gap-2">
          <label className="text-lg font-semibold">Observações</label>
          <textarea
            value={observacao}
            onChange={(e) => setObservacao(e.target.value)}
            placeholder="Ex: tirar cebola… (vai para a cozinha no item do pedido)"
            className="resize-none rounded-xl bg-pink-glass p-4 text-pink-400 outline-none"
            maxLength={500}
            rows={3}
          />
        </div>
      </div>

      <div className="fixed bottom-0 left-0 w-full border-t-2 border-purple-4 bg-pri p-4">
        <button
          type="button"
          onClick={() => setOpenQuantityModal(true)}
          disabled={!produto.disponivel}
          className={`w-full rounded-xl p-4 text-lg font-semibold transition ${
            produto.disponivel
              ? "cursor-pointer bg-pink-600 hover:bg-pink-800"
              : "cursor-not-allowed bg-gray-700"
          }`}
        >
          {produto.disponivel ? "Adicionar ao Pedido" : "Produto Indisponível"}
        </button>
        {openQuantityModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="m-4 flex w-80 flex-col gap-5 rounded-2xl bg-purple-4 p-6">
              <h2 className="text-center text-xl font-bold text-white">
                Quantidade
              </h2>

              <p className="text-center text-gray-300">
                Quantos itens deseja adicionar?
              </p>

              <div className="flex items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="flex h-12 w-12 items-center justify-center rounded-xl bg-pink-700 text-2xl"
                >
                  -
                </button>

                <span className="min-w-12 text-center text-3xl font-bold text-white">
                  {quantity}
                </span>

                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="flex h-12 w-12 items-center justify-center rounded-xl bg-pink-600 text-2xl"
                >
                  +
                </button>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setOpenQuantityModal(false);
                    setQuantity(1);
                  }}
                  className="flex-1 rounded-xl border border-white/15 py-3 text-white hover:bg-white/10"
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={adicionarAoPedido}
                  className="flex-1 rounded-xl bg-pink-600 py-3 font-semibold text-white hover:bg-pink-700"
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        )}
        {openRedirectModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="m-4 flex w-80 flex-col gap-4 rounded-2xl bg-purple-4 p-6">
              <h2 className="text-center text-xl font-bold text-white">
                Item adicionado!
              </h2>
              <p className="text-center text-gray-300">
                Deseja continuar comprando ou ir para o carrinho?
              </p>
              <div className="flex flex-col gap-3">
                <NavLink
                  to="/cardapio"
                  viewTransition
                  onClick={() => window.scrollTo({ top: 0 })}
                  className="flex-1 cursor-pointer rounded-lg border-2 border-pink-400 bg-pink-glass py-2 text-center text-pink-400 transition hover:border-pink-700 hover:text-pink-700"
                >
                  Continuar
                </NavLink>
                <NavLink
                  to="/carrinho"
                  viewTransition
                  onClick={() => window.scrollTo({ top: 0 })}
                  className="flex-1 cursor-pointer rounded-lg bg-pink-600 py-2 text-center transition hover:bg-pink-700"
                >
                  Ir ao Carrinho
                </NavLink>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
