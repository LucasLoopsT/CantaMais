import { useState, useEffect, useRef, useMemo } from "react";
import CustomerShell from "../components/CustomerShell";
import clave from "../assets/clave.png";
import linhas from "../assets/linha.png";
import ondas from "../assets/onda.png";
import { NavLink } from "react-router-dom";
import { api } from "../lib/api";
import type { ApiProduto } from "../types/produto";

const MENU_ORDER = ["Mais Vendidos", "Lanches", "Porções", "Bebidas"];

const PLACEHOLDER_IMG =
  "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400";

function hasCat(p: ApiProduto, cat: string) {
  const t = cat.trim().toLowerCase();
  return p.categoria.some((c) => c.trim().toLowerCase() === t);
}

function Cardapio() {
  const [produtos, setProdutos] = useState<ApiProduto[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [categoriaAtiva, setCategoriaAtiva] = useState<string>("Mais Vendidos");
  const [isFixed, setIsFixed] = useState<boolean>(false);

  const menuRef = useRef<HTMLUListElement | null>(null);
  const categoriasRef = useRef<Record<string, HTMLLIElement | null>>({});
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const categorias = useMemo(() => {
    const set = new Set<string>();
    produtos.forEach((p) => {
      p.categoria.forEach((c) => {
        if (c.trim().toLowerCase() !== "extra") set.add(c);
      });
    });
    const ordered = MENU_ORDER.filter((c) => set.has(c));
    const rest = [...set].filter((c) => !MENU_ORDER.includes(c));
    return [...ordered, ...rest];
  }, [produtos]);

  const maisVendidos = useMemo(
    () => produtos.filter((p) => hasCat(p, "Mais Vendidos")),
    [produtos],
  );
  const lanches = useMemo(
    () => produtos.filter((p) => hasCat(p, "Lanches")),
    [produtos],
  );
  const porcoes = useMemo(
    () => produtos.filter((p) => hasCat(p, "Porções")),
    [produtos],
  );
  const bebidas = useMemo(
    () => produtos.filter((p) => hasCat(p, "Bebidas")),
    [produtos],
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const { data } = await api.get<ApiProduto[]>("/produtos", {
          params: { apenasCardapio: "1" },
        });
        if (!cancelled) setProdutos(data);
      } catch {
        if (!cancelled) {
          setLoadError("Não foi possível carregar o cardápio.");
          setProdutos([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  function selecionarCategoria(cat: string) {
    setCategoriaAtiva(cat);
    const secao = document.getElementById(cat);
    if (secao) {
      secao.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  useEffect(() => {
    if (categorias.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.intersectionRatio > 0.6) {
            const id = entry.target.id;
            setCategoriaAtiva(id);
            const elemento = categoriasRef.current[id];
            if (elemento) {
              elemento.scrollIntoView({
                behavior: "smooth",
                inline: "center",
                block: "nearest",
              });
            }
          }
        });
      },
      { threshold: 0.6 },
    );

    categorias.forEach((cat) => {
      const secao = document.getElementById(cat);
      if (secao) observer.observe(secao);
    });

    return () => observer.disconnect();
  }, [categorias]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsFixed(!entry.isIntersecting);
      },
      { threshold: 0 },
    );
    if (sentinelRef.current) observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, []);

  function imgUrl(p: ApiProduto) {
    const u = p.imagem?.trim();
    return u && u.length > 0 ? u : PLACEHOLDER_IMG;
  }

  return (
    <CustomerShell
      title="Cardápio"
      description="Lanches, porções e bebidas na sua mesa"
    >
      <div ref={sentinelRef} className="h-px w-full" aria-hidden />

      {loadError && (
        <p className="mb-4 rounded-xl border border-amber-500/40 bg-amber-950/30 px-4 py-3 text-sm text-amber-100">
          {loadError}
        </p>
      )}

      {isFixed && (
        <div className="pointer-events-none h-14 w-full sm:h-12" aria-hidden />
      )}
      <nav
        className={`z-40 w-full transition-shadow ${
          isFixed
            ? "fixed left-0 right-0 top-0 border-b border-white/10 bg-purple-4/90 shadow-[0_8px_32px_rgba(0,0,0,0.35)] backdrop-blur-md"
            : "relative mt-1 rounded-2xl border border-white/10 bg-purple-4/60 shadow-lg backdrop-blur-sm"
        }`}
      >
        <div className="relative mx-auto max-w-6xl px-3 py-2 sm:px-4 sm:py-2.5">
          <img
            src={clave}
            alt=""
            className="pointer-events-none absolute -left-1 top-1/2 w-14 -translate-y-1/2 opacity-40 sm:left-2 sm:w-16"
            aria-hidden
          />
          <ul
            ref={menuRef}
            className="ml-10 flex h-11 items-center gap-2 overflow-x-auto pr-2 sm:ml-14 sm:gap-3"
          >
            {categorias.map((cat) => (
              <li
                key={cat}
                ref={(el) => {
                  categoriasRef.current[cat] = el;
                }}
                onClick={() => selecionarCategoria(cat)}
                className={`w-max shrink-0 cursor-pointer rounded-full px-4 py-1.5 text-sm font-medium transition ${
                  categoriaAtiva === cat
                    ? "bg-gradient-to-r from-pink-600 to-pink-500 text-white shadow-md shadow-pink-900/30"
                    : "border border-white/10 bg-white/5 text-pink-100 hover:border-pink-400/30 hover:bg-pink-glass"
                }`}
              >
                {cat === "Mais Vendidos" ? "Mais vendidos" : cat}
              </li>
            ))}
          </ul>
        </div>
      </nav>
      {isFixed && <div className="h-2 sm:h-0" aria-hidden />}

      {loading ? (
        <p className="py-12 text-center text-pink-200/80">Carregando cardápio…</p>
      ) : produtos.length === 0 ? (
        <p className="py-12 text-center text-pink-200/80">
          Nenhum produto disponível no momento.
        </p>
      ) : (
        <>
          {maisVendidos.length > 0 && (
            <div
              id="Mais Vendidos"
              className="scroll-mt-28 overflow-hidden pt-6 sm:scroll-mt-24"
            >
              <h2 className="text-lg font-bold sm:text-xl">
                <span className="bg-gradient-to-r from-pink-300 to-fuchsia-300 bg-clip-text text-transparent">
                  Mais vendidos
                </span>
              </h2>
              <div className="-mx-1 flex items-start gap-4 overflow-x-auto px-1 py-4 sm:gap-5">
                {maisVendidos.map((item) => (
                  <NavLink
                    to={`${item.id}`}
                    viewTransition
                    onClick={() =>
                      window.scrollTo({ top: 0, behavior: "smooth" })
                    }
                    key={item.id}
                    className="group relative min-w-[11rem] max-w-[11rem] shrink-0 cursor-pointer sm:min-w-[12.5rem] sm:max-w-[12.5rem]"
                  >
                    <img
                      src={clave}
                      className="pointer-events-none absolute bottom-3 left-1/2 -z-10 h-16 w-16 -translate-x-1/2 opacity-[0.07]"
                      alt=""
                      aria-hidden
                    />
                    <div className="flex h-full flex-col gap-3 rounded-2xl border border-white/10 bg-gradient-to-b from-pink-glass to-purple-4/40 p-3 transition duration-300 group-hover:-translate-y-0.5 group-hover:border-pink-400/25 group-hover:shadow-[0_16px_40px_-12px_rgba(236,72,153,0.2)]">
                      <img
                        src={imgUrl(item)}
                        className="aspect-square w-full rounded-xl object-cover"
                        alt=""
                      />
                      <div className="flex flex-col gap-1">
                        <h3 className="text-sm font-semibold text-white">
                          {item.nome}
                        </h3>
                        <p className="text-sm font-medium text-pink-300">
                          R$ {item.preco.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </NavLink>
                ))}
              </div>
            </div>
          )}

          <div className="relative my-10 overflow-hidden rounded-2xl py-6 opacity-50">
            <img
              src={ondas}
              alt=""
              className="absolute -left-20 top-1/2 w-48 -translate-y-1/2 rotate-180"
              aria-hidden
            />
            <img
              src={linhas}
              alt=""
              className="absolute left-1/2 top-[30%] hidden w-40 -translate-x-1/2 -translate-y-1/2 opacity-30 sm:block"
              aria-hidden
            />
            <img
              src={ondas}
              alt=""
              className="absolute -right-20 top-1/2 w-48 -translate-y-1/2 rotate-180"
              aria-hidden
            />
          </div>

          {lanches.length > 0 && (
            <div
              id="Lanches"
              className="scroll-mt-28 overflow-hidden rounded-2xl border border-white/10 sm:scroll-mt-24"
            >
              <h2 className="border-b border-white/10 bg-purple-4/40 px-4 py-3 text-lg font-bold sm:text-xl">
                <span className="bg-gradient-to-r from-pink-300 to-fuchsia-300 bg-clip-text text-transparent">
                  Lanches
                </span>
              </h2>
              <div className="divide-y divide-white/5">
                {lanches.map((item) => (
                  <NavLink
                    to={`${item.id}`}
                    viewTransition
                    onClick={() =>
                      window.scrollTo({ top: 0, behavior: "smooth" })
                    }
                    key={item.id}
                    className="group relative flex cursor-pointer items-center gap-4 bg-gradient-to-r from-transparent to-purple-4/20 p-4 transition hover:bg-pink-glass/40 sm:gap-5"
                  >
                    <img
                      src={clave}
                      className="pointer-events-none absolute left-4 top-1/2 h-16 w-16 -translate-y-1/2 opacity-[0.06]"
                      alt=""
                      aria-hidden
                    />
                    <div className="relative z-10 flex min-w-0 flex-1 flex-col items-start gap-1">
                      <h3 className="font-semibold text-white">{item.nome}</h3>
                      <p className="text-sm leading-snug text-pink-100/60">
                        {item.descricao ?? " "}
                      </p>
                      <p className="mt-2 text-sm font-semibold text-pink-300">
                        R$ {item.preco.toFixed(2)}
                      </p>
                    </div>
                    <img
                      src={imgUrl(item)}
                      alt=""
                      className="relative z-10 h-20 w-20 shrink-0 rounded-xl object-cover ring-1 ring-white/10 transition group-hover:ring-pink-400/30 sm:h-24 sm:w-24"
                    />
                  </NavLink>
                ))}
              </div>
            </div>
          )}

          {porcoes.length > 0 && (
            <div
              id="Porções"
              className="mt-10 scroll-mt-28 overflow-hidden rounded-2xl border border-white/10 sm:scroll-mt-24"
            >
              <h2 className="border-b border-white/10 bg-purple-4/40 px-4 py-3 text-lg font-bold sm:text-xl">
                <span className="bg-gradient-to-r from-pink-300 to-fuchsia-300 bg-clip-text text-transparent">
                  Porções
                </span>
              </h2>
              <div className="divide-y divide-white/5">
                {porcoes.map((item) => (
                  <NavLink
                    to={`${item.id}`}
                    viewTransition
                    onClick={() =>
                      window.scrollTo({ top: 0, behavior: "smooth" })
                    }
                    key={item.id}
                    className="group relative flex cursor-pointer items-center gap-4 bg-gradient-to-r from-transparent to-purple-4/20 p-4 transition hover:bg-pink-glass/40 sm:gap-5"
                  >
                    <img
                      src={clave}
                      className="pointer-events-none absolute left-4 top-1/2 h-16 w-16 -translate-y-1/2 opacity-[0.06]"
                      alt=""
                      aria-hidden
                    />
                    <div className="relative z-10 flex min-w-0 flex-1 flex-col items-start gap-1">
                      <h3 className="font-semibold text-white">{item.nome}</h3>
                      <p className="text-sm leading-snug text-pink-100/60">
                        {item.descricao ?? " "}
                      </p>
                      <p className="mt-2 text-sm font-semibold text-pink-300">
                        R$ {item.preco.toFixed(2)}
                      </p>
                    </div>
                    <img
                      src={imgUrl(item)}
                      alt=""
                      className="relative z-10 h-20 w-20 shrink-0 rounded-xl object-cover ring-1 ring-white/10 transition group-hover:ring-pink-400/30 sm:h-24 sm:w-24"
                    />
                  </NavLink>
                ))}
              </div>
            </div>
          )}

          {bebidas.length > 0 && (
            <div
              id="Bebidas"
              className="mt-10 scroll-mt-28 overflow-hidden rounded-2xl border border-white/10 sm:scroll-mt-24"
            >
              <h2 className="border-b border-white/10 bg-purple-4/40 px-4 py-3 text-lg font-bold sm:text-xl">
                <span className="bg-gradient-to-r from-pink-300 to-fuchsia-300 bg-clip-text text-transparent">
                  Bebidas
                </span>
              </h2>
              <div className="divide-y divide-white/5">
                {bebidas.map((item) => (
                  <NavLink
                    to={`${item.id}`}
                    viewTransition
                    onClick={() =>
                      window.scrollTo({ top: 0, behavior: "smooth" })
                    }
                    key={item.id}
                    className="group relative flex cursor-pointer items-center gap-4 bg-gradient-to-r from-transparent to-purple-4/20 p-4 transition hover:bg-pink-glass/40 sm:gap-5"
                  >
                    <img
                      src={clave}
                      className="pointer-events-none absolute left-4 top-1/2 h-16 w-16 -translate-y-1/2 opacity-[0.06]"
                      alt=""
                      aria-hidden
                    />
                    <div className="relative z-10 flex min-w-0 flex-1 flex-col items-start gap-1">
                      <h3 className="font-semibold text-white">{item.nome}</h3>
                      <p className="text-sm leading-snug text-pink-100/60">
                        {item.descricao ?? " "}
                      </p>
                      <p className="mt-2 text-sm font-semibold text-pink-300">
                        R$ {item.preco.toFixed(2)}
                      </p>
                    </div>
                    <img
                      src={imgUrl(item)}
                      alt=""
                      className="relative z-10 h-20 w-20 shrink-0 rounded-xl object-cover ring-1 ring-white/10 transition group-hover:ring-pink-400/30 sm:h-24 sm:w-24"
                    />
                  </NavLink>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </CustomerShell>
  );
}

export default Cardapio;
