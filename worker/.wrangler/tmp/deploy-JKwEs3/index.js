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
  const docId = doc.name.split("/").pop();
  const res = { id: docId, doc_id: docId };
  for (const [k, v] of Object.entries(fields)) {
    const val = v;
    let parsedValue;
    if (val.stringValue !== void 0) parsedValue = val.stringValue;
    else if (val.integerValue !== void 0) parsedValue = parseInt(val.integerValue, 10);
    else if (val.doubleValue !== void 0) parsedValue = parseFloat(val.doubleValue);
    else if (val.booleanValue !== void 0) parsedValue = val.booleanValue;
    else if (val.timestampValue !== void 0) parsedValue = val.timestampValue;
    else if (val.nullValue !== void 0) parsedValue = null;
    else if (val.arrayValue !== void 0) {
      parsedValue = (val.arrayValue.values || []).map((arrVal) => arrVal.stringValue ?? arrVal.integerValue ?? arrVal.booleanValue);
    } else if (val.mapValue !== void 0) {
      parsedValue = parseFirestoreDocument({ name: "dummy", fields: val.mapValue.fields });
      delete parsedValue.id;
      delete parsedValue.doc_id;
    }
    if (k === "id") {
      res.field_id = parsedValue;
      continue;
    }
    res[k] = parsedValue;
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
var queryCache = /* @__PURE__ */ new Map();
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
  async getDocument(collectionPath, docId, skipCache = false) {
    const cacheKey = `get_${collectionPath}_${docId}`;
    if (!skipCache) {
      const cached = queryCache.get(cacheKey);
      if (cached && cached.exp > Date.now()) return cached.data;
    }
    try {
      const doc = await this.fetchApi(`/${collectionPath}/${docId}`);
      const parsed = parseFirestoreDocument(doc);
      queryCache.set(cacheKey, { data: parsed, exp: Date.now() + 6e4 });
      return parsed;
    } catch (e) {
      const msg = e.message ? e.message.toLowerCase() : "";
      if (msg.includes("not_found") || msg.includes("404") || msg.includes("not found")) return null;
      throw e;
    }
  }
  async createDocument(collectionPath, data, docId) {
    if (collectionPath !== "system_logs") {
      queryCache.clear();
    }
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
    if (collectionPath !== "system_logs") {
      queryCache.clear();
    }
    const doc = toFirestoreDocument(data);
    const updateMask = Object.keys(data).map((k) => `updateMask.fieldPaths=${encodeURIComponent(k)}`).join("&");
    const res = await this.fetchApi(`/${collectionPath}/${docId}?${updateMask}`, {
      method: "PATCH",
      body: JSON.stringify(doc)
    });
    return parseFirestoreDocument(res);
  }
  async deleteDocument(collectionPath, docId) {
    if (collectionPath !== "system_logs") {
      queryCache.clear();
    }
    await this.fetchApi(`/${collectionPath}/${docId}`, { method: "DELETE" });
  }
  async batchCreateDocuments(collectionPath, dataArray) {
    if (!dataArray || dataArray.length === 0) return { success: true };
    if (collectionPath !== "system_logs") {
      queryCache.clear();
    }
    const writes = dataArray.map((data) => {
      const doc = toFirestoreDocument(data);
      const docId = data.id || crypto.randomUUID().replace(/-/g, "");
      doc.name = `projects/${this.config.projectId}/databases/(default)/documents/${collectionPath}/${docId}`;
      return { update: doc };
    });
    const chunkSize = 500;
    const results = [];
    for (let i = 0; i < writes.length; i += chunkSize) {
      const chunk = writes.slice(i, i + chunkSize);
      const res = await this.fetchApi(`:commit`, {
        method: "POST",
        body: JSON.stringify({ writes: chunk })
      });
      results.push(res);
    }
    return results;
  }
  async listDocuments(collectionPath) {
    const cacheKey = "list_" + collectionPath;
    const cached = queryCache.get(cacheKey);
    if (cached && cached.exp > Date.now()) return cached.data;
    try {
      const res = await this.fetchApi(`/${collectionPath}`);
      const parsed = (res.documents || []).map((doc) => parseFirestoreDocument(doc));
      queryCache.set(cacheKey, { data: parsed, exp: Date.now() + 6e4 });
      return parsed;
    } catch (e) {
      const msg = e.message ? e.message.toLowerCase() : "";
      if (msg.includes("not_found") || msg.includes("404") || msg.includes("not found")) return [];
      throw e;
    }
  }
  async runQuery(query, parent = "") {
    const url = parent ? `/${parent}:runQuery` : `:runQuery`;
    const cacheKey = url + JSON.stringify(query);
    const cached = queryCache.get(cacheKey);
    if (cached && cached.exp > Date.now()) return cached.data;
    const res = await this.fetchApi(url, {
      method: "POST",
      body: JSON.stringify({ structuredQuery: query })
    });
    const parsed = res.filter((r) => r.document).map((r) => parseFirestoreDocument(r.document));
    queryCache.set(cacheKey, { data: parsed, exp: Date.now() + 6e4 });
    return parsed;
  }
  async runCountQuery(query, parent = "") {
    const url = parent ? `/${parent}:runAggregationQuery` : `:runAggregationQuery`;
    const res = await this.fetchApi(url, {
      method: "POST",
      body: JSON.stringify({
        structuredAggregationQuery: {
          structuredQuery: query,
          aggregations: [{ count: {} }]
        }
      })
    });
    try {
      const resultObj = res[0]?.result?.aggregateFields;
      if (!resultObj) return 0;
      const firstKey = Object.keys(resultObj)[0];
      return parseInt(resultObj[firstKey]?.integerValue || "0", 10);
    } catch {
      return 0;
    }
  }
  async runAggregationQuery(query, aggregations, parent = "") {
    const url = parent ? `/${parent}:runAggregationQuery` : `:runAggregationQuery`;
    const res = await this.fetchApi(url, {
      method: "POST",
      body: JSON.stringify({
        structuredAggregationQuery: {
          structuredQuery: query,
          aggregations
        }
      })
    });
    try {
      return res[0]?.result?.aggregateFields || {};
    } catch {
      return {};
    }
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
  const iterations = 1e5;
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

// src/generator.ts
var aiGeneratorState = {
  isRunning: false,
  logs: []
};
var delay = /* @__PURE__ */ __name((ms) => new Promise((r) => setTimeout(r, ms)), "delay");
async function runAIGenerator(prompt, env) {
  const config = parseServiceAccount(env);
  const firestore = config ? new FirestoreClient(config) : null;
  async function updateStatus(isRunning, logMessage) {
    aiGeneratorState.isRunning = isRunning;
    if (logMessage) {
      aiGeneratorState.logs.push(logMessage);
      console.log(logMessage);
    }
    if (firestore) {
      try {
        const data = {
          isRunning: aiGeneratorState.isRunning,
          logs: aiGeneratorState.logs,
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        };
        await firestore.updateDocument("system", "generator_status", data).catch(async () => {
          await firestore.createDocument("system", data, "generator_status");
        });
      } catch (e) {
      }
    }
  }
  __name(updateStatus, "updateStatus");
  const providers = [
    { name: "Ollama (Primary)", url: env.OLLAMA_URL, model: env.OLLAMA_MODEL || "gpt-oss:120b", key: env.OLLAMA_API_KEY },
    { name: "Writer (Fallback 1)", url: env.WRITER_BASE_URL, model: env.WRITER_MODEL || "mistral-small-latest", key: env.WRITER_API_KEY },
    { name: "Advisor (Fallback 2)", url: env.ADVISOR_BASE_URL, model: env.ADVISOR_MODEL || "mistral-small-latest", key: env.ADVISOR_API_KEY },
    { name: "QA (Fallback 3)", url: env.QA_BASE_URL, model: env.QA_MODEL || "mistral-small-latest", key: env.QA_API_KEY }
  ].filter((p) => p.url && p.key);
  if (providers.length === 0) {
    await updateStatus(false, "[Error] No LLM providers are configured in the environment variables.");
    return;
  }
  aiGeneratorState.logs = [];
  await updateStatus(true, "[System] Initiating AI Generator job...");
  try {
    const systemInstruction = `You are an expert exam question generator for a Thai examination platform. 
The user will provide a topic or prompt. Generate a JSON array of objects representing exam questions.
Each object MUST exactly match this JSON schema and contain no other fields:
{
  "catalogs": "[\\"CategoryName\\"]",
  "category": "CategoryName",
  "choice_a": "Choice A text",
  "choice_b": "Choice B text",
  "choice_c": "Choice C text",
  "choice_d": "Choice D text",
  "correct_answer": "a", // strictly one of "a", "b", "c", "d" in lowercase
  "difficulty": 50, // integer between 1 and 100
  "exam_set": "Mock Exam",
  "exam_year": "",
  "explanation": "Detailed explanation of why the correct answer is correct (in Thai)",
  "question_image": null,
  "question_text": "The actual question text (in Thai)",
  "rating": 0,
  "ratingCount": 0,
  "skill": "Relevant skill or topic",
  "subject": "Main subject name"
}

Ensure the response is ONLY a valid JSON array, do not wrap it in markdown code blocks like \`\`\`json. Return pure JSON.`;
    let textResponse = null;
    let lastError = null;
    for (const provider of providers) {
      try {
        await updateStatus(true, `[AI] Connecting to LLM API via ${provider.name} (${provider.model})...`);
        let baseUrl = provider.url.replace(/\/$/, "");
        if (!baseUrl.endsWith("/v1") && !baseUrl.endsWith("/v1/chat/completions")) {
          baseUrl += "/v1";
        }
        const endpoint = baseUrl.endsWith("/chat/completions") ? baseUrl : `${baseUrl}/chat/completions`;
        const requestBody = {
          model: provider.model,
          messages: [
            { role: "system", content: systemInstruction },
            { role: "user", content: prompt }
          ],
          response_format: { type: "json_object" }
        };
        const res = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${provider.key}`
          },
          body: JSON.stringify(requestBody),
          signal: AbortSignal.timeout(3e4)
          // 30 second timeout
        });
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`HTTP ${res.status} ${errorText}`);
        }
        const data = await res.json();
        const content = data.choices?.[0]?.message?.content;
        if (!content) {
          throw new Error("No text response received from LLM.");
        }
        textResponse = content;
        break;
      } catch (err) {
        await updateStatus(true, `[Warning] Failed with ${provider.name}: ${err.message}. Trying next...`);
        lastError = err;
      }
    }
    if (!textResponse) {
      throw new Error(`All LLM providers failed. Last error: ${lastError?.message}`);
    }
    await updateStatus(true, "[System] Received response from LLM. Parsing JSON...");
    let cleanedText = textResponse.trim();
    if (cleanedText.startsWith("```json")) cleanedText = cleanedText.substring(7);
    if (cleanedText.startsWith("```")) cleanedText = cleanedText.substring(3);
    if (cleanedText.endsWith("```")) cleanedText = cleanedText.substring(0, cleanedText.length - 3);
    cleanedText = cleanedText.trim();
    const questions = JSON.parse(cleanedText);
    if (!Array.isArray(questions)) {
      throw new Error("LLM did not return a JSON array.");
    }
    await updateStatus(true, `[System] Parsed ${questions.length} questions. Saving to Firestore...`);
    if (!firestore) throw new Error("Firebase Service Account is not configured in environment.");
    let successCount = 0;
    for (const q of questions) {
      q.id = Math.floor(Math.random() * 1e9);
      q.createdAt = (/* @__PURE__ */ new Date()).toISOString();
      q.updatedAt = q.createdAt;
      await firestore.createDocument("questions", q);
      successCount++;
      await updateStatus(true, `[Database] Inserted question ${successCount}/${questions.length}: "${q.question_text.substring(0, 30)}..."`);
      await delay(100);
    }
    await updateStatus(false, `[System] Generator job completed successfully. Added ${successCount} questions.`);
  } catch (err) {
    await updateStatus(false, `[Error] ${err.message}`);
  }
}
__name(runAIGenerator, "runAIGenerator");

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
var globalCache = {};
var CACHE_TTL = 5 * 60 * 1e3;
function getCache(key) {
  const item = globalCache[key];
  if (item && item.exp > Date.now()) return item.data;
  return null;
}
__name(getCache, "getCache");
function setCache(key, data, ttl = CACHE_TTL) {
  globalCache[key] = { data, exp: Date.now() + ttl };
}
__name(setCache, "setCache");
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
var lastActiveUpdateCache = /* @__PURE__ */ new Map();
var requireAuthUserId = /* @__PURE__ */ __name(async (req, env) => {
  const secret = requireJwtSecret(env);
  if (!secret) return { error: json({ error: "missing_jwt_secret" }, { status: 500 }) };
  const userId = await requireUserId(req, secret);
  if (!userId) return { error: json({ error: "unauthorized" }, { status: 401 }) };
  const now = Date.now();
  const lastUpdated = lastActiveUpdateCache.get(userId) || 0;
  if (now - lastUpdated > 5 * 60 * 1e3) {
    lastActiveUpdateCache.set(userId, now);
    try {
      const config = parseServiceAccount(env);
      if (config) {
        const firestore = new FirestoreClient(config);
        await firestore.updateDocument("users", userId, { last_active_at: new Date(now).toISOString() });
      }
    } catch (e) {
      console.error("Failed to update last active:", e);
    }
  }
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
      if (!saConfig2) {
        return json({
          ok: false,
          status: "error",
          services: {
            firebase: "missing_config",
            jwt: env.JWT_SECRET ? "configured" : "missing_config"
          }
        }, { status: 500 });
      }
      return json({
        ok: true,
        status: "healthy",
        services: {
          firebase: "configured",
          jwt: env.JWT_SECRET ? "configured" : "missing_config"
        }
      });
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
      try {
        await firestore.createDocument("system_logs", {
          action: existing.length > 0 ? "SYS_GUEST_LOGIN" : "SYS_GUEST_CREATE",
          details: JSON.stringify({ type: "auto" }),
          user_id: user.id,
          ip_address: request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for") || "unknown",
          user_agent: request.headers.get("user-agent") || "unknown",
          created_at: (/* @__PURE__ */ new Date()).toISOString()
        });
      } catch (e) {
      }
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
      try {
        await firestore.createDocument("system_logs", {
          action: "SYS_GOOGLE_LOGIN",
          details: JSON.stringify({ type: "auto" }),
          user_id: user.id,
          ip_address: request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for") || "unknown",
          user_agent: request.headers.get("user-agent") || "unknown",
          created_at: (/* @__PURE__ */ new Date()).toISOString()
        });
      } catch (e) {
      }
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
      try {
        await firestore.createDocument("system_logs", {
          action: "SYS_EMAIL_LOGIN",
          details: JSON.stringify({ type: "auto" }),
          user_id: user.id,
          ip_address: request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for") || "unknown",
          user_agent: request.headers.get("user-agent") || "unknown",
          created_at: (/* @__PURE__ */ new Date()).toISOString()
        });
      } catch (e) {
      }
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
        if (!r.created_at || r.created_at < oneDayAgo) return false;
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
        const count = await firestore.runCountQuery(
          { from: [{ collectionId: "participants" }] },
          `exam_rooms/${rId}`
        );
        participantCounts.set(rId, count);
      }
      const hostIds = Array.from(new Set(rooms.map((r) => r.host_user_id).filter(Boolean)));
      const hosts = /* @__PURE__ */ new Map();
      for (const hid of hostIds) {
        const u = await firestore.getDocument("users", hid);
        if (u) {
          hosts.set(hid, u.display_name || u.username || "Unknown");
        }
      }
      const data = rooms.map((r) => ({
        ...r,
        password: void 0,
        participant_count: participantCounts.get(r.id) || 0,
        host_name: r.host_name || hosts.get(r.host_user_id) || "Unknown",
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
      if (selectedIds.length === 0) {
        return json({ success: false, message: "No questions found for the selected subject/category." }, { status: 400 });
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
      const missingUserIds = [];
      for (const uid of uniqueUserIds) {
        const cachedU = getCache(`u_${uid}`);
        if (cachedU) usersMap.set(String(uid), cachedU);
        else missingUserIds.push(String(uid));
      }
      for (let i = 0; i < missingUserIds.length; i += 30) {
        const chunk = missingUserIds.slice(i, i + 30);
        const userPromises = chunk.map((id) => firestore.getDocument("users", String(id)));
        const users = await Promise.all(userPromises);
        for (const u of users) {
          if (u && u.id) {
            usersMap.set(String(u.id), u);
            setCache(`u_${u.id}`, u, 5 * 60 * 1e3);
          }
        }
      }
      const populatedParticipants = participants.map((p) => ({
        ...p,
        User: usersMap.get(String(p.user_id)) ? sanitizeUser(usersMap.get(String(p.user_id))) : { display_name: "Unknown", avatar: null }
      }));
      const questionIds = room.question_ids ? JSON.parse(String(room.question_ids)) : [];
      const questionsMap = /* @__PURE__ */ new Map();
      const missingQIds = [];
      for (const qid of questionIds) {
        const cachedQ = getCache(`q_${qid}`);
        if (cachedQ) questionsMap.set(String(qid), normalizeQuestion(cachedQ));
        else missingQIds.push(qid);
      }
      for (let i = 0; i < missingQIds.length; i += 30) {
        const chunk = missingQIds.slice(i, i + 30);
        const qPromises = chunk.map((id) => firestore.getDocument("questions", String(id)));
        const qs = await Promise.all(qPromises);
        for (const q of qs) {
          if (q && q.id) {
            questionsMap.set(String(q.id), normalizeQuestion(q));
            setCache(`q_${q.id}`, q, 24 * 60 * 60 * 1e3);
          }
        }
      }
      const questions = questionIds.map((id) => questionsMap.get(String(id))).filter(Boolean);
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
        if (url.pathname === "/api/public/log" && request.method === "POST") {
          const body = await readJson(request);
          if (!body || !body.action) return json({ success: false, message: "Action required" }, { status: 400 });
          const action = String(body.action);
          const details = body.details || {};
          let userId = null;
          const authHeader = request.headers.get("authorization") || "";
          const secret = requireJwtSecret(env) || "default_secret";
          try {
            const id = await requireUserId(request, secret);
            if (id) userId = id;
          } catch (e) {
          }
          let created = null;
          try {
            created = await firestore2.createDocument("system_logs", {
              action,
              details,
              user_id: userId,
              ip_address: request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for") || "unknown",
              user_agent: request.headers.get("user-agent") || "unknown",
              created_at: (/* @__PURE__ */ new Date()).toISOString()
            });
          } catch (e) {
            const msg = e?.message ? String(e.message) : "firestore_write_failed";
            return json(
              {
                success: false,
                stored: false,
                error: msg.slice(0, 200),
                auth_present: Boolean(authHeader),
                user_id: userId
              },
              { status: 500 }
            );
          }
          return json({
            success: true,
            stored: true,
            doc_id: created?.id || null,
            auth_present: Boolean(authHeader),
            user_id: userId
          });
        }
        if (url.pathname === "/api/questions/subjects" && request.method === "GET") {
          const cacheKey = "qs_subjects";
          let cached = getCache(cacheKey);
          if (!cached) {
            const qs = await firestore2.runQuery({ from: [{ collectionId: "questions" }] });
            const subjects = /* @__PURE__ */ new Set();
            for (const q of qs) if (q.subject) subjects.add(q.subject);
            cached = Array.from(subjects).sort();
            setCache(cacheKey, cached);
          }
          return json({ success: true, data: cached });
        }
        if (url.pathname === "/api/questions/years" && request.method === "GET") {
          const cacheKey = "qs_years";
          let cached = getCache(cacheKey);
          if (!cached) {
            const qs = await firestore2.runQuery({ from: [{ collectionId: "questions" }] });
            const years = /* @__PURE__ */ new Set();
            for (const q of qs) if (q.exam_year) years.add(String(q.exam_year));
            cached = Array.from(years).sort((a, b) => b.localeCompare(a));
            setCache(cacheKey, cached);
          }
          return json({ success: true, data: cached });
        }
        if (url.pathname === "/api/questions/sets" && request.method === "GET") {
          const cacheKey = "qs_sets";
          let cached = getCache(cacheKey);
          if (!cached) {
            const qs = await firestore2.runQuery({ from: [{ collectionId: "questions" }] });
            const sets = /* @__PURE__ */ new Set();
            for (const q of qs) if (q.exam_set) sets.add(q.exam_set);
            cached = Array.from(sets).sort();
            setCache(cacheKey, cached);
          }
          return json({ success: true, data: cached });
        }
        if (url.pathname === "/api/questions/categories" && request.method === "GET") {
          const subject = url.searchParams.get("subject");
          const cacheKey = `qs_cats_${subject || "all"}`;
          let cached = getCache(cacheKey);
          if (!cached) {
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
            cached = Array.from(allTags).sort();
            setCache(cacheKey, cached);
          }
          return json({ success: true, data: cached });
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
          const orderDir = url.searchParams.get("orderDir") || "desc";
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
          const cacheKey = `qs_list_${JSON.stringify(query)}`;
          let allQs = getCache(cacheKey);
          if (!allQs) {
            allQs = await firestore2.runQuery(query);
            setCache(cacheKey, allQs, 60 * 1e3);
          }
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
            rows.sort((a, b) => {
              const numA = Number(a.id);
              const numB = Number(b.id);
              const isNumA = !isNaN(numA);
              const isNumB = !isNaN(numB);
              if (isNumA && isNumB) {
                return orderDir === "desc" ? numB - numA : numA - numB;
              }
              if (isNumA && !isNumB) return orderDir === "desc" ? 1 : -1;
              if (!isNumA && isNumB) return orderDir === "desc" ? -1 : 1;
              const strCompare = String(a.id).localeCompare(String(b.id));
              return orderDir === "desc" ? -strCompare : strCompare;
            });
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
        if (url.pathname === "/api/questions" && request.method === "POST") {
          const auth = await requireAuthUserId(request, env);
          if ("error" in auth) return auth.error;
          const userDoc = await firestore2.getDocument("users", auth.userId);
          if (!userDoc || userDoc.role !== "admin") return json({ success: false, message: "Forbidden: Admin access required" }, { status: 403 });
          const body = await readJson(request);
          if (!body) return json({ success: false, message: "invalid_body" }, { status: 400 });
          const { catalogs, category, skill, exam_year, exam_set, ...rest } = body;
          let finalCatalogs = catalogs || [];
          if (category && !finalCatalogs.includes(category)) {
            finalCatalogs.push(category);
          }
          if (typeof finalCatalogs === "string") {
            try {
              finalCatalogs = JSON.parse(finalCatalogs);
            } catch (e) {
              finalCatalogs = [finalCatalogs];
            }
          }
          let maxId = 0;
          try {
            const allDocs = await firestore2.runQuery({ from: [{ collectionId: "questions" }] });
            for (const doc of allDocs) {
              const num = Number(doc.id);
              if (!isNaN(num) && num > maxId) {
                maxId = num;
              }
            }
          } catch (e) {
            console.error("Failed to fetch max ID", e);
          }
          const newDocRef = (maxId + 1).toString();
          const newQuestion = {
            id: newDocRef,
            ...rest,
            category: category || (finalCatalogs.length > 0 ? finalCatalogs[0] : "General"),
            catalogs: finalCatalogs,
            skill: skill || null,
            exam_year: exam_year || null,
            exam_set: exam_set || null,
            created_at: (/* @__PURE__ */ new Date()).toISOString()
          };
          await firestore2.createDocument("questions", newQuestion, newDocRef);
          return json({ success: true, data: newQuestion }, { status: 201 });
        }
        if (qIdMatch && request.method === "PUT") {
          const auth = await requireAuthUserId(request, env);
          if ("error" in auth) return auth.error;
          const userDoc = await firestore2.getDocument("users", auth.userId);
          if (!userDoc || userDoc.role !== "admin") return json({ success: false, message: "Forbidden: Admin access required" }, { status: 403 });
          const body = await readJson(request);
          if (!body) return json({ success: false, message: "invalid_body" }, { status: 400 });
          const doc = await firestore2.getDocument("questions", qIdMatch[1]);
          if (!doc) return json({ success: false, message: "Question not found" }, { status: 404 });
          const updateData = { ...body, updated_at: (/* @__PURE__ */ new Date()).toISOString() };
          await firestore2.updateDocument("questions", qIdMatch[1], updateData);
          const updated = await firestore2.getDocument("questions", qIdMatch[1]);
          return json({ success: true, data: normalizeQuestion(updated) });
        }
        if (qIdMatch && request.method === "DELETE") {
          const auth = await requireAuthUserId(request, env);
          if ("error" in auth) return auth.error;
          const userDoc = await firestore2.getDocument("users", auth.userId);
          if (!userDoc || userDoc.role !== "admin") return json({ success: false, message: "Forbidden: Admin access required" }, { status: 403 });
          const doc = await firestore2.getDocument("questions", qIdMatch[1]);
          if (!doc) return json({ success: false, message: "Question not found" }, { status: 404 });
          await firestore2.deleteDocument("questions", qIdMatch[1]);
          return json({ success: true, message: "Question deleted" });
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
          const missingIds = [];
          for (const id of questionIds) {
            const cachedQ = getCache(`q_${id}`);
            if (cachedQ) questionsMap.set(String(id), cachedQ);
            else missingIds.push(String(id));
          }
          for (let i = 0; i < missingIds.length; i += 30) {
            const chunk = missingIds.slice(i, i + 30);
            const qPromises = chunk.map((id) => firestore2.getDocument("questions", String(id)));
            const qs = await Promise.all(qPromises);
            for (const q of qs) {
              if (q && q.id) {
                questionsMap.set(String(q.id), q);
                setCache(`q_${q.id}`, q, 24 * 60 * 60 * 1e3);
              }
            }
          }
          let score = 0;
          let total_score = 0;
          const subject_scores = {};
          const skill_scores = {};
          const questionsDetail = [];
          for (const qId of questionIds) {
            const rawQ = questionsMap.get(String(qId));
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
          try {
            const activeSeasons = await firestore2.runQuery({ from: [{ collectionId: "seasons" }], where: { fieldFilter: { field: { fieldPath: "status" }, op: "EQUAL", value: { stringValue: "active" } } }, limit: 1 });
            if (activeSeasons.length > 0) {
              const seasonId = activeSeasons[0].id;
              const rankingId = `${seasonId}_${auth.userId}`;
              const existingRanking = await firestore2.getDocument("rankings", rankingId);
              if (existingRanking) {
                const newTotalScore = (Number(existingRanking.total_score) || 0) + score;
                const newExamsTaken = (Number(existingRanking.exams_taken) || 0) + 1;
                await firestore2.updateDocument("rankings", rankingId, {
                  total_score: newTotalScore,
                  exams_taken: newExamsTaken,
                  updated_at: (/* @__PURE__ */ new Date()).toISOString()
                });
              } else {
                await firestore2.createDocument("rankings", {
                  season_id: seasonId,
                  user_id: auth.userId,
                  total_score: score,
                  exams_taken: 1,
                  updated_at: (/* @__PURE__ */ new Date()).toISOString()
                }, rankingId);
              }
            }
          } catch (e) {
            console.error("Failed to update ranking:", e);
          }
          const xpGained = total_score * 10 + 50;
          try {
            const userDoc = await firestore2.getDocument("users", auth.userId);
            if (userDoc) {
              const currentXp = (Number(userDoc.xp) || 0) + xpGained;
              const currentLevel = userDoc.level || 1;
              const newLevel = Math.floor((1 + Math.sqrt(1 + 4 * (currentXp / 1e3))) / 2);
              const updates = { xp: currentXp };
              if (newLevel > currentLevel) {
                updates.level = newLevel;
              }
              await firestore2.updateDocument("users", auth.userId, updates);
              examResult.xpGained = xpGained;
              examResult.newTotalXp = currentXp;
              examResult.levelUp = newLevel > currentLevel ? newLevel : null;
            }
          } catch (e) {
            console.error("Failed to update user XP:", e);
          }
          return json({ success: true, data: examResult }, { status: 201 });
        }
        if (url.pathname === "/api/rankings/me" && request.method === "GET") {
          const auth = await requireAuthUserId(request, env);
          if ("error" in auth) return auth.error;
          const seasons = await firestore2.runQuery({ from: [{ collectionId: "seasons" }], where: { fieldFilter: { field: { fieldPath: "status" }, op: "EQUAL", value: { stringValue: "active" } } }, limit: 1 });
          if (seasons.length === 0) return json({ success: true, data: { total_score: 0, exams_taken: 0 } });
          const activeSeasonId = seasons[0].id;
          const rankingId = `${activeSeasonId}_${auth.userId}`;
          const ranking = await firestore2.getDocument("rankings", rankingId);
          return json({ success: true, data: ranking || { total_score: 0, exams_taken: 0 } });
        }
        if (url.pathname === "/api/rankings" && request.method === "GET") {
          const seasons = await firestore2.runQuery({ from: [{ collectionId: "seasons" }], where: { fieldFilter: { field: { fieldPath: "status" }, op: "EQUAL", value: { stringValue: "active" } } }, limit: 1 });
          if (seasons.length === 0) return json({ success: true, data: [] });
          const activeSeasonId = seasons[0].id;
          const cacheKey = `rankings_${activeSeasonId}`;
          let rankings = getCache(cacheKey);
          if (!rankings) {
            rankings = await firestore2.runQuery({
              from: [{ collectionId: "rankings" }],
              where: { fieldFilter: { field: { fieldPath: "season_id" }, op: "EQUAL", value: { stringValue: activeSeasonId } } },
              orderBy: [{ field: { fieldPath: "total_score" }, direction: "DESCENDING" }],
              limit: 50
            });
            for (const r of rankings) {
              const u = await firestore2.getDocument("users", String(r.user_id));
              if (u) {
                r.user_name = u.display_name;
                r.user_avatar = u.avatar;
              }
            }
            setCache(cacheKey, rankings, 5 * 60 * 1e3);
          }
          return json({ success: true, data: rankings });
        }
        if (url.pathname === "/api/exams/history" && request.method === "GET") {
          const auth = await requireAuthUserId(request, env);
          if ("error" in auth) return auth.error;
          try {
            const results = await firestore2.runQuery({
              from: [{ collectionId: "exam_results" }],
              where: { fieldFilter: { field: { fieldPath: "user_id" }, op: "EQUAL", value: { stringValue: auth.userId } } }
            });
            results.sort((a, b) => {
              const tA = a.taken_at ? new Date(a.taken_at).getTime() : 0;
              const tB = b.taken_at ? new Date(b.taken_at).getTime() : 0;
              return tB - tA;
            });
            return json({ success: true, data: results });
          } catch (e) {
            return json({ success: false, data: [] });
          }
        }
        if (url.pathname === "/api/reports" && request.method === "POST") {
          try {
            const body = await readJson(request);
            const auth = await requireAuthUserId(request, env);
            const userId = "error" in auth ? "anonymous" : auth.userId;
            const ticket_id = Math.floor(Math.random() * 1e6).toString().padStart(6, "0");
            const ticketData = {
              id: ticket_id,
              ticket_id,
              subject: `\u0E41\u0E08\u0E49\u0E07\u0E1B\u0E31\u0E0D\u0E2B\u0E32\u0E02\u0E49\u0E2D\u0E2A\u0E2D\u0E1A: ${body?.question_id}`,
              description: body?.reason || "No reason provided",
              category: "content",
              status: "open",
              user_id: userId,
              created_at: (/* @__PURE__ */ new Date()).toISOString(),
              updated_at: (/* @__PURE__ */ new Date()).toISOString()
            };
            await firestore2.createDocument("tickets", ticketData);
            return json({ success: true, message: "Report submitted successfully" });
          } catch (e) {
            return json({ success: false, message: "Failed to submit report" }, { status: 500 });
          }
        }
        if (url.pathname === "/api/bookmarks") return json({ success: true, data: [] });
        const userThreadsMatch = url.pathname.match(/^\/api\/community\/threads\/user\/([a-zA-Z0-9_-]+)$/);
        if (userThreadsMatch && request.method === "GET") {
          try {
            const userId = userThreadsMatch[1];
            const results = await firestore2.runQuery({
              from: [{ collectionId: "threads" }],
              where: { fieldFilter: { field: { fieldPath: "user_id" }, op: "EQUAL", value: { stringValue: userId } } }
            });
            results.sort((a, b) => {
              const tA = a.created_at ? new Date(a.created_at).getTime() : 0;
              const tB = b.created_at ? new Date(b.created_at).getTime() : 0;
              return tB - tA;
            });
            return json({ success: true, threads: results });
          } catch (e) {
            return json({ success: false, threads: [] });
          }
        }
        if (url.pathname === "/api/chat/inbox/conversations") return json({ success: true, data: [] });
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
            const typeFilter = url.searchParams.get("type");
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
              const isCivil = pType.includes("\u0E02\u0E49\u0E32\u0E23\u0E32\u0E0A\u0E01\u0E32\u0E23");
              const isEmployee = pType.includes("\u0E1E\u0E19\u0E31\u0E01\u0E07\u0E32\u0E19\u0E23\u0E32\u0E0A\u0E01\u0E32\u0E23");
              const isOther = !isCivil && !isEmployee;
              if (isCivil) countCivil += jobCount;
              else if (isEmployee) countEmployee += jobCount;
              else countOther += jobCount;
              if (typeFilter === "civil" && !isCivil) return;
              if (typeFilter === "employee" && !isEmployee) return;
              if (typeFilter === "other" && !isOther) return;
              if (!statsMap[ministry]) {
                statsMap[ministry] = { ministry, departments: {} };
              }
              const jobDate = job.published_date || job.created_at || (/* @__PURE__ */ new Date()).toISOString();
              if (!statsMap[ministry].departments[department]) {
                statsMap[ministry].departments[department] = { department, count: 0, logo: job.metadata && job.metadata.agency_logo || null, lastUpdated: jobDate };
              } else {
                const currDate = statsMap[ministry].departments[department].lastUpdated;
                if (new Date(jobDate) > new Date(currDate)) {
                  statsMap[ministry].departments[department].lastUpdated = jobDate;
                }
              }
              statsMap[ministry].departments[department].count += jobCount;
            });
            const formattedStats = Object.values(statsMap).map((m) => {
              const depts = Object.values(m.departments);
              const latestDate = depts.reduce((latest, d) => {
                return !latest || new Date(d.lastUpdated) > new Date(latest) ? d.lastUpdated : latest;
              }, null);
              return {
                ministry: m.ministry,
                logo: depts.find((d) => d.logo)?.logo || null,
                totalCount: depts.reduce((sum, d) => sum + d.count, 0),
                lastUpdated: latestDate,
                departments: depts.sort((a, b) => b.count - a.count)
              };
            }).sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());
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
          const targetUrl = body?.url || "";
          let scrapeData = {
            title: "\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E14\u0E36\u0E07\u0E2D\u0E31\u0E15\u0E42\u0E19\u0E21\u0E31\u0E15\u0E34",
            summary: "\u0E14\u0E36\u0E07\u0E40\u0E19\u0E37\u0E49\u0E2D\u0E2B\u0E32\u0E08\u0E32\u0E01 " + targetUrl,
            agency: "\u0E2D\u0E49\u0E32\u0E07\u0E2D\u0E34\u0E07\u0E08\u0E32\u0E01 URL",
            external_link: targetUrl,
            metadata: {
              announcement_url: targetUrl
            }
          };
          const ocscNewsMatch = targetUrl.match(/job\.ocsc\.go\.th\/portal\/news\/(\d+)/);
          if (ocscNewsMatch) {
            try {
              const id = ocscNewsMatch[1];
              const response = await fetch(`https://jobapp.ocsc.go.th/jobapi/portal/pressreleases/${id}`);
              if (response.ok) {
                const data = await response.json();
                if (data.headline) scrapeData.title = data.headline;
                if (data.text1 || data.text2) {
                  const rawHtml = (data.text1 || "") + "\n" + (data.text2 || "");
                  scrapeData.summary = rawHtml.replace(/<br\s*[\/]?>/gi, "\n").replace(/<\/p>/gi, "\n\n").replace(/<\/h[1-6]>/gi, "\n\n").replace(/<\/li>/gi, "\n").replace(/<li>/gi, "- ").replace(/<[^>]+>/g, "").replace(/\n\s*\n/g, "\n\n").trim();
                }
                scrapeData.agency = "\u0E2A\u0E33\u0E19\u0E31\u0E01\u0E07\u0E32\u0E19 \u0E01.\u0E1E.";
                if (data.image1) {
                  scrapeData.image_url = data.image1.startsWith("http") ? data.image1 : `https://job.ocsc.go.th/upload2/${data.image1}`;
                } else if (data.banner) {
                  scrapeData.image_url = data.banner.startsWith("http") ? data.banner : `https://job.ocsc.go.th/upload2/${data.banner}`;
                }
              }
            } catch (e) {
            }
          }
          return json({ success: true, data: scrapeData });
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
        if (url.pathname === "/api/users/stats" && request.method === "GET") {
          const auth = await requireAuthUserId(request, env);
          if ("error" in auth) return auth.error;
          try {
            const results = await firestore2.runQuery({
              from: [{ collectionId: "exam_results" }],
              where: { fieldFilter: { field: { fieldPath: "user_id" }, op: "EQUAL", value: { stringValue: auth.userId } } }
            });
            const totalExams = results.length;
            const totalScore = results.reduce((acc, curr) => acc + (Number(curr.score) || 0), 0);
            const totalQuestions = results.reduce((acc, curr) => acc + (Number(curr.total_score) || 0), 0);
            const timeTaken = results.reduce((acc, curr) => acc + (Number(curr.time_taken) || 0), 0);
            const gamesWon = results.filter((r) => {
              const sc = Number(r.score) || 0;
              const ts = Number(r.total_score) || 10;
              return sc >= ts * 0.8;
            }).length;
            const accuracy = totalQuestions > 0 ? Math.round(totalScore / totalQuestions * 100) : 0;
            const avgAnswerTime = totalQuestions > 0 ? (timeTaken / totalQuestions).toFixed(1) : "0";
            const uniqueDays = new Set(results.map((r) => r.taken_at?.split("T")[0]).filter(Boolean)).size;
            return json({
              success: true,
              data: {
                totalExams,
                totalQuestions,
                totalScore,
                timeTaken,
                gamesWon,
                accuracy,
                avgAnswerTime,
                badgesEarned: 0,
                friendsCount: 0,
                daysActive: uniqueDays
              }
            });
          } catch (e) {
            return json({ success: false, message: "Server error" }, { status: 500 });
          }
        }
        if (url.pathname === "/api/users/stats/heatmap" && request.method === "GET") {
          const auth = await requireAuthUserId(request, env);
          if ("error" in auth) return auth.error;
          const urlObj = new URL(request.url);
          const periodStr = urlObj.searchParams.get("period");
          const period = periodStr === "all" ? 9999 : parseInt(periodStr || "7", 10);
          try {
            const results = await firestore2.runQuery({
              from: [{ collectionId: "exam_results" }],
              where: { fieldFilter: { field: { fieldPath: "user_id" }, op: "EQUAL", value: { stringValue: auth.userId } } }
            });
            const now = /* @__PURE__ */ new Date();
            const cutoff = new Date(now.getTime() - period * 24 * 60 * 60 * 1e3);
            const dateCounts = {};
            results.forEach((r) => {
              if (r.taken_at) {
                const dateObj = new Date(r.taken_at);
                if (dateObj >= cutoff) {
                  const dateStr = r.taken_at.split("T")[0];
                  dateCounts[dateStr] = (dateCounts[dateStr] || 0) + 1;
                }
              }
            });
            const heatmapData = [];
            const daysToGenerate = period === 9999 ? 365 : period;
            for (let i = daysToGenerate - 1; i >= 0; i--) {
              const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1e3);
              const dateStr = d.toISOString().split("T")[0];
              heatmapData.push({
                date: dateStr,
                value: dateCounts[dateStr] || 0
              });
            }
            return json({ success: true, data: heatmapData });
          } catch (e) {
            return json({ success: false, message: "Server error" }, { status: 500 });
          }
        }
        if (url.pathname === "/api/users/stats/radar" && request.method === "GET") {
          const auth = await requireAuthUserId(request, env);
          if ("error" in auth) return auth.error;
          try {
            const results = await firestore2.runQuery({
              from: [{ collectionId: "exam_results" }],
              where: { fieldFilter: { field: { fieldPath: "user_id" }, op: "EQUAL", value: { stringValue: auth.userId } } }
            });
            const subjectStats = {};
            results.forEach((r) => {
              try {
                if (r.subject_scores && typeof r.subject_scores === "object") {
                  Object.keys(r.subject_scores).forEach((subj) => {
                    if (!subjectStats[subj]) subjectStats[subj] = { score: 0, full: 0 };
                    subjectStats[subj].score += Number(r.subject_scores[subj]) || 0;
                  });
                }
                if (r.questions && Array.isArray(r.questions)) {
                  r.questions.forEach((q) => {
                    if (q && typeof q === "object" && q.subject) {
                      if (!subjectStats[q.subject]) subjectStats[q.subject] = { score: 0, full: 0 };
                      subjectStats[q.subject].full += 1;
                    }
                  });
                }
              } catch (innerError) {
                console.error("Radar aggregation error for result", r, innerError);
              }
            });
            const radarData = Object.keys(subjectStats).map((subj) => {
              const stat = subjectStats[subj];
              const fullMark = Math.max(stat.full, 1);
              const percentage = Math.round(stat.score / fullMark * 100);
              return {
                subject: subj,
                score: percentage,
                fullMark: 100
              };
            });
            return json({ success: true, data: radarData });
          } catch (e) {
            return json({ success: false, message: "Server error" }, { status: 500 });
          }
        }
        if (url.pathname.startsWith("/api/friends")) {
          const auth = await requireAuthUserId(request, env);
          if ("error" in auth) return auth.error;
          const myId = auth.userId;
          if (url.pathname === "/api/friends/request" && request.method === "POST") {
            const body = await readJson(request);
            const friendId = body.friendId;
            if (!friendId || friendId === myId) return json({ success: false, message: "Invalid friend ID" }, { status: 400 });
            const reqs = await firestore2.runQuery({ from: [{ collectionId: "friends" }], where: { fieldFilter: { field: { fieldPath: "requester_id" }, op: "EQUAL", value: { stringValue: myId } } } });
            const tgts = await firestore2.runQuery({ from: [{ collectionId: "friends" }], where: { fieldFilter: { field: { fieldPath: "target_id" }, op: "EQUAL", value: { stringValue: myId } } } });
            const exists = reqs.find((r) => r.target_id === friendId) || tgts.find((r) => r.requester_id === friendId);
            if (exists) return json({ success: false, message: "Request already exists or already friends" }, { status: 400 });
            const newReq = await firestore2.createDocument("friends", {
              requester_id: myId,
              target_id: friendId,
              status: "pending",
              created_at: (/* @__PURE__ */ new Date()).toISOString()
            });
            return json({ success: true, data: newReq });
          }
          if (url.pathname === "/api/friends/accept" && request.method === "POST") {
            const body = await readJson(request);
            const friendId = body.friendId;
            const tgts = await firestore2.runQuery({ from: [{ collectionId: "friends" }], where: { fieldFilter: { field: { fieldPath: "target_id" }, op: "EQUAL", value: { stringValue: myId } } } });
            const req = tgts.find((r) => r.requester_id === friendId && r.status === "pending");
            if (!req) return json({ success: false, message: "Request not found" }, { status: 404 });
            await firestore2.updateDocument("friends", req.id, { status: "accepted" });
            return json({ success: true });
          }
          const removeMatch = url.pathname.match(/^\/api\/friends\/remove\/(.+)$/);
          if (removeMatch && request.method === "DELETE") {
            const friendId = removeMatch[1];
            const reqs = await firestore2.runQuery({ from: [{ collectionId: "friends" }], where: { fieldFilter: { field: { fieldPath: "requester_id" }, op: "EQUAL", value: { stringValue: myId } } } });
            const tgts = await firestore2.runQuery({ from: [{ collectionId: "friends" }], where: { fieldFilter: { field: { fieldPath: "target_id" }, op: "EQUAL", value: { stringValue: myId } } } });
            const toDelete = [
              ...reqs.filter((r) => r.target_id === friendId),
              ...tgts.filter((r) => r.requester_id === friendId)
            ];
            for (const doc of toDelete) {
              await firestore2.deleteDocument("friends", doc.id);
            }
            return json({ success: true });
          }
          if (url.pathname === "/api/friends/list" && request.method === "GET") {
            const reqs = await firestore2.runQuery({ from: [{ collectionId: "friends" }], where: { fieldFilter: { field: { fieldPath: "requester_id" }, op: "EQUAL", value: { stringValue: myId } } } });
            const tgts = await firestore2.runQuery({ from: [{ collectionId: "friends" }], where: { fieldFilter: { field: { fieldPath: "target_id" }, op: "EQUAL", value: { stringValue: myId } } } });
            const friendsList = [
              ...reqs.filter((r) => r.status === "accepted"),
              ...tgts.filter((r) => r.status === "accepted")
            ];
            const friendIds = friendsList.map((f) => f.requester_id === myId ? f.target_id : f.requester_id);
            const friendProfiles = await Promise.all(friendIds.map(async (fid) => {
              const doc = await firestore2.getDocument("users", fid);
              if (!doc) return null;
              return { id: fid, display_name: doc.display_name, avatar: doc.avatar, level: doc.level };
            }));
            return json({ success: true, data: friendProfiles.filter(Boolean) });
          }
          if (url.pathname === "/api/friends/pending" && request.method === "GET") {
            const tgts = await firestore2.runQuery({ from: [{ collectionId: "friends" }], where: { fieldFilter: { field: { fieldPath: "target_id" }, op: "EQUAL", value: { stringValue: myId } } } });
            const pendingList = tgts.filter((r) => r.status === "pending");
            const pendingProfiles = await Promise.all(pendingList.map(async (f) => {
              const doc = await firestore2.getDocument("users", f.requester_id);
              if (!doc) return null;
              return { id: f.requester_id, display_name: doc.display_name, avatar: doc.avatar, level: doc.level, request_id: f.id };
            }));
            return json({ success: true, data: pendingProfiles.filter(Boolean) });
          }
          const checkMatch = url.pathname.match(/^\/api\/friends\/check\/(.+)$/);
          if (checkMatch && request.method === "GET") {
            const friendId = checkMatch[1];
            const reqs = await firestore2.runQuery({ from: [{ collectionId: "friends" }], where: { fieldFilter: { field: { fieldPath: "requester_id" }, op: "EQUAL", value: { stringValue: myId } } } });
            const tgts = await firestore2.runQuery({ from: [{ collectionId: "friends" }], where: { fieldFilter: { field: { fieldPath: "target_id" }, op: "EQUAL", value: { stringValue: myId } } } });
            const r1 = reqs.find((r) => r.target_id === friendId);
            const r2 = tgts.find((r) => r.requester_id === friendId);
            if (r1) {
              return json({ success: true, status: r1.status === "accepted" ? "friends" : "sent" });
            } else if (r2) {
              return json({ success: true, status: r2.status === "accepted" ? "friends" : "received" });
            } else {
              return json({ success: true, status: "none" });
            }
          }
          return json({ success: false, message: "Not found in friends API" }, { status: 404 });
        }
        if (url.pathname === "/api/users/claim-streak" && request.method === "POST") {
          const auth = await requireAuthUserId(request, env);
          if ("error" in auth) return auth.error;
          try {
            const userDoc = await firestore2.getDocument("users", auth.userId);
            if (!userDoc) return json({ success: false, message: "User not found" }, { status: 404 });
            const now = /* @__PURE__ */ new Date();
            const todayStr = now.toISOString().split("T")[0];
            const lastClaimDateStr = userDoc.last_claim_date;
            if (lastClaimDateStr === todayStr) {
              return json({ success: false, message: "Already claimed today", data: { xpGained: 0 } });
            }
            let newStreak = 1;
            if (lastClaimDateStr) {
              const yesterday = new Date(now);
              yesterday.setDate(yesterday.getDate() - 1);
              const yesterdayStr = yesterday.toISOString().split("T")[0];
              if (lastClaimDateStr === yesterdayStr) {
                newStreak = (Number(userDoc.streak_count) || 0) + 1;
              }
            }
            const xpGained = newStreak % 7 === 0 ? 100 : 10;
            const currentXp = (Number(userDoc.xp) || 0) + xpGained;
            const currentLevel = userDoc.level || 1;
            const newLevel = Math.floor((1 + Math.sqrt(1 + 4 * (currentXp / 1e3))) / 2);
            const updates = {
              streak_count: newStreak,
              last_claim_date: todayStr,
              xp: currentXp
            };
            if (newLevel > currentLevel) {
              updates.level = newLevel;
            }
            await firestore2.updateDocument("users", auth.userId, updates);
            return json({
              success: true,
              data: {
                xpGained,
                newStreak,
                newTotalXp: currentXp,
                levelUp: newLevel > currentLevel ? newLevel : null
              }
            });
          } catch (e) {
            return json({ success: false, message: "Server error" }, { status: 500 });
          }
        }
        if (url.pathname === "/api/payments/plans" && request.method === "GET") {
          try {
            const results = await firestore2.runQuery({
              from: [{ collectionId: "payment_plans" }]
            });
            results.sort((a, b) => (a.price || 0) - (b.price || 0));
            return json({ success: true, plans: results });
          } catch (e) {
            return json({ success: false, plans: [] });
          }
        }
        if (url.pathname === "/api/payments/checkout" && request.method === "POST") {
          const auth = await requireAuthUserId(request, env);
          if ("error" in auth) return auth.error;
          try {
            const body = await request.json();
            const { plan_id, payment_method } = body;
            const planDoc = await firestore2.getDocument(`payment_plans/${plan_id}`);
            if (!planDoc) {
              return json({ success: false, message: "Plan not found" }, { status: 404 });
            }
            const transactionData = {
              id: crypto.randomUUID(),
              user_id: auth.userId,
              plan_id,
              amount: planDoc.price,
              payment_method: payment_method || "transfer_slip",
              status: "pending",
              type: "subscription",
              created_at: (/* @__PURE__ */ new Date()).toISOString()
            };
            await firestore2.createDocument("transactions", transactionData.id, transactionData);
            return json({ success: true, transaction: transactionData });
          } catch (e) {
            return json({ success: false, message: e.message }, { status: 500 });
          }
        }
        const adminPlanMatch = url.pathname.match(/^\/api\/admin\/payments\/plans\/([^\/]+)$/);
        if (adminPlanMatch) {
          const auth = await requireAuthUserId(request, env);
          if ("error" in auth) return auth.error;
          const id = decodeURIComponent(adminPlanMatch[1]);
          if (request.method === "PUT") {
            const body = await request.json();
            await firestore2.updateDocument("payment_plans", id, { ...body, updated_at: (/* @__PURE__ */ new Date()).toISOString() });
            return json({ success: true });
          }
          if (request.method === "DELETE") {
            await firestore2.deleteDocument("payment_plans", id);
            return json({ success: true });
          }
        } else if (url.pathname === "/api/admin/payments/plans") {
          const auth = await requireAuthUserId(request, env);
          if ("error" in auth) return auth.error;
          if (request.method === "GET") {
            try {
              const results = await firestore2.runQuery({ from: [{ collectionId: "payment_plans" }] });
              return json({ success: true, plans: results });
            } catch (e) {
              return json({ success: true, plans: [] });
            }
          }
          if (request.method === "POST") {
            const body = await request.json();
            const id = crypto.randomUUID();
            const planData = { ...body, id, created_at: (/* @__PURE__ */ new Date()).toISOString() };
            await firestore2.createDocument("payment_plans", planData, id);
            return json({ success: true, plan: planData });
          }
        }
        const assetMatch = url.pathname.match(/^\/api\/assets\/([^\/]+)$/);
        if (assetMatch) {
          const id = decodeURIComponent(assetMatch[1]);
          if (request.method === "DELETE") {
            const auth = await requireAuthUserId(request, env);
            if ("error" in auth) return auth.error;
            await firestore2.deleteDocument("assets", id);
            return json({ success: true });
          }
        } else if (url.pathname === "/api/assets") {
          if (request.method === "GET") {
            try {
              const results = await firestore2.runQuery({ from: [{ collectionId: "assets" }] });
              return json({ success: true, data: results });
            } catch (e) {
              return json({ success: true, data: [] });
            }
          }
          if (request.method === "POST") {
            const auth = await requireAuthUserId(request, env);
            if ("error" in auth) return auth.error;
            const body = await request.json();
            const id = crypto.randomUUID();
            const assetData = { ...body, id, created_at: (/* @__PURE__ */ new Date()).toISOString() };
            await firestore2.createDocument("assets", assetData, id);
            return json({ success: true, data: assetData });
          }
        }
        if (url.pathname === "/api/proxy") {
          if (request.method === "GET") {
            const targetUrl = url.searchParams.get("url");
            if (!targetUrl) return json({ error: "Missing URL" }, { status: 400 });
            try {
              const response = await fetch(targetUrl);
              const data = await response.text();
              return new Response(data, {
                headers: {
                  "Content-Type": response.headers.get("Content-Type") || "application/json",
                  "Access-Control-Allow-Origin": "*",
                  "Access-Control-Allow-Methods": "GET, OPTIONS",
                  "Access-Control-Allow-Headers": "*"
                }
              });
            } catch (e) {
              return json({ error: "Failed to fetch" }, { status: 500 });
            }
          }
        }
        if (url.pathname === "/api/admin/settings") {
          const auth = await requireAuthUserId(request, env);
          if ("error" in auth) return auth.error;
          if (request.method === "GET") {
            try {
              const settings = await firestore2.getDocument("system_config", "general_settings", true);
              return json({ success: true, settings: settings || {} });
            } catch (e) {
              return json({ success: true, settings: {} });
            }
          }
          if (request.method === "PUT") {
            const body = await request.json();
            const existing = await firestore2.getDocument("system_config", "general_settings");
            if (existing) {
              await firestore2.updateDocument("system_config", "general_settings", body);
            } else {
              await firestore2.createDocument("system_config", body, "general_settings");
            }
            return json({ success: true, settings: body });
          }
        }
        if (url.pathname === "/api/public/settings") {
          if (request.method === "GET") {
            try {
              const settings = await firestore2.getDocument("system_config", "general_settings", true);
              return json({ success: true, settings: settings || {} });
            } catch (e) {
              return json({ success: true, settings: {} });
            }
          }
        }
        if (url.pathname === "/api/legal/policy") {
          if (request.method === "GET") {
            try {
              const policy = await firestore2.getDocument("system_config", "privacy_policy");
              return json({ success: true, content: policy?.content || "" });
            } catch (e) {
              return json({ success: false, error: e.message || String(e) }, { status: 500 });
            }
          }
          if (request.method === "PUT" || request.method === "POST") {
            try {
              const auth = await requireAuthUserId(request, env);
              if ("error" in auth) return auth.error;
              const body = await request.json();
              const existing = await firestore2.getDocument("system_config", "privacy_policy");
              if (existing) {
                await firestore2.updateDocument("system_config", "privacy_policy", { content: body.content });
              } else {
                await firestore2.createDocument("system_config", { content: body.content }, "privacy_policy");
              }
              return json({ success: true, message: "Policy updated" });
            } catch (e) {
              return json({ success: false, error: e.message || String(e) }, { status: 500 });
            }
          }
        }
        if (url.pathname === "/api/groups") return json({ success: true, groups: [] });
        if (url.pathname === "/api/community/tags/trending") return json([]);
        const cleanPathname = url.pathname.replace(/\/$/, "");
        if (cleanPathname === "/api/business" && request.method === "GET") {
          try {
            const search = url.searchParams.get("search");
            const category = url.searchParams.get("category");
            let businesses = await firestore2.runQuery({
              from: [{ collectionId: "businesses" }],
              orderBy: [{ field: { fieldPath: "created_at" }, direction: "DESCENDING" }],
              limit: 50
            });
            if (category) {
              businesses = businesses.filter((b) => b.category === category);
            }
            if (search) {
              const searchLower = search.toLowerCase();
              businesses = businesses.filter(
                (b) => b.name && b.name.toLowerCase().includes(searchLower) || b.tagline && b.tagline.toLowerCase().includes(searchLower)
              );
            }
            return json({ success: true, businesses });
          } catch (err) {
            return json({ success: false, message: "Error fetching businesses.", error: String(err) }, { status: 500 });
          }
        }
        if (url.pathname === "/api/business/posts" && request.method === "GET") {
          try {
            const businessId = url.searchParams.get("business_id");
            if (!businessId) return json({ success: false, message: "business_id is required" }, { status: 400 });
            const posts = await firestore2.runQuery({
              from: [{ collectionId: "business_posts" }],
              where: {
                compositeFilter: {
                  op: "AND",
                  filters: [
                    { fieldFilter: { field: { fieldPath: "business_id" }, op: "EQUAL", value: { stringValue: businessId } } }
                  ]
                }
              },
              orderBy: [{ field: { fieldPath: "created_at" }, direction: "DESCENDING" }],
              limit: 50
            });
            return json({ success: true, posts });
          } catch (err) {
            return json({ success: true, posts: [] });
          }
        }
        const businessMatch = url.pathname.match(/^\/api\/business\/([a-zA-Z0-9_:-]+)$/);
        if (businessMatch && request.method === "GET") {
          try {
            const id = businessMatch[1];
            const business = await firestore2.getDocument("businesses", id);
            if (!business) {
              return json({ success: false, message: "Business not found." }, { status: 404 });
            }
            return json({ success: true, business });
          } catch (err) {
            return json({ success: false, message: "Error fetching business.", error: String(err) }, { status: 500 });
          }
        }
        if (url.pathname === "/api/users/leaderboard") return json({ success: true, leaderboard: [] });
        if (url.pathname === "/api/ads/admin/stats") return json({ totalRevenue: 0, activeSponsors: 0, totalViews: 0, revenueTrend: [] });
        if (url.pathname === "/api/ads/admin/sponsors") return json([]);
        if (url.pathname === "/api/ads/admin/pending") return json([]);
        if (url.pathname === "/api/ads/admin/config") return json({ communityViewCost: 0.1, communityClickCost: 5, newsViewCost: 0.15, newsClickCost: 6, resultViewCost: 0.2, resultClickCost: 8, inFeedFrequency: 10, adSenseBackupId: "", examResultSlotId: "", homeSlotId: "" });
        if (url.pathname === "/api/support/admin/tickets") {
          try {
            const results = await firestore2.runQuery({
              from: [{ collectionId: "tickets" }],
              orderBy: [{ field: { fieldPath: "created_at" }, direction: "DESCENDING" }]
            });
            return json({ success: true, data: results });
          } catch (e) {
            return json({ success: false, data: [] });
          }
        }
        if (url.pathname === "/api/admin/backups") return json([]);
        if (url.pathname === "/api/admin/backups/logs") return json([]);
        if (url.pathname === "/api/admin/messages") return json([]);
        if (url.pathname === "/api/admin/reports") return json([]);
        if (url.pathname === "/api/support/tickets" && request.method === "POST") {
          try {
            const body = await readJson(request);
            const auth = await requireAuthUserId(request, env);
            const userId = "error" in auth ? "anonymous" : auth.userId;
            const ticket_id = Math.floor(Math.random() * 1e6).toString().padStart(6, "0");
            const ticketData = {
              id: ticket_id,
              ticket_id,
              subject: body?.subject || "\u0E41\u0E08\u0E49\u0E07\u0E1B\u0E31\u0E0D\u0E2B\u0E32",
              description: body?.description || "\u0E44\u0E21\u0E48\u0E21\u0E35\u0E23\u0E32\u0E22\u0E25\u0E30\u0E40\u0E2D\u0E35\u0E22\u0E14",
              category: body?.category || "general",
              status: "open",
              user_id: userId,
              created_at: (/* @__PURE__ */ new Date()).toISOString(),
              updated_at: (/* @__PURE__ */ new Date()).toISOString()
            };
            const created = await firestore2.createDocument("tickets", ticketData);
            return json({ success: true, data: created });
          } catch (e) {
            return json({ success: false, message: "Failed to create ticket" }, { status: 500 });
          }
        }
        if (url.pathname === "/api/support/tickets/my" && request.method === "GET") {
          try {
            const auth = await requireAuthUserId(request, env);
            if ("error" in auth) return auth.error;
            const results = await firestore2.runQuery({
              from: [{ collectionId: "tickets" }],
              where: { fieldFilter: { field: { fieldPath: "user_id" }, op: "EQUAL", value: { stringValue: auth.userId } } }
            });
            results.sort((a, b) => {
              const tA = a.created_at ? new Date(a.created_at).getTime() : 0;
              const tB = b.created_at ? new Date(b.created_at).getTime() : 0;
              return tB - tA;
            });
            return json({ success: true, data: results });
          } catch (e) {
            return json({ success: false, data: [] });
          }
        }
        const ticketMatch = url.pathname.match(/^\/api\/support\/tickets\/([a-zA-Z0-9_-]+)$/);
        if (ticketMatch && request.method === "GET") {
          try {
            const ticketId = ticketMatch[1];
            const ticket = await firestore2.getDocument("tickets", ticketId);
            if (!ticket) return json({ success: false, message: "Ticket not found" }, { status: 404 });
            const messages = await firestore2.runQuery({
              from: [{ collectionId: "messages" }],
              orderBy: [{ field: { fieldPath: "created_at" }, direction: "ASCENDING" }]
            }, `tickets/${ticketId}`);
            ticket.messages = messages || [];
            return json({ success: true, data: ticket });
          } catch (e) {
            return json({ success: false, message: "Server error" }, { status: 500 });
          }
        }
        const ticketStatusMatch = url.pathname.match(/^\/api\/support\/tickets\/([a-zA-Z0-9_-]+)\/status$/);
        if (ticketStatusMatch && request.method === "PATCH") {
          try {
            const auth = await requireAuthUserId(request, env);
            if ("error" in auth) return auth.error;
            const ticketId = ticketStatusMatch[1];
            const body = await readJson(request);
            await firestore2.updateDocument("tickets", ticketId, {
              status: body.status,
              updated_at: (/* @__PURE__ */ new Date()).toISOString()
            });
            return json({ success: true, message: "Status updated" });
          } catch (e) {
            return json({ success: false, message: "Failed to update status" }, { status: 500 });
          }
        }
        const ticketMessageMatch = url.pathname.match(/^\/api\/support\/tickets\/([a-zA-Z0-9_-]+)\/messages$/);
        if (ticketMessageMatch && request.method === "POST") {
          try {
            const auth = await requireAuthUserId(request, env);
            const userId = "error" in auth ? "anonymous" : auth.userId;
            const ticketId = ticketMessageMatch[1];
            const body = await readJson(request);
            const messageData = {
              message: body.message,
              user_id: userId,
              is_admin: body.is_admin || body.is_internal_note || false,
              is_internal_note: body.is_internal_note || false,
              created_at: (/* @__PURE__ */ new Date()).toISOString()
            };
            const created = await firestore2.createDocument(`tickets/${ticketId}/messages`, messageData);
            await firestore2.updateDocument("tickets", ticketId, {
              updated_at: (/* @__PURE__ */ new Date()).toISOString()
            });
            return json({ success: true, data: created });
          } catch (e) {
            console.error("Add message error:", e);
            return json({ success: false, message: "Failed to add message" }, { status: 500 });
          }
        }
        if (url.pathname === "/api/admin/payments") return json([]);
        if (url.pathname === "/api/admin/ads/pending") return json([]);
        if (url.pathname === "/api/news/sources/all") return json({ success: true, data: [] });
        if (url.pathname === "/api/assets") return json({ success: true, data: [] });
        if (url.pathname === "/api/admin/stats" && request.method === "GET") {
          const auth = await requireAuthUserId(request, env);
          if ("error" in auth) return auth.error;
          try {
            const totalUsers = await firestore2.runCountQuery({ from: [{ collectionId: "users" }] });
            const premiumUsers = await firestore2.runCountQuery({
              from: [{ collectionId: "users" }],
              where: { fieldFilter: { field: { fieldPath: "plan_type" }, op: "EQUAL", value: { stringValue: "premium" } } }
            });
            const now = /* @__PURE__ */ new Date();
            const startOfDay = new Date(now);
            startOfDay.setHours(0, 0, 0, 0);
            let realActiveUsers = Math.floor(totalUsers * 0.1);
            try {
              realActiveUsers = await firestore2.runCountQuery({
                from: [{ collectionId: "users" }],
                where: {
                  fieldFilter: {
                    field: { fieldPath: "last_active_at" },
                    op: "GREATER_THAN_OR_EQUAL",
                    value: { stringValue: startOfDay.toISOString() }
                  }
                }
              });
            } catch (e) {
              console.error("Error querying active users:", e);
            }
            const currentMonth = now.getMonth();
            const currentYear = now.getFullYear();
            const payments = await firestore2.runQuery({ from: [{ collectionId: "payments" }], limit: 200, orderBy: [{ field: { fieldPath: "created_at" }, direction: "DESCENDING" }] });
            const trendMap = {};
            for (let i = 5; i >= 0; i--) {
              const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
              const monthName = d.toLocaleString("default", { month: "short" });
              trendMap[`${d.getFullYear()}-${d.getMonth()}`] = { name: monthName, value: 0 };
            }
            payments.forEach((doc) => {
              const amount = Number(doc.amount) || 0;
              const status = (doc.status || "unknown").toLowerCase();
              let created_at = /* @__PURE__ */ new Date();
              if (doc.created_at) {
                if (typeof doc.created_at === "string") created_at = new Date(doc.created_at);
                else if (doc.created_at._seconds) created_at = new Date(doc.created_at._seconds * 1e3);
              }
              if (status === "approved" || status === "completed" || status === "success") {
                const key = `${created_at.getFullYear()}-${created_at.getMonth()}`;
                if (trendMap[key]) {
                  trendMap[key].value += amount;
                }
              }
            });
            const startOfYear = new Date(currentYear, 0, 1).toISOString();
            const startOfMonth = new Date(currentYear, currentMonth, 1).toISOString();
            const successStatuses = ["approved", "completed", "success"];
            const revenueQuery = /* @__PURE__ */ __name(async (statusOp, statusValue, dateStart) => {
              const filters = [];
              if (Array.isArray(statusValue)) {
                filters.push({ fieldFilter: { field: { fieldPath: "status" }, op: "IN", value: { arrayValue: { values: statusValue.map((v) => ({ stringValue: v })) } } } });
              } else {
                filters.push({ fieldFilter: { field: { fieldPath: "status" }, op: statusOp, value: { stringValue: statusValue } } });
              }
              if (dateStart) {
                filters.push({ fieldFilter: { field: { fieldPath: "created_at" }, op: "GREATER_THAN_OR_EQUAL", value: { stringValue: dateStart } } });
              }
              const query = filters.length > 1 ? { compositeFilter: { op: "AND", filters } } : filters[0];
              const aggregations = [{ alias: "total", sum: { field: { fieldPath: "amount" } } }];
              try {
                const res = await firestore2.runAggregationQuery({ from: [{ collectionId: "payments" }], where: query }, aggregations);
                const val = res?.total?.integerValue || res?.total?.doubleValue || 0;
                return Number(val);
              } catch (e) {
                return 0;
              }
            }, "revenueQuery");
            const [pendingRevenue, totalRevenue, yearlyRevenue, monthlyRevenue] = await Promise.all([
              revenueQuery("EQUAL", "pending"),
              revenueQuery("IN", successStatuses),
              revenueQuery("IN", successStatuses, startOfYear),
              revenueQuery("IN", successStatuses, startOfMonth)
            ]);
            return json({
              revenue: {
                total: totalRevenue,
                monthly: monthlyRevenue,
                yearly: yearlyRevenue,
                pending: pendingRevenue,
                trend: Object.values(trendMap)
              },
              conversionRate: totalUsers > 0 ? (premiumUsers / totalUsers * 100).toFixed(1) : 0,
              activeUsers: realActiveUsers,
              commercialViability: [
                { name: "Jan", value: 65 },
                { name: "Feb", value: 75 },
                { name: "Mar", value: 85 }
              ],
              painPoints: [
                { subject: "Math", score: 45 },
                { subject: "Physics", score: 55 }
              ],
              communityHealth: {
                engagement: 85,
                sentiment: "Positive"
              }
            });
          } catch (err) {
            console.error("Admin stats error:", err);
            return json({
              revenue: { total: 0, monthly: 0, yearly: 0, pending: 0, trend: [] },
              conversionRate: 0,
              activeUsers: 0,
              commercialViability: [],
              painPoints: [],
              communityHealth: { engagement: 0, sentiment: "Neutral" },
              error: "failed to fetch stats",
              details: err.message
            });
          }
        }
        const adminUserLogsMatch = url.pathname.match(/^\/api\/admin\/users\/([a-zA-Z0-9_-]+)\/logs$/);
        if (adminUserLogsMatch && request.method === "GET") {
          const auth = await requireAuthUserId(request, env);
          if ("error" in auth) return auth.error;
          const userId = adminUserLogsMatch[1];
          const fetchLogs = /* @__PURE__ */ __name(async (value) => {
            return firestore2.runQuery({
              from: [{ collectionId: "system_logs" }],
              where: { fieldFilter: { field: { fieldPath: "user_id" }, op: "EQUAL", value } },
              orderBy: [{ field: { fieldPath: "created_at" }, direction: "DESCENDING" }],
              limit: 10
            }).catch(async () => {
              const allLogs = await firestore2.runQuery({
                from: [{ collectionId: "system_logs" }],
                where: { fieldFilter: { field: { fieldPath: "user_id" }, op: "EQUAL", value } },
                limit: 50
              });
              allLogs.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
              return allLogs.slice(0, 10);
            });
          }, "fetchLogs");
          const logsA = await fetchLogs({ stringValue: userId });
          const numericId = /^[0-9]+$/.test(userId) ? userId : null;
          const logsB = numericId ? await fetchLogs({ integerValue: numericId }) : [];
          const merged = /* @__PURE__ */ new Map();
          for (const l of [...logsA, ...logsB]) {
            const key = String(l.doc_id || l.id || "");
            if (!key) continue;
            merged.set(key, l);
          }
          const logs = Array.from(merged.values()).sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()).slice(0, 10);
          return json({ success: true, logs });
        }
        const adminUserHistoryMatch = url.pathname.match(/^\/api\/admin\/users\/([a-zA-Z0-9_-]+)\/history$/);
        if (adminUserHistoryMatch && request.method === "GET") {
          const auth = await requireAuthUserId(request, env);
          if ("error" in auth) return auth.error;
          const id = adminUserHistoryMatch[1];
          const userDoc = await firestore2.getDocument("users", id);
          if (!userDoc) return json({ message: "User not found" }, { status: 404 });
          const examHistory = await firestore2.runQuery({ from: [{ collectionId: "exam_results" }], where: { fieldFilter: { field: { fieldPath: "user_id" }, op: "EQUAL", value: { stringValue: id } } }, limit: 20 });
          const paymentHistory = await firestore2.runQuery({ from: [{ collectionId: "payments" }], where: { fieldFilter: { field: { fieldPath: "user_id" }, op: "EQUAL", value: { stringValue: id } } }, limit: 10 });
          return json({ success: true, user: userDoc, examHistory, paymentHistory });
        }
        const adminUserStatusMatch = url.pathname.match(/^\/api\/admin\/users\/([a-zA-Z0-9_-]+)\/status$/);
        if (adminUserStatusMatch && request.method === "PUT") {
          const auth = await requireAuthUserId(request, env);
          if ("error" in auth) return auth.error;
          const body = await request.json();
          await firestore2.updateDocument("users", adminUserStatusMatch[1], { status: body.status });
          return json({ success: true });
        }
        const adminUserPermMatch = url.pathname.match(/^\/api\/admin\/users\/([a-zA-Z0-9_-]+)\/permissions$/);
        if (adminUserPermMatch && request.method === "PUT") {
          const auth = await requireAuthUserId(request, env);
          if ("error" in auth) return auth.error;
          const body = await request.json();
          await firestore2.updateDocument("users", adminUserPermMatch[1], { admin_permissions: body.permissions });
          return json({ success: true });
        }
        const adminUserUpdateMatch = url.pathname.match(/^\/api\/admin\/users\/([a-zA-Z0-9_-]+)$/);
        if (adminUserUpdateMatch && request.method === "PUT") {
          const auth = await requireAuthUserId(request, env);
          if ("error" in auth) return auth.error;
          const body = await request.json();
          await firestore2.updateDocument("users", adminUserUpdateMatch[1], body);
          return json({ success: true });
        }
        if (url.pathname === "/api/admin/messages" && request.method === "GET") {
          const auth = await requireAuthUserId(request, env);
          if ("error" in auth) return auth.error;
          try {
            const messages = await firestore2.runQuery({
              from: [{ collectionId: "contact_messages" }],
              orderBy: [{ field: { fieldPath: "created_at" }, direction: "DESCENDING" }],
              limit: 50
            });
            const formattedMessages = messages.map((doc) => ({
              id: doc.id,
              type: doc.type || (doc.user_id ? "User" : "Visitor"),
              subject: doc.subject || "No Subject",
              from: doc.email || doc.name || "Unknown",
              content: doc.message || doc.content || "",
              is_read: doc.is_read || false,
              created_at: doc.created_at
            }));
            return json(formattedMessages);
          } catch (e) {
            try {
              const messages = await firestore2.runQuery({
                from: [{ collectionId: "contact_messages" }],
                limit: 50
              });
              const formattedMessages = messages.map((doc) => ({
                id: doc.id,
                type: doc.type || (doc.user_id ? "User" : "Visitor"),
                subject: doc.subject || "No Subject",
                from: doc.email || doc.name || "Unknown",
                content: doc.message || doc.content || "",
                is_read: doc.is_read || false,
                created_at: doc.created_at
              }));
              return json(formattedMessages.sort((a, b) => {
                const aSec = a.created_at?._seconds || 0;
                const bSec = b.created_at?._seconds || 0;
                return bSec - aSec;
              }));
            } catch (err) {
              return json({ error: "failed to fetch messages" }, { status: 500 });
            }
          }
        }
        if (url.pathname === "/api/admin/messages/broadcast" && request.method === "POST") {
          const auth = await requireAuthUserId(request, env);
          if ("error" in auth) return auth.error;
          return json({ success: true, message: "Broadcast sent" });
        }
        if (url.pathname === "/api/admin/users" && request.method === "GET") {
          const auth = await requireAuthUserId(request, env);
          if ("error" in auth) return auth.error;
          const users = await firestore2.runQuery({ from: [{ collectionId: "users" }], orderBy: [{ field: { fieldPath: "created_at" }, direction: "DESCENDING" }], limit: 1e3 });
          return json(users);
        }
        if (url.pathname === "/api/admin/seasons" && request.method === "GET") {
          const auth = await requireAuthUserId(request, env);
          if ("error" in auth) return auth.error;
          try {
            const seasons = await firestore2.runQuery({ from: [{ collectionId: "seasons" }], orderBy: [{ field: { fieldPath: "start_date" }, direction: "DESCENDING" }] });
            return json({ success: true, data: seasons });
          } catch (e) {
            return json({ success: true, data: [] });
          }
        }
        if (url.pathname === "/api/admin/seasons" && request.method === "POST") {
          const auth = await requireAuthUserId(request, env);
          if ("error" in auth) return auth.error;
          const body = await readJson(request);
          const oldSeasons = await firestore2.runQuery({ from: [{ collectionId: "seasons" }], where: { fieldFilter: { field: { fieldPath: "status" }, op: "EQUAL", value: { stringValue: "active" } } } });
          for (const s of oldSeasons) {
            await firestore2.updateDocument("seasons", s.id, { status: "completed", end_date: (/* @__PURE__ */ new Date()).toISOString() });
          }
          const id = body.id || String((/* @__PURE__ */ new Date()).getFullYear());
          const newSeason = await firestore2.createDocument("seasons", {
            name: body.name || `Season ${id}`,
            start_date: (/* @__PURE__ */ new Date()).toISOString(),
            status: "active",
            responsible_admin_id: body.responsible_admin_id || auth.userId,
            created_at: (/* @__PURE__ */ new Date()).toISOString(),
            updated_at: (/* @__PURE__ */ new Date()).toISOString()
          }, id);
          return json({ success: true, data: newSeason });
        }
        const seasonMatch = url.pathname.match(/^\/api\/admin\/seasons\/([a-zA-Z0-9_-]+)$/);
        if (seasonMatch && request.method === "PUT") {
          const auth = await requireAuthUserId(request, env);
          if ("error" in auth) return auth.error;
          const id = seasonMatch[1];
          const body = await readJson(request);
          await firestore2.updateDocument("seasons", id, { ...body, updated_at: (/* @__PURE__ */ new Date()).toISOString() });
          return json({ success: true });
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
          const addLog = /* @__PURE__ */ __name((msg) => {
            const now = (/* @__PURE__ */ new Date()).toLocaleString("en-GB", { timeZone: "Asia/Bangkok" });
            mockScraperLogs.push(`[${now}] ${msg}`);
          }, "addLog");
          mockScraperLogs = [];
          addLog("[System] Initiating Real OCSC Scraper job...");
          addLog("[System] Connecting to data source (job.ocsc.go.th)...");
          const runScraper = /* @__PURE__ */ __name(async () => {
            try {
              addLog("[Network] Fetching latest announcements from OCSC...");
              const targetUrl = "https://jobapp.ocsc.go.th/jobapi/portal/jobs";
              console.log("Fetching URL:", targetUrl);
              const res = await fetch(targetUrl, {
                headers: {
                  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
                }
              });
              if (!res.ok) {
                addLog(`[Error] OCSC API returned status ${res.status}.`);
                mockScraperRunning = false;
                return;
              }
              const jsonResponse = await res.json();
              addLog("[Data] Parsing JSON elements...");
              if (!Array.isArray(jsonResponse) || jsonResponse.length === 0) {
                console.log("Warning: No jobs found or API structure changed.");
                addLog("[Warning] No jobs found or API structure changed.");
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
              addLog(`[Data] Extracted ${parsedJobs.length} jobs. Checking for duplicates in Database...`);
              let addedCount = 0;
              let skipCount = 0;
              const existingOCSCJobs = await firestore2.runQuery({
                from: [{ collectionId: "news" }],
                where: {
                  fieldFilter: {
                    field: { fieldPath: "author" },
                    op: "EQUAL",
                    value: { stringValue: "\u0E23\u0E30\u0E1A\u0E1A\u0E2D\u0E31\u0E15\u0E42\u0E19\u0E21\u0E31\u0E15\u0E34 (OCSC)" }
                  }
                }
              });
              const existingLinks = new Set(existingOCSCJobs.map((j) => j.external_link).filter(Boolean));
              const newDocs = [];
              for (const job of parsedJobs) {
                const externalLink = "https://job.ocsc.go.th/portal/jobs/" + job.id;
                if (existingLinks.has(externalLink)) {
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
                newDocs.push(newDoc);
                existingLinks.add(externalLink);
              }
              if (newDocs.length > 0) {
                addLog(`[System] Batch inserting ${newDocs.length} new jobs...`);
                await firestore2.batchCreateDocuments("news", newDocs);
                addedCount = newDocs.length;
              }
              console.log(`Saved ${addedCount} new announcements. Skipped ${skipCount} duplicates.`);
              addLog(`[Data] Saved ${addedCount} new announcements. Skipped ${skipCount} duplicates.`);
              mockScraperRunning = false;
              addLog("[System] Scraper job completed successfully.");
            } catch (e) {
              console.error("Scraper Error Caught:", e);
              addLog("[Error] Failed to process scraper job: " + String(e));
              mockScraperRunning = false;
            }
          }, "runScraper");
          ctx.waitUntil(runScraper());
          return json({ success: true, message: "Scraper started" });
        }
        if (url.pathname === "/api/admin/scraper/status") {
          return json({ success: true, data: { isRunning: mockScraperRunning, logs: mockScraperLogs } });
        }
        if (url.pathname === "/api/admin/scraper/schedule" && request.method === "POST") {
          const body = await request.json();
          return json({ success: true, message: "Schedule updated to " + (body.frequency || "unknown") });
        }
        if (url.pathname === "/api/admin/generator/start" && request.method === "POST") {
          if (aiGeneratorState.isRunning) {
            return json({ success: false, message: "Generator is already running" }, { status: 400 });
          }
          const prompt = "\u0E2A\u0E23\u0E49\u0E32\u0E07\u0E02\u0E49\u0E2D\u0E2A\u0E2D\u0E1A\u0E41\u0E1A\u0E1A\u0E2A\u0E38\u0E48\u0E21 10 \u0E02\u0E49\u0E2D";
          ctx.waitUntil(runAIGenerator(prompt, env));
          return json({ success: true, message: "Generator started" });
        }
        if (url.pathname === "/api/admin/generator/status") {
          let statusDoc = { isRunning: aiGeneratorState.isRunning, logs: aiGeneratorState.logs };
          try {
            const config = parseServiceAccount(env);
            if (config) {
              const firestore3 = new FirestoreClient(config);
              const doc = await firestore3.getDocument("system", "generator_status");
              if (doc) {
                statusDoc = doc;
              }
            }
          } catch (e) {
          }
          return json({ success: true, data: statusDoc });
        }
        if (url.pathname === "/api/terminal/status") return json({ status: "online" });
        if (url.pathname === "/api/terminal/command" && request.method === "POST") {
          const body = await request.json();
          const cmd = body.command?.trim() || "";
          if (cmd === "status") {
            return json({ message: ">>> Status: Ready (Active Provider: Google Gemini)" });
          }
          if (cmd.startsWith("gen ")) {
            if (aiGeneratorState.isRunning) {
              return json({ message: ">>> Error: Generator is already running. Please wait." });
            }
            const prompt = cmd.substring(4).trim();
            ctx.waitUntil(runAIGenerator(prompt, env));
            return json({ message: `>>> Initiating AI generation for prompt: "${prompt}"... Check the status panel for progress.` });
          }
          return json({ message: `>>> Unknown command: ${cmd}` });
        }
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
    await cleanupExpiredRooms(env);
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
    const news = await firestore.runQuery({ from: [{ collectionId: "news" }], limit: 50 });
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
async function cleanupExpiredRooms(env) {
  const firestore = new FirestoreClient(env);
  try {
    const rooms = await firestore.runQuery({ from: [{ collectionId: "exam_rooms" }], limit: 1e3 });
    const now = (/* @__PURE__ */ new Date()).getTime();
    let deletedCount = 0;
    const oneDayMs = 24 * 60 * 60 * 1e3;
    for (const room of rooms) {
      const createdAt = new Date(String(room.created_at || room.updated_at || Date.now())).getTime();
      if (now - createdAt > oneDayMs) {
        const participants = await firestore.listDocuments(`exam_rooms/${room.id}/participants`);
        for (const p of participants) {
          await firestore.deleteDocument(`exam_rooms/${room.id}/participants`, p.id);
        }
        await firestore.deleteDocument("exam_rooms", room.id);
        deletedCount++;
      }
    }
    console.log(`Room cleanup completed. Deleted ${deletedCount} expired rooms.`);
    return deletedCount;
  } catch (e) {
    console.error("Scheduled room cleanup failed", e);
    return 0;
  }
}
__name(cleanupExpiredRooms, "cleanupExpiredRooms");
export {
  RealtimeDO,
  index_default as default
};
//# sourceMappingURL=index.js.map
