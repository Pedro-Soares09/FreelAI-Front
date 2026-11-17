"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { ModalShell } from "@/components/chat/modal-shell";
import { CURRENT_USER_ID } from "@/mocks/conversations";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { acceptAgreement, getMyRole, proposeAgreement } from "@/services/api";
import type { Agreement, AgreementTerms, Conversation } from "@/types";

type AgreementModalProps = {
  conversation: Conversation;
  agreement: Agreement | null;
  onClose: () => void;
  onChanged: (agreement: Agreement) => void;
};

/** Valor padrão do início: amanhã às 18h, no formato aceito por <input type="datetime-local">. */
function defaultStart(): string {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  date.setHours(18, 0, 0, 0);
  return toLocalInput(date);
}

function toLocalInput(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function AgreementModal({ conversation, agreement, onClose, onChanged }: AgreementModalProps) {
  const router = useRouter();
  const myRole = getMyRole(conversation);
  const iAmHirer = myRole === "contratante";
  const otherName = conversation.contact.name;

  const [startsAt, setStartsAt] = useState(defaultStart);
  const [duration, setDuration] = useState("4 horas");
  const [dressCode, setDressCode] = useState("");
  const [paymentDate, setPaymentDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [duties, setDuties] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const iAccepted = agreement
    ? iAmHirer
      ? agreement.acceptedByHirer
      : agreement.acceptedByWorker
    : false;
  const otherAccepted = agreement
    ? iAmHirer
      ? agreement.acceptedByWorker
      : agreement.acceptedByHirer
    : false;
  const bothAccepted = Boolean(agreement && agreement.acceptedByHirer && agreement.acceptedByWorker);

  async function handlePropose(event: FormEvent) {
    event.preventDefault();
    setError(null);
    if (!dressCode.trim() || !duration.trim() || !duties.trim()) {
      setError("Preencha duração, vestimenta e atribuições.");
      return;
    }
    const start = new Date(startsAt);
    if (Number.isNaN(start.getTime()) || start.getTime() <= Date.now()) {
      setError("A data de início precisa ser no futuro.");
      return;
    }

    const terms: AgreementTerms = {
      startsAt: start.toISOString(),
      duration: duration.trim(),
      dressCode: dressCode.trim(),
      paymentDate: new Date(`${paymentDate}T12:00:00`).toISOString(),
      duties: duties.trim(),
      amount: conversation.job.amount,
    };

    setBusy(true);
    try {
      onChanged(await proposeAgreement(conversation.id, terms));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function handleAccept() {
    if (!agreement || !agreedToTerms) return;
    setError(null);
    setBusy(true);
    try {
      const updated = await acceptAgreement(agreement.id);
      onChanged(updated);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  // Contratante vai para o pagamento assim que as duas partes aceitarem.
  const agreementAccepted = agreement?.status === "accepted";
  const agreementId = agreement?.id;
  useEffect(() => {
    if (agreementAccepted && iAmHirer && agreementId) {
      router.push(`/pagamento/${agreementId}`);
    }
  }, [agreementAccepted, iAmHirer, agreementId, router]);

  if (!agreement) {
    return (
      <ModalShell title="Fechar acordo" onClose={onClose}>
        <form className="modal-body" onSubmit={handlePropose}>
          <p>Proponha os termos do serviço. Depois, {otherName} precisa aceitar.</p>
          <label>
            Início do serviço
            <input type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} required />
          </label>
          <label>
            Duração
            <input value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="Ex.: 4 horas" required />
          </label>
          <label>
            Vestimenta
            <input value={dressCode} onChange={(e) => setDressCode(e.target.value)} placeholder="Ex.: camisa preta e calça social" required />
          </label>
          <label>
            Data do pagamento
            <input type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} required />
          </label>
          <label>
            Atribuições
            <textarea value={duties} onChange={(e) => setDuties(e.target.value)} rows={3} required />
          </label>
          <p>
            Valor: <strong>{formatCurrency(conversation.job.amount)}</strong>
          </p>
          {error && <p role="alert" className="connection-warning">{error}</p>}
          <button type="submit" disabled={busy}>
            {busy ? "Enviando..." : "Propor acordo"}
          </button>
        </form>
      </ModalShell>
    );
  }

  return (
    <ModalShell title="Contrato do serviço" onClose={onClose}>
      <div className="modal-body">
        <dl className="terms">
          <dt>Vaga</dt>
          <dd>{agreement.jobTitle}</dd>
          <dt>Início</dt>
          <dd>{formatDateTime(agreement.startsAt)}</dd>
          <dt>Duração</dt>
          <dd>{agreement.duration}</dd>
          <dt>Vestimenta</dt>
          <dd>{agreement.dressCode}</dd>
          <dt>Pagamento</dt>
          <dd>
            {formatCurrency(agreement.amount)} em {formatDateTime(agreement.paymentDate)}
          </dd>
          <dt>Atribuições</dt>
          <dd>{agreement.duties}</dd>
        </dl>

        <ul className="acceptance">
          <li>
            Contratante ({iAmHirer ? "você" : otherName}):{" "}
            {agreement.acceptedByHirer ? "aceitou" : "aguardando aceite"}
          </li>
          <li>
            Profissional ({iAmHirer ? otherName : "você"}):{" "}
            {agreement.acceptedByWorker ? "aceitou" : "aguardando aceite"}
          </li>
        </ul>

        {agreement.status === "pending" && !iAccepted && (
          <>
            <label className="checkbox">
              <input type="checkbox" checked={agreedToTerms} onChange={(e) => setAgreedToTerms(e.target.checked)} />
              Li e concordo com os termos deste acordo
            </label>
            <button type="button" disabled={!agreedToTerms || busy} onClick={() => void handleAccept()}>
              {busy ? "Enviando..." : "Li e aceito"}
            </button>
          </>
        )}

        {agreement.status === "pending" && iAccepted && !otherAccepted && (
          <p role="status" aria-live="polite">
            Você aceitou. Aguardando {otherName} aceitar. Esta tela atualiza sozinha.
          </p>
        )}

        {bothAccepted && !iAmHirer && (
          <p role="status">Acordo aceito pelas duas partes. Aguardando pagamento do contratante.</p>
        )}

        {bothAccepted && iAmHirer && <p role="status">Acordo aceito. Indo para o pagamento...</p>}

        {error && <p role="alert" className="connection-warning">{error}</p>}
      </div>
    </ModalShell>
  );
}
