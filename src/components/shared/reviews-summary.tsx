"use client";

import { useEffect, useState } from "react";
import { RatingStars } from "@/components/shared/rating-stars";
import { formatDateTime } from "@/lib/format";
import { getReviewsFor, type ReviewSummary } from "@/services/api";

/**
 * Nota média e avaliações recebidas. Para o perfil público (/perfil):
 * <ReviewsSummary userId={user.id} />
 */
export function ReviewsSummary({ userId }: { userId: string }) {
  const [summary, setSummary] = useState<ReviewSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getReviewsFor(userId)
      .then((data) => {
        if (active) setSummary(data);
      })
      .catch((err: Error) => {
        if (active) setError(err.message);
      });
    return () => {
      active = false;
    };
  }, [userId]);

  if (error) return <p role="alert">Não foi possível carregar as avaliações. {error}</p>;
  if (!summary) return <p aria-live="polite">Carregando avaliações...</p>;
  if (summary.total === 0) return <p>Ainda sem avaliações.</p>;

  return (
    <section className="reviews-summary" aria-label="Avaliações">
      <p>
        <strong>{summary.average?.toFixed(1).replace(".", ",")}</strong>{" "}
        <RatingStars value={summary.average ?? 0} /> ({summary.total}{" "}
        {summary.total === 1 ? "avaliação" : "avaliações"})
      </p>
      <ul>
        {summary.reviews.map((review) => (
          <li key={review.id}>
            <RatingStars value={review.rating} /> {review.comment && <span>{review.comment}</span>}{" "}
            <time dateTime={review.createdAt}>{formatDateTime(review.createdAt)}</time>
          </li>
        ))}
      </ul>
    </section>
  );
}
