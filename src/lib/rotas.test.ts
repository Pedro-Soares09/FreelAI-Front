import { describe, expect, it } from "vitest";
import type { Usuario } from "@/api/tipos";
import { caminhoLivre, itensDeNavegacao, verificarAcesso } from "./rotas";

function usuario(perfil: "contratante" | "profissional"): Usuario {
  return { id: 1, nome: "Teste", email: "t@example.com", estado: "ativa", papel: "usuario", perfil_ativo: perfil } as unknown as Usuario;
}

describe("rotas", () => {
  it("o Plano Pro aparece so no menu do profissional", () => {
    expect(itensDeNavegacao(usuario("profissional")).some((i) => i.href === "/plano-pro")).toBe(true);
    expect(itensDeNavegacao(usuario("contratante")).some((i) => i.href === "/plano-pro")).toBe(false);
  });

  it("contratante nao acessa /plano-pro e profissional acessa", () => {
    expect(verificarAcesso("/plano-pro", usuario("contratante")).permitido).toBe(false);
    expect(verificarAcesso("/plano-pro", usuario("profissional")).permitido).toBe(true);
  });

  it("apenas a vaga de demonstracao do pagamento e livre", () => {
    expect(caminhoLivre("/pagamento/vaga-105")).toBe(true);
    expect(caminhoLivre("/pagamento/42")).toBe(false);
  });
});
