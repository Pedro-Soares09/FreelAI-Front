"use client";

import Link from "next/link";
import { use, useCallback, useEffect, useState } from "react";
import { ApiError } from "@/api/erro";
import type { DadosAcordo } from "@/api/tipos";
import { Pagina } from "@/components/layout/pagina";
import { Button, baseBotao, tamanhosBotao, variantesBotao } from "@/components/ui/button";
import { Carregando, ErroComRetry } from "@/components/ui/estados";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/cn";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { useSessao } from "@/lib/session";
import { freelaiApi } from "@/services/api";

type AcordoPageProps = {
  params: Promise<{ id: string }>;
};

function Linha({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-borda py-3 last:border-b-0 sm:flex-row sm:justify-between sm:gap-6">
      <dt className="text-sm text-muted">{rotulo}</dt>
      <dd className="text-sm font-medium sm:text-right">{valor}</dd>
    </div>
  );
}

export default function AcordoPage({ params }: AcordoPageProps) {
  const { id } = use(params);
  const { usuario } = useSessao();
  const { avisar } = useToast();
  const [acordo, setAcordo] = useState<DadosAcordo | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const carregar = useCallback(async () => {
    setErro(null);
    try {
      setAcordo(await freelaiApi.obterAcordo(id));
    } catch (e) {
      setErro(e instanceof ApiError ? e.message : "Não foi possível carregar o acordo.");
    }
  }, [id]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function aceitar() {
    setEnviando(true);
    try {
      setAcordo(await freelaiApi.aceitarAcordo(id));
      avisar("Aceite registrado.", "success");
    } catch (e) {
      avisar(e instanceof ApiError ? e.message : "Não foi possível registrar o aceite.", "error");
    } finally {
      setEnviando(false);
    }
  }

  if (erro) {
    return (
      <Pagina titulo="Acordo" descricao="Termos da contratação.">
        <ErroComRetry mensagem={erro} onTentarNovamente={carregar} />
      </Pagina>
    );
  }
  if (!acordo) {
    return (
      <Pagina titulo="Acordo" descricao="Termos da contratação.">
        <Carregando rotulo="Carregando acordo" />
      </Pagina>
    );
  }

  const souContratante = usuario?.id === acordo.contratante.usuario_id;
  const meuAceite = souContratante ? acordo.aceites.contratante : acordo.aceites.profissional;
  const ambos = acordo.aceites.contratante && acordo.aceites.profissional;
  const outro = souContratante ? acordo.profissional : acordo.contratante;

  return (
    <Pagina titulo="Acordo" descricao={`${acordo.servico} com ${outro.nome}.`}>
      <div className="mx-auto flex max-w-2xl flex-col gap-4">
        <section className="rounded-card border border-borda bg-surface p-5 sm:p-6">
          <h2 className="mb-1 text-lg font-bold">Termos do serviço</h2>
          <dl>
            <Linha rotulo="Serviço" valor={acordo.servico} />
            <Linha rotulo="Escopo" valor={acordo.escopo} />
            <Linha rotulo="Início" valor={formatDateTime(acordo.inicio_em)} />
            <Linha rotulo="Duração" valor={`${acordo.duracao_minutos / 60} h`} />
            <Linha rotulo="Local" valor={acordo.endereco_completo ?? acordo.local_bairro} />
            {acordo.vestimenta && <Linha rotulo="Vestimenta" valor={acordo.vestimenta} />}
            {acordo.atribuicoes && <Linha rotulo="Atribuições" valor={acordo.atribuicoes} />}
          </dl>
        </section>

        <section className="rounded-card border border-borda bg-surface p-5 sm:p-6">
          <h2 className="mb-1 text-lg font-bold">Valores</h2>
          <dl>
            <Linha rotulo="Valor do serviço" valor={formatCurrency(Number(acordo.valor_total))} />
            <Linha rotulo="Taxa da plataforma" valor={formatCurrency(Number(acordo.taxa_plataforma))} />
            <Linha
              rotulo="Líquido do profissional"
              valor={formatCurrency(Number(acordo.valor_liquido_profissional))}
            />
          </dl>
          <p className="mt-3 text-sm text-muted">{acordo.condicoes_pagamento}</p>
        </section>

        <section className="rounded-card border border-borda bg-surface p-5 text-sm text-muted sm:p-6">
          <p>{acordo.regras_cancelamento}</p>
          <p className="mt-2">{acordo.condicoes_avaliacao}</p>
          <p className="mt-2">Versão dos termos: {acordo.versao_termos}.</p>
        </section>

        <section className="flex flex-col gap-3 rounded-card border border-borda bg-surface p-5 sm:p-6">
          <p className="text-sm">
            Contratante: {acordo.aceites.contratante ? "li e aceitou" : "aguardando aceite"}.
            Profissional: {acordo.aceites.profissional ? "li e aceitou" : "aguardando aceite"}.
          </p>
          <div className="flex flex-wrap justify-end gap-3">
            {!meuAceite && (
              <Button onClick={aceitar} loading={enviando}>
                Li e aceito
              </Button>
            )}
            {ambos && souContratante && (
              <Link href={`/pagamento/${id}`} className={cn(baseBotao, variantesBotao.primary, tamanhosBotao.md)}>
                Ir para o pagamento
              </Link>
            )}
            {ambos && !souContratante && (
              <p className="text-sm text-muted">Aguardando o contratante pagar o Pix.</p>
            )}
          </div>
        </section>
      </div>
    </Pagina>
  );
}
