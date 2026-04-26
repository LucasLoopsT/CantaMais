import { useState } from "react";
import { FaPlus, FaTrash, FaMinus, FaAngleDown, FaAngleUp } from "react-icons/fa";

export default function CartItem({ item, increase, decrease, requestRemove }:any) {
  const [showDetails, setShowDetails] = useState(false);

  const extrasTotal = item.extras.reduce((acc:number, extra:any) => acc + extra.price * (extra.quantity || 1), 0)
  const totalItem = (item.price + extrasTotal) * item.quantity

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 shadow-md">
      <div className="flex items-center gap-4 bg-pink-glass/80 p-4 backdrop-blur-sm">
        <img src={item.img} className="h-20 w-20 rounded-xl object-cover ring-1 ring-white/10" alt="" />
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <p className="font-medium text-white">
              {item.quantity}x {item.name}
            </p>
            <p className="text-pink-400 font-semibold">
              R$ {totalItem.toFixed(2)}
            </p>
          </div>
          <div className="flex items-center gap-3 text-white">
            {item.quantity > 1 ? (
              <button onClick={()=>decrease(item.id)} className="cursor-pointer rounded border border-white/15 p-2 transition hover:bg-pink-glass">
                <FaMinus />
              </button>
            ) : (
              <button type="button" onClick={() => requestRemove({ ...item })} className="cursor-pointer rounded border border-white/15 p-2 transition hover:border-red-500/40 hover:text-red-400">
                <FaTrash />
              </button>
            )}
            <span>{item.quantity}</span>
            <button onClick={()=>increase(item.id)} className="cursor-pointer rounded border border-white/15 p-2 text-pink-400 transition hover:bg-pink-glass">
              <FaPlus />
            </button>
          </div>
        </div>
      </div>
      {showDetails && (
        <div className="border-t border-white/10 bg-pink-glass-2/80 text-sm text-pink-300">
          {item.extras.length > 0 ? (
            <div className="p-4">
              <p className="font-semibold mb-2">Extras:</p>
              <ul className="list-disc list-inside">
                {item.extras.map((extra: any, index: number) => (
                  <li key={index}>
                    {extra.name} - R$ {extra.price.toFixed(2)}
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
        <button type="button" className="flex w-full cursor-pointer items-center justify-center gap-1 py-2 text-sm text-pink-300 transition hover:text-pink-100" onClick={()=>setShowDetails(!showDetails)}>
          {item.extras.length} Extras {showDetails ? <FaAngleUp /> : <FaAngleDown />}
        </button>
      </div>

    </div>
  )
}