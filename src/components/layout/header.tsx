"use client";

import Link from "next/link";
import { useUser } from "@/context/user-context";
import { AvatarVerified } from "@/components/shared/avatar-verified";
import { ShieldCheckIcon, ShieldAlertIcon, ClockIcon } from "@/components/ui/icons";

export function Header() {
  const {
    accountType,
    professionalProfile,
    companyProfile,
    verificationStatus,
    setAccountType,
  } = useUser();

  const isProf = accountType === "profissional";
  const displayName = isProf ? professionalProfile.name : companyProfile.tradeName || companyProfile.corporateReason;
  const avatarUrl = isProf ? professionalProfile.avatarUrl : undefined;

  return (
    <header className="site-header">
      <div className="flex items-center gap-6">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-sm group-hover:bg-indigo-700 transition-colors">
            F
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-900">
            Freel<span className="text-indigo-600">AI</span>
          </span>
        </Link>

        {/* Quick Role Switcher for testing/demo convenience */}
        <div className="hidden md:flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
          <button
            type="button"
            onClick={() => setAccountType("profissional")}
            className={`px-2.5 py-1 rounded-md font-medium transition-all ${
              isProf
                ? "bg-white text-indigo-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Profissional
          </button>
          <button
            type="button"
            onClick={() => setAccountType("empresa")}
            className={`px-2.5 py-1 rounded-md font-medium transition-all ${
              !isProf
                ? "bg-white text-indigo-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Empresa
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-5">
        {/* Verification Status Pill */}
        {isProf && (
          <Link
            href="/verificacao"
            className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-colors"
          >
            {verificationStatus === "verificado" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                <ShieldCheckIcon className="w-3.5 h-3.5 text-blue-600" />
                <span>Selo Verificado</span>
              </span>
            )}
            {verificationStatus === "em_analise" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                <ClockIcon className="w-3.5 h-3.5 text-amber-600" />
                <span>Em Análise</span>
              </span>
            )}
            {verificationStatus === "recusado" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                <ShieldAlertIcon className="w-3.5 h-3.5 text-rose-600" />
                <span>Recusado (Reenviar)</span>
              </span>
            )}
            {verificationStatus === "nao_verificado" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200">
                <span>Verificar Conta</span>
              </span>
            )}
          </Link>
        )}

        {/* Políticas link */}
        <Link
          href="/politica"
          className="text-xs md:text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors hidden sm:block"
        >
          Políticas do App
        </Link>

        {/* Profile with Avatar */}
        <Link
          href="/perfil"
          className="flex items-center gap-2 p-1 pl-2 pr-3 rounded-full hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
        >
          <AvatarVerified
            name={displayName}
            imageUrl={avatarUrl}
            status={isProf ? verificationStatus : undefined}
            verified={!isProf}
            size="sm"
          />
          <span className="text-xs md:text-sm font-medium text-slate-800 max-w-[120px] truncate">
            {displayName}
          </span>
        </Link>
      </div>
    </header>
  );
}
