import { chegarAoChat, prepararContas } from "../support/fluxo";

describe("Chat", () => {
  before(() => prepararContas());
  beforeEach(() => {
    chegarAoChat();
  });

  it("TC0030 - Envio de mensagem no chat (positivo)", () => {
    cy.get("textarea, input[placeholder='Digite sua mensagem...']").first().type("Olá, posso chegar às 9h?");
    cy.contains("button", "Enviar").click();
    cy.contains("Olá, posso chegar às 9h?").should("be.visible");
  });

  it("TC0031 - Mensagem com telefone e barrada (negativo)", () => {
    cy.get("textarea, input[placeholder='Digite sua mensagem...']").first().type("Me chama no 81 99999-1234");
    cy.contains("button", "Enviar").click();
    cy.contains("Por segurança, não é permitido enviar telefone ou WhatsApp pelo chat.").should("be.visible");
  });
});
