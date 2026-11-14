import Link from "next/link";

export function MobileNav() {
  return (
    <nav className="mobile-nav" aria-label="Navegação móvel">
      <Link href="/vagas">Vagas</Link>
      <Link href="/match">Match</Link>
      <Link href="/chat">Chat</Link>
      <Link href="/perfil">Perfil</Link>
    </nav>
  );
}
