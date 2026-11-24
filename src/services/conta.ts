import { ApiError, erroDeResposta } from "@/api/erro";
import { fetchAutenticado } from "@/api/client";
import type { components } from "@/api/schema";

// Cadastro, verificação, comprovações e aprovações. Chamam sempre a API real.

export type PerfilProfissional = components["schemas"]["PerfilProfissionalDetalhe"];
export type PerfilContratante = components["schemas"]["PerfilContratanteDetalhe"];
export type StatusVerificacao = components["schemas"]["StatusVerificacao"];
export type Comprovacao = components["schemas"]["ComprovacaoDetalhe"];
export type ItemFila = components["schemas"]["ItemFilaAprovacao"];
export type CadastroProfissional = components["schemas"]["CadastroProfissionalEntrada"];
export type CadastroContratante = components["schemas"]["CadastroContratanteEntrada"];
export type AtualizacaoProfissional = components["schemas"]["AtualizacaoProfissionalEntrada"];
export type ArquivoEnviado = components["schemas"]["ArquivoEnviado"];
export type SegurancaCategoria = components["schemas"]["SegurancaDaCategoria"];

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
  if (resposta.status === 204) return undefined as T;
  return resposta.json() as Promise<T>;
}

const json = (metodo: string, corpo?: unknown): RequestInit => ({
  method: metodo,
  body: corpo === undefined ? undefined : JSON.stringify(corpo),
});

export const contaApi = {
  cadastrarProfissional: (corpo: CadastroProfissional) =>
    chamar<PerfilProfissional>("/api/v1/perfis/profissional", json("POST", corpo)),
  cadastrarContratante: (corpo: CadastroContratante) =>
    chamar<PerfilContratante>("/api/v1/perfis/contratante", json("POST", corpo)),
  obterPerfilProfissional: () => chamar<PerfilProfissional>("/api/v1/perfis/profissional/meu"),
  obterPerfilContratante: () => chamar<PerfilContratante>("/api/v1/perfis/contratante/meu"),
  atualizarPerfilProfissional: (corpo: AtualizacaoProfissional) =>
    chamar<PerfilProfissional>("/api/v1/perfis/profissional/meu", json("PATCH", corpo)),

  statusVerificacao: () => chamar<StatusVerificacao>("/api/v1/verificacao/status"),
  aceitarConsentimento: () =>
    chamar<StatusVerificacao>("/api/v1/verificacao/consentimento", json("POST")),
  enviarVerificacao: (documentoId: number, selfieId: number) =>
    chamar<StatusVerificacao>(
      "/api/v1/verificacao/envio",
      json("POST", { documento_arquivo_id: documentoId, selfie_arquivo_id: selfieId }),
    ),

  enviarArquivo: (tipo: "foto" | "selfie" | "documento" | "qualificacao" | "epi", arquivo: File) => {
    const dados = new FormData();
    dados.append("tipo", tipo);
    dados.append("arquivo", arquivo);
    return chamar<ArquivoEnviado>("/api/v1/arquivos", { method: "POST", body: dados });
  },

  listarComprovacoes: () => chamar<Comprovacao[]>("/api/v1/profissional/comprovacoes"),
  enviarExperiencia: (corpo: components["schemas"]["ExperienciaEntrada"]) =>
    chamar<Comprovacao>("/api/v1/profissional/experiencias", json("POST", corpo)),
  enviarQualificacao: (corpo: components["schemas"]["QualificacaoEntrada"]) =>
    chamar<Comprovacao>("/api/v1/profissional/qualificacoes", json("POST", corpo)),
  enviarEpi: (corpo: components["schemas"]["EpiEntrada"]) =>
    chamar<Comprovacao>("/api/v1/profissional/epis", json("POST", corpo)),
  segurancaDaCategoria: (slug: string) =>
    chamar<SegurancaCategoria>(`/api/v1/categorias/${encodeURIComponent(slug)}/seguranca`),

  obterTermos: () => chamar<{ versao_atual: string; aceito: boolean }>("/api/v1/termos"),
  aceitarTermos: (versao: string) =>
    chamar<{ versao_atual: string; aceito: boolean }>("/api/v1/termos/aceite", json("POST", { versao })),
  excluirConta: (senha: string) => chamar<void>("/api/v1/conta/exclusao", json("POST", { senha })),

  listarAprovacoes: (estado: "pendente" | "aprovado" | "recusado" = "pendente") =>
    chamar<ItemFila[]>(`/api/v1/admin/aprovacoes?estado=${estado}`),
  decidirAprovacao: (tipo: ItemFila["tipo"], id: number, decisao: "aprovar" | "recusar", motivo?: string) =>
    chamar<ItemFila>(`/api/v1/admin/aprovacoes/${tipo}/${id}/decisao`, json("POST", { decisao, motivo })),
};
