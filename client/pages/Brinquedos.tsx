import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import * as Icons from "../components/Icons";
import { toast } from 'sonner';
import { normalize, formatMoney } from "../lib/formatters";
import api from "../services/api";
import { ExcluirIcon } from "../components/ModalExcluir";

export default function Brinquedos() {
  const navigate = useNavigate();

  const [brinquedos, setBrinquedos] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Busca brinquedos ao carregar componente
  useEffect(() => {
    api.get("/brinquedos/")
      .then(res => setBrinquedos(res.data))
      .catch(console.error);
  }, []);

  const search = normalize(searchTerm);

  // Filtra brinquedos por nome, status, voltagem ou descrição
  const filteredBrinquedos = brinquedos.filter((b: any) =>
    normalize(b.nome).includes(search) ||
    normalize(b.status_display || "").includes(search) ||
    normalize(b.voltagem_display || "").includes(search) ||
    normalize(b.descricao || "").includes(search)
  );

  // Navega para edição do brinquedo
  const handleEditarBrinquedo = (brinquedo) => {
    navigate(`/brinquedos/editar/${brinquedo.id}`);
  };

  // Exclui brinquedo da API e da lista local
  const handleDelete = (id) => {
    api.delete(`/brinquedos/${id}/`)
      .then(() => {
        setBrinquedos(prev => prev.filter(b => b.id !== id));
        toast.success("Brinquedo excluido com sucesso!", { id: "alert" });
      })
      .catch(error => {
        console.error(error);
        toast.error(`Erro ao excluir o brinquedo: ${error}`, { id: "alert" });
      });
  };

  return (
    <Layout>
      <div className="flex p-6 flex-col items-start self-stretch rounded-lg bg-white shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.10),0px_2px_4px_-2px_rgba(0,0,0,0.10)]">
        {/* Cabeçalho e botão adicionar brinquedo */}
        <div className="flex py-3 pb-[14px] items-center justify-between self-stretch border-b-2 border-[#e2e8f0] relative">
          <div className="text-[#020817] font-exo text-2xl font-bold leading-8 flex pl-5 flex-col items-start border-l-4 border-[#00d17d]">
            Brinquedos
          </div>
          <button
            onClick={() => navigate("/brinquedos/novo")}
            className="flex items-center justify-center gap-2 h-9 px-4 py-2 bg-dark-bg rounded-md shadow-sm hover:bg-gray-50 transition-colors"
          >
            <Icons.NewMoreIcon />
            <span className="text-[#a1a1aa] mt-1 font-exo sm:text-lg font-bold leading-7">
              Adicionar<span className="hidden md:inline"> brinquedo</span>
            </span>
          </button>
        </div>

        {/* Busca e tabela */}
        <div className="flex flex-col items-start self-stretch gap-3 mt-6">
          <div className="flex items-center border border-blue-border rounded-2xl px-1 w-full md:w-auto md:ml-auto">
            <input
              type="text"
              placeholder="Pesquisar por Nome ou Status"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="flex-1 md:w-80 px-4 py-2 text-gray-placeholder font-light text-base bg-transparent outline-none"
            />
            <Icons.SearchIcon />
          </div>

          <div className="w-full overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-table-border">
                  {["Nome", "Valor", "Quantidade", "Status"].map(title => (
                    <th
                      key={title}
                      className="text-left py-3 px-6 text-gray-text font-bold text-sm leading-5 tracking-wider uppercase"
                    >
                      {title}
                    </th>
                  ))}
                  <th className="w-32"></th>
                </tr>
              </thead>

              <tbody className="bg-white">
                {filteredBrinquedos.length > 0 ? (
                  filteredBrinquedos.map((brinquedo: any, i: number) => (
                    <tr key={brinquedo.id || i} className="border-t border-row-border">
                      <td className="whitespace-nowrap py-4 px-6 text-data-text font-light text-base leading-6">
                        {brinquedo.nome}
                      </td>
                      <td className="whitespace-nowrap py-4 px-6 text-data-text font-light text-base leading-6">
                        {formatMoney(brinquedo.valor_diaria)}
                      </td>
                      <td className="whitespace-nowrap py-4 px-6 text-data-text font-light text-base leading-6">
                        {brinquedo.qtd_disponivel}
                      </td>
                      <td className="whitespace-nowrap py-4 px-6 text-data-text font-light text-base leading-6">
                        {brinquedo.status_display}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2 justify-end">
                          <button title="Editar" onClick={() => handleEditarBrinquedo(brinquedo)} className="p-1">
                            <Icons.EditIcon />
                          </button>
                          <ExcluirIcon
                            key={brinquedo.id}
                            object={brinquedo.nome}
                            onConfirm={() => handleDelete(brinquedo.id)}
                          />
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5}>
                      <div className="flex py-[52px] pb-7 flex-col items-center justify-center self-stretch">
                        <div className="text-[#a1a1aa] text-center font-exo text-xl font-bold leading-7">
                          Nenhum brinquedo cadastrado...
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