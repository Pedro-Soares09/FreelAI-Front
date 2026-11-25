import Link from "next/link";
import type { ReactNode } from "react";
import { AvisoBeta } from "@/components/institucional/aviso-beta";
import { ThemeToggle } from "@/components/ui/theme-toggle";

type AuthShellProps = {
  titulo: string;
  descricao: string;
  children: ReactNode;
  rodape: ReactNode;
};

export function AuthShell({ titulo, descricao, children, rodape }: AuthShellProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4">
        <Link href="/" className="text-xl font-extrabold tracking-tight text-primary">
          FreelAI
        </Link>
        <ThemeToggle />
      </header>
      <main className="flex flex-1 items-center justify-center px-4 pb-16">
        <div className="w-full max-w-md rounded-card border border-borda bg-surface p-6 shadow-neon sm:p-8">
          <h1 className="text-2xl font-bold">{titulo}</h1>
          <p className="mt-1 text-sm text-muted">{descricao}</p>
          <div className="mt-6">{children}</div>
          <p className="mt-6 text-center text-sm text-muted">{rodape}</p>
          <AvisoBeta className="mt-4" />
        </div>
      </main>
    </div>
  );
}
