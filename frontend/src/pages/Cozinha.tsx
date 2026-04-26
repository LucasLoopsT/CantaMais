import { useEffect, useState } from "react"
import toast from "react-hot-toast";

type Extra = {
    name:string
    price:number
}

type Item = {
    name:string
    quantity:number
    extras:Extra[]
}

type Order = {
    id:number
    table:number
    tab:number
    time:string
    items:Item[]
}

export default function Cozinha(){

    const [orders,setOrders] = useState<Order[]>([])
    const [confirmOrder,setConfirmOrder] = useState<Order | null>(null)
    const [doneOrders,setDoneOrders] = useState<Order[]>([])
    const [tab,setTab] = useState<"preparar" | "entregues">("preparar")

    function getTime(){

        const now = new Date()

        return now.toLocaleTimeString("pt-BR",{
            hour:"2-digit",
            minute:"2-digit"
        })

    }

    function generateMockOrder():Order{

        const products = [
            "Classic Burger",
            "Bacon Smash",
            "Batata Frita",
            "Coca Cola",
            "Milkshake"
        ]

        const extrasList = [
            {name:"Bacon extra",price:4},
            {name:"Queijo extra",price:3},
            {name:"Molho especial",price:2}
        ]

        const randomProduct = products[Math.floor(Math.random()*products.length)]

        const randomExtras = Math.random() > 0.5
            ? [extrasList[Math.floor(Math.random()*extrasList.length)]]
            : []

        return{

            id:Date.now(),

            table:Math.floor(Math.random()*10)+1,

            tab:Math.floor(Math.random()*100)+1,

            time:getTime(),

            items:[
                {
                    name:randomProduct,
                    quantity:1,
                    extras:randomExtras
                }
            ]

        }

    }

    useEffect(()=>{
        const interval = setInterval(()=>{

            const newOrder = generateMockOrder()

            setOrders(prev => [newOrder,...prev])
            toast.success(`Novo pedido: Mesa ${newOrder.table} - ${newOrder.items[0].name}`)
        },10000)

        return ()=>clearInterval(interval)

    },[])

    function confirmReady(){

        if(!confirmOrder) return

        setOrders(prev =>
            prev.filter(o => o.id !== confirmOrder.id)
        )

        setDoneOrders(prev =>
            [confirmOrder,...prev]
        )

        setConfirmOrder(null)

    }

    const list = tab === "preparar" ? orders : doneOrders

    return(
        <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                    <h1 className="text-2xl sm:text-3xl text-white font-bold">Cozinha</h1>
                    {list.length > 0 && (
                        <p className="text-sm sm:text-base text-pink-400">{list.length} pedidos {tab === "preparar" ? "pendentes" : "prontos"}</p>
                    )}
                </div>
                {/* Tabs */}
                <div className="flex flex-wrap gap-2 sm:gap-4 shrink-0">
                    <button onClick={()=>setTab("preparar")} className={`px-4 sm:px-5 py-2 rounded-lg text-sm sm:text-base transition cursor-pointer ${tab === "preparar" ? "bg-pink-600 text-white hover:bg-pink-800" : "bg-purple-4 text-pink-300 hover:bg-purple-3"}`}>
                        Preparar
                    </button>
                    <button onClick={()=>setTab("entregues")} className={`px-4 sm:px-5 py-2 rounded-lg text-sm sm:text-base transition cursor-pointer ${tab === "entregues" ? "bg-pink-600 text-white hover:bg-pink-800" : "bg-purple-4 text-pink-300 hover:bg-purple-3"}`}>
                        Entregues
                    </button>
                </div>
            </div>
            {/* Lista */}
            <div className={`rounded-xl p-4 sm:p-6 overflow-y-auto h-full max-h-[calc(100dvh-12rem)] sm:max-h-[80vh] ${tab === "preparar" ? "bg-pink-glass" : "bg-green-500/10"} border`}>
                {list.length === 0 && (
                    <p className={`text-${tab === "preparar" ? "pink" : "green"}-400`}>
                        {tab === "preparar" ? "Nenhum pedido pendente" : "Nenhum pedido entregue"}
                    </p>
                )}
                <div className="space-y-4">
                    {list.map(order => (
                        <div key={order.id} className={`border rounded-xl p-4 ${tab === "preparar" ? "bg-purple-4 border-purple-3" : "bg-green-900/40 border-green-900"}`}>
                            {/* header */}
                            <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center mb-3">
                                <div className="min-w-0">
                                    <p className="text-white font-semibold text-sm sm:text-base">
                                        Mesa {order.table} - Comanda {order.tab}
                                    </p>
                                    <p className={`text-xs ${tab === "preparar" ? "text-pink-400" : "text-green-300"}`}>
                                        Pedido às {order.time}
                                    </p>
                                </div>
                                {tab === "preparar" && (
                                    <button
                                        onClick={()=>setConfirmOrder(order)}
                                        className="bg-green-600 hover:bg-green-800 cursor-pointer transition text-white px-4 py-2 rounded-lg text-sm shrink-0 self-start sm:self-auto"
                                    >
                                        Marcar pronto
                                    </button>
                                )}
                            </div>
                            {/* itens */}
                            <div className="space-y-2">
                                {order.items.map((item,index)=>(
                                    <div
                                        key={index}
                                        className="border-t border-purple-3 pt-2"
                                    >
                                        <p className="text-white">
                                            {item.quantity}x {item.name}
                                        </p>
                                        {item.extras.length > 0 && (
                                            <ul className={`text-xs ${tab === "preparar" ? "text-pink-400" : "text-green-300"} list-disc ml-4`}>
                                                {item.extras.map((extra,i)=>(
                                                    <li key={i}>
                                                        {extra.name}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        {confirmOrder && (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                <div className="bg-purple-4 border border-purple-3 rounded-xl w-[90%] max-w-md p-6 space-y-4">
                    <h2 className="text-white text-lg font-semibold">Confirmar pedido pronto</h2>
                    {/* mesa e comanda */}
                    <div className="text-pink-400 text-sm">
                        <p>Mesa <b>{confirmOrder.table}</b></p>
                        <p>Comanda <b>{confirmOrder.tab}</b></p>
                    </div>
                    {/* itens */}
                    <div className="bg-pink-glass rounded-lg p-3 space-y-2 max-h-40 overflow-y-auto">
                        {confirmOrder.items.map((item,index)=>(
                            <div key={index} className="text-white">
                                <p>{item.quantity}x {item.name}</p>
                                {item.extras.length > 0 && (
                                    <ul className="text-xs text-pink-400 ml-4 list-disc">
                                        {item.extras.map((extra,i)=>(
                                            <li key={i}>{extra.name}</li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* ações */}
                    <div className="flex gap-3">
                        <button onClick={()=>setConfirmOrder(null)} className="flex-1 border border-white text-white py-2 rounded-lg transition hover:bg-white/10 cursor-pointer">
                            Cancelar
                        </button>
                        <button onClick={confirmReady} className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg cursor-pointer">
                            Confirmar pronto
                        </button>
                    </div>
                </div>
            </div>
        )}
        </div>
    );
}