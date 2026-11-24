import { formatFileSize, formatTime } from "@/lib/format";
import type { Message, MessageStatus } from "@/types";

const STATUS_LABEL: Record<MessageStatus, string> = {
  sending: "Enviando...",
  sent: "Enviada",
  delivered: "Entregue",
  seen: "Visto",
};

export function MessageBubble({ message, mine }: { message: Message; mine: boolean }) {
  const { attachment } = message;

  return (
    <div className={`message ${mine ? "message-mine" : "message-theirs"}`}>
      <div className="message-bubble">
        {message.text && <p>{message.text}</p>}

        {attachment && (
          <div className="attachment">
            <span aria-hidden="true">{attachment.kind === "pdf" ? "PDF" : "IMG"}</span>
            <div>
              <strong>{attachment.name}</strong>
              <small>
                {formatFileSize(attachment.sizeBytes)} ·{" "}
                {attachment.status === "uploading"
                  ? "Enviando..."
                  : attachment.status === "failed"
                    ? "Falhou"
                    : "Enviado"}
              </small>
            </div>
          </div>
        )}
      </div>

      <div className="message-meta">
        <time dateTime={message.createdAt}>{formatTime(message.createdAt)}</time>
        {mine && <span>{STATUS_LABEL[message.status]}</span>}
      </div>
    </div>
  );
}
