"use client";

import { useState } from "react";
import { AbaCadastros } from "@/components/admin/aba-cadastros";
import { AbaContestacoes } from "@/components/admin/aba-contestacoes";
import { AbaBanimentos, AbaDenuncias, AbaDisputas } from "@/components/admin/aba-moderacao";
import { Tabs } from "@/components/ui/tabs";

export default function AdminPage() {
  const [pendentes, setPendentes] = useState<number | undefined>();
  const [denuncias, setDenuncias] = useState<number | undefined>();
  const [disputas, setDisputas] = useState<number | undefined>();
  const [banimentos, setBanimentos] = useState<number | undefined>();
  const [contestacoes, setContestacoes] = useState<number | undefined>();

  return (
    <section className="page">
      <h1 className="text-3xl font-bold">Administração</h1>
      <p className="mt-1 mb-6 text-muted">Fila de cadastros, denúncias, disputas e banimentos.</p>
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
          {
            id: "banimentos",
            rotulo: "Banimentos",
            contagem: banimentos,
            conteudo: <AbaBanimentos onContagem={setBanimentos} />,
          },
          {
            id: "contestacoes",
            rotulo: "Contestações",
            contagem: contestacoes,
            conteudo: <AbaContestacoes onContagem={setContestacoes} />,
          },
        ]}
      />
    </section>
  );
}
