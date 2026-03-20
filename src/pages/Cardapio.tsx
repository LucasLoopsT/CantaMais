import { useState, useEffect, useRef } from "react";
import Header from "../components/Header";
import clave from "../assets/clave.png";
import linhas from "../assets/linha.png";
import ondas from "../assets/onda.png";
import { NavLink } from "react-router-dom";

const categorias: string[] = [
  "Mais Vendidos",
  "Lanches",
  "Porções",
  "Bebidas",
];

const itens = [
  // HAMBURGUERS
  {
    id: 1,
    name: "Classic Burger",
    price: 24.90,
    img: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd",
    description: "Pão brioche, hambúrguer artesanal 150g, queijo cheddar, alface, tomate e molho da casa.",
    category: ["Lanches", "Mais Vendidos"]
  },
  {
    id: 2,
    name: "Bacon Smash",
    price: 27.90,
    img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR-TxLc_svUBldQYxUXpeDUTs73K9Q27xcaDg&s",
    description: "Dois smash burgers, cheddar derretido, bacon crocante e molho especial.",
    category: ["Lanches"]
  },
  {
    id: 3,
    name: "Onion Burger",
    price: 29.90,
    img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRgTGufEvizXJKto56RHPKo8Kb2_1ob4WpN2A&s",
    description: "Hambúrguer 180g, queijo prato, onion rings e molho barbecue.",
    category: ["Lanches"]
  },
  {
    id: 4,
    name: "Chicken Crispy",
    price: 25.90,
    img: "https://www.receitasnestle.com.br/sites/default/files/styles/recipe_detail_desktop_new/public/srh_recipes/ad2f5bca67422df23f8e6916d6afc6a2.jpg?itok=3A6mvEQY",
    description: "Frango empanado crocante, queijo, alface e maionese temperada.",
    category: ["Lanches"]
  },

  // PORÇÕES
  {
    id: 5,
    name: "Batata Frita",
    price: 16.90,
    img: "https://images.unsplash.com/photo-1576107232684-1279f390859f",
    description: "Porção de batatas fritas crocantes com sal e páprica.",
    category: ["Porções", "Mais Vendidos"]
  },
  {
    id: 6,
    name: "Batata com Cheddar e Bacon",
    price: 22.90,
    img: "https://deufome.app/img/products/donsburger-65e9250c63ac41709778188.jpg",
    description: "Batata frita coberta com cheddar cremoso e bacon crocante.",
    category: ["Porções"]
  },
  {
    id: 7,
    name: "Onion Rings",
    price: 19.90,
    img: "https://images.unsplash.com/photo-1639024471283-03518883512d",
    description: "Anéis de cebola empanados e fritos, crocantes por fora e macios por dentro.",
    category: ["Porções"]
  },
  {
    id: 8,
    name: "Isca de Frango",
    price: 23.90,
    img: "https://i.ytimg.com/vi/-_FOqcqveA4/sddefault.jpg",
    description: "Tirinhas de frango empanadas acompanhadas de molho especial.",
    category: ["Porções"]
  },

  // BEBIDAS
  {
    id: 9,
    name: "Coca-Cola Lata",
    price: 6.90,
    img: "https://http2.mlstatic.com/D_Q_NP_2X_829445-MLB105502797065_012026-P.webp",
    description: "Refrigerante Coca-Cola gelado 350ml.",
    category: ["Bebidas", "Mais Vendidos"]
  },
  {
    id: 10,
    name: "Guaraná Lata",
    price: 6.50,
    img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTdExQznrkL2HizH05elCGjkrOhjEckSOXhVw&s",
    description: "Guaraná Antarctica gelado 350ml.",
    category: ["Bebidas"]
  },
  {
    id: 11,
    name: "Suco Natural",
    price: 9.90,
    img: "https://www.citrosuco.com.br/wp-content/uploads/2022/02/THUMB-05.png",
    description: "Suco natural feito na hora (laranja, limão ou maracujá).",
    category: ["Bebidas"]
  },
  {
    id: 12,
    name: "Água Mineral",
    price: 4.50,
    img: "https://cdn.shopify.com/s/files/1/0587/8487/4575/files/f6953e89-e629-416d-a6c3-8f83706d7281.png?v=1758655811",
    description: "Água mineral sem gás 500ml.",
    category: ["Bebidas"]
  }
];

