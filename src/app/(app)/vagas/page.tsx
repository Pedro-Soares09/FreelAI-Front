'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { freelaiApi } from '@/services/api';
import {
  DisponibilidadeProfissional,
  ItemPainelContratante,
  EstadoPainelVaga,
  Vaga,
} from '@/types';
import dynamic from 'next/dynamic';
import { JobCard } from '@/components/shared/job-card';
import { Carregando } from '@/components/ui/estados';

const MapaVagas = dynamic(() => import('@/components/vagas/mapa-vagas'), {
  ssr: false,
  loading: () => <Carregando rotulo="Carregando mapa" />,
});
import { useToast } from '@/components/ui/toast';
import { useSessao } from '@/lib/session';
import { USE_MOCKS as USA_MOCKS } from "@/lib/modo";

const RECIFE_CENTER = { lat: -8.0476, lng: -34.877 };
const CATEGORIAS = [
  { value: 'todas', label: 'Todas categorias' },
  { value: 'eventos', label: 'Eventos e Recepção' },
  { value: 'gastronomia', label: 'Garçom e Cozinha' },
  { value: 'logistica', label: 'Logística e Carga' },
  { value: 'limpeza', label: 'Limpeza e Conservação' },
  { value: 'manutencao', label: 'Manutenção Geral' },
];

function formatarTempoRestante(isoTarget?: string | null): string | null {
  if (!isoTarget) return null;
  const diff = new Date(isoTarget).getTime() - Date.now();
  if (diff <= 0) return null;
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  const s = Math.floor((diff % 60_000) / 1000);
  return `${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`;
}

const grupoLabels: Record<EstadoPainelVaga, string> = {
  publicada: 'Publicadas',
  em_contratacao: 'Em contratação',
  contratada: 'Contratadas',
  em_execucao: 'Em execução',
  aguardando_confirmacao: 'Aguardando confirmação',
  concluida: 'Concluídas',
  encerradas: 'Encerradas',
};

