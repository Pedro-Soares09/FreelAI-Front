"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/user-context";
import {
  UserIcon,
  BuildingIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
  CheckIcon,
} from "@/components/ui/icons";

export default function LoginPage() {
  const router = useRouter();
  const { accountType, setAccountType, loginAs } = useUser();

  const [activeTab, setActiveTab] = useState<"login" | "escolher_tipo">("login");
  const [selectedType, setSelectedType] = useState<"profissional" | "empresa">(
    accountType,
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      loginAs(selectedType);
      setLoading(false);
      setSuccessMsg(`Login efetuado com sucesso como ${selectedType === "profissional" ? "Profissional" : "Empresa"}!`);
      setTimeout(() => {
        router.push("/perfil");
      }, 700);
    }, 400);
  };

  const handleQuickDemo = (type: "profissional" | "empresa") => {
    loginAs(type);
    setSelectedType(type);
    setSuccessMsg(`Entrando como conta demonstração: ${type === "profissional" ? "Lucas Mendes (Profissional Verificado)" : "TechSolutions (Empresa)"}`);
    setTimeout(() => {
      router.push("/perfil");
    }, 600);
  };

  return (
    <main className="page max-w-4xl">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold mb-3">
          <ShieldCheckIcon className="w-4 h-4" />
          <span>Acesso Seguro & Contas Verificadas</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Acesse sua conta no FreelAI
        </h1>
        <p className="text-slate-600 mt-2 text-sm sm:text-base">
          Conecte-se como profissional qualificado ou empresa contratante.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 mb-8 max-w-md mx-auto">
        <button
          type="button"
          onClick={() => setActiveTab("login")}
          className={`flex-1 py-3 text-sm font-semibold text-center border-b-2 transition-all ${
            activeTab === "login"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Entrar na Conta
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("escolher_tipo")}
          className={`flex-1 py-3 text-sm font-semibold text-center border-b-2 transition-all ${
            activeTab === "escolher_tipo"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Criar Nova Conta
        </button>
      </div>

      {successMsg && (
        <div className="max-w-md mx-auto mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2">
          <CheckIcon className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {activeTab === "login" ? (
        <div className="max-w-md mx-auto bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
          {/* Seletor do Tipo de Conta no Login */}
          <div className="mb-6">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Tipo de Conta
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedType("profissional");
                  setAccountType("profissional");
                }}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-sm font-medium transition-all ${
                  selectedType === "profissional"
                    ? "border-indigo-600 bg-indigo-50/70 text-indigo-700 shadow-xs font-semibold"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                }`}
              >
                <UserIcon className="w-4 h-4" />
                <span>Profissional</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedType("empresa");
                  setAccountType("empresa");
                }}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-sm font-medium transition-all ${
                  selectedType === "empresa"
                    ? "border-indigo-600 bg-indigo-50/70 text-indigo-700 shadow-xs font-semibold"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                }`}
              >
                <BuildingIcon className="w-4 h-4" />
                <span>Empresa</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                {selectedType === "profissional"
                  ? "E-mail do profissional"
                  : "E-mail corporativo"}
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={
                  selectedType === "profissional"
                    ? "lucas.mendes@freelai.com.br"
                    : "contato@empresa.com.br"
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm text-slate-900 placeholder:text-slate-400"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-slate-700"
                >
                  Senha
                </label>
                <a
                  href="#recuperar"
                  onClick={(e) => {
                    e.preventDefault();
                    alert("Instruções de redefinição enviadas para o e-mail.");
                  }}
                  className="text-xs text-indigo-600 hover:underline"
                >
                  Esqueceu a senha?
                </a>
              </div>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm text-slate-900"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-colors shadow-sm disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? (
                <span>Autenticando...</span>
              ) : (
                <>
                  <span>Entrar como {selectedType === "profissional" ? "Profissional" : "Empresa"}</span>
                  <ArrowRightIcon className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Atalhos para testar instantaneamente */}
          <div className="mt-8 pt-6 border-t border-slate-200">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider text-center mb-3">
              Acesso Rápido para Demonstração
            </p>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleQuickDemo("profissional")}
                className="w-full py-2 px-3 rounded-lg border border-blue-200 bg-blue-50/60 hover:bg-blue-100/70 text-blue-800 text-xs font-medium text-left flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                  <span>Lucas Mendes (Profissional Verificado ✓)</span>
                </div>
                <span className="text-[11px] font-semibold text-blue-700">Entrar</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo("empresa")}
                className="w-full py-2 px-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-medium text-left flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                  <span>TechSolutions Ltda (Empresa / CNPJ)</span>
                </div>
                <span className="text-[11px] font-semibold text-slate-700">Entrar</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Escolha do tipo de conta (Profissional ou Empresa) */
        <div className="max-w-2xl mx-auto">
          <div className="grid sm:grid-cols-2 gap-6">
            {/* Opção Profissional */}
            <div
              onClick={() => {
                setSelectedType("profissional");
                setAccountType("profissional");
              }}
              className={`cursor-pointer rounded-2xl border-2 p-6 transition-all bg-white relative flex flex-col justify-between ${
                selectedType === "profissional"
                  ? "border-indigo-600 ring-4 ring-indigo-50 shadow-md"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-4">
                  <UserIcon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  Sou Profissional Freelancer
                </h3>
                <p className="text-slate-600 text-xs sm:text-sm mt-2 leading-relaxed">
                  Quero oferecer meus serviços, receber oportunidades sob medida,
                  validar minha identidade com o selo verificado e construir reputação com avaliações reais.
                </p>
                <ul className="mt-4 space-y-1.5 text-xs text-slate-600">
                  <li className="flex items-center gap-2">
                    <CheckIcon className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Cadastro em etapas guiadas</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckIcon className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Comprovação de características e skills</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckIcon className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Selo Verificado com CPF e Selfie</span>
                  </li>
                </ul>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100">
                <Link
                  href="/cadastro/profissional"
                  className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
                >
                  <span>Cadastrar como Profissional</span>
                  <ArrowRightIcon className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Opção Empresa */}
            <div
              onClick={() => {
                setSelectedType("empresa");
                setAccountType("empresa");
              }}
              className={`cursor-pointer rounded-2xl border-2 p-6 transition-all bg-white relative flex flex-col justify-between ${
                selectedType === "empresa"
                  ? "border-indigo-600 ring-4 ring-indigo-50 shadow-md"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
                  <BuildingIcon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  Sou Empresa / Contratante
                </h3>
                <p className="text-slate-600 text-xs sm:text-sm mt-2 leading-relaxed">
                  Quero publicar vagas, encontrar talentos com identidade comprovada,
                  gerenciar propostas e contratar com segurança e proteção de pagamento.
                </p>
                <ul className="mt-4 space-y-1.5 text-xs text-slate-600">
                  <li className="flex items-center gap-2">
                    <CheckIcon className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Validação oficial de CNPJ</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckIcon className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Acesso a profissionais verificados</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckIcon className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Contratos e pagamentos em custódia</span>
                  </li>
                </ul>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100">
                <Link
                  href="/cadastro/empresa"
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
                >
                  <span>Cadastrar como Empresa</span>
                  <ArrowRightIcon className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
