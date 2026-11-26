/** Erro padronizado da API: `detail` com `codigo` e `mensagem`, ou lista de validação (422). */
export class ApiError extends Error {
  readonly status: number;
  readonly codigo: string;
  readonly campos: Record<string, string>;
  readonly detalhes: Record<string, unknown>;

  constructor(
    status: number,
    codigo: string,
    mensagem: string,
    campos: Record<string, string> = {},
    detalhes: Record<string, unknown> = {},
  ) {
    super(mensagem);
    this.name = "ApiError";
    this.status = status;
    this.codigo = codigo;
    this.campos = campos;
    this.detalhes = detalhes;
  }
}

type Validacao = { loc?: Array<string | number>; msg?: string };

const MENSAGENS_PADRAO: Record<number, string> = {
  400: "Requisição inválida.",
  401: "Sessão expirada. Entre novamente.",
  403: "Você não tem permissão para esta ação.",
  404: "Recurso não encontrado.",
  409: "Esta ação conflita com o estado atual.",
  422: "Há campos inválidos.",
  429: "Muitas tentativas. Aguarde um instante.",
  500: "Erro interno. Tente novamente em instantes.",
};

export function erroDeResposta(status: number, corpo: unknown): ApiError {
  const detail =
    typeof corpo === "object" && corpo !== null && "detail" in corpo
      ? (corpo as { detail: unknown }).detail
      : undefined;

  if (Array.isArray(detail)) {
    const campos: Record<string, string> = {};
    for (const item of detail as Validacao[]) {
      const campo = item.loc?.filter((p) => p !== "body").join(".") ?? "";
      if (campo && item.msg) campos[campo] = item.msg;
    }
    return new ApiError(status, "validacao", MENSAGENS_PADRAO[422], campos);
  }

  if (typeof detail === "object" && detail !== null) {
    const d = detail as Record<string, unknown> & { codigo?: string; mensagem?: string };
    return new ApiError(
      status,
      typeof d.codigo === "string" ? d.codigo : `http_${status}`,
      typeof d.mensagem === "string"
        ? d.mensagem
        : MENSAGENS_PADRAO[status] ?? "Erro inesperado.",
      {},
      d,
    );
  }

  if (typeof detail === "string") {
    return new ApiError(status, `http_${status}`, detail);
  }

  return new ApiError(status, `http_${status}`, MENSAGENS_PADRAO[status] ?? "Erro inesperado.");
}

export function mensagemDeErro(e: unknown): string {
  if (e instanceof ApiError) return e.message;
  if (e instanceof Error) return e.message;
  return "Erro inesperado.";
}
