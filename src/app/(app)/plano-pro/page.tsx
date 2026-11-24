'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { freelaiApi } from '@/services/api';
import { AssinaturaPro } from '@/types';
import { IconCheck } from '@/components/ui/icons';
import { mensagemDeErro } from '@/api/erro';
import { formatDateTime } from '@/lib/format';

export default function PlanoProPage() {
  const router = useRouter();
  const [assinatura, setAssinatura] = useState<AssinaturaPro | null>(null);
  const [loading, setLoading] = useState(true);
  const [processando, setProcessando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    freelaiApi
      .obterAssinaturaPro()
      .then(setAssinatura)
      .catch((e) => setErro(mensagemDeErro(e)))
      .finally(() => setLoading(false));
  }, []);

  const handleAssinar = async () => {
    setProcessando(true);
    setErro(null);
    try {
      setAssinatura(await freelaiApi.assinarPlanoPro());
    } catch (e) {
      setErro(mensagemDeErro(e));
    } finally {
      setProcessando(false);
    }
  };

  const handleCancelar = async () => {
    setProcessando(true);
    setErro(null);
    try {
      setAssinatura(await freelaiApi.cancelarPlanoPro());
    } catch (e) {
      setErro(mensagemDeErro(e));
    } finally {
      setProcessando(false);
    }
  };

  const valorFormatado = (assinatura?.valor_mensal ?? 0).toFixed(2).replace('.', ',');

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4 md:p-8">
      <div className="rounded-3xl border border-primary/40 bg-surface p-8 shadow-2xl shadow-primary/10">
        <span className="inline-block rounded-full bg-primary px-3 py-1 text-xs font-extrabold uppercase text-primary-fg">
          FREELAI PRO
        </span>

        <h1 className="mt-4 text-3xl font-extrabold text-fg">
          Destaque seu perfil e receba alertas imediatos
        </h1>
        <p className="mt-2 text-sm text-fg">
          Seu próximo freela está aqui. Com o Plano Pro, você ganha visibilidade
          visual e prioridade no envio de notificações.
        </p>

        <div className="my-6 flex items-baseline gap-1 border-y border-borda py-5">
          <span className="text-4xl font-black text-primary">R$ {valorFormatado}</span>
          <span className="text-sm text-muted">/ mês (Pix simulado)</span>
        </div>

        <ul className="space-y-3 text-sm text-fg">
          <li className="flex items-center gap-2.5">
            <IconCheck width={16} height={16} className="text-primary" />
            <span>
              <strong>Selo Pro</strong> exibido no seu perfil e nos cards de
              oportunidade.
            </span>
          </li>
          <li className="flex items-center gap-2.5">
            <IconCheck width={16} height={16} className="text-primary" />
            <span>
              <strong>Prioridade de notificação:</strong> alertas imediatos sem o
              atraso padrão de 2 minutos.
            </span>
          </li>
          <li className="flex items-center gap-2.5">
            <IconCheck width={16} height={16} className="text-primary" />
            <span>
              <strong>Destaque visual</strong> na apresentação do perfil para
              contratantes.
            </span>
          </li>
        </ul>

        <p className="mt-4 rounded-xl border border-borda bg-bg p-3 text-xs text-muted">
          Transparência FREELAI: o Plano Pro não altera o algoritmo de ranking
          do match (40% localização, 30% habilidades, 20% reputação, 10% preço).
        </p>

        {erro && (
          <p role="alert" className="mt-4 rounded-xl border border-danger/40 bg-danger/10 p-3 text-sm text-danger">
            {erro}
          </p>
        )}

        <div className="mt-6">
          {loading ? (
            <div className="h-12 animate-pulse rounded-xl bg-surface-2" />
          ) : assinatura?.ativo ? (
            <div className="space-y-3">
              <div className="rounded-xl border border-primary/40 bg-primary/10 p-3 text-center text-sm font-semibold text-primary">
                {assinatura.renovacao_automatica
                  ? 'Você já é assinante Plano Pro!'
                  : 'Renovação cancelada.'}
                {assinatura.valido_ate && (
                  <span className="block text-xs font-normal">
                    Válido até {formatDateTime(assinatura.valido_ate)}
                  </span>
                )}
              </div>
              {assinatura.renovacao_automatica && (
                <button
                  type="button"
                  disabled={processando}
                  onClick={handleCancelar}
                  className="w-full rounded-xl border border-borda bg-surface-2 py-3 text-sm font-semibold text-fg disabled:opacity-50"
                >
                  Cancelar renovação
                </button>
              )}
              <button
                type="button"
                onClick={() => router.push('/perfil')}
                className="w-full rounded-xl border border-borda bg-surface-2 py-3 text-sm font-semibold text-fg"
              >
                Gerenciar assinatura no Perfil
              </button>
            </div>
          ) : (
            <button
              type="button"
              disabled={processando}
              onClick={handleAssinar}
              className="w-full rounded-xl bg-primary py-3.5 text-sm font-extrabold text-primary-fg hover:brightness-110 disabled:opacity-50"
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
