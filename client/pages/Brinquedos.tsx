import { Layout } from "@/components/Layout";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom"
import * as Icons from "../components/Icons";

export default function Clientes() {
  // Endpoint que retorna todos os clientes do banco de dados
  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/clientes/')
      .then((res) => res.json())
      .then((data) => setClientes(data))
      .catch((err) => console.error(err));
  }, []);

  // Funções e Estados
  const navigate = useNavigate();
  const [clientes, setClientes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Função para remover acentos
  const cleanText = (text: string) => {
    return text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[.,-/\s]/g, "")
      .toLowerCase();
  };

  // Função para limpar caracteres não numéricos
  const cleanNumber = (num: string) => {
    return num.replace(/\D/g, "");
  };

  // Função para formatar a visualização de telefones 10/11 dígitos
  const formatPhone = (phone: string) => {
    const cleaned = cleanNumber(phone)
    if (cleaned.length === 11) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
    } else if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  };

  // Função para formatar a visualização de CPJ/CNPJ
  const formatDocument = (doc: string) => {
    const cleaned = cleanNumber(doc)
    if (cleaned.length === 11) {
      // CPF format
      return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9)}`;
    } else if (cleaned.length === 14) {
      // CNPJ format
      return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5, 8)}/${cleaned.slice(8, 12)}-${cleaned.slice(12)}`;
    }
    return doc;
  };

  // Normaliza a busca para evitar erros por diferenças de formatação
  const normalizedSearchTerm = cleanText(searchTerm);
  const cleanedSearchTerm = cleanNumber(searchTerm);

  const filteredClientes = clientes.filter((cliente: any) => {
    const nomeNormalized = cleanText(cliente.nome);
    const documentoNormalized = cleanText(cliente.documento);
    const statusNormalized = cleanText(cliente.status);
    const telefoneCleaned = cleanNumber(cliente.telefone);

    return (
      nomeNormalized.includes(normalizedSearchTerm) ||
      documentoNormalized.includes(normalizedSearchTerm) ||
      (cleanedSearchTerm && telefoneCleaned.includes(cleanedSearchTerm)) || // começa com o termo
      (normalizedSearchTerm && statusNormalized === normalizedSearchTerm)     // status exato
    );
  });

  // Captura os dados do ID e leva através do nagiate até "/festas/nova"
  const handleNovaFesta = (cliente) => {
    const params = new URLSearchParams({
      cliente_id: cliente.id,
      nome: cliente.nome,
      documento: cliente.documento,
      telefone: cliente.telefone,
      rua: cliente.rua,
    });

    navigate(`/festas/nova?${params.toString()}`);
  };

  return (
    <Layout>
      {/* Client Section */}
      <div className="flex p-6 flex-col items-start self-stretch rounded-lg bg-white shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.10),0px_2px_4px_-2px_rgba(0,0,0,0.10)]">
        {/* Header */}
        <div className="flex py-3 pb-[14px] items-center justify-between self-stretch border-b-2 border-[#e2e8f0] relative">
          {/* Titulo */}
          <div className="text-[#020817] font-exo text-2xl font-bold leading-8 flex pl-5 flex-col items-start border-l-4 border-[#00d17d]">
            Brinquedos
          </div>

          {/* Add Cliente */}
          <button onClick={() => navigate("/clientes/novo")} className="flex items-center justify-center gap-2 h-9 px-4 py-2 bg-dark-bg rounded-md shadow-sm hover:bg-gray-50 transition-colors">
            <Icons.NewMoreIcon />
            <span className="text-[#a1a1aa] mt-1 font-exo sm:text-lg font-bold leading-7">
              {/* Mobile: só dois primeiros nomes */}
              <span className="block md:hidden">
                Adicionar
              </span>

              {/* Desktop: nome completo */}
              <span className="hidden md:block">
                Adicionar brinquedo
              </span>
                
            </span>
          </button>
        </div>

        {/* Client List */}
        <div className="flex flex-col items-start self-stretch gap-3 mt-6">

          {/* Search Bar */}
          <div className="flex items-center border border-blue-border rounded-2xl px-1 w-full md:w-auto md:ml-auto">
            <input type="text" placeholder="Pesquisar por Nome" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="flex-1 md:w-80 px-4 py-2 text-gray-placeholder font-light text-base bg-transparent outline-none" />
            <svg
              className="w-4 h-4 opacity-30"
              viewBox="0 0 17 17"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g opacity="0.3">
                <path d="M15.9866 0.328369H1.48818C0.821989 0.328369 0.485833 1.13668 0.957864 1.60871L6.7373 7.38903V13.8284C6.7373 14.0731 6.85671 14.3024 7.05721 14.4428L9.55721 16.1922C10.0504 16.5374 10.7373 16.1875 10.7373 15.5777V7.38903L16.5169 1.60871C16.988 1.13762 16.6541 0.328369 15.9866 0.328369Z" fill="#2182F1" />
              </g>
            </svg>
          </div>

          {/* Listagem Table */}
          <div className="w-full overflow-x-auto">
            <table className="w-full">
              {/* Table Header */}
              <thead>
                <tr className="border-b border-table-border">
                  <th className="text-left py-3 px-6 text-gray-text font-bold text-sm leading-5 tracking-wider uppercase">
                    Nome
                  </th>
                  <th className="text-left py-3 px-6 text-gray-text font-bold text-sm leading-5 tracking-wider uppercase">
                    Valor
                  </th>
                  <th className="text-left py-3 px-6 text-gray-text font-bold text-sm leading-5 tracking-wider uppercase">
                    Quantidade disponível
                  </th>
                  <th className="text-left py-3 px-6 text-gray-text font-bold text-sm leading-5 tracking-wider uppercase">
                    Status
                  </th>
                  <th className="w-32"></th>
                </tr>
              </thead>

              {/* Table Body */}
              <tbody className="bg-white">
                {filteredClientes.length > 0 ? (
                  filteredClientes.map((cliente: any, index: number) => (
                    <tr key={cliente.id || index} className="border-t border-row-border">
                      <td className="whitespace-nowrap py-4 px-6 text-data-text font-light text-base leading-6">
                        {cliente.nome}
                      </td>
                      <td className="whitespace-nowrap py-4 px-6 text-data-text font-light text-base leading-6">
                        {formatDocument(cliente.documento)}
                      </td>
                      <td className="whitespace-nowrap py-4 px-6 text-data-text font-light text-base leading-6">
                        {formatPhone(cliente.telefone)}
                      </td>
                      <td className="whitespace-nowrap  py-4 px-6 text-data-text font-light text-base leading-6">
                        {cliente.status}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2 justify-end">
                          {/* Add festa */}
                          <button title="Nova Festa" onClick={() => handleNovaFesta(cliente)} className="p-1">
                            <svg
                              className="w-5 h-5"
                              viewBox="0 0 21 21"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M7.40918 1.99512V5.32845"
                                stroke="#3B82F6"
                                strokeWidth="1.66667"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M14.0752 1.99512V5.32845"
                                stroke="#3B82F6"
                                strokeWidth="1.66667"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M18.2422 11.1616V5.32829C18.2422 4.88626 18.0666 4.46234 17.754 4.14978C17.4415 3.83722 17.0175 3.66162 16.5755 3.66162H4.90885C4.46683 3.66162 4.0429 3.83722 3.73034 4.14978C3.41778 4.46234 3.24219 4.88626 3.24219 5.32829V16.995C3.24219 17.437 3.41778 17.8609 3.73034 18.1735C4.0429 18.486 4.46683 18.6616 4.90885 18.6616H11.5755"
                                stroke="#3B82F6"
                                strokeWidth="1.66667"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M3.24219 8.66162H18.2422"
                                stroke="#3B82F6"
                                strokeWidth="1.66667"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M14.0752 16.1616H19.0752"
                                stroke="#3B82F6"
                                strokeWidth="1.66667"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M16.5752 13.6616V18.6616"
                                stroke="#3B82F6"
                                strokeWidth="1.66667"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </button>

                          {/* Edit Icon */}
                          <Link title="Editar" to={`/clientes/editar/${cliente.id}`} className="p-1">
                            <svg
                              className="w-5 h-5"
                              viewBox="0 0 21 21"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M18.3875 6.00495C18.828 5.56447 19.0756 4.967 19.0757 4.34399C19.0758 3.72098 18.8284 3.12345 18.3879 2.68286C17.9474 2.24227 17.3499 1.99471 16.7269 1.99463C16.1039 1.99455 15.5064 2.24197 15.0658 2.68245L3.94413 13.8066C3.75064 13.9995 3.60755 14.2371 3.52746 14.4983L2.42663 18.1249C2.40509 18.197 2.40346 18.2736 2.42192 18.3465C2.44037 18.4194 2.47823 18.486 2.53146 18.5391C2.58469 18.5923 2.65131 18.63 2.72426 18.6483C2.79721 18.6667 2.87376 18.6649 2.94579 18.6433L6.57329 17.5433C6.83427 17.4639 7.07177 17.3217 7.26496 17.1291L18.3875 6.00495Z"
                                stroke="#4B5563"
                                strokeWidth="1.66667"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M13.2422 4.49512L16.5755 7.82845"
                                stroke="#4B5563"
                                strokeWidth="1.66667"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <td colSpan={3}>
                    <div className="flex py-[52px] pb-7 flex-col items-center justify-center self-stretch">
                      <div className="flex-1 text-[#a1a1aa] text-center font-exo text-xl font-bold leading-7 flex justify-center items-center self-stretch">
                        Nenhum brinquedo cadastrado...
                      </div>
                    </div>
                  </td>
                )}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </Layout>
  );
}