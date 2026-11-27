import { defineConfig } from "cypress";

// Requer back (8000) e front de producao (3300) no ar: ver README.md.
export default defineConfig({
  e2e: {
    baseUrl: process.env.E2E_BASE_URL ?? "http://localhost:3300",
    viewportWidth: 1440,
    viewportHeight: 900,
    video: false,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    retries: 0,
    supportFile: "cypress/support/e2e.ts",
    specPattern: "cypress/e2e/**/*.cy.ts",
  },
});
