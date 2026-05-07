import { Fragment, useState } from "react";
import toast from "react-hot-toast";
import { FaSearch, FaMoneyBillWave } from "react-icons/fa";
import { api } from "../lib/api";

type ApiComanda = {
  id: number;
  pessoas: number;
  status: string;
  mesaId: number | null;
  numero: number | null;
  nome: string | null;
};

type LinhaExtra = {
  nome: string;
  quantidade: number;
  precoUnit: number;
  subtotal: number;
};

type LinhaConsumo = {
  pedidoId: number;
  pedidoItemId: number;
  nome: string;
  quantidade: number;
  precoUnit: number;
  subtotalProduto: number;
  extras: LinhaExtra[];
  subtotalExtras: number;
  subtotalLinha: number;
  observacao: string | null;
};

type ResumoResponse = {
  comanda: ApiComanda;
  linhas: LinhaConsumo[];
  subtotalItens: number;
  taxaKaraokePorPessoa: number;
  pessoasComanda: number;
  taxaKaraokeTotal: number;
  total: number;
};

export default function FechamentoComanda() {
  const [numeroStr, setNumeroStr] = useState("");
  const [numeroBuscado, setNumeroBuscado] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [resumo, setResumo] = useState<ResumoResponse | null>(null);
  const [confirmEncerrar, setConfirmEncerrar] = useState(false);
  const [encerrando, setEncerrando] = useState(false);

  async function buscar() {
    const numero = Number.parseInt(numeroStr.trim(), 10);
    if (!Number.isFinite(numero) || numero < 1) {
      toast.error("Informe o número da comanda");
      return;
    }
    setLoading(true);
    setResumo(null);
    setNumeroBuscado(null);
    try {
      const { data } = await api.get<ResumoResponse>(
        `/comandas/numero/${numero}/consumo`,
      );
      if (data.comanda.status === "LIVRE") {
        toast.error("Comanda LIVRE");
        setLoading(false);
        return;
      }
      setResumo(data);
      setNumeroBuscado(numero);
    } catch {
      toast.error("Nenhuma comanda com este número (ou sem permissão)");
    } finally {
      setLoading(false);
    }
  }

  async function encerrar() {
    if (!resumo) return;
    const n =
      numeroBuscado ??
      (resumo.comanda.numero != null ? resumo.comanda.numero : null);
    if (n == null || !Number.isFinite(n)) {
      toast.error("Número da comanda inválido para encerrar");
      return;
    }
    setEncerrando(true);
    try {
      await api.post(`/comandas/numero/${n}/encerrar-pagamento`);
      toast.success("Pagamento confirmado — comanda liberada");
      setResumo(null);
      setNumeroStr("");
      setNumeroBuscado(null);
      setConfirmEncerrar(false);
    } catch {
      toast.error("Não foi possível encerrar a comanda");
    } finally {
      setEncerrando(false);
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="shrink-0 text-2xl font-bold text-white sm:text-3xl">
          Fechamento de comanda
        </h1>
        <p className="text-sm text-pink-400 sm:text-base">
          Digite o <strong className="text-pink-200">número da comanda</strong>{" "}
          e confirme o pagamento para reiniciar comanda.
        </p>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-white/10 bg-pink-glass/40 p-4 sm:flex-row sm:items-end">
        <div className="min-w-0 flex-1">
          <label className="mb-1 block text-sm font-medium text-pink-200">
            Número da comanda
          </label>
          <input
            type="number"
            min={1}
            value={numeroStr}
            onChange={(e) => setNumeroStr(e.target.value)}
            placeholder="Ex.: 12"
            className="w-full rounded-lg border border-white/10 bg-purple-4 px-3 py-2.5 text-white outline-none ring-pink-500/20 focus:ring-2"
          />
        </div>
        <button
          type="button"
          onClick={() => void buscar()}
          disabled={loading}
          className="inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-lg bg-pink-600 px-5 py-2.5 font-medium text-white transition hover:bg-pink-700 disabled:opacity-50 cursor-pointer"
        >
          <FaSearch className="shrink-0" aria-hidden />
          {loading ? "Buscando…" : "Buscar"}
        </button>
      </div>

      {resumo && (
        <div className="space-y-4 rounded-xl border border-white/10 bg-purple-4/30 p-4 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-white/10 pb-4">
            <div>
              <p className="text-sm text-pink-200/80">Comanda</p>
              <p className="text-lg font-semibold text-white">
                nº {resumo.comanda.numero ?? numeroBuscado ?? "—"}
                <span className="ml-2 text-sm font-normal text-pink-200/70">
                  (id interno {resumo.comanda.id})
                </span>
              </p>
              {resumo.comanda.nome?.trim() && (
                <p className="text-sm text-pink-100/90">
                  {resumo.comanda.nome}
                </p>
              )}
            </div>
            <div className="text-right text-sm text-pink-200/90">
              <p>Status: {resumo.comanda.status}</p>
              <p>Mesa: {resumo.comanda.mesaId ?? "—"}</p>
              <p>Pessoas: {resumo.comanda.pessoas}</p>
            </div>
          </div>

          {resumo.linhas.length === 0 ? (
            <p className="py-6 text-center text-pink-200/80">
              Nenhum item consumido (pedidos cancelados não entram no total).
            </p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-white/5">
              <table className="w-full text-left text-sm text-white">
                <thead className="border-b border-white/10 bg-purple-3/50 text-xs uppercase tracking-wide text-pink-300">
                  <tr>
                    <th className="p-3">Produto</th>
                    <th className="p-3 text-center">Qtd</th>
                    <th className="p-3 text-right">Unit.</th>
                    <th className="p-3 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {resumo.linhas.map((linha) => (
                    <Fragment key={linha.pedidoItemId}>
                      <tr>
                        <td className="p-3">
                          <span className="font-medium">{linha.nome}</span>
                          {linha.observacao?.trim() && (
                            <p className="mt-0.5 text-xs text-pink-200/70">
                              Obs.: {linha.observacao}
                            </p>
                          )}
                        </td>
                        <td className="p-3 text-center tabular-nums">
                          {linha.quantidade}
                        </td>
                        <td className="p-3 text-right tabular-nums">
                          R$ {linha.precoUnit.toFixed(2)}
                        </td>
                        <td className="p-3 text-right font-medium tabular-nums">
                          R$ {linha.subtotalLinha.toFixed(2)}
                        </td>
                      </tr>
                      {linha.extras.length > 0 &&
                        linha.extras.map((ex, i) => (
                          <tr
                            key={`${linha.pedidoItemId}-ex-${i}`}
                            className="bg-black/15 text-xs text-pink-100/90"
                          >
                            <td className="py-1.5 pl-6 pr-3" colSpan={2}>
                              + {ex.nome}
                            </td>
                            <td className="py-1.5 px-3 text-right tabular-nums">
                              {ex.quantidade} × R$ {ex.precoUnit.toFixed(2)}
                            </td>
                            <td className="py-1.5 px-3 text-right tabular-nums">
                              R$ {ex.subtotal.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="space-y-3 border-t border-white/10 pt-4 text-sm text-pink-100/90">
            <div className="flex justify-between gap-4 tabular-nums">
              <span>Subtotal (produtos e extras)</span>
              <span className="text-white">
                R$ {resumo.subtotalItens.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between gap-4 tabular-nums">
              <span>
                {`Taxa karaokê (${resumo.pessoasComanda} ${
                  resumo.pessoasComanda === 1 ? "pessoa" : "pessoas"
                } × R$ ${resumo.taxaKaraokePorPessoa.toFixed(2)})`}
              </span>
              <span className="text-white">
                R$ {resumo.taxaKaraokeTotal.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-4 border-t border-white/10 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-pink-200/80">Total a pagar</p>
              <p className="text-2xl font-bold tabular-nums text-white">
                R$ {resumo.total.toFixed(2)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setConfirmEncerrar(true)}
              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-700 to-emerald-600 px-6 py-3 font-semibold text-white shadow-lg transition hover:from-emerald-600 hover:to-emerald-500"
            >
              <FaMoneyBillWave aria-hidden />
              Confirmar pagamento e liberar comanda
            </button>
          </div>
        </div>
      )}

      {confirmEncerrar && resumo && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md space-y-4 rounded-2xl border border-white/10 bg-purple-4/95 p-6 shadow-2xl">
            <h2 className="text-lg text-center font-semibold text-white">
              Confirmar encerramento?
            </h2>
            <p className="text-sm text-center text-pink-100/85">
              Deseja resetar comanda e definir status como{" "}
              <strong className="text-white">LIVRE</strong> para novo uso? A
              fila de karaokê desta comanda também será apagada.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                disabled={encerrando}
                onClick={() => setConfirmEncerrar(false)}
                className="flex-1 rounded-xl border border-white/20 py-3 text-white hover:bg-white/10 disabled:opacity-50 cursor-pointer"
              >
                Voltar
              </button>
              <button
                type="button"
                disabled={encerrando}
                onClick={() => void encerrar()}
                className="flex-1 rounded-xl bg-emerald-600 py-3 font-medium text-white hover:bg-emerald-500 disabled:opacity-50 cursor-pointer"
              >
                {encerrando ? "Processando…" : "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
