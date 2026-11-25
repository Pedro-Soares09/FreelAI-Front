"use client";

import { useCallback, useEffect, useState } from "react";
import { mensagemDeErro } from "@/api/erro";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EstadoDeLista } from "@/components/ui/estados";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import { formatarDataHora, sancoesApi, type ContestacaoAdmin } from "@/services/sancoes";

type Estado =
  | { tipo: "carregando" }
  | { tipo: "erro"; mensagem?: string }
  | { tipo: "pronto"; dados: ContestacaoAdmin[] };

/** Contestações de suspensão e banimento aguardando decisão da administração. */
export function AbaContestacoes({ onContagem }: { onContagem?: (n: number) => void }) {
  const { avisar } = useToast();
  const [estado, setEstado] = useState<Estado>({ tipo: "carregando" });
  const [motivos, setMotivos] = useState<Record<number, string>>({});
  const [enviando, setEnviando] = useState<number>();

  const carregar = useCallback(async () => {
    setEstado({ tipo: "carregando" });
    try {
      const dados = await sancoesApi.contestacoes("abertas");
      setEstado({ tipo: "pronto", dados });
      onContagem?.(dados.length);
    } catch (e) {
      setEstado({ tipo: "erro", mensagem: mensagemDeErro(e) });
    }
  }, [onContagem]);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  async function decidir(item: ContestacaoAdmin, aceita: boolean) {
    const motivo = (motivos[item.id] ?? "").trim();
    if (motivo.length < 3) {
      avisar("Informe o motivo da decisão.", "error");
      return;
    }
    setEnviando(item.id);
    try {
      await sancoesApi.decidirContestacao(item.id, aceita, motivo);
      avisar(aceita ? "Contestação aceita; a conta foi reativada." : "Contestação recusada.", "success");
      await carregar();
    } catch (e) {
      avisar(mensagemDeErro(e), "error");
    } finally {
      setEnviando(undefined);
    }
  }

  return (
    <EstadoDeLista
      estado={estado}
      onTentarNovamente={carregar}
      vazio={{
        titulo: "Nenhuma contestação aberta",
        descricao: "Contestações de suspensão e banimento aparecem aqui.",
      }}
    >
      {(itens) => (
        <ul className="grid gap-3">
          {itens.map((c) => (
            <li key={c.id}>
              <Card className="grid gap-3 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold">{c.usuario_nome}</p>
                  <Badge tom="danger">{c.sancao_tipo === "banimento" ? "Banimento" : "Suspensão"}</Badge>
                </div>
                <p className="text-sm text-muted">Motivo da sanção: {c.sancao_motivo}</p>
                <p className="text-sm">{c.texto}</p>
                <p className="text-xs text-muted">Enviada em {formatarDataHora(c.criada_em)}</p>
                <Textarea
                  label="Motivo da decisão"
                  value={motivos[c.id] ?? ""}
                  onChange={(e) => setMotivos((m) => ({ ...m, [c.id]: e.target.value }))}
                  rows={2}
                  maxLength={255}
                />
                <div className="flex flex-wrap gap-2">
                  <Button loading={enviando === c.id} onClick={() => decidir(c, true)}>
                    Aceitar e reativar a conta
                  </Button>
                  <Button
                    variant="secondary"
                    loading={enviando === c.id}
                    onClick={() => decidir(c, false)}
                  >
                    Recusar
                  </Button>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </EstadoDeLista>
  );
}
