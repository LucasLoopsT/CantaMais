import logo from "../assets/logo.png";
import { FaMusic, FaUtensils } from "react-icons/fa";
import { FiShoppingCart } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  return (
    <div className='w-full h-screen'>
      <div className='h-full flex flex-col items-center justify-center gap-10'>
        <img src={logo} className="h-72 w-72 rounded-full pink-glow" />
      
        <div className='flex flex-col gap-4'>
          <button className="w-72 flex items-center justify-center gap-1.5 bg-gray-800 text-white p-5 rounded-2xl transition hover:bg-gray-900 hover:text-pink-400 cursor-pointer" onClick={() => navigate("cardapio")}>
            <FaUtensils /> Fazer Pedidos
          </button>

          <button className="w-72 flex items-center justify-center gap-1.5 bg-gray-800 text-white p-5 rounded-2xl transition hover:bg-gray-900 hover:text-pink-400 cursor-pointer" onClick={() => navigate('carrinho')}>
            <FiShoppingCart /> Carrinho
          </button>

          <button className="w-72 flex items-center justify-center gap-1.5 bg-gray-800 text-white p-5 rounded-2xl transition hover:bg-gray-900 hover:text-pink-400 cursor-pointer" onClick={() => navigate('karaoke')}>
            <FaMusic /> Fila Karaoke
          </button>
        </div>
      </div>
    </div>
  );
}

export default Home;