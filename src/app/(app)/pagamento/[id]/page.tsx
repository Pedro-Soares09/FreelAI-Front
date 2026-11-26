'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { freelaiApi, getAgreementStatus } from '@/services/api';
import { ComprovantesPanel } from '@/components/pagamento/comprovantes-panel';
import { PagamentoPix, StatusPagamento } from '@/types';
import { MODO_DEMO, USE_MOCKS } from '@/lib/modo';

const statusConfig: Record<
  StatusPagamento,
  { label: string; classes: string }
> = {
  aguardando: { label: 'Aguardando pagamento', classes: 'bg-amber-500/15 text-warning' },
  retido: { label: 'Valor retido', classes: 'bg-sky-500/15 text-info' },
  liberado: { label: 'Liberado', classes: 'bg-emerald-500/15 text-success' },
  parcial: { label: 'Pagamento parcial', classes: 'bg-violet-500/15 text-primary' },
  estornado: { label: 'Estornado', classes: 'bg-rose-500/15 text-danger' },
  expirado: { label: 'Pix expirado', classes: 'bg-surface-2 text-fg' },
};

export default function PaymentPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const vagaId = params.id;
  const validar = searchParams.get('validar') === '1';

  const [pagamento, setPagamento] = useState<PagamentoPix | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [segundos, setSegundos] = useState(15 * 60);
  const [modoDemo, setModoDemo] = useState(false);
  const [validando, setValidando] = useState(false);
  const [validacaoMensagem, setValidacaoMensagem] = useState<string | null>(null);
  const [emAnalise, setEmAnalise] = useState(false);

  useEffect(() => {
    let ativo = true;
    getAgreementStatus(vagaId)
      .then((acordo) => {
        if (ativo) setEmAnalise(acordo?.status === 'contested');
      })
      .catch(() => undefined);
    return () => {
      ativo = false;
    };
  }, [vagaId]);

  const carregar = useCallback(async () => {
    setLoading(true);
    setErro(null);
    try {
      setPagamento(await freelaiApi.obterPagamentoPix(vagaId));
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao carregar pagamento.');
    } finally {
      setLoading(false);
    }
  }, [vagaId]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  useEffect(() => {
    setModoDemo(
      localStorage.getItem('freelai_perfil_demo') === 'true' ||
        MODO_DEMO ||
        USE_MOCKS ||
        process.env.NODE_ENV !== 'production'
    );
  }, []);

  useEffect(() => {
    if (!pagamento) return;
    const tick = () => {
      const restante = Math.max(
        0,
        Math.floor((new Date(pagamento.prazo_em).getTime() - Date.now()) / 1000)
      );
      setSegundos(restante);
      if (restante === 0 && pagamento.status === 'aguardando') {
        setPagamento((prev) => (prev ? { ...prev, status: 'expirado' } : prev));
      }
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [pagamento]);

  const simularPagamento = async () => {
    if (!modoDemo) return;
    try {
      setPagamento(await freelaiApi.simularPagamentoPix(vagaId));
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao simular pagamento.');
    }
  };

  const validarFacial = async () => {
    if (emAnalise) {
      setValidacaoMensagem(
        'Serviço em análise: a liberação fica bloqueada até a decisão da equipe FREELAÍ.'
      );
      return;
    }
    if (!pagamento?.conclusao_confirmada) {
      setValidacaoMensagem(
        'Sem conclusão confirmada, a validação facial não está liberada.'
      );
      return;
    }
    setValidando(true);
    setValidacaoMensagem(null);
    try {
      const resultado = await freelaiApi.validarLiberacaoFacial(vagaId);
      setValidacaoMensagem(resultado.mensagem);
      setPagamento((prev) =>
        prev
          ? {
              ...prev,
              status: 'liberado',
              liberacao_validada: true,
              liberacao_prazo_em: resultado.prazo_em,
              lancamentos: resultado.lancamentos,
            }
          : prev
      );
    } catch (e) {
      setValidacaoMensagem(
        e instanceof Error ? e.message : 'Falha na validação facial.'
      );
    } finally {
      setValidando(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl p-6">
        <div className="h-96 animate-pulse rounded-3xl border border-borda bg-surface" />
      </div>
    );
  }

  if (erro || !pagamento) {
    return (
      <div className="mx-auto max-w-4xl p-6">
        <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 p-5 text-danger">
          {erro || 'Pagamento não encontrado.'}
        </div>
      </div>
    );
  }

  if (pagamento.status === 'expirado') {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-lg items-center p-6">
        <div className="w-full rounded-3xl border border-rose-500/40 bg-surface p-7 text-center">
          <span className="rounded-full bg-rose-500/15 px-3 py-1 text-xs font-bold text-danger">
            Pix expirado
          </span>
          <h1 className="mt-4 text-2xl font-bold text-fg">
            Tempo esgotado
          </h1>
          <p className="mt-2 text-sm text-muted">
            O prazo de 15 minutos terminou. Gere uma nova cobrança pelo painel.
          </p>
          <button
            type="button"
            onClick={() => router.push('/vagas')}
            className="mt-6 w-full rounded-xl bg-emerald-500 py-3 text-sm font-bold text-zinc-950"
          >
            Voltar ao painel
          </button>
        </div>
      </div>
    );
  }

  const minutos = Math.floor(segundos / 60);
  const restoSegundos = segundos % 60;
  const config = statusConfig[pagamento.status];

  return (
    <div className="mx-auto max-w-5xl space-y-5 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <Link href="/vagas" className="text-xs text-muted hover:text-fg">
          ← Voltar ao painel
        </Link>
        <span className={`rounded-full px-3 py-1 text-xs font-bold ${config.classes}`}>
          {config.label}
        </span>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.3fr_0.7fr]">
        <section className="rounded-3xl border border-borda bg-surface p-5 md:p-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-success">
                Pagamento Pix
              </p>
              <h1 className="mt-1 text-2xl font-bold text-fg">
                Pagamento do serviço
              </h1>
              <p className="mt-1 text-xs text-muted">
                O pagamento é feito depois da conclusão do serviço, conforme o acordo.
              </p>
            </div>
            {pagamento.status === 'aguardando' && (
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-right">
                <span className="block text-[10px] uppercase text-warning">
                  Expira em
                </span>
                <strong className="font-mono text-lg text-warning">
                  {String(minutos).padStart(2, '0')}:
                  {String(restoSegundos).padStart(2, '0')}
                </strong>
              </div>
            )}
          </div>

          {pagamento.status === 'aguardando' ? (
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <div className="flex items-center justify-center rounded-2xl border border-borda bg-white p-5">
                <div className="grid h-48 w-48 grid-cols-7 gap-1 bg-white p-3">
                  {Array.from({ length: 49 }).map((_, index) => (
                    <span
                      key={index}
                      className={
                        (index * 7 + 3) % 11 < 5
                          ? 'rounded-sm bg-bg'
                          : 'rounded-sm bg-white'
                      }
                    />
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <p className="text-sm text-fg">
                  Escaneie o QR fictício ou copie o código.
                </p>
                <div className="rounded-xl border border-borda bg-bg p-3">
                  <code className="block break-all text-[11px] text-muted">
                    {pagamento.copia_e_cola}
                  </code>
                </div>
                <button
                  type="button"
                  onClick={() => navigator.clipboard?.writeText(pagamento.copia_e_cola)}
                  className="w-full rounded-xl border border-borda py-2.5 text-xs font-bold text-fg"
                >
                  Copiar código Pix
                </button>
                {modoDemo && (
                  <button
                    type="button"
                    onClick={simularPagamento}
                    className="w-full rounded-xl bg-emerald-500 py-2.5 text-xs font-bold text-zinc-950"
                  >
                    Simular pagamento
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-borda bg-bg p-5">
              <p className="text-sm text-fg">
                {pagamento.status === 'retido'
                  ? 'Pagamento confirmado. O valor está retido até a conclusão e validação.'
                  : pagamento.status === 'liberado'
                  ? 'Pagamento confirmado. O valor foi liberado ao profissional.'
                  : 'O estado atual da cobrança é exibido neste painel.'}
              </p>
            </div>
          )}

          <div className="mt-5 grid grid-cols-3 gap-2">
            {[
              ['Cartão', 'Em breve'],
              ['Débito', 'Em breve'],
              ['Boleto', 'Em breve'],
            ].map(([metodo, aviso]) => (
              <button
                key={metodo}
                type="button"
                disabled
                className="rounded-xl border border-borda px-2 py-3 text-xs text-muted"
              >
                {metodo}
                <span className="mt-1 block text-[10px]">{aviso}</span>
              </button>
            ))}
          </div>
        </section>

        <aside className="space-y-4">
          <section className="rounded-2xl border border-borda bg-surface p-5">
            <h2 className="font-bold text-fg">Resumo</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between text-muted">
                <dt>Total</dt>
                <dd className="text-fg">
                  R$ {pagamento.total.toFixed(2).replace('.', ',')}
                </dd>
              </div>
              <div className="flex justify-between text-muted">
                <dt>Taxa FREELAI</dt>
                <dd className="text-warning">
                  R$ {pagamento.taxa.toFixed(2).replace('.', ',')}
                </dd>
              </div>
              <div className="flex justify-between border-t border-borda pt-3 font-bold">
                <dt className="text-fg">Líquido profissional</dt>
                <dd className="text-success">
                  R$ {pagamento.liquido.toFixed(2).replace('.', ',')}
                </dd>
              </div>
            </dl>
          </section>

          {(validar || pagamento.status === 'retido') && (
            <section className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-5">
              <h2 className="font-bold text-fg">Validação facial</h2>
              <p className="mt-2 text-xs leading-relaxed text-muted">
                A selfie valida a conclusão e libera o valor. Não é o pagamento.
                Prazo de revisão: 48h. Após 72h, a plataforma aplica a decisão automática.
              </p>

              {emAnalise && (
                <p className="mt-4 rounded-lg bg-amber-500/10 p-2.5 text-xs text-warning">
                  Em análise: a contestação do serviço bloqueia a liberação até a decisão da equipe FREELAÍ.
                </p>
              )}

              {!pagamento.conclusao_confirmada || emAnalise ? (
                <button
                  type="button"
                  disabled
                  className="mt-4 w-full rounded-xl bg-surface-2 py-2.5 text-xs font-bold text-muted"
                >
                  {emAnalise ? 'Liberação em análise' : 'Validação bloqueada'}
                </button>
              ) : !pagamento.liberacao_validada ? (
                <div className="mt-4 space-y-3">
                  <div className="flex h-36 items-center justify-center rounded-xl border border-dashed border-borda bg-bg text-4xl">
                    ◉
                  </div>
                  <button
                    type="button"
                    disabled={validando}
                    onClick={validarFacial}
                    className="w-full rounded-xl bg-emerald-500 py-2.5 text-xs font-bold text-zinc-950 disabled:opacity-50"
                  >
                    {validando ? 'Enviando selfie...' : 'Capturar e validar selfie'}
                  </button>
                </div>
              ) : null}

              {pagamento.liberacao_prazo_em && (
                <p className="mt-3 rounded-lg bg-bg p-2.5 text-xs text-fg">
                  Prazo restante informado pela API:{' '}
                  {new Date(pagamento.liberacao_prazo_em).toLocaleString('pt-BR')}
                </p>
              )}

              {validacaoMensagem && (
                <p className="mt-3 rounded-lg bg-emerald-500/10 p-2.5 text-xs text-success">
                  {validacaoMensagem}
                </p>
              )}
            </section>
          )}

          {pagamento.lancamentos.length > 0 && (
            <section className="rounded-2xl border border-borda bg-surface p-5">
              <h2 className="font-bold text-fg">Extrato da vaga</h2>
              <div className="mt-3 space-y-2">
                {pagamento.lancamentos.map((lancamento) => (
                  <div
                    key={lancamento.tipo}
                    className="flex items-center justify-between rounded-lg bg-bg p-3 text-xs"
                  >
                    <span className="text-muted">{lancamento.descricao}</span>
                    <strong className="text-success">
                      R$ {lancamento.valor.toFixed(2).replace('.', ',')}
                    </strong>
                  </div>
                ))}
              </div>
            </section>
          )}

          <ComprovantesPanel vagaId={vagaId} souContratante />
        </aside>
      </div>
    </div>
  );
}
