// [id, nome, caminho, texto esperado, conta que abre a pagina]
const PAGINAS: Array<[string, string, string, string, string]> = [
  ["TC0022", "Suporte", "/suporte", "Quando o pagamento é liberado?", "maria@example.com"],
  ["TC0024", "Politicas", "/politica", "Termos de Uso e Condições Gerais", "maria@example.com"],
  ["TC0026", "Plano Pro", "/plano-pro", "FREELAI PRO", "carlos@example.com"],
  ["TC0028", "Perfil", "/perfil", "Perfil", "maria@example.com"],
];

describe("Paginas de apoio e perfil", () => {
  PAGINAS.forEach(([id, nome, caminho, texto, conta]) => {
    const negativo = `TC${String(Number(id.slice(2)) + 1).padStart(4, "0")}`;
    it(`${id} - ${nome}: usuario logado abre a pagina (positivo)`, () => {
      cy.entrarComo(conta);
      cy.visit(caminho);
      cy.location("pathname").should("eq", caminho);
      cy.contains(texto).should("be.visible");
    });

    it(`${negativo} - ${nome}: visitante anonimo e levado ao login (negativo)`, () => {
      cy.clearCookies();
      cy.clearLocalStorage();
      cy.visit(caminho);
      cy.location("pathname").should("eq", "/login");
    });
  });

  it("TC0036 - Plano Pro: contratante nao acessa a pagina e recebe aviso (negativo)", () => {
    cy.entrarComo("maria@example.com");
    cy.visit("/plano-pro");
    cy.location("pathname").should("not.eq", "/plano-pro");
    cy.contains("Esta área é exclusiva para profissionais.").should("be.visible");
    cy.get("nav a, aside a").filter(":contains('Plano Pro')").should("not.exist");
  });

  it("TC0037 - Pagina livre de demonstracao do pagamento abre sem login (positivo)", () => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.visit("/pagamento/vaga-105");
    cy.location("pathname").should("eq", "/pagamento/vaga-105");
    cy.contains("Resumo").should("be.visible");
    cy.contains("Erro de validação").should("not.exist");
    cy.contains("Comprovantes de pagamento").should("be.visible");
    cy.contains("Não foi possível carregar os comprovantes.").should("not.exist");
  });
});
