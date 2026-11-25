import { MOCKS_EM_PRODUCAO } from "@/lib/modo";

/** Faixa permanente quando um build de produção roda sem a API real (dados simulados). */
export function AvisoDadosSimulados() {
  if (!MOCKS_EM_PRODUCAO) return null;
  return (
    <div
      role="status"
      className="fixed inset-x-0 bottom-0 z-[60] flex items-center justify-center gap-2 border-t border-warning/40 bg-surface px-3 py-1.5 text-xs font-medium text-warning"
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="h-4 w-4 shrink-0"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 9v4" />
        <path d="M12 17h.01" />
        <path d="M10.3 3.9 2.4 17.5A2 2 0 0 0 4.1 20.5h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
      </svg>
      Dados simulados: este ambiente não usa a API real
    </div>
  );
}
