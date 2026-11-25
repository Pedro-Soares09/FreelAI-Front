import { expect, test } from "@playwright/test";
import { entrar, SENHA_DEMO } from "./apoio";

test.describe("Login", () => {
  test("CT-LOG-01: login com sucesso leva a Maria para /vagas", async ({ page }) => {
    await entrar(page, "maria@example.com");

    await expect(page).toHaveURL(/\/vagas/);
  });

  test("CT-LOG-02: senha errada mostra o alerta e permanece em /login", async ({ page }) => {
    await entrar(page, "maria@example.com", "senha-errada-123");

    await expect(
      page.getByRole("alert").filter({ hasText: "E-mail ou senha inválidos." }),
    ).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });

  test("CT-LOG-03: campos vazios mostram as duas mensagens de validação", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: "Entrar" }).click();

    await expect(page.getByText("Informe o e-mail.")).toBeVisible();
    await expect(page.getByText("Informe a senha.")).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });

  test("CT-LOG-04: e-mail inexistente recebe a mesma mensagem da senha errada", async ({ page }) => {
    await entrar(page, "ninguem@example.com", SENHA_DEMO);

    await expect(
      page.getByRole("alert").filter({ hasText: "E-mail ou senha inválidos." }),
    ).toBeVisible();
  });

  test("CT-LOG-01: o parâmetro next interno é respeitado após o login", async ({
    page,
  }) => {
    await page.goto("/login?next=%2Fcriar-vaga");
    await page.getByLabel("E-mail").fill("maria@example.com");
    await page.getByLabel("Senha", { exact: true }).fill(SENHA_DEMO);
    await page.getByRole("button", { name: "Entrar" }).click();
    await expect(page).toHaveURL(/\/criar-vaga/);
  });
});
