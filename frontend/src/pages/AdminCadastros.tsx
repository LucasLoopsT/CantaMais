import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { api } from "../lib/api";
import type { ApiProduto } from "../types/produto";
import Field from "../components/Field";

type Tab =
  | "comandas"
  | "mesas"
  | "usuarios"
  | "produtos"
  | "salas"
  | "extras"
  | "config";

type ApiComanda = {
  id: number;
  pessoas: number;
  status: string;
  mesaId: number | null;
  numero: number | null;
  nome: string | null;
};

type ApiMesa = {
  id: number;
  numero: number;
  qtClientes: number;
  status: string;
  musicas: number;
  karaokeId: number | null;
  comandas: { id: number }[];
};

type ApiUser = {
  id: number;
  name: string;
  email: string;
  level: string;
};

type SalaKaraoke = { id: number; nome: string };

type DeleteTarget =
  | { kind: "comanda"; id: number; title: string; detail: string }
  | { kind: "mesa"; id: number; title: string; detail: string }
  | { kind: "user"; id: number; title: string; detail: string }
  | { kind: "produto"; id: number; title: string; detail: string }
  | { kind: "sala"; id: number; title: string; detail: string };

type ApiVinculo = {
  id: number;
  produtoId: number;
  extraProdutoId: number;
  produto: { id: number; nome: string };
  extraProduto: { id: number; nome: string; preco: number };
};

const MESA_STATUS = ["LIVRE", "EM USO", "OCUPADA", "RESERVADA"] as const;
const COMANDA_STATUS = ["LIVRE", "EM USO"];

const CAT_PRESETS = [
  "Mais Vendidos",
  "Lanches",
  "Porções",
  "Bebidas",
  "Sobremesas",
  "Extra",
] as const;

type CatPreset = (typeof CAT_PRESETS)[number];

function emptyCatChecks(): Record<CatPreset, boolean> {
  return {
    "Mais Vendidos": false,
    Lanches: false,
    Porções: false,
    Sobremesas: false,
    Bebidas: false,
    Extra: false,
  };
}

