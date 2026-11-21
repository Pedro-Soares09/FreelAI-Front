"use client";

import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EstadoDeLista } from "@/components/ui/estados";
import { Modal } from "@/components/ui/modal";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import { mensagemDeErro } from "@/api/erro";
import {
  ROTULOS_TIPO,
  acimaDoPrazo,
  repositorioCadastros,
  tempoEmFila,
  type ItemFila,
} from "@/services/admin-cadastros";

type Estado = { tipo: "carregando" } | { tipo: "erro"; mensagem?: string } | { tipo: "pronto"; dados: ItemFila[] };

export function AbaCadastros({ onContagem }: { onContagem?: (n: number) => void }) {
  const [estado, setEstado] = useState<Estado>({ tipo: "carregando" });
  const [recusando, setRecusando] = useState<ItemFila | null>(null);
  const [motivo, setMotivo] = useState("");
  const [erroMotivo, setErroMotivo] = useState<string>();
  const [ocupado, setOcupado] = useState(false);
  const { avisar } = useToast();

  const carregar = useCallback(async () => {
    setEstado({ tipo: "carregando" });
    try {
      const dados = await repositorioCadastros.listar();
      setEstado({ tipo: "pronto", dados });
      onContagem?.(dados.length);
    } catch (e) {
      setEstado({ tipo: "erro", mensagem: mensagemDeErro(e) });
    }
  }, [onContagem]);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  async function decidir(item: ItemFila, aprovado: boolean, motivoRecusa?: string) {
    setOcupado(true);
    try {
      await repositorioCadastros.decidir({ id: item.id, aprovado, motivo: motivoRecusa });
      avisar(aprovado ? "Cadastro aprovado." : "Cadastro recusado.", "success");
      setRecusando(null);
      setMotivo("");
      await carregar();
    } catch (e) {
      avisar(mensagemDeErro(e), "error");
    } finally {
      setOcupado(false);
    }
  }

  function confirmarRecusa() {
    if (!recusando) return;
    if (motivo.trim().length < 5) {
      setErroMotivo("Informe o motivo da recusa (mínimo de 5 caracteres).");
      return;
    }
    setErroMotivo(undefined);
    void decidir(recusando, false, motivo.trim());
  }

  function fecharModal() {
    setRecusando(null);
    setMotivo("");
    setErroMotivo(undefined);
  }

  return (
    <>
      <EstadoDeLista
        estado={estado}
        onTentarNovamente={carregar}
        vazio={{ titulo: "Fila vazia", descricao: "Nenhum cadastro aguardando análise." }}
      >
        {(itens) => (
          <ul className="grid gap-3">
            {itens.map((item) => {
              const atrasado = acimaDoPrazo(item.enviadoEm);
              return (
                <li key={item.id}>
                  <Card className={atrasado ? "border-warning/60" : undefined}>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold">{item.usuario}</p>
                        <p className="text-sm text-muted">{item.descricao}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge tom="primary">{ROTULOS_TIPO[item.tipo]}</Badge>
                        <Badge tom={atrasado ? "warning" : "neutral"}>
                          {atrasado ? "Acima de 48 h: " : "Em fila: "}
                          {tempoEmFila(item.enviadoEm)}
                        </Badge>
                      </div>
                    </div>
                    <ul className="mt-3 flex flex-wrap gap-3 text-sm">
                      {item.arquivos.map((a) => (
                        <li key={a.nome}>
                          <a
                            href={a.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-accent underline underline-offset-2"
                          >
                            {a.nome}
                          </a>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-4 flex gap-2">
                      <Button size="sm" disabled={ocupado} onClick={() => void decidir(item, true)}>
                        Aprovar
                      </Button>
                      <Button size="sm" variant="secondary" disabled={ocupado} onClick={() => setRecusando(item)}>
                        Recusar
                      </Button>
                    </div>
                  </Card>
                </li>
              );
            })}
          </ul>
        )}
      </EstadoDeLista>

      <Modal
        aberto={recusando !== null}
        titulo="Recusar cadastro"
        onFechar={fecharModal}
        rodape={
          <>
            <Button variant="ghost" onClick={fecharModal}>
              Cancelar
            </Button>
            <Button variant="danger" loading={ocupado} onClick={confirmarRecusa}>
              Confirmar recusa
            </Button>
          </>
        }
      >
        <Textarea
          label="Motivo da recusa"
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
          error={erroMotivo}
          hint="O motivo é enviado ao usuário."
        />
      </Modal>
    </>
  );
}
