import Link from "next/link";

export function Sidebar() {
  return (
    <aside className="site-sidebar" aria-label="Navegação principal">
      <nav>
        <Link href="/vagas">Vagas</Link>
        <Link href="/match">Match</Link>
        <Link href="/criar-vaga">Criar vaga</Link>
        <Link href="/chat">Conversas</Link>
        <Link href="/perfil">Perfil</Link>
      </nav>
    </aside>
  );
}
