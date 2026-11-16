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
          ? 'border-amber-500/70 bg-amber-500/10 shadow-lg shadow-amber-500/10'
          : isContratantePro
          ? 'border-emerald-500/50 bg-zinc-900 shadow-md shadow-emerald-500/5'
          : 'border-zinc-800 bg-zinc-900 hover:border-zinc-700'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-zinc-800 px-2 py-0.5 text-xs font-medium text-zinc-300">
              {vaga.categoria}
            </span>
            <span className="text-xs text-zinc-400">
              {vaga.bairro} • ~{vaga.distancia_km.toFixed(1)} km
            </span>
            {isContratantePro && (
              <span className="rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-zinc-950">
                PRO
              </span>
            )}
          </div>
          <h3 className="mt-1.5 text-base font-bold text-white">{vaga.titulo}</h3>
        </div>

        <div className="text-right">
          <span className="text-lg font-extrabold text-emerald-400">
            R$ {vaga.valor.toFixed(2).replace('.', ',')}
          </span>
          <p className="text-xs text-zinc-400">{vaga.duracao_horas}h</p>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-zinc-800/80 pt-3">
        <div className="flex items-center gap-2 text-xs text-zinc-400">
          <span>{vaga.contratante.nome}</span>
          {vaga.contratante.verificado && (
            <span className="rounded bg-sky-500/15 px-1.5 py-0.5 text-[11px] font-semibold text-sky-400">
              ✓ Verificado
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isConvitePendente && (
            <Link
              href="/match"
              className="rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-bold text-zinc-950 hover:bg-amber-400"
            >
              Responder convite
            </Link>
          )}
          {isInteresseEnviado && (
            <span className="rounded-lg bg-emerald-500/15 px-2.5 py-1 text-xs font-semibold text-emerald-400">
              Interesse enviado
            </span>
          )}
          <Link
            href={`/vagas/${vaga.id}`}
            className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-zinc-700"
          >
            Ver detalhes
          </Link>
        </div>
      </div>
    </article>
  );
}
