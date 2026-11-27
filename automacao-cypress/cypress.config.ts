import { spawnSync } from "node:child_process";
import { join, resolve } from "node:path";
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
    setupNodeEvents(on) {
      on("task", {
        // Adianta o fim do servico de uma vaga no banco de teste (script do back, so para demo).
        avancarServico({ vagaId }: { vagaId: string }) {
          const back = resolve(process.env.BACK_DIR ?? "../../FreelAI-Back");
          const python = process.env.BACK_PYTHON ?? join(back, ".venv", "Scripts", "python.exe");
          const r = spawnSync(python, ["scripts/avancar_servico.py", vagaId, "--arquivo", "e2e.db"], {
            cwd: back,
            encoding: "utf-8",
          });
          if (r.status !== 0) throw new Error(`avancar_servico falhou: ${r.stderr || r.stdout}`);
          return r.stdout;
        },
      });
    },
  },
});
