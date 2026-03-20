import { NavLink, Outlet } from "react-router-dom"
import { FaHome, FaUtensils, FaChair, FaCogs, FaMusic } from "react-icons/fa"
import { RiArrowGoBackFill } from "react-icons/ri";
import logo from "../assets/logo-transparent.png";

const menuItems = [
  {link:"/admin/dashboard",label:"Dashboard",icon:<FaHome/>},
  {link:"/admin/mesas",label:"Mesas",icon:<FaChair/>},
  {link:"/admin/cozinha",label:"Cozinha",icon:<FaUtensils/>},
  {link:"/admin/karaoke",label:"Karaoke",icon:<FaMusic/>},
  {link:"/admin/gerenciar",label:"Gerenciar",icon:<FaCogs/>},
]

export default function AdminLayout(){
    const linkStyle = ({isActive}:any) => `flex items-center gap-3 px-4 py-3 rounded-lg transition ${isActive ? "bg-pink-600 hover:bg-pink-800 text-white" : "bg-purple-3 text-pink-300 hover:bg-black/25"}`

    return(
        <div className="flex min-h-screen bg-pri">
            {/* Sidebar */}
            <aside className="w-64 bg-purple-4 border-r border-purple-3 flex flex-col">
                {/* Logo */}
                <div className="w-full flex justify-center">
                  <img
                    src={logo}
                    alt="Canta Mais"
                    className="w-20 h-20 sm:w-24 sm:h-24 md:w-46 md:h-46 drop-shadow-[8px_4px_30px_#413062]"
                  />
                </div>
                {/* Menu */}
                <nav className="flex-1 px-4 space-y-2">
                  {menuItems.map((item,index)=>(
                    <NavLink key={index} to={item.link} className={linkStyle}>
                      {item.icon}
                      {item.label}
                    </NavLink>
                  ))}
                </nav>
                <button className="m-4 px-4 py-2 bg-purple-3 text-pink-300 rounded-lg flex items-center gap-2 hover:bg-purple-2 transition cursor-pointer">
                  <RiArrowGoBackFill/>
                  Sair
                </button>
            </aside>
            {/* Conteúdo */}
            <main className="max-h-screen flex-1 p-8">
                <Outlet/>
            </main>
        </div>
    );
}