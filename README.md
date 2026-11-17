# FreelAI Front

Interface web do FreelAI, marketplace de serviços pontuais em Recife. Next.js (App Router), React, TypeScript estrito e Tailwind CSS.

## Requisitos

- Node.js 20 ou superior
- npm
- API do back em execução (repositório FreelAI-Back), por padrão em `http://localhost:8000`

## Execução local

### 1. API (repositório FreelAI-Back)

```bash
cd ../FreelAI-Back
python -m venv .venv
.venv/Scripts/pip install -r requirements-dev.txt      # Windows; no Linux/macOS: .venv/bin/pip
cp .env.example .env                                    # ajuste DATABASE_URL=sqlite:///./freelai.db para rodar sem Docker
.venv/Scripts/python -m alembic upgrade head
.venv/Scripts/python scripts/semear_demo.py             # contas de demonstração
.venv/Scripts/python -m uvicorn app.main:app --port 8000
```

Contas de demonstração (senha `senha-segura-123`): `ana@example.com` (profissional e contratante) e `admin@example.com` (administração).

### 2. Front

```bash
npm install
cp .env.example .env.local
npm run dev
```

Abra http://localhost:3000 e entre com uma das contas acima. As telas de vagas, match, chat, acordo, perfil e verificação usam dados de apoio locais (`NEXT_PUBLIC_USE_MOCKS=true`) até os endpoints correspondentes entrarem no contrato; login, cadastro e sessão usam a API real.

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
