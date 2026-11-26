'use client';

import Link from 'next/link';
import { IconCheck } from '@/components/ui/icons';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { freelaiApi } from '@/services/api';
import { ProfissionalRecomendado, Top3Contratacao } from '@/types';

function formatarValor(valor?: number | null): string {
  if (valor == null) return 'Sem proposta';
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

function formatarContagem(prazo: string, agoraMs: number): string {
  const restanteMs = Math.max(0, new Date(prazo).getTime() - agoraMs);
  const minutos = Math.floor(restanteMs / 60_000);
  const segundos = Math.floor((restanteMs % 60_000) / 1000);
  return `${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`;
}

function FotoProfissional({
  profissional,
}: {
  profissional: ProfissionalRecomendado;
}) {
  const [erroImagem, setErroImagem] = useState(false);

  return (
    <div className="relative h-16 w-16 shrink-0">
      {profissional.foto_url && !erroImagem ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={profissional.foto_url}
          alt={`Foto de ${profissional.nome}`}
          className="h-16 w-16 rounded-full object-cover"
          onError={() => setErroImagem(true)}
        />
      ) : (
        <span
          aria-hidden="true"
          className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-2 text-xl font-bold text-primary"
        >
          {profissional.nome.slice(0, 1).toUpperCase()}
        </span>
      )}
      {profissional.verificado && (
        <span
          aria-label="Perfil verificado"
          title="Perfil verificado"
          className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-borda bg-info text-xs font-black text-primary-fg"
        >
          <IconCheck width={12} height={12} strokeWidth={3.5} />
        </span>
      )}
    </div>
  );
}

function CartaoProfissional({
  profissional,
  conviteEmAndamento,
  conviteDoProfissional,
  conviteAceito,
  profissionalAceito,
  processando,
  onEscolher,
}: {
  profissional: ProfissionalRecomendado;
  conviteEmAndamento: boolean;
  conviteDoProfissional: boolean;
  conviteAceito: boolean;
  profissionalAceito: boolean;
  processando: boolean;
  onEscolher: () => void;
}) {
  const bloqueado =
    conviteEmAndamento ||
    conviteAceito ||
    profissional.estado === 'falhou' ||
    processando;

  return (
    <article
      className={`flex h-full flex-col rounded-2xl border p-5 transition ${
        profissional.estado === 'falhou'
          ? 'border-borda bg-surface-2/60 opacity-75'
          : 'border-borda bg-surface-2 hover:border-primary/60'
      }`}
    >
      <div className="flex items-start gap-4">
        <FotoProfissional profissional={profissional} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap gap-2">
            {profissional.novo && (
              <span className="rounded-full bg-info/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-info">
                Novo
              </span>
            )}
            {profissional.pro && (
              <span className="rounded-full bg-primary px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-primary-fg">
                Pro
              </span>
            )}
          </div>
          <h2 className="mt-2 truncate text-base font-bold text-fg">
            {profissional.nome}
          </h2>
          <p className="mt-1 text-xs text-muted">
            <span className="font-semibold text-warning">
              Nota {profissional.nota_media.toFixed(1)}
            </span>
            <span aria-hidden="true"> · </span>
            {profissional.total_avaliacoes} avaliações
          </p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-surface-2 px-3 py-2.5">
          <span className="block text-[10px] uppercase tracking-wide text-muted">
            Distância
          </span>
          <span className="mt-1 block text-sm font-semibold text-muted">
            {profissional.distancia_km.toLocaleString('pt-BR')} km
          </span>
        </div>
        <div className="rounded-xl bg-surface-2 px-3 py-2.5">
          <span className="block text-[10px] uppercase tracking-wide text-muted">
            Valor proposto
          </span>
          <span className="mt-1 block truncate text-sm font-semibold text-muted">
            {formatarValor(profissional.valor_proposto)}
          </span>
        </div>
      </div>

      <p
        className={`mt-4 rounded-lg px-3 py-2 text-xs font-semibold ${
          profissional.demonstrou_interesse
            ? 'bg-primary/10 text-primary'
            : 'bg-surface-2 text-muted'
        }`}
      >
        {profissional.demonstrou_interesse
          ? 'Demonstrou interesse nesta vaga'
          : 'Ainda não demonstrou interesse'}
      </p>

      <details className="mt-4 border-t border-borda pt-3">
        <summary className="cursor-pointer text-xs font-semibold text-muted hover:text-fg">
          Ver perfil resumido
        </summary>
        <div className="mt-3 space-y-3 text-xs text-muted">
          <p>{profissional.resumo}</p>
          {profissional.usuario_id != null && (
            <Link
              href={`/profissional/${profissional.usuario_id}`}
              className="inline-block font-semibold text-primary hover:underline"
            >
              Ver perfil completo
            </Link>
          )}
          <div className="flex flex-wrap gap-1.5">
            {profissional.habilidades.map((habilidade) => (
              <span
                key={habilidade}
                className="rounded-md bg-surface-2 px-2 py-1 text-muted"
              >
                {habilidade}
              </span>
            ))}
          </div>
        </div>
      </details>

      <div className="mt-auto pt-5">
        {profissional.estado === 'falhou' ? (
          <p className="mb-3 text-center text-xs font-semibold text-danger">
            Convite não concluído nesta rodada
          </p>
        ) : null}
        <button
          type="button"
          disabled={bloqueado}
          onClick={onEscolher}
          className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-fg transition hover:bg-primary disabled:cursor-not-allowed disabled:bg-surface-2 disabled:text-muted"
        >
          {processando
            ? 'Enviando convite...'
            : profissionalAceito
            ? 'Profissional escolhido'
            : conviteDoProfissional
            ? 'Aguardando resposta'
            : profissional.estado === 'falhou'
            ? 'Indisponível nesta rodada'
            : 'Escolher profissional'}
        </button>
      </div>
    </article>
  );
}

