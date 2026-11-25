'use client';

import React from 'react';
import Link from 'next/link';
import { Vaga } from '@/types';
import { SeloDestaque, SeloPro } from '@/components/ui/selos';
import { IconCheck } from '@/components/ui/icons';
import { AvatarVerified } from '@/components/shared/avatar-verified';
import { formatCurrency } from '@/lib/format';

interface JobCardProps {
  vaga: Vaga;
  selecionada?: boolean;
}

export function JobCard({ vaga, selecionada = false }: JobCardProps) {
  const conviteStatus = vaga.meu_convite?.status;
  const isConvitePendente = conviteStatus === 'escolhido';
  const isInteresseEnviado = conviteStatus === 'interessado';
  const isContratantePro = Boolean(vaga.contratante?.pro);

  const borda = isConvitePendente
    ? 'border-warning/70 bg-warning/10'
    : selecionada
    ? 'border-primary bg-surface shadow-neon'
    : isContratantePro
    ? 'border-primary/50 bg-surface hover:border-primary'
    : 'border-borda bg-surface hover:border-primary/60';

  return (
    <article className={`rounded-card border p-4 transition ${borda}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="rounded-md bg-surface-2 px-2 py-0.5 text-xs font-medium capitalize text-fg">
              {vaga.categoria}
            </span>
            <span className="text-xs text-muted">
              {vaga.bairro} · cerca de {vaga.distancia_km.toFixed(1).replace('.', ',')} km
            </span>
            {isContratantePro && <SeloPro />}
          </div>
          <h3 className="mt-1.5 text-base font-bold text-fg">
            <Link href={`/vagas/${vaga.id}`} className="hover:text-primary">
              {vaga.titulo}
            </Link>
          </h3>
        </div>

        <div className="shrink-0 text-right">
          <span className="whitespace-nowrap text-lg font-extrabold text-primary">
            {formatCurrency(vaga.valor)}
          </span>
          <p className="text-xs text-muted">{vaga.duracao_horas} h de serviço</p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-t border-borda pt-3">
        <div className="flex min-w-0 items-center gap-2 text-xs text-muted">
          {vaga.contratante.usuario_id ? (
            <Link
              href={`/contratante/${vaga.contratante.usuario_id}`}
              className="flex min-w-0 items-center gap-2 hover:text-primary"
              aria-label={`Ver perfil de ${vaga.contratante.nome}`}
            >
              <AvatarVerified
                name={vaga.contratante.nome}
                imageUrl={vaga.contratante.foto_url}
                cor={vaga.contratante.cor_destaque ?? "lilas"}
                size={24}
              />
              <span className="truncate underline-offset-2 hover:underline">{vaga.contratante.nome}</span>
            </Link>
          ) : (
            <span className="truncate">{vaga.contratante.nome}</span>
          )}
          {vaga.contratante.destaque && <SeloDestaque />}
          {vaga.contratante.verificado && (
            <span className="inline-flex shrink-0 items-center gap-1 rounded bg-info/15 px-1.5 py-0.5 text-[11px] font-semibold text-info">
              <IconCheck width={11} height={11} strokeWidth={3} />
              Verificado
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isConvitePendente && (
            <Link
              href="/match"
              className="whitespace-nowrap rounded-lg bg-warning px-3 py-1.5 text-xs font-bold text-primary-fg hover:brightness-110"
            >
              Responder convite
            </Link>
          )}
          {isInteresseEnviado && (
            <span className="whitespace-nowrap rounded-lg bg-primary/15 px-2.5 py-1 text-xs font-semibold text-primary">
              Interesse enviado
            </span>
          )}
          <Link
            href={`/vagas/${vaga.id}`}
            className="whitespace-nowrap rounded-lg border border-borda bg-surface-2 px-3 py-1.5 text-xs font-semibold text-fg hover:border-primary/60"
          >
            Ver detalhes
          </Link>
        </div>
      </div>
    </article>
  );
}
