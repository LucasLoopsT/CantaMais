import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { FaHome, FaUtensils, FaChair, FaMusic } from "react-icons/fa";
import {
  RiArrowGoBackFill,
  RiMenuLine,
  RiCloseLine,
  RiSidebarFoldLine,
  RiSidebarUnfoldLine,
} from "react-icons/ri";
import logo from "../assets/logo-transparent.png";

const menuItems = [
  { link: "/admin/dashboard", label: "Dashboard", icon: <FaHome /> },
  { link: "/admin/mesas", label: "Mesas", icon: <FaChair /> },
  { link: "/admin/cozinha", label: "Cozinha", icon: <FaUtensils /> },
  { link: "/admin/karaoke", label: "Karaoke", icon: <FaMusic /> },
];

const LG = 1024;

export default function AdminLayout() {
  const navigate = useNavigate();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [asideCollapsed, setAsideCollapsed] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${LG}px)`);
    const onChange = () => {
      if (mq.matches) setMobileNavOpen(false);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (mobileNavOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileNavOpen]);

  const handleLogout = () => {
    localStorage.removeItem("adminAuth");
    navigate("/login");
  };

  const linkStyle = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 rounded-lg transition shrink-0 ${
      asideCollapsed ? "justify-center px-2 py-3 lg:px-2" : "px-4 py-3"
    } ${
      isActive
        ? "bg-pink-600 hover:bg-pink-800 text-white"
        : "bg-purple-3 text-pink-300 hover:bg-black/25"
    }`;

  const linkStyleMobile = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg transition ${
      isActive
        ? "bg-pink-600 hover:bg-pink-800 text-white"
        : "bg-purple-3 text-pink-300 hover:bg-black/25"
    }`;

  const SidebarContent = ({
    mobile,
    onNavigate,
  }: {
    mobile?: boolean;
    onNavigate?: () => void;
  }) => {
    const styleFn = mobile ? linkStyleMobile : linkStyle;
    return (
      <>
        <div
          className={`w-full flex justify-center ${
            asideCollapsed && !mobile ? "px-1" : ""
          }`}
        >
          <img
            src={logo}
            alt="Canta Mais"
            className={`drop-shadow-[8px_4px_30px_#413062] transition-all ${
              asideCollapsed && !mobile ? "w-16 h-16" : "w-46 md:h-46"
            }`}
          />
        </div>
        <nav className="flex-1 px-2 sm:px-4 space-y-2 overflow-y-auto">
          {menuItems.map((item, index) => (
            <NavLink
              key={index}
              to={item.link}
              className={styleFn}
              onClick={onNavigate}
              end={item.link === "/admin/dashboard"}
            >
              <span className="text-lg shrink-0">{item.icon}</span>
              {(!asideCollapsed || mobile) && (
                <span className="whitespace-nowrap">{item.label}</span>
              )}
              {asideCollapsed && !mobile && (
                <span className="sr-only">{item.label}</span>
              )}
            </NavLink>
          ))}
        </nav>
        <button
          onClick={() => {
            handleLogout();
            onNavigate?.();
          }}
          className={`m-2 sm:m-4 py-2 bg-purple-3 text-pink-300 rounded-lg flex items-center gap-2 hover:bg-purple-2 transition cursor-pointer shrink-0 ${
            asideCollapsed && !mobile
              ? "justify-center px-2"
              : "px-4 justify-center sm:justify-start"
          }`}
        >
          <RiArrowGoBackFill className="shrink-0" />
          {(!asideCollapsed || mobile) && <span>Sair</span>}
          {asideCollapsed && !mobile && <span className="sr-only">Sair</span>}
        </button>
      </>
    );
  };

  return (
    <div className="flex min-h-screen min-h-dvh bg-pri">
      {/* Desktop sidebar */}
      <aside
        className={`hidden lg:flex flex-col border-r border-purple-3 bg-purple-4 transition-[width] duration-200 ease-out shrink-0 ${
          asideCollapsed ? "w-[4.5rem]" : "w-64"
        }`}
      >
        <div className="flex flex-col flex-1 min-h-0">
          <div className="flex items-center justify-end px-2 pt-2 shrink-0">
            <button
              type="button"
              onClick={() => setAsideCollapsed((c) => !c)}
              className="p-2 rounded-lg text-pink-300 hover:bg-black/25 transition cursor-pointer"
              aria-label={asideCollapsed ? "Expandir menu" : "Recolher menu"}
            >
              {asideCollapsed ? (
                <RiSidebarUnfoldLine className="text-xl" />
              ) : (
                <RiSidebarFoldLine className="text-xl" />
              )}
            </button>
          </div>
          <SidebarContent />
        </div>
      </aside>

      {/* Mobile full-screen nav */}
      {mobileNavOpen && (
        <div
          className="fixed inset-0 z-[100] lg:hidden flex flex-col bg-purple-4"
          role="dialog"
          aria-modal="true"
          aria-label="Menu de navegação"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-purple-3 shrink-0">
            <span className="text-white font-semibold">Menu</span>
            <button
              type="button"
              onClick={() => setMobileNavOpen(false)}
              className="p-2 rounded-lg text-pink-300 hover:bg-black/25 transition cursor-pointer"
              aria-label="Fechar menu"
            >
              <RiCloseLine className="text-2xl" />
            </button>
          </div>
          <div className="flex flex-col flex-1 min-h-0">
            <SidebarContent mobile onNavigate={() => setMobileNavOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex flex-col flex-1 min-w-0 min-h-0">
        {/* Mobile top bar */}
        <header className="sticky top-0 z-40 flex items-center gap-3 px-4 py-3 border-b border-purple-3 bg-purple-4/95 backdrop-blur-sm lg:hidden shrink-0">
          <button
            type="button"
            onClick={() => setMobileNavOpen(true)}
            className="p-2 rounded-lg text-pink-300 hover:bg-black/25 transition cursor-pointer"
            aria-label="Abrir menu"
          >
            <RiMenuLine className="text-2xl" />
          </button>
          <img
            src={logo}
            alt=""
            className="w-20 h-20 object-contain opacity-90"
            aria-hidden
          />
          <span className="text-white font-medium truncate">Admin</span>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 min-h-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
