import { Pagina } from "@/components/layout/pagina";
import { ListaVazia } from "@/components/ui/estados";

export default function CreateJobPage() {
  return (
    <Pagina titulo="Criar vaga" descricao="Descreva o serviço e a FREELAI encontra os três melhores profissionais.">
      <ListaVazia
        titulo="Formulário em desenvolvimento"
        descricao="Aqui você informa categoria, descrição, valor, data e endereço da vaga."
      />
    </Pagina>
  );
}
