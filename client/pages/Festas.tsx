import { Layout } from "@/components/Layout";
import { useEffect, useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { Calendar } from "@/components/ui/calendar";
import { ExcluirFesta } from "../components/ModalExcluir";
import { formatMoney, normalize } from "../lib/formatters";
import { Switch } from "@/components/ui/switch";
import api from "../services/api";
import { Menu, Transition } from "@headlessui/react";
import * as Icons from "../components/Icons";
import { LuFilePen, LuFilePlus2 } from "react-icons/lu";
import { AnexarContrato } from "../components/AnexarContrato";
import { ModalWhatsApp } from "../components/ModalWhatsApp";
import { FloatingPortal } from "@floating-ui/react";
import { useFloatingDropdown } from "../hooks/useFloatingDropdown";
import { Fragment } from "react";


function PagamentoDropdown({ festa, pagamentoOptions, updatePagamento, pagamentoLabelMap }: any) {
  const { refs, floatingStyles, update } = useFloatingDropdown(100);

  return (
    <td className="py-4 px-6 whitespace-nowrap">
      <div className="flex items-center gap-2 py-2 h-9">
        <Menu as="div" className="w-full">
          {({ open }) => (
            <>
              <Menu.Button
                ref={refs.setReference}
                onClick={update} // garante cálculo antes de abrir
                className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm flex items-center gap-1
                  ${festa.pagamento === "nao_pago"
                    ? "bg-[#fef9c3] text-[#854d0e]"
                    : festa.pagamento === "entrada"
                      ? "bg-[#dbeafe] text-[#1e40af]"
                      : festa.pagamento === "pago"
                        ? "bg-[#dcfce7] text-[#166534]"
                        : "bg-gray-200 text-gray-800"
                  }`}
              >
                {pagamentoLabelMap[festa.pagamento] || festa.pagamento}
                <Icons.ChevronDownIcon />
              </Menu.Button>

              <FloatingPortal>
                <Transition
                  as={Fragment}
                  show={open}
                  enter="transition ease-out duration-100"
                  enterFrom="opacity-0 scale-95"
                  enterTo="opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="opacity-100 scale-100"
                  leaveTo="opacity-0 scale-95"
                >
                  <Menu.Items
                    ref={refs.setFloating}
                    style={{ ...floatingStyles, zIndex: 9999 }}
                    className="rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none outline-none"
                  >
                    {pagamentoOptions.map((option: any) => (
                      <Menu.Item key={option.value}>
                        {({ active }) => (
                          <button
                            onClick={() => updatePagamento(festa.id, option.value)}
                            className={`${active ? "bg-gray-100" : ""} w-full px-4 py-2 text-sm flex items-center gap-2 text-left`}
                          >
                            <span
                              className={`flex font-medium ${option.value === "nao_pago"
                                  ? "text-[#854d0e]"
                                  : option.value === "entrada"
                                    ? "text-[#1e40af]"
                                    : option.value === "pago"
                                      ? "text-[#166534]"
                                      : "text-gray-600"
                                }`}
                            >
                              {option.label}
                            </span>
                          </button>
                        )}
                      </Menu.Item>
                    ))}
                  </Menu.Items>
                </Transition>
              </FloatingPortal>
            </>
          )}
        </Menu>
      </div>
    </td>
  );
}

function StatusDropdown({ festa, statusOptions, updateStatus }: any) {
  const { refs, floatingStyles, update } = useFloatingDropdown(150);

  const statusColors = (status: string) =>
    status === "pendente"
      ? "bg-[#fef9c3] text-[#854d0e]"
      : status === "confirmado"
        ? "bg-[#dcfce7] text-[#166534]"
        : status === "montado"
          ? "bg-[#dbeafe] text-[#1e40af]"
          : status === "recolher"
            ? "bg-[#fee2c3] text-[#a75e0b]"
            : status === "finalizado"
              ? "bg-[#f3e8ff] text-[#6b21a8]"
              : "bg-gray-200 text-gray-800";

  return (
    <td className="py-4 px-6 whitespace-nowrap">
      <div className="flex items-center gap-2 py-2 h-9">
        <Menu as="div" className="w-full">
          {({ open }) => (
            <>
              <Menu.Button
                ref={refs.setReference}
                onClick={update}
                className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm flex items-center gap-1 ${statusColors(
                  festa.status
                )}`}
              >
                <div className="flex items-center gap-2 px-1 sm:px-3 py-2 rounded-full h-9">
                  {festa.status === "confirmado" && <Icons.StatusConfirmadoIcon />}
                  {festa.status === "finalizado" && <Icons.StatusFinalizadoIcon />}
                  {festa.status === "pendente" && <Icons.StatusPendenteIcon />}
                  {festa.status === "montado" && <Icons.StatusMontadoIcon />}
                  {festa.status === "recolher" && <Icons.StatusRecolherIcon />}
                </div>
                {festa.status}
                <Icons.ChevronDownIcon />
              </Menu.Button>

              <FloatingPortal>
                <Transition
                  as={Fragment}
                  show={open}
                  enter="transition ease-out duration-100"
                  enterFrom="opacity-0 scale-95"
                  enterTo="opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="opacity-100 scale-100"
                  leaveTo="opacity-0 scale-95"
                >
                  <Menu.Items
                    ref={refs.setFloating}
                    style={{ ...floatingStyles, zIndex: 9999 }}
                    className="rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none outline-none"
                  >
                    {statusOptions.map((option: any) => (
                      <Menu.Item key={option.value}>
                        {({ active }) => (
                          <button
                            onClick={() => updateStatus(festa.id, option.value)}
                            className={`${active ? "bg-gray-100" : ""} w-full px-4 py-2 text-sm flex items-center gap-2 text-left`}
                          >
                            <span
                              className={`flex font-medium ${option.value === "pendente"
                                  ? "text-[#854d0e]"
                                  : option.value === "confirmado"
                                    ? "text-[#166534]"
                                    : option.value === "finalizado"
                                      ? "text-[#6b21a8]"
                                      : option.value === "montado"
                                        ? "text-[#1e40af]"
                                        : option.value === "recolher"
                                          ? "text-[#a75e0b]"
                                          : "text-gray-600"
                                }`}
                            >
                              {option.label}
                            </span>
                          </button>
                        )}
                      </Menu.Item>
                    ))}
                  </Menu.Items>
                </Transition>
              </FloatingPortal>
            </>
          )}
        </Menu>
      </div>
    </td>
  );
}

