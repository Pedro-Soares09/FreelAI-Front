"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

type TipoToast = "success" | "error" | "info";
type Item = { id: number; tipo: TipoToast; mensagem: string };

type Contexto = { avisar: (mensagem: string, tipo?: TipoToast) => void };

const ToastContext = createContext<Contexto | null>(null);

const estilos: Record<TipoToast, string> = {
  success: "border-success/60",
  error: "border-danger/60",
  info: "border-info/60",
};

let contador = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [itens, setItens] = useState<Item[]>([]);

  const avisar = useCallback((mensagem: string, tipo: TipoToast = "info") => {
    const id = ++contador;
    setItens((atual) => [...atual, { id, tipo, mensagem }]);
    setTimeout(() => setItens((atual) => atual.filter((i) => i.id !== id)), 5000);
  }, []);

  const valor = useMemo(() => ({ avisar }), [avisar]);

  return (
    <ToastContext.Provider value={valor}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed bottom-20 right-4 z-50 flex w-80 max-w-[calc(100vw-2rem)] flex-col gap-2 md:bottom-4"
      >
        {itens.map((i) => (
          <div
            key={i.id}
            role={i.tipo === "error" ? "alert" : "status"}
            className={cn(
              "pointer-events-auto rounded-lg border bg-surface px-4 py-3 text-sm shadow-lg",
              estilos[i.tipo],
            )}
          >
            {i.mensagem}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): Contexto {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast deve ser usado dentro de ToastProvider.");
  return ctx;
}
