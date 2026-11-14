type PaymentPageProps = {
  params: Promise<{ id: string }>;
};

export default async function PaymentPage({ params }: PaymentPageProps) {
  const { id } = await params;

  return (
    <section className="page">
      <h1>Pagamento</h1>
      <p>Pagamento: {id}</p>
    </section>
  );
}
