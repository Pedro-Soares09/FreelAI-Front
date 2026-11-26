import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/api/erro";
import LoginPage from "./page";

const replace = vi.fn();
const entrar = vi.fn();
let consulta = "";
let estado: "carregando" | "anonimo" | "autenticado" = "anonimo";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
  useSearchParams: () => new URLSearchParams(consulta),
}));
vi.mock("next/link", () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));
vi.mock("@/lib/session", () => ({
  useSessao: () => ({ estado, entrar }),
}));
vi.mock("@/components/conta/conta-bloqueada", () => ({
  ContaBloqueada: ({ tipo, email }: { tipo: string; email: string }) => (
    <div data-testid="conta-bloqueada">{`${tipo}:${email}`}</div>
  ),
}));

beforeEach(() => {
  replace.mockReset();
  entrar.mockReset();
  consulta = "";
  estado = "anonimo";
});

async function preencherEEnviar(email: string, senha: string) {
  const usuario = userEvent.setup();
  if (email) await usuario.type(screen.getByLabelText("E-mail"), email);
  if (senha) await usuario.type(screen.getByLabelText("Senha"), senha);
  await usuario.click(screen.getByRole("button", { name: "Entrar" }));
}

describe("Tela de login", () => {
  it("CT-LOG-03: campos vazios mostram as duas mensagens e não chamam a API", async () => {
    render(<LoginPage />);

    await preencherEEnviar("", "");

    expect(await screen.findByText("Informe o e-mail.")).toBeInTheDocument();
    expect(screen.getByText("Informe a senha.")).toBeInTheDocument();
    expect(entrar).not.toHaveBeenCalled();
  });

  it("CT-LOG-03: só a senha vazia mostra apenas a mensagem da senha", async () => {
    render(<LoginPage />);

    await preencherEEnviar("maria@example.com", "");

    expect(await screen.findByText("Informe a senha.")).toBeInTheDocument();
    expect(screen.queryByText("Informe o e-mail.")).not.toBeInTheDocument();
    expect(entrar).not.toHaveBeenCalled();
  });

  it("CT-LOG-02: resposta 401 mostra o alerta e permanece na tela", async () => {
    entrar.mockRejectedValue(
      new ApiError(401, "credenciais_invalidas", "E-mail ou senha inválidos."),
    );
    render(<LoginPage />);

    await preencherEEnviar("maria@example.com", "errada-123");

    expect(await screen.findByRole("alert")).toHaveTextContent("E-mail ou senha inválidos.");
    expect(replace).not.toHaveBeenCalled();
  });

  it("CT-LOG-01: sucesso envia o e-mail sem espaços e redireciona para /vagas", async () => {
    entrar.mockResolvedValue({ id: 1 });
    render(<LoginPage />);

    await preencherEEnviar("  maria@example.com  ", "senha-segura-123");

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/vagas"));
    expect(entrar).toHaveBeenCalledWith("maria@example.com", "senha-segura-123");
  });

  it.each([
    ["/chat/12", "/chat/12"],
    ["/vagas", "/vagas"],
    ["//evil.com", "/vagas"],
    ["https://evil.com", "/vagas"],
    ["", "/vagas"],
  ])("CT-LOG-01: parâmetro next=%j leva a %s", async (next, esperado) => {
    consulta = next ? `next=${encodeURIComponent(next)}` : "";
    entrar.mockResolvedValue({ id: 1 });
    render(<LoginPage />);

    await preencherEEnviar("maria@example.com", "senha-segura-123");

    await waitFor(() => expect(replace).toHaveBeenCalledWith(esperado));
  });

  it("sessão já autenticada redireciona sem mostrar erro", async () => {
    estado = "autenticado";
    consulta = "next=%2Fmatch";
    render(<LoginPage />);

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/match"));
  });

  it.each(["conta_suspensa", "conta_banida"] as const)(
    "conta bloqueada (%s) abre a tela de bloqueio",
    async (codigo) => {
      entrar.mockRejectedValue(new ApiError(403, codigo, "Conta bloqueada."));
      render(<LoginPage />);

      await preencherEEnviar("maria@example.com", "senha-segura-123");

      expect(await screen.findByTestId("conta-bloqueada")).toHaveTextContent(
        `${codigo}:maria@example.com`,
      );
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    },
  );

  it("erros de campo devolvidos pela API (422 em lista) aparecem no campo", async () => {
    entrar.mockRejectedValue(
      new ApiError(422, "validacao", "Há campos inválidos.", { email: "E-mail inválido." }),
    );
    render(<LoginPage />);

    await preencherEEnviar("x@y.z", "senha-segura-123");

    expect(await screen.findByText("E-mail inválido.")).toBeInTheDocument();
    fireEvent.submit(screen.getByRole("button", { name: "Entrar" }).closest("form")!);
  });
});
