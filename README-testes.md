# Testes do front (FreelAI-Front)

Três camadas: unitário e de componente (Vitest + Testing Library) e ponta a ponta (Playwright). Os testes unitários não precisam do back. Os E2E precisam do back e do front no ar.

## Instalar

```powershell
npm install
```

Os testes E2E usam o Google Chrome instalado (canal `chrome`). Para usar o Chromium do Playwright em vez dele, instale-o (`npx playwright install chromium`) e rode com `$env:E2E_CANAL="chromium"`.

## Unitário e de componente (Vitest)

```powershell
npm test
npm run test:cov
```

Cobrem o formulário de login (validação, erro 401, redirecionamento, `next` seguro, conta suspensa e banida), o tratamento de erros da API (`src/api/erro.ts`) e as validações de CPF, CNPJ e data de nascimento (`src/lib/validation.ts`). O fuso dos testes é fixado em `America/Sao_Paulo` em `vitest.config.mts`.

Falha conhecida registrada: `DEF-01` (maioridade no fuso do Brasil) está marcada com `it.fails` em `src/lib/validation.test.ts`.

## Ponta a ponta (Playwright)

1. Em outro terminal, no repositório do back, suba a API com banco limpo:

```powershell
.\.venv\Scripts\python.exe scripts/preparar_demo.py --arquivo e2e.db --servir
```

2. No front, gere o build de produção em modo real e inicie na porta 3300 (não rode o build com o `dev` ligado):

```powershell
$env:NEXT_PUBLIC_USE_MOCKS="false"; $env:NEXT_PUBLIC_MODO_DEMO="true"; $env:NEXT_PUBLIC_API_URL="http://localhost:8000"; npm run build
npm start -- -p 3300
```

3. Em um terceiro terminal, rode os testes:

```powershell
npm run test:e2e
```

Os testes são independentes entre si. O registro usa um e-mail único por execução (com a data e hora). Cada teste gera captura de tela (`screenshot: "on"`), e o rastreio (`trace`) é mantido só nas falhas, em `test-results/`. Para repetir a suíte em ambiente limpo, reinicie o back com `preparar_demo.py --arquivo e2e.db` antes.

## Cenários E2E

| ID | Tela | Cenário |
|---|---|---|
| CT-LOG-01 | Login | Entrar com a conta da Maria e chegar em /vagas; `next` interno é respeitado |
| CT-LOG-02 | Login | Senha errada mostra "E-mail ou senha inválidos." e permanece em /login |
| CT-LOG-03 | Login | Campos vazios mostram as duas mensagens |
| CT-LOG-04 | Login | E-mail inexistente recebe a mesma mensagem |
| CT-REG-01 | Registro | Conta nova com dados válidos |
| CT-REG-02 | Registro | Senha com 7 caracteres é recusada |
| CT-REG-04 | Registro | E-mail inválido é recusado |
| CT-REG-05 | Registro | E-mail já cadastrado é recusado pela API |
| CT-VAG-01 | Criar vaga | Itens críticos marcados, vaga publicada |
| CT-VAG-02 | Criar vaga | Item crítico pendente bloqueia a publicação |
