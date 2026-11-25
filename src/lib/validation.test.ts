import { describe, expect, it } from "vitest";
import { validateBirthDate, validateCNPJ, validateCPF } from "./validation";

describe("validateCPF", () => {
  it.each(["529.982.247-25", "52998224725"])("aceita CPF válido %s", (cpf) => {
    expect(validateCPF(cpf)).toBe(true);
  });

  it.each([
    ["dígito verificador errado", "529.982.247-24"],
    ["todos os dígitos iguais", "111.111.111-11"],
    ["menos de 11 dígitos", "5299822472"],
    ["mais de 11 dígitos", "529982247250"],
    ["vazio", ""],
    ["letras", "abcdefghijk"],
  ])("recusa CPF inválido: %s", (_descricao, cpf) => {
    expect(validateCPF(cpf)).toBe(false);
  });
});

describe("validateCNPJ", () => {
  it.each(["11.222.333/0001-81", "11222333000181"])("aceita CNPJ válido %s", (cnpj) => {
    expect(validateCNPJ(cnpj)).toBe(true);
  });

  it.each([
    ["dígito verificador errado", "11.222.333/0001-80"],
    ["todos os dígitos iguais", "00.000.000/0000-00"],
    ["menos de 14 dígitos", "1122233300018"],
    ["vazio", ""],
  ])("recusa CNPJ inválido: %s", (_descricao, cnpj) => {
    expect(validateCNPJ(cnpj)).toBe(false);
  });
});

function dataComIdade(anos: number, diasAMais = 0): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() - anos);
  d.setDate(d.getDate() + diasAMais);
  return d.toISOString().slice(0, 10);
}

describe("validateBirthDate", () => {
  it("recusa data vazia e data inválida", () => {
    expect(validateBirthDate("").valid).toBe(false);
    expect(validateBirthDate("não-é-data").valid).toBe(false);
  });

  it("valor limite: faz 18 anos hoje é aceito", () => {
    expect(validateBirthDate(dataComIdade(18)).valid).toBe(true);
  });

  // DEF-01: new Date("AAAA-MM-DD") é lido em UTC e comparado com getDate() local; no fuso de
  // Recife (UTC-3) a data de nascimento recua um dia, e quem faz 18 anos amanhã é aceito hoje.
  // O teste descreve o comportamento correto e está marcado como falha conhecida (it.fails);
  // quando o defeito for corrigido, ele passa a falhar e a marcação deve ser removida.
  it.fails("DEF-01: falta um dia para os 18 anos deveria ser recusado", () => {
    expect(validateBirthDate(dataComIdade(18, 1)).valid).toBe(false);
  });

  it("recusa menor de idade com a idade calculada na mensagem", () => {
    const resultado = validateBirthDate(dataComIdade(10));

    expect(resultado.valid).toBe(false);
    expect(resultado.age).toBe(10);
    expect(resultado.message).toContain("18 anos");
  });

  it("valor limite superior: 120 anos é aceito e mais de 120 é inconsistente", () => {
    expect(validateBirthDate(dataComIdade(120)).valid).toBe(true);
    expect(validateBirthDate(dataComIdade(121)).valid).toBe(false);
  });
});
