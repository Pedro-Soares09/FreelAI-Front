import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ToastProvider } from "@/components/ui/toast";
import { SessionProvider } from "@/lib/session";
import { CHAVE_TEMA, TEMA_PADRAO } from "@/theme/tokens";
import "./globals.css";

export const metadata: Metadata = {
  title: "FreelAI",
  description: "Seu próximo freela está aqui.",
};

const scriptTema = `try{var t=localStorage.getItem(${JSON.stringify(CHAVE_TEMA)});document.documentElement.dataset.theme=(t==="light"||t==="dark")?t:${JSON.stringify(TEMA_PADRAO)};}catch(e){document.documentElement.dataset.theme=${JSON.stringify(TEMA_PADRAO)};}`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" data-theme={TEMA_PADRAO} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: scriptTema }} />
      </head>
      <body>
        <ToastProvider>
          <SessionProvider>{children}</SessionProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
