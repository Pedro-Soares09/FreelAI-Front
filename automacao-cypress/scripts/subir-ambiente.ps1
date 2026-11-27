# Recria o banco de teste e sobe API (8000) e front de producao (3300).
# Uso: .\scripts\subir-ambiente.ps1 [-Back "caminho\FreelAI-Back"] [-Front "caminho\FreelAI-Front"]
param(
  [string]$Back = (Join-Path $PSScriptRoot "..\..\..\FreelAI-Back"),
  [string]$Front = (Join-Path $PSScriptRoot "..\..")
)
$ErrorActionPreference = "Stop"
$Back = (Resolve-Path $Back).Path
$Front = (Resolve-Path $Front).Path
$py = Join-Path $Back ".venv\Scripts\python.exe"
$saida = Join-Path $env:TEMP "freelai-e2e"
New-Item -ItemType Directory -Force $saida | Out-Null

# 1) API com banco limpo (apaga e recria e2e.db, semeia as contas de demonstracao)
Start-Process -FilePath $py -WorkingDirectory $Back `
  -ArgumentList "scripts\preparar_demo.py","--arquivo","e2e.db","--servir" `
  -RedirectStandardOutput (Join-Path $saida "back.log") -RedirectStandardError (Join-Path $saida "back.err") -WindowStyle Hidden

# 2) Front de producao apontando para a API real
$env:NEXT_PUBLIC_USE_MOCKS = "false"
$env:NEXT_PUBLIC_MODO_DEMO = "true"
$env:NEXT_PUBLIC_API_URL = "http://localhost:8000"
$env:NEXT_PUBLIC_APP_URL = "http://localhost:3300"
Push-Location $Front
if (Test-Path ".next") { Remove-Item -Recurse -Force ".next" }
npm run build
Pop-Location
Start-Process -FilePath "npm.cmd" -WorkingDirectory $Front -ArgumentList "start","--","-p","3300" `
  -RedirectStandardOutput (Join-Path $saida "front.log") -RedirectStandardError (Join-Path $saida "front.err") -WindowStyle Hidden

# 3) Espera os dois responderem
function Esperar($url) {
  for ($i = 0; $i -lt 180; $i++) {
    try { Invoke-WebRequest -UseBasicParsing $url -TimeoutSec 2 | Out-Null; return } catch { Start-Sleep 2 }
  }
  throw "Nao respondeu: $url"
}
Esperar "http://127.0.0.1:8000/health"
Esperar "http://127.0.0.1:3300/login"
Write-Host "Ambiente pronto: API 8000, front 3300 (logs em $saida)"
