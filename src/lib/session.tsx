"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { api, chamar } from "@/api/client";
import { ApiError } from "@/api/erro";
import { aoExpirarSessao, lerTokens, limparTokens, salvarTokens } from "@/api/tokens";
import type { RegistroEntrada, TipoPerfil, Usuario } from "@/api/tipos";

type Estado = "carregando" | "autenticado" | "anonimo";

type ContextoSessao = {
  estado: Estado;
  usuario: Usuario | null;
  entrar: (email: string, senha: string) => Promise<Usuario>;
  registrar: (dados: RegistroEntrada) => Promise<void>;
  sair: () => void;
  atualizar: () => Promise<Usuario | null>;
  trocarPerfil: (perfil: TipoPerfil) => Promise<void>;
};

const MAX_TENTATIVAS_DE_REDE = 5;
const ESPERA_ENTRE_TENTATIVAS_MS = 3000;

const SessaoContext = createContext<ContextoSessao | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [estado, setEstado] = useState<Estado>("carregando");
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const contaBloqueada = useRef<string | null>(null);
  const tentativasDeRede = useRef(0);

  const sair = useCallback(() => {
    limparTokens();
    setUsuario(null);
    setEstado("anonimo");
  }, []);

  const atualizar = useCallback(async () => {
    if (!lerTokens()) {
      setUsuario(null);
      setEstado("anonimo");
      return null;
    }
    try {
      const dados = await chamar(api.GET("/api/v1/auth/me"));
      tentativasDeRede.current = 0;
      setUsuario(dados);
      setEstado("autenticado");
      return dados;
    } catch (e) {
      const recusada = e instanceof ApiError && (e.status === 401 || e.status === 403);
      if (!recusada && tentativasDeRede.current < MAX_TENTATIVAS_DE_REDE) {
        // Rede fora do ar ou erro 5xx (por exemplo, o back acordando): mantém a sessão e tenta de novo.
        tentativasDeRede.current += 1;
        setTimeout(() => void atualizar(), ESPERA_ENTRE_TENTATIVAS_MS);
        return null;
      }
      contaBloqueada.current =
        e instanceof ApiError && (e.codigo === "conta_banida" || e.codigo === "conta_suspensa")
          ? e.codigo
          : null;
      sair();
      return null;
    }
  }, [sair]);

  useEffect(() => {
    void atualizar();
    return aoExpirarSessao(() => {
      setUsuario(null);
      setEstado("anonimo");
    });
  }, [atualizar]);

  const entrar = useCallback(
    async (email: string, senha: string) => {
      const par = await chamar(api.POST("/api/v1/auth/login", { body: { email, senha } }));
      salvarTokens({ access: par.access_token, refresh: par.refresh_token });
      contaBloqueada.current = null;
      const dados = await atualizar();
      if (!dados && contaBloqueada.current) {
        throw new ApiError(403, contaBloqueada.current, "Esta conta não pode entrar na plataforma.");
      }
      if (!dados) throw new Error("Não foi possível carregar a conta.");
      return dados;
    },
    [atualizar],
  );

  const registrar = useCallback(async (dados: RegistroEntrada) => {
    await chamar(api.POST("/api/v1/auth/registro", { body: dados }));
  }, []);

  const trocarPerfil = useCallback(async (perfil: TipoPerfil) => {
    const dados = await chamar(api.PUT("/api/v1/auth/perfil-ativo", { body: { perfil } }));
    setUsuario(dados);
  }, []);

  const valor = useMemo(
    () => ({ estado, usuario, entrar, registrar, sair, atualizar, trocarPerfil }),
    [estado, usuario, entrar, registrar, sair, atualizar, trocarPerfil],
  );

  return <SessaoContext.Provider value={valor}>{children}</SessaoContext.Provider>;
}

export function useSessao(): ContextoSessao {
  const ctx = useContext(SessaoContext);
  if (!ctx) throw new Error("useSessao deve ser usado dentro de SessionProvider.");
  return ctx;
}
