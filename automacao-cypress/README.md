# Automacao de testes do FreelAI (Cypress)

Projeto independente de testes de ponta a ponta. Nao altera as dependencias do front.

## Pre-requisitos (Windows, PowerShell)

- Node.js 20 ou superior (testado com 24) e npm
- Python 3.12 ou superior com o venv do back (`FreelAI-Back\.venv`, ver `FreelAI-Back\README-testes.md`)
- Back e front clonados lado a lado: `FreelAI-Back` e `FreelAI-Front`; este projeto fica em `FreelAI-Front\automacao-cypress`

## Executar

```powershell
npm install
.\scripts\subir-ambiente.ps1
npx cypress run
.\scripts\parar-ambiente.ps1
```

`subir-ambiente.ps1` recria `e2e.db` com as contas sinteticas (`maria@example.com`, `ana@example.com`, `admin@example.com`, senha `senha-segura-123`), sobe a API na 8000 e o front de producao na 3300. Se o ambiente ja estiver no ar, basta `npx cypress run`.

Modo interativo: `npx cypress open`. Outra URL: `$env:E2E_BASE_URL = "http://localhost:3300"`.

## Convencoes

- Um arquivo `.cy.ts` por fluxo, com no minimo um teste positivo e um negativo.
- O ID `TCxxxx` esta no titulo do `it()` e e o mesmo da tabela do relatorio.
- Cada teste e independente; registro usa e-mails unicos com timestamp.
- Video desligado; screenshot apenas em falha.

## Observacao sobre o erro 418 do React

Dentro do runner do Cypress, o React acusa o erro de hidratacao 418 porque o Cypress injeta um script no HTML. No Chrome real a pagina nao gera esse erro. Por isso `cypress/support/e2e.ts` ignora apenas esse erro; todo outro erro nao tratado da aplicacao continua falhando o teste. Isto e uma particularidade da ferramenta, nao um defeito do site.

## Se o binario do Cypress nao descompactar

Em alguns ambientes (pasta sincronizada pelo OneDrive, antivirus) a instalacao do binario para na descompactacao. Alternativa: apontar o cache para uma pasta curta, fora do OneDrive, antes de instalar e de rodar:

```powershell
$env:CYPRESS_CACHE_FOLDER = "C:\cy-cache"
npx cypress install
```

Se ainda assim falhar, baixe o zip de `https://download.cypress.io/desktop/13.17.0?platform=win32&arch=x64`, extraia em `C:\cy-cache\13.17.0\Cypress` e rode `npx cypress verify`.
