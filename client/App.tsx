import "./global.css";

//import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import NotFound from "./pages/NotFound";
import Clientes from "./pages/Clientes";
import FormCliente from "./pages/FormCliente";
import Brinquedos from "./pages/Brinquedos";
import FormBrinquedo from "./pages/FormBrinquedo";
import Festas from "./pages/Festas";
import FormFesta from "./pages/FormFesta";
import Home from "./pages/Home";
import Transacoes from './pages/Transacoes'
import FormTransacoes from './pages/FormTransacoes'

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner position="top-center" richColors />
      <BrowserRouter>
        <Routes>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
          <Route path="/" element={<Home />} />
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/clientes/novo" element={<FormCliente />} />
          <Route path="/clientes/editar/:id" element={<FormCliente />} />
          <Route path="/festas" element={<Festas />} />
          <Route path="/festas/nova" element={<FormFesta />} />
          <Route path="/festas/editar/:id" element={<FormFesta />} />
          <Route path="/brinquedos" element={<Brinquedos />} />
          <Route path="/brinquedos/novo" element={<FormBrinquedo />} />
          <Route path="/brinquedos/editar/:id" element={<FormBrinquedo />} />
          <Route path="/transacoes" element={<Transacoes />} />
          <Route path="/transacoes/nova" element={<FormTransacoes />} />
          <Route path="/transacoes/editar/:id" element={<FormTransacoes />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
