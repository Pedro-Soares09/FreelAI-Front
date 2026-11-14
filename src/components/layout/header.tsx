import Link from "next/link";

export function Header() {
  return (
    <header className="site-header">
      <Link href="/">FreelAI</Link>
      <Link href="/perfil">Meu perfil</Link>
    </header>
  );
}
