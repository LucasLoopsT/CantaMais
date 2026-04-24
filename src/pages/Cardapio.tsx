import { useState, useEffect, useRef } from "react";
import CustomerShell from "../components/CustomerShell";
import clave from "../assets/clave.png";
import linhas from "../assets/linha.png";
import ondas from "../assets/onda.png";
import { NavLink } from "react-router-dom";

const categorias: string[] = ["Mais Vendidos", "Lanches", "Porções", "Bebidas"];

const itens = [
  {
    id: 1,
    name: "Classic Burger",
    price: 24.9,
    img: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd",
    description:
      "Pão brioche, hambúrguer artesanal 150g, queijo cheddar, alface, tomate e molho da casa.",
    category: ["Lanches", "Mais Vendidos"],
  },
  {
    id: 2,
    name: "Bacon Smash",
    price: 27.9,
    img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR-TxLc_svUBldQYxUXpeDUTs73K9Q27xcaDg&s",
    description:
      "Dois smash burgers, cheddar derretido, bacon crocante e molho especial.",
    category: ["Lanches"],
  },
  {
    id: 3,
    name: "Onion Burger",
    price: 29.9,
    img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRgTGufEvizXJKto56RHPKo8Kb2_1ob4WpN2A&s",
    description: "Hambúrguer 180g, queijo prato, onion rings e molho barbecue.",
    category: ["Lanches"],
  },
  {
    id: 4,
    name: "Chicken Crispy",
    price: 25.9,
    img: "https://www.receitasnestle.com.br/sites/default/files/styles/recipe_detail_desktop_new/public/srh_recipes/ad2f5bca67422df23f8e6916d6afc6a2.jpg?itok=3A6mvEQY",
    description:
      "Frango empanado crocante, queijo, alface e maionese temperada.",
    category: ["Lanches"],
  },
  {
    id: 5,
    name: "Batata Frita",
    price: 16.9,
    img: "https://images.unsplash.com/photo-1576107232684-1279f390859f",
    description: "Porção de batatas fritas crocantes com sal e páprica.",
    category: ["Porções", "Mais Vendidos"],
  },
  {
    id: 6,
    name: "Batata com Cheddar e Bacon",
    price: 22.9,
    img: "https://deufome.app/img/products/donsburger-65e9250c63ac41709778188.jpg",
    description: "Batata frita coberta com cheddar cremoso e bacon crocante.",
    category: ["Porções"],
  },
  {
    id: 7,
    name: "Onion Rings",
    price: 19.9,
    img: "https://images.unsplash.com/photo-1639024471283-03518883512d",
    description:
      "Anéis de cebola empanados e fritos, crocantes por fora e macios por dentro.",
    category: ["Porções"],
  },
  {
    id: 8,
    name: "Isca de Frango",
    price: 23.9,
    img: "https://i.ytimg.com/vi/-_FOqcqveA4/sddefault.jpg",
    description: "Tirinhas de frango empanadas acompanhadas de molho especial.",
    category: ["Porções"],
  },
  {
    id: 9,
    name: "Coca-Cola Lata",
    price: 6.9,
    img: "https://http2.mlstatic.com/D_Q_NP_2X_829445-MLB105502797065_012026-P.webp",
    description: "Refrigerante Coca-Cola gelado 350ml.",
    category: ["Bebidas", "Mais Vendidos"],
  },
  {
    id: 10,
    name: "Guaraná Lata",
    price: 6.5,
    img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTdExQznrkL2HizH05elCGjkrOhjEckSOXhVw&s",
    description: "Guaraná Antarctica gelado 350ml.",
    category: ["Bebidas"],
  },
  {
    id: 11,
    name: "Suco Natural",
    price: 9.9,
    img: "https://www.citrosuco.com.br/wp-content/uploads/2022/02/THUMB-05.png",
    description: "Suco natural feito na hora (laranja, limão ou maracujá).",
    category: ["Bebidas"],
  },
  {
    id: 12,
    name: "Água Mineral",
    price: 4.5,
    img: "https://cdn.shopify.com/s/files/1/0587/8487/4575/files/f6953e89-e629-416d-a6c3-8f83706d7281.png?v=1758655811",
    description: "Água mineral sem gás 500ml.",
    category: ["Bebidas"],
  },
];

