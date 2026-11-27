// Fluxo: o contratante publica uma vaga, escolhe um dos tres profissionais e o escolhido responde.
import { SENHA_DEMO, amanhaAs9h } from "../support/dados";

const API = Cypress.env("API_URL") ?? "http://localhost:8000";
const CONTAS_PROFISSIONAIS = ["carlos", "bruna", "diego", "elisa", "ana"].map((n) => `${n}@example.com`);
const emailPorUsuario: Record<number, string> = {};

type Top3 = { vaga: { titulo: string }; profissionais: Array<{ usuario_id?: number | null }> };

// Publica uma vaga como Maria e escolhe, no top 3, um profissional que tenha conta de demonstracao.
// Devolve o titulo da vaga e o e-mail do profissional escolhido.
function publicarEEscolher(): Cypress.Chainable<{ titulo: string; email: string }> {
  const titulo = `Troca de fiação ${Date.now()}`;
  cy.entrarComo("maria@example.com");
  cy.intercept("GET", "**/api/v1/contratante/top3").as("top3");
  cy.visit("/criar-vaga");
  cy.campo("Título").type(titulo);
  cy.campo("Categoria").select("Montagem de móveis");
  cy.campo("Descrição do serviço").type("Servico de teste automatizado, ambiente local.");
  cy.campo("Valor (R$)").type("150");
  cy.campo("Duração (horas)").type("2");
  cy.campo("Início").type(amanhaAs9h());
  cy.campo("Bairro").select("Boa Viagem");
  cy.contains("button", "Publicar vaga").click();
  cy.location("pathname").should("eq", "/match");
  return cy.wait("@top3").then(({ response }) => {
    const match = (response?.body as Top3[]).find((m) => m.vaga.titulo === titulo);
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
function cartaoDoConvite(titulo: string) {
  return cy
    .contains("h2", titulo)
    .parents()
    .filter((_, el) => el.querySelectorAll("button").length > 0 && el.querySelectorAll("h2").length === 1)
    .first();
}

describe("Match e convites", () => {
  before(() => {
    // Descobre o id de usuario de cada conta de demonstracao (uma vez por arquivo).
    CONTAS_PROFISSIONAIS.forEach((email) => {
      cy.request("POST", `${API}/api/v1/auth/login`, { email, senha: SENHA_DEMO }).then(({ body }) => {
        cy.request({ url: `${API}/api/v1/auth/me`, headers: { authorization: `Bearer ${body.access_token}` } }).then(
          ({ body: eu }) => {
            emailPorUsuario[eu.id] = email;
          },
        );
      });
    });
  });

  it("TC0016 - Contratante escolhe um profissional do top 3 (positivo)", () => {
    publicarEEscolher();
  });

  it("TC0017 - Contratante nao escolhe de novo o mesmo profissional (negativo)", () => {
    publicarEEscolher();
    cy.contains("button", "Aguardando resposta").should("be.disabled");
  });

  it("TC0018 - Profissional aceita o convite recebido (positivo)", () => {
    publicarEEscolher().then(({ titulo, email }) => {
      cy.entrarComo(email);
      cy.visit("/match");
      cy.contains(titulo).should("be.visible");
      cartaoDoConvite(titulo).contains("button", "Aceitar vaga").click();
      cy.contains("button", "Confirmar").click();
      cy.contains(/Match encontrado|Vaga garantida/).should("be.visible");
    });
  });

  it("TC0019 - Profissional recusa o convite recebido (negativo)", () => {
    publicarEEscolher().then(({ titulo, email }) => {
      cy.entrarComo(email);
      cy.visit("/match");
      cy.contains(titulo).should("be.visible");
      cartaoDoConvite(titulo).contains("button", "Recusar").click();
      cy.contains("button", "Confirmar").click();
      cy.contains(titulo).should("not.exist");
    });
  });
});
