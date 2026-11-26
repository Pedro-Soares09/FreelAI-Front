import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

// Fuso dos usuários do sistema (Recife); deixa os testes de data independentes da máquina.
process.env.TZ = "America/Sao_Paulo";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      include: ["src/api/erro.ts", "src/lib/validation.ts", "src/app/login/page.tsx"],
      reporter: ["text", "json-summary"],
    },
  },
});
