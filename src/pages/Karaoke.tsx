import { useState } from "react"
import Header from "../components/Header"
import AddMusicModal from "../components/addMusic"
import clave from "../assets/clave.png";
import { FaAngleRight } from "react-icons/fa";

export default function Karaoke(){
  const [openModal,setOpenModal] = useState(false)
  const [tableId,setTableId] = useState("")

  const queue = [
    { mesa:"04", musica:"BABY JUSTIN", status:"CANTARAM" },
    { mesa:"07", musica:"O SOL", status:"AGORA" },
    { mesa:"05", musica:"FEITICEIRA", status:"PRÓXIMO!" },
    { mesa:"06", musica:"PLUTÃO", status:"FALTAM 2" },
  ]

  const nextTable = "05"

  return (
    <section className="min-h-screen bg-pri pb-20">
      <Header titulo="Karaokê" link="/" />
      
      <nav className={`relative w-full flex items-center justify-end bg-purple-1 p-2 pr-8 mt-4 z-50`}>
        <img src={clave} alt="clave de sol" className="absolute -top-2 -left-5 w-22"/>
        <div className="flex gap-4 w-full pl-20">
          <input
          placeholder="ID da comanda"
          value={tableId}
          onChange={(e)=>setTableId(e.target.value)}
          className="w-[90%] p-3 rounded bg-white/10 text-white outline-none"
          />
          <button onClick={()=>setOpenModal(true)} className="text-2xl text-pink-950 bg-pink-500 p-3 rounded-full transition hover:bg-pink-700 cursor-pointer">
            <FaAngleRight/>
          </button>
        </div>
      </nav>
      
      {/* PRÓXIMA MESA */}
      <div className="px-8 mt-8 flex items-center justify-between gap-4">
        <h2 className="text-white text-2xl font-bold leading-tight">PRÓXIMA MESA <br/> A CANTAR:</h2>
        <div className="bg-cyan-900/50 border-2 border-cyan-400 text-white text-5xl font-bold rounded-2xl p-6">
        {nextTable}
        </div>
      </div>

      {/* INFO */}
      <div className="px-8 mt-8">
        <div className="border-2 border-pink-500 bg-pink-glass rounded-2xl p-6">
          <h3 className="text-pink-400 text-2xl font-bold mb-4">Sua Infos:</h3>
          <div className="flex justify-between text-white">
            <div>
              <p><strong className="text-pink-300">Mesa:</strong> 04</p>
              <p><strong className="text-pink-300">Karaokê:</strong> Sala 01</p>
              <p><strong className="text-pink-300">Músicas Disponíveis:</strong> 1</p>
            </div>
          </div>
        </div>
      </div>

      {/* FILA */}
      <div className="px-8 mt-8">
        <div className="border-2 border-purple-400 rounded-2xl p-6">
  
  <h3 className="text-purple-300 text-2xl font-bold mb-4">
    Fila Atual:
  </h3>

  <div className="overflow-x-auto rounded-xl">

    <table className="min-w-[500px] w-full text-white">

      <thead className="bg-purple-900 text-sm uppercase border-3 border-pri">

        <tr>

          <th className="p-4 text-left">Mesa</th>
          <th className="p-4 text-left">Música</th>
          <th className="p-4 text-center">Status</th>

        </tr>

      </thead>

      <tbody className="divide-y-3 divide-pri">

        {queue.map((item,i)=>{

          const statusColor =
          item.status === "AGORA"
          ? "text-green-400"
          : item.status === "PRÓXIMO!"
          ? "text-yellow-400"
          : item.status === "CANTARAM"
          ? "text-gray-400"
          : "text-purple-500"

          return(

          <tr
          key={i}
          className={`hover:bg-purple-800/40 transition ${item.status === "AGORA" ? "bg-green-900/30" : item.status === "PRÓXIMO!" ? "bg-yellow-900/30" : "bg-white/3"} rounded-lg`}
          >

            <td className="p-4">
              Mesa {item.mesa}
            </td>

            <td className="p-4">
              {item.musica}
            </td>

            <td className={`p-4 text-center font-semibold ${statusColor}`}>
              {item.status}
            </td>

          </tr>

          )

        })}

      </tbody>

    </table>

  </div>

</div>
      </div>
      {/* BOTÃO */}
      <div className="px-8 mt-8">
        <button onClick={()=>setOpenModal(true)} className="w-full bg-cyan-900/50 border-2 border-cyan-400 text-white py-4 px-2 rounded-full font-bold text-lg hover:bg-cyan-600/50 cursor-pointer transition">
        ADICIONAR MÚSICA A FILA
        </button>
      </div>
      <AddMusicModal open={openModal} setOpen={setOpenModal}/>
    </section>
  )
};