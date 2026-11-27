// Passos reutilizaveis do fluxo vaga, escolha, aceite e chat (usados por mais de um arquivo de teste).
import { SENHA_DEMO, amanhaAs9h } from "./dados";

const API = Cypress.env("API_URL") ?? "http://localhost:8000";
const CONTAS_PROFISSIONAIS = ["carlos", "bruna", "diego", "elisa", "ana"].map((n) => `${n}@example.com`);
const emailPorUsuario: Record<number, string> = {};

type Top3 = { vaga: { titulo: string }; profissionais: Array<{ usuario_id?: number | null }> };

// Descobre o id de usuario de cada conta de demonstracao (chamar em um before).
export function prepararContas() {
  CONTAS_PROFISSIONAIS.forEach((email) => {
    cy.request("POST", `${API}/api/v1/auth/login`, { email, senha: SENHA_DEMO }).then(({ body }) => {
      cy.request({ url: `${API}/api/v1/auth/me`, headers: { authorization: `Bearer ${body.access_token}` } }).then(
        ({ body: eu }) => {
          emailPorUsuario[eu.id] = email;
        },
      );
    });
  });
}

// Publica uma vaga como Maria e escolhe, no top 3, um profissional que tenha conta de demonstracao.
export function publicarEEscolher(): Cypress.Chainable<{ titulo: string; email: string }> {
  const titulo = `Troca de fiação ${Date.now()}`;
  cy.entrarComo("maria@example.com");
  // Espera as categorias carregarem: antes disso a tela ainda re-renderiza e perde teclas.
  cy.intercept("GET", "**/api/v1/categorias*").as("categorias");
  cy.visit("/criar-vaga");
  cy.wait("@categorias");
  cy.campo("Título").should("not.be.disabled").type(titulo);
  cy.campo("Título").should("have.value", titulo);
  cy.campo("Categoria").select("Montagem de móveis");
  cy.campo("Descrição do serviço").type("Servico de teste automatizado, ambiente local.");
  cy.campo("Valor (R$)").type("150");
  cy.campo("Duração (horas)").type("2");
  cy.campo("Início").type(amanhaAs9h());
  cy.campo("Bairro").select("Boa Viagem");
  // A interceptacao so comeca agora: assim a resposta capturada e a posterior a publicacao.
  cy.intercept("GET", "**/api/v1/contratante/top3").as("top3");
  cy.contains("button", "Publicar vaga").click();
  cy.location("pathname").should("eq", "/match");
  // Algumas chamadas ao top 3 podem anteceder a publicacao: espera a que ja traz a vaga.
  const esperarTop3 = (restantes: number): Cypress.Chainable<Top3> =>
    cy.wait("@top3").then(({ response }) => {
      const achada = (response?.body as Top3[]).find((m) => m.vaga.titulo === titulo);
      if (achada || restantes === 0) return cy.wrap(achada as Top3);
      return esperarTop3(restantes - 1);
    });
  return esperarTop3(4).then((match) => {
    expect(match, "vaga publicada aparece no match").to.not.equal(undefined);
    const posicao = match!.profissionais.findIndex((p) => p.usuario_id != null && emailPorUsuario[p.usuario_id]);
    expect(posicao, "um profissional de demonstracao no top 3").to.be.at.least(0);
    const email = emailPorUsuario[match!.profissionais[posicao].usuario_id as number];
    cy.contains("section", titulo).find("article").eq(posicao).as("cartao");
    cy.get("@cartao").contains("button", "Escolher profissional").click();
    cy.get("@cartao").contains("button", "Aguardando resposta").should("be.disabled");
    return cy.wrap({ titulo, email });
  });
}

// Cartao do convite da vaga: o menor ancestral do titulo que tem botoes e um unico titulo.
export function cartaoDoConvite(titulo: string) {
  return cy
    .contains("h2", titulo)
    .parents()
    .filter((_, el) => el.querySelectorAll("button").length > 0 && el.querySelectorAll("h2").length === 1)
    .first();
}

// Entra como o profissional escolhido e aceita o convite (termina na tela de match encontrado).
export function aceitarComoProfissional(titulo: string, email: string) {
  cy.entrarComo(email);
  cy.visit("/match");
  cy.contains(titulo).should("be.visible");
  cartaoDoConvite(titulo).contains("button", "Aceitar vaga").click();
  cy.contains("button", "Confirmar").click();
  cy.contains(/Match encontrado|Vaga garantida/).should("be.visible");
}

// Do aceite ate a conversa aberta: devolve titulo e e-mail do profissional.
export function chegarAoChat(): Cypress.Chainable<{ titulo: string; email: string }> {
  return publicarEEscolher().then(({ titulo, email }) => {
    aceitarComoProfissional(titulo, email);
    cy.contains("button", "Abrir chat da vaga agora").click();
    cy.location("pathname").should("match", /^\/chat\/\d+/);
    return cy.wrap({ titulo, email });
  });
}
