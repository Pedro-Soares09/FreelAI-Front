"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { mensagemDeErro } from "@/api/erro";
import { Pagina } from "@/components/layout/pagina";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Carregando, ErroComRetry } from "@/components/ui/estados";
import { useToast } from "@/components/ui/toast";
import { useSessao } from "@/lib/session";
import { contaApi, type StatusVerificacao } from "@/services/conta";

const INTERVALO_CONSULTA_MS = 8000;

const TITULO: Record<StatusVerificacao["status"], string> = {
  pendente: "Envie seus documentos",
  em_analise: "Verificação em análise",
  verificado: "Identidade verificada",
  recusado: "Verificação recusada",
};

const TOM: Record<StatusVerificacao["status"], "warning" | "info" | "success" | "danger"> = {
  pendente: "warning",
  em_analise: "info",
  verificado: "success",
  recusado: "danger",
};

export default function VerificacaoPage() {
  const { usuario, atualizar } = useSessao();
  const { avisar } = useToast();
  const [status, setStatus] = useState<StatusVerificacao | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [consentiu, setConsentiu] = useState(false);
  const [documento, setDocumento] = useState<File | null>(null);
  const [selfie, setSelfie] = useState<File | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [erroForm, setErroForm] = useState<string>();

  const carregar = useCallback(async () => {
    try {
      const atual = await contaApi.statusVerificacao();
      setStatus((anterior) => {
        if (anterior && anterior.status !== "verificado" && atual.status === "verificado") {
          void atualizar();
        }
        return atual;
      });
      setErro(null);
    } catch (e) {
      setErro(mensagemDeErro(e));
    }
  }, [atualizar]);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  // Enquanto a administração analisa, a tela consulta o estado sozinha.
  useEffect(() => {
    if (status?.status !== "em_analise") return;
    const timer = setInterval(() => void carregar(), INTERVALO_CONSULTA_MS);
    return () => clearInterval(timer);
  }, [status?.status, carregar]);

  async function enviar(ev: FormEvent) {
    ev.preventDefault();
    setErroForm(undefined);
    if (!status) return;
    if (!status.consentimento_biometria && !consentiu) {
      setErroForm("Aceite o consentimento de uso de biometria para continuar.");
      return;
    }
    if (!documento || !selfie) {
      setErroForm("Envie o documento com foto e a selfie.");
      return;
    }
    setEnviando(true);
    try {
      if (!status.consentimento_biometria) await contaApi.aceitarConsentimento();
      const [doc, auto] = await Promise.all([
        contaApi.enviarArquivo("documento", documento),
        contaApi.enviarArquivo("selfie", selfie),
      ]);
      setStatus(await contaApi.enviarVerificacao(doc.id, auto.id));
      setDocumento(null);
      setSelfie(null);
      avisar("Documentos enviados para análise.", "success");
    } catch (e) {
      setErroForm(mensagemDeErro(e));
    } finally {
      setEnviando(false);
    }
  }

  if (erro) return <Pagina titulo="Verificação de identidade"><ErroComRetry mensagem={erro} onTentarNovamente={() => void carregar()} /></Pagina>;
  if (!status) return <Pagina titulo="Verificação de identidade"><Carregando /></Pagina>;

  const podeEnviar = status.status === "pendente" || status.status === "recusado";

  return (
    <Pagina titulo="Verificação de identidade" descricao="Confirmamos quem você é antes de liberar as vagas e os pagamentos.">
      <div className="mx-auto flex max-w-2xl flex-col gap-5 rounded-card border border-borda bg-surface p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">{TITULO[status.status]}</h2>
          <Badge tom={TOM[status.status]}>{status.status.replace("_", " ")}</Badge>
        </div>

        {status.status === "em_analise" && (
          <p className="text-sm text-muted">
            Recebemos seus documentos. A administração analisa em até 48 horas; esta tela atualiza sozinha.
          </p>
        )}

        {status.status === "verificado" && (
          <div className="grid gap-3">
            <p className="text-sm text-muted">Sua identidade foi aprovada e a conta está liberada.</p>
            <div>
              <Link href={usuario?.perfil_ativo === "contratante" ? "/criar-vaga" : "/vagas"} className="font-semibold text-primary hover:underline">
                Continuar
              </Link>
            </div>
          </div>
        )}

        {status.status === "recusado" && (
          <p role="alert" className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">
            Motivo da recusa: {status.motivo ?? "não informado"}. Envie novamente os documentos.
          </p>
        )}

        {podeEnviar && (
          <form onSubmit={enviar} noValidate className="grid gap-4">
            <label className="grid gap-1 text-sm">
              <span className="font-semibold">Documento com foto (RG ou CNH)</span>
              <input type="file" accept="image/jpeg,image/png,application/pdf" onChange={(e) => setDocumento(e.target.files?.[0] ?? null)} />
              <span className="text-xs text-muted">JPG, PNG ou PDF, até 10 MB.</span>
            </label>
            <label className="grid gap-1 text-sm">
              <span className="font-semibold">Selfie</span>
              <input type="file" accept="image/jpeg,image/png" capture="user" onChange={(e) => setSelfie(e.target.files?.[0] ?? null)} />
              <span className="text-xs text-muted">Foto do seu rosto, de frente, em local iluminado.</span>
            </label>
            {!status.consentimento_biometria && (
              <label className="flex items-start gap-2 text-sm">
                <input type="checkbox" className="mt-1" checked={consentiu} onChange={(e) => setConsentiu(e.target.checked)} />
                <span>Autorizo o uso da minha imagem e documento para verificar minha identidade e, depois, validar a liberação de pagamentos (biometria, conforme a LGPD).</span>
              </label>
            )}
            {erroForm && <p role="alert" className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">{erroForm}</p>}
            <div className="flex justify-end">
              <Button type="submit" loading={enviando}>Enviar para análise</Button>
            </div>
          </form>
        )}
      </div>
    </Pagina>
  );
}
