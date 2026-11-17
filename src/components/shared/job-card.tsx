'use client';

import React from 'react';
import Link from 'next/link';
import { Vaga } from '@/types';

interface JobCardProps {
  vaga: Vaga;
}

export function JobCard({ vaga }: JobCardProps) {
  const conviteStatus = vaga.meu_convite?.status;
  const isConvitePendente = conviteStatus === 'escolhido';
  const isInteresseEnviado = conviteStatus === 'interessado';
  const isContratantePro = Boolean(vaga.contratante?.pro);

  return (
    <article
      className={`rounded-2xl border p-4 transition ${
        isConvitePendente
          ? 'border-warning/70 bg-warning/10 shadow-lg shadow-warning/10'
          : isContratantePro
          ? 'border-primary/50 bg-surface shadow-md shadow-primary/5'
          : 'border-borda bg-surface hover:border-borda'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-surface-2 px-2 py-0.5 text-xs font-medium text-fg">
              {vaga.categoria}
            </span>
            <span className="text-xs text-muted">
              {vaga.bairro} • ~{vaga.distancia_km.toFixed(1)} km
            </span>
            {isContratantePro && (
              <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-primary-fg">
                PRO
              </span>
            )}
          </div>
          <h3 className="mt-1.5 text-base font-bold text-fg">{vaga.titulo}</h3>
        </div>

        <div className="text-right">
          <span className="text-lg font-extrabold text-primary">
            R$ {vaga.valor.toFixed(2).replace('.', ',')}
          </span>
          <p className="text-xs text-muted">{vaga.duracao_horas}h</p>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-borda/80 pt-3">
        <div className="flex items-center gap-2 text-xs text-muted">
          <span>{vaga.contratante.nome}</span>
          {vaga.contratante.verificado && (
            <span className="rounded bg-info/15 px-1.5 py-0.5 text-[11px] font-semibold text-info">
              Verificado
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isConvitePendente && (
            <Link
              href="/match"
              className="rounded-lg bg-warning px-3 py-1.5 text-xs font-bold text-primary-fg hover:bg-warning"
            >
              Responder convite
            </Link>
          )}
          {isInteresseEnviado && (
            <span className="rounded-lg bg-primary/15 px-2.5 py-1 text-xs font-semibold text-primary">
              Interesse enviado
            </span>
          )}
          <Link
            href={`/vagas/${vaga.id}`}
            className="rounded-lg border border-borda bg-surface-2 px-3 py-1.5 text-xs font-semibold text-fg hover:bg-surface-2"
          >
            Ver detalhes
          </Link>
        </div>
      </div>
    </article>
  );
}
