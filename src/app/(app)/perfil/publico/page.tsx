"use client";

import { Carregando } from "@/components/ui/estados";
import { PerfilPublico } from "@/components/perfil/perfil-publico";
import { useSessao } from "@/lib/session";

export default function PublicProfilePage() {
  const { usuario } = useSessao();
  if (!usuario) return <Carregando rotulo="Carregando perfil" />;
  return <PerfilPublico usuarioId={String(usuario.id)} permiteEdicao />;
}
