import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { useNavigate, useParams } from "react-router-dom";
import { ExcluirCliente } from "../components/ExcluirCliente";
import { toast } from 'sonner';

export default function EditarCliente() {
  // Funções e Parametros
  const navigate = useNavigate();
  const { id } = useParams();

  // Endpoint que retorna os dados do cliente.ID do banco de dados
  useEffect(() => {
    fetch(`https://toy-rental-backend.onrender.com/api/clientes/${id}/`)
      .then(async (res) => {
        if (!res.ok) {
          throw new Error("Erro ao carregar cliente");
        }
        const data = await res.json();
        setCliente(data);
      })
      .catch(() => alert("Erro ao carregar dados do cliente"));
  }, [id]);

  const [cliente, setCliente] = useState({
    nome: "",
    documento: "",
    telefone: "",
    email: "",
    rua: "",
    numero: "S/N",
    cep: "85260000",
    cidade: "Manoel Ribas",
    estado: "PR",
    pais: "Brasil",
    complemento: "",
    status: "Ativo",
    observacoes: "",
  });

  // Armazena os dados preenchidos no formulario
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCliente({ ...cliente, [e.target.name]: e.target.value });
  };

  // Função para method "POST" para criação de novo cliente
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`https://toy-rental-backend.onrender.com/api/clientes/${id}/`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cliente),
      });
      if (res.ok) {
        toast.success("Cliente atualizado com sucesso!", {
          id: "alert",
        });
        navigate("/clientes");
      } else {
        alert("Erro ao cadastrar.");
      }
    } catch (err) {
      alert("Erro de conexão com o servidor.");
    }
  };

  // Função para method "DELETE" por ID 
  const handleDelete = async () => {
    try {
      const res = await fetch(`https://toy-rental-backend.onrender.com/api/clientes/${id}/`, {
        method: 'DELETE',
      });

      if (res.ok) {
        navigate("/clientes");
        toast.success("Cliente excluido com sucesso!", {
          id: "alert",
        });
      } else {
        alert("Erro ao excluir cliente.");
      }
    } catch (err) {
      alert("Erro de conexão ao excluir.");
    }
  };

  return (
    <Layout>
      {/* Client Section */}
      <div className="flex p-6 flex-col items-start self-stretch rounded-lg bg-white shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.10),0px_2px_4px_-2px_rgba(0,0,0,0.10)]">
        {/* Header */}
        <div className="flex py-3 pb-[14px] items-center justify-between self-stretch border-b-2 border-[#e2e8f0] relative">
          <div className="text-[#020817] font-exo text-2xl font-bold leading-8 flex pl-5 flex-col items-start border-l-4 border-[#00d17d]">
            Editar Cliente
          </div>
        </div>

        {/* Client List */}
        <div className="flex flex-col items-start self-stretch gap-3 mt-6">


          {/* Table */}
          <div className="w-full overflow-x-auto">
            <form onSubmit={handleSubmit} className="space-y-10">
              {/* DADOS PESSOAIS */}
              <div>
                <h3 className="text-lg font-bold text-gray-800 border-b pb-1 mb-4">Dados Pessoais</h3>
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
                    value={cliente.documento}
                    onChange={handleChange}
                    className="input"
                  />
                  <input
                    type="email"
                    name="email"
                    placeholder="E-mail"
                    value={cliente.email || ""}
                    onChange={handleChange}
                    className="input"
                  />
                  <input
                    type="text"
                    name="telefone"
                    placeholder="Telefone"
                    value={cliente.telefone}
                    onChange={handleChange}
                    className="input"
                  />
                  <input
                    type="text"
                    name="status"
                    placeholder="Staus"
                    value={cliente.status}
                    onChange={handleChange}
                    className="input"
                  />
                </div>
              </div>

              {/* ENDEREÇO */}
              <div>
                <h3 className="text-lg font-bold text-gray-800 border-b pb-1 mb-4">Endereço</h3>
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
                    name="rua"
                    placeholder="Rua"
                    value={cliente.rua}
                    onChange={handleChange}
                    className="input md:col-span-2"
                  />
                  <input
                    type="text"
                    name="numero"
                    value={cliente.numero}
                    placeholder="Número"
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
                    name="estado"
                    placeholder="UF"
                    value={cliente.estado}
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
              </div>

              {/* BOTÕES */}
              <div className="flex flex-col md:flex-row md:justify-between gap-3">
                <button
                  type="button"
                  onClick={() => navigate("/clientes")}
                  className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded shadow w-full md:w-auto"
                >
                  Cancelar
                </button>

                <div className="flex flex-col md:flex-row gap-3 md:gap-5">
                  <ExcluirCliente
                    cliente={cliente.nome}
                    onConfirm={handleDelete}
                  />
                  <button
                    type="submit"
                    className="bg-[#0B0F1C] hover:bg-gray-900 text-white px-6 py-2 rounded shadow w-full md:w-auto"
                  >
                    Salvar alterações
                  </button>
                </div>
              </div>
            </form>
          </div>

        </div>
      </div>
    </Layout>
  );
}