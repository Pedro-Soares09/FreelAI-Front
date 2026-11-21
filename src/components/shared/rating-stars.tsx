type RatingStarsProps = {
  /** Nota de 0 a 5, pode ter casas decimais (ex.: 4.9). */
  value: number;
  /** Texto para leitores de tela. */
  label?: string;
};

const CAMINHO_ESTRELA = "m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9L12 3Z";

export function Estrela({ cheia, tamanho = 16 }: { cheia: boolean; tamanho?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={tamanho}
      height={tamanho}
      aria-hidden="true"
      fill={cheia ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
    >
      <path d={CAMINHO_ESTRELA} />
    </svg>
  );
}

/** Exibe a nota com estrelas; não é interativo (ver ReviewModal para avaliar). */
export function RatingStars({ value, label }: RatingStarsProps) {
  const rounded = Math.round(value);
  return (
    <span className="rating inline-flex gap-0.5" role="img" aria-label={label ?? `Nota ${value} de 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={n <= rounded ? "" : "rating-empty"}>
          <Estrela cheia={n <= rounded} />
        </span>
      ))}
    </span>
  );
}
