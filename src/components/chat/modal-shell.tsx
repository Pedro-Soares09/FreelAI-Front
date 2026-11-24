"use client";

import { useEffect, type ReactNode } from "react";

type ModalShellProps = {
  title: string;
  onClose: () => void;
  children: ReactNode;
};

/** Casca de diálogo usada pelas telas de acordo, cancelamento, avaliação e denúncia. */
export function ModalShell({ title, onClose, children }: ModalShellProps) {
  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="modal"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="modal-header">
          <h2 id="modal-title">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Fechar">
            ×
          </button>
        </header>
        {children}
      </div>
    </div>
  );
}
