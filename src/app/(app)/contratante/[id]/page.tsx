"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { mensagemDeErro } from "@/api/erro";
import { Pagina } from "@/components/layout/pagina";
import { AvatarVerified } from "@/components/shared/avatar-verified";
import { RatingStars } from "@/components/shared/rating-stars";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Carregando, ErroComRetry } from "@/components/ui/estados";
import { SeloDestaque } from "@/components/ui/selos";
import { estiloDaCor } from "@/lib/cores-perfil";
import { contratanteApi, type PerfilPublicoContratante } from "@/services/contratante";

function dataCurta(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
}

function Metrica({ valor, rotulo }: { valor: string | number; rotulo: string }) {
  return (
    <div className="rounded-lg border border-borda bg-surface-2 px-4 py-3">
      <p className="cor-perfil-texto text-2xl font-bold">{valor}</p>
      <p className="text-xs text-muted">{rotulo}</p>
    </div>
  );
}

export default function PerfilPublicoContratantePage() {
  const { id } = useParams<{ id: string }>();
  const [perfil, setPerfil] = useState<PerfilPublicoContratante | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    try {
      setPerfil(await contratanteApi.perfilPublico(Number(id)));
      setErro(null);
    } catch (e) {
      setErro(mensagemDeErro(e));
    }
  }, [id]);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  return (
    <Pagina titulo="Perfil do contratante" descricao="Como este contratante aparece para os profissionais.">
      {erro ? (
        <ErroComRetry mensagem={erro} onTentarNovamente={() => void carregar()} />
      ) : !perfil ? (
        <Carregando />
      ) : (
        <div className="cor-perfil grid gap-5" style={estiloDaCor(perfil.cor_destaque)}>
          <Card className="cor-perfil-borda overflow-hidden p-0">
            <div className="cor-perfil-topo flex flex-wrap items-center gap-4 px-5 py-5">
              <AvatarVerified
                name={perfil.nome}
                imageUrl={perfil.avatar_url ?? undefined}
                verified={perfil.verificado}
                cor={perfil.cor_destaque}
                size="xl"
              />
              <div className="min-w-0 flex-1">
                <h2 className="truncate text-xl font-bold">{perfil.nome}</h2>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {perfil.verificado && <Badge tom="success">Verificado</Badge>}
                  <Badge tom="neutral">{perfil.tipo_pessoa === "pf" ? "Pessoa física" : "Empresa"}</Badge>
                  {perfil.destaque && <SeloDestaque />}
                </div>
                <p className="mt-2 text-sm text-muted">
                  Membro desde {dataCurta(perfil.membro_desde)}
                  {perfil.bairro ? ` · ${perfil.bairro}` : ""}
                </p>
              </div>
              {perfil.nota_media !== null && perfil.nota_media !== undefined && (
                <div className="text-right">
                  <p className="cor-perfil-texto text-3xl font-extrabold">
                    {perfil.nota_media.toFixed(1).replace(".", ",")}
                  </p>
                  <RatingStars value={perfil.nota_media} label={`Nota ${perfil.nota_media} de 5`} />
                  <p className="text-xs text-muted">{perfil.total_avaliacoes} avaliação(ões)</p>
                </div>
              )}
            </div>
            {perfil.bio && <p className="px-5 py-4 text-sm">{perfil.bio}</p>}
          </Card>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Metrica valor={perfil.vagas_publicadas ?? 0} rotulo="Vagas publicadas" />
            <Metrica valor={perfil.servicos_concluidos ?? 0} rotulo="Serviços concluídos" />
            <Metrica valor={perfil.total_avaliacoes ?? 0} rotulo="Avaliações recebidas" />
            <Metrica valor={perfil.adicionais_pagos ?? 0} rotulo="Adicionais pagos" />
          </div>

          <Card>
            <h3 className="text-lg font-semibold">Preferências</h3>
            <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-muted">Melhor horário de contato</dt>
                <dd>{perfil.horario_contato ?? "Não informado"}</dd>
              </div>
              <div>
                <dt className="text-muted">Profissionais verificados</dt>
                <dd>{perfil.exigir_verificado ? "Prefere contratar verificados" : "Sem preferência"}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-muted">Categorias de interesse</dt>
                <dd className="mt-1 flex flex-wrap gap-2">
                  {(perfil.categorias_interesse ?? []).length === 0 && "Não informadas"}
                  {(perfil.categorias_interesse ?? []).map((c) => (
                    <span key={c.slug} className="cor-perfil-fundo rounded-full px-3 py-1 text-xs font-semibold">
                      {c.nome}
                    </span>
                  ))}
                </dd>
              </div>
            </dl>
            {perfil.destaque && (
              <p className="mt-4 text-xs text-muted">
                O selo de destaque indica que este contratante já pagou horas extras ou bônus combinados com
                profissionais.
              </p>
            )}
          </Card>

          <Card>
            <h3 className="text-lg font-semibold">Avaliações dos profissionais</h3>
            {(perfil.avaliacoes ?? []).length === 0 ? (
              <p className="mt-2 text-sm text-muted">Ainda não há avaliações visíveis.</p>
            ) : (
              <ul className="mt-3 grid gap-3">
                {(perfil.avaliacoes ?? []).map((a, i) => (
                  <li key={i} className="rounded-lg border border-borda px-4 py-3 text-sm">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <strong>{a.avaliador_nome}</strong>
                      <RatingStars value={a.nota} label={`Nota ${a.nota} de 5`} />
                    </div>
                    <p className="text-xs text-muted">{a.vaga_titulo}</p>
                    {a.comentario && <p className="mt-2">{a.comentario}</p>}
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <p className="text-sm text-muted">
            <Link href="/vagas" className="font-semibold text-primary hover:underline">
              Voltar às vagas
            </Link>
          </p>
        </div>
      )}
    </Pagina>
  );
}
