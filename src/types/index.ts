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

export interface Conversation {
  id: string;
  titulo: string;
  vaga_id?: string;
}

export interface Job {
  id: string;
  titulo: string;
  status: StatusVaga;
}

export interface User {
  id: string;
  nome: string;
  perfil: PerfilAtivo;
}

export interface Payment extends PagamentoPix {}

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
