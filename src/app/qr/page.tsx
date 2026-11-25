import type { Metadata } from "next";
import Link from "next/link";
import { AvisoBeta } from "@/components/institucional/aviso-beta";
import { QrCodeAcesso } from "./qr-code";

export const metadata: Metadata = { title: "QR Code da versão Beta | FreelAI" };

export default function QrPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center gap-6 px-4 py-10">
      <Link href="/" className="text-xl font-extrabold tracking-tight text-primary">
        FreelAI
      </Link>
      <div className="w-full rounded-card border border-borda bg-surface p-6 shadow-neon">
        <h1 className="text-2xl font-bold">Conheça a versão Beta</h1>
        <p className="mt-2 text-sm text-muted">
          Aponte a câmera do celular para o QR Code e navegue pela plataforma durante a
          apresentação. Esta é uma versão Beta: a jornada completa funciona, mas o pagamento é
          simulado e a inteligência artificial ainda não faz parte desta entrega.
        </p>
        <div className="mt-6">
          <QrCodeAcesso />
        </div>
      </div>
      <AvisoBeta />
    </main>
  );
}
