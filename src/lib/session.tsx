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

const SessaoContext = createContext<ContextoSessao | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [estado, setEstado] = useState<Estado>("carregando");
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const contaBanida = useRef(false);

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
      setUsuario(dados);
      setEstado("autenticado");
      return dados;
    } catch (e) {
      contaBanida.current = e instanceof ApiError && e.codigo === "conta_banida";
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
      contaBanida.current = false;
      const dados = await atualizar();
      if (!dados && contaBanida.current) {
        throw new ApiError(403, "conta_banida", "Conta banida de forma permanente após duas penalidades por denúncias validadas. Não é possível entrar na plataforma.");
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
