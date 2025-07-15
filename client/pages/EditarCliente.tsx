import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { useNavigate, useParams } from "react-router-dom";

export default function EditarCliente() {
  const navigate = useNavigate();
  const {id} = useParams();
  const [form, setForm] = useState({
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

  useEffect(() => {
    fetch(`http://localhost:8000/api/clientes/${id}/`)
      .then(async (res) => {
        if (!res.ok) {
          throw new Error("Erro ao carregar cliente");
        }
        const data = await res.json();
        setForm(data);
      })
      .catch(() => alert("Erro ao carregar dados do cliente"));
  }, [id]); 

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleDelete = async () => {
    if(!window.confirm("Tem certeza que deseja excluir este cliente?")) return;

    try{
      const res = await fetch(`http://localhost:8000/api/clientes/${id}/`, {
        method: 'DELETE',
      });

      if (res.ok) {
        navigate("/clientes");
      } else {
        alert("Erro ao excluir cliente.");
      }
    } catch (err) {
      alert("Erro de conexão ao excluir.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const res = await fetch(`http://localhost:8000/api/clientes/${id}/`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        /*alert("Cliente atualizado com sucesso!");*/
        navigate("/clientes");
      } else {
        alert("Erro ao cadastrar.");
      }
    } catch (err) {
      alert("Erro de conexão com o servidor.");
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
                          value={form.nome}
                          onChange={handleChange}
                          className="input"
                        />
                        <input
                          type="text"
                          name="documento"
                          placeholder="Documento (CPF/CNPJ)"
                          value={form.documento}
                          onChange={handleChange}
                          className="input"
                        />
                        <input
                          type="email"
                          name="email"
                          placeholder="E-mail"
                          value={form.email || ""}
                          onChange={handleChange}
                          className="input"
                        />
                        <input
                          type="text"
                          name="telefone"
                          placeholder="Telefone"
                          value={form.telefone}
                          onChange={handleChange}
                          className="input"
                        />
                        <input
                          type="text"
                          name="status"
                          placeholder="Staus"
                          value={form.status}
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
                          value={form.cep}
                          onChange={handleChange}
                          className="input"
                          maxLength={9}
                        />
                        <input
                          type="text"
                          name="rua"
                          placeholder="Rua"
                          value={form.rua}
                          onChange={handleChange}
                          className="input md:col-span-2"
                        />
                        <input
                          type="text"
                          name="numero"
                          value={form.numero}
                          placeholder="Número"
                          onChange={handleChange}
                          className="input"
                        />
                        <input
                          type="text"
                          name="cidade"
                          placeholder="Cidade"
                          value={form.cidade}
                          onChange={handleChange}
                          className="input"
                        />
                        <input
                          type="text"
                          name="estado"
                          placeholder="UF"
                          value={form.estado}
                          onChange={handleChange}
                          className="input"
                        />
                        <input
                          type="text"
                          name="complemento"
                          placeholder="Complemento"
                          value={form.complemento}
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
                        <button
                          type="button"
                          onClick={handleDelete}
                          className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded shadow w-full md:w-auto"
                        >
                          Excluir
                        </button>

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
