import { z } from "zod";
import { runHanaQuery } from "../hanaClient.js";

export const queryHanaSchema = {
  name: "run-hana-sql",
  description:
    "Run a read-only SELECT query against the Him Electronics SAP B1 HANA schema " +
    "(ZZZ_HPL_LIVE_29082026). Use HANA syntax: double-quoted identifiers and LIMIT " +
    "instead of TOP, e.g. SELECT \"CardCode\", \"CardName\" FROM \"OCRD\" WHERE " +
    "\"CardType\"='C' LIMIT 10.",
  inputSchema: {
    type: "object" as const,
    properties: {
      sql: {
        type: "string",
        description: "A single read-only SELECT statement.",
      },
    },
    required: ["sql"],
  },
};

export async function handleQueryHana(args: { sql: string }) {
  const parsed = z.object({ sql: z.string().min(1) }).parse(args);
  const rows = await runHanaQuery(parsed.sql);
  return {
    content: [{ type: "text" as const, text: JSON.stringify(rows, null, 2) }],
  };
}
