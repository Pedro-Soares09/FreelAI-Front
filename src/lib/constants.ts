export const APP_NAME = "FreelAI";
export const DEFAULT_LOCALE = "pt-BR";

// ===== Chat, acordo e pós-serviço (Pessoa 5) =====

/** Cancelamento sem taxa até 12h antes do início do serviço. */
export const CANCEL_FREE_HOURS = 12;

/** Tamanho máximo de anexo no chat (currículo, fotos). */
export const MAX_ATTACHMENT_MB = 10;

export const REPORT_REASONS = [
  { value: "golpe", label: "Tentativa de golpe" },
  { value: "assedio", label: "Assédio" },
  { value: "linguagem-ofensiva", label: "Linguagem ofensiva" },
  { value: "perfil-falso", label: "Perfil falso" },
  { value: "outro", label: "Outro motivo" },
] as const;
