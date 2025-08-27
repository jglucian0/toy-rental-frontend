import { Layout } from "@/components/Layout";
import { StatCard } from "@/components/StatCard";
import { Calendar } from "@/components/ui/calendar";
import { useState, useEffect, useRef } from "react";
import { Menu } from "@headlessui/react";
import { formatPhone } from "../lib/formatters";
import api from "../services/api";
import * as Icons from "../components/Icons";
import { toast } from "sonner";
import { ModalWhatsApp } from "@/components/ModalWhatsApp";

export default function Home() {
  // Inicializa a data selecionada com a data atual no formato YYYY-MM-DD
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const datePickerRef = useRef<HTMLDivElement>(null);
  const [pagamentos, setPagamentos] = useState<Record<number, string>>({});

  // Fecha o seletor de data quando o usuário clica fora dele
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

  // Estados para armazenar dados de locações e status
  const [locacoes, setLocacoes] = useState([]);
  const [partyStatuses, setPartyStatuses] = useState({});
  type Cliente = {
    id: number;
    nome: string;
    telefone?: string;
  };

  const [clientes, setClientes] = useState<Record<number, Cliente>>({});

  // Ao montar, carrega locações e cacheia nomes dos clientes
  useEffect(() => {
    const fetchLocacoes = async () => {
      try {
        const response = await api.get("/locacoes/");
        const locacoesData = response.data;
        setLocacoes(locacoesData);

        const pagamentosMap = locacoesData.reduce((acc, loc) => {
          acc[loc.id] = loc.pagamento;
          return acc;
        }, {});
        setPagamentos(pagamentosMap);

        // Cria um objeto com os status atuais para facilitar atualizações
        const statuses = locacoesData.reduce((acc, loc) => {
          acc[loc.id] = loc.status;
          return acc;
        }, {});
        setPartyStatuses(statuses);

        // Pega os IDs únicos de clientes
        const idsClientesUnicos = [
          ...new Set(locacoesData.map((loc: any) => Number(loc.cliente)))
        ];

        // Busca todos os clientes antes de continuar
        const clientePromises = idsClientesUnicos.map(id =>
          api
            .get(`/clientes/${id}/`)
            .then(res => ({ id, data: res.data }))
            .catch(() => ({ id, data: null }))
        );

        const results = await Promise.all(clientePromises);

        const clientsObj = results.reduce((acc: Record<number, any>, r) => {
          if (r.data) acc[r.id] = r.data;
          return acc;
        }, {});

        // Atualiza clientes só uma vez
        setClientes(prev => ({ ...prev, ...clientsObj }));

        // Só agora salva locações
        setLocacoes(locacoesData);

        for (const id of idsClientesUnicos) {
          await fetchClienteNome(Number(id));
        }
      } catch (error) {
        console.error("Erro ao carregar locações ou clientes:", error);
      }
    };
    fetchLocacoes();
  }, []);


  // Busca nome do cliente e salva no cache para evitar chamadas repetidas
  const fetchClienteNome = async (clienteId: number) => {
    if (clientes[clienteId]) return;

    try {
      const res = await api.get(`/clientes/${clienteId}/`);
      setClientes(prev => ({ ...prev, [clienteId]: res.data }));
    } catch (err) {
      console.error(`Erro ao buscar cliente ${clienteId}`, err);
    }
  };

  // Gera link do Google Maps com o endereço da locação
  const gerarLinkGoogleMaps = (locacao: any) => {
    const { endereco, numero, cidade, uf, cep } = locacao;

    const enderecoCompleto = `${endereco} ${numero}, ${cidade} - ${uf}, ${cep}`;

    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(enderecoCompleto)}`;
  };

  // Converte os dados da API para o formato usado na interface
  const mapApiToParty = (locacao: any) => {
    const statusMap: Record<string, { text: string; color: string }> = {
      pendente: {
        text: "Pendente",
        color: "bg-[#fef9c3] text-[#854d0e]",
      },
      confirmado: {
        text: "Confirmado",
        color: "bg-[#dcfce7] text-[#166534]",
      },
      montado: {
        text: "Montado",
        color: "bg-[#dbeafe] text-[#1e40af]",
      },
      recolher: {
        text: "Recolher",
        color: "bg-[#fee2c3] text-[#a75e0b]",
      },
      finalizado: {
        text: "Finalizado",
        color: "bg-[#f3e8ff] text-[#6b21a8]",
      },
    };

    const rawStatus = String(locacao.status).toLowerCase().trim();
    const statusInfo = statusMap[rawStatus] || statusMap["pendente"];

    const clienteId = Number(locacao.cliente);
    const clienteData = clientes[clienteId];

    const telefoneRaw = clienteData?.telefone ?? "";

    return {
      id: locacao.id, clienteId,
      cliente: clienteData?.nome || "Cliente não encontrado",
      telefone: formatPhone(clienteData?.telefone || ""),      // para exibição
      telefoneRaw,
      hora_montagem: locacao.hora_montagem.slice(0, 5),
      data_festa: locacao.data_festa,
      status: rawStatus,
      statusText: statusInfo.text,
      statusColor: statusInfo.color,
      valor_total: `R$ ${parseFloat(locacao.valor_total).toFixed(2).replace(".", ",")}`,
      items: locacao.brinquedos.map((b: any) => `${b.nome} (1)`),
      endereco: locacao.endereco,
      numero: locacao.numero,
      cidade: locacao.cidade,
      uf: locacao.uf,
      cep: locacao.cep,
    };
  };



  // Mapeia as locações com os status atualizados
  const mappedParties = locacoes.map(locacao => {
    const updatedStatus = partyStatuses[locacao.id] || locacao.status;
    return mapApiToParty({ ...locacao, status: updatedStatus });
  });

  // Filtra as festas pela data selecionada
  const filteredParties = mappedParties
    .filter((party) => party.data_festa === selectedDate)
    .sort((a, b) => a.hora_montagem.localeCompare(b.hora_montagem));

  // Obtém a data de hoje no formato YYYY-MM-DD
  const today = (() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  })();

  // Calcula estatísticas para hoje
  const todaysParties = mappedParties.filter(
    (party) => party.data_festa === today
  );
  const todaysRevenue = todaysParties.reduce(
    (sum, party) =>
      sum + parseFloat(party.valor_total.replace("R$ ", "").replace(",", ".")),
    0,
  );

  // Calcula estatísticas para o mês atual
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1; // Janeiro = 0, então somamos 1

  const monthlyParties = mappedParties.filter((party) => {
    const [year, month] = party.data_festa.split("-").map(Number);
    return year === currentYear && month === currentMonth;
  });

  const pagamentoOptions = [
    { value: "nao_pago", label: "Não Pago" },
    { value: "entrada", label: "Entrada (sinal)" },
    { value: "pago", label: "Pago" },
  ];

  const pagamentoLabelMap = {
    nao_pago: "Não Pago",
    entrada: "Entrada (sinal)",
    pago: "Pago",
  };

  const updatePagamento = async (id: number, newPagamento: string) => {
    try {
      const response = await api.patch(`/locacoes/${id}/`, {
        pagamento: newPagamento,
      });

      const updatedFesta = response.data;

      // Atualiza localmente o valor do pagamento
      setPagamentos(prev => ({
        ...prev,
        [id]: updatedFesta.pagamento,
      }));

      toast.success("Pagamento atualizado com sucesso!", { id: "alert" });
    } catch {
      toast.error("Erro ao atualizar pagamento.", { id: "alert" });
    }
  };

  const monthlyRevenue = monthlyParties.reduce(
    (sum, party) =>
      sum + parseFloat(party.valor_total.replace("R$ ", "").replace(",", ".")),
    0
  );

  // Calcula estatísticas para o mês anterior (para comparação)
  const prevMonthDate = new Date();
  prevMonthDate.setMonth(prevMonthDate.getMonth() - 1);

  const prevMonth = prevMonthDate.getMonth() + 1;
  const prevYear = prevMonthDate.getFullYear();

  const previousMonthlyParties = mappedParties.filter((party) => {
    const [year, month] = party.data_festa.split("-").map(Number);
    return year === prevYear && month === prevMonth;
  });

  // Função para exibir apenas os dois primeiros nomes em telas pequenas
  // Se os dois nomes juntos tiverem mais de 14 letras, mostra apenas o primeiro
  function doisPrimeirosNomes(nomeCompleto) {
    if (!nomeCompleto) return "";
    const nomes = nomeCompleto.trim().split(" ");
    const primeiro = nomes[0] || "";
    const segundo = nomes[1] || "";

    const totalLetras = primeiro.length + segundo.length;

    return totalLetras > 14 ? primeiro : `${primeiro} ${segundo}`.trim();
  }

  // Calcula a receita do mês anterior
  const previousMonthlyRevenue = previousMonthlyParties.reduce(
    (sum, party) =>
      sum + parseFloat(party.valor_total.replace("R$ ", "").replace(",", ".")),
    0
  );

  // Calcula a variação percentual de festas entre o mês atual e o anterior
  const festaVariation = previousMonthlyParties.length === 0
    ? 100
    : ((monthlyParties.length - previousMonthlyParties.length) / previousMonthlyParties.length) * 100;

  // Calcula a variação percentual de receita entre o mês atual e o anterior
  const rendaVariation = previousMonthlyRevenue === 0
    ? 100
    : ((monthlyRevenue - previousMonthlyRevenue) / previousMonthlyRevenue) * 100;

  // Formata a data do formato YYYY-MM-DD para DD/MM para exibição
  const formatDisplayDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = (date.getDate() + 1).toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    return `${day}/${month}`;
  };

  // Atualiza a data selecionada quando o usuário escolhe uma nova data no calendário
  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      // Format date as YYYY-MM-DD in local timezone to avoid timezone issues
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      setSelectedDate(`${year}-${month}-${day}`);
      setShowDatePicker(false);
    }
  };

  // Exibe ícone de tendência com seta para cima (verde) ou para baixo (vermelho)
  const TrendIcon = (value: number) =>
    value >= 0 ? <Icons.TrendUpIcon /> : <Icons.TrendDownIcon />;

  // Formata a variação percentual com sinal + para valores positivos
  const formattedVariation =
    festaVariation >= 0
      ? `+${festaVariation.toFixed(0)}%`
      : `${festaVariation.toFixed(0)}%`;

  // Define a cor do texto baseado na variação (verde para positivo, vermelho para negativo)
  const variationColor = Number(festaVariation) >= 0 ? "text-green-00" : "text-red-500";

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
      setPartyStatuses(prev => ({
        ...prev,
        [id]: newStatus,
      }));

      toast.success("Status atualizado com sucesso!", { id: "alert" });
    } catch (error) {
      toast.error("Erro ao atualizar status.", { id: "alert" });
    }
  };

  function sanitizePhone(phone: string) {
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.startsWith("55")) return cleaned;
    return `55${cleaned}`;
  }

  function getFirstTwoNames(fullName: string) {
    return fullName
      .trim()
      .split(/\s+/) // separa por espaços
      .slice(0, 2)  // pega só os dois primeiros
      .join(" ");
  }

  const statCards = [
    {
      title: "Festas Hoje",
      value: todaysParties.length.toString(),
      icon: <Icons.PartyIcon />,
      borderColor: "border-l-[#00d17d]",
    },
    {
      title: "Renda Bruta Hoje",
      value: `R$ ${todaysRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
      icon: <Icons.MoneyIcon />,

      borderColor: "border-l-[#fb923c]",
    },
    {
      title: "Festas no Mês",
      value: monthlyParties.length.toString(),
      icon: <Icons.PartyIcon />,

      borderColor: "border-l-[#22d3ee]",
      trend: {
        icon: TrendIcon(festaVariation),
        value: <span className={variationColor}>{formattedVariation}</span>,
        label: "mês Anterior",
      },
    },
    {
      title: "Renda Bruta Mensal",
      value: (
        <span className="whitespace-nowrap">
          R$ {monthlyRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
        </span>
      ),
      icon: <Icons.MoneyIcon />,
      borderColor: "border-l-[#facc15]",
      trend: {
        icon: TrendIcon(festaVariation),
        value: <span className={variationColor}>{formattedVariation}</span>,
        label: "mês Anterior",
      },
    }
  ];

  return (
    <Layout>
      {/* Cards de estatísticas - versão desktop */}
      <div className="hidden md:flex pb-3 items-start gap-4 self-stretch flex-wrap xl:flex-nowrap">
        {statCards.map((card, index) => (
          <StatCard key={index} {...card} />
        ))}
      </div>

      {/* Cards de estatísticas - versão mobile com scroll horizontal */}
      <div className="flex w-full overflow-x-auto md:hidden">
        <div className="flex gap-4 w-max">
          {statCards.map((card, index) => (
            <StatCard key={index} {...card} />
          ))}
        </div>
      </div>

      {/* Seção principal - Lista de festas por data */}
      <div className="flex p-6 flex-col items-start self-stretch rounded-lg bg-white shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.10),0px_2px_4px_-2px_rgba(0,0,0,0.10)]">
        {/* Cabeçalho com título e seletor de data */}
        <div className="flex py-3 pb-[14px] items-center justify-between self-stretch border-b-2 border-[#e2e8f0] relative">
          <div className="text-[#020817] font-exo text-2xl font-bold leading-8  flex pl-5 flex-col items-start border-l-4 border-[#00d17d]">

            Próximas Festas
          </div>

          {/* Seletor de data com calendário */}
          <div className="flex items-center gap-2 relative" ref={datePickerRef}>
            <div className="text-[#a1a1aa] font-exo text-lg font-bold leading-7">
              {formatDisplayDate(selectedDate)}
            </div>
            <button
              onClick={() => setShowDatePicker(!showDatePicker)}
              className="flex h-9 max-w-[176px] py-[9px] px-[17px] items-center self-stretch rounded-md border border-[#e2e8f0] bg-white shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <Icons.CalendarIcon />
            </button>

            {/* Calendário popup */}
            {showDatePicker && (
              <div className="absolute top-full right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                <Calendar
                  mode="single"
                  selected={new Date(selectedDate + "T00:00:00")}
                  onSelect={handleDateChange}
                  className="rounded-md border"
                />
              </div>
            )}
          </div>
        </div>

        {/* Lista de festas para a data selecionada */}
        <div className="flex flex-col items-start self-stretch gap-3 mt-6">
          {filteredParties.length > 0 ? (
            filteredParties.map((party, index) => {
              const status = partyStatuses[party.id];
              const selected = statusOptions.find(s => s.value === status);

              return (
                <div key={party.id} className="w-full flex flex-col gap-2">
                  <div
                    className={`w-full min-h-[144px] rounded-xl p-4 flex flex-col gap-2
                    ${index % 2 === 0
                        ? "bg-[#effff8] border-2 border-[#effff8]"
                        : "bg-white border-2 border-[#d6ffee]"
                      }`}
                  >
                    {/* Seção superior - Informações do cliente e status */}
                    <div className="flex justify-between items-start w-full">
                      {/* Lado esquerdo - Informações do cliente */}
                      <div className="flex flex-col gap-2 flex-1">
                        <div className="flex w-fit h-7 py-0.5 justify-center items-center">
                          <div className="text-[#1f2937] font-exo mr-4 text-lg font-semibold sm:leading-7">
                            {/* Versão mobile: exibe nome reduzido */}
                            <span className="block md:hidden">
                              {doisPrimeirosNomes(party.cliente)}
                            </span>

                            {/* Versão desktop: exibe nome completo */}
                            <span className="hidden md:block">
                              {party.cliente}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2 items-center">
                          <div className="flex text-[#166534] font-exo text-sm font-medium leading-5">
                            <span className="mr-1 flex mt-[1px]">
                              <Icons.ClockIcon />
                            </span>
                            {party.hora_montagem}
                          </div>
                          <div className="text-[#6b7280] font-exo text-xs sm:text-sm font-normal leading-5">
                            {party.telefone}
                          </div>
                        </div>
                      </div>

                      {/* Right - Status Badge */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 py-2">

                        <div className="hidden sm:block">
                          <Menu as="div" className="w-full">
                            <Menu.Button
                              className={`px-2 sm:px-3 py-3 sm:py-3 rounded-full text-xs sm:text-sm flex items-center gap-1
                                  ${pagamentos[party.id] === "nao_pago"
                                  ? "bg-[#fef9c3] text-[#854d0e]"
                                  : pagamentos[party.id] === "entrada"
                                    ? "bg-[#dbeafe] text-[#1e40af]"
                                    : pagamentos[party.id] === "pago"
                                      ? "bg-[#dcfce7] text-[#166534]"
                                      : "bg-gray-200 text-gray-800"
                                }`}
                            >
                              {pagamentoLabelMap[pagamentos[party.id]] || "Desconhecido"}
                              <Icons.ChevronDownIcon />
                            </Menu.Button>
                            <Menu.Items className="absolute z-50 mt-1 w-32 sm:w-40 rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none">
                              {pagamentoOptions.map(option => (
                                <Menu.Item key={option.value}>
                                  {({ active }) => (
                                    <button
                                      onClick={() => updatePagamento(party.id, option.value)}
                                      className={`${active ? "bg-gray-100" : ""
                                        } w-full px-4 py-2 text-sm flex items-center gap-2 text-left`}
                                    >
                                      <span className={`font-medium ${option.value === "nao_pago"
                                        ? "text-[#854d0e]"
                                        : option.value === "entrada"
                                          ? "text-[#1e40af]"
                                          : option.value === "pago"
                                            ? "text-[#166534]"
                                            : "text-gray-600"
                                        }`}>
                                        {option.label}
                                      </span>
                                    </button>
                                  )}
                                </Menu.Item>
                              ))}
                            </Menu.Items>
                          </Menu>

                        </div>

                        <div className="">
                          <Menu as='div' className="w-full">
                            <Menu.Button
                              className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm flex items-center gap-1
                                ${status === "pendente"
                                  ? "bg-[#fef9c3] text-[#854d0e]"
                                  : status === "confirmado"
                                    ? "bg-[#dcfce7] text-[#166534]"
                                    : status === "montado"
                                      ? "bg-[#dbeafe] text-[#1e40af]"
                                      : status === "recolher"
                                        ? "bg-[#fee2c3] text-[#a75e0b]"
                                        : status === "finalizado"
                                          ? "bg-[#f3e8ff] text-[#6b21a8]"
                                          : ""
                                }`}


                            >
                              {/* Exibição do ícone de status baseado no status atual */}
                              <div
                                className={`flex items-center gap-2 px-1 sm:px-3 py-2 rounded-full h-9`}
                              >
                                {/* Ícone para status confirmado - marca de verificação */}
                                {party.status === "confirmado" && (
                                  <Icons.StatusConfirmadoIcon />
                                )}
                                {/* Ícone para status finalizado - hexágono */}
                                {party.status === "finalizado" && (
                                  <Icons.StatusFinalizadoIcon />
                                )}
                                {/* Ícone para status pendente - relógio */}
                                {party.status === "pendente" && (
                                  <Icons.StatusPendenteIcon />
                                )}
                                {/* Ícone para status montado - caixa */}
                                {party.status === "montado" && (
                                  <Icons.StatusMontadoIcon />
                                )}
                                {/* Ícone para status recolher - caminhão */}
                                {party.status === "recolher" && (
                                  <Icons.StatusRecolherIcon />
                                )}
                              </div>
                              {selected.label}
                              <div>
                                <Icons.ChevronDownIcon />
                              </div>
                            </Menu.Button>

                            <Menu.Items className="absolute z-50 mt-1 w-32 sm:w-40 rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none">
                              {statusOptions.map((option) => (
                                <Menu.Item key={option.value}>
                                  {({ active }) => (
                                    <button onClick={() => updateStatus(party.id, option.value)} className={`${active ? "bg-gray-100" : ""} w-full px-4 py-2 text-sm flex items-center gap-2 text-left`}>
                                      <span className={`flex font-medium 
                                        ${option.value === "pendente"
                                          ? "text-[#854d0e]"
                                          : option.value === "confirmado"
                                            ? "text-[#166534]"
                                            : option.value === "finalizado"
                                              ? "text-[#6b21a8]"
                                              : option.value === "montado"
                                                ? "text-[#1e40af]"
                                                : option.value === "recolher"
                                                  ? "text-[#a75e0b]"
                                                  : "text-gray-600"}`}>
                                        {option.label}
                                      </span>
                                    </button>
                                  )}
                                </Menu.Item>
                              ))}
                            </Menu.Items>

                          </Menu>
                        </div>
                      </div>


                    </div>

                    {/* Seção inferior - Valor, Itens e Ações */}
                    <div className="flex justify-between items-end w-full mt-4">
                      {/* Lado esquerdo - Valor e itens da festa */}
                      <div className="flex gap-8 items-end">
                        {/* Valor total da festa */}
                        <div className="flex flex-col gap-1">
                          <div className="text-[#6b7280] font-exo text-xs font-normal leading-4">
                            Valor Total
                          </div>
                          <div className="text-[#1f2937] font-exo text-base font-medium leading-6">
                            {party.valor_total}
                          </div>
                        </div>

                        {/* Lista de itens/brinquedos (visível apenas em desktop) */}
                        <div className="hidden md:flex flex flex-col justify-center h-[43px]">
                          <div className="text-[#a1a1aa] font-exo text-base font-normal leading-6">
                            <div className='grid grid-flow-col grid-rows-2 gap-x-4 gap-y-1'>
                              {party.items.map((item, itemIndex) => (
                                <div key={itemIndex} className="text-[#78787e] font-exo text-base font-normal leading-6">
                                  {item}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Lado direito - Botões de ação para gerenciar a festa */}
                      <div className="flex gap-2">
                        <a
                          href={gerarLinkGoogleMaps(party)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex w-9 h-9 p-2 justify-center items-center rounded bg-[#dbeafe] hover:bg-[#bfdbfe] transition-colors"
                          title="Ver localização da festa"
                        >
                          <Icons.MapIcon />
                        </a>
                        <span className="flex w-9 h-9 justify-center items-center rounded bg-[#f3f4f6] hover:bg-[#e5e7eb] transition-colors">
                          <ModalWhatsApp
                            festa={{
                              id: party.id,
                              data_festa: party.data_festa,
                              hora_montagem: party.hora_montagem,
                              clienteId: Number(party.clienteId),
                            }}
                            cliente={{
                              id: Number(party.clienteId),
                              nome: clientes[party.clienteId]?.nome || "",
                              telefone: clientes[party.clienteId]?.telefone || "",
                            }}
                          />
                        </span>
                        {/*<button
                          className="flex w-9 h-9 p-2 justify-center items-center rounded bg-[#f3f4f6] hover:bg-[#e5e7eb] transition-colors"
                          title="Mais opções"
                        >
                          <Icons.MoreIcon />
                        </button>*/}
                      </div>
                    </div>

                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex py-[52px] pb-7 flex-col items-start self-stretch">
              <div className="flex-1 text-[#a1a1aa] text-center font-exo text-xl font-bold leading-7 flex justify-center items-center self-stretch">
                Nenhuma festa agendada na data selecionada.
              </div>
            </div>
          )}
        </div>
      </div>


    </Layout>

  );
}
