import { defineConfig } from "@playwright/test";

// Não sobe servidores: o back e o front precisam estar no ar (ver README-testes.md).
export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  reporter: [["list"]],
  outputDir: "test-results",
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:3300",
    // Usa o Chrome instalado; troque por "chromium" se o navegador do Playwright estiver instalado.
    channel: process.env.E2E_CANAL ?? "chrome",
    viewport: { width: 1440, height: 900 },
    screenshot: "on",
    trace: "retain-on-failure",
  },
});
