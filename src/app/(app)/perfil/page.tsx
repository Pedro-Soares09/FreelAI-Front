"use client";

import { useState } from "react";
import Link from "next/link";
import { useUser } from "@/context/user-context";
import { maskPhone, maskCEP } from "@/lib/validation";
import { AvatarVerified } from "@/components/shared/avatar-verified";
import type { ExperienceItem } from "@/types";
import {
  UserIcon,
  BuildingIcon,
  ShieldCheckIcon,
  ShieldAlertIcon,
  ClockIcon,
  MapPinIcon,
  BriefcaseIcon,
  SparklesIcon,
  CheckIcon,
  ArrowRightIcon,
  XIcon,
} from "@/components/ui/icons";

export default function ProfileEditPage() {
  const {
    accountType,
    professionalProfile,
    companyProfile,
    verificationStatus,
    updateProfessionalProfile,
    updateCompanyProfile,
  } = useUser();

  const isProf = accountType === "profissional";

  // Form states - Profissional
  const [name, setName] = useState(professionalProfile.name);
  const [title, setTitle] = useState(professionalProfile.title);
  const [bio, setBio] = useState(professionalProfile.bio);
  const [birthDate, setBirthDate] = useState(professionalProfile.birthDate);
  const [email, setEmail] = useState(professionalProfile.email);
  const [phone, setPhone] = useState(professionalProfile.phone || "");
  const [avatarUrl, setAvatarUrl] = useState(professionalProfile.avatarUrl || "");
  const [city, setCity] = useState(professionalProfile.location.city);
  const [stateUF, setStateUF] = useState(professionalProfile.location.state);
  const [neighborhood, setNeighborhood] = useState(
    professionalProfile.location.neighborhood || "",
  );
  const [cep, setCep] = useState(professionalProfile.location.cep || "");

  // Characteristics
  const [comunicacao, setComunicacao] = useState(
    professionalProfile.characteristics.comunicacao,
  );
  const [proatividade, setProatividade] = useState(
    professionalProfile.characteristics.proatividade,
  );
  const [agilidade, setAgilidade] = useState(
    professionalProfile.characteristics.agilidade,
  );
  const [selectedTechs, setSelectedTechs] = useState<string[]>(
    professionalProfile.characteristics.conhecimentoTecnico,
  );
  const [customTech, setCustomTech] = useState("");

  // Experiences
  const [experiences, setExperiences] = useState<ExperienceItem[]>(
    professionalProfile.experiences,
  );
  const [showAddExp, setShowAddExp] = useState(false);
  const [expTitle, setExpTitle] = useState("");
  const [expCompany, setExpCompany] = useState("");
  const [expPeriod, setExpPeriod] = useState("");
  const [expDesc, setExpDesc] = useState("");

  // Form states - Empresa
  const [corporateReason, setCorporateReason] = useState(
    companyProfile.corporateReason,
  );
  const [tradeName, setTradeName] = useState(companyProfile.tradeName || "");
  const [companyEmail, setCompanyEmail] = useState(companyProfile.email);
  const [companyPhone, setCompanyPhone] = useState(companyProfile.phone);
  const [companyCity, setCompanyCity] = useState(companyProfile.location.city);
  const [companyState, setCompanyState] = useState(companyProfile.location.state);
  const [companyDesc, setCompanyDesc] = useState(companyProfile.description);

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleAddExperience = () => {
    if (!expTitle.trim() || !expCompany.trim()) return;
    setExperiences((prev) => [
      ...prev,
      {
        id: `exp_${Date.now()}`,
        title: expTitle.trim(),
        company: expCompany.trim(),
        period: expPeriod.trim() || "Período recente",
        description: expDesc.trim() || "Responsabilidades do cargo.",
      },
    ]);
    setExpTitle("");
    setExpCompany("");
    setExpPeriod("");
    setExpDesc("");
    setShowAddExp(false);
  };

  const handleRemoveExperience = (id: string) => {
    setExperiences((prev) => prev.filter((e) => e.id !== id));
  };

  const handleAddTech = () => {
    const clean = customTech.trim();
    if (clean && !selectedTechs.includes(clean)) {
      setSelectedTechs((prev) => [...prev, clean]);
      setCustomTech("");
    }
  };

  const handleRemoveTech = (tech: string) => {
    setSelectedTechs((prev) => prev.filter((t) => t !== tech));
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();

    if (isProf) {
      updateProfessionalProfile({
        name: name.trim(),
        title: title.trim(),
        bio: bio.trim(),
        birthDate,
        email: email.trim(),
        phone: phone.trim(),
        avatarUrl: avatarUrl.trim() || undefined,
        location: {
          city: city.trim(),
          state: stateUF,
          neighborhood: neighborhood.trim() || undefined,
          cep: cep.trim() || undefined,
        },
        characteristics: {
          comunicacao,
          proatividade,
          agilidade,
          conhecimentoTecnico: selectedTechs,
        },
        experiences,
      });
    } else {
      updateCompanyProfile({
        corporateReason: corporateReason.trim(),
        tradeName: tradeName.trim() || corporateReason.trim(),
        email: companyEmail.trim(),
        phone: companyPhone.trim(),
        location: {
          city: companyCity.trim(),
          state: companyState,
        },
        description: companyDesc.trim(),
      });
    }

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
    }, 3500);
  };

  return (
    <section className="page max-w-4xl">
      {/* Top Banner com Ação para Ver Perfil Verificado */}
      <div className="mb-8 p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <AvatarVerified
            name={isProf ? name : tradeName || corporateReason}
            imageUrl={isProf ? avatarUrl : undefined}
            status={isProf ? verificationStatus : undefined}
            verified={!isProf || verificationStatus === "verificado"}
            size="lg"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                {isProf ? name : tradeName || corporateReason}
              </h1>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                {isProf ? "Perfil Profissional" : "Conta Empresa"}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {isProf ? title : companyProfile.cnpj} · {isProf ? `${city}, ${stateUF}` : `${companyCity}, ${companyState}`}
            </p>
          </div>
        </div>

        {/* BOTÃO EM DESTAQUE "VER PERFIL VERIFICADO" */}
        <div className="flex items-center gap-3">
          {isProf && (
            <Link
              href="/perfil/publico"
              className="w-full sm:w-auto py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-xs hover:shadow-md"
            >
              <ShieldCheckIcon className="w-4 h-4" />
              <span>Ver perfil verificado</span>
              <ArrowRightIcon className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </div>

      {/* Cartão de Status de Verificação */}
      {isProf && (
        <div className="mb-8 p-4 rounded-2xl border bg-slate-50 border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-xs">
              {verificationStatus === "verificado" && (
                <ShieldCheckIcon className="w-6 h-6 text-blue-600" />
              )}
              {verificationStatus === "em_analise" && (
                <ClockIcon className="w-6 h-6 text-amber-600" />
              )}
              {verificationStatus === "recusado" && (
                <ShieldAlertIcon className="w-6 h-6 text-rose-600" />
              )}
              {verificationStatus === "nao_verificado" && (
                <UserIcon className="w-6 h-6 text-slate-400" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Status da Verificação de Identidade:
                </span>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    verificationStatus === "verificado"
                      ? "bg-blue-100 text-blue-800"
                      : verificationStatus === "em_analise"
                        ? "bg-amber-100 text-amber-800"
                        : verificationStatus === "recusado"
                          ? "bg-rose-100 text-rose-800"
                          : "bg-slate-200 text-slate-700"
                  }`}
                >
                  {verificationStatus === "verificado"
                    ? "✓ Selo Verificado Ativo"
                    : verificationStatus === "em_analise"
                      ? "⏳ Em Análise"
                      : verificationStatus === "recusado"
                        ? "✕ Recusado"
                        : "Não Verificado"}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {verificationStatus === "verificado"
                  ? "Sua identidade está validada. O selo verificado e suas avaliações estão visíveis no seu perfil público."
                  : "Envie CPF, documento oficial e selfie para liberar o selo verificado e aumentar suas contratações."}
              </p>
            </div>
          </div>

          <Link
            href="/verificacao"
            className="py-1.5 px-3.5 rounded-lg border border-indigo-200 bg-white hover:bg-indigo-50 text-indigo-700 font-semibold text-xs transition-colors shrink-0"
          >
            Gerenciar Verificação
          </Link>
        </div>
      )}

      {/* Alerta de Salvo */}
      {savedSuccess && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2 shadow-xs">
          <CheckIcon className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Alterações salvas com sucesso no seu perfil!</span>
        </div>
      )}

      {/* FORMULÁRIO DE EDIÇÃO DO PERFIL */}
      <form onSubmit={handleSaveProfile} className="space-y-8">
        {/* Seção 1: Dados Cadastrais Básicos */}
        <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-5">
          <h2 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
            <UserIcon className="w-4 h-4 text-indigo-600" />
            <span>Dados Pessoais & Apresentação</span>
          </h2>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Nome Completo <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={isProf ? name : corporateReason}
                onChange={(e) =>
                  isProf ? setName(e.target.value) : setCorporateReason(e.target.value)
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                {isProf ? "Título Profissional" : "Nome Fantasia"}
              </label>
              <input
                type="text"
                value={isProf ? title : tradeName}
                onChange={(e) =>
                  isProf ? setTitle(e.target.value) : setTradeName(e.target.value)
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {isProf && (
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Data de Nascimento <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  E-mail
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Telefone / WhatsApp
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(maskPhone(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              {isProf ? "Biografia / Resumo Profissional" : "Descrição da Empresa"}
            </label>
            <textarea
              rows={3}
              value={isProf ? bio : companyDesc}
              onChange={(e) =>
                isProf ? setBio(e.target.value) : setCompanyDesc(e.target.value)
              }
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              URL da Imagem de Perfil / Avatar
            </label>
            <input
              type="url"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Seção 2: Localização Obrigatória */}
        <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <MapPinIcon className="w-4 h-4 text-indigo-600" />
              <span>Localização (Campo Obrigatório)</span>
            </h2>
            <span className="text-[11px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
              Obrigatória
            </span>
          </div>

          <div className="grid sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Estado (UF) <span className="text-rose-500">*</span>
              </label>
              <select
                value={isProf ? stateUF : companyState}
                onChange={(e) =>
                  isProf ? setStateUF(e.target.value) : setCompanyState(e.target.value)
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 bg-white"
              >
                {["SP","RJ","MG","RS","PR","SC","BA","PE","CE","DF","GO","ES","AM","PA","MT","MS","MA","PB","RN","AL","SE","PI","RO","TO","AC","AP","RR"].map((uf) => (
                  <option key={uf} value={uf}>
                    {uf}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Cidade <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={isProf ? city : companyCity}
                onChange={(e) =>
                  isProf ? setCity(e.target.value) : setCompanyCity(e.target.value)
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                CEP
              </label>
              <input
                type="text"
                value={cep}
                onChange={(e) => setCep(maskCEP(e.target.value))}
                placeholder="00000-000"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900"
              />
            </div>
          </div>
        </div>

        {/* Seção 3: Características (Profissional) */}
        {isProf && (
          <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-6">
            <h2 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
              <SparklesIcon className="w-4 h-4 text-indigo-600" />
              <span>Características e Competências (4 Pilares)</span>
            </h2>

            <div className="grid sm:grid-cols-3 gap-6 p-4 rounded-xl bg-slate-50 border border-slate-200">
              {/* Comunicação */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Comunicação ({comunicacao}/5)
                  </label>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={comunicacao}
                  onChange={(e) => setComunicacao(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <span className="text-[11px] text-indigo-600 font-semibold block mt-1">
                  {comunicacao === 5 ? "Assertiva / Clara" : `${comunicacao} de 5`}
                </span>
              </div>

              {/* Proatividade */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Proatividade ({proatividade}/5)
                  </label>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={proatividade}
                  onChange={(e) => setProatividade(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <span className="text-[11px] text-indigo-600 font-semibold block mt-1">
                  {proatividade === 5 ? "Alta Iniciativa" : `${proatividade} de 5`}
                </span>
              </div>

              {/* Agilidade */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Agilidade ({agilidade}/5)
                  </label>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={agilidade}
                  onChange={(e) => setAgilidade(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <span className="text-[11px] text-indigo-600 font-semibold block mt-1">
                  {agilidade === 5 ? "Entregas Rápidas" : `${agilidade} de 5`}
                </span>
              </div>
            </div>

            {/* Conhecimento Técnico */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                Conhecimento Técnico / Hard Skills
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={customTech}
                  onChange={(e) => setCustomTech(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTech())}
                  placeholder="Adicionar habilidade (ex: Docker, Python)..."
                  className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 text-xs"
                />
                <button
                  type="button"
                  onClick={handleAddTech}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold"
                >
                  Adicionar
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {selectedTechs.map((tech) => (
                  <span
                    key={tech}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-medium"
                  >
                    <span>{tech}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTech(tech)}
                      className="text-indigo-400 hover:text-indigo-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Seção 4: Experiências (Profissional) */}
        {isProf && (
          <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <BriefcaseIcon className="w-4 h-4 text-indigo-600" />
                <span>Histórico de Experiências ({experiences.length})</span>
              </h2>
              <button
                type="button"
                onClick={() => setShowAddExp(!showAddExp)}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
              >
                {showAddExp ? "Cancelar" : "+ Adicionar Experiência"}
              </button>
            </div>

            {showAddExp && (
              <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/30 space-y-3">
                <div className="grid sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Cargo"
                    value={expTitle}
                    onChange={(e) => setExpTitle(e.target.value)}
                    className="px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white"
                  />
                  <input
                    type="text"
                    placeholder="Empresa / Projeto"
                    value={expCompany}
                    onChange={(e) => setExpCompany(e.target.value)}
                    className="px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Período (ex: 2023 - 2025)"
                  value={expPeriod}
                  onChange={(e) => setExpPeriod(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white"
                />
                <textarea
                  rows={2}
                  placeholder="Descrição das entregas..."
                  value={expDesc}
                  onChange={(e) => setExpDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white"
                />
                <button
                  type="button"
                  onClick={handleAddExperience}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs"
                >
                  Salvar Experiência
                </button>
              </div>
            )}

            <div className="space-y-3">
              {experiences.map((exp) => (
                <div
                  key={exp.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex items-start justify-between gap-3"
                >
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">
                      {exp.title} · <span className="text-slate-600 font-normal">{exp.company}</span>
                    </h4>
                    <span className="text-xs text-indigo-600 font-medium">{exp.period}</span>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{exp.description}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveExperience(exp.id)}
                    className="text-slate-400 hover:text-rose-600 p-1"
                    title="Remover"
                  >
                    <XIcon className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Rodapé com Salvar e Link para Perfil Público */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          {isProf ? (
            <Link
              href="/perfil/publico"
              className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1.5"
            >
              <ShieldCheckIcon className="w-4 h-4" />
              <span>Ver como meu perfil é exibido publicamente (&quot;Ver perfil verificado&quot;)</span>
            </Link>
          ) : (
            <div></div>
          )}

          <button
            type="submit"
            className="w-full sm:w-auto py-3 px-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2"
          >
            <CheckIcon className="w-4 h-4" />
            <span>Salvar Alterações do Perfil</span>
          </button>
        </div>
      </form>
    </section>
  );
}
