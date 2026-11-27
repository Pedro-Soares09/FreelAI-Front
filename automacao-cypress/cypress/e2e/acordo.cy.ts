import { chegarAoChat, prepararContas } from "../support/fluxo";

describe("Acordo", () => {
  before(() => prepararContas());

  it("TC0032 - Profissional le e aceita o acordo do servico (positivo)", () => {
    chegarAoChat();
    cy.contains("button", "Fechar acordo").click();
    cy.location("pathname").should("match", /^\/acordo\/\d+/);
    cy.contains("Termos do serviço").should("be.visible");
    cy.contains("button", "Li e aceito").click();
    cy.contains("Profissional: li e aceitou").should("be.visible");
  });

  it("TC0033 - Profissional de fora da vaga nao acessa o acordo (negativo)", () => {
    chegarAoChat().then(({ email }) => {
      cy.contains("button", "Fechar acordo").click();
      cy.location("pathname").should("match", /^\/acordo\/\d+/);
      cy.location("pathname").then((caminho) => {
        const fora = email === "ana@example.com" ? "elisa@example.com" : "ana@example.com";
        cy.entrarComo(fora);
        cy.visit(caminho);
        cy.contains("Acordo não encontrado, ou esta conta não participa dele.").should("be.visible");
        cy.contains("Termos do serviço").should("not.exist");
        cy.contains("button", "Li e aceito").should("not.exist");
      });
    });
  });
});
