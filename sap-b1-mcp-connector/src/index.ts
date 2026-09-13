import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { getEntitySchema, handleGetEntity } from "./tools/getEntity.js";
import { postTransactionSchema, handlePostTransaction } from "./tools/postTransaction.js";
import { queryHanaSchema, handleQueryHana } from "./tools/queryHana.js";
import { config } from "./config.js";

const server = new Server(
  { name: "sap-b1-him-electronics", version: "0.1.0" },
  { capabilities: { tools: {} } }
);

// HANA direct-SQL access is optional (HANA_ENABLED=true) — only advertise
// the tool when it has actually been configured.
const tools = [getEntitySchema, postTransactionSchema, ...(config.hana.enabled ? [queryHanaSchema] : [])];

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case getEntitySchema.name:
        return await handleGetEntity(args as { path: string });
      case postTransactionSchema.name:
        return await handlePostTransaction(args as { objectType: string; body: Record<string, unknown> });
      case queryHanaSchema.name:
        if (!config.hana.enabled) {
          throw new Error("HANA access is disabled (set HANA_ENABLED=true to enable run-hana-sql).");
        }
        return await handleQueryHana(args as { sql: string });
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (err) {
    return {
      isError: true,
      content: [{ type: "text" as const, text: err instanceof Error ? err.message : String(err) }],
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("SAP B1 MCP connector (Him Electronics / ZZZ_HPL_LIVE_29082026) running on stdio");
}

main().catch((err) => {
  console.error("Fatal error starting SAP B1 MCP connector:", err);
  process.exit(1);
});
