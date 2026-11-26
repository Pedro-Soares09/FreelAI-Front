"use client";

import { useParams } from "next/navigation";
import { PerfilPublico } from "@/components/perfil/perfil-publico";

export default function PerfilProfissionalPage() {
  const { usuarioId } = useParams<{ usuarioId: string }>();
  return <PerfilPublico usuarioId={usuarioId} />;
}
