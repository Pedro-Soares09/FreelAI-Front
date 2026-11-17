import { NextResponse, type NextRequest } from "next/server";

const COOKIE_SESSAO = "freelai-sessao";

/**
 * Evita renderizar a área autenticada para quem nunca entrou.
 * O cookie é apenas um indicador de presença; a validação real é do back e do guard no cliente.
 */
export function middleware(request: NextRequest) {
  if (request.cookies.get(COOKIE_SESSAO)?.value === "1") return NextResponse.next();

  const destino = request.nextUrl.clone();
  destino.pathname = "/login";
  destino.search = `?next=${encodeURIComponent(request.nextUrl.pathname)}`;
  return NextResponse.redirect(destino);
}

export const config = {
  matcher: [
    "/chat/:path*",
    "/criar-vaga/:path*",
    "/match/:path*",
    "/pagamento/:path*",
    "/perfil/:path*",
    "/plano-pro/:path*",
    "/politica/:path*",
    "/vagas/:path*",
    "/admin/:path*",
  ],
};
