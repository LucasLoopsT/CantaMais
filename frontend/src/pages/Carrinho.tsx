import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import CustomerShell from "../components/CustomerShell";
import CartItem from "../components/CartItem";
import Field from "../components/Field";
import { FaCartPlus } from "react-icons/fa";
import { BiFoodMenu } from "react-icons/bi";
import { MdTableBar } from "react-icons/md";
import toast from "react-hot-toast";
import { api } from "../lib/api";
import { loadCart, saveCart, type CartLine } from "../lib/cartStorage";

export default function Carrinho() {
  const [cart, setCart] = useState<CartLine[]>(() => loadCart());
  const [openModal, setOpenModal] = useState(false);
  const [comandaNumeroStr, setComandaNumeroStr] = useState("");
  const [mesaNumero, setmesaNumero] = useState<number | null>(null);

  const [itemToRemove, setItemToRemove] = useState<{
    lineId: string;
    name: string;
  } | null>(null);

  useEffect(() => {
    saveCart(cart);
  }, [cart]);

  useEffect(() => {
    const onFocus = () => setCart(loadCart());
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  function increase(lineId: string) {
    setCart((prev) =>
      prev.map((item) =>
        item.lineId === lineId
          ? { ...item, quantity: item.quantity + 1 }
          : item,
      ),
    );
  }

  function decrease(lineId: string) {
    setCart((prev) =>
      prev.map((item) =>
        item.lineId === lineId && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item,
      ),
    );
  }

  function removeLine(lineId: string) {
    setCart((prev) => prev.filter((item) => item.lineId !== lineId));
    toast.success("Produto removido do carrinho");
  }

  const total = cart.reduce((acc, item) => {
    const extrasTotal = item.extras.reduce(
      (sum, extra) => sum + extra.price * extra.quantity,
      0,
    );
    return acc + (item.price + extrasTotal) * item.quantity;
  }, 0);

  async function confirmOrder() {
    if (!comandaNumeroStr.trim()) {
      return toast.error("Digite o número da comanda");
    }

    if (!mesaNumero) {
      return toast.error("Digite o número da mesa");
    }

    const comandaNumero = Number.parseInt(comandaNumeroStr, 10);

    if (!Number.isFinite(comandaNumero) || comandaNumero < 1) {
      return toast.error("Número da comanda inválido");
    }

    try {
      const { data: pedido } = await api.post<{ id: number }>("/pedidos", {
        mesaNumero,
        comandaNumero,
      });

      for (const line of cart) {
        await api.post(`/pedidos/${pedido.id}/items`, {
          produtoId: line.id,
          quantidade: line.quantity,
          extras:
            line.extras.length > 0
              ? line.extras.map((e) => ({
                  extraProdutoId: e.id,
                  quantidade: e.quantity,
                }))
              : undefined,
          observacao: line.observacao?.trim() || null,
        });
      }

      toast.success(`Pedido #${pedido.id} enviado`);

      setCart([]);
      saveCart([]);
      setComandaNumeroStr("");
      setOpenModal(false);
    } catch (err: any) {
      const msg = err?.response?.data?.error;
      toast.error(msg ?? "Erro ao validar comanda");
    }
  }

  return (
    <CustomerShell title="Carrinho" description="Revise e envie para a cozinha">
      <div className="flex min-h-[min(60vh,28rem)] flex-col gap-6">
        {cart.length > 0 ? (
          <>
            <div className="flex-1 space-y-4">
              {cart.map((item) => (
                <CartItem
                  key={item.lineId}
                  item={item}
                  increase={increase}
                  decrease={decrease}
                  requestRemove={setItemToRemove}
                />
              ))}
            </div>

            <div className="sticky bottom-0 -mx-4 mt-auto px-4 py-4 sm:-mx-6 sm:px-6">
              <button
                type="button"
                onClick={() => setOpenModal(true)}
                className="flex w-full cursor-pointer items-center justify-between rounded-2xl bg-gradient-to-r from-pink-600 to-pink-500 px-6 py-4 font-semibold text-white shadow-lg shadow-pink-900/30 transition hover:from-pink-500 hover:to-pink-400"
              >
                <span>Avançar</span>
                <span>R$ {total.toFixed(2)}</span>
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-6 py-12 text-center">
            <div className="rounded-full border border-white/10 bg-pink-glass/50 p-8">
              <FaCartPlus className="text-5xl text-pink-300/80" />
            </div>
            <div className="space-y-2">
              <p className="text-lg text-white/90">Seu carrinho está vazio</p>
              <p className="max-w-sm text-sm text-pink-100/60">
                Explore o cardápio e monte seu pedido para aproveitar na mesa.
              </p>
            </div>
            <Link
              to="/cardapio"
              className="inline-flex items-center justify-center rounded-2xl border border-pink-400/40 bg-pink-glass px-8 py-3 font-medium text-white transition hover:border-pink-400/60 hover:bg-pink-glass-2"
            >
              Ir ao cardápio
            </Link>
          </div>
        )}
      </div>

      {openModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md space-y-4 rounded-2xl border border-white/10 bg-purple-4/95 p-6 shadow-2xl backdrop-blur-md text-center">
            <h2 className="text-lg font-semibold text-white">
              Confirmar pedido
            </h2>
            <p className="text-sm text-pink-100/70">
              Informe os campos abaixo para enviar o pedido.
            </p>
            <Field
              label="Comanda"
              icon={<BiFoodMenu className="text-lg mr-1 text-pink-300" />}
            >
              <input
                type="number"
                min={1}
                placeholder="Número da comanda"
                value={comandaNumeroStr}
                onChange={(e) => setComandaNumeroStr(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-white outline-none ring-pink-500/30 placeholder:text-pink-200/40 focus:ring-2"
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
                value={mesaNumero ?? ""}
                onChange={(e) =>
                  setmesaNumero(parseInt(e.target.value) || null)
                }
                className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-white outline-none ring-pink-500/30 placeholder:text-pink-200/40 focus:ring-2"
              />
            </Field>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setOpenModal(false)}
                className="flex-1 cursor-pointer rounded-xl border border-white/15 py-3 text-white transition hover:bg-white/10"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmOrder}
                className="flex-1 cursor-pointer rounded-xl bg-gradient-to-r from-pink-600 to-pink-500 py-3 font-medium text-white transition hover:from-pink-500 hover:to-pink-400"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
      {itemToRemove && (
        <div className="fixed inset-0 z-[120] flex animate-fadeIn items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm space-y-4 rounded-2xl border border-white/10 bg-purple-4/95 p-6 text-center shadow-2xl backdrop-blur-md">
            <h2 className="text-lg font-semibold text-white">
              Remover produto
            </h2>
            <p className="text-sm text-pink-100/80">
              Deseja remover <b className="text-white">{itemToRemove.name}</b>{" "}
              do carrinho?
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setItemToRemove(null)}
                className="flex-1 cursor-pointer rounded-xl border border-white/15 py-2 text-white transition hover:bg-white/10"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  removeLine(itemToRemove.lineId);
                  setItemToRemove(null);
                }}
                className="flex-1 cursor-pointer rounded-xl bg-red-600 py-2 text-white transition hover:bg-red-700"
              >
                Remover
              </button>
            </div>
          </div>
        </div>
      )}
    </CustomerShell>
  );
}
