"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/user-context";
import {
  maskCEP,
  maskPhone,
  validateBirthDate,
} from "@/lib/validation";
import type { ExperienceItem } from "@/types";
import {
  UserIcon,
  BriefcaseIcon,
  SparklesIcon,
  MapPinIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  CheckIcon,
  AlertCircleIcon,
  XIcon,
} from "@/components/ui/icons";

const TECH_SUGGESTIONS = [
  "React",
  "Next.js",
  "TypeScript",
  "Node.js",
  "Tailwind CSS",
  "PostgreSQL",
  "GraphQL",
  "UI/UX Design",
  "Figma",
  "Python",
  "Docker",
  "AWS",
  "Mobile Flutter",
  "SEO & Copywriting",
];

export default function ProfessionalRegisterPage() {
  const router = useRouter();
  const { registerProfessional } = useUser();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [errorMsg, setErrorMsg] = useState<string>("");

  // Etapa 1: Dados Pessoais
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");

  // Etapa 2: Experiências
  const [title, setTitle] = useState("");
  const [seniority, setSeniority] = useState("Pleno");
  const [experiences, setExperiences] = useState<ExperienceItem[]>([
    {
      id: "exp_init_1",
      title: "Desenvolvedor de Software",
      company: "Empresa Anterior / Projetos",
      period: "2023 - 2025",
      description: "Desenvolvimento de interfaces modernas e integração com APIs.",
    },
  ]);
  const [newExpTitle, setNewExpTitle] = useState("");
  const [newExpCompany, setNewExpCompany] = useState("");
  const [newExpPeriod, setNewExpPeriod] = useState("");
  const [newExpDesc, setNewExpDesc] = useState("");
  const [showAddExp, setShowAddExp] = useState(false);

  // Etapa 3: Características (Comunicação, Proatividade, Agilidade, Conhecimento Técnico)
  const [comunicacao, setComunicacao] = useState<number>(5);
  const [proatividade, setProatividade] = useState<number>(5);
  const [agilidade, setAgilidade] = useState<number>(4);
  const [selectedTechs, setSelectedTechs] = useState<string[]>([
    "React",
    "Next.js",
    "TypeScript",
    "Tailwind CSS",
  ]);
  const [customTechInput, setCustomTechInput] = useState("");

  // Etapa 4: Localização Obrigatória
  const [stateUF, setStateUF] = useState("SP");
  const [city, setCity] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [cep, setCep] = useState("");

  // Handlers de Experiência
  const handleAddExperience = () => {
    if (!newExpTitle.trim() || !newExpCompany.trim()) {
      setErrorMsg("Preencha ao menos o Cargo e a Empresa/Projeto.");
      return;
    }
    setErrorMsg("");
    setExperiences((prev) => [
      ...prev,
      {
        id: `exp_${Date.now()}`,
        title: newExpTitle.trim(),
        company: newExpCompany.trim(),
        period: newExpPeriod.trim() || "Período não informado",
        description: newExpDesc.trim() || "Responsabilidades gerais do cargo.",
      },
    ]);
    setNewExpTitle("");
    setNewExpCompany("");
    setNewExpPeriod("");
    setNewExpDesc("");
    setShowAddExp(false);
  };

  const handleRemoveExperience = (id: string) => {
    setExperiences((prev) => prev.filter((e) => e.id !== id));
  };

  // Handlers de Tecnologias
  const toggleTech = (tech: string) => {
    if (selectedTechs.includes(tech)) {
      setSelectedTechs((prev) => prev.filter((t) => t !== tech));
    } else {
      setSelectedTechs((prev) => [...prev, tech]);
    }
  };

  const handleAddCustomTech = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ("key" in e && e.key !== "Enter") return;
    e.preventDefault();
    const clean = customTechInput.trim();
    if (clean && !selectedTechs.includes(clean)) {
      setSelectedTechs((prev) => [...prev, clean]);
      setCustomTechInput("");
    }
  };

  // Validação por Etapa
  const handleNextStep = () => {
    setErrorMsg("");

    if (step === 1) {
      if (!name.trim()) {
        setErrorMsg("Por favor, informe seu nome completo.");
        return;
      }
      if (!birthDate) {
        setErrorMsg("A data de nascimento é obrigatória.");
        return;
      }
      const birthValidation = validateBirthDate(birthDate);
      if (!birthValidation.valid) {
        setErrorMsg(birthValidation.message || "Data de nascimento inválida.");
        return;
      }
      if (!email.trim() || !email.includes("@")) {
        setErrorMsg("Por favor, informe um e-mail válido.");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!title.trim()) {
        setErrorMsg("Informe seu título profissional (ex: Desenvolvedor Full Stack).");
        return;
      }
      if (experiences.length === 0) {
        setErrorMsg("Adicione pelo menos uma experiência profissional.");
        return;
      }
      setStep(3);
    } else if (step === 3) {
      if (selectedTechs.length === 0) {
        setErrorMsg("Selecione pelo menos uma tecnologia ou competência técnica.");
        return;
      }
      setStep(4);
    }
  };

  // Conclusão do Cadastro (Etapa 4 - Localização Obrigatória)
  const handleFinishRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!city.trim()) {
      setErrorMsg("A Cidade é de preenchimento obrigatório para prosseguir.");
      return;
    }
    if (!stateUF) {
      setErrorMsg("O Estado (UF) é de preenchimento obrigatório.");
      return;
    }

    // Salvar profissional
    registerProfessional({
      name: name.trim(),
      birthDate,
      email: email.trim(),
      phone: phone.trim(),
      title: title.trim(),
      bio: bio.trim() || `Profissional ${seniority} focado em entregas de alto nível.`,
      location: {
        city: city.trim(),
        state: stateUF,
        neighborhood: neighborhood.trim() || undefined,
        cep: cep.trim() || undefined,
      },
      experiences,
      characteristics: {
        comunicacao,
        proatividade,
        agilidade,
        conhecimentoTecnico: selectedTechs,
      },
    });

    // Redireciona diretamente para a tela de verificação
    router.push("/verificacao?origem=cadastro");
  };

  return (
    <main className="page max-w-3xl">
      {/* Cabeçalho */}
      <div className="mb-8">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-fg transition-colors mb-4"
        >
          <ArrowLeftIcon className="w-3.5 h-3.5" />
          <span>Voltar ao Login</span>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-fg tracking-tight">
          Cadastro de Profissional Freelancer
        </h1>
        <p className="text-muted text-sm mt-1">
          Complete as etapas para configurar seu perfil e enviar para verificação de identidade.
        </p>
      </div>

      {/* Indicador de Etapas (Stepper) */}
      <div className="mb-8 bg-surface p-4 rounded-2xl border border-borda/80 shadow-xs">
        <div className="grid grid-cols-4 gap-2 text-center">
          {[
            { num: 1, label: "Dados Pessoais", icon: UserIcon },
            { num: 2, label: "Experiências", icon: BriefcaseIcon },
            { num: 3, label: "Características", icon: SparklesIcon },
            { num: 4, label: "Localização *", icon: MapPinIcon },
          ].map((item) => {
            const Icon = item.icon;
            const isDone = step > item.num;
            const isCurrent = step === item.num;

            return (
              <div key={item.num} className="flex flex-col items-center">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs transition-all ${
                    isDone
                      ? "bg-primary text-primary-fg shadow-xs"
                      : isCurrent
                        ? "bg-primary text-primary-fg shadow-sm ring-4 ring-primary/30"
                        : "bg-surface-2 text-muted"
                  }`}
                >
                  {isDone ? <CheckIcon className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                </div>
                <span
                  className={`mt-2 text-[11px] sm:text-xs font-medium truncate max-w-full ${
                    isCurrent
                      ? "text-primary font-bold"
                      : isDone
                        ? "text-fg"
                        : "text-muted"
                  }`}
                >
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Alerta de Erro */}
      {errorMsg && (
        <div className="mb-6 p-4 rounded-xl bg-danger/15 border border-danger/40 text-danger text-sm flex items-center gap-2">
          <AlertCircleIcon className="w-5 h-5 text-danger shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Conteúdo das Etapas */}
      <div className="bg-surface rounded-2xl border border-borda/80 p-6 sm:p-8 shadow-xs">
        {/* ETAPA 1: Dados Pessoais (Nome & Nascimento) */}
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-bold text-fg flex items-center gap-2">
                <UserIcon className="w-5 h-5 text-primary" />
                <span>Etapa 1: Nome e Dados Pessoais</span>
              </h2>
              <p className="text-xs text-muted mt-1">
                Seus dados serão confrontados com a documentação na etapa de verificação.
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-fg mb-1">
                Nome Completo <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Lucas Mendes de Oliveira"
                className="w-full px-3.5 py-2.5 rounded-xl border border-borda focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm text-fg"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-fg mb-1">
                Data de Nascimento <span className="text-danger">*</span>
              </label>
              <input
                type="date"
                required
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-borda focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm text-fg"
              />
              <p className="text-xs text-muted mt-1">
                Idade mínima de 18 anos exigida pelos termos da plataforma.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-fg mb-1">
                  E-mail de Contato <span className="text-danger">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="lucas@exemplo.com.br"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-borda focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm text-fg"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-fg mb-1">
                  Telefone / WhatsApp
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(maskPhone(e.target.value))}
                  placeholder="(11) 98765-4321"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-borda focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm text-fg"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-fg mb-1">
                Biografia / Resumo Profissional
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Conte um pouco sobre sua trajetória, projetos favoritos e objetivos profissionais..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-borda focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm text-fg"
              />
            </div>
          </div>
        )}

        {/* ETAPA 2: Experiências */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-bold text-fg flex items-center gap-2">
                <BriefcaseIcon className="w-5 h-5 text-primary" />
                <span>Etapa 2: Experiências Profissionais</span>
              </h2>
              <p className="text-xs text-muted mt-1">
                Adicione seu título principal e histórico de projetos para que empresas conheçam seu portfólio.
              </p>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-fg mb-1">
                  Cargo / Título Profissional Principal <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Desenvolvedor Full Stack Sênior"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-borda focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm text-fg"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-fg mb-1">
                  Nível de Senioridade
                </label>
                <select
                  value={seniority}
                  onChange={(e) => setSeniority(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-borda focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm text-fg bg-surface"
                >
                  <option value="Júnior">Júnior</option>
                  <option value="Pleno">Pleno</option>
                  <option value="Sênior">Sênior</option>
                  <option value="Especialista">Especialista / Lead</option>
                </select>
              </div>
            </div>

            {/* Lista de Experiências */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-semibold text-fg">
                  Histórico de Experiências Cadastradas ({experiences.length})
                </label>
                <button
                  type="button"
                  onClick={() => setShowAddExp(!showAddExp)}
                  className="text-xs font-semibold text-primary hover:text-primary transition-colors"
                >
                  {showAddExp ? "Fechar Formulário" : "+ Adicionar Outra"}
                </button>
              </div>

              <div className="space-y-3">
                {experiences.map((exp) => (
                  <div
                    key={exp.id}
                    className="p-3.5 rounded-xl border border-borda bg-surface-2/70 flex items-start justify-between gap-3"
                  >
                    <div>
                      <h4 className="font-semibold text-fg text-sm">
                        {exp.title} · <span className="text-muted font-normal">{exp.company}</span>
                      </h4>
                      <p className="text-xs text-primary font-medium mt-0.5">{exp.period}</p>
                      <p className="text-xs text-muted mt-1 line-clamp-2">{exp.description}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveExperience(exp.id)}
                      className="text-muted hover:text-danger p-1"
                      title="Remover experiência"
                    >
                      <XIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Formulário para Adicionar Experiência */}
              {showAddExp && (
                <div className="mt-4 p-4 rounded-xl border border-primary/40 bg-primary/40 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-primary">
                    Nova Experiência
                  </h4>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Cargo (ex: Frontend Engineer)"
                      value={newExpTitle}
                      onChange={(e) => setNewExpTitle(e.target.value)}
                      className="px-3 py-2 rounded-lg border border-borda text-xs bg-surface"
                    />
                    <input
                      type="text"
                      placeholder="Empresa ou Projeto"
                      value={newExpCompany}
                      onChange={(e) => setNewExpCompany(e.target.value)}
                      className="px-3 py-2 rounded-lg border border-borda text-xs bg-surface"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Período (ex: 2022 - 2024)"
                    value={newExpPeriod}
                    onChange={(e) => setNewExpPeriod(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-borda text-xs bg-surface"
                  />
                  <textarea
                    rows={2}
                    placeholder="Descrição das entregas e resultados alcançados..."
                    value={newExpDesc}
                    onChange={(e) => setNewExpDesc(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-borda text-xs bg-surface"
                  />
                  <button
                    type="button"
                    onClick={handleAddExperience}
                    className="px-3 py-1.5 rounded-lg bg-primary hover:brightness-110 text-primary-fg font-semibold text-xs"
                  >
                    Salvar Experiência
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ETAPA 3: Características (Comunicação, Proatividade, Agilidade, Conhecimento Técnico) */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-fg flex items-center gap-2">
                <SparklesIcon className="w-5 h-5 text-primary" />
                <span>Etapa 3: Características e Competências</span>
              </h2>
              <p className="text-xs text-muted mt-1">
                Avalie seus pilares de atuação. Essas informações são usadas nos algoritmos de Match e exibidas no seu perfil público.
              </p>
            </div>

            {/* Os 4 Pilares Expressos */}
            <div className="space-y-5 p-4 rounded-xl bg-surface-2 border border-borda">
              {/* 1. Comunicação */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-sm font-bold text-fg">
                    1. Comunicação: {comunicacao}/5
                  </label>
                  <span className="text-xs font-semibold text-primary">
                    {comunicacao === 5
                      ? "Excepcional / Assertiva"
                      : comunicacao >= 4
                        ? "Muito Clara e Direta"
                        : comunicacao === 3
                          ? "Boa Comunicação"
                          : "Em Desenvolvimento"}
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={comunicacao}
                  onChange={(e) => setComunicacao(Number(e.target.value))}
                  className="w-full h-2 bg-surface-2 rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between text-[10px] text-muted mt-0.5">
                  <span>1 - Básica</span>
                  <span>3 - Equilibrada</span>
                  <span>5 - Clara e Assertiva</span>
                </div>
              </div>

              {/* 2. Proatividade */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-sm font-bold text-fg">
                    2. Proatividade: {proatividade}/5
                  </label>
                  <span className="text-xs font-semibold text-primary">
                    {proatividade === 5
                      ? "Alta Iniciativa e Antecipação"
                      : proatividade >= 4
                        ? "Autônomo com Soluções Rápidas"
                        : proatividade === 3
                          ? "Execução com Autonomia Média"
                          : "Execução Sob Demanda"}
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={proatividade}
                  onChange={(e) => setProatividade(Number(e.target.value))}
                  className="w-full h-2 bg-surface-2 rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between text-[10px] text-muted mt-0.5">
                  <span>1 - Guiada</span>
                  <span>3 - Moderada</span>
                  <span>5 - Antecipa Problemas</span>
                </div>
              </div>

              {/* 3. Agilidade */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-sm font-bold text-fg">
                    3. Agilidade: {agilidade}/5
                  </label>
                  <span className="text-xs font-semibold text-primary">
                    {agilidade === 5
                      ? "Entregas Ultrarrápidas & Alta Pressão"
                      : agilidade >= 4
                        ? "Rápido com Qualidade Constante"
                        : agilidade === 3
                          ? "Pontual nos Prazos"
                          : "Ritmo Moderado"}
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={agilidade}
                  onChange={(e) => setAgilidade(Number(e.target.value))}
                  className="w-full h-2 bg-surface-2 rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between text-[10px] text-muted mt-0.5">
                  <span>1 - Moderado</span>
                  <span>3 - Pontual</span>
                  <span>5 - Entregas Rápidas</span>
                </div>
              </div>
            </div>

            {/* 4. Conhecimento Técnico */}
            <div>
              <label className="block text-sm font-semibold text-fg mb-2">
                4. Conhecimento Técnico (Selecione ou Adicione Suas Hard Skills)
              </label>

              {/* Sugestões */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {TECH_SUGGESTIONS.map((tech) => {
                  const isSelected = selectedTechs.includes(tech);
                  return (
                    <button
                      key={tech}
                      type="button"
                      onClick={() => toggleTech(tech)}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                        isSelected
                          ? "bg-primary text-primary-fg shadow-xs font-semibold"
                          : "bg-surface-2 text-muted hover:bg-surface-2"
                      }`}
                    >
                      {isSelected ? tech : `+ ${tech}`}
                    </button>
                  );
                })}
              </div>

              {/* Input de Custom Tech */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customTechInput}
                  onChange={(e) => setCustomTechInput(e.target.value)}
                  onKeyDown={handleAddCustomTech}
                  placeholder="Digitar outra competência (ex: Vue, Rust, Kubernetes)..."
                  className="flex-1 px-3 py-2 rounded-xl border border-borda text-xs text-fg"
                />
                <button
                  type="button"
                  onClick={handleAddCustomTech}
                  className="px-4 py-2 rounded-xl bg-surface-2 hover:bg-surface-2 text-fg text-xs font-semibold"
                >
                  Adicionar
                </button>
              </div>

              {/* Tags Selecionadas */}
              <div className="mt-3">
                <span className="text-xs font-medium text-muted">
                  Selecionadas ({selectedTechs.length}):
                </span>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {selectedTechs.map((tech) => (
                    <span
                      key={tech}
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-primary/10 border border-primary/40 text-primary text-xs font-medium"
                    >
                      <span>{tech}</span>
                      <button
                        type="button"
                        onClick={() => toggleTech(tech)}
                        className="text-primary hover:text-primary"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ETAPA 4: Localização Obrigatória */}
        {step === 4 && (
          <form onSubmit={handleFinishRegister} className="space-y-5">
            <div>
              <div className="flex items-center gap-2">
                <MapPinIcon className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-bold text-fg">
                  Etapa 4: Localização Obrigatória
                </h2>
              </div>
              <div className="mt-2 p-3 rounded-xl bg-warning/15 border border-warning/40 text-warning text-xs flex items-start gap-2">
                <AlertCircleIcon className="w-4 h-4 text-warning shrink-0 mt-0.5" />
                <span>
                  <strong>Atenção:</strong> A localização é obrigatória para conectar você a
                  oportunidades regionais, modelos híbridos de trabalho e para a conformidade fiscal dos contratos.
                </span>
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-fg mb-1">
                  Estado (UF) <span className="text-danger">*</span>
                </label>
                <select
                  required
                  value={stateUF}
                  onChange={(e) => setStateUF(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-borda focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm text-fg bg-surface"
                >
                  {["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"].map((uf) => (
                    <option key={uf} value={uf}>
                      {uf}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-fg mb-1">
                  Cidade <span className="text-danger">* (Obrigatória)</span>
                </label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Ex: São Paulo, Campinas, Curitiba..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-borda focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm text-fg font-medium"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-fg mb-1">
                  CEP
                </label>
                <input
                  type="text"
                  value={cep}
                  onChange={(e) => setCep(maskCEP(e.target.value))}
                  placeholder="00000-000"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-borda focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm text-fg"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-fg mb-1">
                  Bairro
                </label>
                <input
                  type="text"
                  value={neighborhood}
                  onChange={(e) => setNeighborhood(e.target.value)}
                  placeholder="Ex: Centro, Pinheiros, Savassi..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-borda focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm text-fg"
                />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-surface-2 border border-borda text-xs text-muted">
              <p className="font-semibold text-fg mb-1">Resumo das Etapas Preenchidas:</p>
              <ul className="space-y-0.5 list-disc list-inside">
                <li>Nome: {name || "(Pendente)"} ({birthDate ? "Data válida" : "Pendente"})</li>
                <li>Título: {title || "(Pendente)"} · {experiences.length} experiência(s)</li>
                <li>Características: Comunicação ({comunicacao}/5), Proatividade ({proatividade}/5), Agilidade ({agilidade}/5)</li>
                <li>Hard Skills: {selectedTechs.join(", ")}</li>
              </ul>
            </div>

            <div className="pt-4 flex items-center justify-between border-t border-borda">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="py-2.5 px-4 rounded-xl border border-borda text-fg hover:bg-surface-2 font-semibold text-sm flex items-center gap-1.5 transition-colors"
              >
                <ArrowLeftIcon className="w-4 h-4" />
                <span>Voltar</span>
              </button>

              <button
                type="submit"
                className="py-2.5 px-6 rounded-xl bg-primary hover:brightness-110 text-primary-fg font-bold text-sm shadow-sm flex items-center gap-2 transition-colors"
              >
                <span>Concluir Cadastro & Verificar Identidade</span>
                <ArrowRightIcon className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* Botões de Navegação das Etapas 1, 2 e 3 */}
        {step < 4 && (
          <div className="mt-8 pt-6 border-t border-borda flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((prev) => (prev - 1) as 1 | 2 | 3)}
                className="py-2.5 px-4 rounded-xl border border-borda text-fg hover:bg-surface-2 font-semibold text-sm flex items-center gap-1.5 transition-colors"
              >
                <ArrowLeftIcon className="w-4 h-4" />
                <span>Voltar</span>
              </button>
            ) : (
              <div></div>
            )}

            <button
              type="button"
              onClick={handleNextStep}
              className="py-2.5 px-6 rounded-xl bg-primary hover:brightness-110 text-primary-fg font-semibold text-sm shadow-sm flex items-center gap-2 transition-colors"
            >
              <span>Avançar para Etapa {step + 1}</span>
              <ArrowRightIcon className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

