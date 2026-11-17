import { Pagina } from "@/components/layout/pagina";
import { ListaVazia } from "@/components/ui/estados";

export default function PolicyPage() {
  return (
    <Pagina titulo="Política de privacidade">
      <ListaVazia
        titulo="Texto em revisão"
        descricao="A política de privacidade será publicada aqui assim que for validada."
      />
    </Pagina>
  );
}
