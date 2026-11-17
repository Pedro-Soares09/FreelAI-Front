import Link from "next/link";

const FAQ = [
  {
    question: "Quando posso cancelar um serviço sem taxa?",
    answer:
      "Até 12 horas antes do início do serviço. Depois desse prazo, o cancelamento tem taxa. A regra aparece na tela de cancelamento antes de você confirmar.",
  },
  {
    question: "Quando o pagamento é liberado?",
    answer:
      "Somente depois que o serviço for confirmado como concluído pelas duas partes.",
  },
  {
    question: "Posso contestar um serviço?",
    answer:
      "Sim. Você tem até 24 horas depois da conclusão para contestar, informando o motivo. A equipe FREELAÍ analisa a contestação.",
  },
  {
    question: "Como denunciar alguém?",
    answer:
      "Dentro da conversa, use o botão Denunciar e escolha o motivo. A denúncia vai para a equipe analisar.",
  },
];

export default function SupportPage() {
  return (
    <section className="page">
      <h1>Suporte</h1>
      <p>Respostas rápidas sobre cancelamento, pagamento, contestação e denúncias.</p>

      <div className="card-list">
        {FAQ.map((item) => (
          <details key={item.question} className="job-card">
            <summary>
              <strong>{item.question}</strong>
            </summary>
            <p>{item.answer}</p>
          </details>
        ))}
      </div>

      <div className="state-box">
        <p>
          Não encontrou o que precisava? Use o botão <strong>Denunciar</strong> dentro da conversa
          ou volte para as <Link href="/chat">suas conversas</Link>.
        </p>
        {/* TODO(squad): definir o canal de atendimento (e-mail, WhatsApp ou chat) e o horário. */}
      </div>
    </section>
  );
}
