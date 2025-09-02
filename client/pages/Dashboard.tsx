import { Layout } from "@/components/Layout";
import { StatCard } from "@/components/StatCard";
import { useEffect, useState, useRef } from "react";
import * as Icons from "../components/Icons";
import { FaMoneyBillTrendUp } from "react-icons/fa6";
import { FaPiggyBank } from "react-icons/fa6";
import { FaMoneyBill1Wave } from "react-icons/fa6";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import api from "../services/api";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';


export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const COLORS = ['#22d3ee', '#00d17d', '#facc15', '#fb923c', '#AF19FF'];

  // ------------------- Filtragem de transações -------------------

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const response = await api.get('/dashboard/'); // Chama o novo endpoint
        setDashboardData(response.data);
      } catch (err) {
        setError("Falha ao carregar os dados do dashboard.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []); // Executa apenas uma vez

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00d17d] mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando dados do dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !dashboardData) {
    return <Layout><div>Erro ao carregar dados. Tente novamente.</div></Layout>;
  }



  // Chart placeholder component
  const ChartPlaceholder = () => (
    <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
      <div className="text-center">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          stroke="currentColor"
          fill="none"
          viewBox="0 0 48 48"
        >
          <path
            d="M8 14v20c0 4.418 7.163 8 16 8 1.381 0 2.721-.087 4-.252M8 14c0 4.418 7.163 8 16 8s16-3.582 16-8M8 14c0-4.418 7.163-8 16-8s16 3.582 16 8m0 0v14m0-4c0 4.418-7.163 8-16 8s-16-3.582-16-8"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">
          Gráficos de Performance
        </h3>
        <p className="mt-1 text-sm text-gray-500 mr-5 ml-5">
          Sem dados disponíveis para visualização
        </p>
      </div>
    </div>
  );



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

  // ------------------- Cards -------------------
  const statCards = [
    {
      title: "Investimento total (brinquedos)",
      value: formatMoneyLocal(dashboardData.stat_cards.investimento_total),
      icon: <FaMoneyBill1Wave className="w-[16px] h-[16px] text-[#00d17d]" />,
      borderColor: "border-l-[#00d17d]",
    },
    {
      title: "Receita acumulada (aluguéis)",
      value: formatMoneyLocal(dashboardData.stat_cards.receita_acumulada),
      icon: <FaPiggyBank className="w-[18px] h-[18px] text-[#00d17d]" />,
      borderColor: "border-l-[#fb923c]",
    },
    {
      title: "ROI Global (%)",
      value: `${Number(dashboardData.stat_cards.roi_global).toFixed(2)}%`,
      icon: <FaMoneyBillTrendUp className="w-[16px] h-[16px] text-[#00d17d]" />,
      borderColor: "border-l-[#facc15]",
    },
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

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 self-stretch">
        <div className="flex p-6 flex-col items-start rounded-lg bg-white shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.10),0px_2px_4px_-2px_rgba(0,0,0,0.10)]">
          <h3 className="text-xl font-bold text-[#020817] mb-4">
            Receita x Despesa por mês
          </h3>
          {(dashboardData.chart_receita_despesa && dashboardData.chart_receita_despesa.length > 0) ? (
            <ResponsiveContainer width="100%" height={256}>
              <BarChart
                data={dashboardData.chart_receita_despesa}
                margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis tickFormatter={(value) => `R$${value}`} />
                <Tooltip formatter={(value) => {
                  if (Array.isArray(value)) {
                    return formatMoneyLocal(value[0]);
                  }
                  return formatMoneyLocal(value);
                }} />
                <Legend />
                <Bar dataKey="Receita" fill="#00d17d" />
                <Bar dataKey="Despesa" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            // Se não houver dados, mostra o placeholder
            <ChartPlaceholder />
          )}
        </div>

        <div className="flex p-6 flex-col items-start rounded-lg bg-white shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.10),0px_2px_4px_-2px_rgba(0,0,0,0.10)]">
          <h3 className="text-xl font-bold text-[#020817] mb-4">
            Brinquedos mais alugados (Ranking)
          </h3>
          {(dashboardData.chart_ranking_brinquedos && dashboardData.chart_ranking_brinquedos.length > 0) ? (
            <ResponsiveContainer width="100%" height={256}>
              <BarChart
                layout="vertical" // Deixa o gráfico na horizontal
                data={dashboardData.chart_ranking_brinquedos}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="nome" type="category" width={80} />
                <Tooltip formatter={(value) => `${value} vezes`} />
                <Legend />
                <Bar dataKey="Aluguéis" fill="#fb923c" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            // Se não houver dados, mostra o placeholder
            <ChartPlaceholder />
          )}
        </div>

        <div className="flex p-6 flex-col items-start rounded-lg bg-white shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.10),0px_2px_4px_-2px_rgba(0,0,0,0.10)]">
          <h3 className="text-xl font-bold text-[#020817] mb-4">
            Saldo acumulado
          </h3>
          {(dashboardData.chart_saldo_acumulado && dashboardData.chart_saldo_acumulado.length > 0) ? (
            <ResponsiveContainer width="100%" height={256}>
              <LineChart
                data={dashboardData.chart_saldo_acumulado}
                margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis tickFormatter={(value) => `R$${value}`} />
                <Tooltip formatter={(value) => {
                  if (Array.isArray(value)) {
                    return formatMoneyLocal(value[0]);
                  }
                  return formatMoneyLocal(value);
                }} />
                <Legend />
                <Line type="monotone" dataKey="Saldo" stroke="#22d3ee" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            // Se não houver dados, mostra o placeholder
            <ChartPlaceholder />
          )}
        </div>

        <div className="flex p-6 flex-col items-start rounded-lg bg-white shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.10),0px_2px_4px_-2px_rgba(0,0,0,0.10)]">
          <h3 className="text-xl font-bold text-[#020817] mb-4">
            Receita por brinquedo
          </h3>
          {(dashboardData.chart_receita_brinquedo && dashboardData.chart_receita_brinquedo.length > 0) ? (
            <ResponsiveContainer width="100%" height={256}>
              <BarChart
                data={dashboardData.chart_receita_brinquedo}
                margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="nome" />
                <YAxis tickFormatter={(value) => `R$${value}`} />
                <Tooltip formatter={(value) => {
                  if (Array.isArray(value)) {
                    return formatMoneyLocal(value[0]);
                  }
                  return formatMoneyLocal(value);
                }} />
                <Legend />
                <Bar dataKey="Receita" fill="#34d399" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            // Se não houver dados, mostra o placeholder
            <ChartPlaceholder />
          )}
        </div>

        <div className="flex p-6 flex-col items-start rounded-lg bg-white shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.10),0px_2px_4px_-2px_rgba(0,0,0,0.10)]">
          <h3 className="text-xl font-bold text-[#020817] mb-4">
            Despesas por categoria
          </h3>
          {(dashboardData.chart_despesas_categoria && dashboardData.chart_despesas_categoria.length > 0) ? (
            <ResponsiveContainer width="100%" height={256}>
              <PieChart>
                <Pie
                  data={dashboardData.chart_despesas_categoria}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {(dashboardData.chart_despesas_categoria || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => {
                  if (Array.isArray(value)) {
                    return formatMoneyLocal(value[0]);
                  }
                  return formatMoneyLocal(value);
                }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            // Se não houver dados, mostra o placeholder
            <ChartPlaceholder />
          )}
        </div>
      </div>

      <div className="flex p-6 flex-col items-start self-stretch rounded-lg bg-white shadow-md">
        <div className="min-h-[300px] w-full bg-white font-exo">
          {/* Cabeçalho com título e botão para adicionar nova transação */}
          <div className="flex py-3 pb-4 items-center justify-between border-b-2 border-[#e2e8f0]">
            <div className="text-[#020817] font-exo text-2xl font-bold pl-5 border-l-4 border-[#00d17d]">
              ROI por brinquedo
            </div>
          </div>

          {/* Tabela de transações */}
          <div className="w-full mt-5 overflow-x-auto">
            <table className="w-full whitespace-nowrap">
              <thead>
                <tr className="border-b">
                  {[
                    "Brinquedo",
                    "Valor de Compra",
                    "Manutenção Acom.",
                    "Receita Acum.",
                    "ROI (%)",
                    "Status",
                  ].map((title) => (
                    <th key={title} className="text-left py-3 px-6 text-sm font-bold uppercase">
                      {title}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(dashboardData.tabela_roi_brinquedo && dashboardData.tabela_roi_brinquedo.length > 0) ? (
                  dashboardData.tabela_roi_brinquedo.map((brinquedo, index) => (
                    <tr key={brinquedo.id} className={index > 0 ? "border-t" : ""}>
                      <td className="whitespace-nowrap py-4 px-6">{brinquedo.nome}</td>
                      <td className="whitespace-nowrap py-4 px-6">{formatMoneyLocal(brinquedo.valor_compra)}</td>
                      <td className="whitespace-nowrap py-4 px-6">{formatMoneyLocal(brinquedo.manutencao_acumulada)}</td>
                      <td className="whitespace-nowrap py-4 px-6 text-green-700 font-semibold">{formatMoneyLocal(brinquedo.receita_acumulada)}</td>
                      <td className="whitespace-nowrap py-4 px-6 font-bold">{Number(brinquedo.roi_percentual).toFixed(2)}%</td>
                      <td className="whitespace-nowrap py-4 px-6">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${brinquedo.status === 'Ativo' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {brinquedo.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6}>
                      <div className="flex py-[52px] pb-7 flex-col items-center justify-center self-stretch">
                        <div className="text-[#a1a1aa] text-center font-exo text-xl font-bold leading-7">
                          Nenhum dado para exibir neste período...
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

      <div className="flex p-6 flex-col items-start self-stretch rounded-lg bg-white shadow-md">
        <div className="min-h-[300px] w-full bg-white font-exo whitespace-nowrap">
          {/* Cabeçalho com título e botão para adicionar nova transação */}
          <div className="flex py-3 pb-4 items-center justify-between border-b-2 border-[#e2e8f0]">
            <div className="text-[#020817] font-exo text-2xl font-bold pl-5 border-l-4 border-[#00d17d]">
              Previsão de Break-even
            </div>
          </div>

          {/* Tabela de transações */}
          <div className="w-full mt-5 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  {[
                    "Brinquedo",
                    "Investimento Total",
                    "Receita Mensal Média",
                    "Receita Acum. Atual",
                    "Previsão de Payback",
                  ].map((title) => (
                    <th key={title} className="text-left py-3 px-6 text-sm font-bold uppercase">
                      {title}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(dashboardData.tabela_break_even && dashboardData.tabela_break_even.length > 0) ? (
                  dashboardData.tabela_break_even.map((brinquedo, index) => (
                    <tr key={brinquedo.id} className={index > 0 ? "border-t" : ""}>
                      <td className="whitespace-nowrap py-4 px-6">{brinquedo.nome}</td>
                      <td className="whitespace-nowrap py-4 px-6">{formatMoneyLocal(brinquedo.investimento_total)}</td>
                      <td className="whitespace-nowrap py-4 px-6">{formatMoneyLocal(brinquedo.receita_mensal_media)}</td>
                      <td className="whitespace-nowrap py-4 px-6 text-green-700 font-semibold">{formatMoneyLocal(brinquedo.receita_acumulada_atual)}</td>
                      <td className="whitespace-nowrap py-4 px-6 font-bold">
                        <span className={
                          brinquedo.previsao_payback === 'Já pago'
                            ? 'text-green-600'
                            : 'text-orange-600'
                        }>
                          {brinquedo.previsao_payback}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5}>
                      <div className="flex py-[52px] pb-7 flex-col items-center justify-center self-stretch">
                        <div className="text-[#a1a1aa] text-center font-exo text-xl font-bold leading-7">
                          Nenhum dado para exibir neste período...
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