export default function Festas() {
  const navigate = useNavigate();

  // Estados principais
  const [mostrarAntigas, setMostrarAntigas] = useState(false);
  const [locacoes, setLocacoes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showClearButton, setShowClearButton] = useState(false);
  const [clientes, setClientes] = useState<Record<number, { nome: string; telefone: string }>>({});


  const datePickerRef = useRef<HTMLDivElement>(null);

  // Ao montar, carrega locações e cacheia nomes dos clientes
  useEffect(() => {
    const carregarLocacoesEClientes = async () => {
      try {
        const response = await api.get("/locacoes/");
        const locacoesData = response.data;
        setLocacoes(locacoesData);

        const idsClientesUnicos = [...new Set(locacoesData.map((loc: any) => Number(loc.cliente)))];

        for (const id of idsClientesUnicos) {
          await fetchClienteNome(Number(id));
        }
      } catch (erro) {
        console.error("Erro ao carregar locações ou clientes:", erro);
      }
    };

    carregarLocacoesEClientes();
  }, []);

  // Fecha calendário se clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setShowDatePicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Atualiza botão limpar se uma data está selecionada
  useEffect(() => {
    setShowClearButton(selectedDate !== null);
  }, [selectedDate]);

  // Busca nome do cliente e salva no cache para evitar chamadas repetidas
  const fetchClienteNome = async (clienteId: number) => {
    if (clientes[clienteId]) return;

    try {
      const res = await api.get(`/clientes/${clienteId}/`);
      const { nome, telefone } = res.data;
      setClientes(prev => ({ ...prev, [clienteId]: { nome, telefone } }));
    } catch (err) {
      console.error(`Erro ao buscar cliente ${clienteId}`, err);
    }
  };

  // Normaliza texto para comparação
  const normalizedSearchTerm = normalize(searchTerm);

  // Formata data para exibir dia/mês e nome do dia da semana
  const formatDateToDayAndMonth = (dateString: string) => {
    const date = new Date(dateString);
    date.setHours(date.getHours() + 3); // Ajuste de fuso

    const diasSemana = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
    const dia = String(date.getDate()).padStart(2, "0");
    const mes = String(date.getMonth() + 1).padStart(2, "0");
    const diaSemana = diasSemana[date.getDay()];

    return `${dia}/${mes} - ${diaSemana}`;
  };

  // Formata data para formato YYYY-MM-DD
  const formatDateToYMD = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Retorna data de hoje no formato YYYY-MM-DD para comparação local
  function getHojeLocalStr() {
    const hoje = new Date();
    const year = hoje.getFullYear();
    const month = String(hoje.getMonth() + 1).padStart(2, "0");
    const day = String(hoje.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  // Manipula seleção de data no filtro
  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setShowDatePicker(false);

      const hojeStr = getHojeLocalStr();
      const selectedDateStr = date.toISOString().slice(0, 10);

      if (selectedDateStr < hojeStr) setMostrarAntigas(true);

      toast.success(
        `Filtro de data aplicado: ${formatDateToDayAndMonth(formatDateToYMD(date))}`,
        { id: "alert" }
      );
    }
  };

  // Limpa filtro de data
  const handleClearFilter = () => {
    setSelectedDate(null);
    toast.success(`Filtro de data removido.`, { id: "alert" });
  };

  // Exclui festa pela API e atualiza lista local
  const handleDelete = (id: number) => {
    api.delete(`/locacoes/${id}/`)
      .then(() => {
        setLocacoes(prev => prev.filter(festa => festa.id !== id));
        toast.success("Festa excluída com sucesso!", { id: "alert" });
      })
      .catch(error => {
        console.error(error);
        toast.error("Erro ao excluir a festa!", { id: "alert" });
      });
  };

  // Download do contrato preenchido em PDF
  async function ContratoPreenchido(festaId: number, clienteId: number) {
    try {
      const clienteResp = await api.get(`/clientes/${clienteId}`);
      const nomeCliente = normalize(clienteResp.data.nome);

      const festaResp = await api.get(`/locacoes/${festaId}`);
      const dataFesta = new Date(festaResp.data.data_festa);
      const dataFormatada = dataFesta.toLocaleDateString("pt-BR").replace(/\//g, "-");

      const resposta = await api.get(`/locacoes/${festaId}/contrato`, { responseType: 'blob' });

      const blob = new Blob([resposta.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Contrato-${nomeCliente}-${dataFormatada}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error("Erro ao gerar contrato", { id: "alert" });
    }
  }

  // Opções de status disponíveis para o menu dropdown
  const statusOptions = [
    { value: "pendente", label: "Pendente" },
    { value: "confirmado", label: "Confirmado" },
    { value: "montado", label: "Montado" },
    { value: "recolher", label: "Recolher" },
    { value: "finalizado", label: "Finalizado" },
  ];

  // Atualiza o status de uma festa na API e no estado local
  const updateStatus = async (id: number, newStatus: string) => {
    try {
      // Envia a atualização para a API
      await api.patch(`/locacoes/${id}/status/`, { status: newStatus });

      // Atualiza o estado local
      setLocacoes(prevLocacoes =>
        prevLocacoes.map(festa =>
          festa.id === id ? { ...festa, status: newStatus } : festa
        )
      );

      toast.success("Status atualizado com sucesso!", { id: "alert" });
    } catch (error) {
      toast.error("Erro ao atualizar status.", { id: "alert" });
    }
  };

  // Opções de pagamento
  const pagamentoOptions = [
    { value: "nao_pago", label: "Não Pago" },
    { value: "entrada", label: "30% Pago" },
    { value: "pago", label: "Pago" },
  ];

  // Mapeamento de labels para pagamento
  const pagamentoLabelMap = {
    nao_pago: "Não Pago",
    entrada: "30% Pago",
    pago: "Pago",
  };

  // Função para atualizar pagamento (simular API e atualizar estado)
  const updatePagamento = async (id: number, newPagamento: string) => {
    try {
      const response = await api.patch(`/locacoes/${id}/`, {
        pagamento: newPagamento,
      });

      const updatedFesta = response.data;

      // Atualiza localmente com os dados completos retornados da API
      setLocacoes(prev =>
        prev.map(festa =>
          festa.id === id ? updatedFesta : festa
        )
      );

      toast.success("Pagamento atualizado com sucesso!", { id: "alert" });
    } catch {
      toast.error("Erro ao atualizar pagamento.", { id: "alert" });
    }
  };

  // Filtra festas de acordo com termo, status, brinquedos e filtro de data
  const filteredFestas = locacoes.filter((festa: any) => {
    const nome = normalize(clientes[festa.cliente]?.nome || "");
    const pagamento = normalize(festa.metodo_pagamento);
    const valor = normalize(festa.valor_total);
    const status = normalize(festa.status) === normalizedSearchTerm;
    const brinquedos = festa.brinquedos?.map((b: any) => normalize(b.nome)).join(" ") ?? "";

    const dataSelecionada = selectedDate ? formatDateToYMD(selectedDate) : null;
    const dataInicio = festa.data_festa?.slice(0, 10);
    const dataFimStr = festa.data_desmontagem?.slice(0, 10);

    const dataMatch = dataSelecionada ? dataSelecionada >= dataInicio && dataSelecionada <= dataFimStr : true;

    const hojeStr = getHojeLocalStr();
    const desmontagemStr = festa.data_desmontagem?.slice(0, 10);

    // Converte datas para comparar
    function parseDateYMD(dateStr: string) {
      const [year, month, day] = dateStr.split("-").map(Number);
      return new Date(year, month - 1, day);
    }

    const hoje = parseDateYMD(hojeStr);
    const desmontagem = parseDateYMD(desmontagemStr);

    const filtroDataValido = mostrarAntigas || desmontagem >= hoje;

    // Combina filtros de texto e data
    return (
      dataMatch &&
      filtroDataValido &&
      (
        brinquedos.includes(normalizedSearchTerm) ||
        nome.includes(normalizedSearchTerm) ||
        pagamento.includes(normalizedSearchTerm) ||
        valor.includes(normalizedSearchTerm) ||
        status
      )
    );
  });

  return (
    <Layout>
      <div className="flex p-6 flex-col items-start self-stretch rounded-lg bg-white shadow-md">
        <div className="min-h-screen w-full bg-white font-exo">
          {/* Cabeçalho com título e botão adicionar */}
          <div className="flex py-3 pb-4 items-center justify-between border-b-2 border-[#e2e8f0]">
            <div className="text-[#020817] font-exo text-2xl font-bold pl-5 border-l-4 border-[#00d17d]">
              Festas
            </div>
            <button
              onClick={() => navigate("/festas/nova")}
              className="flex items-center justify-center gap-2 h-9 px-4 py-2 bg-dark-bg rounded-md shadow-sm hover:bg-gray-50 transition-colors"
            >
              <Icons.NewMoreIcon />
              <span className="text-[#a1a1aa] mt-1 font-exo sm:text-lg font-bold">
                Adicionar<span className="hidden md:inline"> festa</span>
              </span>
            </button>
          </div>

          {/* Filtros: busca, toggle festas antigas e filtro de data */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 my-6">
            <div className="flex items-center border border-blue-border rounded-2xl px-1 w-full max-w-[638px]">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Pesquisar por Nome ou Valor"
                className="flex-1 px-4 py-2 text-gray-placeholder bg-transparent outline-none"
              />
              <Icons.SearchIcon />
            </div>

            <div className="md:flex items-center px-1 cursor-pointer">
              <label className="flex mr-5 items-center gap-2 h-9 px-4 bg-white border border-slate-200 rounded-md shadow-sm hover:bg-gray-100 transition cursor-pointer select-none">
                <Switch
                  checked={mostrarAntigas}
                  onCheckedChange={() => setMostrarAntigas(!mostrarAntigas)}
                />
                <span className="text-sm text-slate-500 whitespace-nowrap">Exibir festas passadas</span>
              </label>

              <div className="flex mt-4 md:mt-0 relative" ref={datePickerRef}>
                {showClearButton && (
                  <button
                    onClick={handleClearFilter}
                    className="whitespace-nowrap flex text-sm text-slate-500 mr-2 items-center gap-2 h-9 px-4 bg-white border border-slate-200 rounded-md shadow-sm hover:bg-gray-100 transition"
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
                  <span className="whitespace-nowrap text-sm text-slate-500">
                    {selectedDate ? selectedDate.toLocaleDateString("pt-BR") : "Buscar por data"}
                  </span>
                </button>

                {showDatePicker && (
                  <div className="absolute top-full right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                    <Calendar mode="single" selected={selectedDate} onSelect={handleDateChange} />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tabela com festas filtradas */}
          <div className="w-full overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  {["Cliente", "Data da Festa", "Pagamento", "Valor Total", "Status", "Brinquedos"].map(title => (
                    <th key={title} className="text-left py-3 px-6 text-sm font-bold uppercase">
                      {title}
                    </th>
                  ))}
                  <th className="w-32"></th>
                </tr>
              </thead>
              <tbody>
                {filteredFestas.map((festa, index) => {
                  // Obtem o status da festa (ajuste se necessário)
                  const status = festa.status; // ou partyStatuses[festa.id] se for outro lugar
                  const selected = statusOptions.find(s => s.value === status);

                  // Se usar chaves {}, precisa do return:
                  return (
                    <tr key={festa.id} className={index > 0 ? "border-t" : ""}>
                      <td className="whitespace-nowrap py-4 px-6">{clientes[festa.cliente]?.nome || "Carregando..."}</td>

                      <td className="py-4 px-6 whitespace-nowrap">
                        {formatDateToDayAndMonth(festa.data_festa) || "Carregando..."} à {formatDateToDayAndMonth(festa.data_desmontagem) || "Carregando..."}
                      </td>
                      <PagamentoDropdown
                        festa={festa}
                        pagamentoOptions={pagamentoOptions}
                        updatePagamento={updatePagamento}
                        pagamentoLabelMap={pagamentoLabelMap}
                      />
                      <td className="py-4 px-6 whitespace-nowrap">
                        {formatMoney(festa.valor_total) || "Carregando..."}

                      </td>

                      <StatusDropdown
                        festa={festa}
                        statusOptions={statusOptions}
                        updateStatus={updateStatus}
                      />

                      <td className="py-4 px-6 whitespace-nowrap flex flex-col">
                        {festa.brinquedos.map((b: any, i: number) => (
                          <div key={i}>{b.nome}</div>
                        ))}
                      </td>

                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <ModalWhatsApp
                            festa={{
                              id: festa.id,
                              data_festa: festa.data_festa,
                              hora_montagem: festa.hora_montagem,
                              clienteId: festa.cliente
                            }}
                            cliente={{
                              id: festa.cliente,
                              nome: clientes[festa.cliente]?.nome || "",
                              telefone: clientes[festa.cliente]?.telefone || ""
                            }}
                          />
                          <AnexarContrato
                            festaId={festa.id}
                            cliente={festa.cliente}
                            contratoPreenchido={ContratoPreenchido}
                          />
                          <ExcluirFesta cliente={clientes[festa.cliente]?.nome} onConfirm={() => handleDelete(festa.id)} />
                          <Link to={`/festas/editar/${festa.id}`} title="Editar">
                            <Icons.EditIcon />
                          </Link>

                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}
