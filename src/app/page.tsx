import Link from "next/link";

export default function HomePage() {
  return (
    <main className="page">
      <h1>FreelAI</h1>
      <p>Encontre oportunidades e profissionais para o seu próximo projeto.</p>
      <Link href="/vagas">Explorar vagas</Link>
    </main>
  );
}