function EstadoBadge({ estado }: { estado: EstadoPainelVaga }) {
  const classes: Record<EstadoPainelVaga, string> = {
    publicada: 'bg-sky-500/15 text-info',
    em_contratacao: 'bg-amber-500/15 text-warning',
    contratada: 'bg-violet-500/15 text-primary',
    em_execucao: 'bg-cyan-500/15 text-cyan-300',
    aguardando_confirmacao: 'bg-orange-500/15 text-orange-300',
    concluida: 'bg-emerald-500/15 text-success',
    encerradas: 'bg-surface-2 text-fg',
  };
  return (
    <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${classes[estado]}`}>
      {grupoLabels[estado]}
    </span>
  );
}


export default function VagasPage() {
  const { usuario } = useSessao();
  const router = useRouter();
  const ehAdmin = !USA_MOCKS && usuario?.papel === 'admin';
  const [perfilSalvo, setPerfilSalvo] = useState<'profissional' | 'contratante' | 'admin'>(
    'profissional'
  );

  useEffect(() => {
    const salvo = localStorage.getItem('freelai_perfil_ativo');
    if (salvo === 'contratante' || salvo === 'admin') {
      setPerfilSalvo(salvo);
    }
  }, []);

  // Com a API real, o perfil ativo vem da sessão; no mock, do que ficou salvo no navegador.
  const perfil = USA_MOCKS ? perfilSalvo : (usuario?.perfil_ativo ?? 'profissional');

  // A administração não tem painel de vagas: vai direto para /admin, sem chamar rotas de profissional.
  useEffect(() => {
    if (ehAdmin) router.replace('/admin');
  }, [ehAdmin, router]);

  if (ehAdmin) return <Carregando rotulo="Abrindo a administração" />;

  return perfil === 'contratante' || perfil === 'admin' ? (
    <PainelContratante />
  ) : (
    <VagasProfissionalPage />
  );
}

function PainelContratante() {
  const [itens, setItens] = useState<ItemPainelContratante[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    freelaiApi
      .listarPainelContratante()
      .then(setItens)
      .catch((e) =>
        setErro(e instanceof Error ? e.message : 'Erro ao carregar vagas.')
      )
      .finally(() => setLoading(false));
  }, []);

  const grupos: EstadoPainelVaga[] = [
    'publicada',
    'em_contratacao',
    'contratada',
    'em_execucao',
    'aguardando_confirmacao',
    'concluida',
    'encerradas',
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 md:p-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-fg">Painel do contratante</h1>
          <p className="mt-1 text-sm text-muted">
            Acompanhe suas vagas e a próxima ação necessária.
          </p>
        </div>
        <Link
          href="/criar-vaga"
          className="rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-bold text-zinc-950"
        >
          + Criar vaga
        </Link>
      </div>

      {loading ? (
        <div className="h-64 animate-pulse rounded-2xl border border-borda bg-surface" />
      ) : erro ? (
        <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 p-4 text-sm text-rose-200">
          {erro}
        </div>
      ) : (
        <div className="space-y-5">
          {grupos.map((estado) => {
            const itensGrupo = itens.filter((item) => item.estado === estado);
            return (
              <section
                key={estado}
                className="rounded-2xl border border-borda bg-surface p-4"
              >
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-base font-bold text-fg">
                    {grupoLabels[estado]}
                  </h2>
                  <span className="rounded-full bg-surface-2 px-2.5 py-1 text-xs font-bold text-fg">
                    {itensGrupo.length}
                  </span>
                </div>

                {itensGrupo.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-borda p-5 text-center">
                    <p className="text-sm text-muted">Nenhuma vaga neste estado.</p>
                    <Link
                      href="/criar-vaga"
                      className="mt-3 inline-block text-xs font-bold text-success"
                    >
                      Criar uma nova vaga
                    </Link>
                  </div>
                ) : (
                  <div className="grid gap-3 md:grid-cols-2">
                    {itensGrupo.map(({ vaga, interessados_count, proxima_acao, conversa_id, pagamento_id }) => (
                      <article
                        key={vaga.id}
                        className="rounded-xl border border-borda bg-bg p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <EstadoBadge estado={estado} />
                            <h3 className="mt-2 font-bold text-fg">{vaga.titulo}</h3>
                            <p className="mt-1 text-xs text-muted">
                              R$ {vaga.valor.toFixed(2).replace('.', ',')} · {vaga.bairro}
                            </p>
                          </div>
                          <div className="shrink-0 rounded-lg bg-surface px-3 py-2 text-right">
                            <span className="block text-lg font-black text-success">
                              {interessados_count}
                            </span>
                            <span className="text-[10px] text-muted">interessados</span>
                          </div>
                        </div>

                        {vaga.encerrada_motivo && (
                          <p className="mt-3 rounded-lg bg-surface-2 p-2.5 text-xs text-fg">
                            Encerrada: {vaga.encerrada_motivo}
                          </p>
                        )}

                        {proxima_acao && (
                          <p className="mt-3 text-xs text-muted">
                            Próxima ação:{' '}
                            <strong className="capitalize text-warning">
                              {proxima_acao}
                            </strong>
                          </p>
                        )}

                        <div className="mt-4 flex flex-wrap gap-2">
                          {proxima_acao === 'escolher' && (
                            <Link
                              href="/match"
                              className="rounded-lg bg-amber-400 px-3 py-2 text-xs font-bold text-zinc-950"
                            >
                              Ver 3 melhores
                            </Link>
                          )}
                          {proxima_acao === 'acordar' && (
                            <Link
                              href={`/acordo/${vaga.id}`}
                              className="rounded-lg bg-emerald-500 px-3 py-2 text-xs font-bold text-zinc-950"
                            >
                              Fechar acordo
                            </Link>
                          )}
                          {proxima_acao === 'pagar' && pagamento_id && (
                            <Link
                              href={`/pagamento/${pagamento_id}`}
                              className="rounded-lg bg-emerald-500 px-3 py-2 text-xs font-bold text-zinc-950"
                            >
                              Pagar
                            </Link>
                          )}
                          {proxima_acao === 'validar' && (
                            <Link
                              href={`/pagamento/${vaga.id}?validar=1`}
                              className="rounded-lg bg-emerald-500 px-3 py-2 text-xs font-bold text-zinc-950"
                            >
                              Validar conclusão
                            </Link>
                          )}
                          {conversa_id && (
                            <Link
                              href={`/chat/${conversa_id}`}
                              className="rounded-lg border border-borda px-3 py-2 text-xs font-bold text-fg"
                            >
                              Abrir chat
                            </Link>
                          )}
                          <Link
                            href={`/vagas/${vaga.id}`}
                            className="rounded-lg border border-borda px-3 py-2 text-xs font-bold text-fg"
                          >
                            Ver vaga
                          </Link>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

function VagasProfissionalPage() {
  const { avisar } = useToast();
  const [vagas, setVagas] = useState<Vaga[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const [raioKm, setRaioKm] = useState<number>(5);
  const [categoria, setCategoria] = useState<string>('todas');
  const [dataFiltro, setDataFiltro] = useState<'todas' | 'hoje' | 'amanha'>('todas');

  const [disponibilidade, setDisponibilidade] =
    useState<DisponibilidadeProfissional>({
      disponivel_agora: false,
      disponivel_ate: null,
      raio_km: 5,
      bloqueios: [],
    });
  const [tempoRestanteDisp, setTempoRestanteDisp] = useState<string | null>(null);
  const [alternandoDisp, setAlternandoDisp] = useState(false);

  const [agendaAberta, setAgendaAberta] = useState(false);
  const [bloqueioInicio, setBloqueioInicio] = useState('');
  const [bloqueioFim, setBloqueioFim] = useState('');
  const [bloqueioMotivo, setBloqueioMotivo] = useState('');
  const [salvandoBloqueio, setSalvandoBloqueio] = useState(false);

  const [vagaSelecionadaId, setVagaSelecionadaId] = useState<string | null>(null);

  const carregarDados = useCallback(async () => {
    setLoading(true);
    setErro(null);
    try {
      const [listaVagas, disp] = await Promise.all([
        freelaiApi.listarVagasProximas({
          raio_km: raioKm,
          categoria,
          data_filtro: dataFiltro,
        }),
        freelaiApi.obterDisponibilidade().catch(() => null),
      ]);
      setVagas(listaVagas);
      if (disp) {
        setDisponibilidade(disp);
      }
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Falha ao carregar oportunidades.');
    } finally {
      setLoading(false);
    }
  }, [raioKm, categoria, dataFiltro]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  useEffect(() => {
    if (!disponibilidade.disponivel_agora || !disponibilidade.disponivel_ate) {
      setTempoRestanteDisp(null);
      return;
    }
    const tick = () => {
      const restante = formatarTempoRestante(disponibilidade.disponivel_ate);
      setTempoRestanteDisp(restante);
      if (!restante) {
        setDisponibilidade((prev) => ({
          ...prev,
          disponivel_agora: false,
          disponivel_ate: null,
        }));
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [disponibilidade.disponivel_agora, disponibilidade.disponivel_ate]);

  const handleToggleDisponivelAgora = async () => {
    setAlternandoDisp(true);
    try {
      const novoEstado = !disponibilidade.disponivel_agora;
      const atualizado = await freelaiApi.alternarDisponivelAgora(novoEstado);
      setDisponibilidade(atualizado);
    } catch {
      const em4Horas = new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString();
      setDisponibilidade((prev) => ({
        ...prev,
        disponivel_agora: !prev.disponivel_agora,
        disponivel_ate: !prev.disponivel_agora ? em4Horas : null,
      }));
    } finally {
      setAlternandoDisp(false);
    }
  };

  const handleAdicionarBloqueio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bloqueioInicio || !bloqueioFim) return;
    setSalvandoBloqueio(true);
    try {
      const novo = await freelaiApi.criarBloqueioAgenda({
        inicio: new Date(bloqueioInicio).toISOString(),
        fim: new Date(bloqueioFim).toISOString(),
        motivo: bloqueioMotivo.trim() || undefined,
      });
      setDisponibilidade((prev) => ({
        ...prev,
        bloqueios: [...prev.bloqueios, novo],
      }));
      setBloqueioInicio('');
      setBloqueioFim('');
      setBloqueioMotivo('');
    } catch (err) {
      avisar(err instanceof Error ? err.message : 'Erro ao bloquear período.', 'error');
    } finally {
      setSalvandoBloqueio(false);
    }
  };

  const handleRemoverBloqueio = async (id: string) => {
    try {
      await freelaiApi.removerBloqueioAgenda(id);
    } finally {
      setDisponibilidade((prev) => ({
        ...prev,
        bloqueios: prev.bloqueios.filter((b) => b.id !== id),
      }));
    }
  };

  const vagasFiltradas = useMemo(() => {
    const hoje = new Date();
    const amanha = new Date();
    amanha.setDate(hoje.getDate() + 1);

    return vagas.filter((v) => {
      if (v.distancia_km > raioKm) return false;
      if (categoria !== 'todas' && v.categoria.toLowerCase() !== categoria) {
        return false;
      }
      if (dataFiltro !== 'todas') {
        const dataVaga = new Date(v.data_inicio);
        const alvo = dataFiltro === 'hoje' ? hoje : amanha;
        const mesmoDia =
          dataVaga.getDate() === alvo.getDate() &&
          dataVaga.getMonth() === alvo.getMonth() &&
          dataVaga.getFullYear() === alvo.getFullYear();
        if (!mesmoDia) return false;
      }
      return true;
    });
  }, [vagas, raioKm, categoria, dataFiltro]);

  const convitesEscolhidos = useMemo(
    () => vagasFiltradas.filter((v) => v.meu_convite?.status === 'escolhido'),
    [vagasFiltradas]
  );

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 md:p-6">
      <section className="flex flex-col justify-between gap-4 rounded-2xl border border-borda bg-surface/90 p-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-xl font-bold text-fg">
            Oportunidades em Recife
          </h1>
          <p className="text-sm text-muted">
            Ative sua disponibilidade para receber convites imediatos na região.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleToggleDisponivelAgora}
            disabled={alternandoDisp}
            className={`flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
              disponibilidade.disponivel_agora
                ? 'bg-primary text-primary-fg shadow-lg shadow-primary/25'
                : 'border border-borda bg-surface-2 text-primary-fg hover:border-primary/50'
            }`}
          >
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                disponibilidade.disponivel_agora
                  ? 'animate-ping bg-bg'
                  : 'bg-muted'
              }`}
            />
            {disponibilidade.disponivel_agora ? (
              <span>
                Disponível agora •{' '}
                {tempoRestanteDisp ? `restam ${tempoRestanteDisp}` : '4h ativas'}
              </span>
            ) : (
              <span>Ficar disponível agora (4h)</span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setAgendaAberta((v) => !v)}
            className="rounded-xl border border-borda bg-surface-2/80 px-4 py-2.5 text-sm font-medium text-fg hover:border-primary/60"
          >
            Minha agenda ({disponibilidade.bloqueios.length})
          </button>
        </div>
      </section>

      {convitesEscolhidos.length > 0 && (
        <div className="flex flex-col justify-between gap-3 rounded-2xl border border-warning/50 bg-warning/10 p-4 sm:flex-row sm:items-center">
          <div>
            <span className="inline-block rounded-full bg-warning px-2.5 py-0.5 text-xs font-bold text-primary-fg">
              CONVITE PENDENTE
            </span>
            <p className="mt-1 text-sm font-medium text-warning">
              Você foi escolhido para{' '}
              <strong>{convitesEscolhidos[0].titulo}</strong>! Responda dentro
              do prazo de 30 minutos.
            </p>
          </div>
          <Link
            href="/match"
            className="shrink-0 rounded-xl bg-warning px-4 py-2 text-center text-sm font-bold text-primary-fg hover:brightness-110"
          >
            Responder convite
          </Link>
        </div>
      )}

      {agendaAberta && (
        <section className="space-y-4 rounded-2xl border border-borda bg-surface p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-fg">
              Bloquear período na agenda
            </h2>
            <span className="text-xs text-muted">
              Períodos bloqueados removem você automaticamente do match.
            </span>
          </div>

          <form
            onSubmit={handleAdicionarBloqueio}
            className="grid grid-cols-1 gap-3 sm:grid-cols-4"
          >
            <div>
              <label className="mb-1 block text-xs text-muted">Início</label>
              <input
                type="datetime-local"
                required
                value={bloqueioInicio}
                onChange={(e) => setBloqueioInicio(e.target.value)}
                className="w-full rounded-lg border border-borda bg-bg px-3 py-2 text-sm text-fg"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted">Fim</label>
              <input
                type="datetime-local"
                required
                value={bloqueioFim}
                onChange={(e) => setBloqueioFim(e.target.value)}
                className="w-full rounded-lg border border-borda bg-bg px-3 py-2 text-sm text-fg"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted">
                Motivo (opcional)
              </label>
              <input
                type="text"
                placeholder="Ex: Compromisso pessoal"
                value={bloqueioMotivo}
                onChange={(e) => setBloqueioMotivo(e.target.value)}
                className="w-full rounded-lg border border-borda bg-bg px-3 py-2 text-sm text-fg"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={salvandoBloqueio}
                className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-fg hover:brightness-110 disabled:opacity-50"
              >
                {salvandoBloqueio ? 'Salvando...' : 'Bloquear horário'}
              </button>
            </div>
          </form>

          {disponibilidade.bloqueios.length > 0 && (
            <ul className="divide-y divide-borda rounded-xl border border-borda bg-bg">
              {disponibilidade.bloqueios.map((b) => (
                <li
                  key={b.id}
                  className="flex items-center justify-between px-4 py-2.5 text-sm"
                >
                  <div>
                    <span className="font-medium text-fg">
                      {new Date(b.inicio).toLocaleString('pt-BR')} até{' '}
                      {new Date(b.fim).toLocaleString('pt-BR')}
                    </span>
                    {b.motivo && (
                      <span className="ml-2 text-xs text-muted">
                        ({b.motivo})
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoverBloqueio(b.id)}
                    className="text-xs font-medium text-danger hover:underline"
                  >
                    Remover
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      <section className="grid grid-cols-1 gap-4 rounded-2xl border border-borda bg-surface p-4 md:grid-cols-3">
        <div>
          <div className="mb-1 flex items-center justify-between text-xs font-medium text-fg">
            <span>Raio de busca (Recife)</span>
            <span className="rounded bg-primary/15 px-2 py-0.5 font-bold text-primary">
              {raioKm} km
            </span>
          </div>
          <input
            type="range"
            min={1}
            max={15}
            step={1}
            value={raioKm}
            onChange={(e) => {
              const val = Number(e.target.value);
              setRaioKm(val);
              freelaiApi.atualizarRaio(val).catch(() => {});
            }}
            className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-surface-2 accent-primary"
          />
          <div className="mt-1 flex justify-between text-[11px] text-muted">
            <span>1 km</span>
            <span>Padrão: 5 km</span>
            <span>Máx: 15 km</span>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-fg">
            Categoria
          </label>
          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            className="w-full rounded-xl border border-borda bg-bg px-3 py-2 text-sm text-fg"
          >
            {CATEGORIAS.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-fg">
            Data da oportunidade
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(
              [
                { id: 'todas', label: 'Todas' },
                { id: 'hoje', label: 'Hoje' },
                { id: 'amanha', label: 'Amanhã' },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setDataFiltro(opt.id)}
                className={`rounded-xl py-2 text-xs font-semibold transition ${
                  dataFiltro === opt.id
                    ? 'bg-primary text-primary-fg'
                    : 'border border-borda bg-bg text-primary-fg hover:border-primary/60'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <div className="relative z-0 h-[440px] w-full overflow-hidden rounded-card border border-borda bg-surface">
            <MapaVagas
              centro={RECIFE_CENTER}
              raioKm={raioKm}
              vagas={vagasFiltradas}
              selecionadaId={vagaSelecionadaId}
              onSelecionar={setVagaSelecionadaId}
            />
          </div>
          <p className="mt-2 text-xs text-muted">
            Centro de busca: Recife, PE. O raio de {raioKm} km é medido a partir dele.
          </p>
        </div>

        <div className="space-y-4 lg:col-span-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
              {vagasFiltradas.length} oportunidade(s) encontrada(s)
            </h2>
            {vagaSelecionadaId && (
              <button
                type="button"
                onClick={() => setVagaSelecionadaId(null)}
                className="text-xs text-primary hover:underline"
              >
                Mostrar todas
              </button>
            )}
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="h-32 animate-pulse rounded-2xl border border-borda bg-surface"
                />
              ))}
            </div>
          ) : erro ? (
            <div className="rounded-2xl border border-danger/40 bg-danger/10 p-4 text-sm text-danger">
              <p>{erro}</p>
              <button
                type="button"
                onClick={carregarDados}
                className="mt-2 rounded-lg bg-danger px-3 py-1.5 text-xs font-semibold text-primary-fg"
              >
                Tentar novamente
              </button>
            </div>
          ) : vagasFiltradas.length === 0 ? (
            <div className="rounded-2xl border border-borda bg-surface p-6 text-center">
              <p className="text-sm font-medium text-fg">
                Nenhuma vaga encontrada com esses filtros.
              </p>
              <p className="mt-1 text-xs text-muted">
                Aumente o raio de busca ou limpe os filtros de categoria e data.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {vagasFiltradas
                .filter((v) => !vagaSelecionadaId || v.id === vagaSelecionadaId)
                .map((vaga) => (
                  <JobCard key={vaga.id} vaga={vaga} selecionada={vagaSelecionadaId === vaga.id} />
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
