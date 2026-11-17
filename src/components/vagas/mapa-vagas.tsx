'use client';

import { useEffect } from 'react';
import { Circle, MapContainer, Marker, TileLayer, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Vaga } from '@/types';

type MapaVagasProps = {
  centro: { lat: number; lng: number };
  raioKm: number;
  vagas: Vaga[];
  selecionadaId: string | null;
  onSelecionar: (id: string) => void;
};

function marcadorDeVaga(vaga: Vaga, selecionada: boolean): L.DivIcon {
  const convite = vaga.meu_convite?.status === 'escolhido';
  const classe = convite ? 'pino pino-convite' : selecionada ? 'pino pino-selecionado' : 'pino';
  return L.divIcon({
    className: 'pino-wrapper',
    html: `<span class="${classe}">R$ ${vaga.valor.toFixed(0)}</span>`,
    iconSize: [64, 28],
    iconAnchor: [32, 14],
  });
}

const iconeCentro = L.divIcon({
  className: 'pino-wrapper',
  html: '<span class="pino pino-centro">Você</span>',
  iconSize: [48, 28],
  iconAnchor: [24, 14],
});

function AjustaZoom({ centro, raioKm }: { centro: { lat: number; lng: number }; raioKm: number }) {
  const mapa = useMap();
  useEffect(() => {
    const limites = L.latLng(centro.lat, centro.lng).toBounds(raioKm * 2000 * 1.15);
    mapa.fitBounds(limites, { animate: true });
  }, [mapa, centro, raioKm]);
  return null;
}

export default function MapaVagas({ centro, raioKm, vagas, selecionadaId, onSelecionar }: MapaVagasProps) {
  return (
    <MapContainer
      center={[centro.lat, centro.lng]}
      zoom={13}
      scrollWheelZoom={false}
      className="h-full w-full"
      attributionControl
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <AjustaZoom centro={centro} raioKm={raioKm} />
      <Circle
        center={[centro.lat, centro.lng]}
        radius={raioKm * 1000}
        pathOptions={{ color: '#a78bfa', weight: 2, dashArray: '6 6', fillOpacity: 0.08 }}
      />
      <Marker position={[centro.lat, centro.lng]} icon={iconeCentro} interactive={false} />
      {vagas.map((vaga) => (
        <Marker
          key={vaga.id}
          position={[vaga.latitude, vaga.longitude]}
          icon={marcadorDeVaga(vaga, selecionadaId === vaga.id)}
          eventHandlers={{ click: () => onSelecionar(vaga.id) }}
        >
          <Tooltip direction="top" offset={[0, -14]}>
            {vaga.titulo} ({vaga.bairro})
          </Tooltip>
        </Marker>
      ))}
    </MapContainer>
  );
}
