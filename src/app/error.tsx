"use client";

import { ErroComRetry } from "@/components/ui/estados";

export default function ErroGlobal({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="mx-auto max-w-lg p-6">
      <ErroComRetry mensagem="Algo deu errado ao exibir esta página." onTentarNovamente={reset} />
    </main>
  );
}
