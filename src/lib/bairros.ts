/** Bairros de Recife com coordenadas de referência, usados no cadastro e ao criar vaga. */
export const BAIRROS = [
  { nome: "Boa Vista", latitude: -8.063, longitude: -34.876 },
  { nome: "Boa Viagem", latitude: -8.119, longitude: -34.904 },
  { nome: "Casa Forte", latitude: -8.036, longitude: -34.918 },
  { nome: "Derby", latitude: -8.054, longitude: -34.899 },
  { nome: "Espinheiro", latitude: -8.04, longitude: -34.896 },
  { nome: "Graças", latitude: -8.042, longitude: -34.898 },
  { nome: "Madalena", latitude: -8.052, longitude: -34.901 },
  { nome: "Torre", latitude: -8.048, longitude: -34.912 },
  { nome: "Várzea", latitude: -8.05, longitude: -34.95 },
];

export function mascaraCpf(valor: string): string {
  const d = valor.replace(/\D/g, "").slice(0, 11);
  return d
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1-$2");
}

export function mascaraCnpj(valor: string): string {
  const d = valor.replace(/\D/g, "").slice(0, 14);
  return d
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
}

export function mascaraTelefone(valor: string): string {
  const d = valor.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

/** Confere os dígitos verificadores do CPF. */
export function cpfValido(valor: string): boolean {
  const cpf = valor.replace(/\D/g, "");
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
  for (const tamanho of [9, 10]) {
    let soma = 0;
    for (let i = 0; i < tamanho; i++) soma += Number(cpf[i]) * (tamanho + 1 - i);
    if (((soma * 10) % 11) % 10 !== Number(cpf[tamanho])) return false;
  }
  return true;
}

/** Confere os dígitos verificadores do CNPJ. */
export function cnpjValido(valor: string): boolean {
  const cnpj = valor.replace(/\D/g, "");
  if (cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj)) return false;
  const pesos = [
    [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2],
    [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2],
  ];
  for (let n = 0; n < 2; n++) {
    const tamanho = 12 + n;
    let soma = 0;
    for (let i = 0; i < tamanho; i++) soma += Number(cnpj[i]) * pesos[n][i];
    const resto = soma % 11;
    const digito = resto < 2 ? 0 : 11 - resto;
    if (digito !== Number(cnpj[tamanho])) return false;
  }
  return true;
}
