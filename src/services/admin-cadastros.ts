export type TipoItem = "verificacao" | "experiencia" | "qualificacao" | "epi";

export type ItemFila = {
  id: string;
  tipo: TipoItem;
  usuario: string;
  descricao: string;
  /** Instante em que o item entrou na fila (ISO 8601). */
  enviadoEm: string;
  arquivos: { nome: string; url: string }[];
};

export const ROTULOS_TIPO: Record<TipoItem, string> = {
  verificacao: "Verificação de identidade",
  experiencia: "Experiência",
  qualificacao: "Qualificação",
  epi: "EPI",
};

/** Prazo a partir do qual o item é destacado na fila, em horas. */
export const PRAZO_DESTAQUE_HORAS = 48;

export function horasEmFila(enviadoEm: string, agora = Date.now()): number {
  return Math.max(0, (agora - new Date(enviadoEm).getTime()) / 3_600_000);
}

export function tempoEmFila(enviadoEm: string, agora = Date.now()): string {
  const horas = Math.floor(horasEmFila(enviadoEm, agora));
  if (horas < 1) return "menos de 1 h";
  if (horas < 48) return `${horas} h`;
  return `${Math.floor(horas / 24)} dias`;
}

export function acimaDoPrazo(enviadoEm: string, agora = Date.now()): boolean {
  return horasEmFila(enviadoEm, agora) > PRAZO_DESTAQUE_HORAS;
}

export type Decisao = { id: string; aprovado: boolean; motivo?: string };

/**
 * Acesso à fila de cadastros. Enquanto os endpoints de moderação não existem no contrato,
 * a implementação usa dados locais; a troca para a API altera apenas este módulo.
 */
export interface RepositorioCadastros {
  listar(): Promise<ItemFila[]>;
  decidir(decisao: Decisao): Promise<void>;
}

const horas = (h: number) => new Date(Date.now() - h * 3_600_000).toISOString();

let fila: ItemFila[] = [
  {
    id: "c1",
    tipo: "verificacao",
    usuario: "Ana Souza",
    descricao: "Documento com foto e selfie para validação de identidade.",
    enviadoEm: horas(5),
    arquivos: [
      { nome: "documento-frente.jpg", url: "#" },
      { nome: "selfie.jpg", url: "#" },
    ],
  },
  {
    id: "c2",
    tipo: "epi",
    usuario: "Carlos Lima",
    descricao: "Foto do kit de EPI para serviços elétricos.",
    enviadoEm: horas(52),
    arquivos: [{ nome: "epi-kit.jpg", url: "#" }],
  },
  {
    id: "c3",
    tipo: "experiencia",
    usuario: "Marina Alves",
    descricao: "Comprovação de 3 anos como cuidadora.",
    enviadoEm: horas(20),
    arquivos: [{ nome: "declaracao.pdf", url: "#" }],
  },
  {
    id: "c4",
    tipo: "qualificacao",
    usuario: "Rafael Costa",
    descricao: "Certificado de curso de eletricista.",
    enviadoEm: horas(73),
    arquivos: [{ nome: "certificado.pdf", url: "#" }],
  },
];

export const repositorioCadastros: RepositorioCadastros = {
  async listar() {
    return [...fila].sort((a, b) => a.enviadoEm.localeCompare(b.enviadoEm));
  },
  async decidir({ id }) {
    fila = fila.filter((i) => i.id !== id);
  },
};
