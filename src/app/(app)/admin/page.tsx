"use client";

import { useState } from "react";
import { AbaCadastros } from "@/components/admin/aba-cadastros";
import { ListaVazia } from "@/components/ui/estados";
import { Tabs } from "@/components/ui/tabs";

export default function AdminPage() {
  const [pendentes, setPendentes] = useState<number | undefined>();

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
            conteudo: (
              <ListaVazia
                titulo="Nenhuma denúncia aberta"
                descricao="As denúncias recebidas aparecem aqui para análise."
              />
            ),
          },
          {
            id: "disputas",
            rotulo: "Disputas",
            conteudo: (
              <ListaVazia
                titulo="Nenhuma disputa aberta"
                descricao="Disputas de pagamento aparecem aqui para decisão."
              />
            ),
          },
        ]}
      />
    </section>
  );
}
