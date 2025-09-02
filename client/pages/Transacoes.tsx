import { Layout } from "@/components/Layout";
import { useEffect, useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import api from "../services/api";
import { MonthPicker } from "@/components/ui/monthpicker";
import { ExcluirTransacao } from "../components/ModalExcluir";
import { normalize } from "../lib/formatters";
import * as Icons from "../components/Icons";
import { StatCard } from "@/components/StatCard";

export default function Transacoes() {
  const navigate = useNavigate();

  const [selectedMonth, setSelectedMonth] = useState<{ month: number; year: number } | null>(null); // Mês selecionado no filtro

  const formatMoneyLocal = (value: string | number) => {
    if (!value && value !== 0) return 'R$ 0,00';



    // Converte string para número, substituindo vírgula por ponto se houver
    const numericValue = typeof value === 'string'
      ? parseFloat(value.replace(',', '.'))
      : value;

    if (isNaN(numericValue)) return '';

    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
    }).format(numericValue);
  };

  // ------------------- Estados principais -------------------
  const [transacoes, setTransacoes] = useState([]); // Lista principal de transações

  // ------------------- Totais calculados -------------------

  // Transações que vão entrar nos cálculos dos cards
  const transacoesParaCalculo = selectedMonth
    ? transacoes.filter((t: any) => {
      const transDate = new Date(t.data_transacao);
      const transMonth = transDate.getMonth() + 1;
      const transYear = transDate.getFullYear();
      return transMonth === selectedMonth.month && transYear === selectedMonth.year;
    })
    : transacoes; // sem filtro → usa todas

  // Função para garantir que valor seja number
  function parseValor(valor: any): number {
    if (typeof valor === "number") return valor; // já é número
    if (typeof valor === "string") {
      return Number(valor); // deixa o JS interpretar "100.00" como 100
    }
    return 0;
  }

  // Função que retorna valor proporcional considerando percentual_pago
  const valorProporcional = (transacao: any) => {
    const valor = parseValor(transacao.valor);
    const percentual = transacao.percentual_pago ? transacao.percentual_pago / 100 : 1;
    return valor * percentual;
  };

  // ---------------- Totais do fluxo de caixa ----------------
  const entradaFutura = transacoesParaCalculo
    .filter(t =>
      t.tipo === "entrada" &&
      (t.pagamento === "nao_pago" || t.pagamento === "entrada" || t.pagamento === "planejado")
    )
    .reduce((acc, t) => {
      const valor = parseValor(t.valor);

      if (t.pagamento === "entrada") {
        const entrada = parseValor(t.valor_entrada || valor * 0.3);
        return acc + (valor - entrada);
      }

      return acc + valor; // nao_pago ou planejado → soma tudo
    }, 0);

  const saidaFutura = transacoesParaCalculo
    .filter(t => t.tipo === "saida" && (t.pagamento === "nao_pago" || t.pagamento === "entrada"))
    .reduce((acc, t) => {
      const valor = parseValor(t.valor);

      if (t.pagamento === "entrada") {
        const entrada = parseValor(t.valor_entrada || valor * 0.3);
        return acc + (valor - entrada);
      }

      return acc + valor; // nao_pago → todo valor é futuro
    }, 0);

  const entradaPlanejada = transacoesParaCalculo
    .filter(t => t.tipo === "entrada" && (t.pagamento === "planejado" || t.pagamento === "nao_pago"))

    .reduce((acc, t) => acc + parseValor(t.valor), 0);

  const entradaAtual = transacoesParaCalculo
    .filter(t => t.tipo === "entrada" && (t.pagamento === "pago" || t.pagamento === "entrada"))
    .reduce((acc, t) => {
      const valor = parseValor(t.valor);

      if (t.pagamento === "entrada") {
        // só 30% entra no caixa agora
        const entrada = parseValor(t.valor_entrada || valor * 0.3);
        return acc + entrada;
      }

      return acc + valor; // pago → entra tudo
    }, 0);

  const saidaAtual = transacoesParaCalculo
    .filter(t => t.tipo === "saida" && t.pagamento === "pago")
    .reduce((acc, t) => acc + parseValor(t.valor), 0);

  const saidaPlanejada = transacoesParaCalculo
    .filter(t => t.tipo === "saida" && t.pagamento === "planejado")
    .reduce((acc, t) => acc + parseValor(t.valor), 0);

  // Saldo atual = entradas efetivas - saídas efetivas
  const saldoAtual = entradaAtual - saidaAtual;

  const [clientes, setClientes] = useState<Record<number, { nome: string }>>({}); // Cache de clientes para evitar múltiplas requisições
  const [searchTerm, setSearchTerm] = useState(""); // Texto digitado no campo de busca

  const [showDatePicker, setShowDatePicker] = useState(false); // Toggle para mostrar/ocultar o calendário
  const [showClearButton, setShowClearButton] = useState(false); // Toggle para mostrar botão de limpar filtro de data
  const [brinquedos, setBrinquedos] = useState([]);


  const datePickerRef = useRef<HTMLDivElement>(null); // Referência para fechar o calendário ao clicar fora

  // Normaliza o termo de busca para comparação sem acentos e caixa alta/baixa
  const normalizedSearchTerm = normalize(searchTerm);

  // ------------------- Filtragem de transações -------------------
  const filteredTransacoes = transacoes.filter((transacao: any) => {
    const nome = normalize(clientes[transacao.cliente]?.nome || ""); // Nome do cliente normalizado
    const pagamento = normalize(transacao.metodo_pagamento); // Método de pagamento normalizado
    const valor = normalize(transacao.valor_total); // Valor total normalizado
    const status = normalize(transacao.status) === normalizedSearchTerm; // Comparação direta de status

    // Filtra pelo mês selecionado, se houver
    let dataMatch = true;
    if (selectedMonth) {
      const transDate = new Date(transacao.data_transacao);
      const transMonth = transDate.getMonth() + 1; // Janeiro = 0
      const transYear = transDate.getFullYear();
      dataMatch = transMonth === selectedMonth.month && transYear === selectedMonth.year;
    }

    // Retorna true se algum dos critérios bater
    return (
      dataMatch &&
      (nome.includes(normalizedSearchTerm) ||
        pagamento.includes(normalizedSearchTerm) ||
        valor.includes(normalizedSearchTerm) ||
        status)
    );
  });

  // ------------------- Funções de formatação de datas -------------------
  // Formata data para exibir no formato "dd/mm - dia da semana"
  const formatDateToDayAndMonth = (dateString: string) => {
    const date = new Date(dateString);
    date.setHours(date.getHours() + 3); // Ajuste de fuso horário

    const diasSemana = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
    const dia = String(date.getDate()).padStart(2, "0");
    const mes = String(date.getMonth() + 1).padStart(2, "0");
    const diaSemana = diasSemana[date.getDay()];

    return `${dia}/${mes} - ${diaSemana}`;
  };

  // Formata data para o padrão YYYY-MM-DD
  const formatDateToYMD = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // ------------------- Manipulação do calendário -------------------
  // Fecha calendário se clicar fora do componente
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setShowDatePicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    api.get("/brinquedos/").then(res => setBrinquedos(res.data)).catch(console.error);
  }, []);

  // Atualiza botão limpar quando uma data/mês é selecionado
  useEffect(() => {
    setShowClearButton(selectedMonth !== null);
  }, [selectedMonth]);

  // ------------------- Funções de filtro de data -------------------
  // Seleciona mês no filtro e atualiza estado
  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      setSelectedMonth({ month, year });
      setShowDatePicker(false);
      toast.success(`Filtro de mês aplicado: ${month}/${year}`, { id: "alert" });
    }
  };

  // Limpa o filtro de mês selecionado
  const handleClearFilter = () => {
    setSelectedMonth(null);
    toast.success("Filtro de data removido.", { id: "alert" });
  };

  // ------------------- Carregamento de transações -------------------
  useEffect(() => {
    const carregarTransacoes = async () => {
      try {
        const res = await api.get("/transacoes/");
        const transacoesData = res.data;

        setTransacoes(transacoesData.reverse()); // Inverte para exibir as mais recentes primeiro

        // Busca clientes apenas para transações de locação e armazena no cache
        const idsClientes = transacoesData
          .filter((t: any) => t.origem === "locacao" && t.cliente)
          .map((t: any) => t.cliente);
        const idsUnicos = [...new Set(idsClientes)];

        for (const id of idsUnicos) {
          await fetchClienteNome(Number(id));
        }
      } catch (err) {
        console.error(err);
      }
    };

    carregarTransacoes();
  }, []);

  // ------------------- Função de cache de clientes -------------------
  // Busca nome do cliente e armazena em "clientes" para evitar múltiplas requisições
  const fetchClienteNome = async (clienteId: number) => {
    if (clientes[clienteId]) return; // Se já existe no cache, retorna

    try {
      const res = await api.get(`/clientes/${clienteId}/`);
      const { nome } = res.data;
      setClientes((prev) => ({ ...prev, [clienteId]: { nome } }));
    } catch (err) {
      console.error(`Erro ao buscar cliente ${clienteId}`, err);
    }
  };

  // ------------------- Função de exclusão -------------------
  // Remove transação da API e atualiza estado local
  const handleDelete = (id: number) => {
    api
      .delete(`/transacoes/${id}/`)
      .then(() => {
        setTransacoes((prev) => prev.filter((trans) => trans.id !== id));
        toast.success("Transação excluída com sucesso!", { id: "alert" });
      })
      .catch((error) => {
        console.error(error);
        toast.error("Erro ao excluir a transação!", { id: "alert" });
      });
  };

  // ------------------- Dropdown de status (opcional) -------------------
  const statusOptions = [
    { value: "pendente", label: "Pendente" },
    { value: "confirmado", label: "Confirmado" },
    { value: "montado", label: "Montado" },
    { value: "recolher", label: "Recolher" },
    { value: "finalizado", label: "Finalizado" },
  ];

  const statusColors = (status: string) =>
    status === "nao_pago"
      ? "bg-[#fec3c3] text-[#850e0e]"
      : status === "pago"
        ? "bg-[#dcfce7] text-[#166534]"
        : status === "entrada"
          ? "bg-[#dbeafe] text-[#1e40af]"
          : status === "planejado"
            ? "bg-[#fee2c3] text-[#a75e0b]"
            : status === "cancelado"
              ? "bg-[#f3e8ff] text-[#6b21a8]"
              : "bg-gray-200 text-gray-800";


  // ------------------- Cards -------------------
  const statCards = [
    {
      title: "Saldo Atual",
      value: formatMoneyLocal(saldoAtual),
      icon: <Icons.MoneyIcon />,
      borderColor: "border-l-[#00d17d]",
    },
    {
      title: "Entradas Planejadas",
      value: formatMoneyLocal(entradaPlanejada),
      icon: <Icons.ArrowUpIcon />,
      borderColor: "border-l-[#fb923c]",
    },
    {
      title: "Entradas no Caixa",
      value: formatMoneyLocal(entradaAtual),
      icon: <Icons.ArrowUpIcon />,
      borderColor: "border-l-[#facc15]",
    },
    {
      title: "Saídas Pagas",
      value: formatMoneyLocal(saidaAtual),
      icon: <Icons.ArrowDownIcon />,
      borderColor: "border-l-[#22d3ee]",
    },
    {
      title: "Saídas Planejadas",
      value: formatMoneyLocal(saidaPlanejada),
      icon: <Icons.ArrowDownIcon />,
      borderColor: "border-l-[#00d17d]",
    },
  ];


  // ------------------- Render -------------------
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


      <div className="flex p-6 flex-col items-start self-stretch rounded-lg bg-white shadow-md">
        <div className="min-h-screen w-full bg-white font-exo">
          {/* Cabeçalho com título e botão para adicionar nova transação */}
          <div className="flex py-3 pb-4 items-center justify-between border-b-2 border-[#e2e8f0]">
            <div className="text-[#020817] font-exo text-2xl font-bold pl-5 border-l-4 border-[#00d17d]">
              Transações
            </div>
            <button
              onClick={() => navigate("/transacoes/nova")}
              className="flex items-center justify-center gap-2 h-9 px-4 py-2 bg-dark-bg rounded-md shadow-sm hover:bg-gray-50 transition-colors"
            >
              <Icons.NewMoreIcon />
              <span className="text-[#a1a1aa] mt-1 font-exo sm:text-lg font-bold">
                Adicionar<span className="hidden md:inline"> transação</span>
              </span>
            </button>
          </div>

          {/* Filtros: busca por nome/valor e filtro por mês */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 my-6">
            {/* Campo de busca */}
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

            {/* Filtro por mês */}
            <div className="md:flex items-center px-1 cursor-pointer">
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
                    {selectedMonth
                      ? `${selectedMonth.month.toString().padStart(2, "0")}/${selectedMonth.year}`
                      : "Buscar por mês"}
                  </span>
                </button>

                {showDatePicker && (
                  <div className="absolute top-full right-0 mt-2 z-10">
                    <MonthPicker
                      selectedMonth={selectedMonth}
                      onSelect={(month, year) => {
                        setSelectedMonth({ month, year });
                        setShowDatePicker(false);
                        toast.success(`Filtro de mês aplicado: ${month}/${year}`, { id: "alert" });
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tabela de transações */}
          <div className="w-full overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  {[
                    "",
                    "Tipo",
                    "Status",
                    "Referência",
                    "Valor",
                    "Data pagamento",
                    "Data vencimento",
                    "Categoria",
                    "Parcela",
                  ].map((title) => (
                    <th key={title} className="text-left py-3 px-6 text-sm font-bold uppercase">
                      {title}
                    </th>
                  ))}
                  <th className="w-32"></th>
                </tr>
              </thead>
              <tbody>
                {filteredTransacoes.length > 0 ? (
                  filteredTransacoes.map((transacao, index) => (
                    <tr key={transacao.id} className={index > 0 ? "border-t" : ""}>
                      {/* Ícone de entrada ou saída */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          {transacao.tipo === "entrada" ? (
                            <Icons.ArrowUpIcon />
                          ) : (
                            <Icons.ArrowDownIcon className="text-[#EF4444]" />
                          )}
                        </div>
                      </td>

                      {/* Tipo de transação */}
                      <td className="whitespace-nowrap py-4 px-6">{transacao.tipo_display || "Carregando..."}</td>

                      {/* Status do pagamento */}
                      <td className={"whitespace-nowrap py-4 px-6"}
                      >
                        <div className={`py-2 px-6 whitespace-nowrap px-2 sm:px-3 sm:py-2 rounded-full text-xs sm:text-sm flex items-center gap-1 ${statusColors(
                          transacao.pagamento
                        )}`}>
                          {transacao.pagamento_display || "Carregando..."}

                        </div>
                      </td>

                      {/* Cliente */}
                      <td className="py-4 px-6 whitespace-nowrap">
                        {transacao.origem === "locacao" ? (
                          clientes[transacao.cliente]?.nome
                            ? `Festa de ${clientes[transacao.cliente].nome}`
                            : "Carregando..."
                        ) : transacao.origem === "investimento_brinquedo" ? (
                          `${transacao.brinquedo?.nome || ""}`
                        ) : (
                          "Sem referência"
                        )}
                      </td>


                      {/* Valor */}
                      <td
                        className={`py-4 px-6 whitespace-nowrap ${transacao.tipo === "entrada" ? "text-[#166534]" : "text-[#EF4444]"
                          }`}
                      >
                        {transacao.tipo === "entrada" ? <span className="mr-2">+</span> : <span className="mr-2">-</span>}
                        {formatMoneyLocal(valorProporcional(transacao)) || "Carregando..."}
                      </td>

                      {/* Data de pagamento */}
                      <td className="py-4 px-6 whitespace-nowrap">{formatDateToDayAndMonth(transacao.data_transacao)}</td>

                      {/* Data de vencimento */}
                      <td className="py-4 px-6 whitespace-nowrap">{formatDateToDayAndMonth(transacao.data_transacao)}</td>

                      {/* Categoria */}
                      <td className="py-4 px-6 whitespace-nowrap">{transacao.categoria_display || "Carregando..."}</td>

                      {/* Parcelamento */}
                      <td className="py-4 px-6 whitespace-nowrap">
                        {transacao.parcela_atual && transacao.qtd_parcelas
                          ? `${transacao.parcela_atual}/${transacao.qtd_parcelas}`
                          : "À vista"}
                      </td>

                      {/* Ações: excluir e editar */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <ExcluirTransacao
                            key={transacao.id}
                            object={transacao.id}
                            onConfirm={() => handleDelete(transacao.id)}
                          />
                          <Link to={`/transacoes/editar/${transacao.id}`} title="Editar">
                            <Icons.EditIcon />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9}>
                      <div className="flex py-[52px] pb-7 flex-col items-center justify-center self-stretch">
                        <div className="text-[#a1a1aa] text-center font-exo text-xl font-bold leading-7">
                          Nenhuma transação para exibir neste período...
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}