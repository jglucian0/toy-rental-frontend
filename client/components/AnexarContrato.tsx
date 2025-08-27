import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

import { LuFilePen } from "react-icons/lu";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import api from "../services/api";


interface Props {
  festaId: number;
  cliente: any; // pode tipar se quiser
  contratoPreenchido: (festaId: number, cliente: any) => void;
}

export function AnexarContrato({ festaId, cliente, contratoPreenchido }: Props) {
  const [anexo, setAnexo] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    setCarregando(true);
    api
      .get(`locacoes/${festaId}/anexos/`)
      .then((res) => setAnexo(res.data.arquivo ?? null))
      .catch(() => setAnexo(null))
      .finally(() => setCarregando(false));
  }, [festaId]);

  const handleUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("arquivo", file);

    try {
      await api.post(`locacoes/${festaId}/anexos/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Contrato enviado com sucesso!", { id: "alert" });
      setAnexo(URL.createObjectURL(file)); // atualiza visualmente
    } catch {
      toast.error("Erro ao enviar contrato.", { id: "alert" });
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button className="text-[#3B82F6] text-[20px] p-1" title="Anexar contrato">
          <LuFilePen />
        </button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Anexar/Ver Contrato</AlertDialogTitle>
          <AlertDialogDescription>
            {carregando ? (
              <span>Carregando...</span>
            ) : anexo ? (
              <span className="block mt-5">
                <a className="mr-2">
                  📄
                </a>
                <a
                  href={anexo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 underline"
                >
                  Ver contrato anexado
                </a>
              </span>
            ) : (
              <span className="block mt-5">
                <span className="text-gray-600">Nenhum contrato anexado.</span>
              </span>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="my-4 flex flex-col gap-3">
          <label className="cursor-pointer bg-[#16803e] hover:bg-[#0e7937] text-white px-4 py-2 rounded shadow w-full text-center">
            {anexo ? "Substituir contrato" : "Anexar contrato"}
            <input
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleUpload(file);
              }}
            />
          </label>

          <button
            className="bg-[#2747b3] hover:bg-[#2040ac] text-white px-6 py-2 rounded shadow"
            onClick={() => contratoPreenchido(festaId, cliente)}
          >
            Baixar contrato preenchido
          </button>
        </div>


        <AlertDialogFooter>
          {anexo && (
            <button
              onClick={async () => {
                try {
                  await api.delete(`/locacoes/${festaId}/anexos/`);
                  toast.success("Contrato excluído com sucesso!");
                  setAnexo(null);
                } catch (error) {
                  toast.error("Erro ao excluir o contrato.");
                }
              }}
              className="cursor-pointer text-white bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded shadow w-full md:w-auto"
            >
              Excluir anexo
            </button>
          )}
          <AlertDialogCancel>Fechar</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
