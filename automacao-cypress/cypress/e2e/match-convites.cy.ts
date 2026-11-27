import { aceitarComoProfissional, cartaoDoConvite, prepararContas, publicarEEscolher } from "../support/fluxo";

describe("Match e convites", () => {
  before(() => prepararContas());

  it("TC0016 - Contratante escolhe um profissional do top 3 (positivo)", () => {
    publicarEEscolher();
  });

  it("TC0017 - Contratante nao escolhe de novo o mesmo profissional (negativo)", () => {
    publicarEEscolher();
    cy.contains("button", "Aguardando resposta").should("be.disabled");
  });

  it("TC0018 - Profissional aceita o convite recebido (positivo)", () => {
    publicarEEscolher().then(({ titulo, email }) => aceitarComoProfissional(titulo, email));
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
