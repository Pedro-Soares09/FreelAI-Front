import { SENHA_DEMO } from "./dados";

// Localiza o campo pelo texto do rotulo (ignora o asterisco de obrigatorio). E uma query:
// o Cypress repete a busca inteira se a tela re-renderizar (os ids do React mudam).
Cypress.Commands.addQuery("campo", (rotulo: string) => {
  const limpo = (t: string) => t.replace(/\*/g, "").trim();
  return () => {
    const $l = cy
      .$$("label")
      .filter((_, el) => limpo(el.textContent ?? "") === rotulo)
      .first();
    if (!$l.length) return $l;
    const alvo = $l.attr("for");
    return alvo ? cy.$$(`[id="${alvo}"]`) : $l.find("input,select,textarea");
  };
});

// Login pela interface (usado no teste de login).
Cypress.Commands.add("entrarPelaTela", (email: string, senha: string = SENHA_DEMO) => {
  cy.visit("/login");
  cy.campo("E-mail").type(email);
  cy.campo("Senha").type(senha, { log: false });
  cy.contains("button", "Entrar").click();
});

// Login reaproveitado entre testes (cy.session) para dar velocidade.
Cypress.Commands.add("entrarComo", (email: string) => {
  cy.session(
    email,
    () => {
      cy.entrarPelaTela(email);
      cy.location("pathname").should("match", /\/vagas/);
    },
    { cacheAcrossSpecs: true },
  );
});

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      campo(rotulo: string): Chainable<JQuery<HTMLElement>>;
      entrarPelaTela(email: string, senha?: string): Chainable<void>;
      entrarComo(email: string): Chainable<void>;
    }
  }
}

// Cria uma conta nova pela tela de registro e deixa a sessao aberta (sem perfil).
Cypress.Commands.add("novaConta", () => {
  const email = `cy.${Date.now()}.${Math.floor(Math.random() * 1000)}@example.com`;
  cy.visit("/registro");
  cy.campo("Nome completo").type("Pessoa de Teste");
  cy.campo("E-mail").type(email);
  cy.campo("Senha").type(SENHA_DEMO, { log: false });
  cy.campo("Confirmar senha").type(SENHA_DEMO, { log: false });
  cy.contains("button", /Criar conta|Cadastrar|Registrar/).click();
  cy.location("pathname").should("match", /\/(verificacao|cadastro)/);
});

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      novaConta(): Chainable<void>;
    }
  }
}
