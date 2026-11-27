import { SENHA_DEMO } from "../support/dados";
import { chegarAoChat, prepararContas } from "../support/fluxo";

const API = Cypress.env("API_URL") ?? "http://localhost:8000";


// Profissional e contratante aceitam o acordo; devolve o id da vaga.
function fecharAcordo(): Cypress.Chainable<string> {
  return chegarAoChat().then(() => {
    cy.contains("button", "Fechar acordo").click();
    cy.location("pathname").should("match", /^\/acordo\/\d+/);
    cy.contains("button", "Li e aceito").click();
    cy.contains("Profissional: li e aceitou").should("be.visible");
    return cy.location("pathname").then((caminho) => {
      const vagaId = caminho.split("/").pop() as string;
      cy.entrarComo("maria@example.com");
      cy.visit(caminho);
      cy.contains("button", "Li e aceito").click();
      cy.contains("Acordo fechado").should("be.visible");
      return cy.wrap(vagaId);
    });
  });
}

describe("Pagamento Pix", () => {
  before(() => prepararContas());

  it("TC0034 - Pix ainda nao existe antes da conclusao do servico (negativo)", () => {
    fecharAcordo().then((vagaId) => {
      cy.visit(`/pagamento/${vagaId}`);
      cy.wait(1500);
      cy.contains("Simular pagamento").should("not.exist");
    });
  });

  it("TC0035 - Contratante simula o pagamento Pix depois da conclusao (positivo)", () => {
    fecharAcordo().then((vagaId) => {
      // Adianta o horario do servico e o contratante confirma a conclusao (abre a cobranca Pix).
      cy.task("avancarServico", { vagaId });
      cy.request("POST", `${API}/api/v1/auth/login`, { email: "maria@example.com", senha: SENHA_DEMO }).then(({ body }) => {
        cy.request({
          method: "POST",
          url: `${API}/api/v1/vagas/${vagaId}/conclusao`,
          headers: { authorization: `Bearer ${body.access_token}` },
        });
      });
      cy.visit(`/pagamento/${vagaId}`);
      cy.contains("button", "Simular pagamento").click();
      cy.contains(/pago|liberado/i).should("be.visible");
    });
  });
});
