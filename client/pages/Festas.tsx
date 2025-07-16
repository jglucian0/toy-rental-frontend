import { Layout } from "@/components/Layout";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom"
import * as Icons from "../components/Icons";
import { ExcluirFesta } from "@/components/ExcluirFesta";
import { toast } from 'sonner';
import { Calendar } from "@/components/ui/calendar";
import { Menu } from "@headlessui/react";
import { useRef } from "react";

export default function Index() {
  // Endpoint que retorna todas as festas do banco de dados
  useEffect(() => {
    fetch("http://localhost:8000/api/festas/")
      .then((res) => res.json())
      .then((data) => setFestas(data))
      .catch((err) => console.error("Erro ao buscar festas:", err));
  }, []);

  // Função que fecha o calendario dropdown ao clicar fora do item
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        datePickerRef.current &&
        !datePickerRef.current.contains(event.target as Node)
      ) {
        setShowDatePicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Funções e Estados
  const navigate = useNavigate();
  const [festas, setFestas] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showClearButton, setShowClearButton] = useState(false);
  const datePickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setShowClearButton(selectedDate !== null);
  }, [selectedDate]);

  // Função para method "DELETE" por ID 
  const handleDelete = async (id: number) => {
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

      setFestas((prev) => prev.filter((f) => f.id !== id));
      toast.success("Festa excluida com sucesso!");
    } catch (error) {
      console.error("Erro inesperado ao excluir:", error);
      alert("Erro inesperado ao excluir a festa.");
    }
  };

  // Função para remover acentos
  const cleanText = (text: string) => {
    return text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[.,-/\s]/g, "")
      .toLowerCase();
  };

  // Função para limpar caracteres não numéricos
  const cleanNumber = (num: string) => {
    return num.replace(/\D/g, "");
  };

  const statusLabelMap = {
    pendente: "Pendente",
    confirmado: "Confirmado",
    finalizado: "Finalizado",
  };

  const formatDateToYMD = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Normaliza a busca para evitar erros por diferenças de formatação
  const normalizedSearchTerm = cleanText(searchTerm);
  const cleanedSearchTerm = cleanNumber(searchTerm);

  const filteredFestas = festas.filter((festa: any) => {
    const nomeNormalized = cleanText(festa.cliente.nome);
    const pagamentoNormalized = cleanText(festa.metodo_pagamento);
    const valorCleaned = cleanNumber(festa.valor_total);

    const dataFestaFormatada = festa.data_festa?.slice(0, 10);
    const dataSelecionada = selectedDate ? formatDateToYMD(selectedDate) : null;
    const dataMatch = dataSelecionada ? dataFestaFormatada === dataSelecionada : true;

    return (
      dataMatch &&
      (
        nomeNormalized.includes(normalizedSearchTerm) ||
        pagamentoNormalized.includes(normalizedSearchTerm) ||
        (cleanedSearchTerm && valorCleaned.includes(cleanedSearchTerm))
      )
    );
  });


  const handleClearFilter = async () => {
    setSelectedDate(null);
    try {
      const res = await fetch("http://localhost:8000/api/festas/");
      const data = await res.json();
      setFestas(data);
      toast.success("Filtro de data removido.");
    } catch (error) {
      console.error("Erro ao limpar filtro:", error);
      toast.error("Erro ao limpar filtro de data");
    }
  };

  const handleDateChange = async (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setShowDatePicker(false);

      const dataFormatada = formatDateToYMD(date);

      try {
        const res = await fetch(`http://localhost:8000/api/festas/?data_festa=${dataFormatada}`);
        const data = await res.json();
        setFestas(data);
      } catch (error) {
        console.error("Erro ao filtrar por data:", error);
        toast.error("Erro ao buscar festas por data");
      }
    }
  };

  return (
    <Layout>
      <div className="flex p-6 flex-col items-start self-stretch rounded-lg bg-white shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.10),0px_2px_4px_-2px_rgba(0,0,0,0.10)]">
        <div className="min-h-screen w-full bg-white font-exo">
          {/* Header */}
          <div className="flex py-3 pb-[14px] items-center justify-between self-stretch border-b-2 border-[#e2e8f0] relative">
            {/* Titulo */}
            <div className="text-[#020817] font-exo text-2xl font-bold leading-8 flex pl-5 flex-col items-start border-l-4 border-[#00d17d]">
              Festas
            </div>

            {/* Add Festa */}
            <button onClick={() => navigate("/festas/nova")} className="flex items-center justify-center gap-2 h-9 px-4 py-2 bg-dark-bg rounded-md shadow-sm hover:bg-gray-50 transition-colors">
              <Icons.NewMoreIcon />
              <span className="text-[#a1a1aa] mt-1 font-exo text-lg font-bold leading-7">
                Adicionar festa
              </span>
            </button>
          </div>

          {/* Festas List */}
          <div className="flex w-full flex-col items-start self-stretch gap-3 mt-6">

            {/* Search Section */}
            <div className="flex w-full flex-col md:flex-row justify-between items-start md:items-end gap-4 md:gap-0 mb-6">
              {/* Search Bar */}
              <div className="flex items-center border border-blue-border max-w-[638px] rounded-2xl px-1 ">
                <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Pesquisar por Nome ou Valor" className="flex-1 md:w-80 px-4 py-2 text-gray-placeholder font-light text-base bg-transparent outline-none" />
                <svg
                  className="w-4 h-4 opacity-30"
                  viewBox="0 0 17 17"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g opacity="0.3">
                    <path d="M15.9866 0.328369H1.48818C0.821989 0.328369 0.485833 1.13668 0.957864 1.60871L6.7373 7.38903V13.8284C6.7373 14.0731 6.85671 14.3024 7.05721 14.4428L9.55721 16.1922C10.0504 16.5374 10.7373 16.1875 10.7373 15.5777V7.38903L16.5169 1.60871C16.988 1.13762 16.6541 0.328369 15.9866 0.328369Z" fill="#2182F1" />
                  </g>
                </svg>
              </div>


              <div className="flex items-center px-1">
                <div className="flex relative" ref={datePickerRef}>
                  {showClearButton && (
                    <button
                      onClick={handleClearFilter}
                      className="flex text-sm text-slate-500 mr-2 items-center gap-2 h-9 px-4 bg-white border border-slate-200 rounded-md shadow-sm hover:bg-gray-100 transition"
                      aria-label="Limpar filtro de data"
                    >
                      Limpar filtro
                    </button>
                  )}
                  <button
                    onClick={() => setShowDatePicker(!showDatePicker)}
                    className="flex items-center gap-2 h-9 px-4 bg-white border border-slate-200 rounded-md shadow-sm hover:bg-gray-100 transition"
                  >
                    <Icons.CalendarIcon />
                    <span className="text-sm text-slate-500">
                      {selectedDate
                        ? selectedDate.toLocaleDateString("pt-BR")
                        : "Busca por data"}
                    </span>
                  </button>



                  {showDatePicker && (
                    <div className="absolute top-full right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                      <Calendar mode="single" selected={selectedDate} onSelect={handleDateChange} />
                    </div>
                  )}

                  {showDatePicker && (
                    <div className="absolute top-full right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                      <Calendar mode="single" selected={selectedDate} onSelect={handleDateChange} />
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Festas Table */}
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
                      Brinquedos
                    </th>
                    <th className="w-32"></th>
                  </tr>
                </thead>

                {/* Table Body */}
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
                        {statusLabelMap[festa.status] || festa.status}
                      </td>
                      <td className="flex flex-col py-4 px-6 text-base text-gray-900">
                        {festa.brinquedos.map((b: any, index: number) => (
                          <div key={index} className="text-base font-normal leading-6">
                            {b.nome} (1)
                          </div>
                        ))}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <ExcluirFesta
                            cliente={festa.cliente.nome}
                            onConfirm={() => handleDelete(festa.id)}
                          />
                          <Link title="Editar" to={`/festas/editar/${festa.id}`} className="p-1">
                            <Icons.EditIcon />
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
