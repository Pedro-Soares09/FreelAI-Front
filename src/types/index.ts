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
};

export type Payment = {
  id: string;
  amount: number;
  currency: string;
  status: "pending" | "paid" | "failed";
};
