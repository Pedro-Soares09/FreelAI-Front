import Link from "next/link";
import { ShieldCheckIcon, LockIcon } from "@/components/ui/icons";

export function TrustSeals() {
  return (
    <ul
      className="flex flex-wrap items-center gap-2.5 text-xs font-medium text-slate-600"
      aria-label="Compromissos da plataforma"
    >
      <li>
        <Link
          href="/verificacao"
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200/80 hover:bg-blue-100 transition-colors"
        >
          <ShieldCheckIcon className="w-3.5 h-3.5 text-blue-600" />
          <span>Perfis verificados</span>
        </Link>
      </li>
      <li>
        <Link
          href="/politica/seguranca-pagamentos"
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 hover:bg-emerald-100 transition-colors"
        >
          <LockIcon className="w-3.5 h-3.5 text-emerald-600" />
          <span>Pagamentos protegidos</span>
        </Link>
      </li>
    </ul>
  );
}
