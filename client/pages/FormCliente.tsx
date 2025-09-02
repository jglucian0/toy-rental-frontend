import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from 'sonner';
import api from "../services/api";
import { ExcluirCliente } from "../components/ModalExcluir";
import { formatDocument, formatPhone } from "../lib/formatters";

export default function FormCliente() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Estado do cliente, inicializa vazio ou com dados ao editar
  const [cliente, setCliente] = useState({
    nome: "",
    documento: "",
    email: "",
    telefone: "",
    status: "ativo",
    cep: "",
    endereco: "",
    numero: "",
    cidade: "",
    uf: "",
    complemento: ""
  });

  const isEditando = Boolean(id);

  // Ao entrar no modo edição, carrega cliente pelo ID
  useEffect(() => {
    if (isEditando) {
      api.get(`/clientes/${id}/`)
        .then((resposta) => setCliente(resposta.data));
    }
  }, [id, isEditando]);

  // Atualiza estado conforme inputs do formulário
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setCliente({ ...cliente, [e.target.name]: e.target.value });
  };

  // Apaga cliente via API e navega para listagem
  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    await api.delete(`/clientes/${id}/`);
    toast.success("Cliente excluído com sucesso!", { id: "alert" });
    navigate("/clientes");
  }

  // Envia dados para criação ou edição, com feedback de sucesso/erro
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = isEditando ? `clientes/${id}/` : "clientes/";
    const metodo = isEditando ? "put" : "post";

    // Pega o organization_id do storage
    const organizationId = localStorage.getItem("organization_id");

    // Inclui a organização no payload
    const payload = { ...cliente, organization: organizationId };

    try {
      await api[metodo](url, payload);
      toast.success(`Cliente ${isEditando ? "atualizado" : "cadastrado"} com sucesso!`, { id: "alert" });
      navigate("/clientes");
    } catch (error: any) {
      if (error.response?.data) {
        const [campo] = Object.entries(error.response.data)[0];
        toast.error(`O "${campo}" não pode ficar em branco!`, { id: "alert" });
      } else {
        toast.error("Erro de conexão com o servidor.", { id: "alert" });
      }
    }
  };

  return (
    <Layout>
      <div className="flex p-6 flex-col items-start self-stretch rounded-lg bg-white shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.10),0px_2px_4px_-2px_rgba(0,0,0,0.10)]">
        <header className="flex py-3 pb-[14px] items-center justify-between self-stretch border-b-2 border-[#e2e8f0] relative">
          <h1 className="text-[#020817] font-exo text-2xl font-bold leading-8 flex pl-5 flex-col items-start border-l-4 border-[#00d17d]">
            Adicionar Cliente
          </h1>
        </header>

        <form onSubmit={handleSubmit} className="flex flex-col items-start self-stretch gap-3 mt-6 w-full overflow-x-auto space-y-10">
          {/* Dados Pessoais */}
          <section className="w-full">
            <h2 className="text-lg font-bold text-gray-800 border-b pb-1 mb-4">Dados Pessoais</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <input
                type="text"
                name="nome"
                placeholder="Nome"
                value={cliente.nome}
                onChange={handleChange}
                className="input"
              />
              <input
                type="text"
                name="documento"
                placeholder="Documento (CPF/CNPJ)"
                value={formatDocument(cliente.documento)}
                maxLength={18}
                onChange={handleChange}
                className="input"
              />
              <input
                type="email"
                name="email"
                placeholder="E-mail"
                value={cliente.email}
                onChange={handleChange}
                className="input"
              />
              <input
                type="text"
                name="telefone"
                maxLength={15}
                placeholder="Telefone"
                value={formatPhone(cliente.telefone)}
                onChange={handleChange}
                className="input"
              />
              <select
                name="status"
                value={cliente.status}
                onChange={handleChange}
                className="input"
              >
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
              </select>
            </div>
          </section>

          {/* Endereço */}
          <section className="w-full">
            <h2 className="text-lg font-bold text-gray-800 border-b pb-1 mb-4">Endereço</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <input
                type="text"
                name="cep"
                placeholder="CEP"
                value={cliente.cep}
                onChange={handleChange}
                className="input"
                maxLength={9}
              />
              <input
                type="text"
                name="endereco"
                placeholder="Endereço"
                value={cliente.endereco}
                onChange={handleChange}
                className="input md:col-span-2"
              />
              <input
                type="text"
                name="numero"
                placeholder="Número"
                value={cliente.numero}
                onChange={handleChange}
                className="input"
              />
              <input
                type="text"
                name="cidade"
                placeholder="Cidade"
                value={cliente.cidade}
                onChange={handleChange}
                className="input"
              />
              <input
                type="text"
                name="uf"
                placeholder="UF"
                value={cliente.uf}
                onChange={handleChange}
                className="input"
              />
              <input
                type="text"
                name="complemento"
                placeholder="Complemento"
                value={cliente.complemento}
                onChange={handleChange}
                className="input"
              />
            </div>
          </section>

          {/* Botões cancelar, excluir e submit */}
          <div className="flex justify-between w-full">
            <button
              type="button"
              onClick={() => navigate("/clientes")}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded shadow"
            >
              Cancelar
            </button>
            <div>
              {isEditando &&
                <span className="mr-3">
                  <ExcluirCliente
                    cliente={cliente.nome}
                    onConfirm={handleDelete}
                  />
                </span>
              }
              <button
                type="submit"
                className="bg-[#0B0F1C] hover:bg-gray-900 text-white px-6 py-2 rounded shadow"
              >
                {isEditando ? "Atualizar" : "Cadastrar"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
}