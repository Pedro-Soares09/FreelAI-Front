import { ApiError, erroDeResposta } from "@/api/erro";
import { fetchAutenticado } from "@/api/client";
import type { components } from "@/api/schema";

// Comprovantes de pagamento da vaga: serviço, horas extras e bônus.
// Horas extras e bônus são acertados entre as partes; a plataforma cobra
// o percentual adicional (7%) sobre eles.

export type TipoComprovante = components["schemas"]["TipoComprovante"];
export type Comprovante = components["schemas"]["ComprovanteDetalhe"];
export type ResumoComprovantes = components["schemas"]["ResumoComprovantes"];

export const ROTULOS_COMPROVANTE: Record<TipoComprovante, string> = {
  servico: "Pagamento do serviço",
  horas_extras: "Horas extras",
  bonus: "Bônus",
};

export const TAXA_ADICIONAL_PADRAO = 7;

const USA_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS !== "false";

async function chamar<T>(caminho: string, init?: RequestInit): Promise<T> {
  let resposta: Response;
  try {
    resposta = await fetchAutenticado(caminho, init);
  } catch {
    throw new ApiError(0, "rede", "Não foi possível conectar ao servidor.");
  }
  if (!resposta.ok) {
    let corpo: unknown;
    try {
      corpo = await resposta.json();
    } catch {
      corpo = undefined;
    }
    throw erroDeResposta(resposta.status, corpo);
  }
  return resposta.json() as Promise<T>;
}

// Modo local: guarda em memória, sem arquivo.
const locais = new Map<string, Comprovante[]>();

function resumir(vagaId: string, lista: Comprovante[]): ResumoComprovantes {
  const soma = (tipo: TipoComprovante) =>
    lista.filter((c) => c.tipo === tipo).reduce((acc, c) => acc + Number(c.valor), 0);
  const horas = soma("horas_extras");
  const bonus = soma("bonus");
  const adicional = horas + bonus;
  const taxa = (adicional * TAXA_ADICIONAL_PADRAO) / 100;
  return {
    vaga_id: Number(vagaId) || 0,
    comprovantes: lista,
    total_servico: soma("servico").toFixed(2),
    total_horas_extras: horas.toFixed(2),
    total_bonus: bonus.toFixed(2),
    total_adicional: adicional.toFixed(2),
    percentual_taxa_adicional: String(TAXA_ADICIONAL_PADRAO),
    taxa_adicional_plataforma: taxa.toFixed(2),
    liquido_adicional_profissional: (adicional - taxa).toFixed(2),
  };
}

export const comprovantesApi = {
  listar: async (vagaId: string): Promise<ResumoComprovantes> => {
    if (USA_MOCKS) return resumir(vagaId, locais.get(vagaId) ?? []);
    return chamar<ResumoComprovantes>(`/api/v1/vagas/${encodeURIComponent(vagaId)}/comprovantes`);
  },

  anexar: async (
    vagaId: string,
    dados: { tipo: TipoComprovante; valor: number; arquivo: File; acordoPrevio?: string },
  ): Promise<void> => {
    if (USA_MOCKS) {
      const lista = locais.get(vagaId) ?? [];
      const adicional = dados.tipo !== "servico";
      lista.push({
        id: lista.length + 1,
        vaga_id: Number(vagaId) || 0,
        tipo: dados.tipo,
        valor: dados.valor.toFixed(2),
        taxa_pct: adicional ? String(TAXA_ADICIONAL_PADRAO) : "0",
        taxa_plataforma: adicional ? ((dados.valor * TAXA_ADICIONAL_PADRAO) / 100).toFixed(2) : "0.00",
        acordo_previo: dados.acordoPrevio ?? null,
        enviado_por_id: 0,
        arquivo_url: "",
        criado_em: new Date().toISOString(),
      });
      locais.set(vagaId, lista);
      return;
    }
    const corpo = new FormData();
    corpo.append("tipo", dados.tipo);
    corpo.append("valor", dados.valor.toFixed(2));
    corpo.append("arquivo", dados.arquivo);
    if (dados.acordoPrevio) corpo.append("acordo_previo", dados.acordoPrevio);
    await chamar<Comprovante>(`/api/v1/vagas/${encodeURIComponent(vagaId)}/comprovantes`, {
      method: "POST",
      body: corpo,
    });
  },

  /** Abre o arquivo (rota autenticada) em outra aba. */
  abrirArquivo: async (url: string): Promise<void> => {
    const resposta = await fetchAutenticado(url);
    if (!resposta.ok) throw new ApiError(resposta.status, "arquivo", "Não foi possível abrir o arquivo.");
    const blob = await resposta.blob();
    window.open(URL.createObjectURL(blob), "_blank", "noopener");
  },
};
