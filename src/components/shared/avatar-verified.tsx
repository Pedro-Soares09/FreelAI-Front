import { IconAlert, IconCheck, IconClock } from "@/components/ui/icons";
import type { VerificationStatus } from "@/types";

type Tamanho = "sm" | "md" | "lg" | "xl";

type AvatarVerifiedProps = {
  name: string;
  imageUrl?: string;
  verified?: boolean;
  status?: VerificationStatus;
  /** Tamanho nomeado ou em pixels. */
  size?: Tamanho | number;
  showLabel?: boolean;
};

const PIXELS: Record<Tamanho, number> = { sm: 32, md: 40, lg: 64, xl: 96 };

export function AvatarVerified({
  name,
  imageUrl,
  verified = false,
  status,
  size = "md",
  showLabel = false,
}: AvatarVerifiedProps) {
  const px = typeof size === "number" ? size : PIXELS[size];
  const verificado = verified || status === "verificado";
  const emAnalise = status === "em_analise";
  const recusado = status === "recusado";
  const selo = Math.max(14, Math.round(px * 0.32));

  const rotulo = verificado
    ? "Perfil verificado"
    : emAnalise
      ? "Verificação em análise"
      : recusado
        ? "Verificação recusada"
        : null;

  const corSelo = verificado ? "bg-success" : emAnalise ? "bg-warning" : "bg-danger";
  const Icone = verificado ? IconCheck : emAnalise ? IconClock : IconAlert;

  return (
    <span className="inline-flex items-center gap-2">
      <span className="relative inline-flex shrink-0" style={{ width: px, height: px }}>
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={`Foto de ${name}`}
            width={px}
            height={px}
            className="rounded-full object-cover"
          />
        ) : (
          <span
            aria-hidden="true"
            className="flex h-full w-full items-center justify-center rounded-full bg-primary/20 font-bold text-primary"
            style={{ fontSize: Math.max(12, px * 0.4) }}
          >
            {name.slice(0, 1).toUpperCase()}
          </span>
        )}
        {rotulo && (
          <span
            role="img"
            aria-label={rotulo}
            className={`absolute -bottom-0.5 -right-0.5 flex items-center justify-center rounded-full text-bg ring-2 ring-surface ${corSelo}`}
            style={{ width: selo, height: selo }}
          >
            <Icone width={selo * 0.6} height={selo * 0.6} strokeWidth={3} />
          </span>
        )}
      </span>
      {showLabel && rotulo && <span className="text-sm text-muted">{rotulo}</span>}
    </span>
  );
}
