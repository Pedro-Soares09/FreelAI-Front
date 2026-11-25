"use client";

import { useEffect, useState } from "react";
import { mensagemDeErro } from "@/api/erro";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import {
  formatarDataHora,
  sancoesApi,
  type PreviaCancelamento,
} from "@/services/sancoes";

const USA_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS !== "false";

type Props = { vagaId: string; status: string; onCancelada: () => void };

/** Cancelamento de vaga por quem participa dela, com aviso de advertência abaixo do limite de horas. */
export function CancelarVaga({ vagaId, status, onCancelada }: Props) {
  const { avisar } = useToast();
  const [previa, setPrevia] = useState<PreviaCancelamento>();
  const [aberto, setAberto] = useState(false);
  const [motivo, setMotivo] = useState("");
  const [erro, setErro] = useState<string>();
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (USA_MOCKS) return;
    let ativo = true;
    setPrevia(undefined);
    sancoesApi
      .previaCancelamento(vagaId)
      .then((p) => ativo && setPrevia(p))
      .catch(() => ativo && setPrevia(undefined));
    return () => {
      ativo = false;
    };
  }, [vagaId, status]);

  if (!previa?.pode_cancelar) return null;

  async function confirmar() {
    setErro(undefined);
    if (motivo.trim().length < 3) {
      setErro("Informe o motivo do cancelamento.");
      return;
    }
    setEnviando(true);
    try {
      const resposta = await sancoesApi.cancelar(vagaId, motivo.trim());
      setAberto(false);
      setMotivo("");
      avisar(
        resposta.suspensa_ate
          ? `Vaga cancelada. Sua conta foi suspensa até ${formatarDataHora(resposta.suspensa_ate)}.`
          : resposta.advertencia_aplicada
            ? "Vaga cancelada. Foi registrada uma advertência por cancelamento tardio."
            : "Vaga cancelada.",
        resposta.advertencia_aplicada ? "error" : "success",
      );
      onCancelada();
    } catch (e) {
      setErro(mensagemDeErro(e));
    } finally {
      setEnviando(false);
    }
  }

  const restantes = previa.advertencias_para_suspensao - previa.advertencias_no_periodo;

  return (
    <section className="space-y-2 rounded-2xl border border-borda bg-surface p-4">
      <h3 className="text-sm font-bold text-fg">Cancelar vaga</h3>
      <p className="text-xs text-muted">
        Cancelar com menos de {previa.limite_horas} h do início gera uma advertência.
      </p>
      <Button variant="danger" size="sm" onClick={() => setAberto(true)}>
        Cancelar vaga
      </Button>
      <Modal
        aberto={aberto}
        titulo="Cancelar esta vaga?"
        onFechar={() => setAberto(false)}
        rodape={
          <>
            <Button variant="secondary" onClick={() => setAberto(false)}>
              Voltar
            </Button>
            <Button variant="danger" loading={enviando} onClick={confirmar}>
              Confirmar cancelamento
            </Button>
          </>
        }
      >
        <div className="grid gap-3">
          {previa.gera_advertencia ? (
            <p role="alert" className="rounded-lg border border-danger/40 bg-danger/10 p-3 text-sm text-danger">
              Faltam menos de {previa.limite_horas} h para o início. Este cancelamento gera uma
              advertência. Você tem {previa.advertencias_no_periodo} de{" "}
              {previa.advertencias_para_suspensao} no período; com mais {restantes} a conta é
              suspensa.
            </p>
          ) : (
            <p className="text-sm text-muted">
              O cancelamento é sem advertência e a outra parte será avisada.
            </p>
          )}
          <Textarea
            label="Motivo"
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            rows={3}
            maxLength={255}
            error={erro}
          />
        </div>
      </Modal>
    </section>
  );
}
