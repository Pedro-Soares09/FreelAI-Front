# FreelAI Front

Estrutura inicial do frontend FreelAI, construída com Next.js App Router, React, TypeScript e Tailwind CSS.

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

## Como iniciar

```bash
npm install
Copy-Item .env.example .env.local
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no navegador.

## Comandos

- `npm run dev`: inicia o servidor de desenvolvimento.
- `npm run build`: gera a versão de produção.
- `npm run start`: inicia a versão de produção.
- `npm run typecheck`: verifica os tipos TypeScript.
