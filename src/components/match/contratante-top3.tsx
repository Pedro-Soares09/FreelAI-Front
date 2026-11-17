'use client';

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
          className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-800 text-xl font-bold text-emerald-300"
        >
          {profissional.nome.slice(0, 1).toUpperCase()}
        </span>
      )}
      {profissional.verificado && (
        <span
          aria-label="Perfil verificado"
          title="Perfil verificado"
          className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-zinc-900 bg-sky-400 text-xs font-black text-zinc-950"
        >
          ✓
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
          ? 'border-zinc-800 bg-zinc-900/60 opacity-75'
          : 'border-zinc-800 bg-zinc-900 hover:border-zinc-700'
      }`}
    >
      <div className="flex items-start gap-4">
        <FotoProfissional profissional={profissional} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap gap-2">
            {profissional.novo && (
              <span className="rounded-full bg-sky-500/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-sky-300">
                Novo
              </span>
            )}
            {profissional.pro && (
              <span className="rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-zinc-950">
                Pro
              </span>
            )}
          </div>
          <h2 className="mt-2 truncate text-base font-bold text-white">
            {profissional.nome}
          </h2>
          <p className="mt-1 text-xs text-zinc-400">
            <span className="font-semibold text-amber-300">
              ★ {profissional.nota_media.toFixed(1)}
            </span>
            <span aria-hidden="true"> · </span>
            {profissional.total_avaliacoes} avaliações
          </p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-zinc-950 px-3 py-2.5">
          <span className="block text-[10px] uppercase tracking-wide text-zinc-500">
            Distância
          </span>
          <span className="mt-1 block text-sm font-semibold text-zinc-200">
            {profissional.distancia_km.toLocaleString('pt-BR')} km
          </span>
        </div>
        <div className="rounded-xl bg-zinc-950 px-3 py-2.5">
          <span className="block text-[10px] uppercase tracking-wide text-zinc-500">
            Valor proposto
          </span>
          <span className="mt-1 block truncate text-sm font-semibold text-zinc-200">
            {formatarValor(profissional.valor_proposto)}
          </span>
        </div>
      </div>

      <p
        className={`mt-4 rounded-lg px-3 py-2 text-xs font-semibold ${
          profissional.demonstrou_interesse
            ? 'bg-emerald-500/10 text-emerald-300'
            : 'bg-zinc-800/70 text-zinc-400'
        }`}
      >
        {profissional.demonstrou_interesse
          ? '✓ Demonstrou interesse nesta vaga'
          : 'Ainda não demonstrou interesse'}
      </p>

      <details className="mt-4 border-t border-zinc-800 pt-3">
        <summary className="cursor-pointer text-xs font-semibold text-zinc-300 hover:text-white">
          Ver perfil resumido
        </summary>
        <div className="mt-3 space-y-3 text-xs text-zinc-400">
          <p>{profissional.resumo}</p>
          <div className="flex flex-wrap gap-1.5">
            {profissional.habilidades.map((habilidade) => (
              <span
                key={habilidade}
                className="rounded-md bg-zinc-800 px-2 py-1 text-zinc-300"
              >
                {habilidade}
              </span>
            ))}
          </div>
        </div>
      </details>

      <div className="mt-auto pt-5">
        {profissional.estado === 'falhou' ? (
          <p className="mb-3 text-center text-xs font-semibold text-rose-300">
            Convite não concluído nesta rodada
          </p>
        ) : null}
        <button
          type="button"
          disabled={bloqueado}
          onClick={onEscolher}
          className="w-full rounded-xl bg-emerald-500 px-4 py-3 text-sm font-bold text-zinc-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400"
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
    <main className="mx-auto max-w-6xl space-y-6 p-4 pb-24 md:p-6">
      <header className="space-y-2">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-400">
          Contratação por match
        </p>
        <h1 className="text-2xl font-extrabold text-white md:text-3xl">
          3 melhores profissionais
        </h1>
        <p className="max-w-2xl text-sm text-zinc-400">
          Confira os perfis recomendados para sua vaga e escolha quem deseja
          convidar. O convite fica em andamento por até 30 minutos.
        </p>
      </header>

      {erro && (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-500/40 bg-rose-500/10 p-4 text-sm text-rose-200"
        >
          <span>{erro}</span>
          <button
            type="button"
            onClick={() => void carregarMatches()}
            className="rounded-lg border border-rose-300/30 px-3 py-1.5 text-xs font-bold hover:bg-rose-500/10"
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
              className="h-80 animate-pulse rounded-2xl border border-zinc-800 bg-zinc-900"
            />
          ))}
        </div>
      ) : matches.length === 0 ? (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8 text-center">
          <h2 className="font-bold text-white">Nenhuma rodada disponível</h2>
          <p className="mt-2 text-sm text-zinc-400">
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
                <div className="flex flex-wrap items-end justify-between gap-3 border-b border-zinc-800 pb-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-emerald-400">
                      {match.vaga.categoria} · {match.vaga.bairro}
                    </p>
                    <h2 className="mt-1 text-lg font-bold text-white">
                      {match.vaga.titulo}
                    </h2>
                    <p className="mt-1 text-xs text-zinc-400">
                      Rodada {match.rodada} · {interessadoCount} de{' '}
                      {match.profissionais.length} demonstraram interesse
                    </p>
                  </div>
                  <p className="text-sm font-bold text-emerald-300">
                    Orçamento {formatarValor(match.vaga.valor)}
                  </p>
                </div>

                {conviteEmAndamento && convite && (
                  <div
                    role="status"
                    aria-live="polite"
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4"
                  >
                    <div>
                      <p className="text-sm font-bold text-amber-200">
                        Convite em andamento
                      </p>
                      <p className="mt-1 text-xs text-amber-100/70">
                        As outras opções ficam indisponíveis até o convite ser
                        resolvido.
                      </p>
                    </div>
                    <p className="font-mono text-xl font-extrabold text-amber-300">
                      {formatarContagem(convite.prazo_em, agoraMs)}
                    </p>
                  </div>
                )}

                {conviteAceito && (
                  <div
                    role="status"
                    className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-sm font-semibold text-emerald-200"
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
                    className="rounded-xl border border-sky-500/40 bg-sky-500/10 p-4 text-sm font-semibold text-sky-200"
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
    </main>
  );
}
