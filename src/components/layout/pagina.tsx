import type { ReactNode } from "react";

type PaginaProps = { titulo: string; descricao?: string; children: ReactNode };

export function Pagina({ titulo, descricao, children }: PaginaProps) {
  return (
    <section className="page">
      <h1 className="text-3xl font-bold">{titulo}</h1>
      {descricao && <p className="mt-1 text-muted">{descricao}</p>}
      <div className="mt-6">{children}</div>
    </section>
  );
}
