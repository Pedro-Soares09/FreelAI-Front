"use client";

import { useState, type ReactNode } from "react";
import { AvatarVerified } from "@/components/shared/avatar-verified";
import { JobCard } from "@/components/shared/job-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Countdown } from "@/components/ui/countdown";
import {
  ESTADOS_CONVITE,
  ESTADOS_PAGAMENTO,
  ESTADOS_VAGA,
  EstadoBadge,
} from "@/components/ui/estado-badge";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { SeloNovo, SeloPro } from "@/components/ui/selos";
import { Textarea } from "@/components/ui/textarea";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useToast } from "@/components/ui/toast";

function Secao({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="mb-4 text-xl font-bold">{titulo}</h2>
      <div className="flex flex-wrap items-start gap-4">{children}</div>
    </section>
  );
}

export default function DesignSystemPage() {
  const [modal, setModal] = useState(false);
  const { avisar } = useToast();
  const fim = new Date(Date.now() + 15 * 60 * 1000);

  return (
    <main className="page">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Design system</h1>
        <ThemeToggle />
      </div>
      <p className="mt-2 text-muted">Componentes base nos temas escuro (neon) e claro.</p>

      <Secao titulo="Botões">
        <Button>Primário</Button>
        <Button variant="secondary">Secundário</Button>
        <Button variant="ghost">Fantasma</Button>
        <Button variant="danger">Perigo</Button>
        <Button loading>Carregando</Button>
        <Button disabled>Desabilitado</Button>
        <Button size="sm">Pequeno</Button>
        <Button size="lg">Grande</Button>
      </Secao>

      <Secao titulo="Formulário">
        <div className="grid w-full max-w-md gap-4">
          <Input label="Nome" placeholder="Seu nome" />
          <Input label="E-mail" type="email" error="Informe um e-mail válido." defaultValue="exemplo" />
          <Input label="Campo desabilitado" disabled defaultValue="Indisponível" />
          <Select
            label="Categoria"
            placeholder="Selecione"
            opcoes={[
              { valor: "limpeza", rotulo: "Limpeza" },
              { valor: "reparos", rotulo: "Reparos" },
            ]}
            hint="Escolha a categoria do serviço."
          />
          <Textarea label="Descrição" placeholder="Descreva o que precisa" />
        </div>
      </Secao>

      <Secao titulo="Selos e avatar">
        <SeloNovo />
        <SeloPro />
        <Badge tom="success">Verificado</Badge>
        <AvatarVerified name="Maria Souza" verified />
        <AvatarVerified name="João Lima" />
      </Secao>

      <Secao titulo="Estados de vaga">
        {Object.keys(ESTADOS_VAGA).map((e) => (
          <EstadoBadge key={e} tipo="vaga" estado={e} />
        ))}
      </Secao>
      <Secao titulo="Estados de convite">
        {Object.keys(ESTADOS_CONVITE).map((e) => (
          <EstadoBadge key={e} tipo="convite" estado={e} />
        ))}
      </Secao>
      <Secao titulo="Estados de pagamento">
        {Object.keys(ESTADOS_PAGAMENTO).map((e) => (
          <EstadoBadge key={e} tipo="pagamento" estado={e} />
        ))}
      </Secao>

      <Secao titulo="Card de vaga">
        <div className="w-full max-w-xl">
          <JobCard
            job={{
              id: "exemplo",
              title: "Montagem de guarda-roupa",
              description: "Montar guarda-roupa de seis portas em apartamento na Boa Viagem.",
              category: "Montagem",
              budget: "R$ 150,00",
              status: "PUBLICADA",
            }}
          />
        </div>
      </Secao>

      <Secao titulo="Contagem regressiva, modal e toast">
        <Card className="flex items-center gap-4">
          <Countdown ate={fim} rotulo="Pagamento expira em" />
        </Card>
        <Button variant="secondary" onClick={() => setModal(true)}>
          Abrir modal
        </Button>
        <Button variant="secondary" onClick={() => avisar("Ação concluída.", "success")}>
          Mostrar aviso
        </Button>
      </Secao>

      <Modal
        aberto={modal}
        titulo="Confirmar ação"
        onFechar={() => setModal(false)}
        rodape={
          <>
            <Button variant="ghost" onClick={() => setModal(false)}>
              Cancelar
            </Button>
            <Button onClick={() => setModal(false)}>Confirmar</Button>
          </>
        }
      >
        <p className="text-muted">Tab percorre os controles do modal e Esc fecha.</p>
      </Modal>
    </main>
  );
}
