import { IconShield } from "@/components/ui/icons";

export function TrustSeals() {
  return (
    <ul className="flex flex-wrap gap-4 text-sm text-muted" aria-label="Compromissos da plataforma">
      <li className="inline-flex items-center gap-1.5">
        <IconShield width={16} height={16} className="text-success" />
        Perfis verificados
      </li>
      <li className="inline-flex items-center gap-1.5">
        <IconShield width={16} height={16} className="text-success" />
        Pagamentos protegidos
      </li>
    </ul>
  );
}
