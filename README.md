# FreelAI Front

Interface web do FreelAI, marketplace de serviços pontuais em Recife. Next.js (App Router), React, TypeScript estrito e Tailwind CSS.

## Requisitos

- Node.js 20 ou superior
- npm
- API do back em execução (repositório FreelAI-Back), por padrão em `http://localhost:8000`

## Execução local

```bash
npm install
cp .env.example .env.local
npm run dev
```

Abra http://localhost:3000.

## Scripts

| Comando | Função |
|---|---|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run start` | Executa o build de produção |
| `npm run lint` | ESLint |
| `npm run typecheck` | Verificação de tipos |
| `npm run api:types` | Copia o contrato do back e regenera os tipos da API |

## Estrutura

```
src/
  app/            Rotas (App Router)
    (app)/        Área autenticada, com layout e guards
    login/        Entrada
    ds/           Catálogo do design system
  api/            Cliente HTTP tipado e tipos gerados do contrato
  components/
    ui/           Componentes base do design system
    layout/       Cabeçalho, navegação e guards
    shared/       Componentes de domínio compartilhados
    conta/ vagas/ contratante/ chat/ admin/ institucional/
                  Componentes por área de produto
  lib/            Utilitários, sessão e constantes
  mocks/          Dados de apoio enquanto a API não cobre a tela
  theme/          Tokens de tema
```

Convenções: arquivos em kebab-case, componentes em PascalCase, um componente exportado por arquivo, textos da interface em pt-BR, sem cores fixas nos componentes (use os tokens do Tailwind).

## Contrato da API

O contrato do back fica versionado em `FreelAI-Back/contracts/openapi.json`. Para regenerar os tipos:

```bash
npm run api:types
```

O script procura o arquivo em `../FreelAI-Back/contracts/openapi.json` ou no caminho indicado em `OPENAPI_PATH`. O resultado vai para `src/api/schema.d.ts` e deve ser commitado.

## Fluxo de trabalho

- `main`: estável, protegida. Alterações entram por Pull Request com 1 revisão obrigatória.
- `develop`: integração.
- `feature/<descricao>`: uma por entrega, aberta a partir de `develop`.
- Commits em pt-BR no formato `tipo: descrição` (feat, fix, refactor, docs, chore, test, style).
- Antes do PR: `npm run lint`, `npm run typecheck` e `npm run build` sem erros.
