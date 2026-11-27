describe("Login", () => {
  it("TC0001 - Login com credenciais validas (positivo)", () => {
    cy.entrarPelaTela("maria@example.com");
    cy.location("pathname").should("match", /\/vagas/);
  });

  it("TC0002 - Login com senha errada (negativo)", () => {
    cy.entrarPelaTela("maria@example.com", "senha-errada-123");
    cy.contains('[role="alert"]', "E-mail ou senha inválidos.").should("be.visible");
    cy.location("pathname").should("eq", "/login");
  });

  it("TC0003 - Login com campos vazios (negativo)", () => {
    cy.visit("/login");
    cy.contains("button", "Entrar").click();
    cy.contains("Informe o e-mail.").should("be.visible");
    cy.contains("Informe a senha.").should("be.visible");
    cy.location("pathname").should("eq", "/login");
  });
});
