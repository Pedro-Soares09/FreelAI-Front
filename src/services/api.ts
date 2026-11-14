const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function apiRequest<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  if (!API_URL) {
    throw new Error("A variável NEXT_PUBLIC_API_URL não foi configurada.");
  }

  const response = await fetch(new URL(path, API_URL), init);

  if (!response.ok) {
    throw new Error(`A requisição falhou com status ${response.status}.`);
  }

  return (await response.json()) as T;
}
