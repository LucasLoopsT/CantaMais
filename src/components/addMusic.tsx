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
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md space-y-4 rounded-2xl border border-white/10 bg-purple-4/95 p-6 shadow-2xl backdrop-blur-md">
                <h2 className="text-xl font-bold text-white">Adicionar música</h2>
                <input
                value={music}
                onChange={(e)=>setMusic(e.target.value)}
                placeholder="Nome da música"
                className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-white outline-none ring-pink-500/30 placeholder:text-pink-200/40 focus:ring-2"
                />
                <div className="flex gap-3">
                    <button type="button" onClick={()=>setOpen(false)} className="flex-1 cursor-pointer rounded-xl border border-white/15 py-3 text-white transition hover:bg-white/10">Cancelar</button>
                    <button type="button" onClick={addMusic} className="flex-1 cursor-pointer rounded-xl bg-gradient-to-r from-pink-600 to-pink-500 py-3 font-medium text-white transition hover:from-pink-500 hover:to-pink-400">Adicionar</button>
                </div>  
            </div>
        </div>
    );
}