type JobDetailsPageProps = {
  params: Promise<{ id: string }>;
};

export default async function JobDetailsPage({ params }: JobDetailsPageProps) {
  const { id } = await params;

  return (
    <section className="page">
      <h1>Detalhes da vaga</h1>
      <p>Vaga: {id}</p>
    </section>
  );
}
