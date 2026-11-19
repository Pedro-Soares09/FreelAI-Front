import { Pagina } from "@/components/layout/pagina";
import { ListaVazia } from "@/components/ui/estados";

type PaymentPageProps = {
  params: Promise<{ id: string }>;
};

export default async function PaymentPage({ params }: PaymentPageProps) {
  const { id } = await params;

  return (
    <Pagina titulo="Pagamento" descricao={`Cobrança ${id}`}>
      <ListaVazia
        titulo="Pagamento em desenvolvimento"
        descricao="O código Pix e o tempo restante para pagar aparecem aqui."
      />
    </Pagina>
  );
}
