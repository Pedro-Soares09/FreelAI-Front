import { JobCard } from "@/components/shared/job-card";
import { jobs } from "@/mocks/jobs";

export default function JobsPage() {
  return (
    <section className="page">
      <h1>Vagas</h1>
      <p>Oportunidades para você trabalhar como freelancer.</p>
      <div className="card-list">
        {jobs.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>
    </section>
  );
}
