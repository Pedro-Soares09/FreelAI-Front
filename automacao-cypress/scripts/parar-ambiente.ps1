# Encerra os processos que escutam nas portas 8000 e 3300.
foreach ($porta in 8000, 3300) {
  Get-NetTCPConnection -LocalPort $porta -State Listen -ErrorAction SilentlyContinue |
    ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }
}
Write-Host "Ambiente encerrado."
