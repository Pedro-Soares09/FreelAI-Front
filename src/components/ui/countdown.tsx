"use client";

import { useEffect, useState } from "react";
import { IconClock } from "./icons";

function formatar(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const dois = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${dois(h)}:${dois(m)}:${dois(s)}` : `${dois(m)}:${dois(s)}`;
}

type CountdownProps = {
  /** Instante final em ISO 8601 ou Date. */
  ate: string | Date;
  rotulo?: string;
  onExpirar?: () => void;
};

export function Countdown({ ate, rotulo = "Expira em", onExpirar }: CountdownProps) {
  const alvo = new Date(ate).getTime();
  const [restante, setRestante] = useState(() => alvo - Date.now());

  useEffect(() => {
    const t = setInterval(() => {
      const r = alvo - Date.now();
      setRestante(r);
      if (r <= 0) {
        clearInterval(t);
        onExpirar?.();
      }
    }, 1000);
    return () => clearInterval(t);
  }, [alvo, onExpirar]);

  const expirou = restante <= 0;
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-sm font-semibold ${expirou ? "text-danger" : "text-warning"}`}
    >
      <IconClock width={16} height={16} />
      <span>{expirou ? "Expirado" : `${rotulo} ${formatar(restante)}`}</span>
    </span>
  );
}
