"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

type NavLinkProps = { href: string; className?: string; ativoClasse: string; children: string };

export function NavLink({ href, className, ativoClasse, children }: NavLinkProps) {
  const caminho = usePathname();
  const ativo = caminho === href || caminho.startsWith(`${href}/`);
  return (
    <Link
      href={href}
      aria-current={ativo ? "page" : undefined}
      className={cn(className, ativo && ativoClasse)}
    >
      {children}
    </Link>
  );
}
