import https from "node:https";
import fetch, { RequestInit, Response } from "node-fetch";
import { config } from "./config.js";

/**
 * Thin client around the SAP B1 Service Layer REST API.
 *
 * Handles login/session-id caching, CSRF-free B1S session cookie reuse,
 * and basic CRUD + OData query helpers against the configured company DB
 * (ZZZ_HPL_LIVE_29082026 for Him Electronics).
 */
class ServiceLayerClient {
  private sessionId: string | null = null;
  private sessionExpiresAt = 0;
  private readonly agent = new https.Agent({
    rejectUnauthorized: config.serviceLayer.tlsRejectUnauthorized,
  });

  private async login(): Promise<void> {
    const res = await fetch(`${config.serviceLayer.baseUrl}/Login`, {
      method: "POST",
      agent: this.agent,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        CompanyDB: config.serviceLayer.companyDb,
        UserName: config.serviceLayer.username,
        Password: config.serviceLayer.password,
      }),
    });

    if (!res.ok) {
      throw new Error(`SAP B1 Service Layer login failed: ${res.status} ${await res.text()}`);
    }

    const body = (await res.json()) as { SessionId: string; SessionTimeout: number };
    this.sessionId = body.SessionId;
    // Refresh 1 minute before the reported timeout, defaulting to 25 min.
    const timeoutMinutes = body.SessionTimeout ?? 30;
    this.sessionExpiresAt = Date.now() + (timeoutMinutes - 1) * 60_000;
  }

  private async ensureSession(): Promise<void> {
    if (!this.sessionId || Date.now() >= this.sessionExpiresAt) {
      await this.login();
    }
  }

  private async request(path: string, init: RequestInit = {}): Promise<Response> {
    await this.ensureSession();

    const doFetch = () =>
      fetch(`${config.serviceLayer.baseUrl}${path}`, {
        ...init,
        agent: this.agent,
        headers: {
          "Content-Type": "application/json",
          Cookie: `B1SESSION=${this.sessionId}`,
          ...(init.headers ?? {}),
        },
      });

    let res = await doFetch();

    // Session expired mid-flight — re-login once and retry.
    if (res.status === 401) {
      await this.login();
      res = await doFetch();
    }

    return res;
  }

  /** GET an OData resource, e.g. "/BusinessPartners('C0001')" or a query with $filter/$select. */
  async get<T = unknown>(path: string): Promise<T> {
    const res = await this.request(path, { method: "GET" });
    if (!res.ok) {
      throw new Error(`SAP B1 GET ${path} failed: ${res.status} ${await res.text()}`);
    }
    return (await res.json()) as T;
  }

  /** POST to create an entity or call a cross-join/action endpoint. */
  async post<T = unknown>(path: string, data: unknown): Promise<T> {
    const res = await this.request(path, { method: "POST", body: JSON.stringify(data) });
    if (!res.ok) {
      throw new Error(`SAP B1 POST ${path} failed: ${res.status} ${await res.text()}`);
    }
    // 204 No Content is common for successful creates in some setups.
    const text = await res.text();
    return (text ? JSON.parse(text) : {}) as T;
  }

  /** PATCH to partially update an existing entity. */
  async patch(path: string, data: unknown): Promise<void> {
    const res = await this.request(path, { method: "PATCH", body: JSON.stringify(data) });
    if (!res.ok) {
      throw new Error(`SAP B1 PATCH ${path} failed: ${res.status} ${await res.text()}`);
    }
  }
}

export const serviceLayerClient = new ServiceLayerClient();
