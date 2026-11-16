"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { IconClose } from "./icons";

type ModalProps = {
  aberto: boolean;
  titulo: string;
  onFechar: () => void;
  children: ReactNode;
  rodape?: ReactNode;
};

const FOCAVEIS =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

export function Modal({ aberto, titulo, onFechar, children, rodape }: ModalProps) {
  const tituloId = useId();
  const caixa = useRef<HTMLDivElement>(null);
  const fechar = useRef(onFechar);

  useEffect(() => {
    fechar.current = onFechar;
  }, [onFechar]);

  useEffect(() => {
    if (!aberto) return;
    const anterior = document.activeElement as HTMLElement | null;
    const primeiro = caixa.current?.querySelector<HTMLElement>(FOCAVEIS);
    (primeiro ?? caixa.current)?.focus();

    function aoTeclar(e: KeyboardEvent) {
      if (e.key === "Escape") {
        fechar.current();
        return;
      }
      if (e.key !== "Tab" || !caixa.current) return;
      const itens = Array.from(caixa.current.querySelectorAll<HTMLElement>(FOCAVEIS));
      if (itens.length === 0) return;
      const inicio = itens[0];
      const fim = itens[itens.length - 1];
      if (e.shiftKey && document.activeElement === inicio) {
        e.preventDefault();
        fim.focus();
      } else if (!e.shiftKey && document.activeElement === fim) {
        e.preventDefault();
        inicio.focus();
      }
    }

    document.addEventListener("keydown", aoTeclar);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", aoTeclar);
      document.body.style.overflow = "";
      anterior?.focus();
    };
  }, [aberto]);

  if (!aberto) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onFechar} aria-hidden="true" />
      <div
        ref={caixa}
        role="dialog"
        aria-modal="true"
        aria-labelledby={tituloId}
        tabIndex={-1}
        className="relative w-full max-w-lg rounded-card border border-borda bg-surface p-6 shadow-neon"
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 id={tituloId} className="text-lg font-bold">
            {titulo}
          </h2>
          <button
            type="button"
            onClick={onFechar}
            aria-label="Fechar"
            className="rounded-md p-1 text-muted hover:text-fg"
          >
            <IconClose />
          </button>
        </div>
        <div>{children}</div>
        {rodape && <div className="mt-6 flex justify-end gap-2">{rodape}</div>}
      </div>
    </div>
  );
}
