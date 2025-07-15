import { useState, useEffect, useRef  } from "react";
import { Layout } from "@/components/Layout";
import { useNavigate } from "react-router-dom";
import { Calendar } from "lucide-react";
import { LuUserRoundSearch } from "react-icons/lu";
import { FaRegClock } from "react-icons/fa6";
import { useSearchParams } from "react-router-dom";
import { DatePickerField } from "@/components/DatePickerField";

export default function FormCliente() {
  const navigate = useNavigate();
  const [clientes, setClientes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [brinquedosDisponiveis, setBrinquedosDisponiveis] = useState([]);
  const [brinquedosSelecionados, setBrinquedosSelecionados] = useState([]);
  const [usarEnderecoCliente, setUsarEnderecoCliente] = useState(false);
  const [searchParams] = useSearchParams();

  useEffect(() => {
      fetch('http://localhost:8000/api/clientes/')
        .then((res) => res.json())
        .then((data) => setClientes(data))
        .catch((err) => console.error(err));
    },[]);

    useEffect(() => {
      const cliente_id = searchParams.get("cliente_id");
      const nome = searchParams.get("nome");
      const documento = searchParams.get("documento");
      const telefone = searchParams.get("telefone");
      const rua = searchParams.get("rua");
    
      if (cliente_id || nome || documento || telefone) {
        setFesta((prev) => ({
          ...prev,
          cliente_id: cliente_id || "",
          nome: nome || "",
          documento: documento || "",
          telefone: telefone || "",
          rua: rua || "",
        }));
      }
    }, []);

  const [festa, setFesta] = useState({
    cliente_id: "",
    nome: "",
    documento: "",
    telefone: "",
    brinquedos_ids: [],
    data_festa: "",
    hora_festa: "",
    duração: "08:00:00",
    hora_montagem: "",
    data_retirada: "",
    hora_retirada: "",
    montador: "João & Gabi",
    valor_entrada: 0,
    qtd_parcelas: 1,
    valor_total: 0,
    acrescimos: 0,
    descontos: 0,
    descricao: "",
    metodo_pagamento: "Pix",
    status: "pendente",
    cep: "85260000",
    rua: "",
    numero: "S/N",
    bairro: "",
    cidade: "Manoel RIbas",
    uf: "PR",
    pais: "Brasil",
    complemento: "",
  });

  const containerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setSearchTerm("");
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const entradaSugerida = festa.valor_total * 0.3;
    setFesta(prev => ({
      ...prev,
      valor_entrada: entradaSugerida,
    }));
  }, [festa.valor_total]);

  useEffect(() => {
    async function buscarBrinquedosDisponiveis() {
      if (festa.data_festa && festa.data_retirada) {
        try {
          const res = await fetch(
            `http://localhost:8000/api/brinquedos/disponiveis/?data_festa=${festa.data_festa}&data_retirada=${festa.data_retirada}`
          );
          const data = await res.json();
          setBrinquedosDisponiveis(data);
        } catch (err) {
          console.error("Erro ao buscar brinquedos:", err);
        }
      } else {
        setBrinquedosDisponiveis([]);
      }
    }
  
    buscarBrinquedosDisponiveis();
    }, [festa.data_festa, festa.data_retirada]);
  
    useEffect(() => {
      const somaBrinquedos = brinquedosSelecionados.reduce((total, b) => total + Number(b.valor_unitario), 0);
      const total = somaBrinquedos + Number(festa.acrescimos) - Number(festa.descontos);
    
      setFesta(prev => ({
        ...prev,
        valor_total: total,
      }));
    }, [brinquedosSelecionados, festa.acrescimos, festa.descontos]);

  const handleSelectCliente = (cliente) => {
    setFesta(prev => ({
      ...prev,
      cliente_id: cliente.id,
      nome: cliente.nome,
      documento: cliente.documento,
      telefone: cliente.telefone,
    }));

    if (usarEnderecoCliente) {
      setFesta(prev => ({
        ...prev,
        cep: cliente.cep || "85260000",
        rua: cliente.rua || "",
        numero: cliente.numero || "S/N",
        bairro: cliente.bairro || "",
        cidade: cliente.cidade || "Manoel Ribas",
        uf: cliente.uf || "PR",
        pais: cliente.pais || "Brasil",
        complemento: cliente.complemento || "",
      }));
    }

    setSearchTerm(""); 
    setDropdownOpen(false);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setDropdownOpen(true);
  };

  const handleClearSelection = () => {
    setFesta(prev => ({
      ...prev,
      cliente_id: "",
      nome: "",
      documento: "",
      telefone: ""
    }));
    setSearchTerm("");
    setDropdownOpen(false);
  };

  const handleChangeFesta = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFesta(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!festa.cliente_id || !festa.brinquedos_ids.length) {
      alert("Selecione um cliente e pelo menos um brinquedo.");
      return;
    }
  
    try {
      const res = await fetch("http://localhost:8000/api/festas/nova/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(festa),
      });
  
      if (res.ok) {
        /*alert("Festa cadastrada com sucesso!");*/
        navigate("/festas");
      } else {
        const error = await res.json();
        console.error("Erro na resposta da API:", error);
        alert("Erro ao cadastrar a festa:\n" + JSON.stringify(error, null, 2));
      }
    } catch (err) {
      console.error("Erro de conexão:", err);
      alert("Erro de conexão com o servidor: " + err.message);
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

  const filteredClientes = clientes.filter((cliente: any) => {
    const nomeNormalized = normalize(cliente.nome);
    const documentoNormalized = normalize(cliente.documento);
    const statusNormalized = normalize(cliente.status);
    const telefoneCleaned = cleanNumber(cliente.telefone);

  return (
    nomeNormalized.includes(normalizedSearchTerm) ||
    documentoNormalized.includes(normalizedSearchTerm) ||
    (cleanedSearchTerm && telefoneCleaned.includes(cleanedSearchTerm)) || // começa com o termo
    (normalizedSearchTerm && statusNormalized === normalizedSearchTerm)     // status exato
  );
  });

  return (
    <Layout>
      <div className="flex w-full flex-col lg:flex-row gap-6">
          {/* Client Section */}
          <div className="flex w-full p-6 flex-col items-start self-stretch rounded-lg bg-white shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.10),0px_2px_4px_-2px_rgba(0,0,0,0.10)]">
            {/* Header */}
            <div className="flex py-3 pb-[14px] items-center justify-between self-stretch border-b-2 border-[#e2e8f0] relative">
              <div className="text-[#020817] font-exo text-2xl font-bold leading-8 flex pl-5 flex-col items-start border-l-4 border-[#00d17d]">
                Adicionar Clientes
              </div>
            </div>
  
            <div className="flex flex-col items-start self-stretch gap-3 mt-6">
              <div className="w-full overflow-x-auto">
                <form onSubmit={handleSubmit} className="">
                  {/* Dados pessoais */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 border-b pb-1 mb-4">Dados Pessoais</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      {/* Client Search */}
                      <div>
                        <div className="relative">
                          <input
                            type="text"
                            value={searchTerm}
                            onChange={handleSearchChange}
                            onFocus={() => setDropdownOpen(true)}
                            className="border w-full border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400;"
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
                         value={festa.nome}
                         onChange={(e) => {
                          handleChangeFesta(e);
                          setSearchTerm(e.target.value);
                          }}
                         className="input"
                      />
                      {/* Documento */}
                      <input
                        type="text"
                        name="documento"
                        placeholder="Documento (CPF/CNPJ)"
                        value={festa.documento}
                        onChange={handleChangeFesta}
                        className="input"
                      />
                      {/* Telefone */}
                      <input
                        type="text"
                        name="telefone"
                        placeholder="Telefone"
                        value={festa.telefone}
                        onChange={handleChangeFesta}
                        className="input"
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
                            onChange={(val) => setFesta({ ...festa, data_festa: val })}
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
                            className="input flex h-11 w-full items-center px-3 py-2 rounded-md text-left"
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
                          name="duração"
                          value={festa.duração}
                          onChange={handleChangeFesta}
                          className="input h-11 flex w-full items-center px-3 py-2 rounded-md text-left"
                        >
                          <option value="04:00:00">4h 0min</option>
                          <option value="05:00:00">5h 0min</option>
                          <option value="06:00:00">6h 0min</option>
                          <option value="07:00:00">7h 0min</option>
                          <option value="08:00:00">8h 0min</option>
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
                            className="input flex w-full items-center px-3 py-2 rounded-md text-left"
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
                            selectedDate={festa.data_retirada}
                            onChange={(val) => setFesta({ ...festa, data_retirada: val })}
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
                            name="hora_retirada"
                            value={festa.hora_retirada}
                            onChange={handleChangeFesta}
                            className="input flex h-11 w-full items-center px-3 py-2 rounded-md text-left"
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
                          className="input w-full h-11 px-3"
                        />
                      </div>
                      {/* Valor de entrada */}
                      <div>
                        <label className="block text-base text-slate-400 mb-1">
                          Valor de entrada
                        </label>
                        <input
                          type="number"
                          name="valor_entrada"
                          value={festa.valor_entrada}
                          onChange={handleChangeFesta}
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Status */}
                      <div>
                        <label className="block text-base text-slate-400 mb-1">
                          Status
                        </label>
                        <select 
                          name="status"
                          value={festa.status}
                          onChange={handleChangeFesta}
                          className="input w-full h-11">
                            <option value="pendente">Pendente</option>
                            <option value="confirmado">Confirmado</option>
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
                          <option value="Dinheiro">Dinheiro</option>
                          <option value="Cartao">Cartao</option>
                          <option value="Pix">Pix</option>
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
                                
                                  // Se o cliente já foi selecionado e o switch foi ativado, copia o endereço
                                  if (novoValor && typeof festa.cliente_id === "number") {
                                    const clienteSelecionado = clientes.find(c => c.id === festa.cliente_id);
                                    if (clienteSelecionado) {
                                      setFesta(prev => ({
                                        ...prev,
                                        cep: clienteSelecionado.cep || "85260000",
                                        rua: clienteSelecionado.rua || "",
                                        numero: clienteSelecionado.numero || "S/N",
                                        bairro: clienteSelecionado.bairro || "",
                                        cidade: clienteSelecionado.cidade || "Manoel Ribas",
                                        uf: clienteSelecionado.uf || "PR",
                                        pais: clienteSelecionado.pais || "Brasil",
                                        complemento: clienteSelecionado.complemento || "",
                                      }));
                                    }
                                  }
                                
                                  return novoValor;
                                });
                              }}
                              className={`w-12 h-6 rounded-full cursor-pointer relative transition-colors ${
                                usarEnderecoCliente ? "bg-green-500" : "bg-gray-300"
                              }`}
                            >
                              <div
                                className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                                  usarEnderecoCliente ? "translate-x-6" : "translate-x-1"
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
                            name="rua"
                            value={festa.rua}
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

                        {/* Bairro */}
                        <div className="md:col-span-2">
                          <label className="block text-base text-slate-400 mb-1">
                            Bairro
                          </label>
                          <input
                            type="text"
                            name="bairro"
                            value={festa.bairro}
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

                        {/* País */}
                        <div className="md:col-span-1">
                          <label className="block text-base text-slate-400 mb-1">
                            País
                          </label>
                          <input
                            type="text"
                            name="pais"
                            value={festa.pais}
                            onChange={handleChangeFesta}
                            className="w-full h-9 px-3 text-sm text-slate-900 border border-gray-300 rounded-md bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            defaultValue="Brasil"
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
                    <h3 className="text-lg font-bold text-gray-800 border-b pb-1 mb-4">Brinquedos</h3>
                    <div className="mt-6">
                    {brinquedosDisponiveis.length === 0 ? (
                      <p className="text-lg text-red-500">
                        Sem brinquedos disponíveis na data informada!
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {brinquedosDisponiveis.map((brinquedo) => (
                          <label
                            key={brinquedo.id}
                            className="border rounded p-4 cursor-pointer hover:shadow-md"
                          >
                            <input
                              type="checkbox"
                              checked={festa.brinquedos_ids.includes(brinquedo.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  const brinquedoSelecionado = brinquedosDisponiveis.find(b => b.id === brinquedo.id);
                                  setFesta((prev) => ({
                                    ...prev,
                                    brinquedos_ids: [...prev.brinquedos_ids, brinquedo.id],
                                  }));
                                  setBrinquedosSelecionados(prev => [...prev, brinquedoSelecionado]);
                                } else {
                                  setFesta((prev) => ({
                                    ...prev,
                                    brinquedos_ids: prev.brinquedos_ids.filter((id) => id !== brinquedo.id),
                                  }));
                                  setBrinquedosSelecionados(prev => prev.filter(b => b.id !== brinquedo.id));
                                }
                              }}
                            />
                            <span className="ml-2">{brinquedo.nome} ({brinquedo.quantidade} disponível)</span>
                          </label>
                        ))}
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
                      R$ {festa.valor_total.toFixed(2).replace(".", ",")}
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
                    type="text"
                    className="input w-full h-11"
                    defaultValue="R$ 0,00"
                  />
                </div>

                {/* Descontos */}
                <div>
                  <label className="block text-base text-slate-600 mb-1">
                    Descontos
                  </label>
                  <input
                    type="text"
                    className="input w-full h-11"
                    defaultValue="R$ 0,00"
                  />
                </div>

                {/* Total */}
                <div className="border-t border-gray-300 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-base font-bold text-slate-900">
                      Total:
                    </span>
                    <span className="text-base font-bold text-slate-900">
                      R$ 0,00
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
