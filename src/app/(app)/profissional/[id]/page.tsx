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
import { profissionalApi, type PerfilPublicoProfissional } from "@/services/profissional";

const RISCO: Record<string, string> = { baixo: "Risco baixo", medio: "Risco médio", alto: "Risco alto" };

function dataCurta(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
}

function Metrica({ valor, rotulo }: { valor: string | number; rotulo: string }) {
  return (
    <div className="rounded-lg border border-borda bg-surface-2 px-4 py-3">
      <p className="text-2xl font-bold text-primary">{valor}</p>
      <p className="text-xs text-muted">{rotulo}</p>
    </div>
  );
}

function Barra({ rotulo, valor }: { rotulo: string; valor: number | null | undefined }) {
  const nota = valor ?? 0;
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted">{rotulo}</span>
        <span className="font-semibold">{valor ? `${valor} de 5` : "Não informado"}</span>
      </div>
      <div className="mt-1 h-2 rounded-full bg-surface-2" role="img" aria-label={`${rotulo}: ${nota} de 5`}>
        <div className="h-2 rounded-full bg-primary" style={{ width: `${(nota / 5) * 100}%` }} />
      </div>
    </div>
  );
}

export default function PerfilPublicoProfissionalPage() {
  const { id } = useParams<{ id: string }>();
  const [perfil, setPerfil] = useState<PerfilPublicoProfissional | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    try {
      setPerfil(await profissionalApi.perfilPublico(Number(id)));
      setErro(null);
    } catch (e) {
      setErro(mensagemDeErro(e));
    }
  }, [id]);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  return (
    <Pagina titulo="Perfil do profissional" descricao="Como este profissional aparece para os contratantes.">
      {erro ? (
        <ErroComRetry mensagem={erro} onTentarNovamente={() => void carregar()} />
      ) : !perfil ? (
        <Carregando />
      ) : (
        <div className="grid gap-5">
          <Card className="overflow-hidden p-0">
            <div className="flex flex-wrap items-center gap-4 px-5 py-5">
              <AvatarVerified
                name={perfil.nome}
                imageUrl={perfil.foto_url ?? undefined}
                verified={perfil.verificado}
                size="xl"
              />
              <div className="min-w-0 flex-1">
                <h2 className="truncate text-xl font-bold">{perfil.nome}</h2>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {perfil.verificado && <Badge tom="success">Verificado</Badge>}
                  {perfil.novo && <Badge tom="neutral">Novo</Badge>}
                  {perfil.pro && <Badge tom="neutral">Pro</Badge>}
                </div>
                <p className="mt-2 text-sm text-muted">
                  Membro desde {dataCurta(perfil.membro_desde)}
                  {perfil.bairro ? ` · ${perfil.bairro}` : ""}
                </p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-extrabold text-primary">
                  {(perfil.nota_media ?? perfil.reputacao).toFixed(1).replace(".", ",")}
                </p>
                <RatingStars value={perfil.nota_media ?? perfil.reputacao} label={`Nota ${perfil.nota_media ?? perfil.reputacao} de 5`} />
                <p className="text-xs text-muted">{perfil.total_avaliacoes} avaliação(ões)</p>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Metrica valor={perfil.servicos_concluidos} rotulo="Serviços concluídos" />
            <Metrica valor={perfil.total_avaliacoes} rotulo="Avaliações recebidas" />
            <Metrica valor={perfil.reputacao.toFixed(1).replace(".", ",")} rotulo="Reputação" />
          </div>

          <Card>
            <h3 className="text-lg font-semibold">Categorias de atuação</h3>
            {(perfil.categorias ?? []).length === 0 ? (
              <p className="mt-2 text-sm text-muted">Nenhuma categoria informada.</p>
            ) : (
              <ul className="mt-3 flex flex-wrap gap-2">
                {(perfil.categorias ?? []).map((c) => (
                  <li key={c.slug} className="rounded-full border border-borda px-3 py-1 text-xs font-semibold">
                    {c.nome} · {RISCO[c.nivel_risco] ?? c.nivel_risco}
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card>
            <h3 className="text-lg font-semibold">Características autodeclaradas</h3>
            <p className="mt-1 text-xs text-muted">Informadas pelo próprio profissional; não alteram o match.</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <Barra rotulo="Comunicação" valor={perfil.caracteristicas.comunicacao} />
              <Barra rotulo="Agilidade" valor={perfil.caracteristicas.agilidade} />
              <Barra rotulo="Organização" valor={perfil.caracteristicas.organizacao} />
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-semibold">Avaliações dos contratantes</h3>
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
            <Link href="/match" className="font-semibold text-primary hover:underline">
              Voltar aos três melhores
            </Link>
          </p>
        </div>
      )}
    </Pagina>
  );
}
