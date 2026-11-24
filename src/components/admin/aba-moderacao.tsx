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
import { formatCurrency } from "@/lib/format";
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

type Filtro = "abertas" | "decididas";

function Filtros({ valor, onMudar, abertas, decididas }: { valor: Filtro; onMudar: (f: Filtro) => void; abertas: number; decididas: number }) {
  const opcoes: { id: Filtro; rotulo: string; n: number }[] = [
    { id: "abertas", rotulo: "Abertas", n: abertas },
    { id: "decididas", rotulo: "Decididas", n: decididas },
  ];
  return (
    <div role="group" aria-label="Filtrar por situação" className="mb-4 flex gap-2">
      {opcoes.map((o) => (
        <button
          key={o.id}
          type="button"
          aria-pressed={valor === o.id}
          onClick={() => onMudar(o.id)}
          className={`rounded-full border px-3 py-1 text-sm transition ${valor === o.id ? "border-primary bg-primary/15 font-semibold text-primary" : "border-borda text-muted hover:border-primary/60"}`}
        >
          {o.rotulo} ({o.n})
        </button>
      ))}
    </div>
  );
}

const ROTULO_ESTADO_DENUNCIA: Record<string, string> = { procedente: "Procedente", improcedente: "Improcedente" };
const ROTULO_ESTADO_DISPUTA: Record<string, string> = {
  reembolso_total: "Reembolso total",
  reembolso_parcial: "Reembolso parcial",
  pagamento_integral: "Pagamento integral",
};

