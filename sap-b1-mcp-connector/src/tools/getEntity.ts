import { z } from "zod";
import { serviceLayerClient } from "../serviceLayerClient.js";

export const getEntitySchema = {
  name: "sap-b1-get",
  description:
    "Read one or more records from the SAP B1 Service Layer (company DB " +
    "ZZZ_HPL_LIVE_29082026) for Him Electronics. Pass the resource path " +
    "exactly as it appears after /b1s/v1, e.g. \"BusinessPartners('C0001')\" " +
    "or \"Items?$filter=ItemsGroupCode eq 100&$select=ItemCode,ItemName&$top=20\".",
  inputSchema: {
    type: "object" as const,
    properties: {
      path: {
        type: "string",
        description: "Service Layer resource path/query, without the leading /b1s/v1.",
      },
    },
    required: ["path"],
  },
};

export async function handleGetEntity(args: { path: string }) {
  const parsed = z.object({ path: z.string().min(1) }).parse(args);
  const normalizedPath = parsed.path.startsWith("/") ? parsed.path : `/${parsed.path}`;
  const data = await serviceLayerClient.get(normalizedPath);
  return {
    content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
  };
}
