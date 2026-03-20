import { useState } from "react";
import Header from "../components/Header";
import CartItem from "../components/CartItem";
import { FaCartPlus } from "react-icons/fa";
import { NavLink } from "react-router-dom";
import toast from "react-hot-toast";

const initialCart = [
{
    id: 1,
    name: "Classic Burger",
    price: 24.90,
    img: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd",
    quantity: 1,
    extras: [
      { id: 1, name: "Batata Frita", price: 8, quantity:1 },
      { id: 1, name: "Batata Frita", price: 8, quantity:1 },
      { id: 1, name: "Batata Frita", price: 8, quantity:1 },
      { id: 1, name: "Batata Frita", price: 8, quantity:1 },
      { id: 1, name: "Batata Frita", price: 8, quantity:1 },
    ],
    available: true,
  },
  {
    id: 2,
    name: "Bacon Smash",
    price: 27.90,
    img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR-TxLc_svUBldQYxUXpeDUTs73K9Q27xcaDg&s",
    quantity: 2,
    extras: [
    //   { id: 1, name: "Batata Frita", price: 8, quantity:1 },
    ],
    available: true,
  },
]

export default function Carrinho() {

  const [cart,setCart] = useState(initialCart)
  const [openModal,setOpenModal] = useState(false)
  const [tableId,setTableId] = useState("")

  const [itemToRemove, setItemToRemove] = useState<any>(null);

  function increase(id:number){
    setCart(prev =>
      prev.map(item =>
        item.id === id
        ? { ...item, quantity: item.quantity + 1 }
        : item
      )
    )
  }

  function decrease(id:number){
    setCart(prev =>
      prev.map(item =>
        item.id === id && item.quantity > 1
        ? { ...item, quantity: item.quantity - 1 }
        : item
      )
    )
  }

  function remove(id:number){
    setCart(prev => prev.filter(item => item.id !== id))
    toast.success("Produto removido do carrinho")
  }

  const total = cart.reduce((acc,item)=>{

    const extrasTotal = item.extras.reduce(
      (sum,extra)=> sum + extra.price * extra.quantity,
      0
    )

    return acc + (item.price + extrasTotal) * item.quantity

  }, 0)

  function confirmOrder(){
    if(!tableId) return toast.error("Digite o ID da comanda")

    // simulação de envio backend
    console.log("Pedido enviado",{
      tableId,
      items:cart
    })

    toast.success(`Pedido enviado para a comanda ${tableId}`)

    setCart([])
    setTableId("")
    setOpenModal(false)
  }

  return (
    <section className="min-h-screen bg-pri flex flex-col">
        <Header titulo={"Carrinho"} link="/"/>
        
        {cart.length > 0 ? (
          <>
            <div className="flex-1 px-4 py-6 space-y-4">
              {cart.map(item => (
              <CartItem
                key={item.id}
                item={item}
                increase={increase}
                decrease={decrease}
                requestRemove={setItemToRemove}
              />
              ))}
            </div>
          
            <footer className="sticky bottom-0 bg-purple-4 border-t-2 border-purple-3 p-4">
                <button
                onClick={()=>setOpenModal(true)}
                className="w-full bg-pink-600 transition hover:bg-pink-800 cursor-pointer text-white py-4 rounded-xl font-semibold flex justify-between px-6">
                    Avançar
                    <span>R$ {total.toFixed(2)}</span>
                </button>
            </footer>
          </>
        ) : (
          <div className="h-[50vh] flex flex-col items-center justify-center gap-4">
            <div className="flex flex-col items-center justify-center gap-4 text-white/80 text-lg">
              <FaCartPlus className="text-5xl" />
              <p className="">Seu carrinho está vazio</p>
            </div>
            <NavLink to="/cardapio" className="p-12 bg-pink-glass border-2 border-pink-500 text-white py-2 rounded transition hover:bg-pink-glass-2 cursor-pointer">
              Adicionar itens
            </NavLink>
          </div>
        )}

        {openModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center">
            <div className="bg-purple-4 p-6 rounded-xl w-[90%] max-w-md space-y-4">
              <h2 className="text-white text-lg font-semibold">Confirmar Pedido</h2>
              <input
              placeholder="ID da comanda"
              value={tableId}
              onChange={(e)=>setTableId(e.target.value)}
              className="w-full p-3 rounded bg-white/10 text-white outline-none"
              />
              <div className="flex gap-3">
                <button onClick={()=>setOpenModal(false)} className="flex-1 border border-white text-white py-2 rounded transition hover:bg-white/10 cursor-pointer">
                  Cancelar
                </button>
                <button onClick={confirmOrder} className="flex-1 bg-pink-600 text-white py-3 rounded transition hover:bg-pink-800 cursor-pointer">
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        )}
        {itemToRemove && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-fadeIn">
            <div className="bg-purple-4 p-6 rounded-xl w-[90%] max-w-sm space-y-4 text-center">
              <h2 className="text-white text-lg font-semibold">Remover produto</h2>
              <p className="text-white/80">Deseja remover <b>{itemToRemove.name}</b> do carrinho?</p>
              <div className="flex gap-3">
                <button onClick={()=>setItemToRemove(null)} className="flex-1 border border-white text-white py-2 rounded transition hover:bg-white/10 cursor-pointer">
                  Cancelar
                </button>
                <button onClick={()=>{remove(itemToRemove.id); setItemToRemove(null)}} className="flex-1 bg-red-600 transition hover:bg-red-800 cursor-pointer text-white py-2 rounded">
                  Remover
                </button>
              </div>
            </div>
          </div>
        )}
    </section>
  )
}