export interface FirestoreConfig {
  projectId: string;
  clientEmail: string;
  privateKey: string;
}

let cachedAccessToken: string | null = null;
let tokenExpiration: number = 0;

export async function getFirestoreToken(config: FirestoreConfig): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  if (cachedAccessToken && now < tokenExpiration - 300) {
    return cachedAccessToken;
  }

  const header = { alg: "RS256", typ: "JWT" };
  const payload = {
    iss: config.clientEmail,
    scope: "https://www.googleapis.com/auth/datastore",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now,
  };

  const strHeader = btoa(JSON.stringify(header));
  const strPayload = btoa(JSON.stringify(payload));
  const signatureInput = `${strHeader}.${strPayload}`;

  const pem = config.privateKey.replace(/-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----|\s+/g, "");
  const binaryDerString = atob(pem);
  const binaryDer = new Uint8Array(binaryDerString.length);
  for (let i = 0; i < binaryDerString.length; i++) binaryDer[i] = binaryDerString.charCodeAt(i);

  const key = await crypto.subtle.importKey("pkcs8", binaryDer.buffer, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["sign"]);
  const signature = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, new TextEncoder().encode(signatureInput));
  const strSignature = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  const jwt = `${signatureInput}.${strSignature}`;
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });
  const tokenData: any = await tokenRes.json();

  if (!tokenData.access_token) {
    throw new Error("Failed to get access token");
  }

  cachedAccessToken = tokenData.access_token;
  tokenExpiration = now + tokenData.expires_in;
  return cachedAccessToken!;
}

export function parseFirestoreDocument(doc: any): any {
  if (!doc || !doc.name) return null;
  const fields = doc.fields || {};
  const res: any = { id: doc.name.split("/").pop() };
  for (const [k, v] of Object.entries(fields)) {
    const val: any = v;
    if (val.stringValue !== undefined) res[k] = val.stringValue;
    else if (val.integerValue !== undefined) res[k] = parseInt(val.integerValue, 10);
    else if (val.doubleValue !== undefined) res[k] = parseFloat(val.doubleValue);
    else if (val.booleanValue !== undefined) res[k] = val.booleanValue;
    else if (val.timestampValue !== undefined) res[k] = val.timestampValue;
    else if (val.nullValue !== undefined) res[k] = null;
    else if (val.arrayValue !== undefined) {
      res[k] = (val.arrayValue.values || []).map((arrVal: any) => arrVal.stringValue ?? arrVal.integerValue ?? arrVal.booleanValue);
    } else if (val.mapValue !== undefined) {
      res[k] = parseFirestoreDocument({ name: "dummy", fields: val.mapValue.fields });
      delete res[k].id;
    }
  }
  return res;
}

export function toFirestoreDocument(data: any): any {
  const fields: any = {};
  for (const [k, v] of Object.entries(data)) {
    if (v === undefined) continue;
    if (v === null) fields[k] = { nullValue: null };
    else if (typeof v === "string") fields[k] = { stringValue: v };
    else if (typeof v === "number") {
      if (Number.isInteger(v)) fields[k] = { integerValue: v.toString() };
      else fields[k] = { doubleValue: v };
    } else if (typeof v === "boolean") fields[k] = { booleanValue: v };
    else if (Array.isArray(v)) {
      fields[k] = {
        arrayValue: {
          values: v.map((item) => toFirestoreDocument({ _: item }).fields._),
        },
      };
    } else if (typeof v === "object") {
      if (v instanceof Date) {
        fields[k] = { timestampValue: v.toISOString() };
      } else {
        fields[k] = { mapValue: { fields: toFirestoreDocument(v).fields } };
      }
    }
  }
  return { fields };
}

export class FirestoreClient {
  private baseUrl: string;

  constructor(private config: FirestoreConfig) {
    this.baseUrl = `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/(default)/documents`;
  }

  private async fetchApi(path: string, options: RequestInit = {}) {
    const token = await getFirestoreToken(this.config);
    const headers = new Headers(options.headers);
    headers.set("Authorization", `Bearer ${token}`);
    
    // Auto add content-type for mutations
    if (options.body && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    const res = await fetch(`${this.baseUrl}${path}`, { ...options, headers });
    const data = await res.json();
    if (!res.ok) {
      throw new Error((data as any)?.error?.message || `Firestore Error ${res.status}`);
    }
    return data;
  }

  async getDocument(collectionPath: string, docId: string): Promise<any | null> {
    try {
      const doc = await this.fetchApi(`/${collectionPath}/${docId}`);
      return parseFirestoreDocument(doc);
    } catch (e: any) {
      if (e.message.includes("NOT_FOUND") || e.message.includes("404")) return null;
      throw e;
    }
  }

  async createDocument(collectionPath: string, data: any, docId?: string): Promise<any> {
    const doc = toFirestoreDocument(data);
    let path = `/${collectionPath}`;
    let method = "POST";
    
    if (docId) {
      path += `?documentId=${docId}`;
    }
    
    const res = await this.fetchApi(path, {
      method,
      body: JSON.stringify(doc),
    });
    return parseFirestoreDocument(res);
  }

  async updateDocument(collectionPath: string, docId: string, data: any): Promise<any> {
    const doc = toFirestoreDocument(data);
    const updateMask = Object.keys(data)
      .map((k) => `updateMask.fieldPaths=${encodeURIComponent(k)}`)
      .join("&");
      
    const res = await this.fetchApi(`/${collectionPath}/${docId}?${updateMask}`, {
      method: "PATCH",
      body: JSON.stringify(doc),
    });
    return parseFirestoreDocument(res);
  }

  async deleteDocument(collectionPath: string, docId: string): Promise<void> {
    await this.fetchApi(`/${collectionPath}/${docId}`, { method: "DELETE" });
  }

  async runQuery(query: any): Promise<any[]> {
    const res = await this.fetchApi(`:runQuery`, {
      method: "POST",
      body: JSON.stringify({ structuredQuery: query }),
    });
    return (res as any[])
      .filter((r) => r.document)
      .map((r) => parseFirestoreDocument(r.document));
  }
}

export function parseServiceAccount(env: any): FirestoreConfig | null {
  const saJsonStr = env.FIREBASE_SERVICE_ACCOUNT;
  if (!saJsonStr) return null;
  try {
    const sa = JSON.parse(saJsonStr);
    return {
      projectId: sa.project_id,
      clientEmail: sa.client_email,
      privateKey: sa.private_key,
    };
  } catch {
    return null;
  }
}
