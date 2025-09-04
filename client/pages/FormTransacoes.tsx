import { useState, useEffect, useRef } from "react";
import { Layout } from "@/components/Layout";
import { useNavigate, useParams } from "react-router-dom";
import { LuUserRoundSearch } from "react-icons/lu";
import { FaRegClock } from "react-icons/fa6";
import { DatePickerField } from "@/components/DatePickerField";
import { normalize, formatMoney } from "../lib/formatters";
import { toast } from "sonner";
import api from "../services/api";

export default function FormTransacao() {
  const { id } = useParams();
  const isEditando = Boolean(id); // Verifica se está editando com base na URL
  const navigate = useNavigate();

  // Inputs formatados para valores monetários
  const [valorInput, setValorInput] = useState("R$ 0,00");

  // Estados para gerenciamento de clientes
  const [searchTerm, setSearchTerm] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const containerRef = useRef(null);

  // Estado principal da festa com todos os dados necessários
  const [transacao, setTransacao] = useState({
    id: "",
    status_display: "",
    pagamento_display: "",
    tipo_display: "",
    categoria_display: "",
    origem_display: "",
    data_transacao: "",
    data_vencimento: "",
    tipo: "entrada",
    valor: 0,
    categoria: "aluguel",
    pagamento: "pago",
    descricao: "",
    origem: "",
    referencia_id: null,
    parcelado: "nao",
    qtd_parcelas: 0,
    parcela_atual: null,
    criado_em: "",
    atualizado_em: "",
    locacao: "",
  });

  // Fecha dropdown de busca ao clicar fora
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setSearchTerm("");
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Inicialização: carrega dados existentes ou prepara para nova festa
  useEffect(() => {
    // Se estiver editando, carrega os dados da festa existente
    if (isEditando) {
      carregarTransacaoExistente(id);
    }
  }, []);

  // Atualiza o input formatado quando o valor de entrada muda
  useEffect(() => {
    setValorInput(formatMoney(transacao.valor * 100));
  }, [transacao.valor]);

  // Manipula mudanças no valor de entrada, formatando e atualizando o estado
  const handleValorChange = (e) => {
    const input = e.target.value;

    // Extrai só os números (centavos)
    const numbers = input.replace(/\D/g, "");
    const cents = numbers ? parseInt(numbers, 10) : 0;

    // Atualiza input formatado
    setValorInput(formatMoney(cents));

    // Atualiza estado festa com valor em reais
    setTransacao(prev => ({
      ...prev,
      valor: cents / 100,
    }));
  };

  // Todas as opções possíveis
  const opcoesPagamento = [
    { value: "pago", label: "Pago" },
    { value: "entrada", label: "Entrada (sinal)" },
    { value: "nao_pago", label: "Não pago" },
    { value: "planejado", label: "Planejado" },
    { value: "cancelado", label: "Cancelado" },
  ];

  // Se for vinculado a locação (festa), filtra só as permitidas
  const opcoesFiltradas = transacao.locacao
    ? opcoesPagamento.filter(opt =>
      ["pago", "entrada", "nao_pago"].includes(opt.value)
    )
    : opcoesPagamento;

  // Converte string de valor monetário em centavos (inteiro)
  function parseCurrency(value: string) {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, "");

    // Se vazio, retornar 0
    if (!numbers) return 0;

    // Converte para número
    return parseInt(numbers, 10);
  }

  // Carrega os dados de uma festa existente para edição
  async function carregarTransacaoExistente(id) {
    try {
      // Busca os dados da festa pelo ID
      const res = await api.get(`/transacoes/${id}/`);
      const data = res.data;

      // Atualiza o estado com todos os dados da festa
      setTransacao({
        id: data.id,
        status_display: data.status_display,
        pagamento_display: data.pagamento_display,
        tipo_display: data.tipo_display,
        categoria_display: data.categoria_display,
        origem_display: data.origem_display,
        data_transacao: data.data_transacao,
        data_vencimento: data.data_vencimento,
        tipo: data.tipo,
        valor: Number(data.valor) || 0,
        categoria: data.categoria,
        pagamento: data.pagamento,
        descricao: data.descricao,
        origem: data.origem,
        referencia_id: Number(data.referencia_id) || 0,
        parcelado: data.parcelado,
        qtd_parcelas: Number(data.qtd_parcelas) || 0,
        parcela_atual: Number(data.parcela_atual) || null,
        criado_em: data.criado_em,
        atualizado_em: data.atualizado_em,
        locacao: data.locacao,

      })
    } catch (err) {
      toast.error("Erro ao carregar dados da transação.");
    }
  }


  const handleChangeTransacao = (e) => {
    const { name, value } = e.target;

    setTransacao((prev) => {
      let newValue = value;

      // Para campos numéricos, só converte se não estiver vazio
      if (["parcela_atual", "qtd_parcelas"].includes(name)) {
        newValue = value === "" ? "" : Number(value);
      }

      const newState = { ...prev, [name]: newValue };

      // Remove erro se tiver valor preenchido
      if (typeof value === "string" && value.trim() !== "") {
        setErros((prevErros) => {
          const novosErros = { ...prevErros };
          delete novosErros[name];
          return novosErros;
        });
      }

      return newState;
    });
  };

  // Estado para controlar campos com erro de validação
  const [erros, setErros] = useState<{ [key: string]: string }>({});

  // Envia o formulário após validação
  const handleSubmit = async () => {
    // Validação de campos obrigatórios
    const novosErros: { [key: string]: string } = {};

    {/*// Verifica todos os campos obrigatórios
    if (!festa.cliente) novosErros.cliente = "Selecione um cliente";
    if (!festa.data_festa) novosErros.data_festa = "Data da festa é obrigatória";
    if (!festa.data_desmontagem) novosErros.data_desmontagem = "Data da desmontagem é obrigatória";
    if (!festa.hora_festa) novosErros.hora_festa = "Hora da festa é obrigatória";
    if (!festa.hora_desmontagem) novosErros.hora_desmontagem = "Hora da desmontagem é obrigatória";
    if (!festa.hora_montagem) novosErros.hora_montagem = "Hora da montagem é obrigatória";
    if (!festa.duracao) novosErros.duracao = "Duração é obrigatória";
    if (!festa.montador) novosErros.montador = "Montador é obrigatório";
    if (festa.brinquedos_ids.length === 0) novosErros.brinquedos_ids = "Selecione ao menos um brinquedo";*/}

    // Atualiza o estado de erros para destacar campos
    setErros(novosErros);


    const dataTransacaoISO = transacao.data_transacao
      ? new Date(transacao.data_transacao).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0];

    const payload = {
      data_transacao: dataTransacaoISO,
      data_vencimento: transacao.parcelado === "sim"
        ? (transacao.data_vencimento
          ? new Date(transacao.data_vencimento).toISOString().split("T")[0]
          : dataTransacaoISO)
        : null,
      tipo: transacao.tipo,
      valor: Number(transacao.valor),
      categoria: transacao.categoria,
      pagamento: transacao.pagamento,
      descricao: transacao.descricao,
      origem: transacao.origem || "manual",
      referencia_id: transacao.referencia_id || null, // Mantenha os campos que podem ser atualizados
      parcelado: transacao.parcelado,
      qtd_parcelas:
        transacao.parcelado === "sim" && transacao.qtd_parcelas > 0
          ? Number(transacao.qtd_parcelas)
          : null,
      // parcela_atual: transacao.parcela_atual, // Você precisa decidir se este campo deve ser enviado
    };
    

    try {
      // Atualiza ou cria a transação dependendo do modo (edição ou criação)
      if (isEditando) {
        if (transacao.locacao) {
          await api.patch(`/locacoes/${transacao.locacao}/`, { pagamento: transacao.pagamento });
        }
        await api.put(`/transacoes/${id}/`, payload);
        toast.success("Transação atualizada com sucesso", {
          id: "alert",
        });
      } else {
        await api.post("/transacoes/", payload);
        toast.success("Transação criada com sucesso", {
          id: "alert",
        });
      }

      // Redireciona para a lista de festas após sucesso
      navigate("/transacoes");
    } catch (e) {
      // Trata erro de validação ou conexão
      console.error("Erro ao salvar:", e.response.data);
      toast.error("Erro ao salvar a transação. Verifique os campos e tente novamente.", {
        id: "alert",
      });
    }
  };


  return (
    <Layout>
      <div className="flex w-full flex-col lg:flex-row gap-6">
        {/* Client Section */}
        <div className="flex w-full p-6 flex-col items-start self-stretch rounded-lg bg-white shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.10),0px_2px_4px_-2px_rgba(0,0,0,0.10)]">
          {/* Header */}
          <div className="flex py-3 pb-[14px] items-center justify-between self-stretch border-b-2 border-[#e2e8f0] relative">
            <div className="text-[#020817] font-exo text-2xl font-bold leading-8 flex pl-5 flex-col items-start border-l-4 border-[#00d17d]">
              {isEditando ? "Editar" : "Adicionar"} Transação
            </div>
          </div>

          <div className="flex flex-col items-start self-stretch gap-3 mt-6">
            <div className="w-full overflow-x-auto">
              <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="">
                <div>
                  <h3 className="text-lg font-bold text-gray-800 border-b pb-1 mb-4">Dados da Transação</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Data */}
                    <div>
                      <label className="block text-base text-slate-400 mb-1">
                        Data da Transação
                      </label>
                      <DatePickerField
                        selectedDate={transacao.data_transacao}
                        onChange={(value) => {
                          setTransacao(prev => ({
                            ...prev,
                            data_transacao: value,
                          }));
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-base text-slate-400 mb-1">
                        Data de Vencimento
                      </label>
                      <DatePickerField
                        selectedDate={transacao.data_vencimento}
                        onChange={(value) => {
                          setTransacao(prev => ({
                            ...prev,
                            data_vencimento: value,
                          }));
                        }}
                      />
                    </div>
                    {/* Status */}
                    <div>
                      <label className="block text-base text-slate-400 mb-1">
                        Tipo de Transação
                      </label>
                      <select
                        name="tipo"
                        value={transacao.tipo}
                        onChange={handleChangeTransacao}
                        className="input w-full h-11">
                        <option value="entrada">Entrada</option>
                        <option value="saida">Saida</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-base text-slate-400 mb-1">
                        Valor
                      </label>
                      <input
                        type="text"
                        name="valor"
                        value={valorInput}
                        onChange={handleValorChange}
                        className="input w-full h-11"
                      />
                    </div>
                    <div>
                      <label className="block text-base text-slate-400 mb-1">
                        Categoria
                      </label>
                      <select
                        name="categoria"
                        value={transacao.categoria}
                        onChange={handleChangeTransacao}
                        className="input w-full h-11">
                        <option value="aluguel">Aluguel</option>
                        <option value="manutencao">Manutenção</option>
                        <option value="salario">Salário</option>
                        <option value="compra">Compra</option>
                        <option value="investimento">Investimento</option>
                        <option value="combustivel">Combustível</option>
                        <option value="outro">Outro</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Status */}
                    <div>
                      <label className="block text-base text-slate-400 mb-1">
                        Status
                      </label>
                      <select
                        name="pagamento"
                        value={transacao.pagamento ?? ""}
                        onChange={handleChangeTransacao}
                        className="input w-full h-11">
                        {opcoesFiltradas.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-base text-slate-400 mb-1">Parcelado?</label>
                      <select
                        name="parcelado"
                        value={transacao.parcelado}
                        onChange={handleChangeTransacao}
                        className="input w-full h-11"
                      >
                        <option value="nao">Não</option>
                        <option value="sim">Sim</option>
                      </select>
                    </div>
                    {transacao.parcelado === "sim" && (
                      <div>
                        <label className="block text-base text-slate-400 mb-1">N° de Parcelas Totais</label>
                        <input
                          type="number"
                          min={1}
                          name="qtd_parcelas"
                          value={transacao.qtd_parcelas || ""}
                          onChange={handleChangeTransacao}
                          className="input w-full h-11"
                        />
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-4 mb-10">
                  <label className="block text-base text-slate-400 mb-1">
                    Descrição:
                  </label>
                  <textarea
                    rows={3}
                    name="descricao"
                    value={transacao.descricao}
                    onChange={handleChangeTransacao}
                    className="input w-full p-3"
                  />
                </div>
                {/* Botões */}
                <div className="mt-4 mb-12">
                  {/* BOTÕES */}
                  <div className="flex justify-between">
                    <button
                      type="button"
                      onClick={() => navigate("/transacoes")}
                      className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded shadow"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="bg-[#0B0F1C] hover:bg-gray-900 text-white px-6 py-2 rounded shadow"
                    >
                      Cadastrar
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
