"use client";

import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export type Aba = { id: string; rotulo: string; conteudo: ReactNode; contagem?: number };

export function Tabs({ abas, inicial }: { abas: Aba[]; inicial?: string }) {
  const base = useId();
  const [ativa, setAtiva] = useState(inicial ?? abas[0]?.id);
  const botoes = useRef<Record<string, HTMLButtonElement | null>>({});

  function aoTeclar(e: KeyboardEvent, indice: number) {
    let novo = indice;
    if (e.key === "ArrowRight") novo = (indice + 1) % abas.length;
    else if (e.key === "ArrowLeft") novo = (indice - 1 + abas.length) % abas.length;
    else if (e.key === "Home") novo = 0;
    else if (e.key === "End") novo = abas.length - 1;
    else return;
    e.preventDefault();
    setAtiva(abas[novo].id);
    botoes.current[abas[novo].id]?.focus();
  }

  const atual = abas.find((a) => a.id === ativa) ?? abas[0];

  return (
    <div>
      <div role="tablist" aria-label="Seções" className="flex gap-1 border-b border-borda">
        {abas.map((a, i) => {
          const selecionada = a.id === atual.id;
          return (
            <button
              key={a.id}
              ref={(el) => {
                botoes.current[a.id] = el;
              }}
              role="tab"
              type="button"
              id={`${base}-aba-${a.id}`}
              aria-selected={selecionada}
              aria-controls={`${base}-painel-${a.id}`}
              tabIndex={selecionada ? 0 : -1}
              onClick={() => setAtiva(a.id)}
              onKeyDown={(e) => aoTeclar(e, i)}
              className={cn(
                "-mb-px inline-flex items-center gap-2 border-b-2 px-4 py-2 text-sm font-semibold transition",
                selecionada
                  ? "border-primary text-primary"
                  : "border-transparent text-muted hover:text-fg",
              )}
            >
              {a.rotulo}
              {a.contagem !== undefined && (
                <span className="rounded-full bg-surface-2 px-2 text-xs text-fg">{a.contagem}</span>
              )}
            </button>
          );
        })}
      </div>
      <div
        role="tabpanel"
        id={`${base}-painel-${atual.id}`}
        aria-labelledby={`${base}-aba-${atual.id}`}
        tabIndex={0}
        className="pt-6"
      >
        {atual.conteudo}
      </div>
    </div>
  );
}
