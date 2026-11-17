import { Pagina } from "@/components/layout/pagina";
import { ListaVazia } from "@/components/ui/estados";

export default function ChatPage() {
  return (
    <Pagina titulo="Conversas" descricao="Converse com quem você contratou ou com quem contratou você.">
      <ListaVazia
        titulo="Nenhuma conversa ainda"
        descricao="O chat é aberto quando um convite é aceito e o contrato fica pronto."
      />
    </Pagina>
  );
}
