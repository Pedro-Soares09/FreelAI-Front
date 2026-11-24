"use client";

import { useEffect, useState } from "react";
import { previsaoDeChuva, servicoExterno, type PrevisaoChuva } from "@/services/geo";
import { IconAlert } from "@/components/ui/icons";

type Props = {
  categoria: string;
  titulo?: string;
  lat: number;
  lng: number;
  inicioIso: string;
};

/** Aviso de chuva na hora do serviço, só para serviços ao ar livre. Some em silêncio se a previsão falhar. */
export function AvisoChuva({ categoria, titulo, lat, lng, inicioIso }: Props) {
  const externo = servicoExterno(categoria, titulo);
  const [previsao, setPrevisao] = useState<PrevisaoChuva | null>(null);

  useEffect(() => {
    if (!externo) return;
    let ativo = true;
    previsaoDeChuva({ lat, lng }, inicioIso).then((p) => ativo && setPrevisao(p));
    return () => {
      ativo = false;
    };
  }, [externo, lat, lng, inicioIso]);

  if (!externo || !previsao?.chuva) return null;
  return (
    <p role="status" className="mt-2 flex items-start gap-2 rounded-lg border border-warning/40 bg-warning/10 px-3 py-2 text-xs text-warning">
      <IconAlert width={14} height={14} className="mt-0.5 shrink-0" />
      <span>
        Previsão de chuva no horário do serviço ({Math.round(previsao.probabilidade)}% de chance). Combine um plano
        alternativo pelo chat. Previsão: Open-Meteo.
      </span>
    </p>
  );
}
