import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { toast } from "sonner";
import * as Icons from "../components/Icons";

// Objeto completo de cliente
interface Cliente {
  id: number;
  nome: string;
  telefone: string;
}

// Festa com brinquedos (se precisar)
interface Festa {
  id: number;
  data_festa: string;
  hora_montagem: string;
  clienteId: number; // troquei para deixar claro que é só o id
}

// Propriedades que o ModalWhatsApp precisa receber
interface ModalWhatsAppProps {
  festa: Festa;
  cliente: Cliente;
}

export function ModalWhatsApp({ festa, cliente }: ModalWhatsAppProps) {
  const [mensagemSelecionada, setMensagemSelecionada] = useState<string | null>(null);

  function getFirstTwoNames(fullName: string) {
    return fullName
      .trim()
      .split(/\s+/) // separa por espaços
      .slice(0, 2)  // pega só os dois primeiros
      .join(" ");
  }
  const firstNames = getFirstTwoNames(cliente.nome);

  if (!cliente) {
    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <button
            className="mr-1"
            title="Mensagens Rápidas"
          >
            <Icons.WhatsappIcon />
          </button>
        </AlertDialogTrigger>
        <AlertDialogContent className="max-h-[80vh] overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle>Festa ou Cliente não encontrado</AlertDialogTitle>
            <AlertDialogDescription>
              Não foi possível localizar os dados da festa.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Fechar</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  const dataFormatada = new Date(festa.data_festa).toLocaleDateString("pt-BR");
  const horaPrevista = festa.hora_montagem?.slice(0, 5) || "";
  const linkContrato = `${window.location.origin}/locacoes/${festa.id}/contrato`;

  const mensagens = [
    {
      id: 1,
      titulo: "Enviar contrato",
      texto: ` ${cliente.nome}! Segue o contrato da festa para sua conferência e assinatura:`, //${linkContrato}
    },
    {
      id: 2,
      titulo: "Confirmar festa",
      texto: ` Olá ${cliente.nome}! Confirmando sua festa para o dia ${dataFormatada}. Estamos preparando todos os detalhes para aproveitarem ao máximo!`,
    },
    {
      id: 3,
      titulo: "Confirmar montagem",
      texto: ` Olá ${firstNames}, já estamos a caminho para a montagem dos brinquedos! Horário previsto de chegada: ${horaPrevista}`,

    },
    {
      id: 4,
      titulo: "Aviso de atraso",
      texto: ` ${cliente.nome}! Estamos com um pequeno atraso no deslocamento, mas logo estaremos aí.`,
    },
    {
      id: 5,
      titulo: "Agradecimento pós-festa",
      texto: ` Olá ${cliente.nome}! Passando para agradecer a confiança em nosso trabalho para atender sua festa. Estamos à disposição para as próximas ocasiões!`,

    },
    {
      id: 6,
      titulo: "Lembrete de pagamento",
      texto: ` Olá ${cliente.nome}, tudo bem? Passando para lembrar que o pagamento da festa, previsto para ${dataFormatada}, ainda não foi registrado. Caso tenha ocorrido algum imprevisto, entre em contato. Estamos à disposição.`,

    }, 
  ];

  function abrirWhatsApp(texto: string) {
    const telefoneFormatado = cliente.telefone.replace(/\D/g, "");
    const url = `https://wa.me/${telefoneFormatado}?text=${encodeURIComponent(texto)}`;
    window.open(url, "_blank");
  }

  function copiarMensagem(texto: string) {
    navigator.clipboard.writeText(texto);
    toast.success("Mensagem copiada para a área de transferência!");
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button
          className="mr-1"
          title="Mensagens Rápidas"
        >
          <Icons.WhatsappIcon />
        </button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Mensagens rápidas</AlertDialogTitle>
          <AlertDialogDescription>
            <span className="block mt-5 mb-3">
              <span className="text-gray-600">Selecione uma mensagem para enviar ao cliente.</span>
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="flex flex-col gap-3">

          {mensagens.map(({ id, titulo, texto }) => (
            <button
              key={id}
              onClick={() => setMensagemSelecionada(texto)}
              className={`cursor-pointer hover:bg-[#f1f1f1] p-2 rounded border border-gray-300 shadow w-full text-center mb-3 ${mensagemSelecionada === texto
                ? "bg-[#f1f1f1]"
                : "bg-[#ffffff] hover:bg-[#f1f1f1]"
                }`}
            >
              <strong>{titulo}</strong>
              <p className='text-sm text-gray-600 mt-1'>
                {texto}
              </p>
            </button>
          ))}


          {mensagemSelecionada && (
            <div className="flex">
              <button
                onClick={() => abrirWhatsApp(mensagemSelecionada)}
                className="bg-[#128c4a] hover:bg-[#0c6b31] text-white px-4 py-2 rounded shadow w-full"
              >
                Enviar mensagem
              </button>
            </div>
          )}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>Fechar</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}