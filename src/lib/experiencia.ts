/** Normaliza para comparar categoria de vaga com categoria de experiência. */
export function normalizarCategoria(valor: string): string {
  return valor
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function categoriaCompativel(categoriaDaVaga: string, experiencias: string[]): boolean {
  const alvo = normalizarCategoria(categoriaDaVaga);
  return experiencias.some((e) => {
    const exp = normalizarCategoria(e);
    return exp === alvo || alvo.includes(exp) || exp.includes(alvo);
  });
}
