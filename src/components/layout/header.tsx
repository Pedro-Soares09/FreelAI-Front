'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { freelaiApi } from '@/services/api';
import { Notificacao } from '@/types';

const POLLING_INTERVAL_MS = 15_000;

function resolverRotaNotificacao(n: Notificacao): string {
  switch (n.tipo) {
    case 'escolhido_convite':
      return '/match';
    case 'convite_aceito':
    case 'contrato_pronto':
      return n.referencia_id ? `/chat/${n.referencia_id}` : '/chat';
    case 'pagamento_retido':
    case 'liberacao_pagamento':
      return n.referencia_id ? `/pagamento/${n.referencia_id}` : '/vagas';
    case 'selecionado_top3':
    case 'lembrete_confirmacao':
    case 'avaliacao_pendente':
    default:
      return n.referencia_id ? `/vagas/${n.referencia_id}` : '/vagas';
  }
}

export function Header() {
  const router = useRouter();
  const [aberto, setAberto] = useState(false);
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [naoLidas, setNaoLidas] = useState<number>(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const buscarNotificacoes = useCallback(async () => {
    try {
      const data = await freelaiApi.listarNotificacoes();
      setNotificacoes(data.itens);
      setNaoLidas(data.nao_lidas);
    } catch {
      // Silencia erros de polling em segundo plano
    }
  }, []);

  useEffect(() => {
    buscarNotificacoes();
    const id = setInterval(buscarNotificacoes, POLLING_INTERVAL_MS);
    return () => clearInterval(id);
  }, [buscarNotificacoes]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setAberto(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAbrirNotificacao = async (n: Notificacao) => {
    if (!n.lida) {
      setNotificacoes((prev) =>
        prev.map((item) => (item.id === n.id ? { ...item, lida: true } : item))
      );
      setNaoLidas((prev) => Math.max(0, prev - 1));
      freelaiApi.marcarNotificacaoLida(n.id).catch(() => {});
    }
    setAberto(false);
    router.push(resolverRotaNotificacao(n));
  };

  const handleMarcarTodasLidas = async () => {
    setNotificacoes((prev) => prev.map((n) => ({ ...n, lida: true })));
    setNaoLidas(0);
    try {
      await freelaiApi.marcarTodasNotificacoesLidas();
    } catch {
      // mantém estado otimista
    }
  };

  return (
    <header className="sticky top-0 z-30 border-b border-zinc-800 bg-zinc-950/90 px-4 py-3 backdrop-blur md:px-6">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <Link href="/vagas" className="flex items-center gap-2">
          <span className="text-xl font-black tracking-tight text-white">
            FREEL<span className="text-emerald-400">AI</span>
          </span>
        </Link>

        <nav className="flex items-center gap-4 text-sm font-medium text-zinc-300 md:gap-6">
          <Link href="/vagas" className="hover:text-emerald-400">
            Vagas
          </Link>
          <Link href="/match" className="hover:text-emerald-400">
            Convites
          </Link>
          <Link href="/plano-pro" className="text-emerald-400 hover:underline">
            Plano Pro
          </Link>
          <Link href="/perfil" className="hover:text-emerald-400">
            Perfil
          </Link>
        </nav>

        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            aria-label="Central de notificações"
            onClick={() => setAberto((v) => !v)}
            className="relative rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-zinc-200 hover:border-zinc-700"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            {naoLidas > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-emerald-500 px-1 text-[11px] font-extrabold text-zinc-950">
                {naoLidas > 99 ? '99+' : naoLidas}
              </span>
            )}
          </button>

          {aberto && (
            <div className="absolute right-0 mt-2 w-80 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl sm:w-96">
              <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
                <span className="text-sm font-bold text-white">
                  Notificações ({naoLidas})
                </span>
                {naoLidas > 0 && (
                  <button
                    type="button"
                    onClick={handleMarcarTodasLidas}
                    className="text-xs font-semibold text-emerald-400 hover:underline"
                  >
                    Marcar todas como lidas
                  </button>
                )}
              </div>

              <div className="max-h-96 divide-y divide-zinc-800 overflow-y-auto">
                {notificacoes.length === 0 ? (
                  <p className="p-6 text-center text-xs text-zinc-400">
                    Nenhuma notificação por enquanto.
                  </p>
                ) : (
                  notificacoes.map((n) => (
                    <button
                      key={n.id}
                      type="button"
                      onClick={() => handleAbrirNotificacao(n)}
                      className={`block w-full px-4 py-3 text-left transition hover:bg-zinc-800/70 ${
                        !n.lida ? 'bg-emerald-500/5' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-bold text-white">
                          {n.titulo}
                        </span>
                        {!n.lida && (
                          <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-emerald-400" />
                        )}
                      </div>
                      <p className="mt-0.5 text-xs text-zinc-400">
                        {n.mensagem}
                      </p>
                      <span className="mt-1 block text-[10px] text-zinc-500">
                        {new Date(n.criada_em).toLocaleString('pt-BR')}
                      </span>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
