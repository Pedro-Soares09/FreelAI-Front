'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { freelaiApi } from '@/services/api';
import { ConviteVaga, Vaga } from '@/types';

interface ItemConvite {
  convite: ConviteVaga;
  vaga: Vaga;
}

export default function MatchConvitePage() {
  const router = useRouter();
  const [itens, setItens] = useState<ItemConvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [agoraMs, setAgoraMs] = useState<number>(() => Date.now());
  const [processandoId, setProcessandoId] = useState<string | null>(null);

  const [matchConfirmado, setMatchConfirmado] = useState<{
    vaga: Vaga;
    conversaId: string;
    valorFixado: number;
  } | null>(null);

  const carregarConvites = useCallback(async () => {
    setLoading(true);
    setErro(null);
    try {
      const lista = await freelaiApi.listarConvitesPendentes();
      setItens(lista);
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao carregar convites.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregarConvites();
  }, [carregarConvites]);

  useEffect(() => {
    const timer = setInterval(() => setAgoraMs(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleAceitar = async (item: ItemConvite) => {
    if (
      !window.confirm(
        `Confirmar aceite da vaga "${item.vaga.titulo}"? O chat será aberto imediatamente.`
      )
    ) {
      return;
    }

    setProcessandoId(item.convite.id);
    try {
      const resp = await freelaiApi.aceitarConvite(item.convite.id);
      const valorFixado = item.convite.valor_proposto ?? item.vaga.valor;
      setMatchConfirmado({
        vaga: item.vaga,
        conversaId: resp.conversa_id || item.vaga.id,
        valorFixado,
      });
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Não foi possível aceitar o convite.');
    } finally {
      setProcessandoId(null);
    }
  };

  const handleRecusar = async (item: ItemConvite) => {
    if (
      !window.confirm(
        'Tem certeza que deseja recusar este convite? A vaga voltará para o contratante.'
      )
    ) {
      return;
    }

    setProcessandoId(item.convite.id);
    try {
      await freelaiApi.recusarConvite(item.convite.id);
      setItens((prev) =>
        prev.filter((i) => i.convite.id !== item.convite.id)
      );
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Erro ao recusar convite.');
    } finally {
      setProcessandoId(null);
    }
  };

  if (matchConfirmado) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center p-6 text-center">
        <div className="w-full space-y-5 rounded-3xl border border-emerald-500/50 bg-zinc-900 p-8 shadow-2xl shadow-emerald-500/15">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 text-3xl text-zinc-950">
            ✓
          </div>
          <span className="inline-block rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-400">
            Match encontrado!
          </span>
          <h1 className="text-2xl font-extrabold text-white">
            Vaga garantida: {matchConfirmado.vaga.titulo}
          </h1>
          <p className="text-sm text-zinc-300">
            Valor fixado em{' '}
            <strong className="text-emerald-400">
              R$ {matchConfirmado.valorFixado.toFixed(2).replace('.', ',')}
            </strong>
            . O chat e o endereço completo já estão liberados.
          </p>

          <div className="space-y-2.5 pt-2">
            <button
              type="button"
              onClick={() => router.push(`/chat/${matchConfirmado.conversaId}`)}
              className="w-full rounded-xl bg-emerald-500 py-3 text-sm font-bold text-zinc-950 hover:bg-emerald-400"
            >
              Abrir chat da vaga agora
            </button>
            <button
              type="button"
              onClick={() => router.push(`/vagas/${matchConfirmado.vaga.id}`)}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-800 py-2.5 text-xs font-semibold text-zinc-200 hover:bg-zinc-700"
            >
              Ver endereço completo e detalhes
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Meus Convites e Match</h1>
        <p className="text-sm text-zinc-400">
          Quando um contratante escolhe você, o convite fica reservado por 30
          minutos.
        </p>
      </div>

      {loading ? (
        <div className="h-48 animate-pulse rounded-2xl border border-zinc-800 bg-zinc-900" />
      ) : erro ? (
        <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 p-4 text-sm text-rose-200">
          {erro}
        </div>
      ) : itens.length === 0 ? (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8 text-center">
          <p className="text-sm font-medium text-zinc-300">
            Nenhum convite aguardando resposta no momento.
          </p>
          <button
            type="button"
            onClick={() => router.push('/vagas')}
            className="mt-4 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-zinc-950"
          >
            Explorar vagas no mapa
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {itens.map((item) => {
            const { convite, vaga } = item;
            const prazoMs = convite.prazo_em
              ? new Date(convite.prazo_em).getTime()
              : 0;
            const restanteMs = Math.max(0, prazoMs - agoraMs);
            const expirado =
              convite.status === 'expirado' || (prazoMs > 0 && restanteMs === 0);

            const min = Math.floor(restanteMs / 60_000);
            const seg = Math.floor((restanteMs % 60_000) / 1000);
            const valorFixado = convite.valor_proposto ?? vaga.valor;

            return (
              <article
                key={convite.id}
                className={`space-y-4 rounded-2xl border p-6 ${
                  expirado
                    ? 'border-zinc-800 bg-zinc-900/50 opacity-75'
                    : 'border-amber-500/60 bg-zinc-900 shadow-lg shadow-amber-500/10'
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <span className="text-xs font-semibold uppercase text-emerald-400">
                      {vaga.categoria} • {vaga.bairro}
                    </span>
                    <h2 className="mt-1 text-xl font-bold text-white">
                      {vaga.titulo}
                    </h2>
                    <p className="mt-1 text-xs text-zinc-400">
                      Início em{' '}
                      {new Date(vaga.data_inicio).toLocaleString('pt-BR')} •{' '}
                      {vaga.duracao_horas}h
                    </p>
                  </div>

                  <div className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-right">
                    <span className="block text-[11px] uppercase text-zinc-400">
                      Tempo restante
                    </span>
                    {expirado ? (
                      <span className="text-sm font-bold text-rose-400">
                        Convite expirado
                      </span>
                    ) : (
                      <span className="font-mono text-xl font-extrabold text-amber-400">
                        {String(min).padStart(2, '0')}:
                        {String(seg).padStart(2, '0')}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-xl bg-zinc-950 px-4 py-3">
                  <span className="text-xs text-zinc-400">Valor fixado</span>
                  <span className="text-lg font-extrabold text-emerald-400">
                    R$ {valorFixado.toFixed(2).replace('.', ',')}
                  </span>
                </div>

                {expirado ? (
                  <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
                    O prazo de resposta expirou e a vaga retornou ao contratante.
                  </p>
                ) : (
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <button
                      type="button"
                      disabled={processandoId === convite.id}
                      onClick={() => handleAceitar(item)}
                      className="flex-1 rounded-xl bg-emerald-500 py-3 text-sm font-bold text-zinc-950 hover:bg-emerald-400 disabled:opacity-50"
                    >
                      {processandoId === convite.id
                        ? 'Confirmando...'
                        : 'Aceitar vaga'}
                    </button>
                    <button
                      type="button"
                      disabled={processandoId === convite.id}
                      onClick={() => handleRecusar(item)}
                      className="rounded-xl border border-zinc-700 bg-zinc-800 px-5 py-3 text-sm font-semibold text-zinc-300 hover:bg-zinc-700 disabled:opacity-50"
                    >
                      Recusar
                    </button>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
