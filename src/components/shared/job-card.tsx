import Link from "next/link";
import { Card } from "@/components/ui/card";
import { EstadoBadge } from "@/components/ui/estado-badge";
import type { Job } from "@/types";

export function JobCard({ job }: { job: Job }) {
  return (
    <Card className="flex flex-col gap-2 transition hover:border-primary">
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-lg font-bold">
          <Link href={`/vagas/${job.id}`} className="hover:text-primary">
            {job.title}
          </Link>
        </h2>
        {job.status && <EstadoBadge tipo="vaga" estado={job.status} />}
      </div>
      <p className="text-sm text-muted">{job.description}</p>
      <p className="text-sm">
        <span className="text-muted">{job.category}</span>
        <span className="mx-2 text-borda" aria-hidden="true">
          |
        </span>
        <span className="font-semibold text-accent">{job.budget}</span>
      </p>
    </Card>
  );
}
