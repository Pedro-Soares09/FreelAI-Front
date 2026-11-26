"use client";

import { useEffect, useState, type FormEvent } from "react";
import { mensagemDeErro } from "@/api/erro";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatarDataHora, sancoesApi, type SituacaoDaConta } from "@/services/sancoes";

type Props = {
  tipo: "conta_suspensa" | "conta_banida";
  email: string;
  senha: string;
  onVoltar: () => void;
};

/** Tela da conta suspensa ou banida: motivo, data de retorno e contestação (uma por caso). */
export function ContaBloqueada({ tipo, email, senha, onVoltar }: Props) {
  const suspensa = tipo === "conta_suspensa";
  const [situacao, setSituacao] = useState<SituacaoDaConta>();
  const [texto, setTexto] = useState("");
  const [erro, setErro] = useState<string>();
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    let ativo = true;
    sancoesApi
      .situacao(email, senha)
      .then((s) => ativo && setSituacao(s))
      .catch((e) => ativo && setErro(mensagemDeErro(e)));
    return () => {
      ativo = false;
    };
  }, [email, senha]);

  async function contestar(e: FormEvent) {
    e.preventDefault();
    setErro(undefined);
    if (texto.trim().length < 10) {
      setErro("Explique o seu caso em pelo menos 10 caracteres.");
      return;
    }
    setEnviando(true);
    try {
      setSituacao(await sancoesApi.contestar(email, senha, texto));
      setTexto("");
    } catch (err) {
      setErro(mensagemDeErro(err));
    } finally {
      setEnviando(false);
    }
  }

  const sancao = situacao?.sancao;
  const contestacao = situacao?.contestacao;

  return (
    <div className="grid gap-4" role="alert">
      <div className="rounded-lg border border-danger/40 bg-danger/10 p-4">
        <h2 className="text-lg font-bold text-danger">
          {suspensa ? "Conta suspensa" : "Conta banida"}
        </h2>
        <p className="mt-1 text-sm">
          {suspensa
            ? "Sua conta está suspensa temporariamente e não pode entrar na plataforma."
            : "Sua conta foi banida e não pode entrar na plataforma."}
        </p>
        {sancao && (
          <dl className="mt-3 grid gap-1 text-sm">
            <div>
              <dt className="inline font-semibold">Motivo: </dt>
              <dd className="inline">{sancao.motivo}</dd>
            </div>
            {suspensa && sancao.retorno_em && (
              <div>
                <dt className="inline font-semibold">Retorno em: </dt>
                <dd className="inline">{formatarDataHora(sancao.retorno_em)}</dd>
              </div>
            )}
            <div>
              <dt className="inline font-semibold">Contestação até: </dt>
              <dd className="inline">{formatarDataHora(sancao.contestavel_ate)}</dd>
            </div>
          </dl>
        )}
      </div>

      {contestacao ? (
        <div className="rounded-lg border border-borda bg-surface p-4 text-sm">
          <h3 className="font-semibold">Sua contestação</h3>
          <p className="mt-1 text-muted">{contestacao.texto}</p>
          <p className="mt-2 font-semibold">
            {contestacao.decidida_em
              ? contestacao.aceita
                ? "Contestação aceita. Você já pode entrar."
                : `Contestação recusada: ${contestacao.motivo_decisao ?? ""}`
              : "Em análise pela administração."}
          </p>
        </div>
      ) : sancao?.pode_contestar ? (
        <form onSubmit={contestar} noValidate className="grid gap-3">
          <Textarea
            label="Contestar esta decisão"
            hint="Cada caso aceita uma única contestação, enviada dentro do prazo."
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            rows={4}
            maxLength={1000}
          />
          <Button type="submit" loading={enviando}>
            Enviar contestação
          </Button>
        </form>
      ) : sancao ? (
        <p className="text-sm text-muted">O prazo para contestar este caso terminou.</p>
      ) : null}

      {erro && <p className="text-sm text-danger">{erro}</p>}
      <Button type="button" variant="secondary" onClick={onVoltar}>
        Voltar ao login
      </Button>
    </div>
  );
}
