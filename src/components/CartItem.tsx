import { useState } from "react";
import { FaPlus, FaTrash, FaMinus, FaAngleDown, FaAngleUp } from "react-icons/fa";

export default function CartItem({ item, increase, decrease, requestRemove }:any) {
  const [showDetails, setShowDetails] = useState(false);

  const extrasTotal = item.extras.reduce((acc:number, extra:any) => acc + extra.price * (extra.quantity || 1), 0)
  const totalItem = (item.price + extrasTotal) * item.quantity

  return (
    <div>
      <div className="bg-pink-glass rounded-t-xl p-4 shadow-sm flex gap-4 items-center">
        <img src={item.img} className="w-20 h-20 rounded-lg object-cover"/>
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
              <button onClick={()=>decrease(item.id)} className="p-2 border rounded cursor-pointer transition hover:bg-pink-glass">
                <FaMinus />
              </button>
            ) : (
              <button onClick={() => requestRemove({ ...item })} className="p-2 border rounded cursor-pointer transition hover:text-red-500">
                <FaTrash />
              </button>
            )}
            <span>{item.quantity}</span>
            <button onClick={()=>increase(item.id)} className="p-2 border rounded cursor-pointer transition hover:bg-pink-glass text-pink-400">
              <FaPlus />
            </button>
          </div>
        </div>
      </div>
      {showDetails && (
        <div className="bg-pink-glass-2 text-sm text-pink-400">
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
      <div className="bg-pink-glass-2 rounded-b-xl text-sm text-pink-400">
        <button className={`w-full flex items-center justify-center gap-1 text-sm text-pink-400 cursor-pointer py-1 transition hover:text-pink-200`} onClick={()=>setShowDetails(!showDetails)}>
          {item.extras.length} Extras {showDetails ? <FaAngleUp /> : <FaAngleDown />}
        </button>
      </div>

    </div>
  )
}