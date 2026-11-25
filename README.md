# FreelAI Front

Interface web do FreelAI, marketplace de serviços pontuais em Recife. Next.js (App Router), React, TypeScript estrito e Tailwind CSS.

## Funcionalidades implementadas

Implementadas por Fábio Nascimento.

### Painel do contratante

- Vagas agrupadas por publicação, contratação, contratação concluída, execução, confirmação, conclusão e encerramento.
- Badge de estado e próxima ação em cada vaga.
- Contagem de profissionais interessados.
- Estado vazio com atalho para criar vaga.
- Vaga expirada em “Encerradas”, com motivo.
- Integração com as telas de 3 melhores profissionais, chat e pagamento.

### Pagamento Pix

- Cobrança exclusiva via Pix com QR fictício e código copia-e-cola.
- Contagem regressiva de 15 minutos.
- Resumo com total, taxa FREELAI e líquido do profissional.
- Exemplo de R$ 150,00: R$ 135,00 para o profissional e R$ 15,00 para a FREELAI.
- Outros métodos exibidos desabilitados como “Em breve”.
- Botão de simulação disponível em perfil demo.
- Telas e badges para aguardando, retido, liberado, parcial, estornado e expirado.
- Redirecionamento ao painel quando o Pix expira.

### Validação facial

- Validação bloqueada sem conclusão confirmada.
- Captura e envio simulados de selfie.
- Resultado da validação facial.
- Aviso de 48 horas para análise.
- Aviso automático após 72 horas.
- Prazo restante obtido do campo `prazo_em` da API.
- Extrato da vaga após a validação, com lançamentos do profissional e da FREELAI.

## Rotas para teste

- `/vagas` — painel do contratante ou oportunidades do profissional.
- `/match` — tela dos 3 melhores profissionais.
- `/pagamento/vaga-105` — exemplo de pagamento e validação.
- `/pagamento/vaga-105?validar=1` — fluxo direto de validação facial.
- `/pagamento/vaga-106` — exemplo de Pix expirado.
- `/chat/vaga-105` — exemplo de conversa da vaga.
- `/vagas/vaga-105` — detalhes da vaga contratada.
- `/vagas/vaga-106` — detalhes da vaga encerrada.

No navegador, use o console para ativar o perfil contratante:

```javascript
localStorage.setItem('freelai_perfil_ativo', 'contratante')
location.href = '/vagas'
```

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

Contas de demonstração (senha `senha-segura-123`): `maria@example.com` (contratante) e `ana@example.com` (profissional e contratante). A conta de administração (`admin@example.com`) tem senha própria: no ambiente local ela é impressa por `python scripts/preparar_demo.py` no repositório do back, e no deploy vem da variável `SENHA_ADMIN_DEMO` do Render.

### 2. Front

```bash
npm install
cp .env.example .env.local
npm run dev
```

Abra http://localhost:3000 e entre com uma das contas acima. As telas de vagas, match, chat, acordo, perfil e verificação usam dados de apoio locais (`NEXT_PUBLIC_USE_MOCKS=true`, que só vale por padrão no desenvolvimento local; em build de produção o padrão é a API real e um build com mock mostra a faixa "Dados simulados") até os endpoints correspondentes entrarem no contrato; login, cadastro e sessão usam a API real.

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
