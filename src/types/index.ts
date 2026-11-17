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
