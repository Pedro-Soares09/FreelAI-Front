"use client";

import { useState } from "react";
import Link from "next/link";
import { useUser } from "@/context/user-context";
import { policiesData } from "@/mocks/policies";
import {
  ShieldCheckIcon,
  BellIcon,
  CheckIcon,
  ArrowRightIcon,
  ChevronRightIcon,
  FileTextIcon,
} from "@/components/ui/icons";

export default function PolicyMainPage() {
  const {
    policiesAccepted,
    setPoliciesAccepted,
    notificationsEnabled,
    setNotificationsEnabled,
  } = useUser();

  const [hasAgreedCheckbox, setHasAgreedCheckbox] = useState(policiesAccepted);
  const [notificationToggle, setNotificationToggle] = useState(notificationsEnabled);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const handleToggleNotifications = () => {
    const nextVal = !notificationToggle;
    setNotificationToggle(nextVal);
    setNotificationsEnabled(nextVal);
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setHasAgreedCheckbox(checked);
    if (!checked) {
      setPoliciesAccepted(false);
      setShowSuccessToast(false);
    }
  };

  const handleConfirmAction = () => {
    if (!hasAgreedCheckbox) return;
    setPoliciesAccepted(true);
    setShowSuccessToast(true);
    setTimeout(() => {
      setShowSuccessToast(false);
    }, 4000);
  };

  return (
    <section className="page max-w-4xl">
      {/* Cabeçalho */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/40 text-primary text-xs font-bold uppercase tracking-wider mb-2">
          <ShieldCheckIcon className="w-3.5 h-3.5" />
          <span>Políticas Oficiais & Governança</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-fg tracking-tight">
          Políticas do Aplicativo FreelAI
        </h1>
        <p className="text-muted text-sm mt-1 max-w-2xl leading-relaxed">
          Conheça os termos de uso, padrões de segurança de pagamentos e tratamento de dados
          em conformidade com a LGPD que regem nossa comunidade.
        </p>
      </div>

      {/* Alerta de Sucesso */}
      {showSuccessToast && (
        <div className="mb-6 p-4 rounded-xl bg-primary border border-primary text-primary text-sm flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-full bg-primary text-fg flex items-center justify-center font-bold text-xs shrink-0">
              <CheckIcon className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold">Termos e Políticas confirmados com sucesso!</p>
              <p className="text-xs text-primary">
                Seu consentimento foi registrado na sua conta. {notificationToggle ? "Notificações ativadas." : "Notificações desativadas."}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowSuccessToast(false)}
            className="text-xs text-primary font-bold hover:underline"
          >
            Fechar
          </button>
        </div>
      )}

      {/* Grade com as 5 Páginas de Detalhe (Uma por Item) */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-fg">
            Documentos e Diretrizes (5 Seções de Detalhe)
          </h2>
          <span className="text-xs text-muted">
            Clique em cada item para ler a íntegra
          </span>
        </div>

        <div className="grid gap-3.5">
          {policiesData.map((policy, index) => (
            <Link
              key={policy.slug}
              href={`/politica/${policy.slug}`}
              className="p-5 rounded-2xl bg-surface border border-borda/90 hover:border-primary hover:shadow-sm transition-all group flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-primary/10 group-hover:brightness-110 text-primary group-hover:text-fg transition-colors flex items-center justify-center shrink-0 font-bold text-sm">
                  {index + 1}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                      {policy.badge}
                    </span>
                    <span className="text-[11px] text-muted">
                      Atualizado em: {policy.lastUpdated}
                    </span>
                  </div>
                  <h3 className="font-bold text-fg text-base mt-1 group-hover:text-primary transition-colors">
                    {policy.title}
                  </h3>
                  <p className="text-xs text-muted mt-1 line-clamp-2">
                    {policy.summary}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-xs font-bold text-primary group-hover:translate-x-1 transition-transform self-end sm:self-center shrink-0">
                <span>Ler detalhes</span>
                <ChevronRightIcon className="w-4 h-4" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Painel de Preferências e Aceite (Toggle + Checkbox + Botão Habilitável) */}
      <div className="p-6 sm:p-8 rounded-2xl bg-surface border-2 border-borda shadow-xs space-y-6">
        <div>
          <h2 className="text-lg font-bold text-fg">
            Configurações e Consentimento do Usuário
          </h2>
          <p className="text-xs text-muted mt-0.5">
            Gerencie suas preferências de comunicados e confirme a leitura das diretrizes.
          </p>
        </div>

        {/* 1. O TOGGLE DE NOTIFICAÇÕES */}
        <div className="p-4 rounded-xl bg-surface-2 border border-borda flex items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
              <BellIcon className="w-5 h-5" />
            </div>
            <div>
              <label
                htmlFor="toggle-notifications-switch"
                className="font-bold text-fg text-sm cursor-pointer block"
              >
                Toggle de Notificações de Políticas e Segurança
              </label>
              <p className="text-xs text-muted mt-0.5">
                Receber comunicados por e-mail e notificações push quando houver alterações
                nos termos de uso, políticas de privacidade ou avisos de proteção.
              </p>
            </div>
          </div>

          {/* Switch estilizado */}
          <button
            id="toggle-notifications-switch"
            type="button"
            role="switch"
            aria-checked={notificationToggle}
            onClick={handleToggleNotifications}
            className={`w-12 h-6 rounded-full transition-colors relative shrink-0 focus:outline-none focus:ring-2 focus:ring-primary/50 ${
              notificationToggle ? "bg-primary" : "bg-surface-2"
            }`}
          >
            <span
              className={`block w-5 h-5 rounded-full bg-surface shadow-xs transition-transform transform ${
                notificationToggle ? "translate-x-6" : "translate-x-0.5"
              }`}
            />
          </button>
        </div>

        {/* 2. O CHECKBOX QUE HABILITA O BOTÃO */}
        <div className="p-4 rounded-xl border border-primary/40 bg-primary/40">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={hasAgreedCheckbox}
              onChange={handleCheckboxChange}
              className="w-4 h-4 mt-0.5 rounded text-primary focus:ring-primary/50 border-borda cursor-pointer shrink-0"
            />
            <div>
              <span className="text-xs sm:text-sm font-bold text-fg block">
                Li, compreendi e concordo integralmente com as Políticas do App e Termos da Plataforma FreelAI.
              </span>
              <span className="text-xs text-muted mt-1 block">
                Marcar este checkbox confirma seu consentimento com a LGPD e as normas de verificação de identidade e proteção de pagamentos.
              </span>
            </div>
          </label>
        </div>

        {/* 3. O BOTÃO HABILITADO APENAS QUANDO O CHECKBOX ESTIVER MARCADO */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-muted">
            {hasAgreedCheckbox ? (
              <span className="text-primary font-semibold flex items-center gap-1.5">
                <CheckIcon className="w-4 h-4 text-primary" />
                Checkbox selecionado: Botão habilitado para confirmação.
              </span>
            ) : (
              <span className="text-warning font-medium">
                Marque o checkbox acima para habilitar o botão de confirmação.
              </span>
            )}
          </div>

          <button
            type="button"
            disabled={!hasAgreedCheckbox}
            onClick={handleConfirmAction}
            className={`w-full sm:w-auto py-3 px-8 rounded-xl font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2 ${
              hasAgreedCheckbox
                ? "bg-primary hover:brightness-110 text-fg cursor-pointer hover:shadow-md"
                : "bg-surface-2 text-muted cursor-not-allowed opacity-60"
            }`}
          >
            <CheckIcon className="w-4 h-4" />
            <span>Confirmar e Salvar Políticas</span>
          </button>
        </div>
      </div>
    </section>
  );
}
