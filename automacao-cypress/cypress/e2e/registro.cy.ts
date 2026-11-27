import { SENHA_DEMO } from "../support/dados";

function preencher(email: string, senha: string) {
  cy.visit("/registro");
  cy.campo("Nome completo").type("Pessoa de Teste");
  cy.campo("E-mail").type(email);
  cy.campo("Senha").type(senha, { log: false });
  cy.campo("Confirmar senha").type(senha, { log: false });
  cy.contains("button", /Criar conta|Cadastrar|Registrar/).click();
}

describe("Registro", () => {
  it("TC0004 - Registro com dados validos (positivo)", () => {
    preencher(`cy.${Date.now()}@example.com`, SENHA_DEMO);
    // Conta nova nasce pendente e segue para a verificacao de identidade.
    cy.location("pathname").should("match", /\/(verificacao|cadastro)/);
  });

  it("TC0005 - Registro com senha curta (negativo)", () => {
    preencher(`cy.curta.${Date.now()}@example.com`, "1234567");
    cy.contains("A senha deve ter pelo menos 8 caracteres.").should("be.visible");
    cy.location("pathname").should("eq", "/registro");
  });

  it("TC0006 - Registro com e-mail ja cadastrado (negativo)", () => {
    preencher("maria@example.com", SENHA_DEMO);
    cy.get("main [role='alert']").should("be.visible");
    cy.location("pathname").should("eq", "/registro");
  });
});
