import type { ReactNode } from "react";
import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { RouteGuard } from "@/components/layout/route-guard";
import { Sidebar } from "@/components/layout/sidebar";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-50 focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-fg"
      >
        Ir para o conteúdo
      </a>
      <Header />
      <div className="app-shell">
        <Sidebar />
        <main id="conteudo" className="app-content" tabIndex={-1}>
          <RouteGuard>{children}</RouteGuard>
        </main>
      </div>
      <MobileNav />
    </>
  );
}
