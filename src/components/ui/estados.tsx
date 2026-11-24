import type { ReactNode } from "react";
import { IconAlert, IconInbox } from "./icons";
import { Button } from "./button";
import { Spinner } from "./spinner";

export function Carregando({ rotulo = "Carregando" }: { rotulo?: string }) {
  return (
    <div className="flex min-h-48 flex-col items-center justify-center gap-3 text-muted">
      <Spinner rotulo={rotulo} />
      <p className="text-sm" aria-hidden="true">
        {rotulo}...
      </p>
    </div>
  );
}

export function Esqueleto({ linhas = 3 }: { linhas?: number }) {
  return (
    <div className="grid gap-3" aria-hidden="true">
      {Array.from({ length: linhas }).map((_, i) => (
        <div key={i} className="h-20 animate-pulse rounded-card bg-surface-2" />
      ))}
    </div>
  );
}

type EstadoProps = {
  titulo: string;
  descricao?: string;
  acao?: ReactNode;
};

export function ListaVazia({ titulo, descricao, acao }: EstadoProps) {
  return (
    <div className="flex min-h-48 flex-col items-center justify-center gap-2 rounded-card border border-dashed border-borda p-8 text-center">
      <IconInbox width={32} height={32} className="text-muted" />
      <p className="font-semibold">{titulo}</p>
      {descricao && <p className="max-w-sm text-sm text-muted">{descricao}</p>}
      {acao && <div className="mt-2">{acao}</div>}
    </div>
  );
}

type ErroProps = {
  mensagem?: string;
  onTentarNovamente?: () => void;
};

export function ErroComRetry({
  mensagem = "Não foi possível carregar os dados.",
  onTentarNovamente,
}: ErroProps) {
  return (
    <div
      role="alert"
      className="flex min-h-48 flex-col items-center justify-center gap-3 rounded-card border border-danger/40 p-8 text-center"
    >
      <IconAlert width={32} height={32} className="text-danger" />
      <p className="font-semibold">{mensagem}</p>
      {onTentarNovamente && (
        <Button variant="secondary" onClick={onTentarNovamente}>
          Tentar de novo
        </Button>
      )}
    </div>
  );
}

type Estado<T> =
  | { tipo: "carregando" }
  | { tipo: "erro"; mensagem?: string }
  | { tipo: "pronto"; dados: T[] };

/** Renderiza loading, vazio, erro ou a lista, para que toda lista siga o mesmo padrão. */
export function EstadoDeLista<T>({
  estado,
  vazio,
  onTentarNovamente,
  children,
}: {
  estado: Estado<T>;
  vazio: EstadoProps;
  onTentarNovamente?: () => void;
  children: (dados: T[]) => ReactNode;
}) {
  if (estado.tipo === "carregando") return <Esqueleto />;
  if (estado.tipo === "erro") {
    return <ErroComRetry mensagem={estado.mensagem} onTentarNovamente={onTentarNovamente} />;
  }
  if (estado.dados.length === 0) return <ListaVazia {...vazio} />;
  return <>{children(estado.dados)}</>;
}
