/**
 * Modo de execução do app, decidido em um único lugar.
 *
 * As variáveis NEXT_PUBLIC_* são gravadas no momento do build e precisam ser lidas pela forma
 * literal `process.env.NEXT_PUBLIC_X` para o Next.js substituí-las.
 *
 * - USE_MOCKS: dados de apoio locais. Verdadeiro só com NEXT_PUBLIC_USE_MOCKS=true; sem a variável,
 *   vale no desenvolvimento local e NÃO em build de produção (o padrão da produção é a API real).
 * - MODO_DEMO: recursos de demonstração (simular Pix, simular posição no check-in).
 */
const VARIAVEL_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS;

export const USE_MOCKS: boolean =
  VARIAVEL_MOCKS === "true" ||
  (VARIAVEL_MOCKS === undefined && process.env.NODE_ENV !== "production");

export const MODO_DEMO: boolean = process.env.NEXT_PUBLIC_MODO_DEMO === "true";

/** Build de produção rodando com dados simulados: o app mostra um aviso permanente. */
export const MOCKS_EM_PRODUCAO: boolean = USE_MOCKS && process.env.NODE_ENV === "production";