function parseCategorias(input: string): string[] {
  return input
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function categoriasFromForm(
  checks: Record<CatPreset, boolean>,
  otherRaw: string,
): string[] {
  const picked = CAT_PRESETS.filter((k) => checks[k]);
  const other = parseCategorias(otherRaw);
  return [...new Set([...picked, ...other])];
}

function splitCategoriasForForm(cats: string[]): {
  checks: Record<CatPreset, boolean>;
  other: string;
} {
  const checks: Record<CatPreset, boolean> = {
    Lanches: false,
    Bebidas: false,
    Sobremesas: false,
    "Mais Vendidos": false,
    Porções: false,
    Extra: false,
  };
  const rest: string[] = [];
  for (const c of cats) {
    const t = c.trim();
    if (!t) continue;
    if ((CAT_PRESETS as readonly string[]).includes(t)) {
      checks[t as CatPreset] = true;
    } else {
      rest.push(t);
    }
  }
  const hasPreset = CAT_PRESETS.some((k) => checks[k]);
  if (!hasPreset && rest.length === 0) {
    checks.Lanches = true;
  }
  return { checks, other: rest.join(", ") };
}

function mesaOptionLabel(m: ApiMesa) {
  return `Mesa #${m.id} — número ${m.numero} (${m.status})`;
}

const inputClass =
  "w-full rounded-lg border border-white/10 bg-purple-4 px-3 py-2 text-white outline-none ring-pink-500/20 focus:ring-2";

export default function AdminCadastros() {
  const [tab, setTab] = useState<Tab>("mesas");

  const [comandas, setComandas] = useState<ApiComanda[]>([]);
  const [mesas, setMesas] = useState<ApiMesa[]>([]);
  const [salas, setSalas] = useState<SalaKaraoke[]>([]);
  const [usuarios, setUsuarios] = useState<ApiUser[]>([]);
  const [produtos, setProdutos] = useState<ApiProduto[]>([]);

  const [cPessoas, setCPessoas] = useState("1");
  const [cStatus, setCStatus] = useState("LIVRE");
  const [cMesaId, setCMesaId] = useState("");
  const [cNumero, setCNumero] = useState("");
  const [cNome, setCNome] = useState("");
  const [editComandaId, setEditComandaId] = useState<number | null>(null);

  const [mNumero, setMNumero] = useState("");
  const [mQt, setMQt] = useState<number>(1);
  const [mStatus, setMStatus] = useState<(typeof MESA_STATUS)[number]>("LIVRE");
  const [mMusicas, setMMusicas] = useState("2");
  const [mKaraoke, setMKaraoke] = useState<number>();
  const [editMesaId, setEditMesaId] = useState<number | null>(null);

  const [uNome, setUNome] = useState("");
  const [uEmail, setUEmail] = useState("");
  const [uSenha, setUSenha] = useState("");
  const [uLevel, setULevel] = useState("COZINHA");
  const [editUserId, setEditUserId] = useState<number | null>(null);

  const [pNome, setPNome] = useState("");
  const [pPreco, setPPreco] = useState("");
  const [pCatChecks, setPCatChecks] =
    useState<Record<CatPreset, boolean>>(emptyCatChecks);
  const [pCatsOther, setPCatsOther] = useState("");
  const [pDesc, setPDesc] = useState("");
  const [pImg, setPImg] = useState("");
  const [pDisp, setPDisp] = useState(true);
  const [editProdId, setEditProdId] = useState<number | null>(null);
  const [extraLinkProdId, setExtraLinkProdId] = useState<number | null>(null);

  const [sNome, setSNome] = useState("");
  const [editSalaId, setEditSalaId] = useState<number | null>(null);

  const [vinculos, setVinculos] = useState<ApiVinculo[]>([]);
  const [vePrincipal, setVePrincipal] = useState("");
  const [veExtra, setVeExtra] = useState("");

  const [taxaKaraokeStr, setTaxaKaraokeStr] = useState("0");

  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const produtosExtras = useMemo(
    () =>
      produtos.filter((p) =>
        p.categoria.some((c) => c.trim().toLowerCase() === "extra"),
      ),
    [produtos],
  );

  const loadComandas = useCallback(async () => {
    const { data } = await api.get<ApiComanda[]>("/comandas");
    setComandas(data);
  }, []);
  const loadMesas = useCallback(async () => {
    const { data } = await api.get<ApiMesa[]>("/mesas");
    setMesas(data);
  }, []);
  const loadSalas = useCallback(async () => {
    try {
      const { data } = await api.get<SalaKaraoke[]>("/karaoke/salas");
      setSalas(data);
    } catch {
      setSalas([]);
    }
  }, []);
  const loadUsuarios = useCallback(async () => {
    const { data } = await api.get<ApiUser[]>("/users");
    setUsuarios(data);
  }, []);
  const loadProdutos = useCallback(async () => {
    const { data } = await api.get<ApiProduto[]>("/produtos");
    setProdutos(data);
  }, []);
  const loadSettings = useCallback(async () => {
    try {
      const { data } = await api.get<{ taxaKaraokePorPessoa: number }>(
        "/settings",
      );
      setTaxaKaraokeStr(String(data.taxaKaraokePorPessoa));
    } catch {
      setTaxaKaraokeStr("0");
    }
  }, []);

  const refresh = useCallback(async () => {
    try {
      await Promise.all([
        loadComandas(),
        loadMesas(),
        loadSalas(),
        loadUsuarios(),
        loadProdutos(),
        loadSettings(),
      ]);
    } catch {
      toast.error("Erro ao carregar dados (permissão ou API)");
    }
  }, [
    loadComandas,
    loadMesas,
    loadSalas,
    loadUsuarios,
    loadProdutos,
    loadSettings,
  ]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (tab !== "extras") return;
    void api
      .get<ApiVinculo[]>("/produto-extras")
      .then((r) => setVinculos(r.data))
      .catch(() => {
        setVinculos([]);
        toast.error("Erro ao carregar vínculos extras");
      });
  }, [tab]);

  function resetComandaForm() {
    setEditComandaId(null);
    setCPessoas("1");
    setCStatus("LIVRE");
    setCMesaId("");
    setCNumero("");
    setCNome("");
  }

  function resetMesaForm() {
    setEditMesaId(null);
    setMNumero("");
    setMQt(1);
    setMStatus("LIVRE");
    setMMusicas("2");
    setMKaraoke(undefined);
  }

  function resetUserForm() {
    setEditUserId(null);
    setUNome("");
    setUEmail("");
    setUSenha("");
    setULevel("COZINHA");
  }

  function resetProdForm() {
    setEditProdId(null);
    setPNome("");
    setPPreco("");
    setPCatChecks(emptyCatChecks());
    setPCatsOther("");
    setPDesc("");
    setPImg("");
    setPDisp(true);
  }

  function resetSalaForm() {
    setEditSalaId(null);
    setSNome("");
  }

  async function submitComanda(e: React.FormEvent) {
    e.preventDefault();
    const pessoas = Number.parseInt(cPessoas, 10);
    if (!Number.isFinite(pessoas) || pessoas < 1) {
      toast.error("Pessoas inválido");
      return;
    }
    const mesaId = cMesaId === "" ? null : Number.parseInt(cMesaId, 10);
    if (cMesaId !== "" && !Number.isFinite(mesaId)) {
      toast.error("Mesa inválida");
      return;
    }
    const numeroRaw = cNumero.trim();
    let numeroComanda: number | null;
    if (numeroRaw === "") {
      numeroComanda = null;
    } else {
      const n = Number.parseInt(numeroRaw, 10);
      if (!Number.isFinite(n) || n < 1) {
        toast.error("Número da comanda inválido");
        return;
      }
      numeroComanda = n;
    }
    const nomeComanda = cNome.trim() ? cNome.trim().slice(0, 120) : null;
    try {
      if (editComandaId == null) {
        await api.post("/comandas", {
          pessoas,
          status: cStatus,
          mesaId: mesaId ?? undefined,
          numero: numeroComanda,
          nome: nomeComanda,
        });
        toast.success("Comanda criada");
      } else {
        await api.patch(`/comandas/${editComandaId}`, {
          pessoas,
          status: cStatus,
          mesaId,
          numero: numeroComanda,
          nome: nomeComanda,
        });
        toast.success("Comanda atualizada");
      }
      resetComandaForm();
      await loadComandas();
      await loadMesas();
    } catch {
      toast.error("Falha ao salvar comanda");
    }
  }

  async function submitMesa(e: React.FormEvent) {
    e.preventDefault();
    const numero = Number.parseInt(mNumero, 10);
    const qtClientes = mQt != null ? mQt : 1;
    const musicas = Number.parseInt(mMusicas, 10) || 0;
    const karaokeId = mKaraoke == null ? null : mKaraoke;
    if (!Number.isFinite(numero) || numero < 0) {
      toast.error("Número da mesa inválido");
      return;
    }
    if (mKaraoke == null) {
      toast.error("Sala de karaokê inválida");
      return;
    }
    try {
      if (editMesaId == null) {
        await api.post("/mesas", {
          numero,
          qtClientes,
          status: mStatus,
          musicas,
          karaokeId: karaokeId ?? undefined,
        });
        toast.success("Mesa criada");
      } else {
        await api.patch(`/mesas/${editMesaId}`, {
          numero,
          qtClientes,
          status: mStatus,
          musicas,
          karaokeId,
        });
        toast.success("Mesa atualizada");
      }
      resetMesaForm();
      await loadMesas();
    } catch {
      toast.error("Falha ao salvar mesa");
    }
  }

  async function submitUser(e: React.FormEvent) {
    e.preventDefault();
    if (!uNome.trim() || !uEmail.trim()) {
      toast.error("Nome e email obrigatórios");
      return;
    }
    try {
      if (editUserId == null) {
        if (uSenha.length < 6) {
          toast.error("Senha mínima 6 caracteres");
          return;
        }
        await api.post("/users", {
          name: uNome.trim(),
          email: uEmail.trim(),
          password: uSenha,
          level: uLevel,
        });
        toast.success("Usuário criado");
      } else {
        const body: {
          name: string;
          email: string;
          level: string;
          password?: string;
        } = {
          name: uNome.trim(),
          email: uEmail.trim(),
          level: uLevel,
        };
        if (uSenha.trim().length >= 6) body.password = uSenha;
        await api.patch(`/users/${editUserId}`, body);
        toast.success("Usuário atualizado");
      }
      resetUserForm();
      await loadUsuarios();
    } catch {
      toast.error("Falha ao salvar usuário");
    }
  }

  async function submitSala(e: React.FormEvent) {
    e.preventDefault();
    if (!sNome.trim()) {
      toast.error("Informe o nome da sala");
      return;
    }
    try {
      if (editSalaId == null) {
        await api.post("/karaoke/salas", { nome: sNome.trim() });
        toast.success("Sala criada");
      } else {
        await api.patch(`/karaoke/salas/${editSalaId}`, {
          nome: sNome.trim(),
        });
        toast.success("Sala atualizada");
      }
      resetSalaForm();
      await loadSalas();
    } catch {
      toast.error("Falha ao salvar sala de karaokê");
    }
  }

  async function submitSettings(e: React.FormEvent) {
    e.preventDefault();
    const v = Number.parseFloat(taxaKaraokeStr.replace(",", "."));
    if (!Number.isFinite(v) || v < 0) {
      toast.error("Taxa inválida (use número ≥ 0)");
      return;
    }
    try {
      await api.patch("/settings", { taxaKaraokePorPessoa: v });
      toast.success("Taxa de karaokê salva");
      await loadSettings();
    } catch {
      toast.error("Falha ao salvar configuração");
    }
  }

  async function submitVinculoExtra(e: React.FormEvent) {
    e.preventDefault();
    const produtoId = Number.parseInt(vePrincipal, 10);
    const extraProdutoId = Number.parseInt(veExtra, 10);
    if (!Number.isFinite(produtoId) || produtoId < 1) {
      toast.error("Selecione o produto principal");
      return;
    }
    if (!Number.isFinite(extraProdutoId) || extraProdutoId < 1) {
      toast.error("Selecione o produto extra");
      return;
    }
    if (produtoId === extraProdutoId) {
      toast.error("Produto e extra devem ser diferentes");
      return;
    }
    try {
      await api.post("/produto-extras", { produtoId, extraProdutoId });
      toast.success("Vínculo criado");
      setVeExtra("");
      const { data } = await api.get<ApiVinculo[]>("/produto-extras");
      setVinculos(data);
      await loadProdutos();
    } catch {
      toast.error("Falha ao criar vínculo");
    }
  }

  async function submitProduto(e: React.FormEvent) {
    e.preventDefault();
    const preco = Number.parseFloat(pPreco.replace(",", "."));
    const cats = categoriasFromForm(pCatChecks, pCatsOther);
    if (!pNome.trim() || !Number.isFinite(preco) || preco < 0) {
      toast.error("Nome e preço válidos são obrigatórios");
      return;
    }
    if (cats.length === 0) {
      toast.error("Marque ao menos uma categoria ou informe outras");
      return;
    }
    try {
      if (editProdId == null) {
        await api.post("/produtos", {
          nome: pNome.trim(),
          preco,
          categoria: cats,
          descricao: pDesc.trim() || null,
          imagem: pImg.trim() || null,
          disponivel: pDisp,
        });
        toast.success("Produto criado");
      } else {
        await api.patch(`/produtos/${editProdId}`, {
          nome: pNome.trim(),
          preco,
          categoria: cats,
          descricao: pDesc.trim() || null,
          imagem: pImg.trim() || null,
          disponivel: pDisp,
        });
        toast.success("Produto atualizado");
      }
      resetProdForm();
      await loadProdutos();
    } catch {
      toast.error("Falha ao salvar produto");
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    const target = deleteTarget;
    setDeleteLoading(true);
    try {
      switch (target.kind) {
        case "comanda":
          await api.delete(`/comandas/${target.id}`);
          toast.success("Comanda removida");
          break;
        case "mesa":
          await api.delete(`/mesas/${target.id}`);
          toast.success("Mesa removida");
          break;
        case "user":
          await api.delete(`/users/${target.id}`);
          toast.success("Usuário removido");
          break;
        case "produto":
          await api.delete(`/produtos/${target.id}`);
          toast.success("Produto removido");
          resetProdForm();
          break;
        case "sala":
          await api.delete(`/karaoke/salas/${target.id}`);
          toast.success("Sala removida");
          resetSalaForm();
          break;
      }
      setDeleteTarget(null);
      await refresh();
    } catch {
      toast.error("Não foi possível excluir");
    } finally {
      setDeleteLoading(false);
    }
  }

  async function unlinkExtra(produtoId: number, extraProdutoId: number) {
    try {
      await api.delete(`/produto-extras/${produtoId}/${extraProdutoId}`);
      await loadProdutos();
      if (tab === "extras") {
        const { data } = await api.get<ApiVinculo[]>("/produto-extras");
        setVinculos(data);
      }
    } catch {
      toast.error("Erro ao remover vínculo");
    }
  }

  function getSalaKaraokeById(id: number | null) {
    if (!id) return "—";

    const sala = salas.find((s) => s.id === id);
    return sala ? sala.nome : "—";
  }

  const tabBtn = (t: Tab, label: string) => (
    <button
      key={t}
      type="button"
      onClick={() => setTab(t)}
      className={`rounded-lg px-4 py-2 text-sm font-medium transition cursor-pointer ${
        tab === t
          ? "bg-pink-600 text-white hover:bg-pink-700"
          : "bg-purple-4 text-pink-300 hover:bg-purple-3"
      }`}
    >
      {label}
    </button>
  );

  const rowEditClass = (active: boolean) =>
    active
      ? "border-t border-white/10 bg-pink-600/20 ring-1 ring-inset ring-pink-400/35"
      : "border-t border-white/10";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white sm:text-3xl">Cadastros</h1>
        <p className="text-sm text-pink-400 sm:text-base">
          Comandas, mesas, usuários e produtos — nível ADMIN.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {tabBtn("mesas", "Mesas")}
        {tabBtn("comandas", "Comandas")}
        {tabBtn("produtos", "Produtos")}
        {tabBtn("extras", "Extras Produtos")}
        {tabBtn("salas", "Salas karaokê")}
        {tabBtn("config", "Taxa Karaokê")}
        {tabBtn("usuarios", "Usuários")}
      </div>

      {tab === "comandas" && (
        <div className="grid gap-8 lg:grid-cols-2">
          <form
            onSubmit={submitComanda}
            className="max-h-[70vh] overflow-y-auto space-y-4 rounded-xl border border-white/10 bg-pink-glass/50 p-4"
          >
            <h2 className="font-semibold text-white">
              {editComandaId == null
                ? "Nova comanda"
                : `Editar #${editComandaId}`}
            </h2>
            <Field label="Número da comanda">
              <input
                type="number"
                min={1}
                value={cNumero}
                onChange={(e) => setCNumero(e.target.value)}
                placeholder="Ex.: 12"
                className={inputClass}
              />
            </Field>
            <Field label="Quantidade de pessoas">
              <input
                type="number"
                min={1}
                value={cPessoas}
                onChange={(e) => setCPessoas(e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Status da comanda">
              <select
                value={cStatus}
                onChange={(e) => setCStatus(e.target.value)}
                className={inputClass}
              >
                {COMANDA_STATUS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </Field>
            <div className="flex gap-2 pt-1">
              <button
                type="submit"
                className="rounded-lg bg-pink-600 px-4 py-2 text-white hover:bg-pink-700"
              >
                Salvar
              </button>
              {editComandaId != null && (
                <button
                  type="button"
                  onClick={resetComandaForm}
                  className="rounded-lg border border-white/20 px-4 py-2 text-white hover:bg-white/10"
                >
                  Cancelar edição
                </button>
              )}
            </div>
          </form>
          <div className="max-h-[480px] overflow-auto rounded-xl border border-white/10 bg-purple-4/40 p-3">
            <table className="w-full text-left text-sm text-white">
              <thead className="text-pink-400">
                <tr>
                  <th className="p-2">Nº</th>
                  <th className="p-2">Pessoas</th>
                  <th className="p-2">Status</th>
                  <th className="p-2" />
                </tr>
              </thead>
              <tbody>
                {comandas.map((c) => (
                  <tr
                    key={c.id}
                    className={rowEditClass(editComandaId === c.id)}
                  >
                    <td className="p-2">{c.numero ?? "—"}</td>
                    <td className="p-2">{c.pessoas}</td>
                    <td className="p-2">{c.status}</td>
                    <td className="space-x-1 p-2">
                      <button
                        type="button"
                        className="bg-pink-600/50 p-2 rounded-xl cursor-pointer text-pink-300 transition hover:bg-pink-400/50 hover:text-white"
                        onClick={() => {
                          setEditComandaId(c.id);
                          setCPessoas(String(c.pessoas));
                          setCStatus(c.status);
                          setCMesaId(c.mesaId != null ? String(c.mesaId) : "");
                          setCNumero(c.numero != null ? String(c.numero) : "");
                          setCNome(c.nome ?? "");
                        }}
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        className="bg-red-600/50 p-2 rounded-xl cursor-pointer text-red-300 transition hover:bg-red-400/50 hover:text-white"
                        onClick={() =>
                          setDeleteTarget({
                            kind: "comanda",
                            id: c.id,
                            title: "Excluir comanda",
                            detail: `Comanda #${c.id} (${c.status}, ${c.pessoas} pessoa(s)). Esta ação não pode ser desfeita.`,
                          })
                        }
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "mesas" && (
        <div className="grid gap-8 lg:grid-cols-2">
          <form
            onSubmit={submitMesa}
            className="max-h-[70vh] overflow-y-auto space-y-4 rounded-xl border border-white/10 bg-pink-glass/50 p-4"
          >
            <h2 className="font-semibold text-white">
              {editMesaId == null ? "Nova mesa" : `Editar mesa #${editMesaId}`}
            </h2>
            <Field label="Número da mesa">
              <input
                type="number"
                value={mNumero}
                onChange={(e) => setMNumero(e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Quantidade de clientes">
              <input
                type="number"
                min={1}
                value={mQt}
                onChange={(e) =>
                  setMQt(Number.parseInt(e.target.value, 10) || 1)
                }
                placeholder="1"
                className={inputClass}
              />
            </Field>
            <Field label="Status da mesa">
              <select
                value={mStatus}
                onChange={(e) =>
                  setMStatus(e.target.value as (typeof MESA_STATUS)[number])
                }
                className={inputClass}
              >
                {MESA_STATUS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Créditos de música (karaokê)">
              <input
                type="number"
                min={1}
                value={mMusicas}
                onChange={(e) => setMMusicas(e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Sala de karaokê">
              <select
                value={mKaraoke}
                onChange={(e) =>
                  setMKaraoke(Number.parseInt(e.target.value, 10))
                }
                className={inputClass}
              >
                <option>Selecione</option>
                {salas.map((s) => (
                  <option key={s.id} value={String(s.id)}>
                    {s.nome}
                  </option>
                ))}
              </select>
            </Field>
            <div className="flex gap-2 pt-1">
              <button
                type="submit"
                className="rounded-lg bg-pink-600 px-4 py-2 text-white hover:bg-pink-700"
              >
                Salvar
              </button>
              {editMesaId != null && (
                <button
                  type="button"
                  onClick={resetMesaForm}
                  className="rounded-lg border border-white/20 px-4 py-2 text-white hover:bg-white/10"
                >
                  Cancelar edição
                </button>
              )}
            </div>
          </form>
          <div className="max-h-[70vh] overflow-auto rounded-xl border border-white/10 bg-purple-4/40 p-3">
            <table className="w-full text-left text-sm text-white">
              <thead className="text-pink-400">
                <tr>
                  <th className="p-2">Nº</th>
                  <th className="p-2">Sala</th>
                  <th className="p-2">Qt Clientes</th>
                  <th className="p-2">Créditos</th>
                  <th className="p-2" />
                </tr>
              </thead>
              <tbody>
                {mesas.map((m) => (
                  <tr key={m.id} className={rowEditClass(editMesaId === m.id)}>
                    <td className="p-2">{m.numero}</td>
                    <td className="p-2">{getSalaKaraokeById(m.karaokeId)}</td>
                    <td className="p-2">{m.qtClientes}</td>
                    <td className="p-2">{m.musicas}</td>
                    <td className="space-x-1 p-2">
                      <button
                        type="button"
                        className="bg-pink-600/50 p-2 rounded-xl cursor-pointer text-pink-300 transition hover:bg-pink-400/50 hover:text-white"
                        onClick={() => {
                          setEditMesaId(m.id);
                          setMNumero(String(m.numero));
                          setMQt(m.qtClientes);
                          setMStatus(m.status as (typeof MESA_STATUS)[number]);
                          setMMusicas(String(m.musicas));
                          setMKaraoke(m.karaokeId ?? undefined);
                        }}
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        className="bg-red-600/50 p-2 rounded-xl cursor-pointer text-red-300 transition hover:bg-red-400/50 hover:text-white"
                        onClick={() =>
                          setDeleteTarget({
                            kind: "mesa",
                            id: m.id,
                            title: "Excluir mesa",
                            detail: `${mesaOptionLabel(m)}. Esta ação não pode ser desfeita.`,
                          })
                        }
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "salas" && (
        <div className="grid gap-8 lg:grid-cols-2">
          <form
            onSubmit={submitSala}
            className="max-h-[70vh] overflow-y-auto space-y-4 rounded-xl border border-white/10 bg-pink-glass/50 p-4"
          >
            <h2 className="font-semibold text-white">
              {editSalaId == null
                ? "Nova sala de karaokê"
                : `Editar sala #${editSalaId}`}
            </h2>
            <Field label="Nome da sala">
              <input
                value={sNome}
                onChange={(e) => setSNome(e.target.value)}
                className={inputClass}
                placeholder="Sala VIP, Sala 1..."
              />
            </Field>
            <div className="flex gap-2 pt-1">
              <button
                type="submit"
                className="rounded-lg bg-pink-600 px-4 py-2 text-white hover:bg-pink-700"
              >
                Salvar
              </button>
              {editSalaId != null && (
                <button
                  type="button"
                  onClick={resetSalaForm}
                  className="rounded-lg border border-white/20 px-4 py-2 text-white hover:bg-white/10"
                >
                  Cancelar edição
                </button>
              )}
            </div>
          </form>
          <div className="max-h-[480px] overflow-auto rounded-xl border border-white/10 bg-purple-4/40 p-3">
            <table className="w-full text-left text-sm text-white">
              <thead className="text-pink-400">
                <tr>
                  <th className="p-2">Nome</th>
                  <th className="p-2" />
                </tr>
              </thead>
              <tbody>
                {salas.map((s) => (
                  <tr key={s.id} className={rowEditClass(editSalaId === s.id)}>
                    <td className="p-2">{s.nome}</td>
                    <td className="space-x-1 p-2">
                      <button
                        type="button"
                        className="bg-pink-600/50 p-2 rounded-xl cursor-pointer text-pink-300 transition hover:bg-pink-400/50 hover:text-white"
                        onClick={() => {
                          setEditSalaId(s.id);
                          setSNome(s.nome);
                        }}
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        className="bg-red-600/50 p-2 rounded-xl cursor-pointer text-red-300 transition hover:bg-red-400/50 hover:text-white"
                        onClick={() =>
                          setDeleteTarget({
                            kind: "sala",
                            id: s.id,
                            title: "Excluir sala de karaokê",
                            detail: `“${s.nome}”. Mesas que usam esta sala podem precisar de ajuste.`,
                          })
                        }
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "extras" && (
        <div className="grid gap-8 lg:grid-cols-1 xl:grid-cols-2">
          <form
            onSubmit={submitVinculoExtra}
            className="max-h-[70vh] overflow-y-auto space-y-4 rounded-xl border border-white/10 bg-pink-glass/50 p-4"
          >
            <h2 className="font-semibold text-white">
              Novo vínculo produto ↔ extra
            </h2>
            <p className="text-xs text-pink-200/80">
              O extra deve ser um produto com categoria{" "}
              <code className="text-pink-300">extra</code>.
            </p>
            <Field label="Produto principal (cardápio)">
              <select
                value={vePrincipal}
                onChange={(e) => setVePrincipal(e.target.value)}
                className={inputClass}
              >
                <option value="">Selecione…</option>
                {produtos.map((p) => (
                  <option key={p.id} value={String(p.id)}>
                    #{p.id} — {p.nome}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Produto extra (adicional)">
              <select
                value={veExtra}
                onChange={(e) => setVeExtra(e.target.value)}
                className={inputClass}
              >
                <option value="">
                  {produtosExtras.length === 0
                    ? "Nenhum produto “extra” cadastrado"
                    : "Selecione o extra…"}
                </option>
                {produtosExtras.map((p) => (
                  <option key={p.id} value={String(p.id)}>
                    #{p.id} — {p.nome} (R$ {p.preco.toFixed(2)})
                  </option>
                ))}
              </select>
            </Field>
            <button
              type="submit"
              className="rounded-lg bg-pink-600 px-4 py-2 text-white hover:bg-pink-700"
            >
              Criar vínculo
            </button>
          </form>
          <div className="max-h-[520px] overflow-auto rounded-xl border border-white/10 bg-purple-4/40 p-3">
            <table className="w-full text-left text-sm text-white">
              <thead className="text-pink-400">
                <tr>
                  <th className="p-2">Principal</th>
                  <th className="p-2">Extra</th>
                  <th className="p-2">Preço extra</th>
                  <th className="p-2" />
                </tr>
              </thead>
              <tbody>
                {vinculos.map((v) => (
                  <tr key={v.id} className="border-t border-white/10">
                    <td className="p-2">
                      #{v.produto.id} — {v.produto.nome}
                    </td>
                    <td className="p-2">
                      #{v.extraProduto.id} — {v.extraProduto.nome}
                    </td>
                    <td className="p-2">
                      R$ {v.extraProduto.preco.toFixed(2)}
                    </td>
                    <td className="p-2">
                      <button
                        type="button"
                        className="bg-red-600/50 p-2 rounded-xl cursor-pointer text-red-300 transition hover:bg-red-400/50 hover:text-white"
                        onClick={() =>
                          void unlinkExtra(v.produtoId, v.extraProdutoId)
                        }
                      >
                        Remover
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {vinculos.length === 0 && (
              <p className="p-4 text-center text-sm text-pink-200/70">
                Nenhum vínculo cadastrado.
              </p>
            )}
          </div>
        </div>
      )}

      {tab === "config" && (
        <div className="w-full space-y-4 rounded-xl border border-white/10 bg-pink-glass/50 p-6">
          <h2 className="text-lg font-semibold text-white">Taxa de karaokê</h2>
          <p className="text-sm text-pink-200/80">
            Valor cobrado <strong className="text-pink-100">por pessoa</strong>{" "}
            na comanda. No fechamento, o sistema multiplica pela quantidade de
            pessoas da comanda e soma ao total dos produtos.
          </p>
          <form onSubmit={submitSettings} className="space-y-4">
            <Field
              label="Taxa por pessoa (R$)"
              hint="Ex.: 5 ou 12,50. Zero desativa a cobrança no resumo."
            >
              <input
                value={taxaKaraokeStr}
                onChange={(e) => setTaxaKaraokeStr(e.target.value)}
                inputMode="decimal"
                className={inputClass}
              />
            </Field>
            <button
              type="submit"
              className="rounded-lg bg-pink-600 px-4 py-2 text-white hover:bg-pink-700"
            >
              Salvar
            </button>
          </form>
        </div>
      )}

      {tab === "usuarios" && (
        <div className="grid gap-8 lg:grid-cols-2">
          <form
            onSubmit={submitUser}
            className="max-h-[70vh] overflow-y-auto space-y-4 rounded-xl border border-white/10 bg-pink-glass/50 p-4"
          >
            <h2 className="font-semibold text-white">
              {editUserId == null ? "Novo usuário" : `Editar #${editUserId}`}
            </h2>
            <Field label="Nome completo">
              <input
                value={uNome}
                onChange={(e) => setUNome(e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="E-mail (login)">
              <input
                value={uEmail}
                onChange={(e) => setUEmail(e.target.value)}
                className={inputClass}
                type="email"
              />
            </Field>
            <Field
              label="Senha"
              hint={
                editUserId == null
                  ? "Mínimo 6 caracteres."
                  : "Deixe em branco para manter a senha atual; ou informe uma nova (mín. 6)."
              }
            >
              <input
                value={uSenha}
                onChange={(e) => setUSenha(e.target.value)}
                className={inputClass}
                type="password"
              />
            </Field>
            <Field label="Nível de acesso">
              <select
                value={uLevel}
                onChange={(e) => setULevel(e.target.value)}
                className={inputClass}
              >
                <option value="ADMIN">ADMIN</option>
                <option value="RECEPCAO">RECEPCAO</option>
                <option value="COZINHA">COZINHA</option>
                <option value="GARCOM">GARCOM</option>
              </select>
            </Field>
            <div className="flex gap-2 pt-1">
              <button
                type="submit"
                className="rounded-lg bg-pink-600 px-4 py-2 text-white hover:bg-pink-700"
              >
                Salvar
              </button>
              {editUserId != null && (
                <button
                  type="button"
                  onClick={resetUserForm}
                  className="rounded-lg border border-white/20 px-4 py-2 text-white hover:bg-white/10"
                >
                  Cancelar edição
                </button>
              )}
            </div>
          </form>
          <div className="max-h-[480px] overflow-auto rounded-xl border border-white/10 bg-purple-4/40 p-3">
            <table className="w-full text-left text-sm text-white">
              <thead className="text-pink-400">
                <tr>
                  <th className="p-2">Nome</th>
                  <th className="p-2">Email</th>
                  <th className="p-2">Nível</th>
                  <th className="p-2" />
                </tr>
              </thead>
              <tbody>
                {usuarios.map((u) => (
                  <tr key={u.id} className={rowEditClass(editUserId === u.id)}>
                    <td className="p-2">{u.name}</td>
                    <td className="p-2 break-all">{u.email}</td>
                    <td className="p-2">{u.level}</td>
                    <td className="space-x-1 p-2">
                      <button
                        type="button"
                        className="bg-pink-600/50 p-2 rounded-xl cursor-pointer text-pink-300 transition hover:bg-pink-400/50 hover:text-white"
                        onClick={() => {
                          setEditUserId(u.id);
                          setUNome(u.name);
                          setUEmail(u.email);
                          setUSenha("");
                          setULevel(u.level);
                        }}
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        className="bg-red-600/50 p-2 rounded-xl cursor-pointer text-red-300 transition hover:bg-red-400/50 hover:text-white"
                        onClick={() =>
                          setDeleteTarget({
                            kind: "user",
                            id: u.id,
                            title: "Excluir usuário",
                            detail: `${u.name} (${u.email}) — nível ${u.level}. Esta ação não pode ser desfeita.`,
                          })
                        }
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "produtos" && (
        <div className="grid gap-8 xl:grid-cols-2">
          <form
            onSubmit={submitProduto}
            className="max-h-[70vh] overflow-y-auto space-y-4 rounded-xl border border-white/10 bg-pink-glass/50 p-4"
          >
            <h2 className="font-semibold text-white">
              {editProdId == null ? "Novo produto" : `Editar #${editProdId}`}
            </h2>
            <Field label="Nome do produto">
              <input
                value={pNome}
                onChange={(e) => setPNome(e.target.value)}
                className={inputClass}
                placeholder="Hamburguer Duplo"
              />
            </Field>
            <Field label="Preço (R$)">
              <input
                value={pPreco}
                onChange={(e) => setPPreco(e.target.value)}
                className={inputClass}
                placeholder="24,90"
              />
            </Field>
            <Field label="Categorias">
              <div className="flex flex-wrap gap-3 rounded-lg border border-white/10 bg-purple-4/40 p-3">
                {CAT_PRESETS.map((key) => (
                  <label
                    key={key}
                    className="flex cursor-pointer items-center gap-2 text-sm text-pink-100"
                  >
                    <input
                      type="checkbox"
                      checked={pCatChecks[key]}
                      onChange={(e) =>
                        setPCatChecks((prev) => ({
                          ...prev,
                          [key]: e.target.checked,
                        }))
                      }
                      className="rounded border-white/20"
                    />
                    {key}
                  </label>
                ))}
              </div>
            </Field>
            <Field label="Descrição">
              <textarea
                value={pDesc}
                onChange={(e) => setPDesc(e.target.value)}
                className={`min-h-[88px] resize-y ${inputClass}`}
                placeholder="Pão Brioche, 2 Carnes, Queijo Cheddar.."
              />
            </Field>
            <Field label="URL da imagem">
              <input
                value={pImg}
                onChange={(e) => setPImg(e.target.value)}
                className={inputClass}
                placeholder="https://exemplo.com/imagem.jpg"
              />
            </Field>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-pink-200">
              <input
                type="checkbox"
                checked={pDisp}
                onChange={(e) => setPDisp(e.target.checked)}
                className="rounded border-white/20"
              />
              Disponível no cardápio
            </label>
            <div className="flex flex-wrap gap-2 pt-1">
              <button
                type="submit"
                className="rounded-lg bg-pink-600 px-4 py-2 text-white hover:bg-pink-700"
              >
                Salvar
              </button>
              {editProdId != null && (
                <>
                  <button
                    type="button"
                    onClick={resetProdForm}
                    className="rounded-lg border border-white/20 px-4 py-2 text-white hover:bg-white/10"
                  >
                    Novo / limpar
                  </button>
                </>
              )}
            </div>
          </form>

          <div className="max-h-[70vh] overflow-auto rounded-xl border border-white/10 bg-purple-4/40 p-3">
            <table className="w-full text-left text-sm text-white">
              <thead className="text-pink-400">
                <tr>
                  <th className="p-2">Nome</th>
                  <th className="p-2">Preço</th>
                  <th className="p-2" />
                </tr>
              </thead>
              <tbody>
                {produtos.map((p) => {
                  const trProd =
                    editProdId === p.id
                      ? "border-t border-white/10 bg-pink-600/25 ring-1 ring-inset ring-pink-400/40"
                      : extraLinkProdId === p.id
                        ? "border-t border-white/10"
                        : "border-t border-white/10";
                  return (
                    <Fragment key={p.id}>
                      <tr className={trProd}>
                        <td className="p-2">{p.nome}</td>
                        <td className="p-2">R$ {p.preco.toFixed(2)}</td>
                        <td className="space-x-1 p-2">
                          <button
                            type="button"
                            className="bg-pink-600/50 p-2 rounded-xl cursor-pointer text-pink-300 transition hover:bg-pink-400/50 hover:text-white"
                            onClick={() => {
                              setEditProdId(p.id);
                              setPNome(p.nome);
                              setPPreco(String(p.preco));
                              const { checks, other } = splitCategoriasForForm(
                                p.categoria,
                              );
                              setPCatChecks(checks);
                              setPCatsOther(other);
                              setPDesc(p.descricao ?? "");
                              setPImg(p.imagem ?? "");
                              setPDisp(p.disponivel);
                              setExtraLinkProdId(p.id);
                            }}
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            className="bg-red-600/50 p-2 rounded-xl cursor-pointer text-red-300 transition hover:bg-red-400/50 hover:text-white"
                            onClick={() =>
                              setDeleteTarget({
                                kind: "produto",
                                id: p.id,
                                title: "Excluir produto",
                                detail: `“${p.nome}” (${p.id}). Esta ação não pode ser desfeita.`,
                              })
                            }
                          >
                            Excluir
                          </button>
                        </td>
                      </tr>
                      {extraLinkProdId === p.id &&
                        (p.extrasPermitidos?.length ?? 0) > 0 && (
                          <tr className="border-t border-white/5 bg-black/20">
                            <td
                              colSpan={4}
                              className="px-3 pb-2 pt-0 text-xs text-pink-200"
                            >
                              {(p.extrasPermitidos ?? []).map((row) => (
                                <span
                                  key={row.id}
                                  className="mr-2 inline-flex items-center gap-1 rounded bg-purple-3 px-2 py-0.5"
                                >
                                  {row.extraProduto.nome}
                                  <button
                                    type="button"
                                    className="text-red-300"
                                    onClick={() =>
                                      void unlinkExtra(p.id, row.extraProdutoId)
                                    }
                                  >
                                    ×
                                  </button>
                                </span>
                              ))}
                            </td>
                          </tr>
                        )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md space-y-4 rounded-2xl border border-white/10 bg-purple-4/95 p-6 shadow-2xl backdrop-blur-md">
            <h2 className="text-lg font-semibold text-white">
              {deleteTarget.title}
            </h2>
            <p className="text-sm text-pink-100/80">{deleteTarget.detail}</p>
            <div className="flex gap-3">
              <button
                type="button"
                disabled={deleteLoading}
                onClick={() => setDeleteTarget(null)}
                className="flex-1 cursor-pointer rounded-xl border border-white/15 py-3 text-white transition hover:bg-white/10 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={deleteLoading}
                onClick={() => void confirmDelete()}
                className="flex-1 cursor-pointer rounded-xl bg-red-600 py-3 font-medium text-white transition hover:bg-red-700 disabled:opacity-50"
              >
                {deleteLoading ? "Excluindo…" : "Excluir"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
