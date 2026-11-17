"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Notificacoes } from "./notificacoes";
import { useToast } from "@/components/ui/toast";
import { mensagemDeErro } from "@/api/erro";
import type { TipoPerfil } from "@/api/tipos";
import { useSessao } from "@/lib/session";

const ROTULOS: Record<TipoPerfil, string> = {
  profissional: "Profissional",
  contratante: "Contratante",
};

export function Header() {
  const { usuario, sair, trocarPerfil } = useSessao();
  const router = useRouter();
  const { avisar } = useToast();

  async function aoTrocar(perfil: TipoPerfil) {
    try {
      await trocarPerfil(perfil);
      router.refresh();
    } catch (e) {
      avisar(mensagemDeErro(e), "error");
    }
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-borda bg-surface px-3 sm:px-4 md:px-6">
      <Link href="/" className="text-lg font-extrabold tracking-tight text-primary">
        FreelAI
      </Link>
      <div className="flex items-center gap-1.5 sm:gap-3">
        {usuario && usuario.perfis.length > 1 && (
          <div className="w-28 sm:w-40">
            <Select
              label="Perfil ativo"
              ocultarRotulo
              value={usuario.perfil_ativo ?? ""}
              onChange={(e) => void aoTrocar(e.target.value as TipoPerfil)}
              opcoes={usuario.perfis.map((p) => ({ valor: p, rotulo: ROTULOS[p] }))}
            />
          </div>
        )}
        {usuario && <Notificacoes />}
        <ThemeToggle />
        {usuario && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              sair();
              router.replace("/login");
            }}
          >
            Sair
          </Button>
        )}
      </div>
    </header>
  );
}
