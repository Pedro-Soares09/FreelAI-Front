"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BriefcaseIcon,
  SparklesIcon,
  ShieldCheckIcon,
  UserIcon,
  LockIcon,
} from "@/components/ui/icons";

export function MobileNav() {
  const pathname = usePathname();

  const links = [
    { href: "/vagas", label: "Vagas", icon: BriefcaseIcon },
    { href: "/match", label: "Match", icon: SparklesIcon },
    { href: "/verificacao", label: "Verificar", icon: ShieldCheckIcon },
    { href: "/perfil", label: "Perfil", icon: UserIcon },
    { href: "/politica", label: "Políticas", icon: LockIcon },
  ];

  return (
    <nav className="mobile-nav" aria-label="Navegação móvel">
      {links.map((link) => {
        const Icon = link.icon;
        const isActive =
          pathname === link.href ||
          (link.href !== "/" && pathname.startsWith(link.href + "/"));

        return (
          <Link
            key={link.href}
            href={link.href}
            className={`flex flex-col items-center gap-1 text-xs font-medium transition-colors ${
              isActive ? "text-indigo-600 font-semibold" : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <Icon className="w-5 h-5" />
            <span>{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
