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

export interface ProfissionalRecomendado {
  id: string;
  nome: string;
  foto_url?: string | null;
  verificado: boolean;
  nota_media: number;
  total_avaliacoes: number;
  distancia_km: number;
  novo: boolean;
  pro: boolean;
  demonstrou_interesse: boolean;
  valor_proposto?: number | null;
  resumo: string;
  habilidades: string[];
  estado: 'disponivel' | 'falhou';
}

export interface ConviteContratante {
  id: string;
  profissional_id: string;
  status: 'em_andamento' | 'aceito';
  prazo_em: string;
}

export interface Top3Contratacao {
  vaga: Vaga;
  rodada: number;
  profissionais: ProfissionalRecomendado[];
  convite_atual: ConviteContratante | null;
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
  interessados_count?: number;
  conclusao_confirmada_em?: string | null;
  encerrada_motivo?: string | null;
}

export type EstadoPainelVaga =
  | 'publicada'
  | 'em_contratacao'
  | 'contratada'
  | 'em_execucao'
  | 'aguardando_confirmacao'
  | 'concluida'
  | 'encerradas';

export interface ItemPainelContratante {
  vaga: Vaga;
  estado: EstadoPainelVaga;
  interessados_count: number;
  proxima_acao: 'escolher' | 'pagar' | 'confirmar' | 'validar' | 'avaliar' | null;
  conversa_id?: string | null;
  pagamento_id?: string | null;
}

export type StatusPagamento =
  | 'aguardando'
  | 'retido'
  | 'liberado'
  | 'parcial'
  | 'estornado'
  | 'expirado';

export interface LancamentoPagamento {
  tipo: 'profissional' | 'freelai';
  descricao: string;
  valor: number;
}

export interface PagamentoPix {
  id: string;
  vaga_id: string;
  status: StatusPagamento;
  total: number;
  taxa: number;
  liquido: number;
  qr_codigo: string;
  copia_e_cola: string;
  prazo_em: string;
  lancamentos: LancamentoPagamento[];
  conclusao_confirmada: boolean;
  liberacao_validada: boolean;
  liberacao_prazo_em?: string | null;
}

export interface ResultadoValidacaoFacial {
  vaga_id: string;
  validado: boolean;
  prazo_em: string;
  mensagem: string;
  lancamentos: LancamentoPagamento[];
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

// ===== Conta, verificação e perfis =====

export type AccountType = "profissional" | "empresa";

export type VerificationStatus =
  | "nao_verificado"
  | "em_analise"
  | "verificado"
  | "recusado";

export type ExperienceItem = {
  id: string;
  title: string;
  company: string;
  period: string;
  description: string;
};

export type ProfessionalCharacteristics = {
  comunicacao: number; // 1 a 5
  proatividade: number; // 1 a 5
  agilidade: number; // 1 a 5
  conhecimentoTecnico: string[];
};

export type LocationInfo = {
  city: string;
  state: string;
  neighborhood?: string;
  cep?: string;
};

export type VerificationData = {
  status: VerificationStatus;
  cpf?: string;
  documentType?: "rg" | "cnh" | "passaporte";
  documentFileName?: string;
  selfieFileName?: string;
  submittedAt?: string;
  rejectionReason?: string;
};

export type ProfessionalUser = {
  id: string;
  accountType: "profissional";
  name: string;
  birthDate: string; // YYYY-MM-DD
  email: string;
  phone?: string;
  avatarUrl?: string;
  title: string;
  bio: string;
  location: LocationInfo; // obrigatória
  experiences: ExperienceItem[];
  characteristics: ProfessionalCharacteristics;
  verification: VerificationData;
  rating: {
    average: number;
    totalReviews: number;
  };
  reviews: ProfileReview[];
  verified: boolean;
};

export type CompanyUser = {
  id: string;
  accountType: "empresa";
  corporateReason: string; // Razão Social (obrigatório)
  tradeName?: string; // Nome Fantasia
  cnpj: string; // CNPJ com máscara e validação
  email: string;
  phone: string;
  industry: string;
  location: LocationInfo;
  description: string;
  verified: boolean;
};

export type PolicySection = {
  title: string;
  content: string[];
};

export type PolicyDetail = {
  slug: string;
  title: string;
  badge: string;
  summary: string;
  lastUpdated: string;
  sections: PolicySection[];
};

export type ProfileReview = {
  id: string;
  authorName: string;
  authorCompany: string;
  authorAvatar?: string;
  rating: number; // 1 a 5
  date: string;
  comment: string;
};

export type User = ProfessionalUser | CompanyUser;
