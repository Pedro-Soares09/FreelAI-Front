"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { api, chamar } from "@/api/client";
import { ApiError } from "@/api/erro";
import {
  aoBloquearConta,
  aoExpirarSessao,
  lerTokens,
  limparTokens,
  salvarTokens,
  type BloqueioConta,
} from "@/api/tokens";
import type { RegistroEntrada, TipoPerfil, Usuario } from "@/api/tipos";

type Estado = "carregando" | "autenticado" | "anonimo" | "bloqueado";

type ContextoSessao = {
  estado: Estado;
  usuario: Usuario | null;
  bloqueio: BloqueioConta | null;
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
  const [bloqueio, setBloqueio] = useState<BloqueioConta | null>(null);

  const sair = useCallback(() => {
    limparTokens();
    setUsuario(null);
    setBloqueio(null);
    setEstado("anonimo");
  }, []);

  const atualizar = useCallback(async () => {
    if (!lerTokens()) {
      setUsuario(null);
      setBloqueio(null);
      setEstado("anonimo");
      return null;
    }
    try {
      const dados = await chamar(api.GET("/api/v1/auth/me"));
      setUsuario(dados);
      setBloqueio(null);
      setEstado("autenticado");
      return dados;
    } catch (erro) {
      if (
        erro instanceof ApiError &&
        erro.status === 403 &&
        (erro.codigo === "conta_suspensa" || erro.codigo === "conta_banida")
      ) {
        limparTokens();
        setUsuario(null);
        const retornoEm = erro.detalhes.retorno_em;
        setBloqueio({
          codigo: erro.codigo,
          mensagem: erro.message,
          ...(typeof retornoEm === "string" ? { retornoEm } : {}),
        });
        setEstado("bloqueado");
        return null;
      }
      sair();
      return null;
    }
  }, [sair]);

  useEffect(() => {
    void atualizar();
    const removerExpiracao = aoExpirarSessao(() => {
      setUsuario(null);
      setBloqueio(null);
      setEstado("anonimo");
    });
    const removerBloqueio = aoBloquearConta((contaBloqueada) => {
      setUsuario(null);
      setBloqueio(contaBloqueada);
      setEstado("bloqueado");
    });
    return () => {
      removerExpiracao();
      removerBloqueio();
    };
  }, [atualizar]);

  const entrar = useCallback(
    async (email: string, senha: string) => {
      const par = await chamar(api.POST("/api/v1/auth/login", { body: { email, senha } }));
      salvarTokens({ access: par.access_token, refresh: par.refresh_token });
      const dados = await atualizar();
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
    () => ({ estado, usuario, bloqueio, entrar, registrar, sair, atualizar, trocarPerfil }),
    [estado, usuario, bloqueio, entrar, registrar, sair, atualizar, trocarPerfil],
  );

  return <SessaoContext.Provider value={valor}>{children}</SessaoContext.Provider>;
}

export function useSessao(): ContextoSessao {
  const ctx = useContext(SessaoContext);
  if (!ctx) throw new Error("useSessao deve ser usado dentro de SessionProvider.");
  return ctx;
}
