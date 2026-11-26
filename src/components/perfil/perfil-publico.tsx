"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, chamar } from "@/api/client";
import { ApiError, mensagemDeErro } from "@/api/erro";
import type { PerfilPublicoProfissional } from "@/api/tipos";
import { AvatarVerified } from "@/components/shared/avatar-verified";
import { Carregando } from "@/components/ui/estados";
import { ArrowLeftIcon, BriefcaseIcon, MapPinIcon, StarIcon } from "@/components/ui/icons";

type EstadoPerfil =
  | { usuarioId: string; tipo: "carregando" }
  | { usuarioId: string; tipo: "erro"; mensagem: string }
  | { usuarioId: string; tipo: "pronto"; perfil: PerfilPublicoProfissional };

export function PerfilPublico({
  usuarioId,
  permiteEdicao = false,
}: {
  usuarioId: string;
  permiteEdicao?: boolean;
}) {
  const [estado, setEstado] = useState<EstadoPerfil>({
    usuarioId: "",
    tipo: "carregando",
  });

  useEffect(() => {
    const id = Number(usuarioId);
    if (!Number.isSafeInteger(id) || id < 1) {
      setEstado({
        usuarioId,
        tipo: "erro",
        mensagem: "Perfil profissional não encontrado.",
      });
      return;
    }

    const controller = new AbortController();
    void (async () => {
      try {
        const perfil = await chamar(
          api.GET("/api/v1/usuarios/{usuario_id}/perfil", {
            params: { path: { usuario_id: id } },
            signal: controller.signal,
          }),
        );
        setEstado({ usuarioId, tipo: "pronto", perfil });
      } catch (erro) {
        if (controller.signal.aborted) return;
        const mensagem =
          erro instanceof ApiError && erro.status === 404
            ? "Este perfil profissional não está disponível."
            : mensagemDeErro(erro);
        setEstado({ usuarioId, tipo: "erro", mensagem });
      }
    })();

    return () => controller.abort();
  }, [usuarioId]);

  if (estado.usuarioId !== usuarioId || estado.tipo === "carregando") {
    return <Carregando rotulo="Carregando perfil profissional" />;
  }

  if (estado.tipo === "erro") {
    return (
      <div className="page max-w-4xl">
        <div role="alert" className="rounded-2xl border border-borda bg-surface p-8 text-center">
          <h1 className="text-xl font-bold text-fg">Perfil indisponível</h1>
          <p className="mt-2 text-sm text-muted">{estado.mensagem}</p>
        </div>
      </div>
    );
  }

  const { perfil } = estado;
  const notaMedia = perfil.nota_media ?? null;
  const temNota = notaMedia !== null;

  return (
    <div className="page max-w-4xl">
      {permiteEdicao && (
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/perfil"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted transition-colors hover:text-fg"
          >
            <ArrowLeftIcon className="h-3.5 w-3.5" />
            Voltar para edição do perfil
          </Link>
          <span className="text-xs font-medium text-muted">Visualização pública</span>
        </div>
      )}

      <section className="mb-8 overflow-hidden rounded-3xl border border-borda bg-surface shadow-xs">
        <div className="relative h-36 bg-primary/20 sm:h-44" />
        <div className="relative px-6 pb-8 pt-0 sm:px-8">
          <div className="-mt-14 mb-5 flex items-end gap-4 sm:-mt-16">
            <AvatarVerified
              name={perfil.nome}
              imageUrl={perfil.foto_url ?? undefined}
              verified={perfil.verificado}
              size="xl"
            />
            {perfil.verificado && (
              <span className="mb-2 rounded-full bg-info/15 px-3 py-1 text-xs font-bold text-info">
                Identidade verificada
              </span>
            )}
          </div>

          <h1 className="text-2xl font-extrabold tracking-tight text-fg sm:text-3xl">
            {perfil.nome}
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-muted">
            {perfil.cidade && perfil.uf && (
              <span className="inline-flex items-center gap-1.5">
                <MapPinIcon className="h-4 w-4" />
                {perfil.cidade}, {perfil.uf}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5">
              <StarIcon className="h-4 w-4 fill-warning text-warning" />
              {temNota ? notaMedia.toFixed(1) : "Sem avaliações"}
              {temNota && ` (${perfil.total_avaliacoes} avaliações)`}
            </span>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {perfil.categorias.map((categoria) => (
              <span
                key={categoria}
                className="rounded-full bg-surface-2 px-3 py-1 text-xs font-semibold text-fg"
              >
                {categoria}
              </span>
            ))}
          </div>
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-3">
        <aside className="space-y-6">
          <section className="rounded-2xl border border-borda bg-surface p-6">
            <h2 className="text-base font-bold text-fg">Histórico profissional</h2>
            <p className="mt-3 text-3xl font-extrabold text-fg">
              {perfil.servicos_concluidos}
            </p>
            <p className="text-sm text-muted">serviços concluídos</p>
            {perfil.novo && (
              <span className="mt-3 inline-flex rounded-full bg-info/15 px-3 py-1 text-xs font-bold text-info">
                Novo na plataforma
              </span>
            )}
          </section>
        </aside>

        <div className="space-y-8 lg:col-span-2">
          <section className="rounded-2xl border border-borda bg-surface p-6 sm:p-8">
            <h2 className="flex items-center gap-2 border-b border-borda pb-4 text-lg font-bold text-fg">
              <BriefcaseIcon className="h-5 w-5 text-primary" />
              Experiências aprovadas
            </h2>
            {perfil.experiencias.length === 0 ? (
              <p className="pt-4 text-sm text-muted">Nenhuma experiência aprovada informada.</p>
            ) : (
              <ul className="space-y-4 pt-4">
                {perfil.experiencias.map((experiencia) => (
                  <li
                    key={experiencia.id}
                    className="rounded-xl border border-borda bg-surface-2/50 p-4"
                  >
                    {experiencia.categoria && (
                      <p className="mb-1 text-xs font-semibold text-primary">
                        {experiencia.categoria}
                      </p>
                    )}
                    <p className="text-sm leading-relaxed text-fg">{experiencia.descricao}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-2xl border border-borda bg-surface p-6 sm:p-8">
            <h2 className="border-b border-borda pb-4 text-lg font-bold text-fg">
              Avaliações de serviços concluídos
            </h2>
            <p className="mt-2 text-sm text-muted">
              {temNota
                ? `Nota média ${notaMedia.toFixed(1)} de 5, com ${perfil.total_avaliacoes} avaliações visíveis.`
                : "Este profissional ainda não recebeu avaliações visíveis."}
            </p>
            {perfil.avaliacoes.length > 0 && (
              <ul className="mt-5 space-y-3">
                {perfil.avaliacoes.map((avaliacao) => (
                  <li
                    key={avaliacao.id}
                    className="rounded-xl border border-borda bg-surface-2/50 p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-bold text-fg">{avaliacao.nota}/5</span>
                      <time className="text-xs text-muted" dateTime={avaliacao.criada_em}>
                        {new Date(avaliacao.criada_em).toLocaleDateString("pt-BR")}
                      </time>
                    </div>
                    {avaliacao.comentario && (
                      <p className="mt-2 text-sm leading-relaxed text-muted">
                        {avaliacao.comentario}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
