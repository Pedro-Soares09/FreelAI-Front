import { expect, test, type Page } from "@playwright/test";
import { entrarComo } from "./apoio";

function amanhaAs9h(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(9, 0, 0, 0);
  const dois = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${dois(d.getMonth() + 1)}-${dois(d.getDate())}T${dois(d.getHours())}:${dois(d.getMinutes())}`;
}

async function preencherVaga(page: Page, categoria: string, titulo: string) {
  await page.goto("/criar-vaga");
  await page.getByLabel("Título").fill(titulo);
  await page.getByLabel("Categoria").selectOption({ label: categoria });
  await page.getByLabel("Descrição do serviço").fill("Serviço de teste automatizado, ambiente local.");
  await page.getByLabel("Valor (R$)").fill("150");
  await page.getByLabel("Duração (horas)").fill("2");
  await page.getByLabel("Início").fill(amanhaAs9h());
  await page.getByLabel("Bairro").selectOption({ label: "Boa Viagem" });
}

test.describe("Criar vaga", () => {
  test("CT-VAG-02: categoria de risco sem marcar o item crítico bloqueia a publicação", async ({
    page,
  }) => {
    await entrarComo(page, "maria@example.com");
    await preencherVaga(page, "Elétrica", `Troca de fiação ${Date.now()}`);
    await expect(page.getByRole("checkbox").first()).toBeVisible();

    await page.getByRole("button", { name: "Publicar vaga" }).click();

    await expect(
      page.getByText("Confirme os itens críticos de segurança para publicar."),
    ).toBeVisible();
    await expect(page).toHaveURL(/\/criar-vaga/);
  });

  test("CT-VAG-01: marcando os itens críticos a vaga é publicada", async ({ page }) => {
    await entrarComo(page, "maria@example.com");
    await preencherVaga(page, "Elétrica", `Troca de fiação ${Date.now()}`);
    const itens = page.getByRole("checkbox");
    await expect(itens.first()).toBeVisible();
    for (const item of await itens.all()) await item.check();

    await page.getByRole("button", { name: "Publicar vaga" }).click();

    await expect(page).not.toHaveURL(/\/criar-vaga/);
  });
});
