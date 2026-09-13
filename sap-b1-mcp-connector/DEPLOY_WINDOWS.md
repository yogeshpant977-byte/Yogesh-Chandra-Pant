# Deploying on the Windows Server (Him Electronics)

This connector needs to run on a machine that has network access to your
SAP B1 Service Layer / HANA host (`192.168.9.11`). Claude Code's cloud
session does **not** have that access — it cannot reach a private/internal
IP on your LAN. This is why deployment has to happen on your Windows
Server, not from here.

## 1. Prerequisites on the Windows Server

- **Node.js LTS** (18.x or 20.x) — https://nodejs.org
- **Git for Windows** — https://git-scm.com
- Network line-of-sight from this server to `192.168.9.11:50000` (Service
  Layer) and `192.168.9.11:30015` (HANA, if used)

Verify from PowerShell on that server:
```powershell
Test-NetConnection 192.168.9.11 -Port 50000
Test-NetConnection 192.168.9.11 -Port 30015   # only if using HANA
```
Both should show `TcpTestSucceeded : True` before continuing.

## 2. Run the deploy script

From an elevated PowerShell prompt on the Windows Server:

```powershell
git clone --branch claude/jolly-johnson-u3khlc `
  https://github.com/yogeshpant977-byte/Yogesh-Chandra-Pant.git C:\SAP-B1-Connector

cd C:\SAP-B1-Connector\sap-b1-mcp-connector\deploy
.\deploy-windows.ps1 -RepoUrl "https://github.com/yogeshpant977-byte/Yogesh-Chandra-Pant.git" `
  -Branch "claude/jolly-johnson-u3khlc" -InstallPath "C:\SAP-B1-Connector"
```

The script will open Notepad on `.env` so you can fill in the real values
(from your requirements doc):

```
B1SL_BASE_URL=https://192.168.9.11:50000/b1s/v1
B1_COMPANY_DB=ZZZ_HPL_LIVE_29082026
B1_USERNAME=manager
B1_PASSWORD=<real password>
B1SL_TLS_REJECT_UNAUTHORIZED=false
B1SL_POST_AS_DRAFT=true
HANA_ENABLED=true
HANA_HOST=192.168.9.11
HANA_PORT=30015
HANA_USER=SYSTEM
HANA_PASSWORD=<real password>
HANA_SCHEMA=ZZZ_HPL_LIVE_29082026
```

**Never commit this `.env` back to git.** It's already gitignored.

## 3. Smoke test

```powershell
cd C:\SAP-B1-Connector\sap-b1-mcp-connector
node dist\index.js
```
It should print:
```
SAP B1 MCP connector (Him Electronics / ZZZ_HPL_LIVE_29082026) running on stdio
```
and then wait (it speaks MCP over stdio — Ctrl+C to stop this manual test).

## 4. Wire it into Claude

If Claude Code/Desktop runs on this same Windows Server, add to its MCP
config:

```json
{
  "mcpServers": {
    "sap-b1-him-electronics": {
      "command": "node",
      "args": ["C:\\SAP-B1-Connector\\sap-b1-mcp-connector\\dist\\index.js"]
    }
  }
}
```

If Claude runs elsewhere (e.g. this cloud session) and needs to reach the
connector remotely, the stdio transport won't work across machines — that
needs either:
- Running Claude Code directly on this Windows Server, or
- Wrapping the connector with an HTTP/SSE MCP transport reachable from
  wherever Claude runs (an additional change, not in this build).

## 5. (Optional) Run as a Windows Service

For always-on availability, wrap it with [NSSM](https://nssm.cc/):

```powershell
nssm install SapB1MCPConnector "C:\Program Files\nodejs\node.exe" `
  "C:\SAP-B1-Connector\sap-b1-mcp-connector\dist\index.js"
nssm set SapB1MCPConnector AppDirectory "C:\SAP-B1-Connector\sap-b1-mcp-connector"
nssm start SapB1MCPConnector
```

## 6. Updating later

```powershell
cd C:\SAP-B1-Connector
git pull origin claude/jolly-johnson-u3khlc
cd sap-b1-mcp-connector
npm install
npm run build
# restart the service/process
```
