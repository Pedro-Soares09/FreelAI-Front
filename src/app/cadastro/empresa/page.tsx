"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/user-context";
import {
  maskCNPJ,
  maskPhone,
  maskCEP,
  validateCNPJ,
} from "@/lib/validation";
import {
  BuildingIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  CheckIcon,
  AlertCircleIcon,
} from "@/components/ui/icons";

export default function CompanyRegisterPage() {
  const router = useRouter();
  const { registerCompany } = useUser();

  const [corporateReason, setCorporateReason] = useState("");
  const [tradeName, setTradeName] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [industry, setIndustry] = useState("Tecnologia da Informação & Software");
  const [stateUF, setStateUF] = useState("SP");
  const [city, setCity] = useState("");
  const [cep, setCep] = useState("");
  const [description, setDescription] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const isCnpjFilled = cnpj.replace(/\D/g, "").length === 14;
  const isCnpjValid = isCnpjFilled && validateCNPJ(cnpj);

  const handleCnpjChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const masked = maskCNPJ(e.target.value);
    setCnpj(masked);
    setErrorMsg("");
  };

  const handleApplySampleCNPJ = () => {
    // 11.222.333/0001-81 é um CNPJ matematicamente válido
    setCnpj("11.222.333/0001-81");
    if (!corporateReason) setCorporateReason("TechCorp Inovações Digitais Ltda");
    if (!tradeName) setTradeName("TechCorp Solutions");
    if (!city) setCity("São Paulo");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!corporateReason.trim()) {
      setErrorMsg("A Razão Social é de preenchimento obrigatório.");
      return;
    }

    if (!isCnpjFilled) {
      setErrorMsg("O CNPJ deve conter exatamente 14 dígitos.");
      return;
    }

    if (!validateCNPJ(cnpj)) {
      setErrorMsg("O CNPJ informado é matematicamente inválido. Verifique os dígitos verificadores.");
      return;
    }

    if (!email.trim() || !email.includes("@")) {
      setErrorMsg("Por favor, informe um e-mail corporativo válido.");
      return;
    }

    if (!city.trim()) {
      setErrorMsg("A Cidade da sede da empresa é obrigatória.");
      return;
    }

    // Salvar empresa
    registerCompany({
      corporateReason: corporateReason.trim(),
      tradeName: tradeName.trim() || corporateReason.trim(),
      cnpj,
      email: email.trim(),
      phone: phone.trim(),
      industry,
      location: {
        city: city.trim(),
        state: stateUF,
        cep: cep.trim() || undefined,
      },
      description:
        description.trim() ||
        `${tradeName || corporateReason} - Contratante na plataforma FreelAI.`,
    });

    setSuccessMsg("Empresa cadastrada com sucesso! Redirecionando...");
    setTimeout(() => {
      router.push("/perfil");
    }, 700);
  };

  return (
    <main className="page max-w-2xl">
      {/* Voltar */}
      <Link
        href="/login"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors mb-4"
      >
        <ArrowLeftIcon className="w-3.5 h-3.5" />
        <span>Voltar ao Login</span>
      </Link>

      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold mb-3">
          <BuildingIcon className="w-4 h-4 text-emerald-700" />
          <span>Cadastro de Empresa Contratante</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Crie a Conta da sua Empresa
        </h1>
        <p className="text-slate-600 text-sm mt-1">
          Informe a Razão Social e o CNPJ para contratar profissionais verificados com segurança.
        </p>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-2">
          <AlertCircleIcon className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2">
          <CheckIcon className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Razão Social (Obrigatório) */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Razão Social <span className="text-rose-500">* (Obrigatório)</span>
            </label>
            <input
              type="text"
              required
              value={corporateReason}
              onChange={(e) => setCorporateReason(e.target.value)}
              placeholder="Ex: Alfa Tecnologia & Serviços de Internet Ltda"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm text-slate-900 font-medium"
            />
          </div>

          {/* Nome Fantasia */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Nome Fantasia / Nome Público
            </label>
            <input
              type="text"
              value={tradeName}
              onChange={(e) => setTradeName(e.target.value)}
              placeholder="Ex: Alfa Tech"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm text-slate-900"
            />
          </div>

          {/* CNPJ com Máscara e Validação */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-semibold text-slate-700">
                CNPJ <span className="text-rose-500">* (Com Máscara e Validação)</span>
              </label>
              <button
                type="button"
                onClick={handleApplySampleCNPJ}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 hover:underline"
              >
                + Usar CNPJ Válido de Teste
              </button>
            </div>

            <div className="relative">
              <input
                type="text"
                required
                maxLength={18}
                value={cnpj}
                onChange={handleCnpjChange}
                placeholder="00.000.000/0000-00"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-mono tracking-wide focus:outline-none focus:ring-2 ${
                  isCnpjFilled
                    ? isCnpjValid
                      ? "border-emerald-500 focus:ring-emerald-500 bg-emerald-50/20 text-slate-900"
                      : "border-rose-400 focus:ring-rose-500 bg-rose-50/20 text-slate-900"
                    : "border-slate-300 focus:ring-emerald-500 text-slate-900"
                }`}
              />

              {isCnpjFilled && (
                <div className="absolute right-3 top-2.5 flex items-center">
                  {isCnpjValid ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-md">
                      <CheckIcon className="w-3.5 h-3.5" />
                      <span>Válido</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 bg-rose-100 px-2 py-0.5 rounded-md">
                      <span>Inválido</span>
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Dica de validação do CNPJ */}
            <div className="mt-1.5 flex items-center justify-between text-xs">
              <span className="text-slate-500">
                Máscara automática: 00.000.000/0000-00
              </span>
              {cnpj && !isCnpjFilled && (
                <span className="text-amber-600 font-medium">
                  {14 - cnpj.replace(/\D/g, "").length} dígitos restantes
                </span>
              )}
              {isCnpjFilled && !isCnpjValid && (
                <span className="text-rose-600 font-medium">
                  Dígitos verificadores incorretos
                </span>
              )}
            </div>
          </div>

          {/* E-mail e Telefone */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                E-mail Corporativo <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contato@empresa.com.br"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm text-slate-900"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Telefone Comercial
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(maskPhone(e.target.value))}
                placeholder="(11) 3222-1000"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm text-slate-900"
              />
            </div>
          </div>

          {/* Ramo / Setor */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Setor de Atuação
            </label>
            <select
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm text-slate-900 bg-white"
            >
              <option value="Tecnologia da Informação & Software">
                Tecnologia da Informação & Software
              </option>
              <option value="Design, Arte & Audiovisual">
                Design, Arte & Audiovisual
              </option>
              <option value="Marketing Digital & Mídias">
                Marketing Digital & Mídias
              </option>
              <option value="Consultoria Empresarial & Finanças">
                Consultoria Empresarial & Finanças
              </option>
              <option value="Engenharia & Arquitetura">
                Engenharia & Arquitetura
              </option>
              <option value="E-commerce & Varejo">E-commerce & Varejo</option>
              <option value="Outros">Outros Setores</option>
            </select>
          </div>

          {/* Localização da Empresa */}
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Estado (UF) <span className="text-rose-500">*</span>
              </label>
              <select
                value={stateUF}
                onChange={(e) => setStateUF(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm text-slate-900 bg-white"
              >
                {["SP","RJ","MG","RS","PR","SC","BA","PE","CE","DF","GO","ES","AM","PA","MT","MS","MA","PB","RN","AL","SE","PI","RO","TO","AC","AP","RR"].map((uf) => (
                  <option key={uf} value={uf}>
                    {uf}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Cidade Sede <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Ex: São Paulo"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm text-slate-900"
              />
            </div>
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Sobre a Empresa / Perfil dos Projetos
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva as principais soluções da empresa e o perfil de profissionais que costumam contratar..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm text-slate-900"
            />
          </div>

          {/* Garantia de Segurança */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3 text-xs text-slate-600">
            <ShieldCheckIcon className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>
              Ao cadastrar sua empresa, seus dados de CNPJ passam por conferência automatizada
              para assegurar contratos legítimos e faturas transparentes.
            </span>
          </div>

          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <Link
              href="/login"
              className="text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              Cancelar
            </Link>

            <button
              type="submit"
              className="py-2.5 px-6 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-sm flex items-center gap-2 transition-colors"
            >
              <span>Concluir Cadastro da Empresa</span>
              <ArrowRightIcon className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

