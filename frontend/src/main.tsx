// Imports
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createHashRouter, RouterProvider } from "react-router-dom";
import ProtectedRoute from "./Protected.route.tsx";
import { Toaster } from "react-hot-toast";
// Telas - Clientes
import Home from "./pages/Home.tsx";
import Cardapio from "./pages/Cardapio.tsx";
import Item from "./pages/Item.tsx";
import Carrinho from "./pages/Carrinho.tsx";
import Karaoke from "./pages/Karaoke.tsx";
// Telas - Admin
import Login from "./pages/Login.tsx";
import AdminLayout from "./components/AdminLayout.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import Mesas from "./pages/Mesas.tsx";
import Cozinha from "./pages/Cozinha.tsx";
import KaraokeControl from "./pages/KaraokeControl.tsx";
// import Pedidos from './pages/Pedidos';
// import Gerenciar from './pages/Gerenciar';
// Styles
import "./index.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const router = createHashRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/cardapio",
    element: <Cardapio />,
  },
  {
    path: "/cardapio/:id",
    element: <Item />,
  },
  {
    path: "/carrinho",
    element: <Carrinho />,
  },
  {
    path: "/karaoke",
    element: <Karaoke />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/admin",
    element: <ProtectedRoute />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          {
            index: true,
            element: <Dashboard />,
          },
          {
            path: "dashboard",
            element: <Dashboard />,
          },
          {
            path: "mesas",
            element: <Mesas />,
          },
          {
            path: "cozinha",
            element: <Cozinha />,
          },
          {
            path: "karaoke",
            element: <KaraokeControl />,
          },
        ],
      },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Toaster
      position="top-center"
      toastOptions={{
        style: {
          background: "#1e1b2e",
          color: "#fff",
        },
      }}
    />
    <RouterProvider router={router} />
  </StrictMode>,
);
