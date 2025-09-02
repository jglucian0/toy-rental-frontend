import { useState, useEffect, useRef } from "react";
import { Layout } from "@/components/Layout";
import { useNavigate, useParams } from "react-router-dom";
import { LuUserRoundSearch } from "react-icons/lu";
import { FaRegClock } from "react-icons/fa6";
import { DatePickerField } from "@/components/DatePickerField";
import { toast } from "sonner";
import api from "../services/api";

// Função para normalizar texto (remover acentos, converter para minúsculas)
const normalize = (text: string) => {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
};

export default function FormFesta() {
  const { id } = useParams();
  const isEditando = Boolean(id); // Verifica se está editando com base na URL
  const navigate = useNavigate();

  // Inputs formatados para valores monetários
  const [acrescimosInput, setAcrescimosInput] = useState("R$ 0,00");
  const [descontosInput, setDescontosInput] = useState("R$ 0,00");
  const [valorEntradaInput, setValorEntradaInput] = useState("R$ 0,00");

  // Estados para gerenciamento de clientes
  const [listaClientes, setListaClientes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const containerRef = useRef(null);

  // Estados para gerenciamento de brinquedos
  const [brinquedosDisponiveis, setBrinquedosDisponiveis] = useState([]);
  const [brinquedosSelecionadosDetalhes, setBrinquedosSelecionadosDetalhes] = useState([]);
  const [dataOriginalFesta, setDataOriginalFesta] = useState<string | null>(null);

  // Outros estados de controle
  const [usarEnderecoCliente, setUsarEnderecoCliente] = useState(false);


  // Estado principal da festa com todos os dados necessários
  const [festa, setFesta] = useState({
    // Dados do cliente
    cliente: "",

    // Dados dos brinquedos
    brinquedos_ids: [],          // IDs dos brinquedos selecionados
    brinquedos_originais: [],    // Brinquedos originais (usado na edição)

    // Dados de data e hora
    data_festa: "",
    hora_festa: "",
    duracao: "8h",
    hora_montagem: "",
    data_desmontagem: "",
    hora_desmontagem: "",

    // Dados financeiros
    montador: "João & Gabi",
    valor_entrada: 0,
    valor_total: 0,
    acrescimos: 0,
    descontos: 0,
    qtd_parcelas: 1,
    status: "pendente",
    metodo_pagamento: "pix",
    pagamento: "nao_pago",

    // Dados de endereço
    descricao: "",
    cep: "",
    endereco: "",
    numero: "",
    cidade: "",
    uf: "",
    complemento: "",
  });

  // Inicialização: carrega dados existentes ou prepara para nova festa
  useEffect(() => {
    // Se estiver editando, carrega os dados da festa existente
    if (isEditando) {
      carregarFestaExistente(id);
    }

    // Carrega a lista de clientes disponíveis
    carregarListaClientes();
  }, []);

  // Atualiza o input formatado quando o valor de entrada muda
  useEffect(() => {
    setValorEntradaInput(formatMoney(festa.valor_entrada * 100));
  }, [festa.valor_entrada]);

  // Manipula mudanças no valor de entrada, formatando e atualizando o estado
  const handleValorEntradaChange = (e) => {
    const input = e.target.value;

    // Extrai só os números (centavos)
    const numbers = input.replace(/\D/g, "");
    const cents = numbers ? parseInt(numbers, 10) : 0;

    // Atualiza input formatado
    setValorEntradaInput(formatMoney(cents));

    // Atualiza estado festa com valor em reais
    setFesta(prev => ({
      ...prev,
      valor_entrada: cents / 100,
    }));
  };

  // Mantém o input de acréscimos formatado quando o valor muda
  useEffect(() => {
    setAcrescimosInput(formatMoney(festa.acrescimos * 100));
  }, [festa.acrescimos]);

  // Mantém o input de descontos formatado quando o valor muda
  useEffect(() => {
    setDescontosInput(formatMoney(festa.descontos * 100));
  }, [festa.descontos]);

  // Converte string de valor monetário em centavos (inteiro)
  function parseCurrency(value: string) {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, "");

    // Se vazio, retornar 0
    if (!numbers) return 0;

    // Converte para número
    return parseInt(numbers, 10);
  }

  // Formata valor em centavos para string monetária (R$ 123,45)
  function formatMoney(cents: number) {
    const reais = (cents / 100).toFixed(2);
    return "R$ " + reais.replace(".", ",");
  }

  // Manipula mudanças nos acréscimos, formatando e atualizando o estado
  const handleAcrescimosChange = (e) => {
    const input = e.target.value;
    const cents = parseCurrency(input);

    // Atualiza o input com o valor formatado
    setAcrescimosInput(formatMoney(cents));

    // Atualiza o estado festa com valor em reais (cents / 100)
    setFesta(prev => ({
      ...prev,
      acrescimos: cents / 100,
    }));
  };

  // Manipula mudanças nos descontos, formatando e atualizando o estado
  const handleDescontosChange = (e) => {
    const input = e.target.value;
    const cents = parseCurrency(input);

    // Atualiza o input com o valor formatado
    setDescontosInput(formatMoney(cents));

    // Atualiza o estado festa com valor em reais
    setFesta(prev => ({
      ...prev,
      descontos: cents / 100,
    }));
  };

  // Busca detalhes dos brinquedos selecionados quando a lista de IDs muda
  useEffect(() => {
    async function buscarDetalhesBrinquedos() {
      // Se não há brinquedos selecionados, limpa os detalhes
      if (festa.brinquedos_ids.length === 0) {
        setBrinquedosSelecionadosDetalhes([]);
        return;
      }

      try {
        // Busca detalhes de todos os brinquedos selecionados de uma vez
        const idsString = festa.brinquedos_ids.join(",");
        const res = await api.get(`/brinquedos/?ids=${idsString}`);
        setBrinquedosSelecionadosDetalhes(res.data);
      } catch (err) {
        console.error("Erro ao buscar detalhes dos brinquedos", err);
        setBrinquedosSelecionadosDetalhes([]);
      }
    }

    buscarDetalhesBrinquedos();
  }, [festa.brinquedos_ids]);

  // Recalcula valor total e valor de entrada automaticamente quando mudam os brinquedos ou valores
  useEffect(() => {
    // Filtra apenas os brinquedos que foram selecionados
    const brinquedosSelecionados = brinquedosDisponiveis.filter(b =>
      festa.brinquedos_ids.includes(b.id)
    );

    // Soma o valor de todos os brinquedos selecionados
    const somaBrinquedos = brinquedosSelecionados.reduce(
      (total, b) => total + Number(b.valor_diaria),
      0
    );

    // Calcula o valor total considerando acréscimos e descontos
    const total = somaBrinquedos + Number(festa.acrescimos) - Number(festa.descontos);

    // Atualiza o valor total e define entrada como 30% do total
    setFesta(prev => ({
      ...prev,
      valor_total: total,
      valor_entrada: total * 0.3,
    }));
  }, [festa.brinquedos_ids, festa.acrescimos, festa.descontos, brinquedosDisponiveis]);


  // Adiciona ou remove um brinquedo da lista de selecionados
  const handleToggleBrinquedo = (brinquedo) => {
    setFesta(prev => {
      // Se o brinquedo já está selecionado, remove-o; caso contrário, adiciona-o
      const ids = prev.brinquedos_ids.includes(brinquedo.id)
        ? prev.brinquedos_ids.filter(id => id !== brinquedo.id)
        : [...prev.brinquedos_ids, brinquedo.id];

      return { ...prev, brinquedos_ids: ids };
    });
  };

  // Carregar brinquedos disponíveis
  // Este efeito busca os brinquedos disponíveis nas datas selecionadas
  // e também inclui os brinquedos originais da festa quando em modo de edição
  useEffect(() => {
    async function buscarBrinquedosDisponiveis() {
      if (festa.data_festa && festa.data_desmontagem && festa.data_festa <= festa.data_desmontagem) {
        try {
          const res = await api.get(
            `/brinquedos/disponiveis/?data_festa=${festa.data_festa}&data_desmontagem=${festa.data_desmontagem}`
          );
          const data = res.data;
          let brinquedosCompletos = [...data];

          // Mescla os disponíveis com os brinquedos originais da festa
          // Só mescla os brinquedos originais se a data da festa não mudou
          if (
            dataOriginalFesta &&
            festa.data_festa === dataOriginalFesta &&
            festa.brinquedos_originais
          ) {
            const brinquedosDaFestaQueFaltam =
              festa.brinquedos_originais?.filter(
                (b) => !data.some((d) => d.id === b.id)
              ) || [];
            brinquedosCompletos = [...data, ...brinquedosDaFestaQueFaltam.map(b => ({
              ...b,
              indisponivel: true
            }))];
          }
          setBrinquedosDisponiveis(brinquedosCompletos);

          // Agora ajusta os brinquedos selecionados para só os disponíveis
          setFesta((prev) => {
            // Se a data mudou, remove brinquedos que não estão disponíveis
            if (!dataOriginalFesta || festa.data_festa !== dataOriginalFesta) {
              const idsDisponiveis = data.map((b) => b.id);
              const novosSelecionados = prev.brinquedos_ids.filter((id) =>
                idsDisponiveis.includes(id)
              );

              return {
                ...prev,
                brinquedos_ids: novosSelecionados,
              };
            }
            return prev; // mantém o que já tinha se data não mudou
          });
        } catch (err) {
          console.error("Erro ao buscar brinquedos:", err);
          setBrinquedosDisponiveis([]);
        }
      } else {
        setBrinquedosDisponiveis([]);
      }
    }

    buscarBrinquedosDisponiveis();
  }, [festa.data_festa, festa.data_desmontagem, festa.brinquedos_originais, dataOriginalFesta]);



  // Responsável pelo carregamento de Clientes
  // Busca todos os clientes ativos do sistema para exibição no dropdown de seleção
  async function carregarListaClientes() {
    await api.get("/clientes/ativos/")
      .then(res => {
        setListaClientes(res.data);
      })
      .catch(err => {
        toast.error("Erro ao carregar lista de clientes.");
      })
  }

  // Carrega os dados de uma festa existente para edição
  async function carregarFestaExistente(id) {
    try {
      // Busca os dados da festa pelo ID
      const res = await api.get(`/locacoes/${id}/`);
      const data = res.data;

      // Atualiza o estado com todos os dados da festa
      setFesta({
        cliente: data.cliente,
        brinquedos_ids: data.brinquedos.map(b => b.id),
        brinquedos_originais: data.brinquedos,
        data_festa: data.data_festa,
        hora_festa: data.hora_festa,
        duracao: data.duracao,
        hora_montagem: data.hora_montagem,
        data_desmontagem: data.data_desmontagem,
        hora_desmontagem: data.hora_desmontagem,
        montador: data.montador,
        valor_entrada: Number(data.valor_entrada) || 0,
        valor_total: Number(data.valor_total) || 0,
        acrescimos: Number(data.acrescimos) || 0,
        descontos: Number(data.descontos) || 0,
        qtd_parcelas: data.qtd_parcelas,
        status: data.status,
        metodo_pagamento: data.metodo_pagamento,
        pagamento: data.pagamento,
        descricao: data.descricao,
        cep: data.cep,
        endereco: data.endereco,
        numero: data.numero,
        cidade: data.cidade,
        uf: data.uf,
        complemento: data.complemento,
      })

      setDataOriginalFesta(data.data_festa);

      // Busca informações do cliente para exibição
      if (data.cliente) {
        const clienteResponse = await api.get(`/clientes/${data.cliente}/`);
        setSearchTerm(clienteResponse.data.nome);
      }
    } catch (err) {
      toast.error("Erro ao carregar dados da festa.");
    }
  }



  // Se a URL tiver o ID de um cliente, já preenche com ele
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const clienteId = urlParams.get("cliente");
    if (clienteId) {
      api.get(`/clientes/${clienteId}/`).then((res) => {
        const dados = res.data;
        setFesta((prev) => ({
          ...prev,
          cliente: dados.id,
        }));
        setSearchTerm(dados.nome);
      });
    }
  }, []);

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




  // Seleciona um cliente e preenche seus dados no formulário, incluindo endereço se a opção estiver marcada
  const handleSelectCliente = (cliente) => {

    api.get(`/clientes/${cliente.id}/`).then((res) => {
      const dados = res.data;
      setFesta((prev) => ({
        ...prev,
        cliente: dados.id,
        ...(usarEnderecoCliente && {
          cep: dados.cep || "85260000",
          endereco: dados.endereco || "",
          numero: dados.numero || "S/N",
          cidade: dados.cidade || "Manoel Ribas",
          uf: dados.uf || "PR",
          complemento: dados.complemento || "",
        }),
      }));
    });
    setSearchTerm("");
    setDropdownOpen(false);
  };

  // Atualiza o termo de busca e abre o dropdown de clientes
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setDropdownOpen(true);
  };

  // Limpa a seleção de cliente e reseta os campos relacionados
  const handleClearSelection = () => {
    setFesta((prev) => ({
      ...prev,
      id: "",
      nome: "",
      documento: "",
      telefone: "",
    }));
    setSearchTerm("");
    setDropdownOpen(false);
  };

  // Manipula mudanças em qualquer campo do formulário da festa
  const handleChangeFesta = (e) => {
    const { name, value } = e.target;

    setFesta((prev) => {
      let newState = { ...prev };

      // Cálculo automático da hora de montagem baseado na hora da festa
      if (name === "hora_festa" && value) {
        const [hourStr, minuteStr] = value.split(":");
        let hour = parseInt(hourStr);
        const minute = parseInt(minuteStr);
        hour = hour - 1 < 0 ? 23 : hour - 1; // Ajusta para o dia anterior se necessário
        newState.hora_montagem = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
        newState.hora_festa = value;
      } else {
        newState[name] = value;
      }

      // Remove o erro do campo se ele foi preenchido
      if (value.trim() !== "") {
        setErros((prevErros) => {
          const novosErros = { ...prevErros };
          delete novosErros[name];
          return novosErros;
        });
      }

      // Cálculo automático da hora de desmontagem
      // Quando muda a hora da festa, duração ou hora de montagem, recalcula a hora de desmontagem
      // Adiciona 30 minutos ao final da duração para tempo de desmontagem
      if (["hora_montagem", "duracao", "hora_festa"].includes(name) && newState.hora_montagem && newState.duracao) {
        const [festaHour, festaMin] = newState.hora_festa.split(":").map(Number);
        const duracaoHour = parseInt(newState.duracao);

        let totalMin = festaMin + 30; // Adiciona 30 minutos para desmontagem
        let totalHour = festaHour + duracaoHour;
        if (totalMin >= 60) {
          totalHour += 1;
          totalMin -= 60;
        }
        if (totalHour >= 24) totalHour -= 24; // Ajusta para formato 24h

        newState.hora_desmontagem = `${String(totalHour).padStart(2, "0")}:${String(totalMin).padStart(2, "0")}`;
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
    


    // Verifica todos os campos obrigatórios
    if (!festa.cliente) novosErros.cliente = "Selecione um cliente";
    if (!festa.data_festa) novosErros.data_festa = "Data da festa é obrigatória";
    if (!festa.data_desmontagem) novosErros.data_desmontagem = "Data da desmontagem é obrigatória";
    if (!festa.hora_festa) novosErros.hora_festa = "Hora da festa é obrigatória";
    if (!festa.hora_desmontagem) novosErros.hora_desmontagem = "Hora da desmontagem é obrigatória";
    if (!festa.hora_montagem) novosErros.hora_montagem = "Hora da montagem é obrigatória";
    if (!festa.duracao) novosErros.duracao = "Duração é obrigatória";
    if (!festa.montador) novosErros.montador = "Montador é obrigatório";
    if (festa.brinquedos_ids.length === 0) novosErros.brinquedos_ids = "Selecione ao menos um brinquedo";

    if (new Date(festa.data_festa) > new Date(festa.data_desmontagem)) {
      novosErros.data_festa = "Data da festa não pode ser após a desmontagem";
    }

    if (festa.brinquedos_ids.length === 0) {
      novosErros.brinquedos_ids = "Selecione ao menos um brinquedo";
    }
    
    
    // Validações adicionais de regras de negócio
    if (new Date(festa.data_festa) > new Date(festa.data_desmontagem)) {
      toast.error("Data da festa não pode ser após a desmontagem.");
      return;
    }

    // Atualiza o estado de erros para destacar campos
    setErros(novosErros);

    // Se houver campos em branco, interrompe o envio
    if (Object.keys(novosErros).length > 0) {
      if (
        Object.keys(novosErros).length === 1 &&
        novosErros.brinquedos_ids
      ) {
        toast.error("Por favor selecione pelo menos um brinquedo");
      } else {
        toast.error("Existem campos em branco!");
      }
      return;
    }

    // Prepara os dados para envio
    const payload = {
      ...festa,
      cliente: festa.cliente,
      brinquedos_ids: festa.brinquedos_ids,
    };

    try {
      // Atualiza ou cria a locação dependendo do modo (edição ou criação)
      if (isEditando) {
        await api.put(`/locacoes/${id}/`, payload);
        toast.success("Locação atualizada com sucesso", {
          id: "alert",
        });
      } else {
        await api.post("/locacoes/", payload);
        toast.success("Locação criada com sucesso", {
          id: "alert",
        });
      }

      // Redireciona para a lista de festas após sucesso
      navigate("/festas");
    } catch (error: any) {
      if (error.response?.data) {
        const [campo] = Object.entries(error.response.data)[0];
        const mensagemErro = `O "${campo}" não pode ficar em branco!`;
        toast.error(mensagemErro, { id: "alert" });
      } else {
        toast.error("Erro de conexão com o servidor.", { id: "alert" });
      }
    }


  };


  // Obtém os dados do cliente selecionado para exibição
  const clienteSelecionado = listaClientes.find(c => c.id === festa.cliente);

  // Normaliza o termo de busca para comparação sem acentos ou case
  const search = normalize(searchTerm);

  // Filtra os clientes que correspondem ao termo de busca
  const filteredClientes = listaClientes.filter(cliente =>
    normalize(cliente.nome).includes(search) ||
    normalize(cliente.documento).includes(search) ||
    normalize(cliente.telefone).includes(search) ||
    normalize(cliente.status) === search
  );

  return (
    <Layout>
      <div className="flex w-full flex-col lg:flex-row gap-6">
        {/* Client Section */}
        <div className="flex w-full p-6 flex-col items-start self-stretch rounded-lg bg-white shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.10),0px_2px_4px_-2px_rgba(0,0,0,0.10)]">
          {/* Header */}
          <div className="flex py-3 pb-[14px] items-center justify-between self-stretch border-b-2 border-[#e2e8f0] relative">
            <div className="text-[#020817] font-exo text-2xl font-bold leading-8 flex pl-5 flex-col items-start border-l-4 border-[#00d17d]">
              {isEditando ? "Editar" : "Adicionar"} Festa
            </div>
          </div>

          <div className="flex flex-col items-start self-stretch gap-3 mt-6">
            <div className="w-full overflow-x-auto">
              <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="">
                {/* Dados pessoais */}
                <div>
                  <h3 className="text-lg font-bold text-gray-800 border-b pb-1 mb-4">Dados Pessoais</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Client Search */}
                    <div>
                      <div ref={containerRef} className="relative">
                        <input
                          type="text"
                          value={searchTerm}
                          onChange={handleSearchChange}
                          onFocus={() => setDropdownOpen(true)}
                          className={`border w-full border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400; ${erros.cliente ? " border-red-500" : ""}`}
                          placeholder="Selecione um cliente..."
                        />
                        {dropdownOpen && (
                          <ul className="absolute z-10 w-full max-h-60 overflow-auto bg-white border border-gray-300 rounded-md mt-1 shadow-lg">
                            {filteredClientes.length === 0 ? (
                              <li className="p-2 text-gray-500">Nenhum cliente encontrado</li>
                            ) : (
                              filteredClientes.map(cliente => (
                                <li
                                  key={cliente.id}
                                  onClick={() => handleSelectCliente(cliente)}
                                  className="cursor-pointer p-2 hover:bg-blue-100"
                                >
                                  {cliente.nome}
                                </li>
                              ))
                            )}
                          </ul>
                        )}
                        <LuUserRoundSearch className="absolute right-3 top-2.5 h-5 w-5 text-gray-600" />
                      </div>
                    </div>
                    {/* Nome */}
                    <input
                      type="text"
                      name="nome"
                      placeholder="Nome"
                      value={clienteSelecionado ? clienteSelecionado.nome : ""} readOnly
                      onChange={(e) => {
                        handleChangeFesta(e);
                        setSearchTerm(e.target.value);
                      }}
                      className={`input ${erros.cliente ? " border-red-500" : ""}`}
                    />
                    {/* Documento */}
                    <input
                      type="text"
                      name="documento"
                      placeholder="Documento (CPF/CNPJ)"
                      value={clienteSelecionado ? clienteSelecionado.documento : ""} readOnly
                      onChange={handleChangeFesta}
                      className={`input ${erros.cliente ? " border-red-500" : ""}`}
                    />
                    {/* Telefone */}
                    <input
                      type="text"
                      name="telefone"
                      placeholder="Telefone"
                      value={clienteSelecionado ? clienteSelecionado.telefone : ""} readOnly
                      onChange={handleChangeFesta}
                      className={`input ${erros.cliente ? " border-red-500" : ""}`}
                    />
                  </div>
                </div>
                {/* Dados da festa */}
                <div className="mt-10">
                  <h3 className="text-lg font-bold text-gray-800 border-b pb-1 mb-4">Dados da Festa</h3>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    {/* Data */}
                    <div>
                      <label className="block text-base text-slate-400 mb-1">
                        Data da festa
                      </label>
                      <DatePickerField
                        selectedDate={festa.data_festa}
                        onChange={(value) => {
                          setFesta(prev => ({
                            ...prev,
                            data_festa: value,
                            data_desmontagem: value
                          }));
                        }}
                      />
                    </div>
                    {/* Hora */}
                    <div>
                      <label className="block text-base text-slate-400 mb-1">
                        Hora da festa
                      </label>
                      <div className="relative">
                        <input
                          type="time"
                          name="hora_festa"
                          value={festa.hora_festa}
                          onChange={handleChangeFesta}
                          className={`input flex h-11 w-full items-center px-3 py-2 rounded-md text-left ${erros.hora_festa ? " border-red-500" : ""}`}
                          placeholder="HH:mm"
                        />
                        <FaRegClock className="absolute right-3 top-2.5 h-5 w-5 text-gray-600" />
                      </div>
                    </div>
                    {/* Duração */}
                    <div>
                      <label className="block text-base text-slate-400 mb-1">
                        Duração
                      </label>
                      <select
                        name="duracao"
                        value={festa.duracao}
                        onChange={handleChangeFesta}
                        className={`input h-11 flex w-full items-center px-3 py-2 rounded-md text-left ${erros.duracao ? " border-red-500" : ""}`}
                      >
                        {[3, 4, 5, 6, 7, 8].map((hour) => (
                          <option key={hour} value={`${hour}h`}>{hour}h 0min</option>
                        ))}
                      </select>
                    </div>
                    {/* Montagem */}
                    <div>
                      <label className="block text-base text-slate-400 mb-1">
                        Montagem
                      </label>
                      <div className="relative">
                        <input
                          type="time"
                          name="hora_montagem"
                          value={festa.hora_montagem}
                          onChange={handleChangeFesta}
                          className={`input flex w-full items-center px-3 py-2 rounded-md text-left ${erros.hora_montagem ? " border-red-500" : ""}`}
                          placeholder="HH:mm"
                        />
                        <FaRegClock className="absolute right-3 top-2.5 h-5 w-5 text-gray-600" />
                      </div>
                    </div>
                    {/* Data recolher */}
                    <div>
                      <label className="block text-base text-slate-400 mb-1">
                        Data para recolher
                      </label>
                      <DatePickerField
                        selectedDate={festa.data_desmontagem}
                        onChange={(val) => setFesta({ ...festa, data_desmontagem: val })}
                        position="left"
                      />
                    </div>

                  </div>
                </div>
                <div className="mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Recolher */}
                    <div>
                      <label className="block text-base text-slate-400 mb-1">
                        Recolher
                      </label>
                      <div className="relative">
                        <input
                          type="time"
                          name="hora_desmontagem"
                          value={festa.hora_desmontagem}
                          onChange={handleChangeFesta}
                          className={`input flex h-11 w-full items-center px-3 py-2 rounded-md text-left ${erros.hora_desmontagem ? " border-red-500" : ""}`}
                          placeholder="HH:mm"
                        />
                        <FaRegClock className="absolute right-3 top-2.5 h-5 w-5 text-gray-600" />
                      </div>
                    </div>
                    {/* Montador */}
                    <div>
                      <label className="block text-base text-slate-400 mb-1">
                        Montador
                      </label>
                      <input
                        type="text"
                        name="montador"
                        value={festa.montador}
                        onChange={handleChangeFesta}
                        className={`input w-full h-11 px-3 ${erros.montador ? " border-red-500" : ""}`}
                      />
                    </div>
                    {/* Valor de entrada */}
                    <div>
                      <label className="block text-base text-slate-400 mb-1">
                        Valor de entrada
                      </label>
                      <input
                        type="text"
                        name="valor_entrada"
                        value={valorEntradaInput}
                        onChange={handleValorEntradaChange}
                        className="input w-full h-11"
                      />
                    </div>
                    {/* Qtd Parcelas */}
                    <div>
                      <label className="block text-base text-slate-400 mb-1">
                        Qtd Parcelas
                      </label>
                      <input
                        type="number"
                        name="qtd_parcelas"
                        value={festa.qtd_parcelas}
                        onChange={handleChangeFesta}
                        className="input w-full h-11"
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Status */}
                    <div>
                      <label className="block text-base text-slate-400 mb-1">
                        Status da Festa
                      </label>
                      <select
                        name="status"
                        value={festa.status}
                        onChange={handleChangeFesta}
                        className="input w-full h-11">
                        <option value="pendente">Pendente</option>
                        <option value="confirmado">Confirmado</option>
                        <option value="montado">Montado</option>
                        <option value="recolher">Recolher</option>
                        <option value="finalizado">Finalizado</option>
                      </select>
                    </div>
                    {/* Método de Pag */}
                    <div>
                      <label className="block text-base text-slate-400 mb-1">
                        Método de Pagamento
                      </label>
                      <select
                        name="metodo_pagamento"
                        value={festa.metodo_pagamento}
                        onChange={handleChangeFesta}
                        className="input w-full h-11"
                      >
                        <option value="dinheiro">Dinheiro</option>
                        <option value="credito">Crédito</option>
                        <option value="debito">Débito</option>
                        <option value="pix">Pix</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-base text-slate-400 mb-1">
                        Pagamento
                      </label>
                      <select
                        name="pagamento"
                        value={festa.pagamento}
                        onChange={handleChangeFesta}
                        className="input w-full h-11"
                      >
                        <option value="nao_pago">Não pago</option>
                        <option value="pago">Pago</option>
                        <option value="entrada">30% Pago</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="mt-4 mb-10">
                  <label className="block text-base text-slate-400 mb-1">
                    Descrição:
                  </label>
                  <textarea
                    rows={3}
                    name="descricao"
                    value={festa.descricao}
                    onChange={handleChangeFesta}
                    className="input w-full p-3"
                  />
                </div>
                {/* Endereço */}
                <div className="mt-4">
                  <h3 className="text-lg font-bold text-gray-800 border-b pb-1 mb-4">Endereço</h3>
                  <div className="mt-6">
                    <div className="flex items-center gap-3 mb-6">
                      <span className="text-lg text-slate-900">
                        Usar endereço do cliente?
                      </span>
                      <div className="w-12 h-6 bg-gray-300 rounded-full relative cursor-pointer">
                        <div
                          onClick={() => {
                            setUsarEnderecoCliente((prev) => {
                              const novoValor = !prev;

                              // Se o switch foi ativado e existe cliente_id válido
                              if (novoValor && festa.cliente) {
                                const clienteSelecionado = listaClientes.find(c => c.id === festa.cliente);
                                if (clienteSelecionado) {
                                  setFesta(prev => ({
                                    ...prev,
                                    cep: clienteSelecionado.cep || "",
                                    endereco: clienteSelecionado.endereco || "",
                                    numero: clienteSelecionado.numero || "S/N",
                                    cidade: clienteSelecionado.cidade || "",
                                    uf: clienteSelecionado.uf || "",
                                    complemento: clienteSelecionado.complemento || "",
                                  }));
                                }
                              }

                              return novoValor;
                            });
                          }}
                          className={`w-12 h-6 rounded-full cursor-pointer relative transition-colors ${usarEnderecoCliente ? "bg-green-500" : "bg-gray-300"
                            }`}
                        >
                          <div
                            className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${usarEnderecoCliente ? "translate-x-6" : "translate-x-1"
                              }`}
                          />
                        </div>
                      </div>
                    </div>

                    {!usarEnderecoCliente && (
                      <div>
                        {/* CEP */}
                        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                          <div className="md:col-span-1">
                            <label className="block text-base text-slate-400 mb-1">
                              CEP
                            </label>
                            <input
                              type="text"
                              name="cep"
                              value={festa.cep}
                              onChange={handleChangeFesta}
                              className="w-full h-9 px-3 text-sm border border-gray-300 rounded-md bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>

                          {/* Rua */}
                          <div className="md:col-span-2">
                            <label className="block text-base text-slate-400 mb-1">
                              Rua
                            </label>
                            <input
                              type="text"
                              name="endereco"
                              value={festa.endereco}
                              onChange={handleChangeFesta}
                              className="w-full h-9 px-3 text-sm border border-gray-300 rounded-md bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>

                          {/* Número */}
                          <div className="md:col-span-1">
                            <label className="block text-base text-slate-400 mb-1">
                              Número
                            </label>
                            <input
                              type="text"
                              name="numero"
                              value={festa.numero}
                              onChange={handleChangeFesta}
                              className="w-full h-9 px-3 text-sm border border-gray-300 rounded-md bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>

                        </div>

                        {/* Cidade */}
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-4">
                          <div className="md:col-span-1">
                            <label className="block text-base text-slate-400 mb-1">
                              Cidade
                            </label>
                            <input
                              type="text"
                              name="cidade"
                              value={festa.cidade}
                              onChange={handleChangeFesta}
                              className="w-full h-9 px-3 text-sm border border-gray-300 rounded-md bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>

                          {/* UF */}
                          <div className="md:col-span-1">
                            <label className="block text-base text-slate-400 mb-1">
                              UF
                            </label>
                            <input
                              type="text"
                              name="uf"
                              value={festa.uf}
                              onChange={handleChangeFesta}
                              className="w-full h-9 px-3 text-sm border border-gray-300 rounded-md bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>

                          {/* Complemento */}
                          <div className="md:col-span-2 mb-10">
                            <div>
                              <label className="block text-base text-slate-400 mb-1">
                                Complemento
                              </label>
                              <input
                                type="text"
                                name="complemento"
                                value={festa.complemento}
                                onChange={handleChangeFesta}
                                className="w-full h-9 px-3 text-sm border border-gray-300 rounded-md bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                  </div>
                </div>
                {/* Brinquedos */}
                <div className="mt-4 mb-10">
                  <h3 className="text-lg font-bold text-gray-800 border-b pb-1 mb-4">Brinquedos disponíveis</h3>
                  <div className="mt-6">
                    {brinquedosDisponiveis.length === 0 ? (
                      <p className="text-lg text-red-500">
                        Sem brinquedos disponíveis na data informada!
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {brinquedosDisponiveis.map((b) => {
                          const estaIndisponivel =
                            !festa.brinquedos_originais?.some((orig) => orig.id === b.id) &&
                            !brinquedosDisponiveis.some((disp) => disp.id === b.id); // já tratado no useEffect, então opcional

                          return (
                            <label
                              key={b.id}
                              className={`flex items-center gap-2 p-3 border rounded-lg ${estaIndisponivel ? "bg-red-50 text-red-500 cursor-not-allowed" : "hover:bg-gray-50"
                                }`}
                            >
                              <input
                                type="checkbox"
                                checked={festa.brinquedos_ids.includes(b.id)}
                                disabled={estaIndisponivel}
                                onChange={(e) => {
                                  const newList = e.target.checked
                                    ? [...festa.brinquedos_ids, b.id]
                                    : festa.brinquedos_ids.filter((id) => id !== b.id);
                                  setFesta({ ...festa, brinquedos_ids: newList });
                                }}
                              />
                              <span>
                                {b.nome}
                                {estaIndisponivel && " (indisponível)"}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
                {/* Botões */}
                <div className="mt-4 mb-10">
                  {/* BOTÕES */}
                  <div className="flex justify-between">
                    <button
                      type="button"
                      onClick={() => navigate("/festas")}
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

        {/* Sidebar - Desktop */}
        <div className="hidden lg:block w-full max-w-[300px] lg:sticky top-0 self-start h-fit">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="border-b border-blue-200 pb-3 mb-6">
              <h3 className="text-lg font-bold text-slate-900">
                Valor da Festa
              </h3>
            </div>

            <div className="space-y-4">
              {/* Acréscimos */}
              <div>
                <label className="block text-base text-slate-400 mb-1">
                  Acréscimos
                </label>
                <input
                  type="text"
                  name="acrescimos"
                  value={acrescimosInput}
                  onChange={handleAcrescimosChange}
                  className="input w-full h-11"
                />
              </div>

              {/* Descontos */}
              <div>
                <label className="block text-base text-slate-600 mb-1">
                  Descontos
                </label>
                <input
                  type="text"
                  name="descontos"
                  value={descontosInput}
                  onChange={handleDescontosChange}
                  className="input w-full h-11"
                />
              </div>

              {/* Total */}
              <div className="border-t border-gray-300 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-base font-bold text-slate-900">
                    Total:
                  </span>
                  <span className="text-base font-bold text-slate-900">
                    {formatMoney(Math.round(festa.valor_total * 100))}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Sidebar - Mobile */}
        <div className="block lg:hidden w-full">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="border-b border-blue-200 pb-3 mb-6">
              <h3 className="text-lg font-bold text-slate-900">
                Valor da Festa
              </h3>
            </div>

            <div className="space-y-4">
              {/* Acréscimos */}
              <div>
                <label className="block text-base text-slate-400 mb-1">
                  Acréscimos
                </label>
                <input
                  type="number"
                  name="acrescimos"
                  value={festa.acrescimos}
                  onChange={handleChangeFesta}
                  className="input w-full h-11"
                />
              </div>

              {/* Descontos */}
              <div>
                <label className="block text-base text-slate-600 mb-1">
                  Descontos
                </label>
                <input
                  type="number"
                  name="descontos"
                  value={festa.descontos}
                  onChange={handleChangeFesta}
                  className="input w-full h-11"
                />
              </div>

              {/* Total */}
              <div className="border-t border-gray-300 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-base font-bold text-slate-900">
                    Total:
                  </span>
                  <span className="text-base font-bold text-slate-900">
                    R$ {festa.valor_total}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
