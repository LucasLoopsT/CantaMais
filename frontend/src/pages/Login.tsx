import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FaGears } from "react-icons/fa6";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      if (email === "teste@gmail.com" && password === "teste123") {
        toast.success("Login realizado com sucesso!");
        localStorage.setItem("adminAuth", "true");
        navigate("/admin/dashboard");
      } else {
        toast.error("Email ou senha inválidos");
      }
      setLoading(false);
    }, 800);
  }

  return (
    <section className="min-h-screen bg-pri flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-pink-glass rounded-2xl p-8 shadow-xl border border-purple-3">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <FaGears className="text-6xl text-pink-500 mb-3" />
          <h1 className="text-2xl font-bold text-white text-center mb-4 border-b-4 border-pink-400/50 pb-2">
            Administração Canta Mais
          </h1>
          <p className="text-white">
            Login: <span className="text-pink-300">teste@gmail.com</span>
          </p>
          <p className="text-white">
            Senha: <span className="text-pink-300">teste123</span>
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          {/* Email */}
          <div className="flex flex-col">
            <label className="text-sm text-pink-300 mb-1">Email</label>
            <input
              type="email"
              placeholder="Digite seu email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-purple-4 border border-purple-3 rounded-lg px-4 py-3 text-white outline-none focus:border-pink-500 transition"
            />
          </div>

          {/* Senha */}
          <div className="flex flex-col">
            <label className="text-sm text-pink-300 mb-1">Senha</label>
            <input
              type="password"
              placeholder="Digite sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-purple-4 border border-purple-3 rounded-lg px-4 py-3 text-white outline-none focus:border-pink-500 transition"
            />
          </div>

          {/* Botão */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-pink-600 hover:bg-pink-700 transition text-white py-3 rounded-xl font-semibold cursor-pointer"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </section>
  );
}
