import { useState } from "react";
import logo from '../assets/logo_happy_kids.png';
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import { setToken } from "../auth/auth";
import { toast } from "sonner";

export default function Index() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.post("login/", {
        email,      
        password
      });
      const { token, organization_id } = response.data;
      setToken(token);
      localStorage.setItem("organization_id", organization_id);
      navigate('/');
      toast.success('Login realizado com sucesso');
    } catch (error) {
      console.error(error);
      toast.error('Usuário ou senha inválidos');
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Seção preta */}
      <div className="flex-1 bg-black flex items-center justify-center p-8 lg:w-1/2">
        <div className="max-w-md text-center text-white">
          <img
            src={logo}
            alt="Happy Kids Logo"
            className="w-[120px] mx-auto mb-5"
          />
          <h1 className="font-exo text-[26px] lg:text-[30px] font-bold leading-tight mb-4">
            A gestão inteligente <br /> ao seu alcance
          </h1>
          <p className="font-exo text-base lg:text-lg leading-relaxed">
            Expanda suas locações e alcance novos patamares.
          </p>
        </div>
      </div>

      {/* Seção branca (login) */}
      <div className="flex-1 bg-white flex items-center justify-center p-8 lg:w-1/2">
        <div className="w-full max-w-[448px]">
          <h2 className="font-exo text-[26px] lg:text-[30px] font-bold leading-[36px] text-gray-900 text-center mb-6">
            Login
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1">
              <label
                htmlFor="email"
                className="block font-exo text-base font-medium leading-6 text-gray-600"
              >
                Digite seu usuário
              </label>
              <input
                id="email"
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Usuário"
                className="w-full px-3 py-2 font-exo text-lg font-light text-gray-400 border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-[#00d17d] focus:border-transparent"
                required
              />
            </div>

            {/* Password Field */}
            <div className="space-y-1">
              <label
                htmlFor="password"
                className="block font-exo text-base font-medium leading-6 text-gray-600"
              >
                Digite sua senha
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Senha"
                className="w-full px-3 py-2 font-exo text-lg font-light text-gray-400 border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-[#00d17d] focus:border-transparent"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full h-10 font-exo text-sm font-medium text-slate-50 bg-black rounded-md hover:bg-[#1b1b1b] focus:outline-none focus:ring-offset-2 transition-colors duration-200"
            >
              Entrar
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
