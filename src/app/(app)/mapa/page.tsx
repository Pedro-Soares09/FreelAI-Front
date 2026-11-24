"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Carregando } from "@/components/ui/estados";
import { categoriaCompativel } from "@/lib/experiencia";
import { useSessao } from "@/lib/session";
import { freelaiApi } from "@/services/api";
import { contaApi } from "@/services/conta";
import type { Vaga } from "@/types";

const MapaVagas = dynamic(() => import("@/components/vagas/mapa-vagas"), {
  ssr: false,
  loading: () => <Carregando rotulo="Carregando mapa" />,
});

const CENTRO = { lat: -8.0476, lng: -34.877 };
const USA_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS !== "false";

export default function MapaOfertasPage() {
  const { usuario } = useSessao();
  const [vagas, setVagas] = useState<Vaga[]>([]);
  const [experiencias, setExperiencias] = useState<string[]>([]);
  const [soCompativeis, setSoCompativeis] = useState(true);
  const [raioKm, setRaioKm] = useState(10);
  const [selecionada, setSelecionada] = useState<string | null>(null);
  const [estado, setEstado] = useState<"carregando" | "ok" | "erro">("carregando");

  useEffect(() => {
    let ativo = true;
    setEstado("carregando");
    Promise.all([
      freelaiApi.listarVagasProximas({ raio_km: raioKm }),
      USA_MOCKS ? Promise.resolve([]) : contaApi.listarComprovacoes().catch(() => []),
    ])
      .then(([lista, comprovacoes]) => {
        if (!ativo) return;
        setVagas(lista);
        setExperiencias(
          comprovacoes
            .filter((c) => c.tipo === "experiencia" && c.status !== "recusado" && c.categoria)
            .map((c) => c.categoria as string),
        );
        setEstado("ok");
      })
      .catch(() => ativo && setEstado("erro"));
    return () => {
      ativo = false;
    };
  }, [raioKm]);

  const semExperiencia = !USA_MOCKS && experiencias.length === 0;
  const visiveis = useMemo(
    () =>
      vagas.filter(
        (v) =>
          v.distancia_km <= raioKm &&
          (!soCompativeis || USA_MOCKS || categoriaCompativel(v.categoria, experiencias)),
      ),
    [vagas, raioKm, soCompativeis, experiencias],
  );
  const vaga = visiveis.find((v) => v.id === selecionada) ?? null;

  if (usuario?.perfil_ativo === "contratante") {
    return (
      <section className="page">
        <p className="state-box">O mapa de ofertas é exclusivo para profissionais.</p>
      </section>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-4 p-4 md:p-6">
      <header>
        <h1 className="text-2xl font-bold">Ofertas perto de você</h1>
        <p className="text-sm text-muted">
          Vagas próximas, filtradas pelas experiências que você informou no perfil.
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-4 rounded-card border border-borda bg-surface p-3">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={soCompativeis}
            onChange={(e) => setSoCompativeis(e.target.checked)}
            className="accent-primary"
          />
          Somente compatíveis com minha experiência
        </label>
        <label className="flex items-center gap-2 text-sm">
          Raio: {raioKm} km
          <input
            type="range"
            min={1}
            max={15}
            value={raioKm}
            onChange={(e) => setRaioKm(Number(e.target.value))}
            className="accent-primary"
          />
        </label>
        <span className="text-sm text-muted">{visiveis.length} oferta(s)</span>
      </div>

      {semExperiencia && soCompativeis && (
        <p role="status" className="state-box">
          Você ainda não tem experiência cadastrada, então nenhuma oferta é compatível.{" "}
          <Link href="/perfil" className="text-primary hover:underline">
            Adicionar experiência no perfil
          </Link>
        </p>
      )}

      {estado === "erro" ? (
        <p role="alert" className="state-box">
          Não foi possível carregar as ofertas.
        </p>
      ) : (
        <div className="relative z-0 h-[460px] w-full overflow-hidden rounded-card border border-borda bg-surface">
          <MapaVagas
            centro={CENTRO}
            raioKm={raioKm}
            vagas={visiveis}
            selecionadaId={selecionada}
            onSelecionar={setSelecionada}
          />
        </div>
      )}

      {vaga ? (
        <article className="rounded-card border border-primary/40 bg-surface p-4">
          <h2 className="font-bold">{vaga.titulo}</h2>
          <p className="text-sm text-muted">
            {vaga.categoria} · {vaga.bairro} · {vaga.distancia_km.toFixed(1)} km
          </p>
          <p className="mt-1 font-bold text-primary">R$ {vaga.valor.toFixed(2).replace(".", ",")}</p>
          <Link href={`/vagas/${vaga.id}`} className="cta mt-3 inline-block">
            Ver vaga
          </Link>
        </article>
      ) : (
        <p className="text-xs text-muted">Toque em um pino para ver a oferta.</p>
      )}
    </div>
  );
}
