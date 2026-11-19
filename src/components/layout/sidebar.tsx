"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@/context/user-context";
import {
  BriefcaseIcon,
  SparklesIcon,
  FileTextIcon,
  UserIcon,
  ShieldCheckIcon,
  LockIcon,
  MessageSquareIcon,
} from "@/components/ui/icons";

export function Sidebar() {
  const pathname = usePathname();
  const { accountType, verificationStatus } = useUser();

  const links = [
    { href: "/vagas", label: "Vagas", icon: BriefcaseIcon },
    { href: "/match", label: "Match Inteligente", icon: SparklesIcon },
    { href: "/criar-vaga", label: "Criar Vaga", icon: FileTextIcon },
    { href: "/chat", label: "Mensagens & Chat", icon: MessageSquareIcon },
    {
      href: "/verificacao",
      label: "Verificação de Identidade",
      icon: ShieldCheckIcon,
      badge:
        accountType === "profissional"
          ? verificationStatus === "verificado"
            ? "Verificado"
            : verificationStatus === "em_analise"
              ? "Em análise"
              : verificationStatus === "recusado"
                ? "Recusado"
                : "Pendente"
          : null,
      badgeColor:
        verificationStatus === "verificado"
          ? "bg-blue-100 text-blue-700"
          : verificationStatus === "em_analise"
            ? "bg-amber-100 text-amber-700"
            : verificationStatus === "recusado"
              ? "bg-rose-100 text-rose-700"
              : "bg-slate-100 text-slate-600",
    },
    { href: "/perfil", label: "Meu Perfil", icon: UserIcon },
    { href: "/perfil/publico", label: "Ver Perfil Público", icon: UserIcon },
    { href: "/politica", label: "Políticas do App", icon: LockIcon },
    { href: "/login", label: "Login & Conta", icon: UserIcon },
  ];

  return (
    <aside className="site-sidebar" aria-label="Navegação principal">
      <nav className="flex flex-col gap-1">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive =
            pathname === link.href ||
            (link.href !== "/" && pathname.startsWith(link.href + "/"));

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? "bg-indigo-50 text-indigo-700 font-semibold"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? "text-indigo-600" : "text-slate-400"
                  }`}
                />
                <span>{link.label}</span>
              </div>
              {link.badge && (
                <span
                  className={`text-[11px] px-1.5 py-0.5 rounded font-semibold ${link.badgeColor}`}
                >
                  {link.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
