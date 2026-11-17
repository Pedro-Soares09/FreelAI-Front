import {
  AssinaturaPro,
  BloqueioAgenda,
  ConviteVaga,
  DisponibilidadeProfissional,
  Notificacao,
  ProfissionalRecomendado,
  Top3Contratacao,
  Vaga,
} from '@/types';

const agora = Date.now();
const emHoras = (h: number) => new Date(agora + h * 3_600_000).toISOString();
const emMinutos = (m: number) => new Date(agora + m * 60_000).toISOString();

const mockVagas: Vaga[] = [
  {
    id: 'vaga-101',
    titulo: 'Garçom para Evento Corporativo',
    descricao:
      'Atendimento de salão e serviço de coquetel para evento empresarial de 80 convidados. Necessário traje social preto.',
    categoria: 'gastronomia',
    nivel_risco: 'baixo',
    valor: 160,
    duracao_horas: 6,
    data_inicio: emHoras(3),
    bairro: 'Boa Viagem',
    distancia_km: 4.2,
    latitude: -8.1194,
    longitude: -34.9046,
    endereco_completo: 'Av. Boa Viagem, 3420 - Salão Atlântico, Recife - PE',
    status: 'em_contratacao',
    contratante: {
      id: 'cont-1',
      nome: 'Recife Eventos & Co.',
      verificado: true,
      nota_media: 4.9,
      total_avaliacoes: 42,
      pro: true,
    },
    meu_convite: {
      id: 'conv-101',
      vaga_id: 'vaga-101',
      profissional_id: 'prof-1',
      status: 'escolhido',
      valor_proposto: null,
      prazo_em: emMinutos(24),
      rodada: 1,
    },
  },
  {
    id: 'vaga-102',
    titulo: 'Recepcionista Bilíngue para Feira Tech',
    descricao:
      'Credenciamento de participantes, entrega de kits e orientação no pavilhão principal.',
    categoria: 'eventos',
    nivel_risco: 'baixo',
    valor: 200,
    duracao_horas: 8,
    data_inicio: emHoras(26),
    bairro: 'Várzea',
    distancia_km: 2.1,
    latitude: -8.0462,
    longitude: -34.9511,
    endereco_completo: 'Av. Caxangá, 4890 - Centro de Convenções Oeste, Recife - PE',
    status: 'publicada',
    contratante: {
      id: 'cont-2',
      nome: 'Porto Digital Summit',
      verificado: true,
      nota_media: 4.8,
      total_avaliacoes: 29,
      pro: true,
    },
    meu_convite: null,
  },
  {
    id: 'vaga-103',
    titulo: 'Apoio de Logística e Montagem de Stand',
    descricao:
      'Organização de caixas, conferência de estoque e montagem leve de estruturas modulares.',
    categoria: 'logistica',
    nivel_risco: 'medio',
    valor: 140,
    duracao_horas: 5,
    data_inicio: emHoras(5),
    bairro: 'Casa Forte',
    distancia_km: 6.8,
    latitude: -8.0345,
    longitude: -34.9254,
    endereco_completo: 'Praça de Casa Forte, 310 - Galpão B, Recife - PE',
    status: 'publicada',
    contratante: {
      id: 'cont-3',
      nome: 'Studio Norte Produções',
      verificado: true,
      nota_media: 4.7,
      total_avaliacoes: 15,
      pro: false,
    },
    meu_convite: null,
  },
  {
    id: 'vaga-104',
    titulo: 'Limpeza Pós-Evento Residencial',
    descricao:
      'Limpeza geral de área gourmet e salão de festas após confraternização.',
    categoria: 'limpeza',
    nivel_risco: 'baixo',
    valor: 130,
    duracao_horas: 4,
    data_inicio: emHoras(28),
    bairro: 'Espinheiro',
    distancia_km: 8.5,
    latitude: -8.0422,
    longitude: -34.8944,
    endereco_completo: 'Rua da Hora, 712 - Apto 201, Espinheiro, Recife - PE',
    status: 'publicada',
    contratante: {
      id: 'cont-4',
      nome: 'Mariana Albuquerque',
      verificado: false,
      nota_media: 4.6,
      total_avaliacoes: 7,
      pro: false,
    },
    meu_convite: null,
  },
  {
    id: 'vaga-105',
    titulo: 'Barman para Sunset na Zona Sul',
    descricao:
      'Preparo de drinks clássicos e autorais em rooftop. Material e insumos fornecidos no local.',
    categoria: 'gastronomia',
    nivel_risco: 'baixo',
    valor: 220,
    duracao_horas: 6,
    data_inicio: emHoras(-0.6),
    bairro: 'Pina',
    distancia_km: 11.4,
    latitude: -8.0938,
    longitude: -34.8825,
    endereco_completo: 'Av. Herculano Bandeira, 513 - Rooftop, Pina, Recife - PE',
    status: 'contratada',
    contratante: {
      id: 'cont-5',
      nome: 'Mirante Lounge Recife',
      verificado: true,
      nota_media: 4.9,
      total_avaliacoes: 61,
      pro: true,
    },
    meu_convite: {
      id: 'conv-105',
      vaga_id: 'vaga-105',
      profissional_id: 'prof-1',
      status: 'aceito',
      valor_proposto: 220,
      prazo_em: null,
      rodada: 1,
    },
    checkin_realizado_em: null,
    falta_registrada: false,
  },
];

