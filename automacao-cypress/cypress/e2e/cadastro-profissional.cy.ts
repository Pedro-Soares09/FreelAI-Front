import { cpfUnico } from "../support/dados";

function etapa1(cpf: string) {
  // Espera as categorias carregarem: depois disso a tela para de re-renderizar.
  cy.intercept("GET", "**/api/v1/categorias*").as("categorias");
  cy.visit("/cadastro/profissional");
  cy.wait("@categorias");
  cy.contains("Etapa 1 de 4").should("be.visible");
  cy.campo("CPF").should("not.be.disabled").type(cpf.replace(/\D/g, ""));
  cy.campo("Data de nascimento").type("1990-01-15");
  cy.campo("Telefone com DDD").type("81999991234");
}

describe("Cadastro de profissional", () => {
  beforeEach(() => cy.novaConta());

  it("TC0012 - Cadastro de profissional com dados validos (positivo)", () => {
    etapa1(cpfUnico());
    cy.contains("button", "Continuar").click();
    cy.campo("Bairro").select("Boa Viagem");
    cy.contains("button", "Continuar").click();
    cy.get("input[type=checkbox]").first().check();
    cy.contains("button", "Continuar").click();
    cy.contains("button", "Enviar cadastro").click();
    cy.location("pathname").should("match", /\/verificacao/);
  });

  it("TC0013 - Cadastro de profissional com CPF invalido (negativo)", () => {
    etapa1("111.111.111-11");
    cy.contains("button", "Continuar").click();
    cy.contains("Informe um CPF válido.").should("be.visible");
    cy.location("pathname").should("eq", "/cadastro/profissional");
  });
});
