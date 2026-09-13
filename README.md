# Him Electronics — SAP Business One Integration

This repository contains the SAP Business One (SAP B1) integration built for
**Him Electronics**, targeting the company database **`ZZZ_HPL_LIVE_29082026`**.

It has two parts:

1. **`sap-b1-mcp-connector/`** — an MCP (Model Context Protocol) server that
   lets an AI agent (Claude) query and post transactions against SAP B1,
   via the Service Layer (REST) and directly via SAP HANA SQL for reporting.
2. **`sap-b1-ui-addon/`** — a SAP Business One client UI Add-on (.NET / UI
   API) skeleton that runs inside the SAP B1 desktop client for
   Him Electronics-specific screens and menu items.

## Company / environment

| Setting          | Value                          |
|------------------|--------------------------------|
| Company DB       | `ZZZ_HPL_LIVE_29082026`        |
| Client           | Him Electronics                |
| Service Layer    | `https://<host>:50000/b1s/v1`  |
| HANA DB alias    | configured via `HANA_*` env vars |

No live credentials are checked into this repo. Copy `.env.example` to
`.env` in `sap-b1-mcp-connector/` and fill in real values before running.

See each subfolder's README for setup and usage details.
