"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { mensagemDeErro } from "@/api/erro";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Carregando } from "@/components/ui/estados";
import { useToast } from "@/components/ui/toast";
import { formatCurrency } from "@/lib/format";
import {
  ROTULOS_COMPROVANTE,
  comprovantesApi,
  type ResumoComprovantes,
  type TipoComprovante,
} from "@/services/comprovantes";

const TIPOS_CONTRATANTE: TipoComprovante[] = [
  "servico",
  "horas_extras",
  "bonus",
];
const TIPOS_PROFISSIONAL: TipoComprovante[] = ["servico"];
const ACEITOS = ["application/pdf", "image/jpeg", "image/png"];
const LIMITE_MB = 5;

type Props = {
  vagaId: string;
  /** Horas extras e bônus só podem ser anexados pelo contratante. */
  souContratante: boolean;
};

export function ComprovantesPanel({ vagaId, souContratante }: Props) {
  const { avisar } = useToast();
  const [resumo, setResumo] = useState<ResumoComprovantes | null>(null);
  const [erroCarga, setErroCarga] = useState(false);
  const [tipo, setTipo] = useState<TipoComprovante>("servico");
  const [valor, setValor] = useState("");
  const [acordo, setAcordo] = useState("");
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [erros, setErros] = useState<Record<string, string>>({});
  const [enviando, setEnviando] = useState(false);

  const carregar = useCallback(async () => {
    try {
      setResumo(await comprovantesApi.listar(vagaId));
      setErroCarga(false);
    } catch {
      setErroCarga(true);
    }
  }, [vagaId]);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  const adicional = tipo !== "servico";
  const taxa = Number(resumo?.percentual_taxa_adicional ?? 7);
  const valorNumero = Number(valor.replace(",", "."));
  const previaTaxa =
    adicional && valorNumero > 0 ? (valorNumero * taxa) / 100 : 0;

  async function enviar(e: FormEvent) {
    e.preventDefault();
    const novos: Record<string, string> = {};
    if (!(valorNumero > 0)) novos.valor = "Informe um valor maior que zero.";
    if (!arquivo) novos.arquivo = "Anexe o comprovante (PDF, JPG ou PNG).";
    else if (!ACEITOS.includes(arquivo.type))
      novos.arquivo = "Formato inválido. Use PDF, JPG ou PNG.";
    else if (arquivo.size > LIMITE_MB * 1024 * 1024)
      novos.arquivo = `O arquivo deve ter no máximo ${LIMITE_MB} MB.`;
    if (tipo === "horas_extras" && acordo.trim().length < 10) {
      novos.acordo =
        "Registre o acordo prévio das horas extras (mínimo de 10 caracteres).";
    }
    setErros(novos);
    if (Object.keys(novos).length > 0 || !arquivo) return;

    setEnviando(true);
    try {
      await comprovantesApi.anexar(vagaId, {
        tipo,
        valor: valorNumero,
        arquivo,
        acordoPrevio: acordo.trim() || undefined,
      });
      avisar("Comprovante anexado.", "success");
      setValor("");
      setAcordo("");
      setArquivo(null);
      await carregar();
    } catch (err) {
      avisar(mensagemDeErro(err), "error");
    } finally {
      setEnviando(false);
    }
  }

  if (!resumo && !erroCarga)
    return <Carregando rotulo="Carregando comprovantes" />;

  return (
    <Card>
      <h2 className="text-lg font-semibold">Comprovantes de pagamento</h2>
      <p className="mt-1 text-sm text-muted">
        O pagamento do serviço é feito após a conclusão, nas condições
        combinadas entre as partes. Horas extras e bônus são negociados
        diretamente e a plataforma cobra {taxa}% sobre esses valores adicionais.
        Contratantes que pagam adicionais ganham destaque no perfil.
      </p>

      {erroCarga && (
        <p role="alert" className="mt-3 text-sm text-danger">
          Não foi possível carregar os comprovantes.
        </p>
      )}

      {resumo && resumo.comprovantes.length > 0 && (
        <ul className="mt-4 grid gap-2">
          {resumo.comprovantes.map((c) => (
            <li
              key={c.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-borda bg-surface-2 px-3 py-2 text-sm"
            >
              <span>
                <strong>{ROTULOS_COMPROVANTE[c.tipo]}</strong> ·{" "}
                {formatCurrency(Number(c.valor))}
                {Number(c.taxa_plataforma) > 0 && (
                  <span className="text-muted">
                    {" "}
                    · taxa {formatCurrency(Number(c.taxa_plataforma))}
                  </span>
                )}
              </span>
              {c.arquivo_url && (
                <button
                  type="button"
                  onClick={() =>
                    void comprovantesApi
                      .abrirArquivo(c.arquivo_url)
                      .catch((e) => avisar(mensagemDeErro(e), "error"))
                  }
                  className="text-accent underline underline-offset-2"
                >
                  Abrir comprovante
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {resumo && Number(resumo.total_adicional) > 0 && (
        <dl className="terms mt-4">
          <dt>Total adicional</dt>
          <dd>{formatCurrency(Number(resumo.total_adicional))}</dd>
          <dt>Taxa da plataforma ({taxa}%)</dt>
          <dd>{formatCurrency(Number(resumo.taxa_adicional_plataforma))}</dd>
          <dt>Líquido ao profissional</dt>
          <dd>
            {formatCurrency(Number(resumo.liquido_adicional_profissional))}
          </dd>
        </dl>
      )}

      {
        <>
          <form
            onSubmit={enviar}
            noValidate
            className="mt-5 grid gap-3 border-t border-borda pt-4"
          >
            <label className="grid gap-1 text-sm font-medium">
              Tipo de comprovante
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value as TipoComprovante)}
                className="rounded-lg border border-borda bg-surface-2 px-3 py-2"
              >
                {(souContratante ? TIPOS_CONTRATANTE : TIPOS_PROFISSIONAL).map(
                  (t) => (
                    <option key={t} value={t}>
                      {ROTULOS_COMPROVANTE[t]}
                    </option>
                  ),
                )}
              </select>
            </label>
            <label className="grid gap-1 text-sm font-medium">
              Valor pago (R$)
              <input
                inputMode="decimal"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                placeholder="0,00"
                className="rounded-lg border border-borda bg-surface-2 px-3 py-2"
              />
              {erros.valor && (
                <span className="text-xs text-danger">{erros.valor}</span>
              )}
            </label>
            {adicional && (
              <p className="text-xs text-muted">
                Taxa da plataforma de {taxa}% sobre este valor:{" "}
                {formatCurrency(previaTaxa)}.
              </p>
            )}
            {tipo === "horas_extras" && (
              <label className="grid gap-1 text-sm font-medium">
                Acordo prévio das horas extras
                <textarea
                  value={acordo}
                  onChange={(e) => setAcordo(e.target.value)}
                  rows={2}
                  className="rounded-lg border border-borda bg-surface-2 px-3 py-2"
                />
                {erros.acordo && (
                  <span className="text-xs text-danger">{erros.acordo}</span>
                )}
              </label>
            )}
            <label className="grid gap-1 text-sm font-medium">
              Comprovante (PDF, JPG ou PNG, até {LIMITE_MB} MB)
              <input
                type="file"
                accept="application/pdf,image/jpeg,image/png"
                onChange={(e) => setArquivo(e.target.files?.[0] ?? null)}
                className="text-sm"
              />
              {erros.arquivo && (
                <span className="text-xs text-danger">{erros.arquivo}</span>
              )}
            </label>
            <div>
              <Button type="submit" loading={enviando}>
                Anexar comprovante
              </Button>
            </div>
          </form>
        </>
      }
    </Card>
  );
}
