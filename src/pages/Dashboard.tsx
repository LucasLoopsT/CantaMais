export default function Dashboard(){
    return(
        <div className="space-y-4 sm:space-y-6">
            <div>
                <h1 className="text-2xl sm:text-3xl text-white font-bold">
                    Visão Geral
                </h1>
                <p className="text-sm sm:text-base text-pink-400">
                    Acompanhe métricas do sistema
                </p>
            </div>
            {/* Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-pink-glass rounded-xl p-6">
                    <p className="text-pink-400 text-sm">
                        Pedidos hoje
                    </p>
                    <h2 className="text-3xl text-white font-bold mt-2">
                        42
                    </h2>
                </div>
                <div className="bg-pink-glass rounded-xl p-6">
                    <p className="text-pink-400 text-sm">
                        Mesas ocupadas
                    </p>
                    <h2 className="text-3xl text-white font-bold mt-2">
                        8
                    </h2>
                </div>
                <div className="bg-pink-glass rounded-xl p-6">
                    <p className="text-pink-400 text-sm">
                        Fila Karaoke
                    </p>
                    <h2 className="text-3xl text-white font-bold mt-2">
                        5
                    </h2>
                </div>
            </div>
            {/* Tabela */}
            <div className="bg-pink-glass rounded-xl p-6">
                <h2 className="text-white font-semibold mb-4">
                    Últimos pedidos
                </h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="text-pink-400">
                            <tr>
                                <th className="pb-2">Mesa</th>
                                <th className="pb-2">Item</th>
                                <th className="pb-2">Status</th>
                            </tr>
                        </thead>
                        <tbody className="text-white">
                            <tr className="border-t border-purple-3">
                                <td className="py-2">Mesa 05</td>
                                <td>Classic Burger</td>
                                <td className="text-yellow-400">Preparando</td>
                            </tr>
                            <tr className="border-t border-purple-3">
                                <td className="py-2">Mesa 02</td>
                                <td>Bacon Smash</td>
                                <td className="text-green-400">Pronto</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}