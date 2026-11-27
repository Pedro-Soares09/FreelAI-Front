const PAGINAS: Array<[string, string, string, string]> = [
  ["TC0022", "Suporte", "/suporte", "Quando o pagamento é liberado?"],
  ["TC0024", "Politicas", "/politica", "Termos de Uso e Condições Gerais"],
  ["TC0026", "Plano Pro", "/plano-pro", "Plano Pro"],
  ["TC0028", "Perfil", "/perfil", "Perfil"],
];

describe("Paginas de apoio e perfil", () => {
  PAGINAS.forEach(([id, nome, caminho, texto], i) => {
    const negativo = `TC${String(Number(id.slice(2)) + 1).padStart(4, "0")}`;
    it(`${id} - ${nome}: usuario logado abre a pagina (positivo)`, () => {
      cy.entrarComo("maria@example.com");
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
});
