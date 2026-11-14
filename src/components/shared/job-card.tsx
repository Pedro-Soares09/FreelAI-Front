import Link from "next/link";
import type { Job } from "@/types";

export function JobCard({ job }: { job: Job }) {
  return (
    <article className="job-card">
      <h2>
        <Link href={`/vagas/${job.id}`}>{job.title}</Link>
      </h2>
      <p>{job.description}</p>
      <p>
        {job.category} · {job.budget}
      </p>
    </article>
  );
}
