import { useState } from "react"
import toast from "react-hot-toast"

export default function AddMusicModal({open,setOpen}:any){
    const [music,setMusic] = useState("")

    if(!open) return null

    function addMusic(){
        if(!music){
            toast.error("Digite o nome da música")
            return
        }

        toast.success("Música adicionada à fila!")
        setMusic("")
        setOpen(false)
    }

    return(
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-purple-4 p-6 rounded-xl w-[90%] max-w-md space-y-4">
                <h2 className="text-white text-xl font-bold">Adicionar Música</h2>
                <input
                value={music}
                onChange={(e)=>setMusic(e.target.value)}
                placeholder="Nome da música"
                className="w-full p-3 rounded bg-white/10 text-white outline-none"
                />
                <div className="flex gap-3">
                    <button onClick={()=>setOpen(false)} className="flex-1 border border-white text-white py-2 rounded">Cancelar</button>
                    <button onClick={addMusic} className="flex-1 bg-pink-600 text-white py-2 rounded">Adicionar</button>
                </div>  
            </div>
        </div>
    );
}