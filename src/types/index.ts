export type AccountType = "profissional" | "empresa";

export type VerificationStatus =
  | "nao_verificado"
  | "em_analise"
  | "verificado"
  | "recusado";

export type ExperienceItem = {
  id: string;
  title: string;
  company: string;
  period: string;
  description: string;
};

export type ProfessionalCharacteristics = {
  comunicacao: number; // 1 a 5
  proatividade: number; // 1 a 5
  agilidade: number; // 1 a 5
  conhecimentoTecnico: string[];
};

export type LocationInfo = {
  city: string;
  state: string;
  neighborhood?: string;
  cep?: string;
};

export type Review = {
  id: string;
  authorName: string;
  authorCompany: string;
  authorAvatar?: string;
  rating: number; // 1 a 5
  date: string;
  comment: string;
};

export type VerificationData = {
  status: VerificationStatus;
  cpf?: string;
  documentType?: "rg" | "cnh" | "passaporte";
  documentFileName?: string;
  selfieFileName?: string;
  submittedAt?: string;
  rejectionReason?: string;
};

export type ProfessionalUser = {
  id: string;
  accountType: "profissional";
  name: string;
  birthDate: string; // YYYY-MM-DD
  email: string;
  phone?: string;
  avatarUrl?: string;
  title: string;
  bio: string;
  location: LocationInfo; // obrigatória
  experiences: ExperienceItem[];
  characteristics: ProfessionalCharacteristics;
  verification: VerificationData;
  rating: {
    average: number;
    totalReviews: number;
  };
  reviews: Review[];
  verified: boolean;
};

export type CompanyUser = {
  id: string;
  accountType: "empresa";
  corporateReason: string; // Razão Social (obrigatório)
  tradeName?: string; // Nome Fantasia
  cnpj: string; // CNPJ com máscara e validação
  email: string;
  phone: string;
  industry: string;
  location: LocationInfo;
  description: string;
  verified: boolean;
};

export type User = (ProfessionalUser | CompanyUser) & {
  id: string;
  name: string;
  email: string;
  verified: boolean;
};

export type Job = {
  id: string;
  title: string;
  description: string;
  category: string;
  budget: string;
};

export type Conversation = {
  id: string;
  participantIds: string[];
  lastMessage?: string;
};

export type Payment = {
  id: string;
  amount: number;
  currency: string;
  status: "pending" | "paid" | "failed";
};

export type PolicySection = {
  title: string;
  content: string[];
};

export type PolicyDetail = {
  slug: string;
  title: string;
  badge: string;
  summary: string;
  lastUpdated: string;
  sections: PolicySection[];
};
