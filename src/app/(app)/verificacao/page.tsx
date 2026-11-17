"use client";

import { useState } from "react";
import Link from "next/link";
import { useUser } from "@/context/user-context";
import { maskCPF, validateCPF } from "@/lib/validation";
import { AvatarVerified } from "@/components/shared/avatar-verified";
import {
  ShieldCheckIcon,
  ShieldAlertIcon,
  ClockIcon,
  CheckIcon,
  AlertCircleIcon,
  UploadIcon,
  CameraIcon,
  FileTextIcon,
  ArrowRightIcon,
} from "@/components/ui/icons";

export default function VerificationPage() {
  const {
    professionalProfile,
    verificationStatus,
    rejectionReason,
    submitVerification,
    setVerificationStatusDirectly,
  } = useUser();

  // Form State
  const [cpf, setCpf] = useState(professionalProfile.verification.cpf || "");
  const [documentType, setDocumentType] = useState<"rg" | "cnh" | "passaporte">(
    professionalProfile.verification.documentType || "cnh",
  );
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [documentFileName, setDocumentFileName] = useState(
    professionalProfile.verification.documentFileName || "",
  );
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [selfieFileName, setSelfieFileName] = useState(
    professionalProfile.verification.selfieFileName || "",
  );
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [isEditingAfterRejection, setIsEditingAfterRejection] = useState(false);

  // CPF Validation helpers
  const isCpfFilled = cpf.replace(/\D/g, "").length === 11;
  const isCpfValid = isCpfFilled && validateCPF(cpf);

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCpf(maskCPF(e.target.value));
    setFormError("");
  };

  const handleApplySampleCPF = () => {
    // 123.456.789-09 é um exemplo de CPF com cálculo estruturado ou testável
    // Gerar um CPF válido para testes:
    setCpf("329.845.190-20");
  };

  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setDocumentFile(file);
      setDocumentFileName(file.name);
      setFormError("");
    }
  };

  const handleSelfieUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelfieFile(file);
      setSelfieFileName(file.name);
      setFormError("");

      const reader = new FileReader();
      reader.onload = (event) => {
        setSelfiePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSimulateSelfieCapture = () => {
    setSelfieFileName("selfie_capturada_webcam.jpg");
    setSelfiePreview("https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80");
    setFormError("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!isCpfFilled) {
      setFormError("Informe o seu CPF completo com 11 dígitos.");
      return;
    }

    if (!validateCPF(cpf)) {
      setFormError("O CPF informado é matematicamente inválido. Verifique os dígitos digitados.");
      return;
    }

    if (!documentFileName) {
      setFormError("É obrigatório anexar a imagem ou PDF do seu documento de identificação (RG, CNH ou Passaporte).");
      return;
    }

    if (!selfieFileName && !selfiePreview) {
      setFormError("É obrigatório enviar uma selfie nítida para validação biométrica com a foto do documento.");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      submitVerification({
        cpf,
        documentType,
        documentFileName: documentFileName || "documento_frente_verso.pdf",
        selfieFileName: selfieFileName || "selfie_biometria.jpg",
      });
      setIsSubmitting(false);
      setIsEditingAfterRejection(false);
    }, 600);
  };

  // Se o usuário está no modo de formulário porque não enviou ou clicou em corrigir
  const showForm =
    verificationStatus === "nao_verificado" ||
    (verificationStatus === "recusado" && isEditingAfterRejection);

  return (
    <section className="page max-w-4xl">
      {/* Banner de Demonstração / Seletor Rápido de Status */}
      <div className="mb-8 p-4 rounded-2xl bg-indigo-50/80 border border-indigo-200/90 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-900 block">
              Simulador de Status da Verificação (Painel de Avaliação)
            </span>
            <p className="text-xs text-indigo-700 mt-0.5">
              Alternar entre os 3 status solicitados para visualizar a interface em cada cenário:
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                setVerificationStatusDirectly("nao_verificado");
                setIsEditingAfterRejection(true);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                verificationStatus === "nao_verificado"
                  ? "bg-slate-800 text-white shadow-xs"
                  : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
              }`}
            >
              Formulário / Pendente
            </button>

            <button
              type="button"
              onClick={() => {
                setVerificationStatusDirectly("em_analise");
                setIsEditingAfterRejection(false);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                verificationStatus === "em_analise"
                  ? "bg-amber-600 text-white shadow-xs"
                  : "bg-white text-amber-800 border border-amber-200 hover:bg-amber-50"
              }`}
            >
              ⏳ Em Análise
            </button>

            <button
              type="button"
              onClick={() => {
                setVerificationStatusDirectly("verificado");
                setIsEditingAfterRejection(false);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                verificationStatus === "verificado"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-white text-blue-800 border border-blue-200 hover:bg-blue-50"
              }`}
            >
              ✓ Verificado
            </button>

            <button
              type="button"
              onClick={() => {
                setVerificationStatusDirectly(
                  "recusado",
                  "A selfie enviada não está nítida e a imagem da CNH apresenta bordas cortadas.",
                );
                setIsEditingAfterRejection(false);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                verificationStatus === "recusado"
                  ? "bg-rose-600 text-white shadow-xs"
                  : "bg-white text-rose-800 border border-rose-200 hover:bg-rose-50"
              }`}
            >
              ✕ Recusado
            </button>
          </div>
        </div>
      </div>

      {/* Cabeçalho da Página */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-700 mb-2">
          <ShieldCheckIcon className="w-4 h-4" />
          <span>Selo de Confiança FreelAI</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Verificação de Identidade
        </h1>
        <p className="text-slate-600 text-sm mt-1 max-w-2xl">
          Esta tela alimenta o selo oficial <strong>&quot;Verificado&quot;</strong>. Com a validação de CPF,
          documento oficial com foto e selfie biométrica, seu perfil ganha prioridade absoluta
          em contratações e libera todas as ferramentas da plataforma.
        </p>
      </div>

      {/* ============================================================== */}
      {/* CENÁRIO 1: STATUS "VERIFICADO" */}
      {/* ============================================================== */}
      {verificationStatus === "verificado" && (
        <div className="space-y-6">
          <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-blue-50 via-white to-blue-50/50 border-2 border-blue-200 shadow-xs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <AvatarVerified
                  name={professionalProfile.name}
                  imageUrl={professionalProfile.avatarUrl}
                  status="verificado"
                  size="xl"
                />
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-600 text-white text-xs font-bold shadow-xs">
                    <CheckIcon className="w-3.5 h-3.5" />
                    <span>Selo Verificado Ativo</span>
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 mt-2">
                    {professionalProfile.name}
                  </h2>
                  <p className="text-xs text-slate-600">
                    CPF regular · Documento Oficial Aprovado · Biometria Facial Confirmada
                  </p>
                </div>
              </div>

              <Link
                href="/perfil/publico"
                className="py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 transition-colors shadow-xs"
              >
                <span>Ver Perfil Verificado</span>
                <ArrowRightIcon className="w-4 h-4" />
              </Link>
            </div>

            <div className="mt-8 pt-6 border-t border-blue-100 grid sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-white border border-blue-100 shadow-2xs">
                <span className="text-xs font-bold text-blue-900 block">3x Mais Visibilidade</span>
                <p className="text-xs text-slate-600 mt-1">
                  Perfis com selo verificado aparecem no topo das buscas das empresas contratantes.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white border border-blue-100 shadow-2xs">
                <span className="text-xs font-bold text-blue-900 block">Proteção de Pagamento</span>
                <p className="text-xs text-slate-600 mt-1">
                  Saques e transferências de custódia liberados de forma imediata após conclusão do projeto.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white border border-blue-100 shadow-2xs">
                <span className="text-xs font-bold text-blue-900 block">Garantia Contra Fraudes</span>
                <p className="text-xs text-slate-600 mt-1">
                  Sua identidade foi certificada de acordo com as normas da LGPD e Termos do FreelAI.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* CENÁRIO 2: STATUS "EM ANÁLISE" */}
      {/* ============================================================== */}
      {verificationStatus === "em_analise" && (
        <div className="space-y-6">
          <div className="p-6 sm:p-8 rounded-2xl bg-amber-50/80 border-2 border-amber-200 shadow-xs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-2xl shadow-xs">
                  <ClockIcon className="w-8 h-8 text-amber-600" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-200 text-amber-900 text-xs font-bold">
                    <span>Status: Em Análise</span>
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 mt-2">
                    Documentos sob Análise de Segurança
                  </h2>
                  <p className="text-xs text-slate-600">
                    Protocolo: FL-{Math.floor(100000 + Math.random() * 900000)} · Prazo estimado: até 24 horas úteis
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 rounded-xl bg-white border border-amber-200/80 text-xs text-slate-700 space-y-2">
              <p className="font-semibold text-slate-900">
                O que acontece agora?
              </p>
              <ul className="space-y-1 list-disc list-inside text-slate-600">
                <li>
                  Nosso sistema automatizado e equipe de conformidade estão conferindo a regularidade do CPF informado:{" "}
                  <strong>{professionalProfile.verification.cpf || "Registrado"}</strong>
                </li>
                <li>
                  O documento anexado (
                  <strong>{professionalProfile.verification.documentFileName || "Documento oficial"}</strong>
                  ) está sendo confrontado com a selfie biométrica.
                </li>
                <li>
                  Assim que a validação for concluída, o selo <strong>&quot;Verificado&quot;</strong> será
                  ativado automaticamente no seu perfil público.
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* CENÁRIO 3: STATUS "RECUSADO" */}
      {/* ============================================================== */}
      {verificationStatus === "recusado" && !isEditingAfterRejection && (
        <div className="space-y-6">
          <div className="p-6 sm:p-8 rounded-2xl bg-rose-50/80 border-2 border-rose-200 shadow-xs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-2xl shadow-xs">
                  <ShieldAlertIcon className="w-8 h-8 text-rose-600" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-200 text-rose-900 text-xs font-bold">
                    <span>Status: Verificação Recusada</span>
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 mt-2">
                    Não foi possível validar seus documentos
                  </h2>
                  <p className="text-xs text-slate-600">
                    A análise identificou divergências ou problemas de legibilidade no material enviado.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsEditingAfterRejection(true)}
                className="py-2.5 px-5 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition-colors shadow-xs"
              >
                <span>Corrigir e Reenviar Documentos</span>
                <ArrowRightIcon className="w-4 h-4" />
              </button>
            </div>

            {/* Motivo da Recusa Detalhado */}
            <div className="mt-6 p-4 rounded-xl bg-white border border-rose-200 text-xs space-y-2">
              <span className="font-bold text-rose-900 uppercase tracking-wider block">
                Motivo Apontado pela Análise:
              </span>
              <p className="text-slate-800 font-medium bg-rose-50 p-3 rounded-lg border border-rose-100 leading-relaxed">
                {rejectionReason ||
                  "A foto do documento está ilegível ou cortada, ou a selfie não possui iluminação suficiente para validação biométrica."}
              </p>
              <p className="text-slate-500 pt-1">
                Dica: Certifique-se de que a selfie seja tirada em ambiente bem iluminado, sem boné ou óculos escuros,
                e que todos os 4 cantos do documento estejam visíveis.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* FORMULÁRIO DE ENVIO: CPF, DOCUMENTO E SELFIE */}
      {/* ============================================================== */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
          <div className="mb-6 pb-4 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900">
              {verificationStatus === "recusado"
                ? "Reenvio de Documentação Corrigida"
                : "Envio de Documentos para Concessão do Selo"}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Envie fotos nítidas do seu documento e faça uma selfie para liberar o selo verificado.
            </p>
          </div>

          {formError && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-2">
              <AlertCircleIcon className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 1. CPF com Máscara e Validação */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-semibold text-slate-700">
                  1. CPF do Profissional <span className="text-rose-500">* (Com Máscara e Validação)</span>
                </label>
                <button
                  type="button"
                  onClick={handleApplySampleCPF}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:underline"
                >
                  + Preencher CPF Válido de Teste
                </button>
              </div>

              <div className="relative">
                <input
                  type="text"
                  required
                  maxLength={14}
                  value={cpf}
                  onChange={handleCpfChange}
                  placeholder="000.000.000-00"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-mono tracking-wider focus:outline-none focus:ring-2 ${
                    isCpfFilled
                      ? isCpfValid
                        ? "border-emerald-500 focus:ring-emerald-500 bg-emerald-50/20 text-slate-900"
                        : "border-rose-400 focus:ring-rose-500 bg-rose-50/20 text-slate-900"
                      : "border-slate-300 focus:ring-indigo-500 text-slate-900"
                  }`}
                />

                {isCpfFilled && (
                  <div className="absolute right-3 top-2.5 flex items-center">
                    {isCpfValid ? (
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
              <p className="text-xs text-slate-500 mt-1">
                O CPF deve pertencer ao mesmo titular cadastrado na plataforma.
              </p>
            </div>

            {/* 2. Documento Oficial com Foto */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                2. Envio de Documento Oficial com Foto <span className="text-rose-500">*</span>
              </label>

              {/* Seletor de Tipo de Documento */}
              <div className="grid grid-cols-3 gap-2 mb-3">
                {[
                  { id: "cnh", label: "CNH Digital / Física" },
                  { id: "rg", label: "RG (Identidade)" },
                  { id: "passaporte", label: "Passaporte" },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() =>
                      setDocumentType(item.id as "rg" | "cnh" | "passaporte")
                    }
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                      documentType === item.id
                        ? "border-indigo-600 bg-indigo-50 text-indigo-700 shadow-xs"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Área de Upload do Documento */}
              <label
                htmlFor="document-file-input"
                className="block border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-indigo-50/30"
              >
                <div className="flex flex-col items-center justify-center">
                  <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-2">
                    <FileTextIcon className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-bold text-slate-800">
                    {documentFileName
                      ? `Arquivo selecionado: ${documentFileName}`
                      : "Clique para selecionar ou arraste o arquivo do documento"}
                  </span>
                  <span className="text-xs text-slate-500 mt-1">
                    Formatos aceitos: JPG, PNG ou PDF (frente e verso nítidos, até 15MB)
                  </span>
                </div>
                <input
                  id="document-file-input"
                  type="file"
                  accept="image/jpeg,image/png,application/pdf"
                  onChange={handleDocumentUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* 3. Envio de Selfie Biométrica */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-slate-700">
                  3. Envio de Selfie de Validação <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={handleSimulateSelfieCapture}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:underline"
                >
                  + Simular Captura via Câmera
                </button>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 items-center">
                <label
                  htmlFor="selfie-file-input"
                  className="block border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-indigo-50/30"
                >
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-2">
                      <CameraIcon className="w-6 h-6" />
                    </div>
                    <span className="text-sm font-bold text-slate-800">
                      {selfieFileName
                        ? `Selfie: ${selfieFileName}`
                        : "Enviar Foto de Rosto (Selfie)"}
                    </span>
                    <span className="text-xs text-slate-500 mt-1">
                      Rosto descoberto, boa luz, sem óculos escuros
                    </span>
                  </div>
                  <input
                    id="selfie-file-input"
                    type="file"
                    accept="image/jpeg,image/png"
                    onChange={handleSelfieUpload}
                    className="hidden"
                  />
                </label>

                {/* Pré-visualização da Selfie */}
                <div className="flex items-center justify-center p-4 rounded-2xl bg-slate-100 border border-slate-200 min-h-[140px]">
                  {selfiePreview ? (
                    <div className="text-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={selfiePreview}
                        alt="Pré-visualização da Selfie"
                        className="w-24 h-24 rounded-full object-cover mx-auto border-4 border-white shadow-md"
                      />
                      <span className="text-[11px] font-semibold text-emerald-700 mt-2 block">
                        ✓ Selfie pronta para validação
                      </span>
                    </div>
                  ) : (
                    <div className="text-center text-slate-400">
                      <CameraIcon className="w-8 h-8 mx-auto mb-1 opacity-50" />
                      <span className="text-xs">Nenhuma selfie anexada ainda</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Aviso de Privacidade */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
              <p className="font-semibold text-slate-800 mb-0.5">
                Segurança e Privacidade Garantidas (LGPD):
              </p>
              Seus documentos são utilizados exclusivamente para checagem cadastral contra fraudes
              e permanecem armazenados com criptografia de ponta a ponta.
            </div>

            <div className="pt-4 border-t border-slate-200 flex items-center justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="py-3 px-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-sm flex items-center gap-2 transition-colors disabled:opacity-60"
              >
                {isSubmitting ? (
                  <span>Enviando Documentos...</span>
                ) : (
                  <>
                    <UploadIcon className="w-4 h-4" />
                    <span>Enviar para Análise & Liberar Selo</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}

