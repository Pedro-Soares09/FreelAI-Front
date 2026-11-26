import Link from "next/link";
import { AvatarVerified } from "@/components/shared/avatar-verified";
import { SeloDestaque } from "@/components/ui/selos";
import { formatCurrency } from "@/lib/format";
import type { AgreementStatus, Conversation } from "@/types";

/** Rótulo do estado da vaga, derivado do acordo (o ChatJob ainda não traz estado). */
export function rotuloEstadoVaga(status: AgreementStatus | undefined): string {
  switch (status) {
    case "pending":
      return "Aguardando aceite";
    case "accepted":
      return "Em andamento";
    case "completed":
      return "Concluída";
    case "contested":
      return "Em disputa";
    case "cancelled":
      return "Acordo cancelado";
    default:
      return "Vaga aberta";
  }
}

type ChatHeaderProps = {
  conversation: Conversation;
  connection: "online" | "reconnecting";
  /** Estado da vaga exibido no cabeçalho. */
  estadoVaga?: string;
  /** Quando informado, mostra o botão "Fechar acordo". */
  onAgreementClick?: () => void;
  /** Quando informado, mostra o botão "Denunciar". */
  onReportClick?: () => void;
};

export function ChatHeader({
  conversation,
  connection,
  estadoVaga,
  onAgreementClick,
  onReportClick,
}: ChatHeaderProps) {
  const { contact, job } = conversation;

  return (
    <header className="chat-header">
      <Link href="/chat" aria-label="Voltar para as conversas">
        ←
      </Link>
      <AvatarVerified
        name={contact.name}
        imageUrl={contact.avatarUrl}
        verified={contact.verified}
        cor={contact.role === "contratante" ? (contact.corDestaque ?? "lilas") : undefined}
      />
      <div className="chat-header-info">
        <strong>
          {contact.name} {contact.destaque && <SeloDestaque />}
        </strong>
        <span className="text-xs text-muted">
          {contact.online ? "Online" : "Offline"} · {job.title}
          {estadoVaga && <> · {estadoVaga}</>}
        </span>
      </div>
      <span className="chat-amount">{formatCurrency(job.amount)}</span>
      {contact.role === "contratante" ? (
        <Link href={`/contratante/${contact.id}`} className="chip">
          Ver perfil
        </Link>
      ) : (
        <Link href="/perfil" className="chip">
          Ver perfil
        </Link>
      )}
      {onReportClick && (
        <button type="button" className="chip" onClick={onReportClick}>
          Denunciar
        </button>
      )}
      {onAgreementClick && (
        <button type="button" className="cta" onClick={onAgreementClick}>
          Fechar acordo
        </button>
      )}
      {connection === "reconnecting" && (
        <p role="status" className="connection-warning">
          Reconectando...
        </p>
      )}
    </header>
  );
}
