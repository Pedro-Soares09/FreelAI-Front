import Link from "next/link";
import { IconShield } from "@/components/ui/icons";
import { baseBotao, tamanhosBotao, variantesBotao } from "@/components/ui/button";
import { AvisoBeta } from "@/components/institucional/aviso-beta";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const CADASTRO_PROFISSIONAL = "/registro?tipo=profissional";
const CADASTRO_CONTRATANTE = "/registro?tipo=contratante";

const PASSOS = [
  { n: 1, titulo: "Descreva o que precisa", texto: "Conte qual serviço você quer contratar, onde e quando." },
  {
    n: 2,
    titulo: "A FREELAI cruza os dados",
    texto: "Habilidade, localização, reputação e preço entram no cálculo do match.",
  },
  {
    n: 3,
    titulo: "Três profissionais compatíveis",
    texto: "Você recebe os três melhores em segundos e escolhe com quem fechar.",
  },
];

const DIFERENCIAIS = [
  { titulo: "Match inteligente", texto: "Uma vaga, três melhores profissionais. Sem enviar 50 propostas." },
  { titulo: "Preço justo", texto: "Sem leilão de preço. O valor é combinado de forma transparente." },
  { titulo: "Acordo claro entre as partes", texto: "O acordo do serviço é gerado pela plataforma e aceito pelas duas partes." },
];

function BotoesDeCadastro() {
  return (
    <div className="flex flex-wrap gap-3">
      <Link href={CADASTRO_PROFISSIONAL} className={`${baseBotao} ${variantesBotao.primary} ${tamanhosBotao.lg}`}>
        Quero trabalhar
      </Link>
      <Link href={CADASTRO_CONTRATANTE} className={`${baseBotao} ${variantesBotao.secondary} ${tamanhosBotao.lg}`}>
        Preciso de um serviço
      </Link>
    </div>
  );
}

export function Landing() {
  return (
    <div>
      <div className="mx-auto max-w-6xl px-4 pt-3">
        <AvisoBeta />
      </div>
      <header className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4">
        <span className="text-xl font-extrabold tracking-tight text-primary">FreelAI</span>
        <nav aria-label="Principal" className="flex items-center gap-3 text-sm">
          <a href="#como-funciona" className="hidden text-muted hover:text-fg sm:inline">
            Como funciona
          </a>
          <a href="#quem-somos" className="hidden text-muted hover:text-fg sm:inline">
            Quem somos
          </a>
          <Link href="/login" className="font-semibold hover:text-primary">
            Entrar
          </Link>
          <ThemeToggle />
        </nav>
      </header>

      <main>
        <section className="mx-auto flex w-full max-w-6xl flex-col items-start gap-6 px-4 py-16 md:py-24">
          <p className="rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
            Recife, PE
          </p>
          <h1 className="max-w-3xl text-4xl font-extrabold leading-tight md:text-6xl">
            Seu próximo <span className="text-primary">freela</span> está aqui.
          </h1>
          <p className="max-w-2xl text-lg text-muted">
            Bicos rápidos e serviços pontuais. Você descreve o que precisa e a FREELAI encontra os três melhores
            profissionais perto de você.
          </p>
          <BotoesDeCadastro />
        </section>

        <section id="como-funciona" className="border-y border-borda bg-surface">
          <div className="mx-auto w-full max-w-6xl px-4 py-16">
            <h2 className="text-3xl font-bold">Do pedido ao match em três passos</h2>
            <ol className="mt-8 grid gap-4 md:grid-cols-3">
              {PASSOS.map((p) => (
                <li key={p.n} className="rounded-card border border-borda bg-bg p-6">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-fg font-bold">
                    {p.n}
                  </span>
                  <h3 className="mt-4 text-lg font-bold">{p.titulo}</h3>
                  <p className="mt-1 text-sm text-muted">{p.texto}</p>
                </li>
              ))}
            </ol>
            <ul className="mt-8 grid gap-4 md:grid-cols-3">
              {DIFERENCIAIS.map((d) => (
                <li key={d.titulo} className="flex gap-3">
                  <IconShield className="mt-0.5 shrink-0 text-success" />
                  <div>
                    <p className="font-semibold">{d.titulo}</p>
                    <p className="text-sm text-muted">{d.texto}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="quem-somos" className="mx-auto w-full max-w-6xl px-4 py-16">
          <h2 className="text-3xl font-bold">Quem somos</h2>
          <p className="mt-4 max-w-3xl text-muted">
            Não é falta de talento, é falta de conexão. Quem contrata precisa resolver hoje e recebe propostas
            demais ou não encontra alguém confiável. Quem trabalha tem habilidade, mas perde horas procurando
            clientes. A FREELAI conecta as duas pontas de forma rápida, começando por Recife.
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="rounded-card border border-borda bg-surface p-6">
              <h3 className="text-lg font-bold">Taxa de 10% por serviço fechado</h3>
              <p className="mt-1 text-sm text-muted">
                Só cobramos quando o serviço acontece. Em um serviço de R$ 150, a FREELAI recebe R$ 15.
              </p>
            </div>
            <div className="rounded-card border border-borda bg-surface p-6">
              <h3 className="text-lg font-bold">FREELAI Pro</h3>
              <p className="mt-1 text-sm text-muted">
                Destaque e prioridade para profissionais que querem ser encontrados primeiro. Valores e
                condições do plano estão em definição.
              </p>
            </div>
          </div>
        </section>

        <section className="border-t border-borda bg-surface">
          <div className="mx-auto flex w-full max-w-6xl flex-col items-start gap-5 px-4 py-14">
            <h2 className="text-3xl font-bold">Pronto para o seu próximo freela?</h2>
            <BotoesDeCadastro />
          </div>
        </section>
      </main>

      <footer className="mx-auto w-full max-w-6xl px-4 py-8 text-sm text-muted">
        FREELAI. Seu próximo freela está aqui.
      </footer>
    </div>
  );
}
