# SAP B1 MCP Connector — Him Electronics

An MCP server that lets an AI agent (Claude) interact with SAP Business One
for **Him Electronics**, company database **`ZZZ_HPL_LIVE_29082026`**.

It exposes three tools:

| Tool                       | Purpose                                                                 |
|-----------------------------|--------------------------------------------------------------------------|
| `sap-b1-get`                | Read any Service Layer resource (OData GET), e.g. `Items`, `OrderDetails`. |
| `sap-b1-post-transaction`   | Create a record. `BusinessPartners` is posted LIVE; every other object type (Orders, Invoices, JournalEntries, ...) is posted as a **Draft** for human review, unless whitelisted in `SL_LIVE_OBJECT_TYPES`. |
| `run-hana-sql`              | Run a read-only `SELECT` against the HANA schema for reporting/lookups.  |

## Setup

```bash
cd sap-b1-mcp-connector
npm install
cp .env.example .env   # fill in real Service Layer + HANA credentials
npm run build
```

## Registering with Claude

Add this server to your MCP client config (e.g. `claude_desktop_config.json`
or a Claude Code `mcp` config), pointing at the built entry point:

```json
{
  "mcpServers": {
    "sap-b1-him-electronics": {
      "command": "node",
      "args": ["/absolute/path/to/sap-b1-mcp-connector/dist/index.js"],
      "env": {
        "SL_BASE_URL": "https://202.166.198.252:50000/b1s/v1",
        "SL_COMPANY_DB": "ZZZ_HPL_LIVE_29082026",
        "SL_USERNAME": "manager",
        "SL_PASSWORD": "***"
      }
    }
  }
}
```

## Safety model

- The connector never deletes or hard-updates existing documents.
- Anything beyond Business Partners is posted as a **Draft**
  (`POST /Drafts` with the correct `DocObjectCode`), so a person in SAP B1
  reviews and explicitly "Adds" it before it becomes a real, numbered
  document (Sales Order, Invoice, etc.).
- `run-hana-sql` rejects anything that isn't a `SELECT` statement.

## Development

```bash
npm run dev     # run with tsx, no build step
npm run build   # compile TypeScript to dist/
```