const profissionaisPorRodada: ProfissionalRecomendado[][] = [
  [
    {
      id: 'prof-top-1',
      nome: 'Ana Beatriz Lima',
      foto_url: 'https://i.pravatar.cc/160?img=47',
      verificado: true,
      nota_media: 4.9,
      total_avaliacoes: 38,
      distancia_km: 2.4,
      novo: false,
      pro: true,
      demonstrou_interesse: true,
      valor_proposto: 180,
      resumo: 'Garçonete com experiência em eventos corporativos e recepções.',
      habilidades: ['Atendimento', 'Eventos corporativos', 'Inglês'],
      estado: 'disponivel',
    },
    {
      id: 'prof-top-2',
      nome: 'Lucas Ferreira',
      foto_url: 'https://i.pravatar.cc/160?img=12',
      verificado: true,
      nota_media: 4.8,
      total_avaliacoes: 24,
      distancia_km: 4.1,
      novo: false,
      pro: false,
      demonstrou_interesse: true,
      valor_proposto: null,
      resumo: 'Profissional de atendimento focado em eventos e serviço de salão.',
      habilidades: ['Serviço de salão', 'Recepção'],
      estado: 'disponivel',
    },
    {
      id: 'prof-top-3',
      nome: 'Mariana Costa',
      foto_url: 'https://i.pravatar.cc/160?img=44',
      verificado: true,
      nota_media: 4.7,
      total_avaliacoes: 12,
      distancia_km: 5.3,
      novo: true,
      pro: false,
      demonstrou_interesse: false,
      valor_proposto: null,
      resumo: 'Nova na plataforma, com experiência prévia em eventos e buffets.',
      habilidades: ['Buffet', 'Organização', 'Atendimento'],
      estado: 'disponivel',
    },
  ],
  [
    {
      id: 'prof-top-4',
      nome: 'Rafael Santos',
      foto_url: 'https://i.pravatar.cc/160?img=13',
      verificado: true,
      nota_media: 4.8,
      total_avaliacoes: 19,
      distancia_km: 3.2,
      novo: false,
      pro: true,
      demonstrou_interesse: true,
      valor_proposto: 175,
      resumo: 'Atendente Pro com experiência em eventos de médio e grande porte.',
      habilidades: ['Eventos', 'Coquetel', 'Liderança'],
      estado: 'disponivel',
    },
    {
      id: 'prof-top-5',
      nome: 'Camila Oliveira',
      foto_url: 'https://i.pravatar.cc/160?img=49',
      verificado: true,
      nota_media: 4.9,
      total_avaliacoes: 31,
      distancia_km: 4.7,
      novo: false,
      pro: false,
      demonstrou_interesse: true,
      valor_proposto: null,
      resumo: 'Profissional experiente em atendimento e organização de salão.',
      habilidades: ['Atendimento', 'Organização'],
      estado: 'disponivel',
    },
    {
      id: 'prof-top-6',
      nome: 'Pedro Henrique Alves',
      foto_url: 'https://i.pravatar.cc/160?img=60',
      verificado: true,
      nota_media: 4.6,
      total_avaliacoes: 8,
      distancia_km: 6.1,
      novo: true,
      pro: false,
      demonstrou_interesse: false,
      valor_proposto: null,
      resumo: 'Profissional recém-chegado à plataforma, disponível para eventos.',
      habilidades: ['Recepção', 'Serviço de salão'],
      estado: 'disponivel',
    },
  ],
];

const mockTop3Contratacoes: Top3Contratacao[] = [
  {
    vaga: mockVagas[1],
    rodada: 1,
    profissionais: profissionaisPorRodada[0].map((profissional) => ({
      ...profissional,
      habilidades: [...profissional.habilidades],
    })),
    convite_atual: null,
  },
];

