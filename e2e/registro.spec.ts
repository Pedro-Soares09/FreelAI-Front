import { expect, test } from "@playwright/test";
import { SENHA_DEMO } from "./apoio";

async function preencher(page: import("@playwright/test").Page, email: string, senha: string) {
  await page.goto("/registro");
  await page.getByLabel("Nome completo").fill("Pessoa de Teste");
  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel("Senha", { exact: true }).fill(senha);
  await page.getByLabel("Confirmar senha").fill(senha);
  await page.getByRole("button", { name: /Criar conta|Cadastrar|Registrar/ }).click();
}

test.describe("Registro", () => {
  test("CT-REG-01: conta nova com dados válidos é criada e entra na plataforma", async ({
    page,
  }) => {
    const email = `e2e.${Date.now()}@example.com`;

    await preencher(page, email, SENHA_DEMO);

    // Conta nova nasce pendente: o RouteGuard a leva para a verificação de identidade.
    await expect(page).toHaveURL(/\/(verificacao|cadastro)/);
  });

  test("CT-REG-02: senha com 7 caracteres é recusada antes do envio", async ({ page }) => {
    await preencher(page, `e2e.curta.${Date.now()}@example.com`, "1234567");

    await expect(page.getByText("A senha deve ter pelo menos 8 caracteres.")).toBeVisible();
    await expect(page).toHaveURL(/\/registro/);
  });

  test("CT-REG-04: e-mail inválido é recusado antes do envio", async ({ page }) => {
    await preencher(page, "isto-nao-e-email", SENHA_DEMO);

    await expect(page.getByText("Informe um e-mail válido.")).toBeVisible();
    await expect(page).toHaveURL(/\/registro/);
  });

  test("CT-REG-05: e-mail já cadastrado é recusado pela API", async ({ page }) => {
    await preencher(page, "maria@example.com", SENHA_DEMO);

    await expect(page.locator("main").getByRole("alert")).toBeVisible();
    await expect(page).toHaveURL(/\/registro/);
  });
});
