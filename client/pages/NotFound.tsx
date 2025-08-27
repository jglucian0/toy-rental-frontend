import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import logo from "../assets/logo_happy_kids.png";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    // Apenas para debug em dev - rota inválida acessada
    console.error("404 Error - Rota não encontrada:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <img
            src={logo}
            alt="Happy Kids Logo"
            className="h-[100px] flex-shrink-0"
          />
        </div>
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-4">
          Oops! Página não encontrada
        </p>
        <a href="/" className="text-blue-500 hover:text-blue-700 underline">
          Retornar ao Início
        </a>
      </div>
    </div>
  );
};

export default NotFound;