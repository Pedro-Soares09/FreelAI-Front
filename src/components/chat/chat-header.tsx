import Link from "next/link";
import { AvatarVerified } from "@/components/shared/avatar-verified";
import { SeloDestaque } from "@/components/ui/selos";
import { formatCurrency } from "@/lib/format";
import type { Conversation } from "@/types";

type ChatHeaderProps = {
  conversation: Conversation;
  connection: "online" | "reconnecting";
  /** Quando informado, mostra o botão "Fechar acordo". */
  onAgreementClick?: () => void;
  /** Quando informado, mostra o botão "Denunciar". */
  onReportClick?: () => void;
};

export function ChatHeader({ conversation, connection, onAgreementClick, onReportClick }: ChatHeaderProps) {
  const { contact, job } = conversation;

  return (
    <header className="chat-header">
      <Link href="/chat" aria-label="Voltar para as conversas">
        ←
      </Link>
      <AvatarVerified name={contact.name} imageUrl={contact.avatarUrl} verified={contact.verified} />
      <div className="chat-header-info">
        <strong>
          {contact.name} {contact.destaque && <SeloDestaque />}
        </strong>
        <span className="text-xs text-muted">
          {contact.online ? "Online" : "Offline"} · {job.title}
        </span>
      </div>
      <span className="chat-amount">{formatCurrency(job.amount)}</span>
      <Link href="/perfil" className="chip">
        Ver perfil
      </Link>
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