function atualizarRodadasTop3(): void {
  for (const match of mockTop3Contratacoes) {
    const convite = match.convite_atual;
    if (
      !convite ||
      convite.status !== 'em_andamento' ||
      new Date(convite.prazo_em).getTime() > Date.now()
    ) {
      continue;
    }

    const profissional = match.profissionais.find(
      (item) => item.id === convite.profissional_id
    );
    if (profissional) profissional.estado = 'falhou';
    match.convite_atual = null;

    if (match.profissionais.every((item) => item.estado === 'falhou')) {
      match.rodada += 1;
      const novaRodada =
        profissionaisPorRodada[(match.rodada - 1) % profissionaisPorRodada.length];
      match.profissionais = novaRodada.map((item) => ({
        ...item,
        estado: 'disponivel',
        habilidades: [...item.habilidades],
      }));
    }
  }
}

function copiarTop3(match: Top3Contratacao): Top3Contratacao {
  return {
    ...match,
    vaga: { ...match.vaga },
    profissionais: match.profissionais.map((item) => ({
      ...item,
      habilidades: [...item.habilidades],
    })),
    convite_atual: match.convite_atual ? { ...match.convite_atual } : null,
  };
}

let mockDisponibilidade: DisponibilidadeProfissional = {
  disponivel_agora: false,
  disponivel_ate: null,
  raio_km: 5,
  bloqueios: [
    {
      id: 'bloq-1',
      inicio: emHoras(48),
      fim: emHoras(52),
      motivo: 'Aula na faculdade',
    },
  ],
};

let mockNotificacoes: Notificacao[] = [
  {
    id: 'not-1',
    tipo: 'escolhido_convite',
    titulo: 'Você foi escolhido para uma vaga!',
    mensagem:
      'Recife Eventos & Co. escolheu você para "Garçom para Evento Corporativo". Responda em até 30 min.',
    lida: false,
    criada_em: emMinutos(-4),
    referencia_id: 'vaga-101',
  },
  {
    id: 'not-2',
    tipo: 'selecionado_top3',
    titulo: 'Você entrou no Top 3 de uma oportunidade',
    mensagem:
      'Seu perfil ficou entre os 3 mais compatíveis para "Recepcionista Bilíngue para Feira Tech".',
    lida: false,
    criada_em: emMinutos(-28),
    referencia_id: 'vaga-102',
  },
  {
    id: 'not-3',
    tipo: 'pagamento_retido',
    titulo: 'Pagamento retido com segurança',
    mensagem:
      'O valor de R$ 220,00 referente a "Barman para Sunset na Zona Sul" está protegido em custódia.',
    lida: true,
    criada_em: emHoras(-2),
    referencia_id: 'vaga-105',
  },
];

let mockAssinatura: AssinaturaPro = {
  ativo: false,
  valor_mensal: 19.9,
  valido_ate: null,
  renovacao_automatica: false,
};

function sanitizeVagaLGP01(vaga: Vaga): Vaga {
  const liberado =
    [
      'aceita',
      'aguardando_pagamento',
      'contratada',
      'em_execucao',
      'aguardando_confirmacao',
      'concluida',
    ].includes(vaga.status) || vaga.meu_convite?.status === 'aceito';

  return {
    ...vaga,
    endereco_completo: liberado ? vaga.endereco_completo : null,
  };
}

