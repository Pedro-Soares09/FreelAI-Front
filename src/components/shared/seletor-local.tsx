"use client";

import dynamic from "next/dynamic";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Carregando } from "@/components/ui/estados";
import { Input } from "@/components/ui/input";
import {
  bairroMaisProximo,
  buscarEndereco,
  centroDoBairro,
  consultarCep,
  enderecoDaCoordenada,
  type Coordenada,
  type EnderecoEncontrado,
} from "@/services/geo";

const MapaPino = dynamic(() => import("./mapa-pino"), {
  ssr: false,
  loading: () => <Carregando rotulo="Carregando mapa" />,
});

export type MudancaDeLocal = {
  coords: Coordenada;
  bairro?: string;
  logradouro?: string;
};

type Props = {
  bairro: string;
  coords: Coordenada | null;
  onChange: (mudanca: MudancaDeLocal) => void;
};

const mascaraCep = (v: string) => {
  const d = v.replace(/\D/g, "").slice(0, 8);
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
};

/**
 * Refina o local da vaga ou do profissional: CEP, busca de endereço e pino arrastável.
 * Funciona sem as APIs externas: se falharem, o bairro escolhido na lista continua valendo.
 */
export function SeletorLocal({ bairro, coords, onChange }: Props) {
  const [cep, setCep] = useState("");
  const [consulta, setConsulta] = useState("");
  const [resultados, setResultados] = useState<EnderecoEncontrado[]>([]);
  const [aviso, setAviso] = useState<string>();
  const [ocupado, setOcupado] = useState(false);
  const ultimoPino = useRef(0);

  const ponto = coords ?? centroDoBairro(bairro);

  async function aoMoverPino(novo: Coordenada) {
    const id = ++ultimoPino.current;
    onChange({ coords: novo, bairro: bairroMaisProximo(novo) });
    const endereco = await enderecoDaCoordenada(novo);
    if (id !== ultimoPino.current || !endereco) return;
    onChange({ coords: novo, bairro: endereco.bairro, logradouro: endereco.logradouro });
  }

  async function aoDigitarCep(valor: string) {
    const mascarado = mascaraCep(valor);
    setCep(mascarado);
    setAviso(undefined);
    if (mascarado.length !== 9) return;
    setOcupado(true);
    const r = await consultarCep(mascarado);
    if (!r) {
      setAviso("Não foi possível consultar o CEP agora. Escolha o bairro e mova o pino.");
      setOcupado(false);
      return;
    }
    const base = r.coords ?? (await buscarEndereco(`${r.logradouro}, ${r.bairro}, ${r.cidade}`))[0]?.coords;
    const alvo = base ?? centroDoBairro(bairro);
    onChange({
      coords: alvo,
      bairro: bairroMaisProximo(alvo),
      logradouro: r.logradouro || undefined,
    });
    setOcupado(false);
  }

  async function buscar() {
    setOcupado(true);
    setAviso(undefined);
    const lista = await buscarEndereco(consulta);
    setResultados(lista);
    if (lista.length === 0) setAviso("Nenhum endereço encontrado. Tente outro texto ou mova o pino.");
    setOcupado(false);
  }

  function escolher(e: EnderecoEncontrado) {
    setResultados([]);
    onChange({ coords: e.coords, bairro: e.bairro, logradouro: e.logradouro });
  }

  return (
    <fieldset className="grid gap-3 rounded-card border border-borda p-3">
      <legend className="px-1 text-sm font-semibold">Local exato (opcional)</legend>
      <div className="grid gap-3 sm:grid-cols-[10rem_1fr_auto] sm:items-end">
        <Input
          label="CEP"
          inputMode="numeric"
          value={cep}
          onChange={(e) => void aoDigitarCep(e.target.value)}
          placeholder="00000-000"
        />
        <Input
          label="Buscar endereço"
          value={consulta}
          onChange={(e) => setConsulta(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              void buscar();
            }
          }}
          placeholder="Rua, número e bairro"
        />
        <Button type="button" variant="secondary" loading={ocupado} onClick={() => void buscar()}>
          Buscar
        </Button>
      </div>
      {aviso && (
        <p role="status" className="text-xs text-muted">
          {aviso}
        </p>
      )}
      {resultados.length > 0 && (
        <ul className="grid gap-1 rounded-lg border border-borda bg-surface-2 p-1 text-sm">
          {resultados.map((r) => (
            <li key={`${r.coords.lat},${r.coords.lng}`}>
              <button type="button" onClick={() => escolher(r)} className="w-full rounded-md px-2 py-1.5 text-left hover:bg-primary/15">
                {r.rotulo}
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="relative z-0 h-64 overflow-hidden rounded-lg border border-borda">
        <MapaPino coords={ponto} onMover={(c) => void aoMoverPino(c)} />
      </div>
      <p className="text-xs text-muted">
        Arraste o pino ou toque no mapa para marcar o ponto. Mapa e busca de endereço: OpenStreetMap. CEP: BrasilAPI.
      </p>
    </fieldset>
  );
}
