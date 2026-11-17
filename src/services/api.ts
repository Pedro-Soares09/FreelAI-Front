import {
  AssinaturaPro,
  BloqueioAgenda,
  ConviteVaga,
  DisponibilidadeProfissional,
  Notificacao,
  Vaga,
} from '@/types';
import { mockRouter } from '@/mocks/freelai-mock';
import { fetchAutenticado } from '@/api/client';
import { ApiError, erroDeResposta } from '@/api/erro';

const USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS !== 'false';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  if (USE_MOCKS) {
    return mockRouter<T>(path, options);
  }

  let res: Response;
  try {
    res = await fetchAutenticado(path, options);
  } catch {
    throw new ApiError(0, 'rede', 'Não foi possível conectar ao servidor.');
  }

  if (!res.ok) {
    let corpo: unknown;
    try {
      corpo = await res.json();
    } catch {
      corpo = undefined;
    }
    throw erroDeResposta(res.status, corpo);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const freelaiApi = {
  listarVagasProximas: (params: {
    raio_km: number;
    categoria?: string;
    data_filtro?: 'todas' | 'hoje' | 'amanha';
  }) => {
    const query = new URLSearchParams();
    query.set('raio_km', String(params.raio_km));
    if (params.categoria && params.categoria !== 'todas') {
      query.set('categoria', params.categoria);
    }
    if (params.data_filtro && params.data_filtro !== 'todas') {
      query.set('data', params.data_filtro);
    }
    return request<Vaga[]>(`/api/v1/vagas/oportunidades?${query.toString()}`);
  },

  obterVaga: (vagaId: string) => request<Vaga>(`/api/v1/vagas/${vagaId}`),

  manifestarInteresse: (vagaId: string, valorProposto?: number | null) =>
    request<ConviteVaga>(`/api/v1/vagas/${vagaId}/interesse`, {
      method: 'POST',
      body: JSON.stringify({
        valor_proposto: valorProposto ?? null,
      }),
    }),

  listarConvitesPendentes: () =>
    request<Array<{ convite: ConviteVaga; vaga: Vaga }>>(
      '/api/v1/profissional/convites'
    ),

  aceitarConvite: (conviteId: string) =>
    request<{ vaga_id: string; conversa_id: string }>(
      `/api/v1/convites/${conviteId}/aceitar`,
      { method: 'POST' }
    ),

  recusarConvite: (conviteId: string) =>
    request<void>(`/api/v1/convites/${conviteId}/recusar`, {
      method: 'POST',
    }),

  obterDisponibilidade: () =>
    request<DisponibilidadeProfissional>('/api/v1/profissional/disponibilidade'),

  alternarDisponivelAgora: (ativo: boolean) =>
    request<DisponibilidadeProfissional>(
      '/api/v1/profissional/disponivel-agora',
      {
        method: 'POST',
        body: JSON.stringify({ ativo }),
      }
    ),

  atualizarRaio: (raio_km: number) =>
    request<DisponibilidadeProfissional>('/api/v1/profissional/raio', {
      method: 'PATCH',
      body: JSON.stringify({ raio_km }),
    }),

  criarBloqueioAgenda: (payload: {
    inicio: string;
    fim: string;
    motivo?: string;
  }) =>
    request<BloqueioAgenda>('/api/v1/profissional/agenda/bloqueios', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  removerBloqueioAgenda: (bloqueioId: string) =>
    request<void>(`/api/v1/profissional/agenda/bloqueios/${bloqueioId}`, {
      method: 'DELETE',
    }),

  fazerCheckinGps: (
    vagaId: string,
    coords: { latitude: number; longitude: number; simular_local?: boolean }
  ) =>
    request<{ mensagem: string; distancia_metros: number }>(
      `/api/v1/vagas/${vagaId}/checkin`,
      {
        method: 'POST',
        body: JSON.stringify(coords),
      }
    ),

  registrarFalta: (vagaId: string) =>
    request<{ mensagem: string }>(`/api/v1/vagas/${vagaId}/falta`, {
      method: 'POST',
    }),

  listarNotificacoes: () =>
    request<{ itens: Notificacao[]; nao_lidas: number }>(
      '/api/v1/notificacoes'
    ),

  marcarNotificacaoLida: (id: string) =>
    request<void>(`/api/v1/notificacoes/${id}/lida`, { method: 'PATCH' }),

  marcarTodasNotificacoesLidas: () =>
    request<void>('/api/v1/notificacoes/ler-todas', { method: 'POST' }),

  obterAssinaturaPro: () =>
    request<AssinaturaPro>('/api/v1/assinatura/pro'),

  assinarPlanoPro: () =>
    request<AssinaturaPro>('/api/v1/assinatura/pro/assinar', {
      method: 'POST',
    }),

  cancelarPlanoPro: () =>
    request<AssinaturaPro>('/api/v1/assinatura/pro/cancelar', {
      method: 'POST',
    }),
};

// Chat, acordo e pós-serviço (mocks com atraso simulado até o back expor os endpoints).
export * from './chat';
