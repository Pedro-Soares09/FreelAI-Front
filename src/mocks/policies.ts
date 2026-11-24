import type { PolicyDetail } from "@/types";

export const policiesData: PolicyDetail[] = [
  {
    slug: "termos-de-uso",
    title: "Termos de Uso e Condições Gerais",
    badge: "Contrato e Uso",
    summary:
      "Regras gerais para utilização da plataforma FreelAI por profissionais autônomos e empresas contratantes.",
    lastUpdated: "14 de Novembro de 2026",
    sections: [
      {
        title: "1. Objeto e Escopo",
        content: [
          "A FreelAI é uma plataforma tecnológica de intermediação que conecta profissionais freelancers qualificados a empresas contratantes.",
          "O cadastro e o uso das ferramentas da plataforma implicam a aceitação expressa e irrestrita destes Termos de Uso.",
        ],
      },
      {
        title: "2. Cadastro e Responsabilidades",
        content: [
          "O usuário declara que todas as informações fornecidas no cadastro (nome, data de nascimento, documentos e localização) são autênticas e verídicas.",
          "É vedada a criação de contas por menores de 18 anos ou a utilização de dados de terceiros sem a devida autorização legal.",
          "Cada usuário é responsável por zelar pela confidencialidade de suas credenciais de acesso.",
        ],
      },
      {
        title: "3. Relação Contratual entre as Partes",
        content: [
          "A FreelAI atua como intermediadora e facilitadora de oportunidades, não configurando vínculo empregatício de qualquer natureza entre os profissionais cadastrados e a plataforma.",
          "Os acordos, prazos e entregáveis combinados entre empresa e profissional devem seguir as diretrizes estipuladas no contrato de prestação de serviços firmado dentro do sistema.",
        ],
      },
      {
        title: "4. Rescisão e Penalidades",
        content: [
          "O descumprimento de prazos, conduta desrespeitosa ou tentativa de fraude sujeitará o usuário a advertência, suspensão temporária ou exclusão definitiva da plataforma.",
        ],
      },
    ],
  },
  {
    slug: "privacidade",
    title: "Privacidade e Proteção de Dados (LGPD)",
    badge: "Lei 13.709/2018",
    summary:
      "Como tratamos, armazenamos e protegemos seus dados pessoais e empresariais em conformidade com a LGPD.",
    lastUpdated: "12 de Novembro de 2026",
    sections: [
      {
        title: "1. Coleta e Finalidade dos Dados",
        content: [
          "Coletamos dados estritamente necessários para viabilizar as contratações: identificação civil (nome, CPF, data de nascimento), documentos comprobatórios, selfies de validação biométrica, dados de localização e histórico profissional.",
          "Os dados de localização são utilizados com a finalidade exclusiva de matching geográfico para projetos regionais ou presenciais.",
        ],
      },
      {
        title: "2. Armazenamento e Criptografia",
        content: [
          "Todos os dados confidenciais e cópias de documentos de identificação são criptografados em trânsito (TLS 1.3) e em repouso (AES-256).",
          "O acesso a documentos de validação é restrito ao time de compliance e algoritmos de verificação automatizada.",
        ],
      },
      {
        title: "3. Direitos do Titular (LGPD)",
        content: [
          "Você tem o direito de confirmar a existência de tratamento, solicitar correção de dados incompletos ou inexatos, anonimização ou exclusão de dados desnecessários a qualquer momento através do canal privacidade@freelai.com.br.",
        ],
      },
    ],
  },
  {
    slug: "seguranca-pagamentos",
    title: "Segurança e Proteção de Pagamentos",
    badge: "Custódia Segura",
    summary:
      "Diretrizes para retenção em custódia (escrow), liberação de fundos mediante entrega aprovada e proteção contra chargeback.",
    lastUpdated: "10 de Novembro de 2026",
    sections: [
      {
        title: "1. Sistema de Custódia (Escrow)",
        content: [
          "Ao contratar uma vaga ou projeto, a empresa deposita o valor acordado em nossa conta de custódia segura.",
          "O montante fica retido e protegido até que o profissional conclua os entregáveis e a empresa revise e aprove o resultado.",
        ],
      },
      {
        title: "2. Liberação de Fundos e Prazos",
        content: [
          "Após a aprovação formal do projeto pelo contratante, os valores são liberados para a carteira digital do profissional em até 1 dia útil.",
          "Caso o contratante não se manifeste no prazo de 5 dias úteis após a entrega formal, a liberação ocorre automaticamente.",
        ],
      },
      {
        title: "3. Mediação de Disputas",
        content: [
          "Em caso de divergência sobre a qualidade ou cumprimento do escopo, qualquer das partes pode abrir uma disputa para intervenção da equipe de mediação da FreelAI.",
        ],
      },
    ],
  },
  {
    slug: "diretrizes-comunidade",
    title: "Diretrizes da Comunidade e Conduta",
    badge: "Convivência",
    summary:
      "Princípios éticos, integridade nas comunicações, respeito mútuo e regras do sistema de avaliações.",
    lastUpdated: "08 de Novembro de 2026",
    sections: [
      {
        title: "1. Respeito e Não Discriminação",
        content: [
          "A FreelAI preza por um ambiente plural, inclusivo e profissional. Não toleramos discriminação de gênero, raça, orientação sexual, religião ou origem.",
          "Comportamentos abusivos, assédio moral ou desrespeito no chat da plataforma ensejarão o banimento imediato.",
        ],
      },
      {
        title: "2. Sistema de Avaliações e Notas",
        content: [
          "As notas médias e comentários refletem a experiência real de entregas e parcerias.",
          "É estritamente proibido oferecer vantagens ou incentivos financeiros em troca de avaliações positivas ou remoção de notas negativas.",
        ],
      },
      {
        title: "3. Transparência Profissional",
        content: [
          "Os profissionais devem indicar com precisão seu nível de conhecimento técnico e suas características de comunicação, agilidade e proatividade.",
        ],
      },
    ],
  },
  {
    slug: "verificacao-fraude",
    title: "Verificação de Identidade e Prevenção a Fraudes",
    badge: "Selo Verificado",
    summary:
      "Critérios para obtenção do selo 'Verificado', análise de documentos, biometria facial e regras contra falsidade ideológica.",
    lastUpdated: "15 de Novembro de 2026",
    sections: [
      {
        title: "1. Critérios para Obtenção do Selo",
        content: [
          "O selo 'Verificado' é concedido a perfis que completam com êxito a comprovação de identidade através de CPF regular, documento oficial com foto (RG, CNH ou Passaporte) e selfie em tempo real.",
          "O selo aumenta em até 3x a visibilidade do perfil e a probabilidade de match com empresas contratantes.",
        ],
      },
      {
        title: "2. Estados da Verificação",
        content: [
          "• Em Análise: Os documentos foram recebidos e estão sob validação dos nossos sistemas de segurança (prazo padrão de até 24 horas).",
          "• Verificado: Identidade confirmada com sucesso. O selo azul é adicionado automaticamente ao perfil público.",
          "• Recusado: Inconsistência identificada (documento cortado, selfie ilegível ou divergência nos dados). O usuário pode reenviar a documentação corrigida.",
        ],
      },
      {
        title: "3. Tolerância Zero com Falsidade Ideológica",
        content: [
          "O uso de documentos falsificados, adulterados ou de pessoas terceiras configura crime de falsidade ideológica (art. 299 do Código Penal) e resultará na denúncia às autoridades competentes e cancelamento definitivo da conta.",
        ],
      },
    ],
  },
];

