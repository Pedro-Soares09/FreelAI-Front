import Link from "next/link";
import type { ReactNode } from "react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

type CadastroShellProps = {
  titulo: string;
  descricao: string;
  children: ReactNode;
};

/** Moldura das telas de cadastro, mais larga que a de login para caber os formulários em etapas. */
export function CadastroShell({ titulo, descricao, children }: CadastroShellProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4">
        <Link href="/" className="text-xl font-extrabold tracking-tight text-primary">
          FreelAI
        </Link>
        <ThemeToggle />
      </header>
      <main className="flex flex-1 justify-center px-4 pb-16">
        <div className="w-full max-w-2xl rounded-card border border-borda bg-surface p-6 sm:p-8">
          <h1 className="text-2xl font-bold">{titulo}</h1>
          <p className="mt-1 text-sm text-muted">{descricao}</p>
          <div className="mt-6">{children}</div>
        </div>
      </main>
    </div>
  );
}
