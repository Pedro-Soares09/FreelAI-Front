type ConversationPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ConversationPage({
  params,
}: ConversationPageProps) {
  const { id } = await params;

  return (
    <section className="page">
      <h1>Conversa</h1>
      <p>Conversa: {id}</p>
    </section>
  );
}
