'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { freelaiApi } from '@/services/api';
import { PagamentoPix, StatusPagamento } from '@/types';

const statusConfig: Record<
  StatusPagamento,
  { label: string; classes: string }
> = {
  aguardando: { label: 'Aguardando pagamento', classes: 'bg-amber-500/15 text-amber-300' },
  retido: { label: 'Valor retido', classes: 'bg-sky-500/15 text-sky-300' },
  liberado: { label: 'Liberado', classes: 'bg-emerald-500/15 text-emerald-300' },
  parcial: { label: 'Pagamento parcial', classes: 'bg-violet-500/15 text-violet-300' },
  estornado: { label: 'Estornado', classes: 'bg-rose-500/15 text-rose-300' },
  expirado: { label: 'Pix expirado', classes: 'bg-zinc-700 text-zinc-300' },
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
        process.env.NEXT_PUBLIC_USE_MOCKS !== 'false' ||
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
        <div className="h-96 animate-pulse rounded-3xl border border-zinc-800 bg-zinc-900" />
      </div>
    );
  }

  if (erro || !pagamento) {
    return (
      <div className="mx-auto max-w-4xl p-6">
        <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 p-5 text-rose-200">
          {erro || 'Pagamento não encontrado.'}
        </div>
      </div>
    );
  }

  if (pagamento.status === 'expirado') {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-lg items-center p-6">
        <div className="w-full rounded-3xl border border-rose-500/40 bg-zinc-900 p-7 text-center">
          <span className="rounded-full bg-rose-500/15 px-3 py-1 text-xs font-bold text-rose-300">
            Pix expirado
          </span>
          <h1 className="mt-4 text-2xl font-bold text-white">
            Tempo esgotado
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
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
        <Link href="/vagas" className="text-xs text-zinc-400 hover:text-white">
          ← Voltar ao painel
        </Link>
        <span className={`rounded-full px-3 py-1 text-xs font-bold ${config.classes}`}>
          {config.label}
        </span>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.3fr_0.7fr]">
        <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-5 md:p-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Pagamento Pix
              </p>
              <h1 className="mt-1 text-2xl font-bold text-white">
                Cobrança da vaga
              </h1>
            </div>
            {pagamento.status === 'aguardando' && (
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-right">
                <span className="block text-[10px] uppercase text-amber-300">
                  Expira em
                </span>
                <strong className="font-mono text-lg text-amber-300">
                  {String(minutos).padStart(2, '0')}:
                  {String(restoSegundos).padStart(2, '0')}
                </strong>
              </div>
            )}
          </div>

          {pagamento.status === 'aguardando' ? (
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <div className="flex items-center justify-center rounded-2xl border border-zinc-800 bg-white p-5">
                <div className="grid h-48 w-48 grid-cols-7 gap-1 bg-white p-3">
                  {Array.from({ length: 49 }).map((_, index) => (
                    <span
                      key={index}
                      className={
                        (index * 7 + 3) % 11 < 5
                          ? 'rounded-sm bg-zinc-950'
                          : 'rounded-sm bg-white'
                      }
                    />
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <p className="text-sm text-zinc-300">
                  Escaneie o QR fictício ou copie o código.
                </p>
                <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-3">
                  <code className="block break-all text-[11px] text-zinc-400">
                    {pagamento.copia_e_cola}
                  </code>
                </div>
                <button
                  type="button"
                  onClick={() => navigator.clipboard?.writeText(pagamento.copia_e_cola)}
                  className="w-full rounded-xl border border-zinc-700 py-2.5 text-xs font-bold text-zinc-200"
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
            <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
              <p className="text-sm text-zinc-300">
                {pagamento.status === 'retido'
                  ? 'Pagamento confirmado. O valor está retido até a conclusão e validação.'
                  : pagamento.status === 'liberado'
                  ? 'Valor liberado após a validação facial.'
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
                className="rounded-xl border border-zinc-800 px-2 py-3 text-xs text-zinc-500"
              >
                {metodo}
                <span className="mt-1 block text-[10px]">{aviso}</span>
              </button>
            ))}
          </div>
        </section>

        <aside className="space-y-4">
          <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
            <h2 className="font-bold text-white">Resumo</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between text-zinc-400">
                <dt>Total</dt>
                <dd className="text-white">
                  R$ {pagamento.total.toFixed(2).replace('.', ',')}
                </dd>
              </div>
              <div className="flex justify-between text-zinc-400">
                <dt>Taxa FREELAI</dt>
                <dd className="text-amber-300">
                  R$ {pagamento.taxa.toFixed(2).replace('.', ',')}
                </dd>
              </div>
              <div className="flex justify-between border-t border-zinc-800 pt-3 font-bold">
                <dt className="text-zinc-300">Líquido profissional</dt>
                <dd className="text-emerald-400">
                  R$ {pagamento.liquido.toFixed(2).replace('.', ',')}
                </dd>
              </div>
            </dl>
          </section>

          {(validar || pagamento.status === 'retido' || pagamento.status === 'liberado') && (
            <section className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-5">
              <h2 className="font-bold text-white">Validação facial</h2>
              <p className="mt-2 text-xs leading-relaxed text-zinc-400">
                A selfie valida a conclusão e libera o valor. Não é o pagamento.
                Prazo de revisão: 48h. Após 72h, a plataforma aplica a decisão automática.
              </p>

              {!pagamento.conclusao_confirmada ? (
                <button
                  type="button"
                  disabled
                  className="mt-4 w-full rounded-xl bg-zinc-800 py-2.5 text-xs font-bold text-zinc-500"
                >
                  Validação bloqueada
                </button>
              ) : !pagamento.liberacao_validada ? (
                <div className="mt-4 space-y-3">
                  <div className="flex h-36 items-center justify-center rounded-xl border border-dashed border-zinc-700 bg-zinc-950 text-4xl">
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
                <p className="mt-3 rounded-lg bg-zinc-950 p-2.5 text-xs text-zinc-300">
                  Prazo restante informado pela API:{' '}
                  {new Date(pagamento.liberacao_prazo_em).toLocaleString('pt-BR')}
                </p>
              )}

              {validacaoMensagem && (
                <p className="mt-3 rounded-lg bg-emerald-500/10 p-2.5 text-xs text-emerald-300">
                  {validacaoMensagem}
                </p>
              )}
            </section>
          )}

          {pagamento.lancamentos.length > 0 && (
            <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
              <h2 className="font-bold text-white">Extrato da vaga</h2>
              <div className="mt-3 space-y-2">
                {pagamento.lancamentos.map((lancamento) => (
                  <div
                    key={lancamento.tipo}
                    className="flex items-center justify-between rounded-lg bg-zinc-950 p-3 text-xs"
                  >
                    <span className="text-zinc-400">{lancamento.descricao}</span>
                    <strong className="text-emerald-400">
                      R$ {lancamento.valor.toFixed(2).replace('.', ',')}
                    </strong>
                  </div>
                ))}
              </div>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}