function Cardapio() {
  const [categoriaAtiva, setCategoriaAtiva] = useState<string>("Mais Vendidos");
  const [isFixed, setIsFixed] = useState<boolean>(false);

  const menuRef = useRef<HTMLUListElement | null>(null);
  const categoriasRef = useRef<Record<string, HTMLLIElement | null>>({});
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const maisVendidos = itens.filter((item) =>
    item.category.includes("Mais Vendidos"),
  );
  const lanches = itens.filter((item) => item.category.includes("Lanches"));
  const porcoes = itens.filter((item) => item.category.includes("Porções"));
  const bebidas = itens.filter((item) => item.category.includes("Bebidas"));

  function selecionarCategoria(cat: string) {
    setCategoriaAtiva(cat);

    const secao = document.getElementById(cat);

    if (secao) {
      secao.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }

  useEffect(() => {
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
      {
        threshold: 0.6,
      },
    );

    categorias.forEach((cat) => {
      const secao = document.getElementById(cat);
      if (secao) observer.observe(secao);
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsFixed(!entry.isIntersecting);
      },
      {
        threshold: 0,
      },
    );

    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <CustomerShell
      title="Cardápio"
      description="Lanches, porções e bebidas na sua mesa"
    >
      <div ref={sentinelRef} className="h-px w-full" aria-hidden />

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
                {cat}
              </li>
            ))}
          </ul>
        </div>
      </nav>
      {isFixed && <div className="h-2 sm:h-0" aria-hidden />}

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
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
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
                  src={item.img}
                  className="aspect-square w-full rounded-xl object-cover"
                  alt=""
                />
                <div className="flex flex-col gap-1">
                  <h3 className="text-sm font-semibold text-white">
                    {item.name}
                  </h3>
                  <p className="text-sm font-medium text-pink-300">
                    R$ {item.price.toFixed(2)}
                  </p>
                </div>
              </div>
            </NavLink>
          ))}
        </div>
      </div>

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
          className="hidden sm:block absolute left-1/2 top-[30%] w-40 -translate-x-1/2 -translate-y-1/2 opacity-30"
          aria-hidden
        />
        <img
          src={ondas}
          alt=""
          className="absolute -right-20 top-1/2 w-48 -translate-y-1/2 rotate-180"
          aria-hidden
        />
      </div>

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
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
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
                <h3 className="font-semibold text-white">{item.name}</h3>
                <p className="text-sm leading-snug text-pink-100/60">
                  {item.description}
                </p>
                <p className="mt-2 text-sm font-semibold text-pink-300">
                  R$ {item.price.toFixed(2)}
                </p>
              </div>
              <img
                src={item.img}
                alt=""
                className="relative z-10 h-20 w-20 shrink-0 rounded-xl object-cover ring-1 ring-white/10 transition group-hover:ring-pink-400/30 sm:h-24 sm:w-24"
              />
            </NavLink>
          ))}
        </div>
      </div>

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
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
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
                <h3 className="font-semibold text-white">{item.name}</h3>
                <p className="text-sm leading-snug text-pink-100/60">
                  {item.description}
                </p>
                <p className="mt-2 text-sm font-semibold text-pink-300">
                  R$ {item.price.toFixed(2)}
                </p>
              </div>
              <img
                src={item.img}
                alt=""
                className="relative z-10 h-20 w-20 shrink-0 rounded-xl object-cover ring-1 ring-white/10 transition group-hover:ring-pink-400/30 sm:h-24 sm:w-24"
              />
            </NavLink>
          ))}
        </div>
      </div>

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
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
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
                <h3 className="font-semibold text-white">{item.name}</h3>
                <p className="text-sm leading-snug text-pink-100/60">
                  {item.description}
                </p>
                <p className="mt-2 text-sm font-semibold text-pink-300">
                  R$ {item.price.toFixed(2)}
                </p>
              </div>
              <img
                src={item.img}
                alt=""
                className="relative z-10 h-20 w-20 shrink-0 rounded-xl object-cover ring-1 ring-white/10 transition group-hover:ring-pink-400/30 sm:h-24 sm:w-24"
              />
            </NavLink>
          ))}
        </div>
      </div>
    </CustomerShell>
  );
}

export default Cardapio;
