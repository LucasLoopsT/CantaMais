import { useNavigate } from "react-router-dom";
import { IoArrowUndo } from "react-icons/io5";
import logo from "../assets/logo.png";

function Header({ titulo, link }: { titulo: string, link: string }) {
  const navigate = useNavigate();

  return (
    <header className="w-full">
      <nav className="h-max flex items-center justify-between px-4 md:px-10 py-4">

        <div className="h-full flex flex-col">
          <IoArrowUndo
            className="text-3xl md:text-5xl text-purple-700 transition hover:text-purple-900 cursor-pointer"
            onClick={() => navigate(link)}
          />

          <h2 className="text-white text-4xl sm:text-3xl md:text-5xl font-bold ml-4 cursor-default">
            {titulo}
          </h2>
        </div>

        <img
          src={logo}
          alt="Canta Mais"
          className="w-24 h-24 sm:w-28 sm:h-28 md:w-40 md:h-40 rounded-full pink-glow"
        />
      </nav>
    </header>
  );
}

export default Header;