'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { freelaiApi } from '@/services/api';
import { AssinaturaPro } from '@/types';

export default function PerfilPage() {
  const [assinatura, setAssinatura] = useState<AssinaturaPro | null>(null);
  const [cancelando, setCancelando] = useState(false);
  const [mensagemPro, setMensagemPro] = useState<string | null>(null);

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
      );
  }, []);

  const handleCancelarAssinatura = async () => {
    if (
      !window.confirm(
        'Deseja cancelar a renovação do Plano Pro? Você manterá os benefícios até o fim do período atual.'
      )
    ) {
      return;
    }

    setCancelando(true);
    try {
      const atualizada = await freelaiApi.cancelarPlanoPro();
      setAssinatura(atualizada);
      const dataFormatada = atualizada.valido_ate
        ? new Date(atualizada.valido_ate).toLocaleDateString('pt-BR')
        : 'o fim do ciclo atual';
      setMensagemPro(
        `Renovação cancelada. Seu selo Pro continua válido até ${dataFormatada}.`
      );
    } catch {
      const dataLimite =
        assinatura?.valido_ate ||
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      setAssinatura((prev) =>
        prev
          ? { ...prev, renovacao_automatica: false, valido_ate: dataLimite }
          : null
      );
      setMensagemPro(
        `Renovação cancelada. Seu selo Pro continua válido até ${new Date(
          dataLimite
        ).toLocaleDateString('pt-BR')}.`
      );
    } finally {
      setCancelando(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 md:p-6">
      <div className="flex items-center justify-between rounded-2xl border border-borda bg-surface p-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-fg">Meu Perfil</h1>
            {assinatura?.ativo && (
              <span className="rounded-full bg-primary px-2.5 py-0.5 text-xs font-extrabold uppercase text-primary-fg">
                PRO
              </span>
            )}
          </div>
          <p className="text-sm text-muted">
            Gerencie seus dados, verificações e assinatura FREELAI.
          </p>
        </div>
      </div>

      <section className="space-y-4 rounded-2xl border border-borda bg-surface p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-fg">
              Assinatura Plano Pro
            </h2>
            <p className="text-xs text-muted">
              Selo Pro, destaque visual e prioridade imediata nas notificações.
            </p>
          </div>

          {assinatura?.ativo ? (
            <span className="rounded-full bg-primary/15 px-3 py-1 text-xs font-bold text-primary">
              Ativo
            </span>
          ) : (
            <span className="rounded-full bg-surface-2 px-3 py-1 text-xs font-semibold text-muted">
              Plano Gratuito
            </span>
          )}
        </div>

        {assinatura?.ativo ? (
          <div className="space-y-3 rounded-xl border border-borda bg-bg p-4">
            <p className="text-sm text-fg">
              {assinatura.renovacao_automatica ? (
                <>
                  Assinatura ativa (R$ 19,90/mês). Próxima renovação em{' '}
                  <strong>
                    {assinatura.valido_ate
                      ? new Date(assinatura.valido_ate).toLocaleDateString(
                          'pt-BR'
                        )
                      : '30 dias'}
                  </strong>
                  .
                </>
              ) : (
                <>
                  Assinatura cancelada: seus benefícios Pro permanecem válidos
                  até{' '}
                  <strong className="text-warning">
                    {assinatura.valido_ate
                      ? new Date(assinatura.valido_ate).toLocaleDateString(
                          'pt-BR'
                        )
                      : 'o fim do período pago'}
                  </strong>
                  .
                </>
              )}
            </p>

            {mensagemPro && (
              <p className="rounded-lg bg-warning/10 p-2.5 text-xs text-warning">
                {mensagemPro}
              </p>
            )}

            {assinatura.renovacao_automatica && (
              <button
                type="button"
                disabled={cancelando}
                onClick={handleCancelarAssinatura}
                className="rounded-xl border border-danger/40 bg-danger/10 px-4 py-2 text-xs font-semibold text-danger hover:bg-danger/20 disabled:opacity-50"
              >
                {cancelando ? 'Cancelando...' : 'Cancelar assinatura Pro'}
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col justify-between gap-3 rounded-xl border border-primary/30 bg-primary/5 p-4 sm:flex-row sm:items-center">
            <p className="text-xs text-fg">
              Ative o Plano Pro por <strong>R$ 19,90/mês</strong> para receber
              alertas sem atraso de 2 min e exibir o selo Pro.
            </p>
            <Link
              href="/plano-pro"
              className="shrink-0 rounded-xl bg-primary px-4 py-2 text-center text-xs font-bold text-primary-fg hover:bg-primary"
            >
              Conhecer Plano Pro
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
