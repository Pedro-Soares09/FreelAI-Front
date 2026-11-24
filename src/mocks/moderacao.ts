// Dados de moderação do modo local (sem API): denúncias, disputas e banimentos de exemplo.
// Espelham o que a semente da demonstração cria no back.

const h = (horas: number) => new Date(Date.now() - horas * 3_600_000).toISOString();

type Livre = Record<string, unknown>;

function denuncia(d: Livre): Livre {
  const criado = d.criado_em as string;
  const fim = d.decidido_em ? new Date(d.decidido_em as string).getTime() : Date.now();
  const minutos = Math.max(0, Math.round((fim - new Date(criado).getTime()) / 60_000));
  return {
    denunciante_id: null,
    vaga_id: null,
    conversa_id: null,
    origem: "usuario",
    estado: "aberta",
    decisao_motivo: null,
    decidido_em: null,
    meta_horas_uteis: 48,
    tempo_espera_minutos: minutos,
    tempo_espera_horas_uteis: Math.round(minutos / 60),
    acima_da_meta: minutos / 60 > 48,
    denuncias_procedentes_acumuladas: 0,
    denunciado_estado: "ativa",
    conversa_bloqueada: false,
    ...d,
  };
}

export const DENUNCIAS_MOCK = [
  denuncia({
    id: 6,
    denunciante_id: 23,
    denunciante_nome: "Helena Duarte",
    denunciado_id: 22,
    denunciado_nome: "Tiago Alves",
    vaga_id: 17,
    motivo: "cobranca_fora_da_plataforma",
    descricao: "Pediu para combinar o pagamento fora do aplicativo e passou um número.",
    criado_em: h(170),
  }),
  denuncia({
    id: 8,
    origem: "automatica",
    denunciado_id: 22,
    denunciado_nome: "Tiago Alves",
    vaga_id: 17,
    motivo: "tentativas_de_contato",
    descricao: "Três tentativas de enviar telefone e WhatsApp pelo chat.",
    criado_em: h(26),
  }),
  denuncia({
    id: 7,
    denunciante_id: 24,
    denunciante_nome: "Patrícia Nunes",
    denunciado_id: 25,
    denunciado_nome: "Roberto Cunha",
    vaga_id: 18,
    motivo: "mensagens_ofensivas",
    descricao: "Chamou a profissional de incompetente e ameaçou avaliar com nota zero.",
    criado_em: h(3),
  }),
  denuncia({
    id: 1,
    denunciante_id: 20,
    denunciante_nome: "Juliana Prado",
    denunciado_id: 21,
    denunciado_nome: "Rafael Lima",
    vaga_id: 15,
    motivo: "nao_compareceu",
    descricao: "Combinou o horário, não apareceu e não respondeu mais.",
    estado: "procedente",
    decisao_motivo: "Ausência confirmada pelo contratante e pelo histórico do chat.",
    criado_em: h(120),
    decidido_em: h(100),
    denuncias_procedentes_acumuladas: 2,
    denunciado_estado: "banida",
    conversa_bloqueada: true,
  }),
  denuncia({
    id: 2,
    denunciante_id: 26,
    denunciante_nome: "Marcos Teles",
    denunciado_id: 21,
    denunciado_nome: "Rafael Lima",
    vaga_id: 16,
    motivo: "comportamento_inadequado",
    descricao: "Falou de forma agressiva durante a negociação do valor.",
    estado: "procedente",
    decisao_motivo: "Linguagem agressiva registrada no chat. Segunda penalidade.",
    criado_em: h(100),
    decidido_em: h(80),
    denuncias_procedentes_acumuladas: 2,
    denunciado_estado: "banida",
    conversa_bloqueada: true,
  }),
  denuncia({
    id: 5,
    denunciante_id: 23,
    denunciante_nome: "Helena Duarte",
    denunciado_id: 24,
    denunciado_nome: "Patrícia Nunes",
    vaga_id: 19,
    motivo: "servico_mal_feito",
    descricao: "A poda ficou irregular na lateral esquerda.",
    estado: "improcedente",
    decisao_motivo: "Fotos do chat mostram a poda conforme o combinado.",
    criado_em: h(70),
    decidido_em: h(50),
  }),
];

function disputa(d: Livre): Livre {
  const criado = d.criado_em as string;
  const fim = d.decidido_em ? new Date(d.decidido_em as string).getTime() : Date.now();
  const minutos = Math.max(0, Math.round((fim - new Date(criado).getTime()) / 60_000));
  return {
    estado: "aberta",
    percentual_reembolso: null,
    decisao_motivo: null,
    decidido_em: null,
    meta_horas_uteis: 48,
    tempo_espera_minutos: minutos,
    tempo_espera_horas_uteis: Math.round(minutos / 60),
    acima_da_meta: minutos / 60 > 48,
    anexos: [],
    ...d,
  };
}

const msg = (id: number, autor: number, texto: string) => ({
  id,
  conversa_id: 1,
  autor_id: autor,
  texto,
  anexo_url: null,
  enviada_em: h(24),
  lida_em: null,
});

export const DISPUTAS_MOCK = [
  disputa({
    id: 1,
    vaga_titulo: "Poda de árvores no quintal",
    contratante_nome: "Roberto Cunha",
    profissional_nome: "Patrícia Nunes",
    valor_total: 320,
    descricao: "A poda da árvore dos fundos não foi feita.",
    criado_em: h(6),
    chat: [msg(1, 24, "Terminei a poda."), msg(2, 25, "Ficou faltando a árvore dos fundos.")],
  }),
  disputa({
    id: 2,
    vaga_titulo: "Montagem de cozinha planejada",
    contratante_nome: "Helena Duarte",
    profissional_nome: "Tiago Alves",
    valor_total: 480,
    descricao: "Duas portas e uma gaveta ficaram desalinhadas.",
    criado_em: h(20),
    chat: [msg(3, 22, "Cozinha montada."), msg(4, 23, "Duas portas não fecham direito.")],
  }),
  disputa({
    id: 3,
    vaga_titulo: "Limpeza pós-obra",
    contratante_nome: "Juliana Prado",
    profissional_nome: "Patrícia Nunes",
    valor_total: 260,
    descricao: "Sobrou entulho na varanda e o piso ficou sujo.",
    criado_em: h(2),
    chat: [msg(5, 24, "Limpeza concluída."), msg(6, 20, "Ainda tem entulho na varanda.")],
  }),
  disputa({
    id: 4,
    vaga_titulo: "Pintura de fachada",
    contratante_nome: "Marcos Teles",
    profissional_nome: "Rafael Lima",
    valor_total: 600,
    descricao: "Só uma demão de tinta e manchas na parede.",
    estado: "reembolso_parcial",
    percentual_reembolso: 40,
    decisao_motivo: "Fotos mostram uma demão e manchas. Reembolso de 40% e 60% ao profissional.",
    criado_em: h(52),
    decidido_em: h(10),
    chat: [msg(7, 21, "Fachada pintada."), msg(8, 26, "Pintou só uma demão e a parede ficou manchada.")],
  }),
];

export const BANIDOS_MOCK = [
  { usuario_id: 21, nome: "Rafael Lima", email: "rafael.lima@example.com", penalidades: 2 },
];
