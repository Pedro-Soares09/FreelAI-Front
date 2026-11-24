import type { ProfessionalUser, CompanyUser, User } from '@/types';

export const mockProfessionalUser: ProfessionalUser = {
  id: "usr_prof_01",
  accountType: "profissional",
  name: "Lucas Mendes",
  birthDate: "1996-08-14",
  email: "lucas.mendes@freelai.com.br",
  phone: "(11) 98765-4321",
  avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80",
  title: "Desenvolvedor Full Stack & Especialista em UI/UX",
  bio: "Engenheiro de software com mais de 7 anos de experiência no ecossistema TypeScript, React, Next.js e Node.js. Foco em arquiteturas escaláveis, alta performance e interfaces modernas orientadas a produto.",
  location: {
    city: "São Paulo",
    state: "SP",
    neighborhood: "Pinheiros",
    cep: "05422-001",
  },
  experiences: [
    {
      id: "exp_1",
      title: "Senior Frontend Engineer",
      company: "Nexus Tech Hub",
      period: "2023 - Atual",
      description:
        "Liderança técnica na arquitetura de microfrontends e migração para Next.js 15, impactando mais de 500k usuários mensais.",
    },
    {
      id: "exp_2",
      title: "Full Stack Developer",
      company: "InovaCloud Soluções",
      period: "2021 - 2023",
      description:
        "Desenvolvimento de plataformas SaaS B2B, integrações com gateways de pagamento seguros e pipelines CI/CD automatizadas.",
    },
    {
      id: "exp_3",
      title: "Desenvolvedor Web Freelancer",
      company: "Projetos Autônomos",
      period: "2018 - 2021",
      description:
        "Criação de e-commerces, dashboards interativos e aplicativos web responsivos com entregas rápidas e alto índice de aprovação.",
    },
  ],
  characteristics: {
    comunicacao: 5,
    proatividade: 5,
    agilidade: 5,
    conhecimentoTecnico: [
      "React 19",
      "Next.js App Router",
      "TypeScript",
      "Node.js",
      "Tailwind CSS",
      "GraphQL / REST",
      "PostgreSQL",
      "Testes Automatizados",
    ],
  },
  verification: {
    status: "verificado",
    cpf: "123.456.789-00",
    documentType: "cnh",
    documentFileName: "cnh_digital_lucas_mendes.pdf",
    selfieFileName: "selfie_biometria_lucas.jpg",
    submittedAt: "10/11/2026 às 14:32",
  },
  rating: {
    average: 4.9,
    totalReviews: 18,
  },
  reviews: [
    {
      id: "rev_1",
      authorName: "Carolina Sampaio",
      authorCompany: "Apex FinTech",
      authorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=128&q=80",
      rating: 5,
      date: "04 de Novembro de 2026",
      comment:
        "O Lucas superou todas as expectativas. Comunicação impecável, entregas antes do prazo e código muito bem estruturado. Com certeza trabalharemos juntos novamente!",
    },
    {
      id: "rev_2",
      authorName: "Roberto Silveira",
      authorCompany: "Vektor Digital",
      authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=128&q=80",
      rating: 5,
      date: "28 de Outubro de 2026",
      comment:
        "Extremamente proativo! Identificou gargalos no nosso layout e propôs melhorias que aumentaram a velocidade da nossa plataforma em 40%.",
    },
    {
      id: "rev_3",
      authorName: "Mariana Alencar",
      authorCompany: "Studio Horizon",
      authorAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=128&q=80",
      rating: 4.8,
      date: "15 de Outubro de 2026",
      comment:
        "Excelente domínio técnico e muita agilidade. O selo verificado e a clareza das informações no perfil nos deram total segurança para fechar o contrato.",
    },
  ],
  verified: true,
};

export const mockCompanyUser: CompanyUser = {
  id: "usr_comp_01",
  accountType: "empresa",
  corporateReason: "TechSolutions Inovação Digital e Software Ltda",
  tradeName: "TechSolutions Group",
  cnpj: "11.222.333/0001-81",
  email: "contato@techsolutions.com.br",
  phone: "(48) 3222-1000",
  industry: "Tecnologia da Informação & Software",
  location: {
    city: "Florianópolis",
    state: "SC",
    neighborhood: "Saco Grande",
    cep: "88032-000",
  },
  description:
    "Empresa de tecnologia focada em criação de produtos digitais escaláveis, buscando os melhores talentos freelancers verificados do mercado para projetos inovadores.",
  verified: true,
};

export const users: User[] = [
  mockProfessionalUser as unknown as User,
  mockCompanyUser as unknown as User,
];
