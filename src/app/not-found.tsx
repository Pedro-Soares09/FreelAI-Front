import Link from "next/link";
import { variantesBotao, baseBotao, tamanhosBotao } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-3 p-6 text-center">
      <p className="text-5xl font-extrabold text-primary">404</p>
      <h1 className="text-2xl font-bold">Página não encontrada</h1>
      <p className="text-muted">O endereço pode ter sido digitado errado ou a página foi movida.</p>
      <Link href="/" className={`${baseBotao} ${variantesBotao.primary} ${tamanhosBotao.md}`}>
        Voltar ao início
      </Link>
    </main>
  );
}
