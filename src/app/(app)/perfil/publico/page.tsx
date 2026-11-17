"use client";

import Link from "next/link";
import { useUser } from "@/context/user-context";
import { AvatarVerified } from "@/components/shared/avatar-verified";
import {
  ShieldCheckIcon,
  StarIcon,
  MapPinIcon,
  BriefcaseIcon,
  SparklesIcon,
  ArrowLeftIcon,
  CheckIcon,
} from "@/components/ui/icons";

export default function PublicProfilePage() {
  const { professionalProfile, verificationStatus } = useUser();

  const isVerified = verificationStatus === "verificado";
  const ratingAvg = professionalProfile.rating.average;
  const totalReviews = professionalProfile.rating.totalReviews;

  return (
    <div className="page max-w-4xl">
      {/* Botão de Retorno */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/perfil"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-fg transition-colors"
        >
          <ArrowLeftIcon className="w-3.5 h-3.5" />
          <span>Voltar para Edição do Perfil</span>
        </Link>

        <span className="text-xs font-medium text-muted">
          Visualização pública (&quot;Ver perfil verificado&quot;)
        </span>
      </div>

      {/* Cartão de Cabeçalho do Perfil Público */}
      <div className="rounded-3xl bg-surface border border-borda overflow-hidden shadow-xs mb-8">
        {/* Cover Banner */}
        <div className="h-36 sm:h-44 bg-primary relative">
          <div className="absolute inset-0 bg-black/10"></div>
          {isVerified && (
            <div className="absolute top-4 right-4 bg-surface/95 backdrop-blur-xs text-info px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-sm">
              <ShieldCheckIcon className="w-4 h-4 text-info" />
              <span>Identidade Verificada Oficialmente</span>
            </div>
          )}
        </div>

        {/* Informações Principais */}
        <div className="px-6 sm:px-8 pb-8 pt-0 relative">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 -mt-16 sm:-mt-20 mb-6">
            <div className="relative">
              <AvatarVerified
                name={professionalProfile.name}
                imageUrl={professionalProfile.avatarUrl}
                status={verificationStatus}
                verified={isVerified}
                size="xl"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
              <Link
                href="/perfil"
                className="py-2.5 px-4 rounded-xl border border-borda hover:bg-surface-2 text-fg text-xs sm:text-sm font-semibold transition-colors"
              >
                Editar Perfil
              </Link>
              <button
                type="button"
                onClick={() =>
                  alert("Solicitação de proposta enviada para o profissional!")
                }
                className="flex-1 sm:flex-initial py-2.5 px-6 rounded-xl bg-primary hover:brightness-110 text-fg text-xs sm:text-sm font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Contratar Profissional</span>
              </button>
            </div>
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-fg tracking-tight">
                {professionalProfile.name}
              </h1>
              {isVerified ? (
                <span
                  className="inline-flex items-center gap-1 text-xs font-bold text-info bg-info border border-info px-2.5 py-0.5 rounded-full"
                  title="Identidade verificada com CPF, documento e selfie"
                >
                  <ShieldCheckIcon className="w-3.5 h-3.5 text-info" />
                  <span>Perfil Verificado</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-muted bg-surface-2 px-2.5 py-0.5 rounded-full">
                  <span>Não Verificado</span>
                </span>
              )}
            </div>

            <p className="text-base text-fg font-semibold">
              {professionalProfile.title}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-muted mt-2.5">
              <div className="flex items-center gap-1.5 font-medium text-fg">
                <MapPinIcon className="w-4 h-4 text-muted" />
                <span>
                  {professionalProfile.location.city},{" "}
                  {professionalProfile.location.state}
                </span>
              </div>

              {/* Destaque da Nota Média */}
              <div className="flex items-center gap-1 font-bold text-warning">
                <StarIcon className="w-4 h-4 text-warning fill-warning" />
                <span>{ratingAvg.toFixed(1)}</span>
                <span className="text-muted font-normal">
                  ({totalReviews} avaliações)
                </span>
              </div>
            </div>

            <p className="mt-4 text-sm text-muted leading-relaxed max-w-3xl">
              {professionalProfile.bio}
            </p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Coluna da Esquerda: Características e Competências (4 Pilares) */}
        <div className="lg:col-span-1 space-y-6">
          {/* Cartão dos 4 Pilares de Características */}
          <div className="p-6 rounded-2xl bg-surface border border-borda shadow-xs space-y-5">
            <h2 className="text-base font-bold text-fg pb-2 border-b border-borda flex items-center gap-2">
              <SparklesIcon className="w-4 h-4 text-primary" />
              <span>Características Profissionais</span>
            </h2>

            <div className="space-y-4">
              {/* 1. Comunicação */}
              <div>
                <div className="flex justify-between text-xs font-bold text-fg mb-1">
                  <span>Comunicação</span>
                  <span className="text-primary">
                    {professionalProfile.characteristics.comunicacao}/5
                  </span>
                </div>
                <div className="w-full bg-surface-2 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-primary h-2 rounded-full"
                    style={{
                      width: `${(professionalProfile.characteristics.comunicacao / 5) * 100}%`,
                    }}
                  ></div>
                </div>
                <span className="text-[10px] text-muted mt-0.5 block">
                  Comunicação clara, assertiva e alinhada às expectativas.
                </span>
              </div>

              {/* 2. Proatividade */}
              <div>
                <div className="flex justify-between text-xs font-bold text-fg mb-1">
                  <span>Proatividade</span>
                  <span className="text-primary">
                    {professionalProfile.characteristics.proatividade}/5
                  </span>
                </div>
                <div className="w-full bg-surface-2 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-primary h-2 rounded-full"
                    style={{
                      width: `${(professionalProfile.characteristics.proatividade / 5) * 100}%`,
                    }}
                  ></div>
                </div>
                <span className="text-[10px] text-muted mt-0.5 block">
                  Iniciativa para resolver gargalos e antecipar soluções.
                </span>
              </div>

              {/* 3. Agilidade */}
              <div>
                <div className="flex justify-between text-xs font-bold text-fg mb-1">
                  <span>Agilidade</span>
                  <span className="text-primary">
                    {professionalProfile.characteristics.agilidade}/5
                  </span>
                </div>
                <div className="w-full bg-surface-2 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-primary h-2 rounded-full"
                    style={{
                      width: `${(professionalProfile.characteristics.agilidade / 5) * 100}%`,
                    }}
                  ></div>
                </div>
                <span className="text-[10px] text-muted mt-0.5 block">
                  Pontualidade rigorosa e entregas rápidas sob demanda.
                </span>
              </div>
            </div>

            {/* 4. Conhecimento Técnico */}
            <div className="pt-3 border-t border-borda">
              <span className="text-xs font-bold text-fg block mb-2">
                Conhecimento Técnico Comprovado
              </span>
              <div className="flex flex-wrap gap-1.5">
                {professionalProfile.characteristics.conhecimentoTecnico.map(
                  (tech) => (
                    <span
                      key={tech}
                      className="px-2.5 py-1 rounded-lg bg-surface-2 text-fg text-xs font-medium"
                    >
                      {tech}
                    </span>
                  ),
                )}
              </div>
            </div>
          </div>

          {/* Cartão de Garantias da Plataforma */}
          <div className="p-5 rounded-2xl bg-primary/60 border border-primary/40 text-xs text-primary space-y-2.5">
            <div className="flex items-center gap-2 font-bold">
              <ShieldCheckIcon className="w-4 h-4 text-primary" />
              <span>Contratação Protegida</span>
            </div>
            <p className="text-muted leading-relaxed">
              O pagamento é mantido em custódia segura até que os entregáveis combinados sejam aprovados.
            </p>
          </div>
        </div>

        {/* Coluna da Direita: Avaliações Recebidas & Experiências */}
        <div className="lg:col-span-2 space-y-8">
          {/* ============================================================== */}
          {/* SEÇÃO: NOTA MÉDIA E AVALIAÇÕES RECEBIDAS */}
          {/* ============================================================== */}
          <div className="p-6 sm:p-8 rounded-2xl bg-surface border border-borda shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-borda">
              <div>
                <h2 className="text-lg font-bold text-fg">
                  Nota Média e Avaliações Recebidas
                </h2>
                <p className="text-xs text-muted mt-0.5">
                  Feedback de empresas que já contrataram e trabalharam com este profissional.
                </p>
              </div>

              {/* Selo com a nota em destaque */}
              <div className="flex items-center gap-2 bg-warning border border-warning px-3.5 py-2 rounded-2xl">
                <StarIcon className="w-5 h-5 text-warning fill-warning" />
                <span className="text-lg font-extrabold text-warning">
                  {ratingAvg.toFixed(1)}
                </span>
                <span className="text-xs text-warning font-medium">/ 5.0</span>
              </div>
            </div>

            {/* Sumário de Avaliações com Barras */}
            <div className="grid sm:grid-cols-3 gap-4 items-center p-4 rounded-xl bg-surface-2 border border-borda">
              <div className="text-center sm:text-left sm:border-r border-borda sm:pr-4">
                <span className="text-3xl font-extrabold text-fg block">
                  {ratingAvg.toFixed(1)}
                </span>
                <div className="flex justify-center sm:justify-start gap-1 my-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <StarIcon
                      key={s}
                      className="w-4 h-4 text-warning fill-warning"
                    />
                  ))}
                </div>
                <span className="text-xs text-muted">
                  Total de {totalReviews} avaliações
                </span>
              </div>

              <div className="sm:col-span-2 space-y-1.5 text-xs text-muted">
                <div className="flex items-center gap-2">
                  <span className="w-12 text-muted">5 estrelas</span>
                  <div className="flex-1 bg-surface-2 h-2 rounded-full overflow-hidden">
                    <div className="bg-warning h-2 rounded-full w-[92%]"></div>
                  </div>
                  <span className="font-semibold text-fg">92%</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-12 text-muted">4 estrelas</span>
                  <div className="flex-1 bg-surface-2 h-2 rounded-full overflow-hidden">
                    <div className="bg-warning h-2 rounded-full w-[8%]"></div>
                  </div>
                  <span className="font-semibold text-fg">8%</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-12 text-muted">3 estrelas</span>
                  <div className="flex-1 bg-surface-2 h-2 rounded-full overflow-hidden">
                    <div className="bg-warning h-2 rounded-full w-[0%]"></div>
                  </div>
                  <span className="font-semibold text-fg">0%</span>
                </div>
              </div>
            </div>

            {/* Lista Detalhada de Avaliações Recebidas */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted">
                Depoimentos Recentes ({professionalProfile.reviews.length})
              </h3>

              {professionalProfile.reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="p-4 rounded-xl border border-borda bg-surface-2/50 space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      {rev.authorAvatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={rev.authorAvatar}
                          alt={rev.authorName}
                          className="w-9 h-9 rounded-full object-cover border border-borda"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-surface-2 text-fg flex items-center justify-center font-bold text-xs">
                          {rev.authorName.slice(0, 1)}
                        </div>
                      )}
                      <div>
                        <h4 className="font-bold text-fg text-sm">
                          {rev.authorName}
                        </h4>
                        <span className="text-xs text-primary font-medium">
                          {rev.authorCompany}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="flex items-center gap-1 text-warning">
                        {[...Array(5)].map((_, i) => (
                          <StarIcon
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < Math.floor(rev.rating)
                                ? "text-warning fill-warning"
                                : "text-muted"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-[10px] text-muted mt-0.5 block">
                        {rev.date}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-fg leading-relaxed italic bg-surface p-3 rounded-lg border border-borda">
                    &quot;{rev.comment}&quot;
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* ============================================================== */}
          {/* SEÇÃO: HISTÓRICO DE EXPERIÊNCIAS */}
          {/* ============================================================== */}
          <div className="p-6 sm:p-8 rounded-2xl bg-surface border border-borda shadow-xs space-y-4">
            <h2 className="text-lg font-bold text-fg pb-3 border-b border-borda flex items-center gap-2">
              <BriefcaseIcon className="w-5 h-5 text-primary" />
              <span>Experiências e Histórico Profissional</span>
            </h2>

            <div className="space-y-4">
              {professionalProfile.experiences.map((exp) => (
                <div
                  key={exp.id}
                  className="p-4 rounded-xl border border-borda bg-surface-2/50 space-y-1.5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-1">
                    <h3 className="font-bold text-fg text-sm">
                      {exp.title}
                    </h3>
                    <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded">
                      {exp.period}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-muted block">
                    {exp.company}
                  </span>
                  <p className="text-xs text-muted mt-1 leading-relaxed">
                    {exp.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

