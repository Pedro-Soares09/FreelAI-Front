"use client";

import { useEffect, useMemo, useRef } from "react";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Coordenada } from "@/services/geo";

type Props = {
  coords: Coordenada;
  onMover: (coords: Coordenada) => void;
};

const icone = L.divIcon({
  className: "pino-wrapper",
  html: '<span class="pino pino-selecionado">Aqui</span>',
  iconSize: [48, 28],
  iconAnchor: [24, 14],
});

function Cliques({ onMover }: { onMover: (c: Coordenada) => void }) {
  useMapEvents({ click: (e) => onMover({ lat: e.latlng.lat, lng: e.latlng.lng }) });
  return null;
}

function Acompanha({ coords }: { coords: Coordenada }) {
  const mapa = useMap();
  useEffect(() => {
    mapa.setView([coords.lat, coords.lng], Math.max(mapa.getZoom(), 15), { animate: true });
  }, [mapa, coords.lat, coords.lng]);
  return null;
}

/** Mapa com um pino que pode ser arrastado ou reposicionado com um clique. */
export default function MapaPino({ coords, onMover }: Props) {
  const marcador = useRef<L.Marker>(null);
  const eventos = useMemo(
    () => ({
      dragend() {
        const m = marcador.current;
        if (m) onMover({ lat: m.getLatLng().lat, lng: m.getLatLng().lng });
      },
    }),
    [onMover],
  );

  return (
    <MapContainer center={[coords.lat, coords.lng]} zoom={15} scrollWheelZoom={false} className="h-full w-full">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Cliques onMover={onMover} />
      <Acompanha coords={coords} />
      <Marker draggable position={[coords.lat, coords.lng]} icon={icone} ref={marcador} eventHandlers={eventos} />
    </MapContainer>
  );
}
