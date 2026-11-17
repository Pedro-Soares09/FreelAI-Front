"use client";

import { Suspense, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ApiError, mensagemDeErro } from "@/api/erro";
import { AuthShell } from "@/components/conta/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSessao } from "@/lib/session";

function destinoSeguro(next: string | null): string {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/vagas";
}

function FormularioLogin() {
  const router = useRouter();
  const params = useSearchParams();
  const { estado, entrar } = useSessao();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erros, setErros] = useState<Record<string, string>>({});
  const [erroGeral, setErroGeral] = useState<string>();
  const [enviando, setEnviando] = useState(false);

  const destino = destinoSeguro(params.get("next"));

  useEffect(() => {
    if (estado === "autenticado") router.replace(destino);
  }, [estado, destino, router]);

  async function aoEnviar(e: FormEvent) {
    e.preventDefault();
    const novos: Record<string, string> = {};
    if (!email.trim()) novos.email = "Informe o e-mail.";
    if (!senha) novos.senha = "Informe a senha.";
    setErros(novos);
    setErroGeral(undefined);
    if (Object.keys(novos).length > 0) return;

    setEnviando(true);
    try {
      await entrar(email.trim(), senha);
      router.replace(destino);
    } catch (err) {
      if (err instanceof ApiError && Object.keys(err.campos).length > 0) {
        setErros(err.campos);
      } else {
        setErroGeral(mensagemDeErro(err));
      }
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={aoEnviar} noValidate className="grid gap-4">
      <Input
        label="E-mail"
        type="email"
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={erros.email}
      />
      <Input
        label="Senha"
        type="password"
        autoComplete="current-password"
        value={senha}
        onChange={(e) => setSenha(e.target.value)}
        error={erros.senha}
      />
      {erroGeral && (
        <p role="alert" className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">
          {erroGeral}
        </p>
      )}
      <Button type="submit" size="lg" loading={enviando}>
        Entrar
      </Button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <AuthShell
      titulo="Entrar"
      descricao="Acesse sua conta para ver vagas, convites e conversas."
      rodape={
        <>
          Ainda não tem conta?{" "}
          <Link href="/registro" className="font-semibold text-primary hover:underline">
            Cadastre-se
          </Link>
        </>
      }
    >
      <Suspense fallback={null}>
        <FormularioLogin />
      </Suspense>
    </AuthShell>
  );
}
