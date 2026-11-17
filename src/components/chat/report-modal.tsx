"use client";

import Link from "next/link";
import { useState } from "react";
import { ModalShell } from "@/components/chat/modal-shell";
import { REPORT_REASONS } from "@/lib/constants";
import { reportConversation } from "@/services/api";
import type { ReportReason } from "@/types";

type ReportModalProps = {
  conversationId: string;
  onClose: () => void;
};

export function ReportModal({ conversationId, onClose }: ReportModalProps) {
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [details, setDetails] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function send() {
    if (!reason) return;
    setError(null);
    setBusy(true);
    try {
      await reportConversation(conversationId, reason, details);
      setSent(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  if (sent) {
    return (
      <ModalShell title="Denúncia enviada" onClose={onClose}>
        <div className="modal-body">
          <p role="status">
            Recebemos sua denúncia. A equipe FREELAÍ analisa e pode suspender a conta denunciada.
          </p>
          <p>
            Precisa de ajuda agora? <Link href="/suporte">Veja o suporte</Link>.
          </p>
          <button type="button" onClick={onClose}>
            Fechar
          </button>
        </div>
      </ModalShell>
    );
  }

  return (
    <ModalShell title="Denunciar" onClose={onClose}>
      <div className="modal-body">
        <fieldset className="reasons">
          <legend>Qual o motivo?</legend>
          {REPORT_REASONS.map((option) => (
            <label key={option.value} className="checkbox">
              <input
                type="radio"
                name="report-reason"
                value={option.value}
                checked={reason === option.value}
                onChange={() => setReason(option.value)}
              />
              {option.label}
            </label>
          ))}
        </fieldset>
        <label>
          Detalhes (opcional)
          <textarea value={details} onChange={(e) => setDetails(e.target.value)} rows={3} maxLength={500} />
        </label>
        {error && (
          <p role="alert" className="connection-warning">
            {error}
          </p>
        )}
        <button type="button" className="cta" disabled={!reason || busy} onClick={() => void send()}>
          {busy ? "Enviando..." : "Enviar denúncia"}
        </button>
      </div>
    </ModalShell>
  );
}
