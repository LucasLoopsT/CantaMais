import { useState } from "react";
import CustomerShell from "../components/CustomerShell";
import CartItem from "../components/CartItem";
import { FaCartPlus } from "react-icons/fa";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

const initialCart = [
  {
    id: 1,
    name: "Classic Burger",
    price: 24.9,
    img: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd",
    quantity: 1,
    extras: [
      { id: 1, name: "Batata Frita", price: 8, quantity: 1 },
      { id: 1, name: "Batata Frita", price: 8, quantity: 1 },
      { id: 1, name: "Batata Frita", price: 8, quantity: 1 },
      { id: 1, name: "Batata Frita", price: 8, quantity: 1 },
      { id: 1, name: "Batata Frita", price: 8, quantity: 1 },
    ],
    available: true,
  },
  {
    id: 2,
    name: "Bacon Smash",
    price: 27.9,
    img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR-TxLc_svUBldQYxUXpeDUTs73K9Q27xcaDg&s",
    quantity: 2,
    extras: [],
    available: true,
  },
];

export default function Carrinho() {
  const [cart, setCart] = useState(initialCart);
  const [openModal, setOpenModal] = useState(false);
  const [tableId, setTableId] = useState("");

  const [itemToRemove, setItemToRemove] = useState<{
    id: number;
    name: string;
  } | null>(null);

  function increase(id: number) {
    setCart((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item,
      ),
    );
  }

  function decrease(id: number) {
    setCart((prev) =>
      prev.map((item) =>
        item.id === id && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item,
      ),
    );
  }

  function remove(id: number) {
    setCart((prev) => prev.filter((item) => item.id !== id));
    toast.success("Produto removido do carrinho");
  }

  const total = cart.reduce((acc, item) => {
    const extrasTotal = item.extras.reduce(
      (sum, extra) => sum + extra.price * extra.quantity,
      0,
    );

    return acc + (item.price + extrasTotal) * item.quantity;
  }, 0);

  function confirmOrder() {
    if (!tableId) return toast.error("Digite o ID da comanda");

    console.log("Pedido enviado", {
      tableId,
      items: cart,
    });

    toast.success(`Pedido enviado para a comanda ${tableId}`);

    setCart([]);
    setTableId("");
    setOpenModal(false);
  }

  return (
    <CustomerShell
      title="Carrinho"
      description="Revise e envie para a cozinha"
    >
      <div className="flex min-h-[min(60vh,28rem)] flex-col gap-6">
        {cart.length > 0 ? (
          <>
            <div className="flex-1 space-y-4">
              {cart.map((item) => (
                <CartItem
                  key={item.id}
                  item={item}
                  increase={increase}
                  decrease={decrease}
                  requestRemove={setItemToRemove}
                />
              ))}
            </div>

            <div className="sticky bottom-0 -mx-4 mt-auto border-t border-white/10 bg-purple-4/80 px-4 py-4 backdrop-blur-md sm:-mx-6 sm:px-6">
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
          <div className="w-full max-w-md space-y-4 rounded-2xl border border-white/10 bg-purple-4/95 p-6 shadow-2xl backdrop-blur-md">
            <h2 className="text-lg font-semibold text-white">
              Confirmar pedido
            </h2>
            <p className="text-sm text-pink-100/70">
              Informe o número da sua comanda para enviar o pedido à cozinha.
            </p>
            <input
              placeholder="ID da comanda"
              value={tableId}
              onChange={(e) => setTableId(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-white outline-none ring-pink-500/30 placeholder:text-pink-200/40 focus:ring-2"
            />
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
                  remove(itemToRemove.id);
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
