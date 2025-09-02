import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import api from "../services/api";
import { formatMoney } from "../lib/formatters";
import { DatePickerField } from "@/components/DatePickerField";

export default function FormCliente() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [brinquedo, setBrinquedo] = useState({
    id: "",
    status_display: "",
    voltagem_display: "",
    nome: "",
    valor_diaria: "",
    qtd_total: "",
    qtd_disponivel: "",
    status: "ativo",
    tamanho: "",
    voltagem: "",
    energia: "",
    inflavel: "",
    descricao: "",
    // Campos de aquisição
    valor_compra: "",
    parcelado: "nao", // "sim" ou "nao"
    qtd_parcelas: 1,
    data_aquisicao: "", // YYYY-MM-DD
    data_vencimento: "", // YYYY-MM-DD
  });

  const isEditando = Boolean(id);

  useEffect(() => {
    if (isEditando) {
      api
        .get(`/brinquedos/${id}/`)
        .then((resposta) => {
          const data = resposta.data;

          setBrinquedo({
            ...data,
            valor_diaria: data.valor_diaria
              ? String(Math.round(Number(data.valor_diaria) * 100)) // armazena em centavos
              : "",
            valor_compra: data.valor_compra
              ? String(Math.round(Number(data.valor_compra) * 100)) // idem
              : "",
          });

          
        })
        .catch((err) => {
          console.error("Erro ao carregar brinquedo:", err);
          toast.error("Erro ao carregar os dados do brinquedo.", { id: "alert" });
        });
    }
  }, [id, isEditando]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    if (name === "valor_diaria" || name === "valor_compra") {
      const numeric = value.replace(/\D/g, "");
      setBrinquedo((prev) => ({ ...prev, [name]: numeric }));
    } else if (name === "qtd_total" || name === "qtd_disponivel" || name === "qtd_parcelas") {
      const numeric = value.replace(/\D/g, "");
      setBrinquedo((prev) => ({ ...prev, [name]: numeric ? Number(numeric) : "" }));
    } else {
      setBrinquedo((prev) => ({ ...prev, [name]: value }));
    }
  };

  const brinquedoPayload = {
    ...brinquedo,
    valor_diaria: brinquedo.valor_diaria
      ? (Number(brinquedo.valor_diaria) / 100).toFixed(2)
      : null,
    valor_compra: brinquedo.valor_compra
      ? (Number(brinquedo.valor_compra) / 100).toFixed(2)
      : null,
    qtd_total: brinquedo.qtd_total ? Number(brinquedo.qtd_total) : null,
    qtd_disponivel: brinquedo.qtd_disponivel ? Number(brinquedo.qtd_disponivel) : null,
    qtd_parcelas: brinquedo.parcelado === "sim" && brinquedo.qtd_parcelas
      ? Number(brinquedo.qtd_parcelas)
      : null,
    energia: brinquedo.energia || "",
    voltagem: brinquedo.energia === "sim" ? (brinquedo.voltagem || "") : "",
    inflavel: brinquedo.inflavel || "",
    descricao: brinquedo.descricao || "",
    data_aquisicao: brinquedo.data_aquisicao || null,
    data_vencimento: brinquedo.data_vencimento || null,
  };

  console.log("Payload enviado:", brinquedoPayload);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const url = isEditando ? `brinquedos/${id}/` : "brinquedos/";
    const metodo = isEditando ? "put" : "post";

    // Pega o organization_id do storage
    const organizationId = localStorage.getItem("organization_id");

    // Inclui a organização no payload correto
    const brinquedoPayloadComOrg = {
      ...brinquedoPayload,
      organization: organizationId,
    };
    
    try {
      await api[metodo](url, brinquedoPayloadComOrg);
      toast.success(
        `Brinquedo ${isEditando ? "atualizado" : "cadastrado"} com sucesso!`,
        { id: "alert" }
      );
      navigate("/brinquedos");
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

  return (
    <Layout>
      <div className="flex p-6 flex-col items-start self-stretch rounded-lg bg-white shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.10),0px_2px_4px_-2px_rgba(0,0,0,0.10)]">
        <div className="flex py-3 pb-[14px] items-center justify-between self-stretch border-b-2 border-[#e2e8f0] relative">
          <div className="text-[#020817] font-exo text-2xl font-bold leading-8 flex pl-5 flex-col items-start border-l-4 border-[#00d17d]">
            {isEditando ? "Editar Brinquedo" : "Adicionar Brinquedo"}
          </div>
        </div>

        <div className="flex flex-col items-start self-stretch gap-3 mt-6">
          <div className="w-full overflow-x-auto">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <h3 className="text-lg font-bold text-gray-800 border-b pb-1 mb-4">
                  Informações de Aquisição
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div>
                    <label className="block text-base text-slate-400 mb-1">Valor de Compra</label>
                    <input
                      type="text"
                      name="valor_compra"
                      value={formatMoney(brinquedo.valor_compra)}
                      onChange={handleChange}
                      className="input w-full h-11"
                    />
                  </div>
                  <div>
                    <label className="block text-base text-slate-400 mb-1">Parcelado?</label>
                    <select
                      name="parcelado"
                      value={brinquedo.parcelado}
                      onChange={handleChange}
                      className="input w-full h-11"
                    >
                      <option value="nao">Não</option>
                      <option value="sim">Sim</option>
                    </select>
                  </div>
                  {brinquedo.parcelado === "sim" && (
                    <div>
                      <label className="block text-base text-slate-400 mb-1">Qtd. Parcelas</label>
                      <input
                        type="text"
                        name="qtd_parcelas"
                        value={brinquedo.qtd_parcelas}
                        onChange={handleChange}
                        className="input w-full h-11"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-base text-slate-400 mb-1">Data de Aquisição</label>
                    <DatePickerField
                      selectedDate={brinquedo.data_aquisicao} // passa o valor do estado

                      onChange={(value) => {
                        // atualiza o estado do brinquedo
                        setBrinquedo((prev) => ({
                          ...prev,
                          data_aquisicao: value,
                        }));
                      }}
                    />
                  </div>

                  <div>
                    <label className="block text-base text-slate-400 mb-1">Data de Vencimento</label>
                    <DatePickerField
                      selectedDate={brinquedo.data_vencimento} // passa o valor do estado
                      onChange={(value) => {
                        // atualiza o estado do brinquedo
                        setBrinquedo((prev) => ({
                          ...prev,
                          data_vencimento: value,
                        }));
                      }}
                    />
                  </div>
                </div>
              </div>


              <div>
                <h3 className="text-lg font-bold text-gray-800 border-b pb-1 mb-4">
                  Dados do Brinquedo
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-base text-slate-400 mb-1">Nome</label>
                    <input
                      type="text"
                      name="nome"
                      value={brinquedo.nome}
                      onChange={handleChange}
                      className="input w-full h-11"
                    />
                  </div>
                  <div>
                    <label className="block text-base text-slate-400 mb-1">Valor locação</label>
                    <input
                      type="text"
                      name="valor_diaria"
                      value={formatMoney(brinquedo.valor_diaria)}

                      onChange={handleChange}
                      className="input w-full h-11"
                    />
                  </div>
                  <div>
                    <label className="block text-base text-slate-400 mb-1">Qnt. Estoque</label>
                    <input
                      type="text"
                      name="qtd_total"
                      value={brinquedo.qtd_total}
                      onChange={handleChange}
                      className="input w-full h-11"
                    />
                  </div>
                  <div>
                    <label className="block text-base text-slate-400 mb-1">Qnt. Disponível</label>
                    <input
                      type="text"
                      name="qtd_disponivel"
                      value={brinquedo.qtd_disponivel}
                      onChange={handleChange}
                      className="input w-full h-11"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 mt-4 md:grid-cols-5 gap-4">
                  <div>
                    <label className="block text-base text-slate-400 mb-1">Status</label>
                    <select
                      name="status"
                      value={brinquedo.status || ""}
                      onChange={handleChange}
                      className="input w-full h-11"
                    >
                      <option value="ativo">Ativo</option>
                      <option value="inativo">Inativo</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-base text-slate-400 mb-1">Tamanho</label>
                    <input
                      type="text"
                      name="tamanho"
                      value={brinquedo.tamanho}
                      onChange={handleChange}
                      className="input w-full h-11"
                    />
                  </div>
                  <div>
                    <label className="block text-base text-slate-400 mb-1">Energia</label>
                    <select
                      name="energia"
                      value={brinquedo.energia || ""}
                      onChange={handleChange}
                      className="input w-full h-11"
                    >
                      <option value="nao">Não</option>
                      <option value="sim">Sim</option>
                    </select>
                  </div>
                  {brinquedo.energia === "sim" && (
                    <div>
                      <label className="block text-base text-slate-400 mb-1">Voltagem</label>
                      <select
                        name="voltagem"
                        value={brinquedo.voltagem || ""}
                        onChange={handleChange}
                        className="input w-full h-11"
                      >
                        <option value="110v">110v</option>
                        <option value="220v">220v</option>
                        <option value="bivolt">Bivolt</option>
                      </select>
                    </div>
                  )}
                  <div>
                    <label className="block text-base text-slate-400 mb-1">Inflavel</label>
                    <select
                      name="inflavel"
                      value={brinquedo.inflavel || ""}
                      onChange={handleChange}
                      className="input w-full h-11"
                    >
                      <option value="nao">Não</option>
                      <option value="sim">Sim</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <div className="mt-4">
                    <label className="block text-base text-slate-400 mb-1">Descrição:</label>
                    <textarea
                      rows={3}
                      name="descricao"
                      value={brinquedo.descricao}
                      onChange={handleChange}
                      className="input w-full p-5"
                    />
                  </div>
                </div>
              </div>



              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => navigate("/brinquedos")}
                  className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded shadow"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-[#0B0F1C] hover:bg-gray-900 text-white px-6 py-2 rounded shadow"
                >
                  {isEditando ? "Atualizar" : "Cadastrar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}