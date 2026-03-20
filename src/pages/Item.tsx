import { useEffect, useState } from "react";
import { useParams } from "react-router-dom"
import { NavLink } from "react-router-dom";
import { IoArrowUndo } from "react-icons/io5";
import toast from "react-hot-toast";

type Extra = {
  id: number
  name: string
  price: number
}

type Product = {
  id: number
  name: string
  description: string
  price: number
  image: string
  available: boolean
  extrasLimit: number
  extras: Extra[]
}

type ExtrasState = {
  [key: number]: number
}


const itens = [
  // HAMBURGUERS
  {
    id: 1,
    name: "Classic Burger",
    price: 24.90,
    img: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd",
    description: "Pão brioche, hambúrguer artesanal 150g, queijo cheddar, alface, tomate e molho da casa.",
    category: ["Lanches", "Mais Vendidos"],
    extras: [
      { id: 1, name: "Batata Frita", price: 8 },
      { id: 2, name: "Onion Rings", price: 8 },
      { id: 3, name: "Ovo", price: 3 },
      { id: 4, name: "Catupiry", price: 6 },
    ],
    available: true,
  },
  {
    id: 2,
    name: "Bacon Smash",
    price: 27.90,
    img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR-TxLc_svUBldQYxUXpeDUTs73K9Q27xcaDg&s",
    description: "Dois smash burgers, cheddar derretido, bacon crocante e molho especial.",
    category: ["Lanches"],
    extras: [
      { id: 1, name: "Batata Frita", price: 8 },
      { id: 2, name: "Onion Rings", price: 8 },
      { id: 3, name: "Ovo", price: 3 },
      { id: 4, name: "Catupiry", price: 6 },
    ],
    available: true,
  },
  {
    id: 3,
    name: "Onion Burger",
    price: 29.90,
    img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRgTGufEvizXJKto56RHPKo8Kb2_1ob4WpN2A&s",
    description: "Hambúrguer 180g, queijo prato, onion rings e molho barbecue.",
    category: ["Lanches"],
    extras: [
      { id: 1, name: "Batata Frita", price: 8 },
      { id: 2, name: "Onion Rings", price: 8 },
      { id: 3, name: "Ovo", price: 3 },
      { id: 4, name: "Catupiry", price: 6 },
    ],
    available: true,
  },
  {
    id: 4,
    name: "Chicken Crispy",
    price: 25.90,
    img: "https://www.receitasnestle.com.br/sites/default/files/styles/recipe_detail_desktop_new/public/srh_recipes/ad2f5bca67422df23f8e6916d6afc6a2.jpg?itok=3A6mvEQY",
    description: "Frango empanado crocante, queijo, alface e maionese temperada.",
    category: ["Lanches"],
    extras: [
      { id: 1, name: "Batata Frita", price: 8 },
      { id: 2, name: "Onion Rings", price: 8 },
      { id: 3, name: "Ovo", price: 3 },
      { id: 4, name: "Catupiry", price: 6 },
    ],
    available: true,
  },

  // PORÇÕES
  {
    id: 5,
    name: "Batata Frita",
    price: 16.90,
    img: "https://images.unsplash.com/photo-1576107232684-1279f390859f",
    description: "Porção de batatas fritas crocantes com sal e páprica.",
    category: ["Porções", "Mais Vendidos"],
    extras: [
      { id: 1, name: "Batata Frita", price: 8 },
      { id: 2, name: "Onion Rings", price: 8 },
      { id: 3, name: "Ovo", price: 3 },
      { id: 4, name: "Catupiry", price: 6 },
    ],
    available: true,
  },
  {
    id: 6,
    name: "Batata com Cheddar e Bacon",
    price: 22.90,
    img: "https://deufome.app/img/products/donsburger-65e9250c63ac41709778188.jpg",
    description: "Batata frita coberta com cheddar cremoso e bacon crocante.",
    category: ["Porções"],
    extras: [
      { id: 1, name: "Batata Frita", price: 8 },
      { id: 2, name: "Onion Rings", price: 8 },
      { id: 3, name: "Ovo", price: 3 },
      { id: 4, name: "Catupiry", price: 6 },
    ],
    available: true,
  },
  {
    id: 7,
    name: "Onion Rings",
    price: 19.90,
    img: "https://images.unsplash.com/photo-1639024471283-03518883512d",
    description: "Anéis de cebola empanados e fritos, crocantes por fora e macios por dentro.",
    category: ["Porções"],
    extras: [
      { id: 1, name: "Batata Frita", price: 8 },
      { id: 2, name: "Onion Rings", price: 8 },
      { id: 3, name: "Ovo", price: 3 },
      { id: 4, name: "Catupiry", price: 6 },
    ],
    available: true,
  },
  {
    id: 8,
    name: "Isca de Frango",
    price: 23.90,
    img: "https://i.ytimg.com/vi/-_FOqcqveA4/sddefault.jpg",
    description: "Tirinhas de frango empanadas acompanhadas de molho especial.",
    category: ["Porções"],
    extras: [
      { id: 1, name: "Batata Frita", price: 8 },
      { id: 2, name: "Onion Rings", price: 8 },
      { id: 3, name: "Ovo", price: 3 },
      { id: 4, name: "Catupiry", price: 6 },
    ],
    available: true,
  },

  // BEBIDAS
  {
    id: 9,
    name: "Coca-Cola Lata",
    price: 6.90,
    img: "https://http2.mlstatic.com/D_Q_NP_2X_829445-MLB105502797065_012026-P.webp",
    description: "Refrigerante Coca-Cola gelado 350ml.",
    category: ["Bebidas", "Mais Vendidos"],
    extras: [
      { id: 1, name: "Batata Frita", price: 8 },
      { id: 2, name: "Onion Rings", price: 8 },
      { id: 3, name: "Ovo", price: 3 },
      { id: 4, name: "Catupiry", price: 6 },
    ],
    available: true,
  },
  {
    id: 10,
    name: "Guaraná Lata",
    price: 6.50,
    img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTdExQznrkL2HizH05elCGjkrOhjEckSOXhVw&s",
    description: "Guaraná Antarctica gelado 350ml.",
    category: ["Bebidas"],
    extras: [
      { id: 1, name: "Batata Frita", price: 8 },
      { id: 2, name: "Onion Rings", price: 8 },
      { id: 3, name: "Ovo", price: 3 },
      { id: 4, name: "Catupiry", price: 6 },
    ],
    available: true,
  },
  {
    id: 11,
    name: "Suco Natural",
    price: 9.90,
    img: "https://www.citrosuco.com.br/wp-content/uploads/2022/02/THUMB-05.png",
    description: "Suco natural feito na hora (laranja, limão ou maracujá).",
    category: ["Bebidas"],
    extras: [
      { id: 1, name: "Batata Frita", price: 8 },
      { id: 2, name: "Onion Rings", price: 8 },
      { id: 3, name: "Ovo", price: 3 },
      { id: 4, name: "Catupiry", price: 6 },
    ],
    available: true,
  },
  {
    id: 12,
    name: "Água Mineral",
    price: 4.50,
    img: "https://cdn.shopify.com/s/files/1/0587/8487/4575/files/f6953e89-e629-416d-a6c3-8f83706d7281.png?v=1758655811",
    description: "Água mineral sem gás 500ml.",
    category: ["Bebidas"],
    extras: [
      { id: 1, name: "Batata Frita", price: 8 },
      { id: 2, name: "Onion Rings", price: 8 },
      { id: 3, name: "Ovo", price: 3 },
      { id: 4, name: "Catupiry", price: 6 },
    ],
    available: true,
  }
];

