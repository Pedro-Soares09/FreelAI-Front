"use client";

import { JobCard } from "@/components/shared/job-card";
import { EstadoDeLista } from "@/components/ui/estados";
import { jobs } from "@/mocks/jobs";

export default function JobsPage() {
  return (
    <section className="page">
      <h1 className="text-3xl font-bold">Vagas</h1>
      <p className="mt-1 text-muted">Oportunidades de serviço na sua região.</p>
      <div className="mt-6">
        <EstadoDeLista
          estado={{ tipo: "pronto", dados: jobs }}
          vazio={{
            titulo: "Nenhuma vaga por aqui",
            descricao: "Quando houver vagas disponíveis, elas aparecem nesta lista.",
          }}
        >
          {(dados) => (
            <div className="card-list">
              {dados.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          )}
        </EstadoDeLista>
      </div>
    </section>
  );
}
