import { useState } from "react";
import {
  FaPlus,
  FaTrash,
  FaMinus,
  FaAngleDown,
  FaAngleUp,
} from "react-icons/fa";
import type { CartLine } from "../lib/cartStorage";

type Props = {
  item: CartLine;
  increase: (lineId: string) => void;
  decrease: (lineId: string) => void;
  requestRemove: (p: { lineId: string; name: string }) => void;
};

export default function CartItem({
  item,
  increase,
  decrease,
  requestRemove,
}: Props) {
  const [showDetails, setShowDetails] = useState(false);

  const extrasTotal = item.extras.reduce(
    (acc, extra) => acc + extra.price * (extra.quantity || 1),
    0,
  );
  const totalItem = (item.price + extrasTotal) * item.quantity;

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 shadow-md">
      <div className="flex items-center gap-4 bg-pink-glass/80 p-4 backdrop-blur-sm">
        <img
          src={item.img}
          className="h-20 w-20 rounded-xl object-cover ring-1 ring-white/10"
          alt=""
        />
        <div className="flex flex-1 flex-col justify-between">
          <div>
            <p className="font-medium text-white">
              {item.quantity}x {item.name}
            </p>
            <p className="font-semibold text-pink-400">
              R$ {totalItem.toFixed(2)}
            </p>
          </div>
          <div className="flex items-center gap-3 text-white">
            {item.quantity > 1 ? (
              <button
                type="button"
                onClick={() => decrease(item.lineId)}
                className="cursor-pointer rounded border border-white/15 p-2 transition hover:bg-pink-glass"
              >
                <FaMinus />
              </button>
            ) : (
              <button
                type="button"
                onClick={() =>
                  requestRemove({ lineId: item.lineId, name: item.name })
                }
                className="cursor-pointer rounded border border-white/15 p-2 transition hover:border-red-500/40 hover:text-red-400"
              >
                <FaTrash />
              </button>
            )}
            <span>{item.quantity}</span>
            <button
              type="button"
              onClick={() => increase(item.lineId)}
              className="cursor-pointer rounded border border-white/15 p-2 text-pink-400 transition hover:bg-pink-glass"
            >
              <FaPlus />
            </button>
          </div>
        </div>
      </div>
      {showDetails && (
        <div className="border-t border-white/10 bg-pink-glass-2/80 text-sm text-pink-300">
          {item.observacao != null &&
            String(item.observacao).trim() !== "" && (
              <p className="border-b border-white/10 px-4 py-2 text-xs text-amber-200/90">
                Obs: {item.observacao}
              </p>
            )}
          {item.extras.length > 0 ? (
            <div className="p-4">
              <p className="mb-2 font-semibold">Extras:</p>
              <ul className="list-inside list-disc">
                {item.extras.map((extra, index) => (
                  <li key={index}>
                    {extra.quantity}x {extra.name} — R${" "}
                    {(extra.price * extra.quantity).toFixed(2)}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="p-4">Nenhum extra selecionado.</p>
          )}
        </div>
      )}
      <div className="border-t border-white/10 bg-pink-glass-2/60 text-sm text-pink-300">
        <button
          type="button"
          className="flex w-full cursor-pointer items-center justify-center gap-1 py-2 text-sm text-pink-300 transition hover:text-pink-100"
          onClick={() => setShowDetails(!showDetails)}
        >
          {item.extras.length} Extras{" "}
          {showDetails ? <FaAngleUp /> : <FaAngleDown />}
        </button>
      </div>
    </div>
  );
}
