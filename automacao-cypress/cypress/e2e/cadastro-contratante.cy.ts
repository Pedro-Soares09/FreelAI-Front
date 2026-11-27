import { cpfUnico } from "../support/dados";

describe("Cadastro de contratante", () => {
  beforeEach(() => cy.novaConta());

  it("TC0014 - Cadastro de contratante pessoa fisica valido (positivo)", () => {
    cy.visit("/cadastro/empresa");
    cy.campo("CPF").type(cpfUnico());
    cy.campo("Telefone com DDD").type("81999991234");
    cy.contains("button", "Enviar cadastro").click();
    cy.location("pathname").should("match", /\/verificacao/);
  });

  it("TC0015 - Cadastro de empresa com CNPJ invalido (negativo)", () => {
    cy.visit("/cadastro/empresa");
    // A tela so responde a cliques depois de hidratada: o React marca o elemento com __reactProps.
    cy.get("input[name=tipo]")
      .first()
      .should(($i) => expect(Object.keys($i[0]).some((k) => k.startsWith("__reactProps"))).to.eq(true));
    cy.contains("label", "Empresa").click();
    cy.campo("Razão social").type("Empresa de Teste Ltda");
    cy.campo("CNPJ (opcional)").type("11111111111111");
    cy.campo("Telefone com DDD").type("81999991234");
    cy.contains("button", "Enviar cadastro").click();
    cy.contains("CNPJ inválido.").should("be.visible");
    cy.location("pathname").should("eq", "/cadastro/empresa");
  });
});
