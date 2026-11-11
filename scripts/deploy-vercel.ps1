# Déploiement MarketPulse sur Vercel.
# Prérequis : compte Vercel, navigateur pour la connexion.

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot\..

Write-Host "1) Connexion Vercel..."
npx vercel login

Write-Host "2) Déploiement production..."
npx vercel --prod --yes

Write-Host "Copie l'URL https://….vercel.app dans docs/DEMO-VALIDATION.md"
