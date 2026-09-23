import { config } from "../config";

const AUTH = "Basic " + Buffer.from(`${config.odata.user}:${config.odata.password}`).toString("base64");
const BASE = `${config.odata.baseUrl}/odata/standard.odata`;
const MAX_RETRIES = 4;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function buildUrl(path: string, params: Record<string, string | number | undefined> = {}) {
  const url = new URL(`${BASE}/${path}`);
  url.searchParams.set("$format", "json");
  for (const [k, v] of Object.entries(params)) if (v !== undefined) url.searchParams.set(k, String(v));
  return url.toString();
}

async function request(path: string, init: RequestInit, params?: Record<string, string | number | undefined>): Promise<any> {
  const url = buildUrl(path, params);

  for (let attempt = 0; ; attempt++) {
    const res = await fetch(url, { ...init, headers: { Authorization: AUTH, ...init.headers } }).catch((e) => {
      if (attempt >= MAX_RETRIES) throw e;
      return null;
    });

    if (res === null) {
      await sleep(400 * (attempt + 1));
      continue;
    }
    if (res.status === 401) throw new Error("1С отклонила авторизацию (401)");
    if (res.status >= 500 && attempt < MAX_RETRIES) {
      await sleep(400 * (attempt + 1));
      continue;
    }
    if (!res.ok) throw new Error(`1С ответила ${res.status}: ${(await res.text()).slice(0, 300)}`);

    return res.status === 204 ? null : res.json();
  }
}

export const odataGet = (path: string, params?: Record<string, string | number | undefined>): Promise<any> =>
  request(path, { method: "GET" }, params);

export const odataPost = (path: string, body: unknown) =>
  request(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

export async function odataFetchAll(path: string, params?: Record<string, string | number | undefined>, pageSize = 20) {
  const all: any[] = [];
  let skip = 0;
  while (true) {
    const page: any = await odataGet(path, { ...params, $top: pageSize, $skip: skip });
    const values: any[] = page?.value ?? [];
    if (values.length === 0) return all;
    all.push(...values);
    skip += values.length;
  }
}