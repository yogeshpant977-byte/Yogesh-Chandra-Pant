import "dotenv/config";

function required(name: string, fallback?: string): string {
  const v = process.env[name] ?? fallback;
  if (v === undefined) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return v;
}

export const config = {
  serviceLayer: {
    baseUrl: required("SL_BASE_URL"),
    companyDb: required("SL_COMPANY_DB", "ZZZ_HPL_LIVE_29082026"),
    username: required("SL_USERNAME"),
    password: required("SL_PASSWORD"),
    tlsRejectUnauthorized: (process.env.SL_TLS_REJECT_UNAUTHORIZED ?? "true") !== "false",
  },
  hana: {
    host: process.env.HANA_HOST ?? "",
    port: Number(process.env.HANA_PORT ?? "30015"),
    uid: process.env.HANA_UID ?? "",
    pwd: process.env.HANA_PWD ?? "",
    schema: process.env.HANA_SCHEMA ?? "ZZZ_HPL_LIVE_29082026",
  },
  // Object types allowed to be posted LIVE (not as Draft). Keep this list
  // short and deliberate — everything else is forced into DocObjectCode
  // Drafts (oDrafts / Drfx) as a safety net for an AI-driven connector.
  liveObjectTypes: (process.env.SL_LIVE_OBJECT_TYPES ?? "BusinessPartners")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
};
