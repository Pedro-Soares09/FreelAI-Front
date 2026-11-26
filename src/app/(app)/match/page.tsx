'use client';

import { AvisoChuva } from '@/components/shared/aviso-chuva';
import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ContratanteTop3 } from '@/components/match/contratante-top3';
import { Carregando } from '@/components/ui/estados';
import { useSessao } from '@/lib/session';
import { freelaiApi } from '@/services/api';
import { ConviteVaga, Vaga } from '@/types';
import { IconCheck } from '@/components/ui/icons';
import { useConfirmar } from '@/components/ui/confirmar';
import { useToast } from '@/components/ui/toast';

interface ItemConvite {
  convite: ConviteVaga;
  vaga: Vaga;
}

function ProfissionalConvites() {
  const confirmar = useConfirmar();
  const { avisar } = useToast();
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
      !await confirmar(
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
      avisar(e instanceof Error ? e.message : 'Não foi possível aceitar o convite.', 'error');
    } finally {
      setProcessandoId(null);
    }
  };

  const handleRecusar = async (item: ItemConvite) => {
    if (
      !await confirmar(
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
      avisar(e instanceof Error ? e.message : 'Erro ao recusar convite.', 'error');
    } finally {
      setProcessandoId(null);
    }
  };

  if (matchConfirmado) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center p-6 text-center">
        <div className="w-full space-y-5 rounded-3xl border border-primary/50 bg-surface p-8 shadow-2xl shadow-primary/15">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary text-3xl text-primary-fg">
            <IconCheck width={32} height={32} strokeWidth={3} />
          </div>
          <span className="inline-block rounded-full bg-primary/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">
            Match encontrado!
          </span>
          <h1 className="text-2xl font-extrabold text-fg">
            Vaga garantida: {matchConfirmado.vaga.titulo}
          </h1>
          <p className="text-sm text-fg">
            Valor fixado em{' '}
            <strong className="text-primary">
              R$ {matchConfirmado.valorFixado.toFixed(2).replace('.', ',')}
            </strong>
            . O chat e o endereço completo já estão liberados.
          </p>

          <div className="space-y-2.5 pt-2">
            <button
              type="button"
              onClick={() => router.push(`/chat/${matchConfirmado.conversaId}`)}
              className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-primary-fg hover:brightness-110"
            >
              Abrir chat da vaga agora
            </button>
            <button
              type="button"
              onClick={() => router.push(`/vagas/${matchConfirmado.vaga.id}`)}
              className="w-full rounded-xl border border-borda bg-surface-2 py-2.5 text-xs font-semibold text-fg hover:border-primary/60"
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
        <h1 className="text-2xl font-bold text-fg">Meus Convites e Match</h1>
        <p className="text-sm text-muted">
          Quando um contratante escolhe você, o convite fica reservado por 30
          minutos.
        </p>
      </div>

      {loading ? (
        <div className="h-48 animate-pulse rounded-2xl border border-borda bg-surface" />
      ) : erro ? (
        <div className="rounded-2xl border border-danger/40 bg-danger/10 p-4 text-sm text-danger">
          {erro}
        </div>
      ) : itens.length === 0 ? (
        <div className="rounded-2xl border border-borda bg-surface p-8 text-center">
          <p className="text-sm font-medium text-fg">
            Nenhum convite aguardando resposta no momento.
          </p>
          <button
            type="button"
            onClick={() => router.push('/vagas')}
            className="mt-4 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-fg"
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
                    ? 'border-borda bg-surface/50 opacity-75'
                    : 'border-warning/60 bg-surface shadow-lg shadow-warning/10'
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <span className="text-xs font-semibold uppercase text-primary">
                      {vaga.categoria} • {vaga.bairro}
                    </span>
                    <h2 className="mt-1 text-xl font-bold text-fg">
                      {vaga.titulo}
                    </h2>
                    <p className="mt-1 text-xs text-muted">
                      Início em{' '}
                      {new Date(vaga.data_inicio).toLocaleString('pt-BR')} •{' '}
                      {vaga.duracao_horas}h
                    </p>
                    <AvisoChuva
                      categoria={vaga.categoria}
                      titulo={vaga.titulo}
                      lat={vaga.latitude}
            lng={vaga.longitude}
                      inicioIso={vaga.data_inicio}
                    />
                  </div>

                  <div className="rounded-xl border border-borda bg-bg px-4 py-2.5 text-right">
                    <span className="block text-[11px] uppercase text-muted">
                      Tempo restante
                    </span>
                    {expirado ? (
                      <span className="text-sm font-bold text-danger">
                        Convite expirado
                      </span>
                    ) : (
                      <span className="font-mono text-xl font-extrabold text-warning">
                        {String(min).padStart(2, '0')}:
                        {String(seg).padStart(2, '0')}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-xl bg-bg px-4 py-3">
                  <span className="text-xs text-muted">Valor fixado</span>
                  <span className="text-lg font-extrabold text-primary">
                    R$ {valorFixado.toFixed(2).replace('.', ',')}
                  </span>
                </div>

                {expirado ? (
                  <p className="rounded-xl border border-danger/30 bg-danger/10 p-3 text-xs text-danger">
                    O prazo de resposta expirou e a vaga retornou ao contratante.
                  </p>
                ) : (
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <button
                      type="button"
                      disabled={processandoId === convite.id}
                      onClick={() => handleAceitar(item)}
                      className="flex-1 rounded-xl bg-primary py-3 text-sm font-bold text-primary-fg hover:brightness-110 disabled:opacity-50"
                    >
                      {processandoId === convite.id
                        ? 'Confirmando...'
                        : 'Aceitar vaga'}
                    </button>
                    <button
                      type="button"
                      disabled={processandoId === convite.id}
                      onClick={() => handleRecusar(item)}
                      className="rounded-xl border border-borda bg-surface-2 px-5 py-3 text-sm font-semibold text-fg hover:border-primary/60 disabled:opacity-50"
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

export default function MatchPage() {
  const { usuario } = useSessao();

  if (!usuario) return <Carregando rotulo="Carregando perfil" />;

  return usuario.perfil_ativo === 'contratante' ? (
    <ContratanteTop3 />
  ) : (
    <ProfissionalConvites />
  );
}
