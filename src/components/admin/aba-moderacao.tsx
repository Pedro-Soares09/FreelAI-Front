"use client";

import { useCallback, useEffect, useState } from "react";
import { mensagemDeErro } from "@/api/erro";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EstadoDeLista } from "@/components/ui/estados";
import { Modal } from "@/components/ui/modal";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import {
  repositorioModeracao,
  rotuloMotivo,
  type DecisaoDenuncia,
  type DecisaoDisputa,
  type DenunciaAdmin,
  type DisputaAdmin,
  type UsuarioBanido,
} from "@/services/admin-moderacao";

type Estado<T> =
  | { tipo: "carregando" }
  | { tipo: "erro"; mensagem?: string }
  | { tipo: "pronto"; dados: T[] };

function tempo(minutos: number): string {
  if (minutos < 60) return `${minutos} min`;
  return `${Math.floor(minutos / 60)} h ${minutos % 60} min`;
}

function useFila<T>(buscar: () => Promise<T[]>) {
  const [estado, setEstado] = useState<Estado<T>>({ tipo: "carregando" });
  const carregar = useCallback(async () => {
    setEstado({ tipo: "carregando" });
    try {
      setEstado({ tipo: "pronto", dados: await buscar() });
    } catch (e) {
      setEstado({ tipo: "erro", mensagem: mensagemDeErro(e) });
    }
  }, [buscar]);
  useEffect(() => {
    void carregar();
  }, [carregar]);
  return { estado, carregar };
}

const buscarDenuncias = () => repositorioModeracao.listarDenuncias();
const buscarDisputas = () => repositorioModeracao.listarDisputas();

