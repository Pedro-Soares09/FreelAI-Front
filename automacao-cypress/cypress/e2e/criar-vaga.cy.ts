import { amanhaAs9h } from "../support/dados";

function preencherVaga() {
  cy.visit("/criar-vaga");
  cy.campo("Título").type(`Troca de fiação ${Date.now()}`);
  cy.campo("Categoria").select("Elétrica");
  cy.campo("Descrição do serviço").type("Servico de teste automatizado, ambiente local.");
  cy.campo("Valor (R$)").type("150");
  cy.campo("Duração (horas)").type("2");
  cy.campo("Início").type(amanhaAs9h());
  cy.campo("Bairro").select("Boa Viagem");
  cy.get("input[type=checkbox]").should("have.length.greaterThan", 0);
}

describe("Criar vaga", () => {
  beforeEach(() => cy.entrarComo("maria@example.com"));

  it("TC0007 - Publicar vaga com itens criticos marcados (positivo)", () => {
    preencherVaga();
    cy.get("input[type=checkbox]").each(($c) => cy.wrap($c).check());
    cy.contains("button", "Publicar vaga").click();
    cy.location("pathname").should("not.eq", "/criar-vaga");
  });

  it("TC0008 - Publicar vaga com item critico pendente (negativo)", () => {
    preencherVaga();
    cy.contains("button", "Publicar vaga").click();
    cy.contains("Confirme os itens críticos de segurança para publicar.").should("be.visible");
    cy.location("pathname").should("eq", "/criar-vaga");
  });
});