export function ContratanteTop3() {
  const [matches, setMatches] = useState<Top3Contratacao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [agoraMs, setAgoraMs] = useState(() => Date.now());
  const [processandoId, setProcessandoId] = useState<string | null>(null);
  const requisicaoAtiva = useRef(false);

  const carregarMatches = useCallback(async (silencioso = false) => {
    if (requisicaoAtiva.current) return;
    requisicaoAtiva.current = true;
    if (!silencioso) setCarregando(true);
    try {
      const dados = await freelaiApi.listarTop3Contratante();
      setMatches(dados);
      setErro(null);
    } catch (e) {
      setErro(
        e instanceof Error ? e.message : 'Não foi possível atualizar as vagas.'
      );
    } finally {
      requisicaoAtiva.current = false;
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    void carregarMatches();
    const intervalo = window.setInterval(() => {
      void carregarMatches(true);
    }, 10_000);
    return () => window.clearInterval(intervalo);
  }, [carregarMatches]);

  useEffect(() => {
    const intervalo = window.setInterval(() => setAgoraMs(Date.now()), 1000);
    return () => window.clearInterval(intervalo);
  }, []);

  const escolherProfissional = async (
    vagaId: string,
    profissionalId: string
  ) => {
    setProcessandoId(profissionalId);
    setErro(null);
    try {
      const atualizado = await freelaiApi.escolherProfissional(
        vagaId,
        profissionalId
      );
      setMatches((atuais) =>
        atuais.map((match) =>
          match.vaga.id === vagaId ? atualizado : match
        )
      );
    } catch (e) {
      setErro(
        e instanceof Error ? e.message : 'Não foi possível enviar o convite.'
      );
    } finally {
      setProcessandoId(null);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 pb-24 md:p-6">
      <header className="space-y-2">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
          Contratação por match
        </p>
        <h1 className="text-2xl font-extrabold text-fg md:text-3xl">
          3 melhores profissionais
        </h1>
        <p className="max-w-2xl text-sm text-muted">
          Confira os perfis recomendados para sua vaga e escolha quem deseja
          convidar. O convite fica em andamento por até 30 minutos.
        </p>
      </header>

      {erro && (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-danger/40 bg-danger/10 p-4 text-sm text-danger"
        >
          <span>{erro}</span>
          <button
            type="button"
            onClick={() => void carregarMatches()}
            className="rounded-lg border border-danger/30 px-3 py-1.5 text-xs font-bold hover:bg-danger/10"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {carregando && matches.length === 0 ? (
        <div
          aria-label="Carregando profissionais recomendados"
          className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
        >
          {[0, 1, 2].map((item) => (
            <div
              key={item}
              className="h-80 animate-pulse rounded-2xl border border-borda bg-surface-2"
            />
          ))}
        </div>
      ) : matches.length === 0 ? (
        <div className="rounded-2xl border border-borda bg-surface-2 p-8 text-center">
          <h2 className="font-bold text-fg">Nenhuma rodada disponível</h2>
          <p className="mt-2 text-sm text-muted">
            Quando houver profissionais compatíveis com suas vagas, eles
            aparecerão aqui.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {matches.map((match) => {
            const convite = match.convite_atual;
            const conviteEmAndamento = convite?.status === 'em_andamento';
            const conviteAceito = convite?.status === 'aceito';
            const interessadoCount = match.profissionais.filter(
              (profissional) => profissional.demonstrou_interesse
            ).length;

            return (
              <section key={match.vaga.id} className="space-y-4">
                <div className="flex flex-wrap items-end justify-between gap-3 border-b border-borda pb-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                      {match.vaga.categoria} · {match.vaga.bairro}
                    </p>
                    <h2 className="mt-1 text-lg font-bold text-fg">
                      {match.vaga.titulo}
                    </h2>
                    <p className="mt-1 text-xs text-muted">
                      Rodada {match.rodada} · {interessadoCount} de{' '}
                      {match.profissionais.length} demonstraram interesse
                    </p>
                  </div>
                  <p className="text-sm font-bold text-primary">
                    Orçamento {formatarValor(match.vaga.valor)}
                  </p>
                </div>

                {conviteEmAndamento && convite && (
                  <div
                    role="status"
                    aria-live="polite"
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-warning/40 bg-warning/10 p-4"
                  >
                    <div>
                      <p className="text-sm font-bold text-warning">
                        Convite em andamento
                      </p>
                      <p className="mt-1 text-xs text-warning/70">
                        As outras opções ficam indisponíveis até o convite ser
                        resolvido.
                      </p>
                    </div>
                    <p className="font-mono text-xl font-extrabold text-warning">
                      {formatarContagem(convite.prazo_em, agoraMs)}
                    </p>
                  </div>
                )}

                {conviteAceito && (
                  <div
                    role="status"
                    className="rounded-xl border border-primary/40 bg-primary/10 p-4 text-sm font-semibold text-primary"
                  >
                    O convite foi aceito. Esta vaga já tem um profissional
                    escolhido.
                  </div>
                )}

                {match.profissionais.every(
                  (profissional) => profissional.estado === 'falhou'
                ) && (
                  <div
                    role="status"
                    aria-live="polite"
                    className="rounded-xl border border-info/40 bg-info/10 p-4 text-sm font-semibold text-info"
                  >
                    Os convites desta rodada falharam. A nova rodada está
                    disponível.
                  </div>
                )}

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {match.profissionais.map((profissional) => (
                    <CartaoProfissional
                      key={profissional.id}
                      profissional={profissional}
                      conviteEmAndamento={
                        Boolean(conviteEmAndamento) || processandoId !== null
                      }
                      conviteDoProfissional={
                        convite?.profissional_id === profissional.id
                      }
                      conviteAceito={Boolean(conviteAceito)}
                      profissionalAceito={
                        conviteAceito &&
                        convite?.profissional_id === profissional.id
                      }
                      processando={processandoId === profissional.id}
                      onEscolher={() =>
                        void escolherProfissional(
                          match.vaga.id,
                          profissional.id
                        )
                      }
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
