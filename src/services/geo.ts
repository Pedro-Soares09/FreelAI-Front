import { BAIRROS } from "@/lib/bairros";

/**
 * Integrações com APIs abertas (OpenStreetMap/Nominatim, OSRM, BrasilAPI, ViaCEP e Open-Meteo).
 * Regras: só coordenadas, CEP, CNPJ ou texto de endereço saem do navegador (nunca dados da conta),
 * cada chamada tem prazo curto e toda função devolve `null` ou um valor local quando a API falha,
 * para que a tela nunca dependa delas.
 */

export type Coordenada = { lat: number; lng: number };
export type EnderecoEncontrado = {
  rotulo: string;
  coords: Coordenada;
  bairro?: string;
  logradouro?: string;
};

const PRAZO_MS = 6000;
const RECIFE: Coordenada = { lat: -8.0476, lng: -34.877 };
// Caixa aproximada da região metropolitana do Recife, para orientar a busca por endereço.
const CAIXA_RECIFE = "-35.15,-7.85,-34.75,-8.25";

async function obterJson<T>(url: string): Promise<T | null> {
  const controle = new AbortController();
  const timer = setTimeout(() => controle.abort(), PRAZO_MS);
  try {
    const resposta = await fetch(url, { signal: controle.signal, headers: { Accept: "application/json" } });
    if (!resposta.ok) return null;
    return (await resposta.json()) as T;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

// O Nominatim público permite no máximo 1 requisição por segundo: as chamadas entram em fila.
let filaNominatim: Promise<unknown> = Promise.resolve();
let ultimaNominatim = 0;
const INTERVALO_NOMINATIM_MS = 1100;

function nominatim<T>(caminho: string): Promise<T | null> {
  const execucao = filaNominatim.then(async () => {
    const espera = ultimaNominatim + INTERVALO_NOMINATIM_MS - Date.now();
    if (espera > 0) await new Promise((r) => setTimeout(r, espera));
    ultimaNominatim = Date.now();
    return obterJson<T>(`https://nominatim.openstreetmap.org/${caminho}`);
  });
  filaNominatim = execucao.catch(() => null);
  return execucao;
}

export function distanciaKm(a: Coordenada, b: Coordenada): number {
  const rad = (g: number) => (g * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

/** Bairro da lista da plataforma cujo ponto de referência está mais perto da coordenada. */
export function bairroMaisProximo(coords: Coordenada): string {
  let melhor = BAIRROS[0];
  let menor = Infinity;
  for (const b of BAIRROS) {
    const d = distanciaKm(coords, { lat: b.latitude, lng: b.longitude });
    if (d < menor) {
      menor = d;
      melhor = b;
    }
  }
  return melhor.nome;
}

export function centroDoBairro(nome: string): Coordenada {
  const b = BAIRROS.find((x) => x.nome === nome);
  return b ? { lat: b.latitude, lng: b.longitude } : RECIFE;
}

const semAcento = (t: string) => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export function bairroDaLista(nome?: string): string | undefined {
  if (!nome) return undefined;
  return BAIRROS.find((b) => semAcento(b.nome) === semAcento(nome))?.nome;
}

type RespostaNominatim = {
  display_name: string;
  lat: string;
  lon: string;
  address?: Record<string, string>;
};

function paraEndereco(r: RespostaNominatim): EnderecoEncontrado {
  const a = r.address ?? {};
  const via = [a.road, a.house_number].filter(Boolean).join(", ");
  const coords = { lat: Number(r.lat), lng: Number(r.lon) };
  return {
    rotulo: r.display_name,
    coords,
    bairro: bairroDaLista(a.suburb ?? a.neighbourhood ?? a.city_district) ?? bairroMaisProximo(coords),
    logradouro: via || undefined,
  };
}

/** Busca de endereço por texto no Recife (OpenStreetMap/Nominatim). */
export async function buscarEndereco(texto: string): Promise<EnderecoEncontrado[]> {
  const termo = texto.trim();
  if (termo.length < 3) return [];
  const q = new URLSearchParams({
    q: termo,
    format: "jsonv2",
    addressdetails: "1",
    countrycodes: "br",
    viewbox: CAIXA_RECIFE,
    bounded: "1",
    limit: "5",
    "accept-language": "pt-BR",
  });
  const lista = await nominatim<RespostaNominatim[]>(`search?${q.toString()}`);
  return (lista ?? []).map(paraEndereco);
}

/** Endereço aproximado de uma coordenada (geocodificação reversa). */
export async function enderecoDaCoordenada(coords: Coordenada): Promise<EnderecoEncontrado | null> {
  const q = new URLSearchParams({
    lat: String(coords.lat),
    lon: String(coords.lng),
    format: "jsonv2",
    addressdetails: "1",
    zoom: "18",
    "accept-language": "pt-BR",
  });
  const r = await nominatim<RespostaNominatim>(`reverse?${q.toString()}`);
  if (!r || !r.lat) return null;
  const encontrado = paraEndereco(r);
  // Mantém o ponto escolhido pela pessoa, não o do prédio mais próximo.
  return { ...encontrado, coords };
}

export type ResultadoCep = {
  cep: string;
  logradouro: string;
  bairro: string;
  cidade: string;
  coords?: Coordenada;
};

/** Consulta de CEP pela BrasilAPI, com ViaCEP como reserva. */
export async function consultarCep(valor: string): Promise<ResultadoCep | null> {
  const cep = valor.replace(/\D/g, "");
  if (cep.length !== 8) return null;
  const brasil = await obterJson<{
    cep: string;
    street?: string;
    neighborhood?: string;
    city?: string;
    location?: { coordinates?: { latitude?: string; longitude?: string } };
  }>(`https://brasilapi.com.br/api/cep/v2/${cep}`);
  if (brasil) {
    const lat = Number(brasil.location?.coordinates?.latitude);
    const lng = Number(brasil.location?.coordinates?.longitude);
    return {
      cep,
      logradouro: brasil.street ?? "",
      bairro: brasil.neighborhood ?? "",
      cidade: brasil.city ?? "",
      coords: Number.isFinite(lat) && Number.isFinite(lng) && lat !== 0 ? { lat, lng } : undefined,
    };
  }
  const via = await obterJson<{ erro?: boolean; logradouro?: string; bairro?: string; localidade?: string }>(
    `https://viacep.com.br/ws/${cep}/json/`,
  );
  if (!via || via.erro) return null;
  return { cep, logradouro: via.logradouro ?? "", bairro: via.bairro ?? "", cidade: via.localidade ?? "" };
}

export type ResultadoCnpj = { razaoSocial: string; situacao: string; ativa: boolean };

/** Dados públicos do CNPJ (BrasilAPI). Só o número do documento é enviado. */
export async function consultarCnpj(valor: string): Promise<ResultadoCnpj | null> {
  const cnpj = valor.replace(/\D/g, "");
  if (cnpj.length !== 14) return null;
  const r = await obterJson<{ razao_social?: string; descricao_situacao_cadastral?: string }>(
    `https://brasilapi.com.br/api/cnpj/v1/${cnpj}`,
  );
  if (!r || !r.razao_social) return null;
  const situacao = r.descricao_situacao_cadastral ?? "Situação não informada";
  return { razaoSocial: r.razao_social, situacao, ativa: semAcento(situacao) === "ativa" };
}

export type Deslocamento = { minutos: number; km: number; origem: "rota" | "linha_reta" };

/** Tempo e distância de carro pelo OSRM público; sem resposta, cai para a linha reta. */
export async function calcularDeslocamento(de: Coordenada, para: Coordenada): Promise<Deslocamento> {
  const r = await obterJson<{ code?: string; routes?: { duration: number; distance: number }[] }>(
    `https://router.project-osrm.org/route/v1/driving/${de.lng},${de.lat};${para.lng},${para.lat}?overview=false`,
  );
  const rota = r?.code === "Ok" ? r.routes?.[0] : undefined;
  if (rota) {
    return { minutos: Math.max(1, Math.round(rota.duration / 60)), km: rota.distance / 1000, origem: "rota" };
  }
  const km = distanciaKm(de, para);
  return { minutos: Math.max(1, Math.round((km / 25) * 60)), km, origem: "linha_reta" };
}

const CATEGORIAS_EXTERNAS = /jardin|pintur|fachada|telhado|quintal|calcad/;

/** Serviços feitos ao ar livre, em que a chuva importa. */
export function servicoExterno(categoria: string, titulo = ""): boolean {
  return CATEGORIAS_EXTERNAS.test(semAcento(`${categoria} ${titulo}`));
}

export type PrevisaoChuva = { probabilidade: number; milimetros: number; chuva: boolean };

/** Chance de chuva na hora do serviço (Open-Meteo, sem chave). Falha em silêncio. */
export async function previsaoDeChuva(local: Coordenada, inicioIso: string): Promise<PrevisaoChuva | null> {
  const inicio = new Date(inicioIso);
  if (Number.isNaN(inicio.getTime())) return null;
  const dias = (inicio.getTime() - Date.now()) / 86_400_000;
  if (dias < -0.5 || dias > 15) return null;
  const q = new URLSearchParams({
    latitude: local.lat.toFixed(4),
    longitude: local.lng.toFixed(4),
    hourly: "precipitation_probability,precipitation",
    timezone: "America/Recife",
    forecast_days: "16",
  });
  const r = await obterJson<{
    hourly?: { time: string[]; precipitation_probability: number[]; precipitation: number[] };
  }>(`https://api.open-meteo.com/v1/forecast?${q.toString()}`);
  if (!r?.hourly) return null;
  // Os horários vêm no fuso do Recife (UTC-3), sem sufixo.
  const alvo = new Date(inicio.getTime() - 3 * 3_600_000).toISOString().slice(0, 13);
  const indice = r.hourly.time.findIndex((t) => t.startsWith(alvo));
  if (indice < 0) return null;
  const probabilidade = r.hourly.precipitation_probability[indice] ?? 0;
  const milimetros = r.hourly.precipitation[indice] ?? 0;
  return { probabilidade, milimetros, chuva: probabilidade >= 50 || milimetros >= 1 };
}
