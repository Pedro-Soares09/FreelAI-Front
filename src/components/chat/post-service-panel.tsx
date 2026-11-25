"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ReviewModal } from "@/components/chat/review-modal";
import { CONTEST_REASONS, CONTEST_WINDOW_HOURS } from "@/lib/constants";
import { formatDateTime } from "@/lib/format";
import {
  canContest,
  confirmCompletion,
  contestAgreement,
  getAgreementEvents,
  getMyReview,
} from "@/services/api";
import type { Agreement, ContestReason, Conversation, Review } from "@/types";

type PostServicePanelProps = {
  conversation: Conversation;
  agreement: Agreement;
  iAmHirer: boolean;
  onChanged: (agreement: Agreement) => void;
};

/** Confirmação de conclusão, contestação e linha do tempo do serviço. */
export function PostServicePanel({ conversation, agreement, iAmHirer, onChanged }: PostServicePanelProps) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [contesting, setContesting] = useState(false);
  const [reason, setReason] = useState<ContestReason>("nao-realizado");
  const [details, setDetails] = useState("");
  const [reviewOpen, setReviewOpen] = useState(false);
  const [myReview, setMyReview] = useState<Review | null>(null);
  const [nota, setNota] = useState("");
  const [anexos, setAnexos] = useState<File[]>([]);

  useEffect(() => {
    if (agreement.status !== "completed" || reviewOpen) return;
    let active = true;
    getMyReview(agreement.id)
      .then((found) => {
        if (active) setMyReview(found);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [agreement.id, agreement.status, reviewOpen]);

  const otherName = conversation.contact.name;
  const iConfirmed = iAmHirer ? agreement.completionByHirer : agreement.completionByWorker;
  const events = getAgreementEvents(agreement);

  async function run(action: () => Promise<Agreement>): Promise<Agreement | null> {
    setError(null);
    setBusy(true);
    try {
      const updated = await action();
      onChanged(updated);
      setContesting(false);
      return updated;
    } catch (err) {
      setError((err as Error).message);
      return null;
    } finally {
      setBusy(false);
    }
  }

  async function confirmarConclusao() {
    const updated = await run(() =>
      confirmCompletion(agreement.id, {
        texto: nota,
        anexos: anexos.map((arquivo) => arquivo.name),
      }),
    );
    // Serviço concluído pelas duas partes: o contratante segue para a validação facial (US42).
    if (updated?.status === "completed" && iAmHirer) {
      router.push(`/pagamento/${agreement.id}?validar=1`);
    }
  }

  return (
    <section className="post-service" aria-label="Pós-serviço">
      <h3>Serviço</h3>

      {agreement.status === "accepted" && !iConfirmed && (
        <>
          <label>
            Observação (opcional)
            <textarea value={nota} onChange={(e) => setNota(e.target.value)} rows={3} />
          </label>
          <label>
            Anexos (imagem ou PDF, opcional)
            <input
              type="file"
              accept="image/*,application/pdf"
              multiple
              onChange={(e) => setAnexos(Array.from(e.target.files ?? []))}
            />
          </label>
          {anexos.length > 0 && (
            <ul>
              {anexos.map((arquivo) => (
                <li key={arquivo.name}>{arquivo.name}</li>
              ))}
            </ul>
          )}
          <p>
            Você pode confirmar agora ou aguardar. Sem contestação em {CONTEST_WINDOW_HOURS} h após a conclusão, a
            conclusão é confirmada automaticamente.
          </p>
          <button type="button" className="cta" disabled={busy} onClick={() => void confirmarConclusao()}>
            {busy ? "Confirmando..." : "Confirmar conclusão do serviço"}
          </button>
        </>
      )}

      {agreement.status === "accepted" && iConfirmed && (
        <p role="status">Você confirmou a conclusão. Aguardando {otherName} confirmar.</p>
      )}

      {agreement.status === "completed" && (
        <>
          <p role="status">Serviço concluído pelas duas partes.</p>
          {!iAmHirer && (
            <p>
              O pagamento é feito pelo contratante via Pix. O valor fica retido até a validação facial e só é liberado
              depois dela.
            </p>
          )}
          {iAmHirer && (
            <Link href={`/pagamento/${agreement.id}`} className="cta">
              Pagar o serviço (Pix)
            </Link>
          )}
          {myReview ? (
            <p role="status">Você avaliou {otherName} com nota {myReview.rating}.</p>
          ) : (
            <button type="button" className="cta" onClick={() => setReviewOpen(true)}>
              Avaliar {otherName}
            </button>
          )}
        </>
      )}

      {reviewOpen && (
        <ReviewModal agreement={agreement} targetName={otherName} onClose={() => setReviewOpen(false)} />
      )}

      {agreement.status === "completed" && (agreement.contestDeadline || agreement.reviewDeadline || agreement.autoDecisionDeadline) && (
        <ul className="prazos">
          {agreement.contestDeadline && (
            <li>
              Fim para contestar ({CONTEST_WINDOW_HOURS} h):{" "}
              <time dateTime={agreement.contestDeadline}>{formatDateTime(agreement.contestDeadline)}</time>
            </li>
          )}
          {agreement.reviewDeadline && (
            <li>
              Prazo de revisão (48 h):{" "}
              <time dateTime={agreement.reviewDeadline}>{formatDateTime(agreement.reviewDeadline)}</time>
            </li>
          )}
          {agreement.autoDecisionDeadline && (
            <li>
              Decisão automática (72 h):{" "}
              <time dateTime={agreement.autoDecisionDeadline}>{formatDateTime(agreement.autoDecisionDeadline)}</time>
            </li>
          )}
        </ul>
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
