import Link from "next/link";
import { notFound } from "next/navigation";
import { policiesData } from "@/mocks/policies";
import {
  ArrowLeftIcon,
  ShieldCheckIcon,
  FileTextIcon,
  ChevronRightIcon,
} from "@/components/ui/icons";

type PolicyDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function PolicyDetailPage({
  params,
}: PolicyDetailPageProps) {
  const { slug } = await params;
  const policy = policiesData.find((p) => p.slug === slug);

  if (!policy) {
    notFound();
  }

  // Outras páginas para navegação rápida
  const otherPolicies = policiesData.filter((p) => p.slug !== slug);

  return (
    <article className="page max-w-4xl">
      {/* Botão de Retorno */}
      <div className="mb-6">
        <Link
          href="/politica"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-fg transition-colors"
        >
          <ArrowLeftIcon className="w-3.5 h-3.5" />
          <span>Voltar para todas as Políticas</span>
        </Link>
      </div>

      {/* Cabeçalho do Documento */}
      <header className="mb-8 p-6 sm:p-8 rounded-2xl bg-surface border border-borda shadow-xs">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 border border-primary/80 px-2.5 py-1 rounded-md">
            {policy.badge}
          </span>
          <span className="text-xs text-muted">
            Última revisão: {policy.lastUpdated}
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-fg tracking-tight">
          {policy.title}
        </h1>

        <div className="mt-4 p-4 rounded-xl bg-surface-2 border-l-4 border-primary text-xs sm:text-sm text-fg leading-relaxed font-medium">
          {policy.summary}
        </div>
      </header>

      {/* Conteúdo Seções */}
      <div className="space-y-6">
        {policy.sections.map((section, idx) => (
          <section
            key={idx}
            className="p-6 sm:p-8 rounded-2xl bg-surface border border-borda shadow-xs"
          >
            <h2 className="text-lg font-bold text-fg mb-4 pb-2 border-b border-borda flex items-center gap-2">
              <FileTextIcon className="w-5 h-5 text-primary" />
              <span>{section.title}</span>
            </h2>

            <div className="space-y-3 text-sm text-fg leading-relaxed">
              {section.content.map((paragraph, pIdx) => (
                <p key={pIdx}>{paragraph}</p>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* Navegação entre outras Políticas */}
      <div className="mt-10 p-6 rounded-2xl bg-surface-2 border border-borda">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted mb-3">
          Explore as Demais Políticas do FreelAI:
        </h3>
        <div className="grid sm:grid-cols-2 gap-2.5">
          {otherPolicies.map((other) => (
            <Link
              key={other.slug}
              href={`/politica/${other.slug}`}
              className="p-3 rounded-xl bg-surface border border-borda hover:border-primary hover:shadow-xs transition-all flex items-center justify-between text-xs font-semibold text-fg"
            >
              <div className="flex items-center gap-2 truncate">
                <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                <span className="truncate">{other.title}</span>
              </div>
              <ChevronRightIcon className="w-4 h-4 text-muted shrink-0" />
            </Link>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-borda flex items-center justify-between">
          <Link
            href="/politica"
            className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
          >
            <ArrowLeftIcon className="w-3.5 h-3.5" />
            <span>Retornar à Central e Confirmar Termos</span>
          </Link>

          <Link
            href="/verificacao"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-fg text-xs font-bold hover:brightness-110 transition-colors"
          >
            <ShieldCheckIcon className="w-3.5 h-3.5" />
            <span>Verificar Minha Identidade</span>
          </Link>
        </div>
      </div>
    </article>
  );
}

