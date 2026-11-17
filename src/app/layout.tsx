import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { UserProvider } from "@/context/user-context";

export const metadata: Metadata = {
  title: "FreelAI - Plataforma de Freelancers Verificados",
  description: "Conectando empresas a profissionais com identidade e competências verificadas.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <UserProvider>{children}</UserProvider>
      </body>
    </html>
  );
}
