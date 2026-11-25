import { expect, type Page } from "@playwright/test";

export const SENHA_DEMO = "senha-segura-123";

export async function entrar(page: Page, email: string, senha = SENHA_DEMO) {
  await page.goto("/login");
  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel("Senha", { exact: true }).fill(senha);
  await page.getByRole("button", { name: "Entrar" }).click();
}

export async function entrarComo(page: Page, email: string) {
  await entrar(page, email);
  await expect(page).toHaveURL(/\/vagas/);
}
