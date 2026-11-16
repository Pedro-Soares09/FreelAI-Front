'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { freelaiApi } from '@/services/api';
import { AssinaturaPro } from '@/types';

export default function PlanoProPage() {
  const router = useRouter();
  const [assinatura, setAssinatura] = useState<AssinaturaPro | null>(null);
  const [loading, setLoading] = useState(true);
  const [processando, setProcessando] = useState(false);

  useEffect(() => {
    freelaiApi
      .obterAssinaturaPro()
      .then(setAssinatura)
      .catch(() =>
        setAssinatura({
          ativo: false,
          valor_mensal: 19.9,
          valido_ate: null,
          renovacao_automatica: false,
        })
      )
      .finally(() => setLoading(false));
  }, []);

  const handleAssinar = async () => {
    setProcessando(true);
    try {
      const novaAssinatura = await freelaiApi.assinarPlanoPro();
      setAssinatura(novaAssinatura);
      router.push('/perfil');
    } catch {
      const validade = new Date(
        Date.now() + 30 * 24 * 60 * 60 * 1000
      ).toISOString();
      setAssinatura({
        ativo: true,
        valor_mensal: 19.9,
        valido_ate: validade,
        renovacao_automatica: true,
      });
      router.push('/perfil');
    } finally {
      setProcessando(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4 md:p-8">
      <div className="rounded-3xl border border-emerald-500/40 bg-zinc-900 p-8 shadow-2xl shadow-emerald-500/10">
        <span className="inline-block rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 px-3 py-1 text-xs font-extrabold uppercase text-zinc-950">
          FREELAI PRO
        </span>

        <h1 className="mt-4 text-3xl font-extrabold text-white">
          Destaque seu perfil e receba alertas imediatos
        </h1>
        <p className="mt-2 text-sm text-zinc-300">
          Seu próximo freela está aqui. Com o Plano Pro, você ganha visibilidade
          visual e prioridade no envio de notificações.
        </p>

        <div className="my-6 flex items-baseline gap-1 border-y border-zinc-800 py-5">
          <span className="text-4xl font-black text-emerald-400">R$ 19,90</span>
          <span className="text-sm text-zinc-400">/ mês (Pix simulado)</span>
        </div>

        <ul className="space-y-3 text-sm text-zinc-200">
          <li className="flex items-center gap-2.5">
            <span className="text-emerald-400">✓</span>
            <span>
              <strong>Selo Pro</strong> exibido no seu perfil e nos cards de
              oportunidade.
            </span>
          </li>
          <li className="flex items-center gap-2.5">
            <span className="text-emerald-400">✓</span>
            <span>
              <strong>Prioridade de notificação:</strong> alertas imediatos sem o
              atraso padrão de 2 minutos.
            </span>
          </li>
          <li className="flex items-center gap-2.5">
            <span className="text-emerald-400">✓</span>
            <span>
              <strong>Destaque visual</strong> na apresentação do perfil para
              contratantes.
            </span>
          </li>
        </ul>

        <p className="mt-4 rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-xs text-zinc-400">
          Transparência FREELAI: o Plano Pro não altera o algoritmo de ranking
          do match (40% localização, 30% habilidades, 20% reputação, 10% preço).
        </p>

        <div className="mt-6">
          {loading ? (
            <div className="h-12 animate-pulse rounded-xl bg-zinc-800" />
          ) : assinatura?.ativo ? (
            <div className="space-y-3">
              <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3 text-center text-sm font-semibold text-emerald-300">
                Você já é assinante Plano Pro!
              </div>
              <button
                type="button"
                onClick={() => router.push('/perfil')}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-800 py-3 text-sm font-semibold text-white"
              >
                Gerenciar assinatura no Perfil
              </button>
            </div>
          ) : (
            <button
              type="button"
              disabled={processando}
              onClick={handleAssinar}
              className="w-full rounded-xl bg-emerald-500 py-3.5 text-sm font-extrabold text-zinc-950 hover:bg-emerald-400 disabled:opacity-50"
            >
              {processando
                ? 'Processando assinatura Pix...'
                : 'Assinar Plano Pro agora'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
