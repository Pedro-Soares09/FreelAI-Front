import { describe, expect, it } from "vitest";
import { ApiError, erroDeResposta, mensagemDeErro } from "./erro";

describe("erroDeResposta", () => {
  it("CT-LOG-02: 401 com detail em objeto usa o codigo e a mensagem da API", () => {
    const erro = erroDeResposta(401, {
      detail: { codigo: "credenciais_invalidas", mensagem: "E-mail ou senha inválidos." },
    });

    expect(erro).toBeInstanceOf(ApiError);
    expect(erro.status).toBe(401);
    expect(erro.codigo).toBe("credenciais_invalidas");
    expect(erro.message).toBe("E-mail ou senha inválidos.");
  });

  it("422 com lista de validação mapeia cada campo e ignora o prefixo body", () => {
    const erro = erroDeResposta(422, {
      detail: [
        { loc: ["body", "email"], msg: "E-mail inválido." },
        { loc: ["body", "senha"], msg: "Senha curta." },
      ],
    });

    expect(erro.codigo).toBe("validacao");
    expect(erro.campos).toEqual({ email: "E-mail inválido.", senha: "Senha curta." });
    expect(erro.message).toBe("Há campos inválidos.");
  });

  it("detail em texto vira a mensagem e o codigo http_<status>", () => {
    const erro = erroDeResposta(400, { detail: "Algo deu errado." });

    expect(erro.codigo).toBe("http_400");
    expect(erro.message).toBe("Algo deu errado.");
  });

  it("detail em objeto sem mensagem usa a mensagem padrão do status", () => {
    const erro = erroDeResposta(403, { detail: { codigo: "perfil_ativo_incorreto" } });

    expect(erro.codigo).toBe("perfil_ativo_incorreto");
    expect(erro.message).toBe("Você não tem permissão para esta ação.");
  });

  it("status sem corpo usa a mensagem padrão e, se desconhecido, a genérica", () => {
    expect(erroDeResposta(500, undefined).message).toBe(
      "Erro interno. Tente novamente em instantes.",
    );
    expect(erroDeResposta(418, null).message).toBe("Erro inesperado.");
  });

  it("registra o comportamento atual para o envelope de validação do back (detail.erros)", () => {
    // O back responde 422 com detail { codigo, mensagem, erros: [{ field, message }] }.
    // O parser atual só lê campos de uma lista em detail, então os campos não são mapeados.
    const erro = erroDeResposta(422, {
      detail: {
        codigo: "erro_validacao",
        mensagem: "Erro de validação: senha - muito curta",
        erros: [{ field: "senha", message: "muito curta" }],
      },
    });

    expect(erro.codigo).toBe("erro_validacao");
    expect(erro.message).toBe("Erro de validação: senha - muito curta");
    expect(erro.campos).toEqual({});
  });
});

describe("mensagemDeErro", () => {
  it("devolve a mensagem de ApiError, de Error comum ou o texto genérico", () => {
    expect(mensagemDeErro(new ApiError(409, "x", "Conflito."))).toBe("Conflito.");
    expect(mensagemDeErro(new Error("falhou"))).toBe("falhou");
    expect(mensagemDeErro("texto")).toBe("Erro inesperado.");
  });
});
