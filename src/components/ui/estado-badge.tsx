import { Badge, type Tom } from "./badge";

type Mapa = Record<string, { rotulo: string; tom: Tom }>;

export const ESTADOS_VAGA: Mapa = {
  RASCUNHO: { rotulo: "Rascunho", tom: "neutral" },
  PUBLICADA: { rotulo: "Publicada", tom: "info" },
  EM_MATCH: { rotulo: "Em match", tom: "primary" },
  AGUARDANDO_PAGAMENTO: { rotulo: "Aguardando pagamento", tom: "warning" },
  CONTRATADA: { rotulo: "Contratada", tom: "success" },
  EM_ANDAMENTO: { rotulo: "Em andamento", tom: "primary" },
  CONCLUIDA: { rotulo: "Concluída", tom: "success" },
  CANCELADA: { rotulo: "Cancelada", tom: "danger" },
  EXPIRADA: { rotulo: "Expirada", tom: "neutral" },
};

export const ESTADOS_CONVITE: Mapa = {
  PENDENTE: { rotulo: "Aguardando resposta", tom: "warning" },
  ACEITO: { rotulo: "Aceito", tom: "success" },
  RECUSADO: { rotulo: "Recusado", tom: "danger" },
  EXPIRADO: { rotulo: "Expirado", tom: "neutral" },
};

export const ESTADOS_PAGAMENTO: Mapa = {
  PENDENTE: { rotulo: "Aguardando Pix", tom: "warning" },
  RETIDO: { rotulo: "Retido", tom: "info" },
  LIBERADO: { rotulo: "Liberado", tom: "success" },
  LIBERADO_PARCIAL: { rotulo: "Liberado parcialmente", tom: "warning" },
  ESTORNADO: { rotulo: "Estornado", tom: "danger" },
  EXPIRADO: { rotulo: "Expirado", tom: "neutral" },
};

export type TipoEstado = "vaga" | "convite" | "pagamento";

const mapas: Record<TipoEstado, Mapa> = {
  vaga: ESTADOS_VAGA,
  convite: ESTADOS_CONVITE,
  pagamento: ESTADOS_PAGAMENTO,
};

export function EstadoBadge({ tipo, estado }: { tipo: TipoEstado; estado: string }) {
  const item = mapas[tipo][estado.toUpperCase()] ?? { rotulo: estado, tom: "neutral" as Tom };
  return <Badge tom={item.tom}>{item.rotulo}</Badge>;
}
