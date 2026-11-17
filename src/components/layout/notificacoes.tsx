"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { freelaiApi } from "@/services/api";
import type { Notificacao } from "@/types";

const INTERVALO_POLLING_MS = 15_000;

function rotaDaNotificacao(n: Notificacao): string {
  switch (n.tipo) {
    case "escolhido_convite":
      return "/match";
    case "convite_aceito":
    case "contrato_pronto":
      return n.referencia_id ? `/chat/${n.referencia_id}` : "/chat";
    case "pagamento_retido":
    case "liberacao_pagamento":
      return n.referencia_id ? `/pagamento/${n.referencia_id}` : "/vagas";
    default:
      return n.referencia_id ? `/vagas/${n.referencia_id}` : "/vagas";
  }
}

function IconeSino() {
  return (
    <svg
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
      />
    </svg>
  );
}

export function Notificacoes() {
  const router = useRouter();
  const [aberto, setAberto] = useState(false);
  const [itens, setItens] = useState<Notificacao[]>([]);
  const [naoLidas, setNaoLidas] = useState(0);
  const caixa = useRef<HTMLDivElement>(null);

  const buscar = useCallback(async () => {
    try {
      const dados = await freelaiApi.listarNotificacoes();
      setItens(dados.itens);
      setNaoLidas(dados.nao_lidas);
    } catch {
      /* falhas do polling em segundo plano não interrompem a tela */
    }
  }, []);

  useEffect(() => {
    void buscar();
    const id = setInterval(buscar, INTERVALO_POLLING_MS);
    return () => clearInterval(id);
  }, [buscar]);

  useEffect(() => {
    if (!aberto) return;
    function aoClicarFora(e: MouseEvent) {
      if (caixa.current && !caixa.current.contains(e.target as Node)) setAberto(false);
    }
    function aoTeclar(e: KeyboardEvent) {
      if (e.key === "Escape") setAberto(false);
    }
    document.addEventListener("mousedown", aoClicarFora);
    document.addEventListener("keydown", aoTeclar);
    return () => {
      document.removeEventListener("mousedown", aoClicarFora);
      document.removeEventListener("keydown", aoTeclar);
    };
  }, [aberto]);

  function abrir(n: Notificacao) {
    if (!n.lida) {
      setItens((prev) => prev.map((i) => (i.id === n.id ? { ...i, lida: true } : i)));
      setNaoLidas((prev) => Math.max(0, prev - 1));
      freelaiApi.marcarNotificacaoLida(n.id).catch(() => {});
    }
    setAberto(false);
    router.push(rotaDaNotificacao(n));
  }

  async function marcarTodas() {
    setItens((prev) => prev.map((n) => ({ ...n, lida: true })));
    setNaoLidas(0);
    try {
      await freelaiApi.marcarTodasNotificacoesLidas();
    } catch {
      /* mantém o estado otimista */
    }
  }

  return (
    <div className="relative" ref={caixa}>
      <button
        type="button"
        aria-label={`Central de notificações${naoLidas > 0 ? `, ${naoLidas} não lidas` : ""}`}
        aria-expanded={aberto}
        aria-haspopup="true"
        onClick={() => setAberto((v) => !v)}
        className="relative rounded-lg border border-borda p-2 text-muted hover:text-fg"
      >
        <IconeSino />
        {naoLidas > 0 && (
          <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-1 text-[11px] font-extrabold text-primary-fg">
            {naoLidas > 99 ? "99+" : naoLidas}
          </span>
        )}
      </button>

      {aberto && (
        <div className="absolute right-0 z-40 mt-2 w-80 overflow-hidden rounded-card border border-borda bg-surface shadow-2xl sm:w-96">
          <div className="flex items-center justify-between border-b border-borda px-4 py-3">
            <span className="text-sm font-bold">Notificações ({naoLidas})</span>
            {naoLidas > 0 && (
              <button
                type="button"
                onClick={marcarTodas}
                className="text-xs font-semibold text-primary hover:underline"
              >
                Marcar todas como lidas
              </button>
            )}
          </div>
          <div className="max-h-96 divide-y divide-borda overflow-y-auto">
            {itens.length === 0 ? (
              <p className="p-6 text-center text-xs text-muted">Nenhuma notificação por enquanto.</p>
            ) : (
              itens.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => abrir(n)}
                  className={`block w-full px-4 py-3 text-left transition hover:bg-surface-2 ${
                    n.lida ? "" : "bg-primary/5"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-bold">{n.titulo}</span>
                    {!n.lida && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />}
                  </div>
                  <p className="mt-0.5 text-xs text-muted">{n.mensagem}</p>
                  <span className="mt-1 block text-[10px] text-muted">
                    {new Date(n.criada_em).toLocaleString("pt-BR")}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
