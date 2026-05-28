var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// src/firestore.ts
var cachedAccessToken = null;
var tokenExpiration = 0;
async function getFirestoreToken(config) {
  const now = Math.floor(Date.now() / 1e3);
  if (cachedAccessToken && now < tokenExpiration - 300) {
    return cachedAccessToken;
  }
  const header = { alg: "RS256", typ: "JWT" };
  const payload = {
    iss: config.clientEmail,
    scope: "https://www.googleapis.com/auth/datastore",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now
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
  const strSignature = btoa(String.fromCharCode(...new Uint8Array(signature))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  const jwt = `${signatureInput}.${strSignature}`;
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`
  });
  const tokenData = await tokenRes.json();
  if (!tokenData.access_token) {
    throw new Error("Failed to get access token");
  }
  cachedAccessToken = tokenData.access_token;
  tokenExpiration = now + tokenData.expires_in;
  return cachedAccessToken;
}
__name(getFirestoreToken, "getFirestoreToken");
function parseFirestoreDocument(doc) {
  if (!doc || !doc.name) return null;
  const fields = doc.fields || {};
  const res = { id: doc.name.split("/").pop() };
  for (const [k, v] of Object.entries(fields)) {
    const val = v;
    if (val.stringValue !== void 0) res[k] = val.stringValue;
    else if (val.integerValue !== void 0) res[k] = parseInt(val.integerValue, 10);
    else if (val.doubleValue !== void 0) res[k] = parseFloat(val.doubleValue);
    else if (val.booleanValue !== void 0) res[k] = val.booleanValue;
    else if (val.timestampValue !== void 0) res[k] = val.timestampValue;
    else if (val.nullValue !== void 0) res[k] = null;
    else if (val.arrayValue !== void 0) {
      res[k] = (val.arrayValue.values || []).map((arrVal) => arrVal.stringValue ?? arrVal.integerValue ?? arrVal.booleanValue);
    } else if (val.mapValue !== void 0) {
      res[k] = parseFirestoreDocument({ name: "dummy", fields: val.mapValue.fields });
      delete res[k].id;
    }
  }
  return res;
}
__name(parseFirestoreDocument, "parseFirestoreDocument");
function toFirestoreDocument(data) {
  const fields = {};
  for (const [k, v] of Object.entries(data)) {
    if (v === void 0) continue;
    if (v === null) fields[k] = { nullValue: null };
    else if (typeof v === "string") fields[k] = { stringValue: v };
    else if (typeof v === "number") {
      if (Number.isInteger(v)) fields[k] = { integerValue: v.toString() };
      else fields[k] = { doubleValue: v };
    } else if (typeof v === "boolean") fields[k] = { booleanValue: v };
    else if (Array.isArray(v)) {
      fields[k] = {
        arrayValue: {
          values: v.map((item) => toFirestoreDocument({ _: item }).fields._)
        }
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
__name(toFirestoreDocument, "toFirestoreDocument");
var FirestoreClient = class {
  constructor(config) {
    this.config = config;
    this.baseUrl = `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/(default)/documents`;
  }
  static {
    __name(this, "FirestoreClient");
  }
  baseUrl;
  async fetchApi(path, options = {}) {
    const token = await getFirestoreToken(this.config);
    const headers = new Headers(options.headers);
    headers.set("Authorization", `Bearer ${token}`);
    if (options.body && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
    const res = await fetch(`${this.baseUrl}${path}`, { ...options, headers });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data?.error?.message || `Firestore Error ${res.status}`);
    }
    return data;
  }
  async getDocument(collectionPath, docId) {
    try {
      const doc = await this.fetchApi(`/${collectionPath}/${docId}`);
      return parseFirestoreDocument(doc);
    } catch (e) {
      if (e.message.includes("NOT_FOUND") || e.message.includes("404")) return null;
      throw e;
    }
  }
  async createDocument(collectionPath, data, docId) {
    const doc = toFirestoreDocument(data);
    let path = `/${collectionPath}`;
    let method = "POST";
    if (docId) {
      path += `?documentId=${docId}`;
    }
    const res = await this.fetchApi(path, {
      method,
      body: JSON.stringify(doc)
    });
    return parseFirestoreDocument(res);
  }
  async updateDocument(collectionPath, docId, data) {
    const doc = toFirestoreDocument(data);
    const updateMask = Object.keys(data).map((k) => `updateMask.fieldPaths=${encodeURIComponent(k)}`).join("&");
    const res = await this.fetchApi(`/${collectionPath}/${docId}?${updateMask}`, {
      method: "PATCH",
      body: JSON.stringify(doc)
    });
    return parseFirestoreDocument(res);
  }
  async deleteDocument(collectionPath, docId) {
    await this.fetchApi(`/${collectionPath}/${docId}`, { method: "DELETE" });
  }
  async listDocuments(collectionPath) {
    try {
      const res = await this.fetchApi(`/${collectionPath}`);
      return (res.documents || []).map((doc) => parseFirestoreDocument(doc));
    } catch (e) {
      if (e.message.includes("NOT_FOUND") || e.message.includes("404")) return [];
      throw e;
    }
  }
  async runQuery(query) {
    const res = await this.fetchApi(`:runQuery`, {
      method: "POST",
      body: JSON.stringify({ structuredQuery: query })
    });
    return res.filter((r) => r.document).map((r) => parseFirestoreDocument(r.document));
  }
};
function parseServiceAccount(env) {
  const saJsonStr = env.FIREBASE_SERVICE_ACCOUNT;
  if (!saJsonStr) return null;
  try {
    const sa = JSON.parse(saJsonStr);
    return {
      projectId: sa.project_id,
      clientEmail: sa.client_email,
      privateKey: sa.private_key
    };
  } catch {
    return null;
  }
}
__name(parseServiceAccount, "parseServiceAccount");

// src/realtime.ts
var toRoomKey = /* @__PURE__ */ __name((raw) => {
  if (typeof raw === "string" && raw.trim()) return raw.trim();
  return null;
}, "toRoomKey");
var parseJson = /* @__PURE__ */ __name(async (req) => {
  const contentType = req.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) return null;
  try {
    return await req.json();
  } catch {
    return null;
  }
}, "parseJson");
var RealtimeDO = class {
  constructor(state, env) {
    this.state = state;
    this.env = env;
    const config = parseServiceAccount(this.env);
    if (config) {
      this.firestore = new FirestoreClient(config);
    }
  }
  static {
    __name(this, "RealtimeDO");
  }
  firestore = null;
  async getRoomInfo(roomId) {
    if (!this.firestore) return null;
    const room = await this.firestore.getDocument("exam_rooms", roomId);
    if (!room) return null;
    return {
      id: room.id,
      hostUserId: String(room.host_user_id),
      questionCount: Number(room.question_count || 0),
      subject: room.subject ? String(room.subject) : null,
      status: room.status ? String(room.status) : null
    };
  }
  async upsertParticipant(roomId, userId, fields) {
    if (!this.firestore) return;
    const score = Number.isFinite(fields.score) ? fields.score : 0;
    const status = fields.status || "joined";
    const docPath = `exam_rooms/${roomId}/participants`;
    const existing = await this.firestore.getDocument(docPath, userId);
    if (existing) {
      await this.firestore.updateDocument(docPath, userId, {
        score: fields.score !== void 0 ? score : existing.score,
        status,
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      });
    } else {
      await this.firestore.createDocument(docPath, {
        user_id: userId,
        score,
        status,
        current_question_index: 0,
        created_at: (/* @__PURE__ */ new Date()).toISOString(),
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      }, userId);
    }
  }
  async fetch(request) {
    const url = new URL(request.url);
    if ((url.pathname.endsWith("/ws") || url.pathname.endsWith("/ws/")) && request.headers.get("upgrade")?.toLowerCase() === "websocket") {
      const pair = new WebSocketPair();
      const client = pair[0];
      const server = pair[1];
      this.state.acceptWebSocket(server);
      const token = url.searchParams.get("token") || void 0;
      const userId = url.searchParams.get("userId") || void 0;
      const attachment = {
        userId,
        rooms: []
      };
      server.serializeAttachment({ ...attachment, token });
      const sid = Math.random().toString(36).substring(2, 15);
      server.send(`0{"sid":"${sid}","upgrades":[],"pingInterval":25000,"pingTimeout":20000}`);
      server.send(`40{"sid":"${sid}"}`);
      return new Response(null, { status: 101, webSocket: client });
    }
    if (url.pathname.endsWith("/broadcast") && request.method === "POST") {
      const auth = request.headers.get("authorization") || "";
      const key = auth.toLowerCase().startsWith("bearer ") ? auth.slice(7) : "";
      if (!key || key !== this.env.INTERNAL_API_KEY) {
        return Response.json({ error: "unauthorized" }, { status: 401 });
      }
      const body = await parseJson(request);
      if (!body || typeof body !== "object") {
        return Response.json({ error: "invalid_body" }, { status: 400 });
      }
      const event = body.event;
      const data = body.data;
      const room = toRoomKey(body.room);
      if (typeof event !== "string" || !event) {
        return Response.json({ error: "invalid_event" }, { status: 400 });
      }
      this.broadcast({ event, data }, room);
      return Response.json({ ok: true });
    }
    return Response.json({ error: "not_found" }, { status: 404 });
  }
  broadcast(msg, room) {
    const sockets = this.state.getWebSockets();
    const payload = `42${JSON.stringify([msg.event, msg.data])}`;
    for (const ws of sockets) {
      const attachment = ws.deserializeAttachment();
      if (room) {
        const rooms = attachment?.rooms || [];
        if (!rooms.includes(room)) continue;
      }
      ws.send(payload);
    }
  }
  async webSocketMessage(ws, message) {
    if (typeof message !== "string") return;
    if (message === "2" || message === "2probe") {
      ws.send("3");
      return;
    }
    if (message.startsWith("40")) {
      ws.send(`40{"sid":"123456"}`);
      return;
    }
    let payload = null;
    if (message.startsWith("42")) {
      try {
        const parsed = JSON.parse(message.slice(2));
        if (Array.isArray(parsed) && parsed.length > 0) {
          payload = { event: parsed[0], data: parsed[1] };
        }
      } catch {
        payload = null;
      }
    } else {
      try {
        payload = JSON.parse(message);
      } catch {
        payload = null;
      }
    }
    if (!payload) return;
    if (payload.type === "ping") {
      ws.send(JSON.stringify({ type: "pong" }));
      return;
    }
    if (!("event" in payload) || typeof payload.event !== "string") return;
    const attachment = ws.deserializeAttachment() || {
      rooms: []
    };
    const event = payload.event;
    const data = payload.data;
    if (event === "join_user") {
      const id = typeof data === "string" || typeof data === "number" ? String(data) : null;
      if (id) {
        attachment.userId = id;
        attachment.rooms = Array.from(/* @__PURE__ */ new Set([...attachment.rooms || [], `user:${id}`]));
        ws.serializeAttachment(attachment);
      }
      return;
    }
    if (event === "join_room") {
      const roomId = data?.roomId;
      const userId = data?.userId;
      const roomKey = toRoomKey(roomId);
      if (roomKey) {
        attachment.rooms = Array.from(/* @__PURE__ */ new Set([...attachment.rooms || [], `room:${roomKey}`]));
        if (userId !== void 0 && userId !== null) attachment.userId = String(userId);
        ws.serializeAttachment(attachment);
        this.broadcast({ event: "user_joined", data: { userId: attachment.userId } }, `room:${roomKey}`);
      }
      return;
    }
    if (event === "join_ticket") {
      const ticketId = toRoomKey(data);
      if (ticketId) {
        attachment.rooms = Array.from(/* @__PURE__ */ new Set([...attachment.rooms || [], `ticket:${ticketId}`]));
        ws.serializeAttachment(attachment);
      }
      return;
    }
    if (event === "leave_ticket") {
      const ticketId = toRoomKey(data);
      if (ticketId) {
        attachment.rooms = (attachment.rooms || []).filter((r) => r !== `ticket:${ticketId}`);
        ws.serializeAttachment(attachment);
      }
      return;
    }
    if (event === "join_group") {
      const groupKey = toRoomKey(data) || toRoomKey(data?.room) || toRoomKey(data?.group);
      if (groupKey) {
        attachment.rooms = Array.from(/* @__PURE__ */ new Set([...attachment.rooms || [], `group:${groupKey}`]));
        ws.serializeAttachment(attachment);
      }
      return;
    }
    if (event === "send_message") {
      const roomId = data?.roomId;
      const roomKey = toRoomKey(roomId);
      if (roomKey) this.broadcast({ event: "receive_message", data }, `room:${roomKey}`);
      return;
    }
    if (event === "start_exam") {
      const roomId = data?.roomId;
      const userId = data?.userId;
      const roomKey = toRoomKey(roomId);
      if (roomKey && userId !== void 0 && userId !== null) {
        try {
          const info = await this.getRoomInfo(roomKey);
          if (info && info.hostUserId === String(userId)) {
            if (this.firestore) {
              await this.firestore.updateDocument("exam_rooms", roomKey, {
                status: "in_progress",
                updated_at: (/* @__PURE__ */ new Date()).toISOString()
              });
            }
            this.broadcast({ event: "exam_started" }, `room:${roomKey}`);
          }
        } catch {
          return;
        }
      }
      return;
    }
    if (event === "submit_score") {
      const roomId = data?.roomId;
      const roomKey = toRoomKey(roomId);
      if (roomKey) {
        try {
          const userId = data?.userId;
          const score = Number(data?.score ?? 0);
          if (userId !== void 0 && userId !== null) {
            await this.upsertParticipant(roomKey, String(userId), { score, status: data?.status });
            this.broadcast({ event: "score_updated", data: { userId, score } }, `room:${roomKey}`);
          }
        } catch {
          return;
        }
      }
      return;
    }
    if (event === "tutor_navigate") {
      const roomId = data?.roomId;
      const roomKey = toRoomKey(roomId);
      if (roomKey) this.broadcast({ event: "navigate_question", data: { questionIndex: data?.questionIndex } }, `room:${roomKey}`);
      return;
    }
    if (event === "tutor_show_answer") {
      const roomId = data?.roomId;
      const roomKey = toRoomKey(roomId);
      if (roomKey) this.broadcast({ event: "tutor_show_answer", data: { questionIndex: data?.questionIndex } }, `room:${roomKey}`);
      return;
    }
    if (event === "tutor_player_answer") {
      const roomId = data?.roomId;
      const roomKey = toRoomKey(roomId);
      if (roomKey) this.broadcast({ event: "tutor_player_answered", data: { choice: data?.choice } }, `room:${roomKey}`);
      return;
    }
    if (event === "submit_progress") {
      const roomId = data?.roomId;
      const roomKey = toRoomKey(roomId);
      const userId = data?.userId;
      const questionIndex = data?.questionIndex;
      if (roomKey && userId !== void 0 && userId !== null) {
        try {
          if (this.firestore) {
            await this.firestore.updateDocument(`exam_rooms/${roomKey}/participants`, String(userId), {
              current_question_index: questionIndex,
              updated_at: (/* @__PURE__ */ new Date()).toISOString()
            });
          }
          this.broadcast({ event: "progress_updated", data: { userId, questionIndex } }, `room:${roomKey}`);
        } catch {
        }
      }
      return;
    }
    if (event === "set_nickname") {
      const roomId = data?.roomId;
      const roomKey = toRoomKey(roomId);
      const userId = data?.userId;
      const nickname = data?.nickname;
      if (roomKey && userId !== void 0 && userId !== null && nickname) {
        try {
          if (this.firestore) {
            await this.firestore.updateDocument(`exam_rooms/${roomKey}/participants`, String(userId), {
              nickname: String(nickname),
              updated_at: (/* @__PURE__ */ new Date()).toISOString()
            });
          }
          this.broadcast({ event: "nickname_updated", data: { userId, nickname } }, `room:${roomKey}`);
        } catch {
        }
      }
      return;
    }
    if (event === "finish_exam") {
      const roomId = data?.roomId;
      const roomKey = toRoomKey(roomId);
      if (roomKey && this.firestore) {
        try {
          const userId = data?.userId;
          const score = Number(data?.score ?? 0);
          const timeTaken = Number(data?.timeTaken ?? 0);
          if (userId === void 0 || userId === null) return;
          await this.upsertParticipant(roomKey, String(userId), { score, status: "finished" });
          const info = await this.getRoomInfo(roomKey);
          if (info) {
            const subjectScores = info.subject ? JSON.stringify({ [info.subject]: score }) : null;
            await this.firestore.createDocument("exam_results", {
              user_id: String(userId),
              classroom_id: null,
              score,
              total_score: info.questionCount,
              mode: "classroom",
              subject_scores: subjectScores,
              skill_scores: null,
              questions: null,
              time_taken: timeTaken,
              taken_at: (/* @__PURE__ */ new Date()).toISOString()
            });
            const parts = await this.firestore.listDocuments(`exam_rooms/${roomKey}/participants`);
            const total = parts.length;
            const finished = parts.filter((p) => p.status === "finished").length;
            if (total > 0 && total === finished) {
              await this.firestore.updateDocument("exam_rooms", roomKey, {
                status: "finished",
                updated_at: (/* @__PURE__ */ new Date()).toISOString()
              });
            }
          }
          this.broadcast({ event: "score_updated", data: { userId, score } }, `room:${roomKey}`);
        } catch {
          return;
        }
      }
      return;
    }
    if (event === "close_room") {
      const roomId = data?.roomId;
      const userId = data?.userId;
      const roomKey = toRoomKey(roomId);
      if (roomKey && userId !== void 0 && userId !== null && this.firestore) {
        try {
          const info = await this.getRoomInfo(roomKey);
          if (info && info.hostUserId === String(userId)) {
            await this.firestore.updateDocument("exam_rooms", roomKey, {
              status: "finished",
              updated_at: (/* @__PURE__ */ new Date()).toISOString()
            });
            this.broadcast({ event: "room_closed_by_host" }, `room:${roomKey}`);
          }
        } catch {
          return;
        }
      }
      return;
    }
    if (event === "reset_exam" || event === "exam_reset") {
      const roomId = data?.roomId;
      const roomKey = toRoomKey(roomId);
      if (roomKey && this.firestore) {
        try {
          const parts = await this.firestore.listDocuments(`exam_rooms/${roomKey}/participants`);
          for (const p of parts) {
            await this.firestore.updateDocument(`exam_rooms/${roomKey}/participants`, p.id, {
              score: 0,
              status: "joined",
              current_question_index: 0,
              updated_at: (/* @__PURE__ */ new Date()).toISOString()
            });
          }
          this.broadcast({ event: "exam_reset" }, `room:${roomKey}`);
        } catch {
          return;
        }
      }
      return;
    }
  }
};

// src/auth.ts
var base64UrlToBytes = /* @__PURE__ */ __name((input) => {
  const pad = "=".repeat((4 - input.length % 4) % 4);
  const b64 = (input + pad).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(b64);
  const bytes = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
  return bytes;
}, "base64UrlToBytes");
var bytesToBase64Url = /* @__PURE__ */ __name((bytes) => {
  const u8 = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let binary = "";
  for (let i = 0; i < u8.length; i++) binary += String.fromCharCode(u8[i]);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}, "bytesToBase64Url");
var decodeJson = /* @__PURE__ */ __name((input) => {
  const bytes = base64UrlToBytes(input);
  const text = new TextDecoder().decode(bytes);
  return JSON.parse(text);
}, "decodeJson");
var signJwtHs256 = /* @__PURE__ */ __name(async (payload, secret) => {
  const header = { alg: "HS256", typ: "JWT" };
  const encodedHeader = bytesToBase64Url(new TextEncoder().encode(JSON.stringify(header)));
  const encodedPayload = bytesToBase64Url(new TextEncoder().encode(JSON.stringify(payload)));
  const data = `${encodedHeader}.${encodedPayload}`;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  const encodedSig = bytesToBase64Url(sig);
  return `${data}.${encodedSig}`;
}, "signJwtHs256");
var verifyJwtHs256 = /* @__PURE__ */ __name(async (token, secret) => {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [h, p, s] = parts;
  let header;
  let payload;
  try {
    header = decodeJson(h);
    payload = decodeJson(p);
  } catch {
    return null;
  }
  if (!header || header.alg !== "HS256") return null;
  if (payload?.exp && typeof payload.exp === "number") {
    const now = Math.floor(Date.now() / 1e3);
    if (now >= payload.exp) return null;
  }
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"]
  );
  const ok = await crypto.subtle.verify(
    { name: "HMAC" },
    key,
    base64UrlToBytes(s),
    new TextEncoder().encode(`${h}.${p}`)
  );
  if (!ok) return null;
  return payload;
}, "verifyJwtHs256");
var requireUserId = /* @__PURE__ */ __name(async (req, jwtSecret) => {
  const auth = req.headers.get("authorization") || "";
  const token = auth.toLowerCase().startsWith("bearer ") ? auth.slice(7) : "";
  if (!token) return null;
  const payload = await verifyJwtHs256(token, jwtSecret);
  const id = payload?.id;
  if (id === void 0 || id === null) return null;
  return String(id);
}, "requireUserId");

// src/password.ts
var b64UrlToBytes = /* @__PURE__ */ __name((input) => {
  const pad = "=".repeat((4 - input.length % 4) % 4);
  const b64 = (input + pad).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(b64);
  const bytes = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
  return bytes;
}, "b64UrlToBytes");
var bytesToB64Url = /* @__PURE__ */ __name((bytes) => {
  const u8 = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let binary = "";
  for (let i = 0; i < u8.length; i++) binary += String.fromCharCode(u8[i]);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}, "bytesToB64Url");
var timingSafeEqual = /* @__PURE__ */ __name((a, b) => {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) out |= a[i] ^ b[i];
  return out === 0;
}, "timingSafeEqual");
var hashPassword = /* @__PURE__ */ __name(async (password) => {
  const iterations = 12e4;
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt, iterations },
    keyMaterial,
    256
  );
  return `pbkdf2_sha256$${iterations}$${bytesToB64Url(salt)}$${bytesToB64Url(bits)}`;
}, "hashPassword");
var verifyPassword = /* @__PURE__ */ __name(async (password, stored) => {
  const parts = stored.split("$");
  if (parts.length !== 4) return false;
  const algo = parts[0];
  const iterations = Number(parts[1]);
  const salt = parts[2];
  const digest = parts[3];
  if (algo !== "pbkdf2_sha256" || !Number.isFinite(iterations) || iterations <= 0) return false;
  const saltBytes = b64UrlToBytes(salt);
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt: saltBytes, iterations },
    keyMaterial,
    256
  );
  const got = bytesToB64Url(bits);
  return timingSafeEqual(new TextEncoder().encode(got), new TextEncoder().encode(digest));
}, "verifyPassword");

// src/index.ts
var withCors = /* @__PURE__ */ __name((res) => {
  const headers = new Headers(res.headers);
  headers.set("access-control-allow-origin", "*");
  headers.set("access-control-allow-methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  headers.set("access-control-allow-headers", "content-type,authorization");
  return new Response(res.body, { status: res.status, statusText: res.statusText, headers });
}, "withCors");
var mockScraperRunning = false;
var mockScraperLogs = [];
var mockGeneratorRunning = false;
var mockGeneratorLogs = [];
var json = /* @__PURE__ */ __name((body, init) => withCors(Response.json(body, init)), "json");
var readJson = /* @__PURE__ */ __name(async (req) => {
  const contentType = req.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) return null;
  try {
    return await req.json();
  } catch {
    return null;
  }
}, "readJson");
var notFound = /* @__PURE__ */ __name(() => json({ error: "not_found" }, { status: 404 }), "notFound");
var requireJwtSecret = /* @__PURE__ */ __name((env) => {
  const secret = env.JWT_SECRET;
  if (!secret) return null;
  return secret;
}, "requireJwtSecret");
var requireAuthUserId = /* @__PURE__ */ __name(async (req, env) => {
  const secret = requireJwtSecret(env);
  if (!secret) return { error: json({ error: "missing_jwt_secret" }, { status: 500 }) };
  const userId = await requireUserId(req, secret);
  if (!userId) return { error: json({ error: "unauthorized" }, { status: 401 }) };
  return { userId };
}, "requireAuthUserId");
var oneDayAgoIso = /* @__PURE__ */ __name(() => new Date(Date.now() - 24 * 60 * 60 * 1e3).toISOString(), "oneDayAgoIso");
var sanitizeUser = /* @__PURE__ */ __name((row) => {
  if (!row) return null;
  return {
    id: row.id,
    email: row.email,
    display_name: row.display_name,
    avatar: row.avatar || null,
    role: row.role,
    plan_type: row.plan_type,
    status: row.status
  };
}, "sanitizeUser");
var normalizeQuestion = /* @__PURE__ */ __name((q) => {
  if (!q) return q;
  const ans = String(q.correct_answer || "").trim();
  const lowerAns = ans.toLowerCase();
  if (lowerAns === "a" || lowerAns === "b" || lowerAns === "c" || lowerAns === "d") {
    return { ...q, correct_answer: ans.toUpperCase() };
  }
  let mapped = ans;
  if (lowerAns === String(q.choice_a || "").trim().toLowerCase()) mapped = "A";
  else if (lowerAns === String(q.choice_b || "").trim().toLowerCase()) mapped = "B";
  else if (lowerAns === String(q.choice_c || "").trim().toLowerCase()) mapped = "C";
  else if (lowerAns === String(q.choice_d || "").trim().toLowerCase()) mapped = "D";
  return { ...q, correct_answer: mapped.toUpperCase() };
}, "normalizeQuestion");
var index_default = {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (request.method === "OPTIONS") {
      return withCors(new Response(null, { status: 204 }));
    }
    if (url.pathname === "/api/health") {
      const saConfig2 = parseServiceAccount(env);
      if (!saConfig2) return json({ error: "missing_firebase_config" }, { status: 500 });
      const firestore2 = new FirestoreClient(saConfig2);
      const user6 = await firestore2.getDocument("users", "6");
      return json({ ok: true, user6 });
    }
    if (url.pathname.startsWith("/api/ws") || url.pathname.startsWith("/api/realtime")) {
      const id = env.REALTIME.idFromName("global");
      const stub = env.REALTIME.get(id);
      return stub.fetch(request);
    }
    const saConfig = parseServiceAccount(env);
    if (!saConfig) return json({ error: "missing_firebase_config" }, { status: 500 });
    const firestore = new FirestoreClient(saConfig);
    if (url.pathname === "/api/auth/register" && request.method === "POST") {
      const secret = requireJwtSecret(env);
      if (!secret) return json({ error: "missing_jwt_secret" }, { status: 500 });
      const body = await readJson(request);
      if (!body) return json({ success: false, message: "invalid_body" }, { status: 400 });
      const email = String(body.email || "").trim().toLowerCase();
      const password = String(body.password || "");
      const displayName = String(body.display_name || body.displayName || "").trim();
      if (!email || !password || password.length < 6 || !displayName) {
        return json({ success: false, message: "invalid_params" }, { status: 400 });
      }
      const existingUsers = await firestore.runQuery({
        from: [{ collectionId: "users" }],
        where: { fieldFilter: { field: { fieldPath: "email" }, op: "EQUAL", value: { stringValue: email } } },
        limit: 1
      });
      if (existingUsers.length > 0) return json({ success: false, message: "Email already in use" }, { status: 409 });
      const passwordHash = await hashPassword(password);
      const user = await firestore.createDocument("users", {
        email,
        password_hash: passwordHash,
        display_name: displayName,
        role: "user",
        plan_type: "free",
        status: "active",
        created_at: (/* @__PURE__ */ new Date()).toISOString(),
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      });
      const exp = Math.floor(Date.now() / 1e3) + 60 * 60 * 24 * 30;
      const token = await signJwtHs256({ id: user.id, exp }, secret);
      return json({ success: true, token, user: sanitizeUser(user) });
    }
    if (url.pathname === "/api/auth/guest" && request.method === "POST") {
      const body = await readJson(request);
      if (!body || !body.deviceId) return json({ success: false, message: "invalid_body" }, { status: 400 });
      const deviceId = body.deviceId;
      const email = `guest_${deviceId}@preexam.com`;
      const existing = await firestore.runQuery({
        from: [{ collectionId: "users" }],
        where: { fieldFilter: { field: { fieldPath: "email" }, op: "EQUAL", value: { stringValue: email } } },
        limit: 1
      });
      let user;
      if (existing.length > 0) {
        user = existing[0];
        try {
          await firestore.updateDocument("users", user.id, { last_active_at: (/* @__PURE__ */ new Date()).toISOString() });
          user.last_active_at = (/* @__PURE__ */ new Date()).toISOString();
        } catch (e) {
        }
      } else {
        const shortId = deviceId.slice(-5) + Math.floor(100 + Math.random() * 900);
        user = await firestore.createDocument("users", {
          email,
          display_name: `Guest-${shortId}`,
          role: "user",
          plan_type: "free",
          created_at: (/* @__PURE__ */ new Date()).toISOString(),
          last_active_at: (/* @__PURE__ */ new Date()).toISOString()
        });
      }
      const token = await signJwtHs256({ id: user.id, email: user.email, role: user.role }, env.JWT_SECRET || "default_secret");
      return json({ success: true, token, user: sanitizeUser(user) });
    }
    if (url.pathname === "/api/auth/google" && request.method === "POST") {
      const body = await readJson(request);
      if (!body || !body.token) return json({ success: false, message: "invalid_body" }, { status: 400 });
      const tokenStr = body.token;
      const googleRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${tokenStr}`);
      if (!googleRes.ok) return json({ success: false, message: "Google login failed" }, { status: 400 });
      const ticket = await googleRes.json();
      const { email, name, sub: googleId, picture } = ticket;
      if (!email) return json({ success: false, message: "Email not provided by Google" }, { status: 400 });
      let user;
      const existingByGoogleId = await firestore.runQuery({
        from: [{ collectionId: "users" }],
        where: { fieldFilter: { field: { fieldPath: "google_id" }, op: "EQUAL", value: { stringValue: googleId } } },
        limit: 1
      });
      if (existingByGoogleId.length > 0) {
        user = existingByGoogleId[0];
        const updates = { last_active_at: (/* @__PURE__ */ new Date()).toISOString() };
        if (picture && user.avatar !== picture) {
          updates.avatar = picture;
        }
        try {
          await firestore.updateDocument("users", user.id, updates);
          user.last_active_at = updates.last_active_at;
        } catch (e) {
        }
      } else {
        const existingByEmail = await firestore.runQuery({
          from: [{ collectionId: "users" }],
          where: { fieldFilter: { field: { fieldPath: "email" }, op: "EQUAL", value: { stringValue: email } } },
          limit: 1
        });
        if (existingByEmail.length > 0) {
          user = existingByEmail[0];
          const updates = { google_id: googleId };
          if (picture) updates.avatar = picture;
          await firestore.updateDocument("users", user.id, updates);
        } else {
          user = await firestore.createDocument("users", {
            email,
            display_name: name,
            google_id: googleId,
            avatar: picture,
            role: "user",
            plan_type: "free",
            created_at: (/* @__PURE__ */ new Date()).toISOString()
          });
        }
      }
      const token = await signJwtHs256({ id: user.id, email: user.email, role: user.role }, env.JWT_SECRET || "default_secret");
      return json({ success: true, token, user: sanitizeUser(user) });
    }
    if (url.pathname === "/api/auth/login" && request.method === "POST") {
      const secret = requireJwtSecret(env);
      if (!secret) return json({ error: "missing_jwt_secret" }, { status: 500 });
      const body = await readJson(request);
      if (!body) return json({ success: false, message: "invalid_body" }, { status: 400 });
      const email = String(body.email || "").trim().toLowerCase();
      const password = String(body.password || "");
      if (!email || !password) return json({ success: false, message: "invalid_params" }, { status: 400 });
      const users = await firestore.runQuery({
        from: [{ collectionId: "users" }],
        where: { fieldFilter: { field: { fieldPath: "email" }, op: "EQUAL", value: { stringValue: email } } },
        limit: 1
      });
      const user = users[0];
      if (!user || !user.password_hash) return json({ success: false, message: "Invalid credentials" }, { status: 401 });
      const ok = await verifyPassword(password, String(user.password_hash));
      if (!ok) return json({ success: false, message: "Invalid credentials" }, { status: 401 });
      try {
        await firestore.updateDocument("users", user.id, { last_active_at: (/* @__PURE__ */ new Date()).toISOString() });
        user.last_active_at = (/* @__PURE__ */ new Date()).toISOString();
      } catch (e) {
      }
      const exp = Math.floor(Date.now() / 1e3) + 60 * 60 * 24 * 30;
      const token = await signJwtHs256({ id: user.id, exp }, secret);
      return json({ success: true, token, user: sanitizeUser(user) });
    }
    if (url.pathname === "/api/auth/guest" && request.method === "POST") {
      const secret = requireJwtSecret(env);
      if (!secret) return json({ error: "missing_jwt_secret" }, { status: 500 });
      const body = await readJson(request);
      if (!body) return json({ success: false, message: "invalid_body" }, { status: 400 });
      const deviceId = String(body.deviceId || "").trim();
      if (!deviceId) return json({ success: false, message: "invalid_params" }, { status: 400 });
      const email = `guest_${deviceId}@guest.local`;
      const users = await firestore.runQuery({
        from: [{ collectionId: "users" }],
        where: { fieldFilter: { field: { fieldPath: "email" }, op: "EQUAL", value: { stringValue: email } } },
        limit: 1
      });
      let user = users[0];
      if (!user) {
        const displayName = `Guest-${deviceId.slice(0, 6)}`;
        user = await firestore.createDocument("users", {
          email,
          password_hash: null,
          display_name: displayName,
          role: "user",
          plan_type: "free",
          status: "active",
          guest_device_id: deviceId,
          created_at: (/* @__PURE__ */ new Date()).toISOString(),
          updated_at: (/* @__PURE__ */ new Date()).toISOString()
        });
      }
      const exp = Math.floor(Date.now() / 1e3) + 60 * 60 * 24 * 30;
      const token = await signJwtHs256({ id: user.id, exp }, secret);
      return json({ success: true, token, user: sanitizeUser(user) });
    }
    if (url.pathname === "/api/auth/me" && request.method === "GET") {
      const secret = requireJwtSecret(env);
      if (!secret) return json({ error: "missing_jwt_secret" }, { status: 500 });
      const userId = await requireUserId(request, secret);
      if (!userId) return json({ success: false, message: "Unauthorized" }, { status: 401 });
      const user = await firestore.getDocument("users", userId);
      if (!user) return json({ success: false, message: "Unauthorized" }, { status: 401 });
      return json({ success: true, user: sanitizeUser(user) });
    }
    if (url.pathname === "/api/rooms" && request.method === "GET") {
      const auth = await requireAuthUserId(request, env);
      if ("error" in auth) return auth.error;
      const page = Math.max(1, Number(url.searchParams.get("page") || 1));
      const limit = Math.max(1, Math.min(50, Number(url.searchParams.get("limit") || 20)));
      const recentRooms = await firestore.runQuery({
        from: [{ collectionId: "exam_rooms" }],
        orderBy: [{ field: { fieldPath: "created_at" }, direction: "DESCENDING" }],
        limit: 100
        // Fetch up to 100 to filter in memory
      });
      const oneDayAgo = oneDayAgoIso();
      const filteredRooms = recentRooms.filter((r) => {
        return r.status === "waiting" || r.status === "in_progress" || r.status === "finished" && r.updated_at >= oneDayAgo;
      });
      const total = filteredRooms.length;
      const offset = (page - 1) * limit;
      const rooms = filteredRooms.slice(offset, offset + limit);
      if (rooms.length === 0) {
        return json({ success: true, data: [], pagination: { total, page, totalPages: Math.ceil(total / limit) } });
      }
      const roomIds = rooms.map((r) => r.id);
      const participantCounts = /* @__PURE__ */ new Map();
      for (const rId of roomIds) {
        const parts = await firestore.listDocuments(`exam_rooms/${rId}/participants`);
        participantCounts.set(rId, parts.length);
      }
      const data = rooms.map((r) => ({
        ...r,
        password: void 0,
        participant_count: participantCounts.get(r.id) || 0,
        RoomParticipants: []
      }));
      return json({
        success: true,
        data,
        pagination: { total, page, totalPages: Math.ceil(total / limit) }
      });
    }
    if (url.pathname === "/api/rooms" && request.method === "POST") {
      const auth = await requireAuthUserId(request, env);
      if ("error" in auth) return auth.error;
      const body = await readJson(request);
      if (!body) return json({ success: false, message: "invalid_body" }, { status: 400 });
      const name = String(body.name || "").trim();
      const mode = String(body.mode || "").trim();
      if (!name || !["exam", "tutor", "event"].includes(mode)) {
        return json({ success: false, message: "invalid_params" }, { status: 400 });
      }
      const subject = body.subject ? String(body.subject) : null;
      const category = body.category ? String(body.category) : null;
      const maxParticipants = Math.min(20, Math.max(2, Number(body.max_participants || 20)));
      const questionCount = Math.max(1, Math.min(200, Number(body.question_count || 20)));
      const timeLimit = Math.max(5, Math.min(60, Number(body.time_limit || 60)));
      const password = body.password ? String(body.password) : null;
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      const settings = JSON.stringify({ time_limit: timeLimit });
      const filters = [];
      if (subject) filters.push({ fieldFilter: { field: { fieldPath: "subject" }, op: "EQUAL", value: { stringValue: subject } } });
      if (category) filters.push({ fieldFilter: { field: { fieldPath: "category" }, op: "EQUAL", value: { stringValue: category } } });
      let query = { from: [{ collectionId: "questions" }] };
      if (filters.length === 1) query.where = filters[0];
      else if (filters.length > 1) query.where = { compositeFilter: { op: "AND", filters } };
      let selectedIds = [];
      try {
        const allQs = await firestore.runQuery(query);
        const shuffled = allQs.sort(() => Math.random() - 0.5);
        selectedIds = shuffled.slice(0, questionCount).map((q) => q.id);
      } catch (e) {
      }
      const room = await firestore.createDocument("exam_rooms", {
        code,
        name,
        mode,
        host_user_id: auth.userId,
        subject,
        category,
        max_participants: maxParticipants,
        question_count: selectedIds.length > 0 ? selectedIds.length : questionCount,
        status: "waiting",
        settings,
        password,
        question_ids: JSON.stringify(selectedIds),
        created_at: (/* @__PURE__ */ new Date()).toISOString(),
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      });
      await firestore.createDocument(`exam_rooms/${room.id}/participants`, {
        user_id: auth.userId,
        score: 0,
        status: "joined",
        current_question_index: 0,
        created_at: (/* @__PURE__ */ new Date()).toISOString(),
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      }, auth.userId);
      return json({ success: true, data: room }, { status: 201 });
    }
    if (url.pathname === "/api/rooms/join" && request.method === "POST") {
      const auth = await requireAuthUserId(request, env);
      if ("error" in auth) return auth.error;
      const body = await readJson(request);
      if (!body) return json({ success: false, message: "invalid_body" }, { status: 400 });
      const code = String(body.code || "").trim().toUpperCase();
      const password = body.password ? String(body.password) : null;
      if (!code) return json({ success: false, message: "invalid_params" }, { status: 400 });
      const rooms = await firestore.runQuery({
        from: [{ collectionId: "exam_rooms" }],
        where: { fieldFilter: { field: { fieldPath: "code" }, op: "EQUAL", value: { stringValue: code } } },
        limit: 1
      });
      const room = rooms[0];
      if (!room) return json({ success: false, message: "Room not found" }, { status: 404 });
      if (room.password) {
        if (!password) return json({ success: false, message: "Password required", requirePassword: true }, { status: 403 });
        if (password !== String(room.password)) return json({ success: false, message: "Invalid password" }, { status: 403 });
      }
      if (String(room.status) !== "waiting") {
        return json({ success: false, message: "Room is already in progress or finished" }, { status: 400 });
      }
      const existingPart = await firestore.getDocument(`exam_rooms/${room.id}/participants`, auth.userId);
      if (!existingPart) {
        await firestore.createDocument(`exam_rooms/${room.id}/participants`, {
          user_id: auth.userId,
          score: 0,
          status: "joined",
          current_question_index: 0,
          created_at: (/* @__PURE__ */ new Date()).toISOString(),
          updated_at: (/* @__PURE__ */ new Date()).toISOString()
        }, auth.userId);
      }
      return json({ success: true, data: { ...room, password: void 0 } });
    }
    const roomIdMatch = url.pathname.match(/^\/api\/rooms\/([a-zA-Z0-9_-]+)$/);
    if (roomIdMatch && request.method === "GET") {
      const auth = await requireAuthUserId(request, env);
      if ("error" in auth) return auth.error;
      const roomId = roomIdMatch[1];
      const room = await firestore.getDocument("exam_rooms", roomId);
      if (!room) return json({ success: false, message: "Room not found" }, { status: 404 });
      const participants = await firestore.listDocuments(`exam_rooms/${roomId}/participants`);
      const userIds = participants.map((p) => p.user_id);
      const uniqueUserIds = Array.from(new Set(userIds));
      const usersMap = /* @__PURE__ */ new Map();
      for (let i = 0; i < uniqueUserIds.length; i += 30) {
        const chunk = uniqueUserIds.slice(i, i + 30);
        const userPromises = chunk.map((id) => firestore.getDocument("users", String(id)));
        const users = await Promise.all(userPromises);
        for (const u of users) {
          if (u && u.id) usersMap.set(String(u.id), u);
        }
      }
      const populatedParticipants = participants.map((p) => ({
        ...p,
        User: usersMap.get(String(p.user_id)) ? sanitizeUser(usersMap.get(String(p.user_id))) : { display_name: "Unknown", avatar: null }
      }));
      const questionIds = room.question_ids ? JSON.parse(String(room.question_ids)) : [];
      const questionsMap = /* @__PURE__ */ new Map();
      for (let i = 0; i < questionIds.length; i += 30) {
        const chunk = questionIds.slice(i, i + 30);
        const qPromises = chunk.map((id) => firestore.getDocument("questions", id));
        const qs = await Promise.all(qPromises);
        for (const q of qs) {
          if (q && q.id) questionsMap.set(q.id, normalizeQuestion(q));
        }
      }
      const questions = questionIds.map((id) => questionsMap.get(id)).filter(Boolean);
      return json({
        success: true,
        data: {
          ...room,
          password: void 0,
          Host: usersMap.get(String(room.host_user_id)) ? sanitizeUser(usersMap.get(String(room.host_user_id))) : { id: room.host_user_id, display_name: null },
          RoomParticipants: populatedParticipants,
          questions
        }
      });
    }
    if (roomIdMatch && request.method === "DELETE") {
      const auth = await requireAuthUserId(request, env);
      if ("error" in auth) return auth.error;
      const roomId = roomIdMatch[1];
      const room = await firestore.getDocument("exam_rooms", roomId);
      if (!room) return json({ success: true, message: "Room already deleted or not found" });
      if (String(room.host_user_id) !== auth.userId) {
        return json({ success: false, message: "Not authorized to delete this room" }, { status: 403 });
      }
      const participants = await firestore.listDocuments(`exam_rooms/${roomId}/participants`);
      for (const p of participants) {
        await firestore.deleteDocument(`exam_rooms/${roomId}/participants`, p.id);
      }
      await firestore.deleteDocument("exam_rooms", roomId);
      return json({ success: true, message: "Room deleted successfully" });
    }
    if (url.pathname.startsWith("/api/")) {
      try {
        const saConfig2 = parseServiceAccount(env);
        if (!saConfig2) return json({ error: "missing_firebase_config" }, { status: 500 });
        const firestore2 = new FirestoreClient(saConfig2);
        if (url.pathname === "/api/questions/subjects" && request.method === "GET") {
          const qs = await firestore2.runQuery({ from: [{ collectionId: "questions" }] });
          const subjects = /* @__PURE__ */ new Set();
          for (const q of qs) if (q.subject) subjects.add(q.subject);
          return json({ success: true, data: Array.from(subjects).sort() });
        }
        if (url.pathname === "/api/questions/years" && request.method === "GET") {
          const qs = await firestore2.runQuery({ from: [{ collectionId: "questions" }] });
          const years = /* @__PURE__ */ new Set();
          for (const q of qs) if (q.exam_year) years.add(String(q.exam_year));
          return json({ success: true, data: Array.from(years).sort((a, b) => b.localeCompare(a)) });
        }
        if (url.pathname === "/api/questions/sets" && request.method === "GET") {
          const qs = await firestore2.runQuery({ from: [{ collectionId: "questions" }] });
          const sets = /* @__PURE__ */ new Set();
          for (const q of qs) if (q.exam_set) sets.add(q.exam_set);
          return json({ success: true, data: Array.from(sets).sort() });
        }
        if (url.pathname === "/api/questions/categories" && request.method === "GET") {
          const subject = url.searchParams.get("subject");
          const query = { from: [{ collectionId: "questions" }] };
          if (subject && subject !== "undefined" && subject !== "null") {
            query.where = { fieldFilter: { field: { fieldPath: "subject" }, op: "EQUAL", value: { stringValue: subject } } };
          }
          const qs = await firestore2.runQuery(query);
          const allTags = /* @__PURE__ */ new Set();
          for (const q of qs) {
            if (q.category) {
              q.category.split(",").forEach((tag) => {
                const t = tag.trim();
                if (t) allTags.add(t);
              });
            }
            if (q.catalogs && Array.isArray(q.catalogs)) {
              q.catalogs.forEach((tag) => {
                if (tag) allTags.add(tag.trim());
              });
            }
          }
          return json({ success: true, data: Array.from(allTags).sort() });
        }
        const qIdMatch = url.pathname.match(/^\/api\/questions\/([a-zA-Z0-9_-]+)$/);
        if (qIdMatch && request.method === "GET") {
          const q = await firestore2.getDocument("questions", qIdMatch[1]);
          if (!q) return json({ success: false, message: "Question not found" }, { status: 404 });
          return json({ success: true, data: normalizeQuestion(q) });
        }
        if (url.pathname === "/api/questions" && request.method === "GET") {
          const category = url.searchParams.get("category");
          const subject = url.searchParams.get("subject");
          const exam_year = url.searchParams.get("exam_year");
          const exam_set = url.searchParams.get("exam_set");
          const limitStr = url.searchParams.get("limit") || "50";
          const pageStr = url.searchParams.get("page") || "1";
          const orderBy = url.searchParams.get("orderBy");
          const search = url.searchParams.get("search");
          const limit = parseInt(limitStr, 10);
          const page = parseInt(pageStr, 10);
          const offset = (page - 1) * limit;
          const filters = [];
          if (subject && subject !== "undefined" && subject !== "null") {
            filters.push({ fieldFilter: { field: { fieldPath: "subject" }, op: "EQUAL", value: { stringValue: subject } } });
          }
          if (exam_year && exam_year !== "undefined" && exam_year !== "null") {
            filters.push({ fieldFilter: { field: { fieldPath: "exam_year" }, op: "EQUAL", value: { stringValue: exam_year } } });
          }
          if (exam_set && exam_set !== "undefined" && exam_set !== "null") {
            filters.push({ fieldFilter: { field: { fieldPath: "exam_set" }, op: "EQUAL", value: { stringValue: exam_set } } });
          }
          let query = { from: [{ collectionId: "questions" }] };
          if (filters.length === 1) {
            query.where = filters[0];
          } else if (filters.length > 1) {
            query.where = { compositeFilter: { op: "AND", filters } };
          }
          const allQs = await firestore2.runQuery(query);
          let rows = [];
          for (const data of allQs) {
            let match = true;
            if (search) {
              const searchStr = search.toLowerCase();
              const qText = (data.question_text || "").toLowerCase();
              if (!qText.includes(searchStr)) match = false;
            }
            if (match && category && category !== "undefined" && category !== "null") {
              const catStr = category.toLowerCase();
              const qCat = (data.category || "").toLowerCase();
              const qCatalogs = Array.isArray(data.catalogs) ? data.catalogs.join(",").toLowerCase() : (data.catalogs || "").toLowerCase();
              if (!qCat.includes(catStr) && !qCatalogs.includes(catStr)) match = false;
            }
            if (match) rows.push(normalizeQuestion(data));
          }
          if (orderBy === "random") {
            rows.sort(() => Math.random() - 0.5);
          } else {
            rows.sort((a, b) => String(a.id).localeCompare(String(b.id)));
          }
          const count = rows.length;
          rows = rows.slice(offset, offset + limit);
          return json({
            success: true,
            data: {
              rows,
              total: count,
              page,
              totalPages: Math.ceil(count / limit) || 1
            }
          });
        }
        if (url.pathname === "/api/exams/submit" && request.method === "POST") {
          const auth = await requireAuthUserId(request, env);
          if ("error" in auth) return auth.error;
          const body = await readJson(request);
          if (!body) return json({ success: false, message: "invalid_body" }, { status: 400 });
          const { answers, mode, classroom_id, total_time } = body;
          if (!answers || typeof answers !== "object") return json({ success: false, message: "invalid_params" }, { status: 400 });
          const questionIds = Object.keys(answers);
          if (questionIds.length === 0) return json({ success: false, message: "No answers provided" }, { status: 400 });
          const questionsMap = /* @__PURE__ */ new Map();
          for (let i = 0; i < questionIds.length; i += 30) {
            const chunk = questionIds.slice(i, i + 30);
            const qPromises = chunk.map((id) => firestore2.getDocument("questions", String(id)));
            const qs = await Promise.all(qPromises);
            for (const q of qs) {
              if (q && q.id) questionsMap.set(q.id, q);
            }
          }
          let score = 0;
          let total_score = 0;
          const subject_scores = {};
          const skill_scores = {};
          const questionsDetail = [];
          for (const qId of questionIds) {
            const rawQ = questionsMap.get(qId);
            if (!rawQ) continue;
            const q = normalizeQuestion(rawQ);
            total_score++;
            const userAnswer = answers[qId];
            const correctNormalized = q.correct_answer ? String(q.correct_answer).trim().toLowerCase() : "";
            const userNormalized = userAnswer ? String(userAnswer).trim().toLowerCase() : "";
            const isCorrect = userNormalized === correctNormalized;
            if (isCorrect) score++;
            if (q.subject) {
              if (!subject_scores[q.subject]) subject_scores[q.subject] = { score: 0, total: 0 };
              subject_scores[q.subject].total++;
              if (isCorrect) subject_scores[q.subject].score++;
            }
            if (q.skill) {
              if (!skill_scores[q.skill]) skill_scores[q.skill] = { score: 0, total: 0 };
              skill_scores[q.skill].total++;
              if (isCorrect) skill_scores[q.skill].score++;
            }
            questionsDetail.push({
              question_id: q.id,
              question_text: q.question_text,
              user_answer: userAnswer,
              correct_answer: q.correct_answer,
              is_correct: isCorrect,
              explanation: q.explanation,
              choice_a: q.choice_a,
              choice_b: q.choice_b,
              choice_c: q.choice_c,
              choice_d: q.choice_d,
              category: q.category,
              subject: q.subject,
              skill: q.skill
            });
          }
          const examResult = await firestore2.createDocument("exam_results", {
            user_id: auth.userId,
            classroom_id: classroom_id || null,
            score,
            total_score,
            mode: mode || "solo",
            subject_scores,
            skill_scores,
            questions: questionsDetail,
            time_taken: total_time || 0,
            taken_at: (/* @__PURE__ */ new Date()).toISOString()
          });
          return json({ success: true, data: examResult }, { status: 201 });
        }
        if (url.pathname === "/api/exams/history" && request.method === "GET") {
          const auth = await requireAuthUserId(request, env);
          if ("error" in auth) return auth.error;
          const results = await firestore2.runQuery({
            from: [{ collectionId: "exam_results" }],
            where: { fieldFilter: { field: { fieldPath: "user_id" }, op: "EQUAL", value: { stringValue: auth.userId } } },
            orderBy: [{ field: { fieldPath: "taken_at" }, direction: "DESCENDING" }]
          });
          return json({ success: true, data: results });
        }
        if (url.pathname === "/api/community/threads" && request.method === "GET") {
          const category = url.searchParams.get("category");
          const search = url.searchParams.get("search");
          const limitStr = url.searchParams.get("limit") || "10";
          const limit = parseInt(limitStr, 10);
          let query = {
            from: [{ collectionId: "threads" }],
            orderBy: [{ field: { fieldPath: "created_at" }, direction: "DESCENDING" }],
            limit: { value: limit }
            // FirestoreREST limit expects integer or object? The struct is usually { value: limit } for Protobuf Int32Value. 
            // Wait, firestore REST API `limit` is just an integer in the query object!
          };
          query.limit = limit;
          const filters = [];
          if (category && category !== "all" && category !== "undefined" && category !== "null") {
            filters.push({ fieldFilter: { field: { fieldPath: "category" }, op: "EQUAL", value: { stringValue: category } } });
          }
          if (filters.length === 1) {
            query.where = filters[0];
          } else if (filters.length > 1) {
            query.where = { compositeFilter: { op: "AND", filters } };
          }
          let allThreads = await firestore2.runQuery(query);
          if (search && search !== "undefined") {
            const searchLower = search.toLowerCase();
            allThreads = allThreads.filter((t) => {
              if (t.title && t.title.toLowerCase().includes(searchLower)) return true;
              if (t.tags && Array.isArray(t.tags) && t.tags.some((tag) => tag.toLowerCase().includes(searchLower))) return true;
              return false;
            });
          }
          const userIds = [...new Set(allThreads.map((t) => t.user_id).filter(Boolean))];
          const usersMap = /* @__PURE__ */ new Map();
          for (let i = 0; i < userIds.length; i += 30) {
            const chunk = userIds.slice(i, i + 30);
            const userPromises = chunk.map((id) => firestore2.getDocument("users", String(id)));
            const users = await Promise.all(userPromises);
            for (const u of users) {
              if (u && u.id) usersMap.set(String(u.id), u);
            }
          }
          allThreads = allThreads.map((t) => {
            const u = usersMap.get(String(t.user_id));
            if (u) {
              t.User = {
                id: u.id,
                display_name: u.display_name || "Unknown User",
                avatar: u.avatar || null,
                plan_type: u.plan_type || "free"
              };
            } else {
              t.User = { id: t.user_id, display_name: "Unknown User" };
            }
            if (!t.stats) {
              t.stats = { views: t.views || 0, likes: t.likes || 0, comments_count: 0 };
            }
            return t;
          });
          let nextCursor = null;
          if (allThreads.length > 0) {
            nextCursor = allThreads[allThreads.length - 1].id;
          }
          return json({ success: true, threads: allThreads, nextCursor });
        }
        if (url.pathname === "/api/community/threads" && request.method === "POST") {
          const auth = await requireAuthUserId(request, env);
          if ("error" in auth) return auth.error;
          const body = await readJson(request);
          if (!body || !body.title) {
            return json({ success: false, error: "Title is required" }, { status: 400 });
          }
          const threadData = {
            user_id: auth.userId,
            title: body.title,
            content: body.content || "",
            category: body.category || "general",
            background_style: body.background_style || null,
            tags: body.tags || [],
            image_url: body.image_base64 || null,
            likes: 0,
            created_at: (/* @__PURE__ */ new Date()).toISOString(),
            updated_at: (/* @__PURE__ */ new Date()).toISOString(),
            deleted_at: null
          };
          const created = await firestore2.createDocument("threads", threadData);
          return json({ success: true, data: created }, { status: 201 });
        }
        const examIdMatch = url.pathname.match(/^\/api\/exams\/([a-zA-Z0-9_-]+)$/);
        if (examIdMatch && request.method === "GET") {
          const auth = await requireAuthUserId(request, env);
          if ("error" in auth) return auth.error;
          const result = await firestore2.getDocument("exam_results", examIdMatch[1]);
          if (!result) return json({ success: false, message: "Result not found" }, { status: 404 });
          return json({ success: true, data: result });
        }
        const threadIdMatch = url.pathname.match(/^\/api\/community\/threads\/([a-zA-Z0-9_-]+)$/);
        if (threadIdMatch && request.method === "GET") {
          const threadDoc = await firestore2.getDocument("threads", threadIdMatch[1]);
          if (!threadDoc) return notFound();
          if (!threadDoc.stats) threadDoc.stats = { views: threadDoc.views || 0, likes: threadDoc.likes || 0, comments_count: 0 };
          const u = await firestore2.getDocument("users", String(threadDoc.user_id));
          if (u) {
            threadDoc.User = { id: u.id, display_name: u.display_name || "Unknown User", avatar: u.avatar || null, plan_type: u.plan_type || "free" };
          }
          return json(threadDoc);
        }
        const commentsMatch = url.pathname.match(/^\/api\/community\/comments\/([a-zA-Z0-9_-]+)$/);
        if (commentsMatch && request.method === "GET") {
          const threadId = commentsMatch[1];
          let comments = await firestore2.runQuery({
            from: [{ collectionId: "comments" }],
            where: {
              fieldFilter: {
                field: { fieldPath: "thread_id" },
                op: "EQUAL",
                value: { stringValue: threadId }
              }
            }
          });
          const userIds = [...new Set(comments.map((c) => c.user_id).filter(Boolean))];
          const usersMap = /* @__PURE__ */ new Map();
          for (let i = 0; i < userIds.length; i += 30) {
            const chunk = userIds.slice(i, i + 30);
            const userPromises = chunk.map((id) => firestore2.getDocument("users", String(id)));
            const users = await Promise.all(userPromises);
            for (const u of users) {
              if (u && u.id) usersMap.set(String(u.id), u);
            }
          }
          comments = comments.map((c) => {
            const u = usersMap.get(String(c.user_id));
            if (u) {
              c.User = { id: u.id, display_name: u.display_name || "Unknown User", avatar: u.avatar || null, plan_type: u.plan_type || "free" };
            } else {
              c.User = { id: c.user_id, display_name: "Unknown User" };
            }
            c.likes = c.likes || 0;
            return c;
          });
          return json(comments);
        }
        if (url.pathname === "/api/community/comments" && request.method === "POST") {
          const auth = await requireAuthUserId(request, env);
          if ("error" in auth) return auth.error;
          const body = await request.json();
          const commentData = {
            thread_id: body.thread_id,
            content: body.content,
            parent_id: body.parent_id || null,
            user_id: auth.userId,
            likes: 0,
            created_at: (/* @__PURE__ */ new Date()).toISOString(),
            updated_at: (/* @__PURE__ */ new Date()).toISOString()
          };
          const created = await firestore2.createDocument("comments", commentData);
          return json({ success: true, data: created });
        }
        const commentLikeMatch = url.pathname.match(/^\/api\/community\/comments\/([a-zA-Z0-9_-]+)\/like$/);
        if (commentLikeMatch && request.method === "POST") {
          const auth = await requireAuthUserId(request, env);
          if ("error" in auth) return auth.error;
          const commentId = commentLikeMatch[1];
          const comment = await firestore2.getDocument("comments", commentId);
          if (!comment) return notFound();
          const currentLikes = comment.likes || 0;
          await firestore2.updateDocument("comments", commentId, { likes: currentLikes + 1 });
          return json({ success: true, likes: currentLikes + 1 });
        }
        if (url.pathname === "/api/news" && request.method === "GET") {
          try {
            const agency = url.searchParams.get("agency");
            const search = url.searchParams.get("search");
            const news = await firestore2.runQuery({ from: [{ collectionId: "news" }], limit: 100 });
            const category = url.searchParams.get("category");
            let filteredNews = news.filter((n) => n.status !== "expired");
            if (category && category !== "undefined") {
              if (category === "!\u0E07\u0E32\u0E19\u0E23\u0E32\u0E0A\u0E01\u0E32\u0E23") {
                filteredNews = filteredNews.filter((n) => n.category !== "\u0E07\u0E32\u0E19\u0E23\u0E32\u0E0A\u0E01\u0E32\u0E23");
              } else {
                filteredNews = filteredNews.filter((n) => n.category === category);
              }
            }
            const ministry = url.searchParams.get("ministry");
            if (ministry && ministry !== "undefined") {
              filteredNews = filteredNews.filter((n) => (n.metadata && n.metadata.ministry || "\u0E44\u0E21\u0E48\u0E23\u0E30\u0E1A\u0E38\u0E01\u0E23\u0E30\u0E17\u0E23\u0E27\u0E07") === ministry);
            }
            if (agency && agency !== "undefined") {
              filteredNews = filteredNews.filter((n) => (n.metadata && n.metadata.department || n.agency || "\u0E44\u0E21\u0E48\u0E23\u0E30\u0E1A\u0E38\u0E01\u0E23\u0E21") === agency);
            }
            if (search && search !== "undefined") {
              const sLower = search.toLowerCase();
              filteredNews = filteredNews.filter((n) => n.title?.toLowerCase().includes(sLower) || n.summary?.toLowerCase().includes(sLower));
            }
            filteredNews.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
            return json({ success: true, data: filteredNews });
          } catch (e) {
            return json({ success: true, data: [] });
          }
        }
        if (url.pathname === "/api/news" && request.method === "POST") {
          const auth = await requireAuthUserId(request, env);
          if ("error" in auth) return auth.error;
          const body = await readJson(request);
          if (!body) return json({ success: false, message: "invalid_body" }, { status: 400 });
          body.created_at = (/* @__PURE__ */ new Date()).toISOString();
          body.updated_at = (/* @__PURE__ */ new Date()).toISOString();
          body.views = 0;
          const created = await firestore2.createDocument("news", body);
          return json({ success: true, data: created });
        }
        if (url.pathname === "/api/news/agency-stats" && request.method === "GET") {
          try {
            const news = await firestore2.runQuery({ from: [{ collectionId: "news" }], limit: 1e3 });
            const govNews = news.filter((n) => n.category === "\u0E07\u0E32\u0E19\u0E23\u0E32\u0E0A\u0E01\u0E32\u0E23" && n.status !== "expired");
            const statsMap = {};
            let countCivil = 0;
            let countEmployee = 0;
            let countOther = 0;
            govNews.forEach((job) => {
              const ministry = job.metadata && job.metadata.ministry || "\u0E44\u0E21\u0E48\u0E23\u0E30\u0E1A\u0E38\u0E01\u0E23\u0E30\u0E17\u0E23\u0E27\u0E07";
              const department = job.metadata && job.metadata.department || job.agency || "\u0E44\u0E21\u0E48\u0E23\u0E30\u0E1A\u0E38\u0E01\u0E23\u0E21";
              let jobCount = job.metadata && job.metadata.vacancy_count ? parseInt(job.metadata.vacancy_count) : 1;
              if (isNaN(jobCount)) jobCount = 1;
              const pType = job.metadata && job.metadata.position_type || job.recruitment_type || "";
              if (pType.includes("\u0E02\u0E49\u0E32\u0E23\u0E32\u0E0A\u0E01\u0E32\u0E23")) countCivil += jobCount;
              else if (pType.includes("\u0E1E\u0E19\u0E31\u0E01\u0E07\u0E32\u0E19\u0E23\u0E32\u0E0A\u0E01\u0E32\u0E23")) countEmployee += jobCount;
              else countOther += jobCount;
              if (!statsMap[ministry]) {
                statsMap[ministry] = { ministry, departments: {} };
              }
              if (!statsMap[ministry].departments[department]) {
                statsMap[ministry].departments[department] = { department, count: 0, logo: job.metadata && job.metadata.agency_logo || null };
              }
              statsMap[ministry].departments[department].count += jobCount;
            });
            const formattedStats = Object.values(statsMap).map((m) => ({
              ministry: m.ministry,
              totalCount: Object.values(m.departments).reduce((sum, d) => sum + d.count, 0),
              departments: Object.values(m.departments).sort((a, b) => b.count - a.count)
            })).sort((a, b) => b.totalCount - a.totalCount);
            return json({
              success: true,
              data: formattedStats,
              jobTypes: { civil: countCivil, employee: countEmployee, other: countOther }
            });
          } catch (e) {
            return json({ success: false, data: [] });
          }
        }
        const ocscJobMatch = url.pathname.match(/^\/api\/news\/ocsc-job\/(\d+)$/);
        if (ocscJobMatch && request.method === "GET") {
          try {
            const id = ocscJobMatch[1];
            const response = await fetch(`https://jobapp.ocsc.go.th/jobapi/portal/jobs/${id}`);
            if (!response.ok) {
              return json({ success: false, message: "failed_to_fetch_ocsc" }, { status: response.status });
            }
            const data = await response.json();
            return json({ success: true, data });
          } catch (e) {
            return json({ success: false, message: "error" }, { status: 500 });
          }
        }
        const newsIdMatch = url.pathname.match(/^\/api\/news\/([a-zA-Z0-9_-]+)$/);
        if (newsIdMatch && request.method === "GET") {
          try {
            const id = newsIdMatch[1];
            const doc = await firestore2.getDocument("news", id);
            if (!doc) return json({ success: false, message: "not_found" }, { status: 404 });
            return json({ success: true, data: doc });
          } catch (e) {
            return json({ success: false, message: "error" }, { status: 500 });
          }
        }
        if (newsIdMatch && request.method === "PUT") {
          const auth = await requireAuthUserId(request, env);
          if ("error" in auth) return auth.error;
          const id = newsIdMatch[1];
          const body = await readJson(request);
          body.updated_at = (/* @__PURE__ */ new Date()).toISOString();
          const updated = await firestore2.updateDocument("news", id, body);
          return json({ success: true, data: updated });
        }
        if (newsIdMatch && request.method === "DELETE") {
          const auth = await requireAuthUserId(request, env);
          if ("error" in auth) return auth.error;
          const id = newsIdMatch[1];
          await firestore2.deleteDocument("news", id);
          return json({ success: true, message: "Deleted" });
        }
        const newsFeatureMatch = url.pathname.match(/^\/api\/news\/([a-zA-Z0-9_-]+)\/feature$/);
        if (newsFeatureMatch && request.method === "PUT") {
          const auth = await requireAuthUserId(request, env);
          if ("error" in auth) return auth.error;
          const id = newsFeatureMatch[1];
          const item = await firestore2.getDocument("news", id);
          if (!item) return json({ success: false, message: "Not found" }, { status: 404 });
          const updated = await firestore2.updateDocument("news", id, { is_featured: !item.is_featured });
          return json({ success: true, data: updated });
        }
        if (url.pathname === "/api/news/scrape" && request.method === "POST") {
          const auth = await requireAuthUserId(request, env);
          if ("error" in auth) return auth.error;
          const body = await readJson(request);
          return json({
            success: true,
            data: {
              title: "\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E14\u0E36\u0E07\u0E2D\u0E31\u0E15\u0E42\u0E19\u0E21\u0E31\u0E15\u0E34",
              summary: "\u0E14\u0E36\u0E07\u0E40\u0E19\u0E37\u0E49\u0E2D\u0E2B\u0E32\u0E08\u0E32\u0E01 " + (body?.url || ""),
              agency: "\u0E2D\u0E49\u0E32\u0E07\u0E2D\u0E34\u0E07\u0E08\u0E32\u0E01 URL",
              metadata: {
                announcement_url: body?.url || ""
              }
            }
          });
        }
        if (url.pathname === "/api/news/agency-stats" && request.method === "GET") {
          try {
            const news = await firestore2.runQuery({ from: [{ collectionId: "news" }], limit: 1e3 });
            const agencies = /* @__PURE__ */ new Map();
            news.forEach((item) => {
              const agency = item.agency || item.metadata && item.metadata.organization;
              if (agency) {
                agencies.set(agency, (agencies.get(agency) || 0) + 1);
              }
            });
            const stats = Array.from(agencies.entries()).map(([name, count]) => ({ name, job_count: count }));
            return json({ success: true, data: stats });
          } catch (e) {
            return json({ success: true, data: [] });
          }
        }
        if (url.pathname === "/api/news/popular-keywords" && request.method === "GET") {
          return json({ success: true, data: [] });
        }
        if (url.pathname === "/api/news/sources/all" && request.method === "GET") {
          try {
            const sources = await firestore2.runQuery({ from: [{ collectionId: "news_sources" }] });
            return json({ success: true, data: sources });
          } catch (e) {
            return json({ success: true, data: [] });
          }
        }
        if (url.pathname === "/api/scraper/jobs" && request.method === "POST") {
          const body = await readJson(request);
          if (!body) return json({ success: false, message: "invalid_body" }, { status: 400 });
          const apiKey = request.headers.get("x-api-key");
          if (apiKey !== "dev_scraper_key") {
            return json({ success: false, message: "Unauthorized" }, { status: 401 });
          }
          const jobData = body;
          jobData.created_at = (/* @__PURE__ */ new Date()).toISOString();
          jobData.published_at = (/* @__PURE__ */ new Date()).toISOString();
          const created = await firestore2.createDocument("news", jobData);
          return json({ success: true, data: created });
        }
        const adsServeMatch = url.pathname.match(/^\/api\/ads\/serve/);
        if (adsServeMatch && request.method === "GET") {
          return json({ success: true, served: false });
        }
        if (url.pathname === "/api/ads/admin/config" && request.method === "GET") {
          return json({
            success: true,
            houseAdTitle: "\u0E40\u0E15\u0E23\u0E35\u0E22\u0E21\u0E2A\u0E2D\u0E1A \u0E01.\u0E1E. \u0E1C\u0E48\u0E32\u0E19\u0E09\u0E25\u0E38\u0E22",
            houseAdDescription: "\u0E40\u0E02\u0E49\u0E32\u0E01\u0E25\u0E38\u0E48\u0E21\u0E15\u0E34\u0E27\u0E1F\u0E23\u0E35 \u0E41\u0E08\u0E01\u0E02\u0E49\u0E2D\u0E2A\u0E2D\u0E1A\u0E41\u0E21\u0E48\u0E19\u0E46 \u0E15\u0E34\u0E27\u0E40\u0E15\u0E2D\u0E23\u0E4C\u0E2D\u0E31\u0E19\u0E14\u0E31\u0E1A 1",
            houseAdImage: "https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            houseAdUrl: "/lobby"
          });
        }
        if (url.pathname === "/api/users/stats") return json({ success: true, stats: { total_tests: 0, avg_score: 0 } });
        if (url.pathname === "/api/payments/plans" && request.method === "GET") {
          return json({ success: true, plans: [{ id: "pro_monthly", name: "Pro Pass", price: 99, duration_days: 30 }, { id: "premium_yearly", name: "Premium Pass", price: 890, duration_days: 365 }, { id: "lifetime", name: "Lifetime VIP", price: 2990, duration_days: 9999 }] });
        }
        if (url.pathname === "/api/assets" && request.method === "GET") {
          return json({ success: true, data: [
            { id: "bg1", type: "background", url: "https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80", name: "Classic" },
            { id: "bg2", type: "background", url: "https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80", name: "Space" },
            { id: "fr1", type: "frame", url: "https://via.placeholder.com/800x800.png?text=Gold+Frame", name: "Gold" }
          ] });
        }
        if (url.pathname === "/api/public/settings") return json({ success: true, settings: {} });
        if (url.pathname === "/api/groups") return json({ success: true, groups: [] });
        if (url.pathname === "/api/community/tags/trending") return json([]);
        if (url.pathname === "/api/friends/list") return json({ success: true, friends: [] });
        if (url.pathname === "/api/users/leaderboard") return json({ success: true, leaderboard: [] });
        if (url.pathname === "/api/admin/stats") return json({ revenue: { total: 0, monthly: 0, yearly: 0, pending: 0, trend: [] }, conversionRate: 0, activeUsers: 0, commercialViability: [], painPoints: [], communityHealth: {} });
        if (url.pathname === "/api/admin/users" && request.method === "GET") {
          const auth = await requireAuthUserId(request, env);
          if ("error" in auth) return auth.error;
          const users = await firestore2.runQuery({ from: [{ collectionId: "users" }], orderBy: [{ field: { fieldPath: "created_at" }, direction: "DESCENDING" }], limit: 1e3 });
          return json(users);
        }
        if (url.pathname === "/api/admin/businesses" && request.method === "GET") {
          const auth = await requireAuthUserId(request, env);
          if ("error" in auth) return auth.error;
          const businesses = await firestore2.runQuery({ from: [{ collectionId: "businesses" }], limit: 1e3 });
          businesses.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
          return json(businesses);
        }
        if (url.pathname === "/api/admin/payments" && request.method === "GET") {
          const auth = await requireAuthUserId(request, env);
          if ("error" in auth) return auth.error;
          const payments = await firestore2.runQuery({ from: [{ collectionId: "payments" }], orderBy: [{ field: { fieldPath: "created_at" }, direction: "DESCENDING" }], limit: 1e3 });
          return json(payments);
        }
        if (url.pathname === "/api/admin/threads" && request.method === "GET") {
          const auth = await requireAuthUserId(request, env);
          if ("error" in auth) return auth.error;
          const threads = await firestore2.runQuery({ from: [{ collectionId: "threads" }], orderBy: [{ field: { fieldPath: "created_at" }, direction: "DESCENDING" }], limit: 1e3 });
          return json({ threads, pagination: { page: 1, totalPages: 1, total: threads.length } });
        }
        if (url.pathname === "/api/admin/scraper/start" && request.method === "POST") {
          mockScraperRunning = true;
          mockScraperLogs = ["[System] Initiating Real OCSC Scraper job...", "[System] Connecting to data source (job.ocsc.go.th)..."];
          const runScraper = /* @__PURE__ */ __name(async () => {
            try {
              mockScraperLogs.push("[Network] Fetching latest announcements from OCSC...");
              const targetUrl = "https://jobapp.ocsc.go.th/jobapi/portal/jobs";
              console.log("Fetching URL:", targetUrl);
              const res = await fetch(targetUrl, {
                headers: {
                  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
                }
              });
              if (!res.ok) {
                mockScraperLogs.push(`[Error] OCSC API returned status ${res.status}.`);
                mockScraperRunning = false;
                return;
              }
              const jsonResponse = await res.json();
              mockScraperLogs.push("[Data] Parsing JSON elements...");
              if (!Array.isArray(jsonResponse) || jsonResponse.length === 0) {
                console.log("Warning: No jobs found or API structure changed.");
                mockScraperLogs.push("[Warning] No jobs found or API structure changed.");
                mockScraperRunning = false;
                return;
              }
              let parsedJobs = [];
              for (const item of jsonResponse) {
                parsedJobs.push({
                  id: item.id,
                  category: "\u0E07\u0E32\u0E19\u0E23\u0E32\u0E0A\u0E01\u0E32\u0E23",
                  // Force this category
                  position: item.position,
                  department: item.department,
                  ministry: item.ministry,
                  recruitment_type: item.jobCategoryId === 1 ? "\u0E02\u0E49\u0E32\u0E23\u0E32\u0E0A\u0E01\u0E32\u0E23\u0E1E\u0E25\u0E40\u0E23\u0E37\u0E2D\u0E19" : "\u0E1E\u0E19\u0E31\u0E01\u0E07\u0E32\u0E19\u0E23\u0E32\u0E0A\u0E01\u0E32\u0E23",
                  agency_logo: item.seal,
                  location: item.address,
                  vacancy_count: item.positionAmount,
                  start_date: item.applicationStartPrint,
                  end_date: item.applicationEndPrint,
                  vacancy: item.positionAmount ? `${item.positionAmount} \u0E2D\u0E31\u0E15\u0E23\u0E32` : "\u0E44\u0E21\u0E48\u0E23\u0E30\u0E1A\u0E38"
                });
              }
              mockScraperLogs.push(`[Data] Extracted ${parsedJobs.length} jobs. Checking for duplicates in Database...`);
              let addedCount = 0;
              let skipCount = 0;
              for (const job of parsedJobs) {
                const externalLink = "https://job.ocsc.go.th/portal/jobs/" + job.id;
                console.log("Checking duplicates for:", externalLink);
                const existing = await firestore2.runQuery({
                  from: [{ collectionId: "news" }],
                  where: {
                    compositeFilter: {
                      op: "AND",
                      filters: [
                        {
                          fieldFilter: {
                            field: { fieldPath: "external_link" },
                            op: "EQUAL",
                            value: { stringValue: externalLink }
                          }
                        }
                      ]
                    }
                  },
                  limit: 1
                });
                if (existing && existing.length > 0) {
                  skipCount++;
                  continue;
                }
                const newDoc = {
                  title: job.position,
                  content: `\u0E23\u0E31\u0E1A\u0E2A\u0E21\u0E31\u0E04\u0E23 ${job.vacancy}`,
                  category: job.category,
                  agency: job.department,
                  author: "\u0E23\u0E30\u0E1A\u0E1A\u0E2D\u0E31\u0E15\u0E42\u0E19\u0E21\u0E31\u0E15\u0E34 (OCSC)",
                  published_date: (/* @__PURE__ */ new Date()).toISOString(),
                  status: "published",
                  thumbnail: null,
                  featured: false,
                  external_link: externalLink,
                  metadata: {
                    ministry: job.ministry,
                    department: job.department,
                    organization: job.department,
                    position_type: job.recruitment_type,
                    agency_logo: job.agency_logo,
                    location: job.location,
                    vacancy_count: job.vacancy_count
                  },
                  recruitment_type: job.recruitment_type,
                  application_start: job.start_date,
                  application_end: job.end_date,
                  created_at: (/* @__PURE__ */ new Date()).toISOString(),
                  updated_at: (/* @__PURE__ */ new Date()).toISOString()
                };
                await firestore2.createDocument("news", newDoc);
                addedCount++;
              }
              console.log(`Saved ${addedCount} new announcements. Skipped ${skipCount} duplicates.`);
              mockScraperLogs.push(`[Data] Saved ${addedCount} new announcements. Skipped ${skipCount} duplicates.`);
              mockScraperRunning = false;
              mockScraperLogs.push("[System] Scraper job completed successfully.");
            } catch (e) {
              console.error("Scraper Error Caught:", e);
              mockScraperLogs.push("[Error] Failed to process scraper job: " + String(e));
              mockScraperRunning = false;
            }
          }, "runScraper");
          ctx.waitUntil(runScraper());
          return json({ success: true, message: "Scraper started" });
        }
        if (url.pathname === "/api/admin/scraper/status") {
          return json({ success: true, data: { isRunning: mockScraperRunning, logs: mockScraperLogs } });
        }
        if (url.pathname === "/api/admin/generator/start" && request.method === "POST") {
          mockGeneratorRunning = true;
          mockGeneratorLogs = ["[System] Initiating Generator job...", "[AI] Connecting to Gemini API..."];
          const runMock = /* @__PURE__ */ __name(async () => {
            await new Promise((r) => setTimeout(r, 2e3));
            mockGeneratorLogs.push("[AI] Generating 50 new Math questions...");
            await new Promise((r) => setTimeout(r, 3e3));
            mockGeneratorLogs.push("[AI] Validating questions and choices...");
            await new Promise((r) => setTimeout(r, 2e3));
            mockGeneratorRunning = false;
            mockGeneratorLogs.push("[System] Generator job completed. 50 questions added.");
          }, "runMock");
          ctx.waitUntil(runMock());
          return json({ success: true, message: "Generator started" });
        }
        if (url.pathname === "/api/admin/generator/status") {
          return json({ success: true, data: { isRunning: mockGeneratorRunning, logs: mockGeneratorLogs } });
        }
        if (url.pathname === "/api/terminal/status") return json({ status: "online" });
        if (url.pathname === "/api/terminal/command") return json({ message: ">>> Status: Idle (Active Provider: Google Gemini)" });
        if (url.pathname === "/api/admin/jobs/cleanup" && request.method === "POST") {
          const result = await cleanupExpiredJobs(env);
          return json({ success: true, count: result });
        }
      } catch (err) {
        return json({ success: false, message: err.message }, { status: 500 });
      }
    }
    return fetch(request);
  },
  async scheduled(event, env, ctx) {
    console.log("Running scheduled job cleanup at", (/* @__PURE__ */ new Date()).toISOString());
    await cleanupExpiredJobs(env);
  }
};
async function cleanupExpiredJobs(env) {
  const firestore = new FirestoreClient(env);
  const parseThaiDate = /* @__PURE__ */ __name((dateStr) => {
    if (!dateStr) return null;
    const parts = dateStr.split(" ");
    if (parts.length < 3) return null;
    const day = parseInt(parts[0], 10);
    const months = ["\u0E21.\u0E04.", "\u0E01.\u0E1E.", "\u0E21\u0E35.\u0E04.", "\u0E40\u0E21.\u0E22.", "\u0E1E.\u0E04.", "\u0E21\u0E34.\u0E22.", "\u0E01.\u0E04.", "\u0E2A.\u0E04.", "\u0E01.\u0E22.", "\u0E15.\u0E04.", "\u0E1E.\u0E22.", "\u0E18.\u0E04."];
    const monthIndex = months.findIndex((m) => parts[1].includes(m));
    if (monthIndex === -1) return null;
    let year = parseInt(parts[2], 10);
    if (year > 2500) year -= 543;
    const d = /* @__PURE__ */ new Date();
    d.setFullYear(year, monthIndex, day);
    d.setHours(23, 59, 59, 999);
    return d;
  }, "parseThaiDate");
  try {
    const news = await firestore.runQuery({ from: [{ collectionId: "news" }], limit: 500 });
    const now = /* @__PURE__ */ new Date();
    let expiredCount = 0;
    for (const job of news) {
      if (job.category === "\u0E07\u0E32\u0E19\u0E23\u0E32\u0E0A\u0E01\u0E32\u0E23" && job.status !== "expired" && job.application_end) {
        const endD = parseThaiDate(job.application_end);
        if (endD && endD < now) {
          await firestore.updateDocument("news", job.id, { status: "expired" });
          expiredCount++;
        }
      }
    }
    console.log(`Job cleanup completed. Marked ${expiredCount} jobs as expired.`);
    return expiredCount;
  } catch (e) {
    console.error("Scheduled job cleanup failed", e);
    return 0;
  }
}
__name(cleanupExpiredJobs, "cleanupExpiredJobs");
export {
  RealtimeDO,
  index_default as default
};
//# sourceMappingURL=index.js.map