function Item() {
  const { id } = useParams()

  const [openDialog, setOpenDialog] = useState(false);
  const [extras, setExtras] = useState<ExtrasState>({});
  const [produto, setProduto] = useState<Product | null>(null);

  const totalExtras = Object.values(extras).reduce((a, b) => a + b, 0);

  useEffect(() => {

    const item = itens.find((item) => item.id === Number(id))

    console.log("id encontrado:", id);
    console.log("Item encontrado:", item);

    if (item) {
      setProduto({
        id: item.id,
        name: item.name,
        description: item.description,
        price: item.price,
        image: item.img,
        available: item.available,
        extrasLimit: 3,
        extras: item.extras
      })
    }

  }, [id])

  const alterarExtra = (id: number, valor: number) => {

    setExtras(prev => {

      const atual = prev[id] || 0
      const novo = Math.max(0, atual + valor)

      if (valor > 0 && totalExtras >= 3) {
        return prev
      }

      return {
        ...prev,
        [id]: novo
      }

    })
  };

  const adicionarAoPedido = () => {

    if (!produto?.available) return

    const extrasSelecionados = produto.extras
      .filter(extra => extras[extra.id] > 0)
      .map(extra => ({
        ...extra,
        quantity: extras[extra.id]
      }))

    const itemPedido = {
      productId: produto.id,
      name: produto.name,
      price: produto.price,
      extras: extrasSelecionados
    }

    toast.success(`${produto.name} adicionado ao carrinho!`)

    setOpenDialog(true)
  }

  return (
    <div className="w-full min-h-screen text-white pb-28">

      {/* HEADER FLUTUANTE */}
      <div className="fixed top-4 left-4 z-50 w-16 h-16 flex items-center justify-center">
        <NavLink to={"/cardapio"} viewTransition={true} onClick={() => window.scrollTo({ top: 0 })} className="bg-white text-purple-800 p-3 rounded-full shadow cursor-pointer hover:bg-gray-200 transition">
          <IoArrowUndo className="text-xl"/>
        </NavLink>
      </div>

      {/* IMAGEM */}
      <div className="w-full h-80 overflow-hidden">
        <img src={produto?.image} className="w-full h-full object-cover"/>
      </div>

      {/* INFO PRODUTO */}
      <div className="p-6 flex flex-col gap-4">
        <h1 className="text-3xl font-bold">{produto?.name}</h1>
        <p className="text-pink-400 text-xl font-semibold">R$ {produto?.price.toFixed(2)}</p>
        <p className="text-gray-300">{produto?.description}</p>

        {/* ADICIONAIS */}
        <div className="mt-6 flex flex-col gap-4">
          <h2 className="text-xl font-semibold">Adicionais</h2>

          {produto?.extras.map(extra => {
            const quantidade = extras[extra.id] || 0

            return (
              <div key={extra.id} className="flex items-center justify-between bg-pink-glass p-4 rounded-xl">
                <div className="cursor-default">
                  <p>{extra.name}</p>
                  <span className="text-pink-300 text-sm">+ R$ {extra.price}</span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => alterarExtra(extra.id, -1)}
                    disabled={quantidade === 0}
                    className="bg-gray-800 px-3 py-1 rounded"
                  >
                    -
                  </button>
                  <span className="cursor-default">{quantidade}</span>
                  <button
                    onClick={() => alterarExtra(extra.id, 1)}
                    disabled={totalExtras >= produto.extrasLimit}
                    className={`px-3 py-1 rounded ${totalExtras >= produto.extrasLimit ? "bg-gray-700 cursor-default" : "bg-pink-600 cursor-pointer"}`}
                  >
                    +
                  </button>
                </div>
              </div>
            )
          })}
        </div>
        {/* OBSERVAÇÃO */}
        <div className="mt-6 flex flex-col gap-2">
          <label className="text-lg font-semibold">Observações</label>
          <textarea placeholder="Ex: tirar cebola..." className="bg-pink-glass p-4 rounded-xl resize-none outline-none text-pink-400" maxLength={100} rows={3}/>
        </div>
      </div>

      {/* FOOTER FIXO */}
      <div className="fixed bottom-0 left-0 w-full bg-pri p-4 border-t-2 border-purple-4">
        <button onClick={adicionarAoPedido} disabled={!produto?.available} className={`w-full p-4 rounded-xl text-lg font-semibold cursor-pointer transition ${produto?.available ? "bg-pink-600 hover:bg-pink-800" : "bg-gray-700 cursor-not-allowed"}`}>
          {produto?.available ? "Adicionar ao Pedido" : "Produto Indisponível"}
        </button>
        {openDialog && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-purple-4 m-4 p-6 rounded-2xl w-80 flex flex-col gap-4">
              <h2 className="text-xl font-bold text-white text-center">Item adicionado!</h2>
              <p className="text-gray-300 text-center">Deseja continuar comprando ou ir para o carrinho?</p>
              <div className="flex flex-col gap-3">
                <NavLink to="/cardapio" viewTransition={true} onClick={() => window.scrollTo({ top: 0 })} className="flex-1 text-center border-2 border-pink-400 bg-pink-glass text-pink-400 transition cursor-pointer hover:border-pink-700 hover:text-pink-700 py-2 rounded-lg">
                    Continuar
                </NavLink>
                <NavLink to="/carrinho" viewTransition={true} onClick={() => window.scrollTo({ top: 0 })} className="flex-1 text-center bg-pink-600 transition cursor-pointer hover:bg-pink-700 py-2 rounded-lg">
                  Ir ao Carrinho
                </NavLink>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Item;