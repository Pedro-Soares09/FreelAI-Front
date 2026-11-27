describe("Administracao: fila de cadastros", () => {
  beforeEach(() => {
    cy.entrarComo("admin@example.com");
    cy.visit("/admin");
    cy.contains("h1", "Administração").should("be.visible");
  });

  it("TC0020 - Administrador aprova um cadastro da fila (positivo)", () => {
    cy.contains("button", "Aprovar").should("be.visible");
    cy.get("button").filter(":contains('Aprovar')").its("length").then((antes) => {
      cy.contains("button", "Aprovar").click();
      cy.get("button").filter(":contains('Aprovar')").should("have.length", antes - 1);
    });
  });

  it("TC0021 - Administrador recusa um cadastro sem informar o motivo (negativo)", () => {
    cy.contains("button", "Recusar").click();
    cy.contains("button", "Confirmar recusa").click();
    cy.contains("Informe o motivo da recusa (mínimo de 5 caracteres).").should("be.visible");
    cy.contains("Recusar cadastro").should("be.visible");
  });
});
