"use client";

import Link from "next/link";
import { useState } from "react";
import { ReviewModal } from "@/components/chat/review-modal";
import { CONTEST_REASONS, CONTEST_WINDOW_HOURS } from "@/lib/constants";
import { formatDateTime } from "@/lib/format";
import {
  canContest,
  confirmCompletion,
  contestAgreement,
  getAgreementEvents,
} from "@/services/api";
import type { Agreement, ContestReason, Conversation } from "@/types";

type PostServicePanelProps = {
  conversation: Conversation;
  agreement: Agreement;
  iAmHirer: boolean;
  onChanged: (agreement: Agreement) => void;
};

/** Confirmação de conclusão, contestação e linha do tempo do serviço. */
export function PostServicePanel({ conversation, agreement, iAmHirer, onChanged }: PostServicePanelProps) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [contesting, setContesting] = useState(false);
  const [reason, setReason] = useState<ContestReason>("nao-realizado");
  const [details, setDetails] = useState("");
  const [reviewOpen, setReviewOpen] = useState(false);

  const otherName = conversation.contact.name;
  const iConfirmed = iAmHirer ? agreement.completionByHirer : agreement.completionByWorker;
  const events = getAgreementEvents(agreement);

  async function run(action: () => Promise<Agreement>) {
    setError(null);
    setBusy(true);
    try {
      onChanged(await action());
      setContesting(false);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="post-service" aria-label="Pós-serviço">
      <h3>Serviço</h3>

      {agreement.status === "accepted" && !iConfirmed && (
        <button type="button" className="cta" disabled={busy} onClick={() => void run(() => confirmCompletion(agreement.id))}>
          {busy ? "Confirmando..." : "Confirmar conclusão do serviço"}
        </button>
      )}

      {agreement.status === "accepted" && iConfirmed && (
        <p role="status">Você confirmou a conclusão. Aguardando {otherName} confirmar.</p>
      )}

      {agreement.status === "completed" && (
        <>
          <p role="status">Serviço concluído pelas duas partes.</p>
          {iAmHirer && (
            <Link href={`/pagamento/${agreement.id}`} className="cta">
              Pagar o serviço (Pix)
            </Link>
          )}
          <button type="button" className="cta" onClick={() => setReviewOpen(true)}>
            Avaliar {otherName}
          </button>
        </>
      )}

      {reviewOpen && (
        <ReviewModal agreement={agreement} targetName={otherName} onClose={() => setReviewOpen(false)} />
      )}

      {agreement.status === "contested" && (
        <p role="status">
          Serviço contestado: <strong>{CONTEST_REASONS.find((r) => r.value === agreement.contestReason)?.label}</strong>.
          A equipe FREELAÍ analisa em até {CONTEST_WINDOW_HOURS}h.
        </p>
      )}

      {canContest(agreement) && agreement.status !== "contested" && !contesting && (
        <button type="button" className="chip" onClick={() => setContesting(true)}>
          Contestar serviço
        </button>
      )}

      {contesting && (
        <form
          className="modal-body"
          onSubmit={(event) => {
            event.preventDefault();
            void run(() => contestAgreement(agreement.id, reason, details));
          }}
        >
          <label>
            Motivo
            <select value={reason} onChange={(e) => setReason(e.target.value as ContestReason)}>
              {CONTEST_REASONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Detalhes
            <textarea value={details} onChange={(e) => setDetails(e.target.value)} rows={3} />
          </label>
          <div className="ai-actions">
            <button type="submit" disabled={busy}>
              {busy ? "Enviando..." : "Enviar contestação"}
            </button>
            <button type="button" className="chip" onClick={() => setContesting(false)}>
              Cancelar
            </button>
          </div>
        </form>
      )}

      {error && (
        <p role="alert" className="connection-warning">
          {error}
        </p>
      )}

      <h4>Linha do tempo</h4>
      {events.length === 0 ? (
        <p>Nenhum evento ainda.</p>
      ) : (
        <ol className="timeline">
          {events.map((event) => (
            <li key={event.id}>
              <time dateTime={event.at}>{formatDateTime(event.at)}</time> · {event.label}
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
