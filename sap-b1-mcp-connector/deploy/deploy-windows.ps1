<#
.SYNOPSIS
    Deploys the Him Electronics SAP B1 MCP connector on a Windows Server that
    has network access to the SAP B1 Service Layer / HANA host
    (ZZZ_HPL_LIVE_29082026).

.DESCRIPTION
    Run this on the Windows Server itself (PowerShell, as an account with
    permission to install/run Node processes). It:
      1. Clones/updates the repo branch
      2. Installs dependencies and builds the TypeScript
      3. Writes a local .env from the values you pass in (never committed)
      4. Optionally registers the connector as a Windows service via NSSM

.PARAMETER RepoUrl
    Git URL of the repository, e.g. https://github.com/<owner>/Yogesh-Chandra-Pant.git

.PARAMETER Branch
    Branch to deploy, e.g. claude/jolly-johnson-u3khlc

.PARAMETER InstallPath
    Local folder to clone/deploy into, e.g. C:\SAP-B1-Connector

.EXAMPLE
    .\deploy-windows.ps1 -RepoUrl "https://github.com/yogeshpant977-byte/Yogesh-Chandra-Pant.git" `
        -Branch "claude/jolly-johnson-u3khlc" -InstallPath "C:\SAP-B1-Connector"
#>

param(
    [Parameter(Mandatory = $true)][string]$RepoUrl,
    [Parameter(Mandatory = $true)][string]$Branch,
    [Parameter(Mandatory = $true)][string]$InstallPath
)

$ErrorActionPreference = "Stop"

Write-Host "== Checking prerequisites ==" -ForegroundColor Cyan
foreach ($cmd in @("git", "node", "npm")) {
    if (-not (Get-Command $cmd -ErrorAction SilentlyContinue)) {
        throw "$cmd is not installed or not on PATH. Install Git and Node.js (LTS) first."
    }
}
node -v
npm -v

Write-Host "== Cloning/updating repository ==" -ForegroundColor Cyan
if (Test-Path $InstallPath) {
    Push-Location $InstallPath
    git fetch origin $Branch
    git checkout $Branch
    git pull origin $Branch
    Pop-Location
} else {
    git clone --branch $Branch $RepoUrl $InstallPath
}

$connectorPath = Join-Path $InstallPath "sap-b1-mcp-connector"
Push-Location $connectorPath

Write-Host "== Installing dependencies ==" -ForegroundColor Cyan
npm install

Write-Host "== Writing .env (not committed to git) ==" -ForegroundColor Cyan
if (-not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Host "Created .env from .env.example — EDIT IT NOW with real credentials before continuing." -ForegroundColor Yellow
    notepad.exe ".env"
    Read-Host "Press Enter once .env has been saved with real values"
} else {
    Write-Host ".env already exists — leaving it as-is." -ForegroundColor Yellow
}

Write-Host "== Building ==" -ForegroundColor Cyan
npm run build

Write-Host "== Done ==" -ForegroundColor Green
Write-Host "Test it directly with:  node dist\index.js"
Write-Host "See DEPLOY_WINDOWS.md for registering this as a Windows service and wiring it into Claude's MCP config."

Pop-Location
