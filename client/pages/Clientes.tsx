import { Layout } from "@/components/Layout";
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from '../services/api';
import { formatDocument, formatPhone, normalize } from '../lib/formatters';
import { NewPartyIcon, EditIcon, SearchIcon, NewMoreIcon } from "../components/Icons";

export default function Clientes() {
  const navigate = useNavigate();

  // Lista de clientes e termo de busca
  const [clientes, setClientes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Busca clientes ao carregar componente
  useEffect(() => {
    api.get('/clientes/')
      .then(res => setClientes(res.data))
      .catch(console.error); // Só loga erros, sem bloquear UI
  }, []);

  // Termo de busca normalizado (removendo acentos, espaços etc)
  const search = normalize(searchTerm);

  // Filtra clientes pelo nome, documento, telefone ou status
  const filteredClientes = clientes.filter(cliente =>
    normalize(cliente.nome).includes(search) ||
    normalize(cliente.documento).includes(search) ||
    normalize(cliente.telefone).includes(search) ||
    normalize(cliente.status) === search
  );

  // Navega para página de nova festa com cliente pré-selecionado
  const handleNovaFesta = (cliente) => {
    const params = new URLSearchParams({ cliente: cliente.id });
    navigate(`/festas/nova?${params.toString()}`);
  };

  return (
    <Layout>
      <div className="flex p-6 flex-col items-start self-stretch rounded-lg bg-white shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.10),0px_2px_4px_-2px_rgba(0,0,0,0.10)]">
        {/* Cabeçalho com título e botão adicionar */}
        <div className="flex py-3 pb-[14px] items-center justify-between self-stretch border-b-2 border-[#e2e8f0] relative">
          <div className="text-[#020817] font-exo text-2xl font-bold leading-8 flex pl-5 flex-col items-start border-l-4 border-[#00d17d]">
            Clientes
          </div>
          <button
            onClick={() => navigate("/clientes/novo")}
            className="flex items-center justify-center gap-2 h-9 px-4 py-2 bg-dark-bg rounded-md shadow-sm hover:bg-gray-50 transition-colors"
          >
            <NewMoreIcon />
            <span className="text-[#a1a1aa] mt-1 font-exo sm:text-lg font-bold leading-7">
              Adicionar<span className="hidden md:inline"> cliente</span>
            </span>
          </button>
        </div>

        {/* Campo de busca e tabela */}
        <div className="flex flex-col items-start self-stretch gap-3 mt-6">
          <div className="flex items-center border border-blue-border rounded-2xl px-1 w-full md:w-auto md:ml-auto">
            <input
              type="text"
              placeholder="Pesquisar por Nome ou Documento"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="flex-1 md:w-80 px-4 py-2 text-gray-placeholder font-light text-base bg-transparent outline-none"
            />
            <SearchIcon />
          </div>

          <div className="w-full overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-table-border">
                  {["Nome", "Documento", "Telefone", "Status"].map(title => (
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
                {filteredClientes.length > 0 ? (
                  filteredClientes.map((cliente, i) => (
                    <tr key={cliente.id || i} className="border-t border-row-border">
                      <td className="whitespace-nowrap py-4 px-6 text-data-text font-light text-base leading-6">{cliente.nome}</td>
                      <td className="whitespace-nowrap py-4 px-6 text-data-text font-light text-base leading-6">{formatDocument(cliente.documento)}</td>
                      <td className="whitespace-nowrap py-4 px-6 text-data-text font-light text-base leading-6">{formatPhone(cliente.telefone)}</td>
                      <td className="whitespace-nowrap py-4 px-6 text-data-text font-light text-base leading-6">{cliente.status_display}</td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2 justify-end">
                          <button
                            title="Nova Festa"
                            onClick={() => handleNovaFesta(cliente)}
                            className="p-1"
                          >
                            <NewPartyIcon />
                          </button>
                          <Link
                            title="Editar"
                            to={`/clientes/editar/${cliente.id}`}
                            className="p-1"
                          >
                            <EditIcon />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5}>
                      <div className="flex py-[52px] pb-7 flex-col items-center justify-center self-stretch">
                        <div className="text-[#a1a1aa] text-center font-exo text-xl font-bold leading-7">
                          Nenhum cliente cadastrado...
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