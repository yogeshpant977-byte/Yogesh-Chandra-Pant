import hana from "@sap/hana-client";
import { config } from "./config.js";

/**
 * Minimal promise wrapper around @sap/hana-client for read-only reporting
 * queries against the Him Electronics company schema
 * (ZZZ_HPL_LIVE_29082026).
 *
 * Only SELECT statements should be run through this path — DML/DDL belongs
 * in the Service Layer client so business logic and approvals stay inside
 * SAP B1.
 */
export function runHanaQuery<T = Record<string, unknown>>(sql: string): Promise<T[]> {
  const trimmed = sql.trim().toUpperCase();
  if (!trimmed.startsWith("SELECT")) {
    return Promise.reject(new Error("Only SELECT statements are permitted via runHanaQuery."));
  }

  return new Promise((resolve, reject) => {
    const conn = hana.createConnection();
    conn.connect(
      {
        serverNode: `${config.hana.host}:${config.hana.port}`,
        uid: config.hana.uid,
        pwd: config.hana.pwd,
        currentSchema: config.hana.schema,
      },
      (connectErr: Error | undefined) => {
        if (connectErr) {
          reject(connectErr);
          return;
        }
        conn.exec(sql, [], (execErr: Error | undefined, rows: T[]) => {
          conn.disconnect();
          if (execErr) {
            reject(execErr);
            return;
          }
          resolve(rows);
        });
      }
    );
  });
}
