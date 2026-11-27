describe("Rota protegida", () => {
  it("TC0009 - Usuario logado acessa a area restrita (positivo)", () => {
    cy.entrarComo("maria@example.com");
    cy.visit("/vagas");
    cy.location("pathname").should("eq", "/vagas");
    cy.contains("Painel do contratante").should("be.visible");
  });

  it("TC0010 - Visitante anonimo e levado ao login (negativo)", () => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.visit("/vagas");
    cy.location("pathname").should("eq", "/login");
  });

  it("TC0011 - Contratante nao acessa o painel de administracao (negativo)", () => {
    cy.entrarComo("maria@example.com");
    cy.visit("/admin");
    cy.location("pathname").should("not.eq", "/admin");
  });
});
