# SAP B1 MCP Connector — Him Electronics

An MCP server that lets an AI agent (Claude) interact with SAP Business One
for **Him Electronics**, company database **`ZZZ_HPL_LIVE_29082026`**.

It exposes:

| Tool                       | Purpose                                                                 |
|-----------------------------|--------------------------------------------------------------------------|
| `sap-b1-get`                | Read any Service Layer resource (OData GET), e.g. `Items`, `OrderDetails`. |
| `sap-b1-post-transaction`   | Create a record. `BusinessPartners`/`Items` post LIVE; every other object type (Orders, Invoices, JournalEntries, ...) posts as a **Draft** for human review while `B1SL_POST_AS_DRAFT=true`. |
| `run-hana-sql`              | Run a read-only `SELECT` against the HANA schema for reporting/lookups. Only advertised when `HANA_ENABLED=true`. |

## Setup

```bash
cd sap-b1-mcp-connector
npm install
cp .env.example .env   # fill in real Service Layer (+ optional HANA) credentials
npm run build
```

**Never commit a filled-in `.env`.** `.env` is gitignored; only
`.env.example` (placeholders) belongs in the repo.

### Required — Service Layer connection

| Variable                        | Example                              | Notes |
|----------------------------------|---------------------------------------|-------|
| `B1SL_BASE_URL`                  | `https://<host>:50000/b1s/v1`         | Service Layer address + port, including `/b1s/v1`. |
| `B1_COMPANY_DB`                  | `ZZZ_HPL_LIVE_29082026`               | Exact Company DB name as shown on the SAP B1 login screen. |
| `B1_USERNAME` / `B1_PASSWORD`    | —                                      | Use a dedicated integration user scoped to only what's needed, not a personal login. |
| `B1SL_TLS_REJECT_UNAUTHORIZED`   | `false`                               | SAP B1 Service Layer is usually self-signed internally; set `true` only with a real CA-signed cert. |
| `B1SL_POST_AS_DRAFT`             | `true`                                | Safety switch — see below. |

### Optional — direct HANA SQL access

Only needed for read-only reporting/joins the Service Layer can't do
easily. Set `HANA_ENABLED=true` and provide `HANA_HOST`, `HANA_PORT`
(default `30015`), `HANA_USER`, `HANA_PASSWORD`, and `HANA_SCHEMA`
(same as `B1_COMPANY_DB` — SAP B1 on HANA uses the company DB as the
schema). Use a read-only/app-scoped DB user in production, not `SYSTEM`.

If the backend is MSSQL instead of HANA, this connector would need an
equivalent MSSQL client wired in — it supports one backend at a time.

## Registering with Claude

Add this server to your MCP client config (e.g. `claude_desktop_config.json`
or a Claude Code `mcp` config), pointing at the built entry point and
supplying the env vars above (from your local `.env`, or directly):

```json
{
  "mcpServers": {
    "sap-b1-him-electronics": {
      "command": "node",
      "args": ["/absolute/path/to/sap-b1-mcp-connector/dist/index.js"]
    }
  }
}
```

## Safety model

- The connector never deletes existing documents.
- While `B1SL_POST_AS_DRAFT=true` (default), anything beyond Business
  Partners/Items is posted as a **Draft** (`POST /Drafts` with the correct
  `DocObjectCode`), so a person in SAP B1 reviews and explicitly "Adds" it
  before it becomes a real, numbered document (Sales Order, Invoice, etc.).
  Set `B1SL_POST_AS_DRAFT=false` only once live posting has been explicitly
  approved for this connector.
- `run-hana-sql` rejects anything that isn't a `SELECT` statement, and the
  tool isn't even advertised unless `HANA_ENABLED=true`.

## Development

```bash
npm run dev     # run with tsx, no build step
npm run build   # compile TypeScript to dist/
```
