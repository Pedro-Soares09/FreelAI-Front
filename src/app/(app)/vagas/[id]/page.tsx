'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { freelaiApi } from '@/services/api';
import { PerfilAtivo, Vaga } from '@/types';
import { CheckinPanel } from '@/components/vagas/checkin-panel';

export default function DetalheVagaPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const vagaId = params.id;

  const [vaga, setVaga] = useState<Vaga | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [perfilAtivo, setPerfilAtivo] = useState<PerfilAtivo>('profissional');

  const [mostrarContraproposta, setMostrarContraproposta] = useState(false);
  const [valorContraproposta, setValorContraproposta] = useState<string>('');
  const [erroForm, setErroForm] = useState<string | null>(null);
  const [enviandoInteresse, setEnviandoInteresse] = useState(false);

  useEffect(() => {
    const salvo = localStorage.getItem('freelai_perfil_ativo');
    if (salvo === 'contratante' || salvo === 'admin') {
      setPerfilAtivo(salvo);
    }
  }, []);

  const carregarVaga = useCallback(async () => {
    setLoading(true);
    setErro(null);
    try {
      const dados = await freelaiApi.obterVaga(vagaId);
      setVaga(dados);
    } catch (e) {
      setErro(
        e instanceof Error ? e.message : 'Erro ao carregar detalhes da vaga.'
      );
    } finally {
      setLoading(false);
    }
  }, [vagaId]);

  useEffect(() => {
    carregarVaga();
  }, [carregarVaga]);

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 p-6">
        <div className="h-10 w-2/3 animate-pulse rounded-xl bg-zinc-800" />
        <div className="h-64 animate-pulse rounded-2xl bg-zinc-900" />
      </div>
    );
  }

  if (erro || !vaga) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 p-6 text-rose-200">
          <p className="font-semibold">{erro || 'Vaga não encontrada.'}</p>
          <button
            type="button"
            onClick={() => router.push('/vagas')}
            className="mt-4 rounded-xl bg-zinc-800 px-4 py-2 text-xs font-semibold text-white"
          >
            Voltar para vagas
          </button>
        </div>
      </div>
    );
  }

  const isProfissionalContratado =
    [
      'aceita',
      'aguardando_pagamento',
      'contratada',
      'em_execucao',
      'aguardando_confirmacao',
      'concluida',
    ].includes(vaga.status) || vaga.meu_convite?.status === 'aceito';

  const limiteMaximoContraproposta = Number((vaga.valor * 1.5).toFixed(2));
  const conviteStatus = vaga.meu_convite?.status;
  const jaEnviouInteresse =
    conviteStatus === 'interessado' ||
    conviteStatus === 'escolhido' ||
    conviteStatus === 'aceito';

  const handleEnviarInteresse = async (e: React.FormEvent) => {
    e.preventDefault();
    setErroForm(null);

    let valorNumerico: number | null = null;
    if (mostrarContraproposta && valorContraproposta.trim() !== '') {
      valorNumerico = Number(valorContraproposta.replace(',', '.'));
      if (Number.isNaN(valorNumerico) || valorNumerico <= 0) {
        setErroForm('Informe um valor numérico válido.');
        return;
      }
      if (valorNumerico > limiteMaximoContraproposta) {
        setErroForm(
          `A contraproposta não pode ultrapassar +50% (máximo R$ ${limiteMaximoContraproposta
            .toFixed(2)
            .replace('.', ',')}).`
        );
        return;
      }
    }

    setEnviandoInteresse(true);
    try {
      const conviteAtualizado = await freelaiApi.manifestarInteresse(
        vaga.id,
        valorNumerico
      );
      setVaga((prev) =>
        prev ? { ...prev, meu_convite: conviteAtualizado } : prev
      );
      setMostrarContraproposta(false);
    } catch (err) {
      setErroForm(
        err instanceof Error
          ? err.message
          : 'Não foi possível registrar seu interesse.'
      );
    } finally {
      setEnviandoInteresse(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 md:p-6">
      <button
        type="button"
        onClick={() => router.back()}
        className="text-xs font-medium text-zinc-400 hover:text-white"
      >
        ← Voltar
      </button>

      <section className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-zinc-800 px-2.5 py-0.5 text-xs font-semibold text-zinc-300">
                {vaga.categoria}
              </span>
              <span
                className={`rounded-md px-2.5 py-0.5 text-xs font-semibold ${
                  vaga.nivel_risco === 'alto'
                    ? 'bg-rose-500/15 text-rose-400'
                    : vaga.nivel_risco === 'medio'
                    ? 'bg-amber-500/15 text-amber-400'
                    : 'bg-emerald-500/15 text-emerald-400'
                }`}
              >
                Risco {vaga.nivel_risco}
              </span>
            </div>
            <h1 className="mt-2 text-2xl font-bold text-white">{vaga.titulo}</h1>
          </div>

          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-right">
            <span className="block text-xs text-emerald-300">Valor ofertado</span>
            <span className="text-2xl font-extrabold text-emerald-400">
              R$ {vaga.valor.toFixed(2).replace('.', ',')}
            </span>
          </div>
        </div>

        <p className="text-sm leading-relaxed text-zinc-300">{vaga.descricao}</p>

        <div className="grid grid-cols-1 gap-3 rounded-xl border border-zinc-800 bg-zinc-950 p-4 sm:grid-cols-2">
          <div>
            <span className="text-xs text-zinc-500">Data e Duração</span>
            <p className="text-sm font-medium text-zinc-200">
              {new Date(vaga.data_inicio).toLocaleString('pt-BR')} •{' '}
              {vaga.duracao_horas}h
            </p>
          </div>

          <div>
            <span className="text-xs text-zinc-500">Localização</span>
            {isProfissionalContratado && vaga.endereco_completo ? (
              <p className="text-sm font-semibold text-emerald-400">
                {vaga.endereco_completo}
              </p>
            ) : (
              <div>
                <p className="text-sm font-medium text-zinc-200">
                  Bairro {vaga.bairro} (~{vaga.distancia_km.toFixed(1)} km)
                </p>
                <span className="text-[11px] text-zinc-500">
                  Endereço completo liberado após o aceite (LGPD).
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-zinc-800 pt-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800 font-bold text-emerald-400">
              {vaga.contratante.nome.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-white">
                  {vaga.contratante.nome}
                </span>
                {vaga.contratante.verificado && (
                  <span className="rounded bg-sky-500/15 px-2 py-0.5 text-xs font-semibold text-sky-400">
                    ✓ Identidade Verificada
                  </span>
                )}
              </div>
              <span className="text-xs text-zinc-400">
                ★ {vaga.contratante.nota_media.toFixed(1)} (
                {vaga.contratante.total_avaliacoes} avaliações)
              </span>
            </div>
          </div>
        </div>
      </section>

      {perfilAtivo === 'profissional' && (
        <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          {jaEnviouInteresse ? (
            <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-400">
                  ✓ Interesse enviado
                </span>
                <p className="mt-1.5 text-sm text-zinc-300">
                  {vaga.meu_convite?.valor_proposto
                    ? `Você enviou uma contraproposta única de R$ ${vaga.meu_convite.valor_proposto
                        .toFixed(2)
                        .replace('.', ',')}.`
                    : 'Você aceitou o valor original da vaga. Aguarde a escolha do contratante.'}
                </p>
              </div>
              {conviteStatus === 'escolhido' && (
                <button
                  type="button"
                  onClick={() => router.push('/match')}
                  className="rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-bold text-zinc-950 hover:bg-amber-400"
                >
                  Ir para o convite (30 min)
                </button>
              )}
            </div>
          ) : (
            <form onSubmit={handleEnviarInteresse} className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-bold text-white">
                    Tem interesse nesta oportunidade?
                  </h2>
                  <p className="text-xs text-zinc-400">
                    Você pode aceitar o valor ofertado ou enviar uma única
                    contraproposta de até +50%.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setMostrarContraproposta((v) => !v);
                    setErroForm(null);
                  }}
                  className="text-xs font-semibold text-emerald-400 hover:underline"
                >
                  {mostrarContraproposta
                    ? 'Usar valor original'
                    : 'Fazer contraproposta (até +50%)'}
                </button>
              </div>

              {mostrarContraproposta && (
                <div className="space-y-2 rounded-xl border border-zinc-800 bg-zinc-950 p-4">
                  <div className="flex items-center justify-between text-xs">
                    <label
                      htmlFor="contraproposta"
                      className="font-medium text-zinc-300"
                    >
                      Seu valor proposto (R$)
                    </label>
                    <span className="text-zinc-400">
                      Limite máximo (+50%):{' '}
                      <strong className="text-emerald-400">
                        R$ {limiteMaximoContraproposta.toFixed(2).replace('.', ',')}
                      </strong>
                    </span>
                  </div>
                  <input
                    id="contraproposta"
                    type="number"
                    step="0.01"
                    min={1}
                    max={limiteMaximoContraproposta}
                    required
                    placeholder={`Ex: ${limiteMaximoContraproposta.toFixed(2)}`}
                    value={valorContraproposta}
                    onChange={(e) => setValorContraproposta(e.target.value)}
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white"
                  />
                  <p className="text-[11px] text-zinc-500">
                    Atenção: apenas uma contraproposta é permitida por convite.
                  </p>
                </div>
              )}

              {erroForm && (
                <p className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-xs text-rose-300">
                  {erroForm}
                </p>
              )}

              <button
                type="submit"
                disabled={enviandoInteresse}
                className="w-full rounded-xl bg-emerald-500 py-3 text-sm font-bold text-zinc-950 hover:bg-emerald-400 disabled:opacity-50"
              >
                {enviandoInteresse
                  ? 'Enviando interesse...'
                  : mostrarContraproposta
                  ? 'Quero esta vaga (com contraproposta)'
                  : 'Quero esta vaga'}
              </button>
            </form>
          )}
        </section>
      )}

      <CheckinPanel
        vaga={vaga}
        perfilAtivo={perfilAtivo}
        onAtualizar={carregarVaga}
      />
    </div>
  );
}
