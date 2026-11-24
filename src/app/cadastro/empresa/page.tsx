"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { ApiError, mensagemDeErro } from "@/api/erro";
import { CadastroShell } from "@/components/conta/cadastro-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { cnpjValido, cpfValido, mascaraCnpj, mascaraCpf, mascaraTelefone } from "@/lib/bairros";
import { useSessao } from "@/lib/session";
import { contaApi } from "@/services/conta";

type Tipo = "pf" | "pj";
type Erros = Record<string, string>;

export default function CadastroContratantePage() {
  const router = useRouter();
  const { atualizar } = useSessao();
  const { avisar } = useToast();
  const [tipo, setTipo] = useState<Tipo>("pf");
  const [documento, setDocumento] = useState("");
  const [razaoSocial, setRazaoSocial] = useState("");
  const [telefone, setTelefone] = useState("");
  const [erros, setErros] = useState<Erros>({});
  const [erroGeral, setErroGeral] = useState<string>();
  const [enviando, setEnviando] = useState(false);

  function validar(): Erros {
    const e: Erros = {};
    if (tipo === "pf" && !cpfValido(documento)) e.documento = "Informe um CPF válido.";
    if (tipo === "pj") {
      if (!razaoSocial.trim()) e.razao_social = "Informe a razão social.";
      if (documento && !cnpjValido(documento)) e.documento = "CNPJ inválido.";
    }
    if (telefone.replace(/\D/g, "").length < 10) e.telefone = "Informe o telefone com DDD.";
    return e;
  }

  async function enviar(ev: FormEvent) {
    ev.preventDefault();
    const invalidos = validar();
    setErros(invalidos);
    setErroGeral(undefined);
    if (Object.keys(invalidos).length > 0) return;

    setEnviando(true);
    try {
      await contaApi.cadastrarContratante({
        tipo_pessoa: tipo,
        documento: documento || null,
        razao_social: tipo === "pj" ? razaoSocial.trim() : null,
        telefone,
      });
      await atualizar();
      avisar("Cadastro enviado. Falta verificar sua identidade.", "success");
      router.replace("/verificacao?origem=cadastro");
    } catch (err) {
      if (err instanceof ApiError && Object.keys(err.campos).length > 0) setErros(err.campos);
      setErroGeral(mensagemDeErro(err));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <CadastroShell titulo="Cadastro do contratante" descricao="Pessoa física ou empresa. A verificação de identidade vem logo depois.">
      <form onSubmit={enviar} noValidate className="grid gap-4">
        <fieldset className="grid gap-2">
          <legend className="mb-1 text-sm font-semibold">Tipo de contratante</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {(
              [
                ["pf", "Pessoa física"],
                ["pj", "Empresa"],
              ] as const
            ).map(([valor, rotulo]) => (
              <label key={valor} className="flex cursor-pointer items-center gap-2 rounded-lg border border-borda px-3 py-2">
                <input type="radio" name="tipo" checked={tipo === valor} onChange={() => { setTipo(valor); setDocumento(""); setErros({}); }} />
                {rotulo}
              </label>
            ))}
          </div>
        </fieldset>

        {tipo === "pj" && (
          <Input label="Razão social" value={razaoSocial} onChange={(e) => setRazaoSocial(e.target.value)} error={erros.razao_social} maxLength={160} />
        )}
        <Input
          label={tipo === "pf" ? "CPF" : "CNPJ (opcional)"}
          inputMode="numeric"
          value={documento}
          onChange={(e) => setDocumento(tipo === "pf" ? mascaraCpf(e.target.value) : mascaraCnpj(e.target.value))}
          error={erros.documento}
        />
        <Input label="Telefone com DDD" inputMode="tel" value={telefone} onChange={(e) => setTelefone(mascaraTelefone(e.target.value))} error={erros.telefone} hint="O telefone não aparece para os profissionais." />

        {erroGeral && <p role="alert" className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">{erroGeral}</p>}
        <div className="flex justify-end">
          <Button type="submit" loading={enviando}>Enviar cadastro</Button>
        </div>
      </form>
    </CadastroShell>
  );
}
