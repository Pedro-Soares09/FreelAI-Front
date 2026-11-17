type RatingStarsProps = {
  /** Nota de 0 a 5, pode ter casas decimais (ex.: 4.9). */
  value: number;
  /** Texto para leitores de tela. */
  label?: string;
};

/** Exibe a nota com estrelas; não é interativo (ver ReviewModal para avaliar). */
export function RatingStars({ value, label }: RatingStarsProps) {
  const rounded = Math.round(value);
  return (
    <span className="rating" role="img" aria-label={label ?? `Nota ${value} de 5`}>
      {"★".repeat(rounded)}
      <span className="rating-empty">{"★".repeat(5 - rounded)}</span>
    </span>
  );
}
