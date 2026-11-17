"use client";

import { Suspense, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ApiError, mensagemDeErro } from "@/api/erro";
import { AuthShell } from "@/components/conta/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { useSessao } from "@/lib/session";

const TEXTO_TIPO: Record<string, string> = {
  profissional: "Você está criando uma conta para trabalhar na FREELAI.",
  contratante: "Você está criando uma conta para contratar serviços na FREELAI.",
};

function FormularioRegistro() {
  const router = useRouter();
  const params = useSearchParams();
  const { registrar, entrar } = useSessao();
  const { avisar } = useToast();
  const tipo = params.get("tipo") ?? "";

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [erros, setErros] = useState<Record<string, string>>({});
  const [erroGeral, setErroGeral] = useState<string>();
  const [enviando, setEnviando] = useState(false);

  function validar(): Record<string, string> {
    const e: Record<string, string> = {};
    if (!nome.trim()) e.nome = "Informe seu nome.";
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) e.email = "Informe um e-mail válido.";
    if (senha.length < 8) e.senha = "A senha deve ter pelo menos 8 caracteres.";
    else if (new TextEncoder().encode(senha).length > 72) e.senha = "A senha é longa demais.";
    if (confirmacao !== senha) e.confirmacao = "As senhas não coincidem.";
    return e;
  }

  async function aoEnviar(ev: FormEvent) {
    ev.preventDefault();
    const invalidos = validar();
    setErros(invalidos);
    setErroGeral(undefined);
    if (Object.keys(invalidos).length > 0) return;

    setEnviando(true);
    try {
      await registrar({ nome: nome.trim(), email: email.trim(), senha });
      await entrar(email.trim(), senha);
      avisar("Conta criada com sucesso.", "success");
      router.replace(
        tipo === "contratante" ? "/cadastro/empresa" : tipo === "profissional" ? "/cadastro/profissional" : "/vagas",
      );
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
      {TEXTO_TIPO[tipo] && (
        <p className="rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-sm">
          {TEXTO_TIPO[tipo]}
        </p>
      )}
      <Input
        label="Nome completo"
        autoComplete="name"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        error={erros.nome}
      />
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
        autoComplete="new-password"
        value={senha}
        onChange={(e) => setSenha(e.target.value)}
        error={erros.senha}
        hint="Mínimo de 8 caracteres."
      />
      <Input
        label="Confirmar senha"
        type="password"
        autoComplete="new-password"
        value={confirmacao}
        onChange={(e) => setConfirmacao(e.target.value)}
        error={erros.confirmacao}
      />
      {erroGeral && (
        <p role="alert" className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">
          {erroGeral}
        </p>
      )}
      <Button type="submit" size="lg" loading={enviando}>
        Criar conta
      </Button>
    </form>
  );
}

export default function RegistroPage() {
  return (
    <AuthShell
      titulo="Criar conta"
      descricao="Leva menos de um minuto. Depois você completa o cadastro."
      rodape={
        <>
          Já tem conta?{" "}
          <Link href="/login" className="font-semibold text-primary hover:underline">
            Entrar
          </Link>
        </>
      }
    >
      <Suspense fallback={null}>
        <FormularioRegistro />
      </Suspense>
    </AuthShell>
  );
}
