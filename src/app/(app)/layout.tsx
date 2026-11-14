import type { ReactNode } from "react";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      <div className="app-shell">
        <Sidebar />
        <main className="app-content">{children}</main>
      </div>
      <MobileNav />
    </>
  );
}
