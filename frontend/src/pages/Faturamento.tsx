export default function Faturamento() {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="shrink-0 text-2xl font-bold text-white sm:text-3xl">
          Faturamento
        </h1>
        <p className="text-sm text-pink-400 sm:text-base">
          Todo o consumo registrado no dia exibido aqui.
        </p>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-white/10 bg-pink-glass/40 p-4 sm:flex-row sm:items-end">
        <h2 className="text-white">Em construção</h2>
      </div>
    </div>
  );
}
