import { Pagina } from "@/components/layout/pagina";
import { ListaVazia } from "@/components/ui/estados";

type ConversationPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ConversationPage({ params }: ConversationPageProps) {
  const { id } = await params;

  return (
    <Pagina titulo="Conversa" descricao={`Conversa ${id}`}>
      <ListaVazia titulo="Sem mensagens" descricao="As mensagens desta conversa aparecem aqui." />
    </Pagina>
  );
}
