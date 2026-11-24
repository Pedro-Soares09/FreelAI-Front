"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import { Button } from "./button";
import { Modal } from "./modal";

type Opcoes = { titulo?: string; confirmar?: string; cancelar?: string; perigo?: boolean };
type Pedido = { mensagem: string } & Opcoes;
type Confirmar = (mensagem: string, opcoes?: Opcoes) => Promise<boolean>;

const ConfirmarContext = createContext<Confirmar | null>(null);

/** Substitui window.confirm por um modal acessível, mantendo a chamada assíncrona. */
export function ConfirmarProvider({ children }: { children: ReactNode }) {
  const [pedido, setPedido] = useState<Pedido | null>(null);
  const resolver = useRef<((ok: boolean) => void) | null>(null);

  const confirmar = useCallback<Confirmar>((mensagem, opcoes) => {
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve;
      setPedido({ mensagem, ...opcoes });
    });
  }, []);

  const responder = useCallback((ok: boolean) => {
    resolver.current?.(ok);
    resolver.current = null;
    setPedido(null);
  }, []);

  const valor = useMemo(() => confirmar, [confirmar]);

  return (
    <ConfirmarContext.Provider value={valor}>
      {children}
      <Modal
        aberto={pedido !== null}
        titulo={pedido?.titulo ?? "Confirmar ação"}
        onFechar={() => responder(false)}
        rodape={
          <>
            <Button variant="ghost" onClick={() => responder(false)}>
              {pedido?.cancelar ?? "Cancelar"}
            </Button>
            <Button variant={pedido?.perigo ? "danger" : "primary"} onClick={() => responder(true)}>
              {pedido?.confirmar ?? "Confirmar"}
            </Button>
          </>
        }
      >
        <p className="text-muted">{pedido?.mensagem}</p>
      </Modal>
    </ConfirmarContext.Provider>
  );
}

export function useConfirmar(): Confirmar {
  const ctx = useContext(ConfirmarContext);
  if (!ctx) throw new Error("useConfirmar deve ser usado dentro de ConfirmarProvider.");
  return ctx;
}
