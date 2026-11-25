import Link from "next/link";
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
        
<section className="relative mx-auto flex w-full max-w-6xl flex-col items-start gap-7 overflow-hidden px-4 py-24 md:py-32">
  <div className="absolute right-0 top-10 -z-10 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />

  <p className="rounded-full border border-primary/40 bg-primary/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-primary">
    Conectando talentos e oportunidades
  </p>

  <h1 className="max-w-4xl text-5xl font-extrabold leading-tight tracking-tight md:text-7xl">
    Seu próximo{" "}
    <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
      freela
    </span>{" "}
    está aqui.
  </h1>

  <p className="max-w-2xl text-lg leading-relaxed text-muted md:text-xl">
    Encontre profissionais para realizar seus serviços ou descubra novas
    oportunidades de trabalho. A FreelAI aproxima talentos e clientes
    por meio de conexões inteligentes.
  </p>

  <BotoesDeCadastro />

  <p className="text-sm text-muted">
    Tecnologia e oportunidades trabalhando juntas.
  </p>
</section>



<section id="como-funciona" className="border-y border-borda bg-surface">
  <div className="mx-auto w-full max-w-6xl px-4 py-20">
    <div className="mx-auto max-w-2xl text-center">
      <p className="mb-3 text-sm font-bold uppercase tracking-widest text-primary">
        Simples e inteligente
      </p>

      <h2 className="text-3xl font-extrabold md:text-4xl">
        Como funciona a FreelAI?
      </h2>

      <p className="mt-4 text-muted">
        Da sua necessidade até a conexão com o profissional ideal,
        tudo acontece em três etapas.
      </p>
    </div>

    <ol className="mt-12 grid gap-6 md:grid-cols-3">
      {PASSOS.map((p) => (
        <li
          key={p.n}
          className="group rounded-2xl border border-borda bg-bg p-7 transition duration-300 hover:-translate-y-2 hover:border-primary/60 hover:shadow-neon"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 text-xl font-extrabold text-primary">
            0{p.n}
          </span>

          <h3 className="mt-6 text-xl font-bold">
            {p.titulo}
          </h3>

          <p className="mt-3 text-sm leading-relaxed text-muted">
            {p.texto}
          </p>
        </li>
      ))}
    </ol>

    <div className="mt-20">
      <div className="text-center">
        <p className="text-sm font-bold uppercase tracking-widest text-accent">
          Por que escolher a FreelAI?
        </p>

        <h3 className="mt-3 text-2xl font-bold">
          Uma experiência feita para conectar melhor.
        </h3>
      </div>

      <ul className="mt-8 grid gap-6 md:grid-cols-3">
        {DIFERENCIAIS.map((d) => (
          <li
            key={d.titulo}
            className="rounded-xl border border-borda bg-bg p-6 transition hover:border-accent/50"
          >
            <h4 className="font-bold text-primary">
              {d.titulo}
            </h4>

            <p className="mt-3 text-sm leading-relaxed text-muted">
              {d.texto}
            </p>
          </li>
        ))}
      </ul>
    </div>
  </div>
</section>



        <section id="quem-somos" className="mx-auto w-full max-w-6xl px-4 py-20">
  <div className="grid items-center gap-12 md:grid-cols-2">
    <div>
      <p className="mb-3 text-sm font-bold uppercase tracking-widest text-primary">
        Conheça a FreelAI
      </p>

      <h2 className="text-3xl font-extrabold leading-tight md:text-4xl">
        Mais que uma plataforma, uma conexão entre talentos e oportunidades.
      </h2>

      <p className="mt-6 leading-relaxed text-muted">
        A FreelAI nasceu para aproximar pessoas que precisam de serviços de
        profissionais que sabem realizá-los. Utilizando tecnologia e inteligência
        artificial, buscamos tornar essa conexão mais simples, rápida e eficiente.
      </p>

      <p className="mt-4 leading-relaxed text-muted">
        Nossa proposta é facilitar a contratação, valorizar profissionais e
        transformar a maneira como oportunidades de trabalho são encontradas.
      </p>
    </div>

    <div className="grid gap-4 sm:grid-cols-2">
      <div className="rounded-2xl border border-primary/30 bg-surface p-6">
        <span className="text-3xl font-extrabold text-primary">10%</span>
        <h3 className="mt-3 text-lg font-bold">Taxa por serviço</h3>
        <p className="mt-2 text-sm text-muted">
          A FreelAI recebe uma taxa de 10% por serviço fechado.
        </p>
      </div>

      <div className="rounded-2xl border border-accent/30 bg-surface p-6 sm:translate-y-8">
        <span className="text-3xl font-extrabold text-accent">Pro</span>
        <h3 className="mt-3 text-lg font-bold">FreelAI Pro</h3>
        <p className="mt-2 text-sm text-muted">
          Mais destaque e prioridade para profissionais na plataforma.
        </p>
      </div>
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
