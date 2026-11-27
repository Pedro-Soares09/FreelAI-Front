import "./comandos";

// O Cypress injeta um script no HTML da pagina, o que desalinha a hidratacao do
// React (erro minificado 418) apenas dentro do runner. No Chrome real a mesma pagina
// nao gera erro de console. Somente esse erro e ignorado; qualquer outro derruba o teste.
Cypress.on("uncaught:exception", (erro) => {
  if (/Minified React error #418|Hydration failed/.test(erro.message)) return false;
  return undefined;
});
