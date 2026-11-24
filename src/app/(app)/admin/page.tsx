"use client";

import { useState } from "react";
import { AbaCadastros } from "@/components/admin/aba-cadastros";
import { AbaDenuncias, AbaDisputas } from "@/components/admin/aba-moderacao";
import { Tabs } from "@/components/ui/tabs";

export default function AdminPage() {
  const [pendentes, setPendentes] = useState<number | undefined>();
  const [denuncias, setDenuncias] = useState<number | undefined>();
  const [disputas, setDisputas] = useState<number | undefined>();

  return (
    <section className="page">
      <h1 className="text-3xl font-bold">Administração</h1>
      <p className="mt-1 mb-6 text-muted">Fila de cadastros, denúncias e disputas.</p>
      <Tabs
        abas={[
          {
            id: "cadastros",
            rotulo: "Cadastros",
            contagem: pendentes,
            conteudo: <AbaCadastros onContagem={setPendentes} />,
          },
          {
            id: "denuncias",
            rotulo: "Denúncias",
            contagem: denuncias,
            conteudo: <AbaDenuncias onContagem={setDenuncias} />,
          },
          {
            id: "disputas",
            rotulo: "Disputas",
            contagem: disputas,
            conteudo: <AbaDisputas onContagem={setDisputas} />,
          },
        ]}
      />
    </section>
  );
}