function valorDaDisputa(d: DisputaAdmin): number | null {
  const bruto = d.pagamento?.divisao?.valor_total ?? (d as unknown as { valor_total?: number }).valor_total;
  return bruto === undefined || bruto === null ? null : Number(bruto);
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

  const [filtro, setFiltro] = useState<Filtro>("abertas");

  useEffect(() => {
    if (estado.tipo === "pronto") onContagem?.(estado.dados.filter((d) => d.estado === "aberta").length);
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
        vazio={{ titulo: "Nenhuma denúncia registrada", descricao: "As denúncias recebidas aparecem aqui para análise." }}
      >
        {(todas) => {
          const abertas = todas.filter((d) => d.estado === "aberta");
          const itens = filtro === "abertas" ? abertas : todas.filter((d) => d.estado !== "aberta");
          return (
          <>
          <Filtros valor={filtro} onMudar={setFiltro} abertas={abertas.length} decididas={todas.length - abertas.length} />
          {itens.length === 0 && <p className="text-sm text-muted">Nada por aqui.</p>}
          <ul className="grid gap-3">
            {itens.map((d) => (
              <li key={d.id}>
                <Card className={d.acima_da_meta ? "border-warning/60" : undefined}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{rotuloMotivo(d.motivo)}</p>
                      <p className="text-sm text-muted">{d.descricao ?? "Sem descrição."}</p>
                      <p className="mt-1 text-xs text-muted">
                        Denunciado: {d.denunciado_nome ?? `usuário ${d.denunciado_id}`}
                        {d.denunciante_nome ? ` · Denunciante: ${d.denunciante_nome}` : ""}
                        {d.vaga_id ? ` · Vaga ${d.vaga_id}` : ""}
                      </p>
                      {d.estado !== "aberta" && d.decisao_motivo && (
                        <p className="mt-2 text-sm">
                          <strong>Decisão:</strong> {d.decisao_motivo}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {d.origem === "automatica" && <Badge tom="info">Automática</Badge>}
                      {d.estado === "aberta" ? (
                        <Badge tom={d.acima_da_meta ? "warning" : "neutral"}>
                          {d.acima_da_meta ? "Acima de 48 h úteis: " : "Em fila: "}
                          {tempo(d.tempo_espera_minutos)}
                        </Badge>
                      ) : (
                        <Badge tom={d.estado === "procedente" ? "danger" : "success"}>
                          {ROTULO_ESTADO_DENUNCIA[d.estado] ?? d.estado}
                        </Badge>
                      )}
                      {d.conversa_bloqueada && <Badge tom="warning">Chat bloqueado</Badge>}
                      {d.denunciado_estado === "banida" && <Badge tom="danger">Conta banida</Badge>}
                      {(d.denuncias_procedentes_acumuladas ?? 0) > 0 && (
                        <Badge tom="danger">
                          {d.denuncias_procedentes_acumuladas} penalidade(s) anterior(es)
                        </Badge>
                      )}
                    </div>
                  </div>
                  {d.estado === "aberta" && (
                    <>
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
                    </>
                  )}
                </Card>
              </li>
            ))}
          </ul>
          </>
          );
        }}
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

  const [filtro, setFiltro] = useState<Filtro>("abertas");

  useEffect(() => {
    if (estado.tipo === "pronto") onContagem?.(estado.dados.filter((d) => d.estado === "aberta").length);
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
        vazio={{ titulo: "Nenhuma disputa registrada", descricao: "Disputas de pagamento aparecem aqui para decisão." }}
      >
        {(todas) => {
          const abertas = todas.filter((d) => d.estado === "aberta");
          const itens = filtro === "abertas" ? abertas : todas.filter((d) => d.estado !== "aberta");
          const nomes: Record<number, string> = {};
          return (
          <>
          <Filtros valor={filtro} onMudar={setFiltro} abertas={abertas.length} decididas={todas.length - abertas.length} />
          {itens.length === 0 && <p className="text-sm text-muted">Nada por aqui.</p>}
          <ul className="grid gap-3">
            {itens.map((d) => {
              nomes[d.contratante_usuario_id] = d.contratante_nome ?? `Usuário ${d.contratante_usuario_id}`;
              if (d.profissional_usuario_id) nomes[d.profissional_usuario_id] = d.profissional_nome ?? `Usuário ${d.profissional_usuario_id}`;
              return (
              <li key={d.id}>
                <Card className={d.acima_da_meta ? "border-warning/60" : undefined}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{d.vaga_titulo}</p>
                      <p className="text-sm text-muted">{d.descricao}</p>
                      <p className="mt-1 text-xs text-muted">
                        Contratante: {d.contratante_nome ?? `usuário ${d.contratante_usuario_id}`}
                        {d.profissional_nome ? ` · Profissional: ${d.profissional_nome}` : ""}
                        {valorDaDisputa(d) !== null ? ` · Valor: ${formatCurrency(valorDaDisputa(d) ?? 0)}` : ""}
                      </p>
                      {d.estado !== "aberta" && d.decisao_motivo && (
                        <p className="mt-2 text-sm">
                          <strong>Decisão:</strong> {d.decisao_motivo}
                        </p>
                      )}
                    </div>
                    {d.estado === "aberta" ? (
                      <Badge tom={d.acima_da_meta ? "warning" : "neutral"}>
                        {d.acima_da_meta ? "Acima da meta: " : "Em fila: "}
                        {tempo(d.tempo_espera_minutos)}
                      </Badge>
                    ) : (
                      <Badge tom="success">
                        {ROTULO_ESTADO_DISPUTA[d.estado] ?? d.estado}
                        {d.estado === "reembolso_parcial" && d.percentual_reembolso ? ` (${d.percentual_reembolso}% ao contratante)` : ""}
                      </Badge>
                    )}
                  </div>
                  {d.chat.length > 0 && (
                    <details className="mt-3 text-sm">
                      <summary className="cursor-pointer text-accent">Ver conversa ({d.chat.length})</summary>
                      <ul className="mt-2 grid gap-1 text-muted">
                        {d.chat.map((m) => (
                          <li key={m.id}>
                            <strong className="text-fg">{nomes[m.autor_id] ?? `Usuário ${m.autor_id}`}:</strong> {m.texto ?? "Anexo enviado"}
                          </li>
                        ))}
                      </ul>
                    </details>
                  )}
                  {d.estado === "aberta" && (
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
                  )}
                </Card>
              </li>
              );
            })}
          </ul>
          </>
          );
        }}
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
