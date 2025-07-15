import { Layout } from "@/components/Layout";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom"

interface Cliente {
  nome: string;
}

interface Brinquedo {
  id: number;
  nome: string;
}

interface Locacao {
  id: number;
  cliente: Cliente;
  brinquedos: Brinquedo[];
  data_festa?: string;         
  hora_festa?: string;        
  duracao?: string;            
  hora_montagem?: string;      
  data_retirada: string;      
  hora_retirada?: string;      
  montador?: string | null;
  valor_entrada?: number;      
  qtd_parcelas?: number;
  valor_total: number;
  descricao?: string | null;
  metodo_pagamento: 'Dinheiro' | 'Cartão' | 'Pix';
  status?: 'pendente' | 'confirmado' | 'finalizado';

  // endereço da locação
  cep?: string | null;
  rua?: string | null;
  numero?: string | null;
  bairro?: string | null;
  cidade?: string | null;
  uf?: string | null;
  pais?: string;
  complemento?: string | null;
}

export default function Index() {
  const [festas, setFestas] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:8000/api/festas/")
      .then((res) => res.json())
      .then((data) => setFestas(data))
      .catch((err) => console.error("Erro ao buscar festas:", err));
  }, []);

  const formatDateTime = (datetime) => {
    const dt = new Date(datetime);
    return dt.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const EditIcon = () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 21 21"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M18.114 6.43201C18.5546 5.99153 18.8022 5.39407 18.8023 4.77105C18.8023 4.14804 18.5549 3.55052 18.1144 3.10993C17.674 2.66934 17.0765 2.42177 16.4535 2.42169C15.8305 2.42161 15.2329 2.66903 14.7924 3.10951L3.67069 14.2337C3.4772 14.4266 3.33412 14.6641 3.25402 14.9253L2.15319 18.552C2.13165 18.6241 2.13002 18.7006 2.14848 18.7736C2.16694 18.8465 2.20479 18.913 2.25802 18.9662C2.31125 19.0193 2.37787 19.0571 2.45082 19.0754C2.52377 19.0937 2.60032 19.092 2.67235 19.0703L6.29985 17.9703C6.56083 17.891 6.79833 17.7488 6.99152 17.5562L18.114 6.43201Z"
        stroke="#4B5563"
        strokeWidth="1.66667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12.9688 4.92206L16.3021 8.25539"
        stroke="#4B5563"
        strokeWidth="1.66667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  const DeleteIcon = () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 21 21"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M2.96875 5.75537H17.9687"
        stroke="#EF4444"
        strokeWidth="1.66667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16.3024 5.75537V17.422C16.3024 18.2554 15.4691 19.0887 14.6357 19.0887H6.30241C5.46908 19.0887 4.63574 18.2554 4.63574 17.422V5.75537"
        stroke="#EF4444"
        strokeWidth="1.66667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7.13574 5.75539V4.08872C7.13574 3.25539 7.96908 2.42206 8.80241 2.42206H12.1357C12.9691 2.42206 13.8024 3.25539 13.8024 4.08872V5.75539"
        stroke="#EF4444"
        strokeWidth="1.66667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.80176 9.92206V14.9221"
        stroke="#EF4444"
        strokeWidth="1.66667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12.1357 9.92206V14.9221"
        stroke="#EF4444"
        strokeWidth="1.66667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  const PlusIcon = () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 17 17"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M9.46875 2.75537C9.46875 2.20225 9.02188 1.75537 8.46875 1.75537C7.91562 1.75537 7.46875 2.20225 7.46875 2.75537V7.25537H2.96875C2.41562 7.25537 1.96875 7.70225 1.96875 8.25537C1.96875 8.8085 2.41562 9.25537 2.96875 9.25537H7.46875V13.7554C7.46875 14.3085 7.91562 14.7554 8.46875 14.7554C9.02188 14.7554 9.46875 14.3085 9.46875 13.7554V9.25537H13.9688C14.5219 9.25537 14.9688 8.8085 14.9688 8.25537C14.9688 7.70225 14.5219 7.25537 13.9688 7.25537H9.46875V2.75537Z"
        fill="white"
      />
    </svg>
  );

  const FilterIcon = () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 17 17"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="opacity-30"
    >
      <path
        d="M15.718 0.755371H1.21962C0.553434 0.755371 0.217278 1.56368 0.689309 2.03571L6.46875 7.81603V14.2554C6.46875 14.5001 6.58815 14.7294 6.78865 14.8698L9.28865 16.6192C9.78187 16.9644 10.4687 16.6145 10.4687 16.0047V7.81603L16.2483 2.03571C16.7194 1.56462 16.3856 0.755371 15.718 0.755371Z"
        fill="#2182F1"
      />
    </svg>
  );

  const CalendarIcon = () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 17 17"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M5.80176 2.08868V4.75535"
        stroke="#64748B"
        strokeWidth="1.33333"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11.1357 2.08868V4.75535"
        stroke="#64748B"
        strokeWidth="1.33333"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13.1354 3.42206H3.80208C3.0657 3.42206 2.46875 4.01901 2.46875 4.75539V14.0887C2.46875 14.8251 3.0657 15.4221 3.80208 15.4221H13.1354C13.8718 15.4221 14.4688 14.8251 14.4688 14.0887V4.75539C14.4688 4.01901 13.8718 3.42206 13.1354 3.42206Z"
        stroke="#64748B"
        strokeWidth="1.33333"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2.46875 7.42206H14.4688"
        stroke="#64748B"
        strokeWidth="1.33333"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  const HamburgerIcon = () => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 25 25"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M4.46875 6.75537H20.4688"
        stroke="#020817"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7.46875 12.7554H20.4688"
        stroke="#020817"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.4688 18.7554H20.4688"
        stroke="#020817"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  const NewClientIcon = () => (
    <svg
      className="w-4 h-4"
      viewBox="0 0 17 17"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      >
      <path
      d="M9.7373 3.32837C9.7373 2.77524 9.29043 2.32837 8.7373 2.32837C8.18418 2.32837 7.7373 2.77524 7.7373 3.32837V7.82837H3.2373C2.68418 7.82837 2.2373 8.27524 2.2373 8.82837C2.2373 9.38149 2.68418 9.82837 3.2373 9.82837H7.7373V14.3284C7.7373 14.8815 8.18418 15.3284 8.7373 15.3284C9.29043 15.3284 9.7373 14.8815 9.7373 14.3284V9.82837H14.2373C14.7904 9.82837 15.2373 9.38149 15.2373 8.82837C15.2373 8.27524 14.7904 7.82837 14.2373 7.82837H9.7373V3.32837Z"
      fill="#a1a1aa"
      />
      </svg>
  );
  

  const excluirFesta = async (id: number) => {
    const confirmar = window.confirm("Tem certeza que deseja excluir esta festa?");
    if (!confirmar) return;
  
    try {
      const res = await fetch(`http://localhost:8000/api/festas/${id}/`, {
        method: "DELETE",
      });
  
      if (!res.ok) {
        const error = await res.json();
        console.error("Erro ao excluir:", error);
        alert("Erro ao excluir a festa.");
        return;
      }
  
      // Remove a festa da lista sem recarregar a página
      setFestas((prev) => prev.filter((f) => f.id !== id));
      //alert("Festa excluída com sucesso!");
    } catch (error) {
      console.error("Erro inesperado ao excluir:", error);
      alert("Erro inesperado ao excluir a festa.");
    }
  };

  // Função para remover acentos
  const normalize = (text: string) => {
    return text
      .normalize("NFD") // separa acentos de letras
      .replace(/[\u0300-\u036f]/g, "") // remove acentos
      .replace(/[.,-/\s]/g, "")
      .toLowerCase();
  };

  // Função para limpar caracteres não numéricos
  const cleanNumber = (text: string) => {
    return text.replace(/\D/g, "");
  };

  const normalizedSearchTerm = normalize(searchTerm);
  const cleanedSearchTerm = cleanNumber(searchTerm);

  const filteredFestas = festas.filter((festa: any) => {
    const nomeNormalized = normalize(festa.cliente.nome);
    const pagamentoNormalized = normalize(festa.metodo_pagamento);
    const valorCleaned = cleanNumber(festa.valor_total);

  return (
    nomeNormalized.includes(normalizedSearchTerm) ||
    pagamentoNormalized.includes(normalizedSearchTerm) ||
    (cleanedSearchTerm && valorCleaned.includes(cleanedSearchTerm))
    );
  });

  return (
    <Layout>
    <div className="flex p-6 flex-col items-start self-stretch rounded-lg bg-white shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.10),0px_2px_4px_-2px_rgba(0,0,0,0.10)]">
      <div className="min-h-screen w-full bg-white font-exo">
        {/* Header */}
        <div className="flex py-3 pb-[14px] items-center justify-between self-stretch border-b-2 border-[#e2e8f0] relative">
          <div className="text-[#020817] font-exo text-2xl font-bold leading-8 flex pl-5 flex-col items-start border-l-4 border-[#00d17d]">
            Festas
          </div>

          {/* Add Button */}
          <button onClick={() => navigate("/festas/nova")} className="flex items-center justify-center gap-2 h-9 px-4 py-2 bg-dark-bg rounded-md shadow-sm hover:bg-gray-50 transition-colors">
            <NewClientIcon/>
            <span className="text-[#a1a1aa] mt-1 font-exo text-lg font-bold leading-7">
              Adicionar festa
            </span>
          </button>
        </div>

        {/* Client List */}
        <div className="flex w-full flex-col items-start self-stretch gap-3 mt-6">

          {/* Search Section */}
          <div className="flex w-full flex-col md:flex-row justify-between items-start md:items-end gap-4 md:gap-0 mb-6">
              
              {/* Search Bar */}
              <div className="flex items-center border border-blue-border max-w-[638px] rounded-2xl px-1 ">
                <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}  placeholder="Pesquisar por Nome ou Valor" className="flex-1 md:w-80 px-4 py-2 text-gray-placeholder font-light text-base bg-transparent outline-none"/>
                <svg
                  className="w-4 h-4 opacity-30"
                  viewBox="0 0 17 17"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  >
                    <g opacity="0.3">
                      <path d="M15.9866 0.328369H1.48818C0.821989 0.328369 0.485833 1.13668 0.957864 1.60871L6.7373 7.38903V13.8284C6.7373 14.0731 6.85671 14.3024 7.05721 14.4428L9.55721 16.1922C10.0504 16.5374 10.7373 16.1875 10.7373 15.5777V7.38903L16.5169 1.60871C16.988 1.13762 16.6541 0.328369 15.9866 0.328369Z" fill="#2182F1"/>
                    </g>
                </svg>
              </div>


              <div className="flex items-center px-1">
                <button className="flex items-center gap-2 h-9 px-4 bg-white border border-slate-200 rounded-md shadow-sm">
                  <CalendarIcon />
                  <span className="text-sm text-slate-500">Busca por data</span>
                </button>
              </div>
              
          </div>

          {/* Desktop Table */}
          <div className=" w-full overflow-x-auto">
            <table className="w-full">
                  {/* Table Header */}
                  <thead>
                    <tr className="border-b border-table-border">
                      <th className="text-left py-3 px-6 text-gray-text font-bold text-sm leading-5 tracking-wider uppercase">
                        Cliente
                      </th>
                      <th className="text-left py-3 px-6 text-gray-text font-bold text-sm leading-5 tracking-wider uppercase">
                        Data de Aluguel
                      </th>
                      <th className="text-left py-3 px-6 text-gray-text font-bold text-sm leading-5 tracking-wider uppercase">
                        Data de Retirada
                      </th>
                      <th className="text-left py-3 px-6 text-gray-text font-bold text-sm leading-5 tracking-wider uppercase">
                        Valor Total
                      </th>
                      <th className="text-left py-3 px-6 text-gray-text font-bold text-sm leading-5 tracking-wider uppercase">
                        Status
                      </th>
                      <th className="text-left py-3 px-6 text-gray-text font-bold text-sm leading-5 tracking-wider uppercase">
                        Método de Pagamento
                      </th>
                      <th className="w-32"></th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredFestas.map((festa, index) => (
                      <tr
                        key={festa.id}
                        className={`${index > 0 ? "border-t border-festas-blue-100" : ""}`}
                      >
                        <td className="py-4 px-6 text-base text-gray-900">
                          {festa.cliente.nome}
                        </td>
                        <td className="py-4 px-6 text-base text-gray-900">
                          {festa.data_festa}
                        </td>
                        <td className="py-4 px-6 text-base text-gray-900">
                          {festa.data_retirada}
                        </td>
                        <td className="py-4 px-6 text-base text-gray-900">
                          {`R$ ${parseFloat(festa.valor_total).toFixed(2).replace(".", ",")}`}
                        </td>
                        <td className="py-4 px-6 text-base text-gray-900">
                          {festa.status}
                        </td>
                        <td className="py-4 px-6 text-base text-gray-900">
                          {festa.metodo_pagamento}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <button className="p-1" onClick={() => excluirFesta(festa.id)}>
                              <DeleteIcon />
                            </button>
                            <Link to={`/festas/editar/${festa.id}`} className="p-1">
                              <EditIcon />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
          </div>

        </div>
      </div>
    </div>
    </Layout>
  );
}
