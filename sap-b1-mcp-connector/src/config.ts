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
    baseUrl: required("B1SL_BASE_URL"),
    companyDb: required("B1_COMPANY_DB", "ZZZ_HPL_LIVE_29082026"),
    username: required("B1_USERNAME"),
    password: required("B1_PASSWORD"),
    tlsRejectUnauthorized: (process.env.B1SL_TLS_REJECT_UNAUTHORIZED ?? "true") !== "false",
    // Safety switch: when true (default), everything except master data
    // (BusinessPartners/Items) is created as a Draft, not posted live.
    postAsDraft: (process.env.B1SL_POST_AS_DRAFT ?? "true") !== "false",
  },
  hana: {
    enabled: (process.env.HANA_ENABLED ?? "false") === "true",
    host: process.env.HANA_HOST ?? "",
    port: Number(process.env.HANA_PORT ?? "30015"),
    uid: process.env.HANA_USER ?? "",
    pwd: process.env.HANA_PASSWORD ?? "",
    schema: process.env.HANA_SCHEMA ?? "ZZZ_HPL_LIVE_29082026",
  },
  // Object types always allowed to be posted LIVE regardless of
  // B1SL_POST_AS_DRAFT — master data, not ledger-affecting documents.
  liveObjectTypes: (process.env.SL_LIVE_OBJECT_TYPES ?? "BusinessPartners,Items")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
};
