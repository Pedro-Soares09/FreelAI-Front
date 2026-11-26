"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Carregando } from "@/components/ui/estados";
import { useToast } from "@/components/ui/toast";
import { verificarAcesso } from "@/lib/rotas";
import { useSessao } from "@/lib/session";

function TelaDeConta({ titulo, texto }: { titulo: string; texto: string }) {
  const { sair } = useSessao();
  const router = useRouter();
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-3 p-6 text-center">
      <h1 className="text-2xl font-bold">{titulo}</h1>
      <p className="text-muted">{texto}</p>
      <Button
        variant="secondary"
        onClick={() => {
          sair();
          router.replace("/login");
        }}
      >
        Sair
      </Button>
    </div>
  );
}

export function RouteGuard({ children }: { children: ReactNode }) {
  const { estado, usuario, bloqueio } = useSessao();
  const caminho = usePathname();
  const router = useRouter();
  const { avisar } = useToast();

  const acesso =
    usuario && usuario.estado === "ativa" ? verificarAcesso(caminho, usuario) : null;

  useEffect(() => {
    if (estado === "anonimo") {
      router.replace(`/login?next=${encodeURIComponent(caminho)}`);
      return;
    }
    if (acesso && !acesso.permitido) {
      avisar(acesso.motivo, "info");
      router.replace(acesso.destino);
    }
  }, [estado, acesso, caminho, router, avisar]);

  if (estado === "bloqueado" && bloqueio) {
    const retornoEm =
      bloqueio.retornoEm && !Number.isNaN(Date.parse(bloqueio.retornoEm))
        ? ` A suspensão termina em ${new Date(bloqueio.retornoEm).toLocaleString("pt-BR")}.`
        : "";
    return (
      <TelaDeConta
        titulo={bloqueio.codigo === "conta_suspensa" ? "Conta suspensa" : "Conta banida"}
        texto={`${bloqueio.mensagem}${retornoEm}`}
      />
    );
  }

  if (estado === "carregando" || estado === "anonimo") return <Carregando rotulo="Verificando sessão" />;
  if (!usuario) return <Carregando rotulo="Verificando sessão" />;

  if (usuario.estado === "pendente") {
    return (
      <TelaDeConta
        titulo="Conta em verificação"
        texto="Seu cadastro ainda está sendo analisado. Você poderá usar a plataforma assim que for aprovado."
      />
    );
  }
  if (usuario.estado === "suspensa") {
    return (
      <TelaDeConta
        titulo="Conta suspensa"
        texto="Sua conta está suspensa temporariamente. Entre em contato com o suporte para mais detalhes."
      />
    );
  }
  if (usuario.estado === "banida") {
    return (
      <TelaDeConta
        titulo="Conta banida"
        texto="Sua conta foi encerrada por violação das regras da plataforma."
      />
    );
  }

  if (acesso && !acesso.permitido) return <Carregando rotulo="Redirecionando" />;

  return <>{children}</>;
}
