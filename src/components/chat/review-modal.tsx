"use client";

import { useEffect, useState } from "react";
import { ModalShell } from "@/components/chat/modal-shell";
import { Estrela, RatingStars } from "@/components/shared/rating-stars";
import { getMyReview, submitReview } from "@/services/api";
import type { Agreement, Review, ReviewRating } from "@/types";

type ReviewModalProps = {
  agreement: Agreement;
  targetName: string;
  onClose: () => void;
};

export function ReviewModal({ agreement, targetName, onClose }: ReviewModalProps) {
  const [existing, setExisting] = useState<Review | null | undefined>(undefined);
  const [rating, setRating] = useState<ReviewRating | null>(null);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getMyReview(agreement.id)
      .then((found) => {
        if (active) setExisting(found);
      })
      .catch((err: Error) => {
        if (active) setError(err.message);
      });
    return () => {
      active = false;
    };
  }, [agreement.id]);

  async function send() {
    if (!rating) return;
    setError(null);
    setBusy(true);
    try {
      setExisting(await submitReview(agreement.id, rating, comment));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  if (existing === undefined && !error) {
    return (
      <ModalShell title="Avaliação" onClose={onClose}>
        <p className="modal-body" aria-live="polite">Carregando...</p>
      </ModalShell>
    );
  }

  if (existing) {
    return (
      <ModalShell title="Sua avaliação" onClose={onClose}>
        <div className="modal-body">
          <p>
            Você avaliou {targetName}: <RatingStars value={existing.rating} />
          </p>
          {existing.comment && <p>“{existing.comment}”</p>}
        </div>
      </ModalShell>
    );
  }

  return (
    <ModalShell title={`Avaliar ${targetName}`} onClose={onClose}>
      <div className="modal-body">
        <fieldset className="stars">
          <legend>Como foi o serviço?</legend>
          {([1, 2, 3, 4, 5] as ReviewRating[]).map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={rating === value}
              aria-label={`${value} ${value === 1 ? "estrela" : "estrelas"}`}
              className="star-button"
              onClick={() => setRating(value)}
            >
              <Estrela cheia={value <= (rating ?? 0)} tamanho={28} />
            </button>
          ))}
        </fieldset>
        <label>
          Comentário (opcional)
          <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={3} maxLength={500} />
        </label>
        {error && (
          <p role="alert" className="connection-warning">
            {error}
          </p>
        )}
        <button type="button" className="cta" disabled={!rating || busy} onClick={() => void send()}>
          {busy ? "Enviando..." : "Enviar avaliação"}
        </button>
      </div>
    </ModalShell>
  );
}
