"use client";

import { useEffect, useState } from "react";
import { calcularDeslocamento, type Coordenada, type Deslocamento } from "@/services/geo";

/** Tempo e distância de carro até a vaga (OSRM); sem resposta, estima pela linha reta. */
export function InfoDeslocamento({ de, para }: { de: Coordenada; para: Coordenada }) {
  const [dados, setDados] = useState<Deslocamento | null>(null);

  const { lat: deLat, lng: deLng } = de;
  const { lat: paraLat, lng: paraLng } = para;

  useEffect(() => {
    let ativo = true;
    setDados(null);
    calcularDeslocamento({ lat: deLat, lng: deLng }, { lat: paraLat, lng: paraLng }).then((d) => ativo && setDados(d));
    return () => {
      ativo = false;
    };
  }, [deLat, deLng, paraLat, paraLng]);

  if (!dados) return <p className="mt-1 text-xs text-muted">Calculando deslocamento...</p>;
  const km = dados.km.toFixed(1).replace(".", ",");
  return (
    <p className="mt-1 text-xs text-muted">
      {dados.origem === "rota"
        ? `Deslocamento de carro: cerca de ${dados.minutos} min (${km} km). Rota: OSRM e OpenStreetMap.`
        : `Deslocamento estimado: cerca de ${dados.minutos} min (${km} km em linha reta).`}
    </p>
  );
}
