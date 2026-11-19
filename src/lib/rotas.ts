import type { TipoPerfil, Usuario } from "@/api/tipos";

export type ItemNav = { href: string; rotulo: string };

const comum: ItemNav[] = [
  { href: "/plano-pro", rotulo: "Plano Pro" },
  { href: "/chat", rotulo: "Conversas" },
  { href: "/perfil", rotulo: "Perfil" },
];

const navProfissional: ItemNav[] = [
  { href: "/vagas", rotulo: "Vagas" },
  { href: "/match", rotulo: "Convites" },
  ...comum,
];

const navContratante: ItemNav[] = [
  { href: "/vagas", rotulo: "Minhas vagas" },
  { href: "/criar-vaga", rotulo: "Criar vaga" },
  { href: "/match", rotulo: "Match" },
  ...comum,
];

const navAdmin: ItemNav[] = [
  { href: "/admin", rotulo: "Painel" },
  { href: "/chat", rotulo: "Conversas" },
  { href: "/perfil", rotulo: "Perfil" },
];

export function itensDeNavegacao(usuario: Usuario | null): ItemNav[] {
  if (!usuario || usuario.estado !== "ativa") return [];
  if (usuario.papel === "admin") return navAdmin;
  return usuario.perfil_ativo === "contratante" ? navContratante : navProfissional;
}

/** Rotas restritas a um perfil ou papel. O prefixo mais específico vale. */
const restricoes: Array<{ prefixo: string; perfil?: TipoPerfil; admin?: boolean }> = [
  { prefixo: "/criar-vaga", perfil: "contratante" },
  { prefixo: "/pagamento", perfil: "contratante" },
  { prefixo: "/admin", admin: true },
];

export type Acesso = { permitido: true } | { permitido: false; motivo: string; destino: string };

export function verificarAcesso(caminho: string, usuario: Usuario): Acesso {
  const regra = restricoes.find((r) => caminho === r.prefixo || caminho.startsWith(`${r.prefixo}/`));
  if (!regra) return { permitido: true };

  if (regra.admin && usuario.papel !== "admin") {
    return { permitido: false, motivo: "Esta área é restrita à administração.", destino: "/vagas" };
  }
  if (regra.perfil && usuario.perfil_ativo !== regra.perfil) {
    const quem = regra.perfil === "contratante" ? "contratantes" : "profissionais";
    return {
      permitido: false,
      motivo: `Esta área é exclusiva para ${quem}. Troque o perfil ativo para acessar.`,
      destino: "/vagas",
    };
  }
  return { permitido: true };
}
