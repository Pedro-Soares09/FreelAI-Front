export type PerfilAtivo = 'profissional' | 'contratante' | 'admin';

export type StatusVaga =
  | 'publicada'
  | 'em_contratacao'
  | 'aceita'
  | 'aguardando_pagamento'
  | 'contratada'
  | 'em_execucao'
  | 'aguardando_confirmacao'
  | 'em_disputa'
  | 'concluida'
  | 'cancelada'
  | 'expirada';

export type StatusConvite =
  | 'pendente_interesse'
  | 'interessado'
  | 'escolhido'
  | 'aceito'
  | 'recusado'
  | 'expirado';

export type NivelRisco = 'baixo' | 'medio' | 'alto';

export interface ContratanteResumo {
  id: string;
  nome: string;
  foto_url?: string;
  verificado: boolean;
  nota_media: number;
  total_avaliacoes: number;
  pro?: boolean;
}

export interface ConviteVaga {
  id: string;
  vaga_id: string;
  profissional_id: string;
  status: StatusConvite;
  valor_proposto?: number | null;
  prazo_em?: string | null;
  rodada: number;
}

export interface Vaga {
  id: string;
  titulo: string;
  descricao: string;
  categoria: string;
  nivel_risco: NivelRisco;
  valor: number;
  duracao_horas: number;
  data_inicio: string;
  bairro: string;
  distancia_km: number;
  latitude: number;
  longitude: number;
  endereco_completo?: string | null;
  status: StatusVaga;
  contratante: ContratanteResumo;
  meu_convite?: ConviteVaga | null;
  checkin_realizado_em?: string | null;
  falta_registrada?: boolean;
}

export interface BloqueioAgenda {
  id: string;
  inicio: string;
  fim: string;
  motivo?: string;
}

export interface DisponibilidadeProfissional {
  disponivel_agora: boolean;
  disponivel_ate?: string | null;
  raio_km: number;
  bloqueios: BloqueioAgenda[];
}

export type TipoNotificacao =
  | 'selecionado_top3'
  | 'escolhido_convite'
  | 'convite_aceito'
  | 'contrato_pronto'
  | 'pagamento_retido'
  | 'lembrete_confirmacao'
  | 'liberacao_pagamento'
  | 'avaliacao_pendente'
  | 'denuncia_decidida';

export interface Notificacao {
  id: string;
  tipo: TipoNotificacao;
  titulo: string;
  mensagem: string;
  lida: boolean;
  criada_em: string;
  referencia_id?: string;
}

export interface AssinaturaPro {
  ativo: boolean;
  valor_mensal: number;
  valido_ate?: string | null;
  renovacao_automatica: boolean;
}

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

export type User = {
  id: string;
  name: string;
  email: string;
  verified: boolean;
};

export type Job = {
  id: string;
  title: string;
  description: string;
  category: string;
  budget: string;
  status?: string;
};

export type Conversation = {
  id: string;
  participantIds: string[];
  lastMessage?: string;
  /** Pessoa com quem o usuário logado está conversando. */
  contact: ChatContact;
  /** Vaga que originou a conversa (exibida no header do chat). */
  job: ChatJob;
  /** Data/hora ISO da última mensagem, usada para ordenar a lista. */
  lastMessageAt: string;
  unreadCount: number;
  /** Preenchido quando já existe um acordo (proposto, aceito etc.). */
  agreementId?: string;
  /** Vaga encerrada: a conversa vira somente leitura. */
  jobClosed?: boolean;
};

export type Payment = {
  id: string;
  amount: number;
  currency: string;
  status: "pending" | "paid" | "failed";
};

// ===== Chat, acordo e pós-serviço (Pessoa 5) =====

export type ChatRole = "contratante" | "profissional";

export type ChatContact = {
  id: string;
  name: string;
  avatarUrl?: string;
  verified: boolean;
  online: boolean;
  role: ChatRole;
};

export type ChatJob = {
  id: string;
  /** Ex.: "Precisa de Garçom" */
  title: string;
  /** Valor combinado na vaga, em reais. */
  amount: number;
};

/** sending → sent → delivered → seen ("visto") */
export type MessageStatus = "sending" | "sent" | "delivered" | "seen";

export type AttachmentKind = "pdf" | "image";

export type AttachmentStatus = "uploading" | "sent" | "failed";

export type Attachment = {
  id: string;
  kind: AttachmentKind;
  name: string;
  sizeBytes: number;
  status: AttachmentStatus;
  url?: string;
};

export type Message = {
  id: string;
  conversationId: string;
  senderId: string;
  text?: string;
  attachment?: Attachment;
  /** Data/hora ISO do envio. */
  createdAt: string;
  status: MessageStatus;
};

export type NewMessage = {
  text?: string;
  attachment?: Omit<Attachment, "id" | "status">;
};

export type AgreementStatus =
  | "pending" // proposto, aguardando a outra parte
  | "accepted" // as duas partes deram ciência dos termos
  | "cancelled"
  | "completed" // serviço concluído, libera avaliação
  | "contested"; // contestação aberta (US43)

export type AgreementTerms = {
  /** Data/hora ISO de início do serviço. */
  startsAt: string;
  /** Duração em texto livre. Ex.: "4 horas", "3 dias". */
  duration: string;
  dressCode: string;
  /** Data ISO combinada para o pagamento. */
  paymentDate: string;
  duties: string;
  amount: number;
};

export type Agreement = AgreementTerms & {
  id: string;
  conversationId: string;
  jobId: string;
  jobTitle: string;
  hirerId: string;
  workerId: string;
  acceptedByHirer: boolean;
  acceptedByWorker: boolean;
  status: AgreementStatus;
  createdAt: string;
  cancelledAt?: string;
  /** Pós-serviço: confirmação de conclusão de cada parte. */
  completionByHirer?: boolean;
  completionByWorker?: boolean;
  completedAt?: string;
  contestedAt?: string;
  contestReason?: ContestReason;
  contestDetails?: string;
  /** Linha do tempo do acordo. */
  events?: AgreementEvent[];
};

export type AgreementEvent = {
  id: string;
  /** Data/hora ISO do evento. */
  at: string;
  label: string;
};

export type ContestReason = "nao-realizado" | "valor-diferente" | "outro";

export type CancellationResult = {
  agreement: Agreement;
  /** true quando cancelado com 12h ou mais de antecedência. */
  freeOfCharge: boolean;
};

export type ReviewRating = 1 | 2 | 3 | 4 | 5;

export type Review = {
  id: string;
  agreementId: string;
  authorId: string;
  targetId: string;
  rating: ReviewRating;
  comment?: string;
  createdAt: string;
};

export type ReportReason =
  | "golpe"
  | "assedio"
  | "linguagem-ofensiva"
  | "perfil-falso"
  | "outro";

export type Report = {
  id: string;
  conversationId: string;
  reporterId: string;
  reason: ReportReason;
  details?: string;
  createdAt: string;
};
