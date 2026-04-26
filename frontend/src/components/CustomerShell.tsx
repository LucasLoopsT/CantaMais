import { Link, NavLink } from "react-router-dom";
import { IoArrowUndo } from "react-icons/io5";
import logo from "../assets/logo.png";
import { customerMainNavClass } from "../customerMainNavClass";

type CustomerShellProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
};

export default function CustomerShell({
  title,
  description,
  children,
}: CustomerShellProps) {
  return (
    <div className="relative min-h-dvh overflow-x-hidden bg-pri text-white">
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
        <header className="relative z-40 border-b border-white/5 bg-purple-4/50 backdrop-blur-md">
          <div className="mx-auto max-w-6xl space-y-3 px-4 py-3 sm:flex sm:items-center sm:justify-between sm:gap-4 sm:space-y-0 sm:px-6 sm:py-4">
            <div className="flex min-w-0 items-center gap-3 sm:gap-4">
              <Link
                to="/"
                className="shrink-0 rounded-full border border-white/10 p-2 text-pink-200 transition hover:border-pink-500/40 hover:bg-pink-glass hover:text-white"
                aria-label="Voltar ao início"
              >
                <IoArrowUndo className="text-xl sm:text-2xl" />
              </Link>
              <Link
                to="/"
                className="hidden shrink-0 sm:block"
                aria-label="Canta Mais — início"
              >
                <img
                  src={logo}
                  alt=""
                  className="h-11 w-11 rounded-full object-cover pink-glow"
                  aria-hidden
                />
              </Link>
              <div className="min-w-0">
                <h1 className="truncate text-base font-semibold tracking-tight text-white sm:text-lg">
                  {title}
                </h1>
                {description ? (
                  <p className="truncate text-xs text-pink-300/90 sm:text-sm">
                    {description}
                  </p>
                ) : null}
              </div>
            </div>
            <div className="border-t border-white/5 pt-3 sm:border-0 sm:pt-0">
              <nav className="flex flex-1 flex-wrap justify-center gap-2 sm:flex-none sm:justify-end sm:gap-2">
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
          </div>
        </header>

        <main className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col px-4 py-6 sm:px-6 sm:py-8">
          {children}
        </main>

        <footer className="border-t border-white/5 bg-purple-4/30 py-4 text-center text-xs text-pink-200/50 sm:text-sm">
          <p>Canta Mais — bar e karaokê.</p>
        </footer>
      </div>
    </div>
  );
}