function Cardapio() {
  const [categoriaAtiva, setCategoriaAtiva] = useState<string>("Mais Vendidos");
  const [isFixed, setIsFixed] = useState<boolean>(false);

  const menuRef = useRef<HTMLUListElement | null>(null);
  const categoriasRef = useRef<Record<string, HTMLLIElement | null>>({});
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const maisVendidos = itens.filter(item =>  item.category.includes("Mais Vendidos"));
  const lanches = itens.filter(item =>  item.category.includes("Lanches"));
  const porcoes = itens.filter(item =>  item.category.includes("Porções"));
  const bebidas = itens.filter(item =>  item.category.includes("Bebidas"));

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
      }
    );

    categorias.forEach((cat) => {
      const secao = document.getElementById(cat);
      if (secao) observer.observe(secao);
    });

    return () => observer.disconnect();
  }, []);

  // detectar quando a nav chega no topo
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsFixed(!entry.isIntersecting);
      },
      {
        threshold: 0,
      }
    );

    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div className="w-full">
      <Header titulo={"Cardápio"} link={"/"} />

      {/* sentinel */}
      <div ref={sentinelRef}></div>
      {isFixed && <div className="h-10 w-full bg-purple-2 fixed top-0 z-50"></div>}
      <nav className={`w-full bg-purple-1 p-2 mt-4 z-50 ${isFixed ? "fixed top-0" : "relative"}`}>
        <img src={clave} alt="clave de sol" className="absolute -top-2 -left-5 w-22"/>
        <ul ref={menuRef} className="h-12 text-white flex items-center gap-5 ml-18 overflow-x-auto">
          {categorias.map((cat) => (
            <li
              key={cat}
              ref={(el) => {categoriasRef.current[cat] = el;}}
              onClick={() => selecionarCategoria(cat)}
              className={`w-max h-max shrink-0 px-4 py-1 rounded-full cursor-pointer transition hover:bg-pink-500 ${categoriaAtiva === cat ? "bg-pink-700" : "bg-purple-700"}`}>
              {cat}
            </li>
          ))}
        </ul>
      </nav>
      {isFixed && <div className="h-19"></div>}

      {/* SEÇÕES */}
      <div id="Mais Vendidos" className="pt-4 mt-2 overflow-hidden scroll-mt-24">
        <h2 className="text-pink-400 text-xl font-bold mb-2 pl-4">Mais Vendidos</h2>
        <div className="w-full h-max flex items-start gap-5 pl-4 overflow-x-auto">
          {maisVendidos.map((item) => (
            <NavLink to={`${item.id}`} viewTransition={true} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} key={item.id} className="relative min-h-68 h-68 cursor-pointer">
              <img src={clave} className="-z-1 min-w-18 min-h-18 w-18 h-18 absolute opacity-5 bottom-3 left-1/2 -translate-x-1/2" />
              <div className="h-full bg-pink-glass border-2 border-pink-500 rounded-2xl p-4 flex flex-col items-center gap-2 transition hover:bg-pink-glass-2 hover:text-white">
                <img src={item.img} className="min-w-40 min-h-40 w-40 h-40 object-cover rounded-2xl" />
                <div className="w-full flex flex-col items-start justify-between h-full gap-2">
                  <h3 className="text-sm text-pink-400 font-bold">{item.name}</h3>
                  <h3 className="text-pink-200">
                    R$ {item.price.toFixed(2)}
                  </h3>
                </div>
              </div>
            </NavLink>
          ))}
        </div>
      </div>

      {/* elementos decorativos */}
      <div className="relative h-30 overflow-hidden">
          <img src={ondas} alt="ondas" className="w-50 absolute top-13 -left-35 rotate-180"/>
          <img src={linhas} alt="linhas" className="w-40 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20"/>
          <img src={ondas} alt="ondas" className="w-50 absolute top-13 -right-35 rotate-180"/>
      </div>

      <div id="Lanches" className="overflow-hidden border-b-2 border-pink-400 scroll-mt-45">
        <h2 className="px-4 text-pink-400 text-xl font-bold mb-2 cursor-default">Lanches</h2>
          {lanches.map((item) => (
            <NavLink to={`${item.id}`} viewTransition={true} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} key={item.id} className="relative w-full min-h-35 h-max bg-pink-glass border-t-2 border-pink-400 p-4 flex items-center gap-5 cursor-pointer transition hover:bg-pink-glass-2">
              <img src={clave} className="min-w-20 min-h-20 w-20 h-20 absolute opacity-3 left-5 top-1/2 -translate-y-1/2"/>
              <div className="w-full flex flex-col items-start">
                <h3 className="text-white font-black">{item.name}</h3>
                <p className="text-gray-300 text-sm">{item.description}</p>
                <h3 className="text-pink-400 font-semibold text-md mt-3 ">R$ {item.price.toFixed(2)}</h3>
              </div>
              <img src={item.img} alt={item.name} className="min-w-25 min-h-25 w-25 h-25 object-cover rounded-2xl" />
            </NavLink>
          ))}
      </div>

      <div id="Porções" className="overflow-hidden pt-15 border-b-2 border-pink-400 scroll-mt-24">
        <h2 className="px-4 text-pink-400 text-xl font-bold mb-2 cursor-default">Porções</h2>
        {porcoes.map((item) => (
          <NavLink to={`${item.id}`} viewTransition={true} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} key={item.id} className="relative w-full min-h-35 h-max bg-pink-glass border-t-2 border-pink-400 p-4 flex items-center gap-5 cursor-pointer transition hover:bg-pink-glass-2">
            <img src={clave} className="min-w-20 min-h-20 w-20 h-20 absolute opacity-3 left-5 top-1/2 -translate-y-1/2"/>
            <div className="w-full flex flex-col items-start">
              <h3 className="text-white font-black">{item.name}</h3>
              <p className="text-gray-300 text-sm">{item.description}</p>
              <h3 className="text-pink-400 font-semibold text-md mt-3 ">R$ {item.price.toFixed(2)}</h3>
            </div>
            <img src={item.img} alt={item.name} className="min-w-25 min-h-25 w-25 h-25 object-cover rounded-2xl" />
          </NavLink>
        ))}
      </div>

      <div id="Bebidas" className="overflow-hidden pt-15 border-b-2 border-pink-400 scroll-mt-24">
        <h2 className="px-4 text-pink-400 text-xl font-bold mb-2 cursor-default">Bebidas</h2>
        {bebidas.map((item) => (
          <NavLink to={`${item.id}`} viewTransition={true} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} key={item.id} className="relative w-full min-h-35 h-max bg-pink-glass border-t-2 border-pink-400 p-4 flex items-center gap-5 cursor-pointer transition hover:bg-pink-glass-2">
            <img src={clave} className="min-w-20 min-h-20 w-20 h-20 absolute opacity-3 left-5 top-1/2 -translate-y-1/2"/>
            <div className="w-full flex flex-col items-start">
              <h3 className="text-white font-black">{item.name}</h3>
              <p className="text-gray-300 text-sm">{item.description}</p>
              <h3 className="text-pink-400 font-semibold text-md mt-3 ">R$ {item.price.toFixed(2)}</h3>
            </div>
            <img src={item.img} alt={item.name} className="min-w-25 min-h-25 w-25 h-25 object-cover rounded-2xl" />
          </NavLink>
        ))}
      </div>
    </div>
  );
}

export default Cardapio;