export async function mockRouter<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  await new Promise((r) => setTimeout(r, 150));
  const method = (options?.method || 'GET').toUpperCase();
  const body = options?.body ? JSON.parse(String(options.body)) : {};
  const [pathname, search] = path.split('?');
  const params = new URLSearchParams(search || '');

  if (pathname === '/api/v1/contratante/top3' && method === 'GET') {
    atualizarRodadasTop3();
    return mockTop3Contratacoes.map(copiarTop3) as unknown as T;
  }

  const escolhaMatch = pathname.match(
    /^\/api\/v1\/contratante\/vagas\/([^/]+)\/escolher$/
  );
  if (escolhaMatch && method === 'POST') {
    atualizarRodadasTop3();
    const match = mockTop3Contratacoes.find(
      (item) => item.vaga.id === escolhaMatch[1]
    );
    if (!match) throw new Error('Vaga não encontrada para esta rodada.');
    if (match.convite_atual) {
      throw new Error('Aguarde a resolução do convite atual.');
    }
    const profissional = match.profissionais.find(
      (item) => item.id === body.profissional_id
    );
    if (!profissional || profissional.estado === 'falhou') {
      throw new Error('Este profissional não está disponível nesta rodada.');
    }
    match.convite_atual = {
      id: `convite-match-${Date.now()}`,
      profissional_id: profissional.id,
      status: 'em_andamento',
      prazo_em: new Date(Date.now() + 30 * 60_000).toISOString(),
    };
    return copiarTop3(match) as unknown as T;
  }

  if (pathname === '/api/v1/vagas/oportunidades' && method === 'GET') {
    const raio = Number(params.get('raio_km') || 15);
    const categoria = params.get('categoria');
    const filtradas = mockVagas
      .filter((v) => v.distancia_km <= raio)
      .filter((v) => !categoria || v.categoria === categoria)
      .map(sanitizeVagaLGP01);
    return filtradas as unknown as T;
  }

  const vagaMatch = pathname.match(/^\/api\/v1\/vagas\/([^/]+)$/);
  if (vagaMatch && method === 'GET') {
    const vaga = mockVagas.find((v) => v.id === vagaMatch[1]);
    if (!vaga) throw new Error('Vaga não encontrada.');
    return sanitizeVagaLGP01(vaga) as unknown as T;
  }

  const interesseMatch = pathname.match(/^\/api\/v1\/vagas\/([^/]+)\/interesse$/);
  if (interesseMatch && method === 'POST') {
    const vaga = mockVagas.find((v) => v.id === interesseMatch[1]);
    if (!vaga) throw new Error('Vaga não encontrada.');
    if (vaga.meu_convite) {
      throw new Error(
        'Você já manifestou interesse ou enviou contraproposta para esta vaga.'
      );
    }
    const valorProposto: number | null = body.valor_proposto ?? null;
    if (valorProposto !== null && valorProposto > vaga.valor * 1.5) {
      throw new Error(
        'A contraproposta não pode ultrapassar +50% do valor ofertado.'
      );
    }
    const convite: ConviteVaga = {
      id: `conv-${Date.now()}`,
      vaga_id: vaga.id,
      profissional_id: 'prof-1',
      status: 'interessado',
      valor_proposto: valorProposto,
      prazo_em: null,
      rodada: 1,
    };
    vaga.meu_convite = convite;
    return convite as unknown as T;
  }

  if (pathname === '/api/v1/profissional/convites' && method === 'GET') {
    const pendentes = mockVagas
      .filter(
        (v) =>
          v.meu_convite &&
          (v.meu_convite.status === 'escolhido' ||
            v.meu_convite.status === 'expirado')
      )
      .map((v) => ({
        convite: v.meu_convite!,
        vaga: sanitizeVagaLGP01(v),
      }));
    return pendentes as unknown as T;
  }

  const aceitarMatch = pathname.match(/^\/api\/v1\/convites\/([^/]+)\/aceitar$/);
  if (aceitarMatch && method === 'POST') {
    const vaga = mockVagas.find((v) => v.meu_convite?.id === aceitarMatch[1]);
    if (!vaga || !vaga.meu_convite) throw new Error('Convite não encontrado.');
    if (
      vaga.meu_convite.prazo_em &&
      new Date(vaga.meu_convite.prazo_em).getTime() <= Date.now()
    ) {
      vaga.meu_convite.status = 'expirado';
      throw new Error('O prazo de 30 minutos deste convite expirou.');
    }
    vaga.meu_convite.status = 'aceito';
    vaga.status = 'contratada';
    return { vaga_id: vaga.id, conversa_id: vaga.id } as unknown as T;
  }

  const recusarMatch = pathname.match(/^\/api\/v1\/convites\/([^/]+)\/recusar$/);
  if (recusarMatch && method === 'POST') {
    const vaga = mockVagas.find((v) => v.meu_convite?.id === recusarMatch[1]);
    if (vaga && vaga.meu_convite) {
      vaga.meu_convite.status = 'recusado';
      vaga.status = 'publicada';
    }
    return undefined as unknown as T;
  }

  if (pathname === '/api/v1/profissional/disponibilidade' && method === 'GET') {
    return { ...mockDisponibilidade } as unknown as T;
  }

  if (pathname === '/api/v1/profissional/disponivel-agora' && method === 'POST') {
    const ativo = Boolean(body.ativo);
    mockDisponibilidade = {
      ...mockDisponibilidade,
      disponivel_agora: ativo,
      disponivel_ate: ativo ? emHoras(4) : null,
    };
    return { ...mockDisponibilidade } as unknown as T;
  }

  if (pathname === '/api/v1/profissional/raio' && method === 'PATCH') {
    mockDisponibilidade = {
      ...mockDisponibilidade,
      raio_km: Number(body.raio_km || 5),
    };
    return { ...mockDisponibilidade } as unknown as T;
  }

  if (pathname === '/api/v1/profissional/agenda/bloqueios' && method === 'POST') {
    const novo: BloqueioAgenda = {
      id: `bloq-${Date.now()}`,
      inicio: body.inicio,
      fim: body.fim,
      motivo: body.motivo,
    };
    mockDisponibilidade.bloqueios = [...mockDisponibilidade.bloqueios, novo];
    return novo as unknown as T;
  }

  const bloqDelMatch = pathname.match(
    /^\/api\/v1\/profissional\/agenda\/bloqueios\/([^/]+)$/
  );
  if (bloqDelMatch && method === 'DELETE') {
    mockDisponibilidade.bloqueios = mockDisponibilidade.bloqueios.filter(
      (b) => b.id !== bloqDelMatch[1]
    );
    return undefined as unknown as T;
  }

  const checkinMatch = pathname.match(/^\/api\/v1\/vagas\/([^/]+)\/checkin$/);
  if (checkinMatch && method === 'POST') {
    const vaga = mockVagas.find((v) => v.id === checkinMatch[1]);
    if (!vaga) throw new Error('Vaga não encontrada.');
    if (!body.simular_local) {
      const dLat = ((body.latitude - vaga.latitude) * Math.PI) / 180;
      const dLon = ((body.longitude - vaga.longitude) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((vaga.latitude * Math.PI) / 180) *
          Math.cos((body.latitude * Math.PI) / 180) *
          Math.sin(dLon / 2) ** 2;
      const distMetros =
        6371000 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      if (distMetros > 300) {
        throw new Error(
          `Você está a ${Math.round(distMetros)} m do local. O check-in exige menos de 300 m.`
        );
      }
    }
    vaga.checkin_realizado_em = new Date().toISOString();
    vaga.status = 'em_execucao';
    return {
      mensagem: 'Check-in validado com sucesso (< 300 m do local).',
      distancia_metros: body.simular_local ? 42 : 120,
    } as unknown as T;
  }

  const faltaMatch = pathname.match(/^\/api\/v1\/vagas\/([^/]+)\/falta$/);
  if (faltaMatch && method === 'POST') {
    const vaga = mockVagas.find((v) => v.id === faltaMatch[1]);
    if (!vaga) throw new Error('Vaga não encontrada.');
    vaga.falta_registrada = true;
    vaga.status = 'cancelada';
    return {
      mensagem: 'Falta registrada. Estorno integral acionado para o contratante.',
    } as unknown as T;
  }

  if (pathname === '/api/v1/notificacoes' && method === 'GET') {
    const nao_lidas = mockNotificacoes.filter((n) => !n.lida).length;
    return { itens: [...mockNotificacoes], nao_lidas } as unknown as T;
  }

  const notLidaMatch = pathname.match(/^\/api\/v1\/notificacoes\/([^/]+)\/lida$/);
  if (notLidaMatch && method === 'PATCH') {
    mockNotificacoes = mockNotificacoes.map((n) =>
      n.id === notLidaMatch[1] ? { ...n, lida: true } : n
    );
    return undefined as unknown as T;
  }

  if (pathname === '/api/v1/notificacoes/ler-todas' && method === 'POST') {
    mockNotificacoes = mockNotificacoes.map((n) => ({ ...n, lida: true }));
    return undefined as unknown as T;
  }

  if (pathname === '/api/v1/assinatura/pro' && method === 'GET') {
    return { ...mockAssinatura } as unknown as T;
  }

  if (pathname === '/api/v1/assinatura/pro/assinar' && method === 'POST') {
    mockAssinatura = {
      ativo: true,
      valor_mensal: 19.9,
      valido_ate: emHoras(24 * 30),
      renovacao_automatica: true,
    };
    return { ...mockAssinatura } as unknown as T;
  }

  if (pathname === '/api/v1/assinatura/pro/cancelar' && method === 'POST') {
    mockAssinatura = {
      ...mockAssinatura,
      renovacao_automatica: false,
      valido_ate: mockAssinatura.valido_ate || emHoras(24 * 30),
    };
    return { ...mockAssinatura } as unknown as T;
  }

  throw new Error(`Rota mock não mapeada: ${method} ${pathname}`);
}
