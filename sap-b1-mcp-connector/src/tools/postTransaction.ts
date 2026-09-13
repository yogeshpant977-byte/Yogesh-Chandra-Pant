import { z } from "zod";
import { serviceLayerClient } from "../serviceLayerClient.js";
import { config } from "../config.js";

/**
 * Maps a Service Layer resource name to its numeric DocObjectCode, needed
 * when posting through the /Drafts endpoint. Extend as new object types
 * are supported.
 */
const DOC_OBJECT_CODES: Record<string, number> = {
  Orders: 17,
  Invoices: 13, // A/R Invoice
  DeliveryNotes: 15,
  Quotations: 23,
  PurchaseOrders: 22,
  PurchaseInvoices: 18, // A/P Invoice
  IncomingPayments: 46, // via /Drafts not typical, kept for completeness
  JournalEntries: 30,
};

export const postTransactionSchema = {
  name: "sap-b1-post-transaction",
  description:
    "Create a record in SAP B1 (company DB ZZZ_HPL_LIVE_29082026, Him Electronics) " +
    "via the Service Layer. BusinessPartners are created LIVE by default. " +
    "Every other object type (Orders, Invoices, DeliveryNotes, Quotations, " +
    "PurchaseOrders, PurchaseInvoices, JournalEntries, ...) is posted as a " +
    "DRAFT (/Drafts) so a human reviews and adds it in SAP B1 before it " +
    "becomes a real document. Pass objectType exactly as the Service Layer " +
    "entity name and body as the JSON payload for that entity.",
  inputSchema: {
    type: "object" as const,
    properties: {
      objectType: {
        type: "string",
        description:
          "Service Layer entity name, e.g. BusinessPartners, Orders, Invoices, JournalEntries.",
      },
      body: {
        type: "object",
        description: "JSON payload matching the Service Layer schema for objectType.",
      },
    },
    required: ["objectType", "body"],
  },
};

export async function handlePostTransaction(args: { objectType: string; body: Record<string, unknown> }) {
  const parsed = z
    .object({ objectType: z.string().min(1), body: z.record(z.unknown()) })
    .parse(args);

  const isLive = config.liveObjectTypes.includes(parsed.objectType);

  if (isLive) {
    const created = await serviceLayerClient.post(`/${parsed.objectType}`, parsed.body);
    return {
      content: [
        {
          type: "text" as const,
          text: `Created LIVE ${parsed.objectType} record:\n${JSON.stringify(created, null, 2)}`,
        },
      ],
    };
  }

  const docObjectCode = DOC_OBJECT_CODES[parsed.objectType];
  if (!docObjectCode) {
    throw new Error(
      `objectType "${parsed.objectType}" has no known DocObjectCode for draft posting. ` +
        `Add it to DOC_OBJECT_CODES in postTransaction.ts, or add it to SL_LIVE_OBJECT_TYPES ` +
        `if it should be posted live instead.`
    );
  }

  const draftPayload = { ...parsed.body, DocObjectCode: docObjectCode };
  const created = await serviceLayerClient.post("/Drafts", draftPayload);
  return {
    content: [
      {
        type: "text" as const,
        text:
          `Created DRAFT ${parsed.objectType} (DocObjectCode ${docObjectCode}). ` +
          `Review and add it from the Drafts screen in SAP B1:\n${JSON.stringify(created, null, 2)}`,
      },
    ],
  };
}
