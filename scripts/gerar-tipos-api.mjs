import { existsSync, copyFileSync, mkdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { resolve } from "node:path";

const candidatos = [
  process.env.OPENAPI_PATH,
  resolve("..", "FreelAI-Back", "contracts", "openapi.json"),
  resolve("contracts", "openapi.json"),
].filter(Boolean);

const origem = candidatos.find((c) => existsSync(c));
if (!origem) {
  console.error("Contrato openapi.json não encontrado. Defina OPENAPI_PATH.");
  process.exit(1);
}

mkdirSync("contracts", { recursive: true });
const destino = resolve("contracts", "openapi.json");
const destinoRelativo = "contracts/openapi.json";
if (resolve(origem) !== destino) copyFileSync(origem, destino);

const bin = "node_modules/openapi-typescript/bin/cli.js";
execFileSync(process.execPath, [bin, destinoRelativo, "-o", "src/api/schema.d.ts"], {
  stdio: "inherit",
});
console.log("Tipos gerados em src/api/schema.d.ts");
