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
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeftIcon className="w-3.5 h-3.5" />
          <span>Voltar para todas as Políticas</span>
        </Link>
      </div>

      {/* Cabeçalho do Documento */}
      <header className="mb-8 p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-xs">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-2.5 py-1 rounded-md">
            {policy.badge}
          </span>
          <span className="text-xs text-slate-400">
            Última revisão: {policy.lastUpdated}
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {policy.title}
        </h1>

        <div className="mt-4 p-4 rounded-xl bg-slate-50 border-l-4 border-indigo-600 text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
          {policy.summary}
        </div>
      </header>

      {/* Conteúdo Seções */}
      <div className="space-y-6">
        {policy.sections.map((section, idx) => (
          <section
            key={idx}
            className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-xs"
          >
            <h2 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
              <FileTextIcon className="w-5 h-5 text-indigo-600" />
              <span>{section.title}</span>
            </h2>

            <div className="space-y-3 text-sm text-slate-700 leading-relaxed">
              {section.content.map((paragraph, pIdx) => (
                <p key={pIdx}>{paragraph}</p>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* Navegação entre outras Políticas */}
      <div className="mt-10 p-6 rounded-2xl bg-slate-100 border border-slate-200">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3">
          Explore as Demais Políticas do FreelAI:
        </h3>
        <div className="grid sm:grid-cols-2 gap-2.5">
          {otherPolicies.map((other) => (
            <Link
              key={other.slug}
              href={`/politica/${other.slug}`}
              className="p-3 rounded-xl bg-white border border-slate-200 hover:border-indigo-400 hover:shadow-xs transition-all flex items-center justify-between text-xs font-semibold text-slate-800"
            >
              <div className="flex items-center gap-2 truncate">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
                <span className="truncate">{other.title}</span>
              </div>
              <ChevronRightIcon className="w-4 h-4 text-slate-400 shrink-0" />
            </Link>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between">
          <Link
            href="/politica"
            className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1"
          >
            <ArrowLeftIcon className="w-3.5 h-3.5" />
            <span>Retornar à Central e Confirmar Termos</span>
          </Link>

          <Link
            href="/verificacao"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-colors"
          >
            <ShieldCheckIcon className="w-3.5 h-3.5" />
            <span>Verificar Minha Identidade</span>
          </Link>
        </div>
      </div>
    </article>
  );
}

