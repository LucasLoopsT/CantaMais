import { Link, NavLink, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import { customerMainNavClass } from "../customerMainNavClass";
import {
  FaMusic,
  FaUtensils,
  FaChevronRight,
  FaMicrophone,
} from "react-icons/fa";
import { FiShoppingCart } from "react-icons/fi";

const actionCards = [
  {
    to: "/cardapio",
    title: "Cardápio",
    description: "Lanches, porções e bebidas direto da sua mesa.",
    icon: FaUtensils,
    accent: "from-pink-600/20 to-transparent",
    iconClass: "text-pink-400",
  },
  {
    to: "/karaoke",
    title: "Karaokê",
    description: "Entre na fila, escolha a música e brilhe no palco.",
    icon: FaMusic,
    accent: "from-fuchsia-600/20 to-transparent",
    iconClass: "text-fuchsia-300",
  },
  {
    to: "/carrinho",
    title: "Carrinho",
    description: "Revise seus pedidos antes de enviar para a cozinha.",
    icon: FiShoppingCart,
    accent: "from-rose-600/20 to-transparent",
    iconClass: "text-rose-300",
  },
] as const;

function Home() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-dvh overflow-x-hidden bg-pri text-white">
      {/* Fundo atmosférico */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage: `
            radial-gradient(ellipse 80% 50% at 50% -20%, rgba(236, 72, 153, 0.35), transparent),
            radial-gradient(ellipse 60% 40% at 100% 50%, rgba(147, 51, 234, 0.2), transparent),
            radial-gradient(ellipse 50% 35% at 0% 80%, rgba(244, 114, 182, 0.15), transparent)
          `,
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative z-10 flex min-h-dvh flex-col">
        {/* Topo */}
        <header className="border-b border-white/5 bg-purple-4/40 backdrop-blur-md">
          <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <img
                src={logo}
                alt="Canta Mais"
                className="h-12 w-12 shrink-0 rounded-full object-cover pink-glow sm:h-14 sm:w-14"
              />
              <div className="min-w-0">
                <p className="truncate font-semibold tracking-tight text-white sm:text-lg">
                  Canta Mais
                </p>
                <p className="truncate text-xs text-pink-300/90 sm:text-sm">
                  Bar e karaokê
                </p>
              </div>
            </div>
            <nav className="flex flex-wrap items-center justify-center gap-2 sm:justify-end">
              <NavLink to="/cardapio" className={customerMainNavClass}>
                Cardápio
              </NavLink>
              <NavLink to="/karaoke" className={customerMainNavClass}>
                Fila
              </NavLink>
              <NavLink to="/carrinho" className={customerMainNavClass}>
                Carrinho
              </NavLink>
            </nav>
          </div>
        </header>

        <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-10 sm:px-6 sm:py-14 lg:py-16">
          {/* Hero */}
          <section className="grid flex-1 items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
            <div className="order-2 space-y-8 lg:order-1">
              <div className="inline-flex items-center gap-2 rounded-full border border-pink-glass-2 bg-pink-glass px-3 py-1 text-xs font-medium text-pink-200 sm:text-sm">
                <FaMicrophone className="text-pink-400" aria-hidden />
                Pedidos de comida + música na mesma noite
              </div>

              <div className="space-y-4">
                <h1 className="text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
                  Comida boa,{" "}
                  <span className="bg-gradient-to-r from-pink-400 via-fuchsia-300 to-pink-400 bg-clip-text text-transparent">
                    mic ligado
                  </span>
                  .
                </h1>
                <p className="max-w-xl text-base leading-relaxed text-pink-100/70 sm:text-lg">
                  Monte seu pedido pelo cardápio, acompanhe o carrinho e entre na
                  fila do karaokê sem sair da mesa — tudo no celular, no clima do
                  bar.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                <button
                  type="button"
                  onClick={() => navigate("/cardapio")}
                  className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-pink-600 to-pink-500 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-pink-900/40 transition hover:from-pink-500 hover:to-pink-400 hover:shadow-pink-600/25 cursor-pointer"
                >
                  Pedir agora
                  <FaChevronRight className="text-sm transition group-hover:translate-x-0.5" />
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/karaoke")}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-8 py-4 text-base font-medium text-white backdrop-blur-sm transition hover:border-pink-400/40 hover:bg-pink-glass cursor-pointer"
                >
                  <FaMusic className="text-pink-300" />
                  Ver fila do karaokê
                </button>
              </div>

              <ul className="flex flex-wrap gap-x-8 gap-y-2 text-sm text-pink-200/60">
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-pink-400" />
                  Cardápio completo
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-fuchsia-400" />
                  Fila em tempo real
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
                  Pedido na mesa
                </li>
              </ul>
            </div>

            <div className="order-1 flex justify-center lg:order-2 lg:justify-end">
              <div className="relative">
                <div className="absolute -inset-4 rounded-full bg-gradient-to-tr from-pink-600/30 via-purple-600/20 to-transparent blur-2xl" />
                <div className="relative rounded-full border border-pink-glass-2 bg-purple-4/60 p-2 shadow-2xl shadow-black/40 backdrop-blur-sm">
                  <img
                    src={logo}
                    alt=""
                    className="relative h-44 w-44 rounded-full object-cover pink-glow sm:h-56 sm:w-56 lg:h-64 lg:w-64"
                    aria-hidden
                  />
                </div>
                <div className="absolute -bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full border border-purple-3 bg-purple-4/90 px-4 py-2 text-xs text-pink-200 shadow-lg backdrop-blur-md sm:text-sm">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-pink-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-pink-500" />
                  </span>
                  Karaokê ao vivo
                </div>
              </div>
            </div>
          </section>

          {/* Cards de ação */}
          <section className="mt-14 grid gap-4 sm:grid-cols-3 sm:gap-5 lg:mt-20">
            {actionCards.map((card) => {
              const Icon = card.icon;
              return (
                <Link
                  key={card.to}
                  to={card.to}
                  className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br ${card.accent} p-6 transition duration-300 hover:-translate-y-1 hover:border-pink-400/25 hover:shadow-[0_20px_50px_-12px_rgba(236,72,153,0.25)]`}
                >
                  <div className="absolute right-4 top-4 opacity-0 transition group-hover:opacity-100">
                    <FaChevronRight className="text-pink-300" />
                  </div>
                  <div
                    className={`mb-4 inline-flex rounded-xl bg-purple-4/80 p-3 ${card.iconClass}`}
                  >
                    <Icon className="text-2xl" />
                  </div>
                  <h2 className="text-lg font-semibold text-white">
                    {card.title}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-pink-100/65">
                    {card.description}
                  </p>
                </Link>
              );
            })}
          </section>
        </main>

        <footer className="border-t border-white/5 bg-purple-4/30 py-6 text-center text-xs text-pink-200/50 sm:text-sm">
          <p>Canta Mais — experiência de bar e karaokê em um só lugar.</p>
        </footer>
      </div>
    </div>
  );
}

export default Home;
