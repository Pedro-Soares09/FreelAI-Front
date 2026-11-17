import Link from "next/link";
import { TrustSeals } from "@/components/shared/trust-seals";
import {
  ShieldCheckIcon,
  UserIcon,
  BuildingIcon,
  SparklesIcon,
  ArrowRightIcon,
  StarIcon,
  LockIcon,
} from "@/components/ui/icons";

export default function HomePage() {
  return (
    <main className="page max-w-5xl">
      {/* Hero Section */}
      <div className="py-10 sm:py-16 text-center max-w-3xl mx-auto space-y-5">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold uppercase tracking-wider shadow-2xs">
          <ShieldCheckIcon className="w-4 h-4 text-indigo-600" />
          <span>Plataforma com Verificação Real de Identidade & LGPD</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Conectando Empresas aos Melhores{" "}
          <span className="text-indigo-600">Profissionais Verificados</span>
        </h1>

        <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
          Encontre freelancers qualificados com identidade certificada por CPF, documento oficial e selfie biométrica,
          além de avaliações reais e características comprovadas.
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
          <Link
            href="/login"
            className="py-3 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-sm transition-all flex items-center gap-2"
          >
            <span>Acessar Conta / Cadastre-se</span>
            <ArrowRightIcon className="w-4 h-4" />
          </Link>

          <Link
            href="/vagas"
            className="py-3 px-6 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-semibold text-sm transition-all shadow-2xs"
          >
            Explorar Vagas
          </Link>

          <Link
            href="/perfil/publico"
            className="py-3 px-6 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-800 font-semibold text-sm transition-all flex items-center gap-2 shadow-2xs"
          >
            <ShieldCheckIcon className="w-4 h-4 text-blue-600" />
            <span>Ver Perfil Verificado (Demo)</span>
          </Link>
        </div>

        {/* Trust Seals */}
        <div className="pt-6 flex justify-center">
          <TrustSeals />
        </div>
      </div>

      {/* Destaques das Funcionalidades Entregues no Módulo */}
      <div className="mt-8 pt-8 border-t border-slate-200/80">
        <h2 className="text-center text-xs font-bold uppercase tracking-wider text-slate-500 mb-6">
          Módulo Conta, Verificação e Política
        </h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Card 1: Login & Escolha do Tipo de Conta */}
          <Link
            href="/login"
            className="p-6 rounded-2xl bg-white border border-slate-200/90 hover:border-indigo-400 hover:shadow-xs transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center mb-3 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <UserIcon className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base group-hover:text-indigo-600 transition-colors">
                Login & Escolha de Conta
              </h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                Acesso unificado com seleção entre perfil Profissional Freelancer e Empresa Contratante, com demonstração rápida.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-indigo-600">
              <span>Acessar Login</span>
              <ArrowRightIcon className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 2: Cadastro em Etapas & Empresa */}
          <Link
            href="/cadastro/profissional"
            className="p-6 rounded-2xl bg-white border border-slate-200/90 hover:border-indigo-400 hover:shadow-xs transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <SparklesIcon className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base group-hover:text-emerald-700 transition-colors">
                Cadastro em Etapas
              </h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                Nome, data de nascimento, histórico de experiências, características (comunicação, agilidade, proatividade) e localização obrigatória.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-emerald-700">
              <span>Iniciar Cadastro</span>
              <ArrowRightIcon className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 3: Verificação de Identidade (Selo Verificado) */}
          <Link
            href="/verificacao"
            className="p-6 rounded-2xl bg-white border border-slate-200/90 hover:border-blue-400 hover:shadow-xs transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mb-3 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <ShieldCheckIcon className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base group-hover:text-blue-700 transition-colors">
                Verificação de Identidade
              </h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                A tela que alimenta o selo &quot;Verificado&quot;: envio de CPF com máscara, documento e selfie, com status em análise, verificado e recusado.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-blue-700">
              <span>Verificar Identidade</span>
              <ArrowRightIcon className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 4: Cadastro de Empresa (Razão Social & CNPJ) */}
          <Link
            href="/cadastro/empresa"
            className="p-6 rounded-2xl bg-white border border-slate-200/90 hover:border-emerald-400 hover:shadow-xs transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center mb-3 group-hover:bg-slate-800 group-hover:text-white transition-colors">
                <BuildingIcon className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base group-hover:text-slate-900 transition-colors">
                Cadastro de Empresa
              </h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                Razão Social, Nome Fantasia e CNPJ com máscara em tempo real e validação de algoritmo dos dígitos verificadores.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-700">
              <span>Cadastrar Empresa</span>
              <ArrowRightIcon className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 5: Políticas do App & 5 páginas */}
          <Link
            href="/politica"
            className="p-6 rounded-2xl bg-white border border-slate-200/90 hover:border-indigo-400 hover:shadow-xs transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center mb-3 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                <LockIcon className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base group-hover:text-purple-700 transition-colors">
                Políticas do App (5 Páginas)
              </h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                Central de governança, 5 páginas de detalhe por item, toggle funcional de notificações e checkbox que habilita o botão de confirmação.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-purple-700">
              <span>Ler Políticas</span>
              <ArrowRightIcon className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 6: Perfil & Perfil Público Verificado */}
          <Link
            href="/perfil/publico"
            className="p-6 rounded-2xl bg-white border border-slate-200/90 hover:border-amber-400 hover:shadow-xs transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-3 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                <StarIcon className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base group-hover:text-amber-700 transition-colors">
                Perfil & Avaliações Recebidas
              </h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                Perfil próprio editável e perfil público (&quot;Ver perfil verificado&quot;) com nota média, depoimentos recebidos e características em barras.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-amber-700">
              <span>Ver Perfil Público</span>
              <ArrowRightIcon className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
}
