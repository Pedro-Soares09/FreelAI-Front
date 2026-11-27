# Testes do front (FreelAI-Front)

Três camadas: unitário e de componente (Vitest + Testing Library) e ponta a ponta (Cypress). Os testes unitários não precisam do back. Os E2E precisam do back e do front no ar.

## Instalar

```powershell
npm install
```

## Unitário e de componente (Vitest)

```powershell
npm test
npm run test:cov
```

Cobrem o formulário de login (validação, erro 401, redirecionamento, `next` seguro, conta suspensa e banida), o tratamento de erros da API (`src/api/erro.ts`) e as validações de CPF, CNPJ e data de nascimento (`src/lib/validation.ts`). O fuso dos testes é fixado em `America/Sao_Paulo` em `vitest.config.mts`.

A validação de maioridade (`validateBirthDate`) é testada com valores limite de 17, 18 e 120 anos no fuso de Recife.

## Ponta a ponta (Cypress)

Os testes de ponta a ponta ficam em `automacao-cypress/`, um projeto independente com `package.json` próprio (não altera as dependências do front). O passo a passo, os scripts de ambiente (`subir-ambiente.ps1` e `parar-ambiente.ps1`) e as convenções estão no `README.md` dessa pasta.

```powershell
cd automacao-cypress
npm install
.\scripts\subir-ambiente.ps1
npx cypress run
.\scripts\parar-ambiente.ps1
```

## Cenários E2E

| ID | Tela | Cenário |
|---|---|---|
| TC0001 | Login | Entrar com a conta da Maria e chegar em /vagas |
| TC0002 | Login | Senha errada mostra "E-mail ou senha inválidos." e permanece em /login |
| TC0003 | Login | Campos vazios mostram as duas mensagens |
| TC0004 | Registro | Conta nova com dados válidos |
| TC0005 | Registro | Senha com 7 caracteres é recusada |
| TC0006 | Registro | E-mail já cadastrado é recusado pela API |
| TC0007 | Criar vaga | Itens críticos marcados, vaga publicada |
| TC0008 | Criar vaga | Item crítico pendente bloqueia a publicação |
| TC0009 | Rota protegida | Usuário logado acessa /vagas |
| TC0010 | Rota protegida | Visitante anônimo é levado ao /login |
| TC0011 | Rota protegida | Contratante não acessa /admin |
| TC0012 | Cadastro de profissional | Quatro etapas válidas |
| TC0013 | Cadastro de profissional | CPF inválido bloqueia a etapa 1 |
| TC0014 | Cadastro de contratante | Pessoa física válida |
| TC0015 | Cadastro de contratante | CNPJ inválido é recusado |
| TC0016 | Match | Contratante escolhe um profissional do top 3 |
| TC0017 | Match | Profissional escolhido não pode ser escolhido de novo |
| TC0018 | Convites | Profissional aceita o convite |
| TC0019 | Convites | Profissional recusa o convite |
| TC0020 | Administração | Aprovar um cadastro da fila |
| TC0021 | Administração | Recusar sem informar o motivo é barrado |
| TC0022 a TC0029 | Suporte, políticas, Plano Pro e perfil | Logado abre a página; visitante vai ao login |
| TC0030 | Chat | Envio de mensagem |
| TC0031 | Chat | Mensagem com telefone é barrada |
| TC0032 | Acordo | Profissional lê e aceita o acordo |
| TC0033 | Acordo | Profissional de fora da vaga não acessa o acordo |
| TC0034 | Pix | Antes da conclusão a cobrança não existe |
| TC0035 | Pix | Contratante simula o pagamento depois da conclusão |