export function AbaDenuncias({ onContagem }: { onContagem?: (n: number) => void }) {
  const { estado, carregar } = useFila(buscarDenuncias);
  const [decidindo, setDecidindo] = useState<{ item: DenunciaAdmin; decisao: DecisaoDenuncia } | null>(null);
  const [motivo, setMotivo] = useState("");
  const [erro, setErro] = useState<string>();
  const [ocupado, setOcupado] = useState(false);
  const { avisar } = useToast();

  useEffect(() => {
    if (estado.tipo === "pronto") onContagem?.(estado.dados.length);
  }, [estado, onContagem]);

  function fechar() {
    setDecidindo(null);
    setMotivo("");
    setErro(undefined);
  }

  async function confirmar() {
    if (!decidindo) return;
    if (motivo.trim().length < 5) {
      setErro("Informe a justificativa (mínimo de 5 caracteres).");
      return;
    }
    setOcupado(true);
    try {
      await repositorioModeracao.decidirDenuncia(decidindo.item.id, decidindo.decisao, motivo.trim());
      avisar(
        decidindo.decisao === "procedente"
          ? "Denúncia validada. O chat entre as partes foi bloqueado."
          : "Denúncia marcada como improcedente.",
        "success",
      );
      fechar();
      void carregar();
    } catch (e) {
      avisar(mensagemDeErro(e), "error");
    } finally {
      setOcupado(false);
    }
  }

  return (
    <>
      <EstadoDeLista
        estado={estado}
        onTentarNovamente={carregar}
        vazio={{ titulo: "Nenhuma denúncia aberta", descricao: "As denúncias recebidas aparecem aqui para análise." }}
      >
        {(itens) => (
          <ul className="grid gap-3">
            {itens.map((d) => (
              <li key={d.id}>
                <Card className={d.acima_da_meta ? "border-warning/60" : undefined}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{rotuloMotivo(d.motivo)}</p>
                      <p className="text-sm text-muted">{d.descricao ?? "Sem descrição."}</p>
                      <p className="mt-1 text-xs text-muted">
                        Denunciado: usuário {d.denunciado_id}
                        {d.vaga_id ? ` · Vaga ${d.vaga_id}` : ""}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {d.origem === "automatica" && <Badge tom="info">Automática</Badge>}
                      <Badge tom={d.acima_da_meta ? "warning" : "neutral"}>
                        {d.acima_da_meta ? "Acima de 48 h úteis: " : "Em fila: "}
                        {tempo(d.tempo_espera_minutos)}
                      </Badge>
                      {(d.denuncias_procedentes_acumuladas ?? 0) > 0 && (
                        <Badge tom="danger">
                          {d.denuncias_procedentes_acumuladas} penalidade(s) anterior(es)
                        </Badge>
                      )}
                    </div>
                  </div>
                  <p className="mt-3 text-xs text-muted">
                    Ao validar, o chat entre as partes é bloqueado. Na segunda penalidade o usuário é banido.
                  </p>
                  <div className="mt-3 flex gap-2">
                    <Button size="sm" variant="danger" onClick={() => setDecidindo({ item: d, decisao: "procedente" })}>
                      Validar denúncia
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => setDecidindo({ item: d, decisao: "improcedente" })}>
                      Recusar
                    </Button>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </EstadoDeLista>

      <Modal
        aberto={decidindo !== null}
        titulo={decidindo?.decisao === "procedente" ? "Validar denúncia" : "Recusar denúncia"}
        onFechar={fechar}
        rodape={
          <>
            <Button variant="ghost" onClick={fechar}>
              Cancelar
            </Button>
            <Button
              variant={decidindo?.decisao === "procedente" ? "danger" : "primary"}
              loading={ocupado}
              onClick={() => void confirmar()}
            >
              Confirmar
            </Button>
          </>
        }
      >
        <Textarea
          label="Justificativa"
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
          error={erro}
          hint="Fica registrada na decisão."
        />
      </Modal>
    </>
  );
}

export function AbaDisputas({ onContagem }: { onContagem?: (n: number) => void }) {
  const { estado, carregar } = useFila(buscarDisputas);
  const [decidindo, setDecidindo] = useState<{ item: DisputaAdmin; decisao: DecisaoDisputa } | null>(null);
  const [motivo, setMotivo] = useState("");
  const [percentual, setPercentual] = useState("50");
  const [erro, setErro] = useState<string>();
  const [ocupado, setOcupado] = useState(false);
  const { avisar } = useToast();

  useEffect(() => {
    if (estado.tipo === "pronto") onContagem?.(estado.dados.length);
  }, [estado, onContagem]);

  function fechar() {
    setDecidindo(null);
    setMotivo("");
    setErro(undefined);
  }

  async function confirmar() {
    if (!decidindo) return;
    const pct = Number(percentual);
    if (motivo.trim().length < 5) {
      setErro("Informe a justificativa (mínimo de 5 caracteres).");
      return;
    }
    if (decidindo.decisao === "reembolso_parcial" && !(pct >= 1 && pct <= 99)) {
      setErro("Informe o percentual do profissional entre 1 e 99.");
      return;
    }
    setOcupado(true);
    try {
      await repositorioModeracao.decidirDisputa(decidindo.item.id, decidindo.decisao, motivo.trim(), pct);
      avisar("Decisão registrada.", "success");
      fechar();
      void carregar();
    } catch (e) {
      avisar(mensagemDeErro(e), "error");
    } finally {
      setOcupado(false);
    }
  }

  return (
    <>
      <EstadoDeLista
        estado={estado}
        onTentarNovamente={carregar}
        vazio={{ titulo: "Nenhuma disputa aberta", descricao: "Disputas de pagamento aparecem aqui para decisão." }}
      >
        {(itens) => (
          <ul className="grid gap-3">
            {itens.map((d) => (
              <li key={d.id}>
                <Card className={d.acima_da_meta ? "border-warning/60" : undefined}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{d.vaga_titulo}</p>
                      <p className="text-sm text-muted">{d.descricao}</p>
                    </div>
                    <Badge tom={d.acima_da_meta ? "warning" : "neutral"}>
                      {d.acima_da_meta ? "Acima da meta: " : "Em fila: "}
                      {tempo(d.tempo_espera_minutos)}
                    </Badge>
                  </div>
                  {d.chat.length > 0 && (
                    <details className="mt-3 text-sm">
                      <summary className="cursor-pointer text-accent">Ver conversa ({d.chat.length})</summary>
                      <ul className="mt-2 grid gap-1 text-muted">
                        {d.chat.map((m) => (
                          <li key={m.id}>
                            <strong className="text-fg">Usuário {m.autor_id}:</strong> {m.texto ?? "Anexo enviado"}
                          </li>
                        ))}
                      </ul>
                    </details>
                  )}
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button size="sm" onClick={() => setDecidindo({ item: d, decisao: "pagamento_integral" })}>
                      Pagar profissional
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => setDecidindo({ item: d, decisao: "reembolso_parcial" })}>
                      Reembolso parcial
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => setDecidindo({ item: d, decisao: "reembolso_total" })}>
                      Reembolso total
                    </Button>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </EstadoDeLista>

      <Modal
        aberto={decidindo !== null}
        titulo="Decidir disputa"
        onFechar={fechar}
        rodape={
          <>
            <Button variant="ghost" onClick={fechar}>
              Cancelar
            </Button>
            <Button loading={ocupado} onClick={() => void confirmar()}>
              Confirmar decisão
            </Button>
          </>
        }
      >
        {decidindo?.decisao === "reembolso_parcial" && (
          <label className="mb-3 grid gap-1 text-sm font-medium">
            Percentual para o profissional (1 a 99)
            <input
              type="number"
              min={1}
              max={99}
              value={percentual}
              onChange={(e) => setPercentual(e.target.value)}
              className="rounded-lg border border-borda bg-surface-2 px-3 py-2"
            />
          </label>
        )}
        <Textarea label="Justificativa" value={motivo} onChange={(e) => setMotivo(e.target.value)} error={erro} />
      </Modal>
    </>
  );
}

const buscarBanimentos = () => repositorioModeracao.listarBanimentos();

export function AbaBanimentos({ onContagem }: { onContagem?: (n: number) => void }) {
  const { estado, carregar } = useFila<UsuarioBanido>(buscarBanimentos);

  useEffect(() => {
    if (estado.tipo === "pronto") onContagem?.(estado.dados.length);
  }, [estado, onContagem]);

  return (
    <EstadoDeLista
      estado={estado}
      onTentarNovamente={carregar}
      vazio={{
        titulo: "Nenhuma conta banida",
        descricao: "Contas com duas denúncias procedentes aparecem aqui.",
      }}
    >
      {(itens) => (
        <ul className="grid gap-3">
          {itens.map((u) => (
            <li key={u.usuario_id}>
              <Card className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <p className="font-semibold">{u.nome}</p>
                  <p className="text-sm text-muted">{u.email}</p>
                </div>
                <Badge tom="danger">{u.penalidades} penalidades</Badge>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </EstadoDeLista>
  );
}
