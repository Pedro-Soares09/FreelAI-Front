export const SENHA_DEMO = "senha-segura-123";

// CPF valido e unico por chamada (digitos verificadores calculados).
export function cpfUnico(): string {
  const base: number[] = [];
  let semente = Date.now() + Math.floor(Math.random() * 1e6);
  for (let i = 0; i < 9; i++) {
    base.push(semente % 10);
    semente = Math.floor(semente / 10) + 7 * (i + 1);
  }
  if (base.every((d) => d === base[0])) base[8] = (base[8] + 1) % 10;
  const dv = (digs: number[]) => {
    const soma = digs.reduce((s, d, i) => s + d * (digs.length + 1 - i), 0);
    const r = (soma * 10) % 11;
    return r === 10 ? 0 : r;
  };
  const d1 = dv(base);
  const d2 = dv([...base, d1]);
  const n = [...base, d1, d2].join("");
  return `${n.slice(0, 3)}.${n.slice(3, 6)}.${n.slice(6, 9)}-${n.slice(9)}`;
}


// Inicio da vaga em um dia futuro sorteado (formato datetime-local). O dia varia para que as
// vagas dos testes nao entrem em conflito de agenda com os profissionais ja contratados.
export function amanhaAs9h(): string {
  const d = new Date();
  d.setDate(d.getDate() + 2 + Math.floor(Math.random() * 300));
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(8 + Math.floor(Math.random() * 9))}:00`;
}
