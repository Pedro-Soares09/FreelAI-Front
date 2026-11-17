"use client";

import { useState } from "react";
import { ModalShell } from "@/components/chat/modal-shell";
import { CANCEL_FREE_HOURS } from "@/lib/constants";
import { formatDateTime } from "@/lib/format";
import { cancelAgreement, isFreeCancellation } from "@/services/api";
import type { Agreement, CancellationResult } from "@/types";

type CancelModalProps = {
  agreement: Agreement;
  onClose: () => void;
  onCancelled: (agreement: Agreement) => void;
};

/** Mesmo texto da Política do App, mostrado aos dois lados antes de confirmar. */
export function CancelModal({ agreement, onClose, onCancelled }: CancelModalProps) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CancellationResult | null>(null);

  const freeNow = isFreeCancellation(agreement.startsAt);
  const hoursLeft = Math.max(0, (Date.parse(agreement.startsAt) - Date.now()) / (60 * 60 * 1000));

  async function confirm() {
    setError(null);
    setBusy(true);
    try {
      const outcome = await cancelAgreement(agreement.id);
      setResult(outcome);
      onCancelled(outcome.agreement);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  if (result) {
    return (
      <ModalShell title="Acordo cancelado" onClose={onClose}>
        <div className="modal-body">
          <p role="status">
            {result.freeOfCharge
              ? "Cancelado sem taxa, dentro do prazo."
              : "Cancelado com taxa, porque o serviço começaria em menos de 12 horas."}
          </p>
          <button type="button" onClick={onClose}>
            Fechar
          </button>
        </div>
      </ModalShell>
    );
  }

  return (
    <ModalShell title="Cancelar serviço" onClose={onClose}>
      <div className="modal-body">
        <p>
          <strong>Regra de cancelamento:</strong> sem taxa até {CANCEL_FREE_HOURS} horas antes do início
          do serviço ({formatDateTime(agreement.startsAt)}).
        </p>

        {freeNow ? (
          <p role="status">
            Faltam {Math.floor(hoursLeft)} horas. Se cancelar agora, <strong>não há taxa</strong>.
          </p>
        ) : (
          <p role="status" className="connection-warning">
            Faltam menos de {CANCEL_FREE_HOURS} horas. Se cancelar agora, <strong>há taxa</strong>.
          </p>
        )}

        <p>A outra parte também verá essa regra antes de confirmar.</p>

        {error && (
          <p role="alert" className="connection-warning">
            {error}
          </p>
        )}

        <div className="ai-actions">
          <button type="button" className="chip" onClick={onClose} disabled={busy}>
            Voltar
          </button>
          <button type="button" className="cta" onClick={() => void confirm()} disabled={busy}>
            {busy ? "Cancelando..." : "Confirmar cancelamento"}
          </button>
        </div>
      </div>
    </ModalShell>
  );
}
