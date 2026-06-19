var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// wrangler-modules-watch:wrangler:modules-watch
var init_wrangler_modules_watch = __esm({
  "wrangler-modules-watch:wrangler:modules-watch"() {
    init_modules_watch_stub();
  }
});

// node_modules/wrangler/templates/modules-watch-stub.js
var init_modules_watch_stub = __esm({
  "node_modules/wrangler/templates/modules-watch-stub.js"() {
    init_wrangler_modules_watch();
  }
});

// (disabled):crypto
var require_crypto = __commonJS({
  "(disabled):crypto"() {
    init_modules_watch_stub();
  }
});

// .wrangler/tmp/bundle-GedDbd/middleware-loader.entry.ts
init_modules_watch_stub();

// .wrangler/tmp/bundle-GedDbd/middleware-insertion-facade.js
init_modules_watch_stub();

// src/index.ts
init_modules_watch_stub();

// src/realtime.ts
init_modules_watch_stub();

// src/d1.ts
init_modules_watch_stub();
var USER_COLUMNS = [
  "id",
  "email",
  "password_hash",
  "display_name",
  "avatar",
  "role",
  "plan_type",
  "status",
  "xp",
  "level",
  "last_active_at",
  "created_at",
  "updated_at",
  "public_id",
  "google_id",
  "facebook_id",
  "guest_device_id",
  "phone_number",
  "bio",
  "city",
  "region",
  "country",
  "target_exam",
  "target_exam_date",
  "theme_preference",
  "font_size_preference",
  "wallet_balance",
  "wallet_address",
  "premium_expiry",
  "premium_start_date",
  "streak_count",
  "last_claim_date",
  "rank_level",
  "settings_friends_online",
  "settings_streak_reminder",
  "settings_new_message",
  "notify_friend_request",
  "notify_study_group",
  "notify_news_update",
  "allow_friend_request",
  "is_public_stats",
  "is_online_visible",
  "admin_permissions",
  "business_name",
  "business_info",
  "ip_address",
  "mistake_history",
  "reset_password_token",
  "reset_password_expires",
  "last_announcement_at",
  "tax_id",
  "xp_points",
  "extra_json"
];
var NEWS_BASE_COLUMNS = [
  "id",
  "title",
  "content",
  "category",
  "agency",
  "author",
  "external_link",
  "status",
  "application_start",
  "application_end",
  "metadata",
  "created_at",
  "updated_at"
];
var USER_UPDATE_COLUMNS = USER_COLUMNS.filter((col) => col !== "id");
var NEWS_UPDATE_COLUMNS = NEWS_BASE_COLUMNS.filter((col) => col !== "id" && col !== "created_at");
var nowIso = /* @__PURE__ */ __name(() => (/* @__PURE__ */ new Date()).toISOString(), "nowIso");
var generateTextId = /* @__PURE__ */ __name(() => crypto.randomUUID().replace(/-/g, ""), "generateTextId");
var safeJsonParse = /* @__PURE__ */ __name((value, fallback) => {
  if (typeof value !== "string" || !value.trim()) return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}, "safeJsonParse");
var pickExisting = /* @__PURE__ */ __name((source, keys) => {
  const picked = {};
  for (const key of keys) {
    if (source[key] !== void 0) picked[key] = source[key];
  }
  return picked;
}, "pickExisting");
var parseNewsRow = /* @__PURE__ */ __name((row) => {
  if (!row) return null;
  const metadata = safeJsonParse(row.metadata, {});
  return {
    ...row,
    metadata,
    summary: metadata.summary ?? null,
    is_featured: Boolean(metadata.is_featured),
    published_date: metadata.published_date ?? null,
    recruitment_type: metadata.recruitment_type ?? null,
    views: metadata.views ?? 0
  };
}, "parseNewsRow");
var parseUserRow = /* @__PURE__ */ __name((row) => {
  if (!row) return null;
  const xp = Number(row.xp ?? row.xp_points ?? 0) || 0;
  return {
    ...row,
    xp,
    xp_points: Number(row.xp_points ?? xp) || 0,
    level: Number(row.level ?? 1) || 1,
    wallet_balance: Number(row.wallet_balance ?? 0) || 0,
    streak_count: Number(row.streak_count ?? 0) || 0,
    settings_friends_online: row.settings_friends_online === null || row.settings_friends_online === void 0 ? null : Boolean(Number(row.settings_friends_online)),
    settings_streak_reminder: row.settings_streak_reminder === null || row.settings_streak_reminder === void 0 ? null : Boolean(Number(row.settings_streak_reminder)),
    settings_new_message: row.settings_new_message === null || row.settings_new_message === void 0 ? null : Boolean(Number(row.settings_new_message)),
    notify_friend_request: row.notify_friend_request === null || row.notify_friend_request === void 0 ? null : Boolean(Number(row.notify_friend_request)),
    notify_study_group: row.notify_study_group === null || row.notify_study_group === void 0 ? null : Boolean(Number(row.notify_study_group)),
    notify_news_update: row.notify_news_update === null || row.notify_news_update === void 0 ? null : Boolean(Number(row.notify_news_update)),
    allow_friend_request: row.allow_friend_request === null || row.allow_friend_request === void 0 ? null : Boolean(Number(row.allow_friend_request)),
    is_public_stats: row.is_public_stats === null || row.is_public_stats === void 0 ? null : Boolean(Number(row.is_public_stats)),
    is_online_visible: row.is_online_visible === null || row.is_online_visible === void 0 ? null : Boolean(Number(row.is_online_visible)),
    admin_permissions: parseStructuredValue(row.admin_permissions, []),
    business_info: parseStructuredValue(row.business_info, null),
    mistake_history: parseStructuredValue(row.mistake_history, null),
    extra_json: parseStructuredValue(row.extra_json, null)
  };
}, "parseUserRow");
var mergeNewsMetadata = /* @__PURE__ */ __name((body, existingMetadata = {}) => {
  const metadata = {
    ...existingMetadata,
    ...body.metadata && typeof body.metadata === "object" && !Array.isArray(body.metadata) ? body.metadata : {}
  };
  for (const [key, value] of Object.entries(body)) {
    if (NEWS_BASE_COLUMNS.includes(key) || key === "metadata" || key === "created_at" || key === "updated_at") {
      continue;
    }
    metadata[key] = value;
  }
  for (const [key, value] of Object.entries(metadata)) {
    if (value === void 0) delete metadata[key];
  }
  return metadata;
}, "mergeNewsMetadata");
async function getUserById(db, id) {
  return parseUserRow(await db.prepare("SELECT * FROM users WHERE id = ? LIMIT 1").bind(String(id)).first());
}
__name(getUserById, "getUserById");
async function getUserByEmail(db, email) {
  return parseUserRow(await db.prepare("SELECT * FROM users WHERE lower(email) = lower(?) LIMIT 1").bind(String(email)).first());
}
__name(getUserByEmail, "getUserByEmail");
async function listUsers(db, limit = 100) {
  const { results } = await db.prepare("SELECT * FROM users ORDER BY datetime(created_at) DESC LIMIT ?").bind(limit).all();
  return (results || []).map(parseUserRow);
}
__name(listUsers, "listUsers");
async function createUser(db, data) {
  const timestamp = data.created_at || nowIso();
  const row = {
    id: data.id || generateTextId(),
    email: data.email ? String(data.email).trim().toLowerCase() : null,
    password_hash: data.password_hash ?? null,
    display_name: data.display_name ?? null,
    avatar: data.avatar ?? null,
    role: data.role ?? "user",
    plan_type: data.plan_type ?? "free",
    status: data.status ?? "active",
    xp: Number.isFinite(Number(data.xp)) ? Number(data.xp) : 0,
    level: Number.isFinite(Number(data.level)) ? Number(data.level) : 1,
    last_active_at: data.last_active_at ?? null,
    created_at: timestamp,
    updated_at: data.updated_at ?? timestamp,
    public_id: data.public_id ?? null,
    google_id: data.google_id ?? null,
    facebook_id: data.facebook_id ?? null,
    guest_device_id: data.guest_device_id ?? null,
    phone_number: data.phone_number ?? null,
    bio: data.bio ?? null,
    city: data.city ?? null,
    region: data.region ?? null,
    country: data.country ?? null,
    target_exam: data.target_exam ?? null,
    target_exam_date: data.target_exam_date ?? null,
    theme_preference: data.theme_preference ?? "system",
    font_size_preference: data.font_size_preference ?? "medium",
    wallet_balance: Number.isFinite(Number(data.wallet_balance)) ? Number(data.wallet_balance) : 0,
    wallet_address: data.wallet_address ?? null,
    premium_expiry: data.premium_expiry ?? null,
    premium_start_date: data.premium_start_date ?? null,
    streak_count: Number.isFinite(Number(data.streak_count)) ? Number(data.streak_count) : 0,
    last_claim_date: data.last_claim_date ?? null,
    rank_level: data.rank_level ?? "Newbie",
    settings_friends_online: data.settings_friends_online === void 0 ? null : Number(Boolean(data.settings_friends_online)),
    settings_streak_reminder: data.settings_streak_reminder === void 0 ? null : Number(Boolean(data.settings_streak_reminder)),
    settings_new_message: data.settings_new_message === void 0 ? null : Number(Boolean(data.settings_new_message)),
    notify_friend_request: data.notify_friend_request === void 0 ? 1 : Number(Boolean(data.notify_friend_request)),
    notify_study_group: data.notify_study_group === void 0 ? 1 : Number(Boolean(data.notify_study_group)),
    notify_news_update: data.notify_news_update === void 0 ? 1 : Number(Boolean(data.notify_news_update)),
    allow_friend_request: data.allow_friend_request === void 0 ? 1 : Number(Boolean(data.allow_friend_request)),
    is_public_stats: data.is_public_stats === void 0 ? 1 : Number(Boolean(data.is_public_stats)),
    is_online_visible: data.is_online_visible === void 0 ? 1 : Number(Boolean(data.is_online_visible)),
    admin_permissions: maybeJsonStringify(data.admin_permissions ?? []),
    business_name: data.business_name ?? null,
    business_info: maybeJsonStringify(data.business_info),
    ip_address: data.ip_address ?? null,
    mistake_history: maybeJsonStringify(data.mistake_history),
    reset_password_token: data.reset_password_token ?? null,
    reset_password_expires: data.reset_password_expires ?? null,
    last_announcement_at: data.last_announcement_at ?? null,
    tax_id: data.tax_id ?? null,
    xp_points: Number.isFinite(Number(data.xp_points)) ? Number(data.xp_points) : Number.isFinite(Number(data.xp)) ? Number(data.xp) : 0,
    extra_json: maybeJsonStringify(data.extra_json)
  };
  await db.prepare(
    `INSERT INTO users (${USER_COLUMNS.join(", ")}) VALUES (${USER_COLUMNS.map(() => "?").join(", ")})`
  ).bind(...USER_COLUMNS.map((column) => row[column])).run();
  return getUserById(db, row.id);
}
__name(createUser, "createUser");
async function updateUser(db, id, updates) {
  const normalized = {
    ...updates,
    updated_at: updates.updated_at ?? nowIso(),
    admin_permissions: updates.admin_permissions !== void 0 ? maybeJsonStringify(updates.admin_permissions) : void 0,
    business_info: updates.business_info !== void 0 ? maybeJsonStringify(updates.business_info) : void 0,
    mistake_history: updates.mistake_history !== void 0 ? maybeJsonStringify(updates.mistake_history) : void 0,
    extra_json: updates.extra_json !== void 0 ? maybeJsonStringify(updates.extra_json) : void 0,
    settings_friends_online: updates.settings_friends_online !== void 0 ? Number(Boolean(updates.settings_friends_online)) : void 0,
    settings_streak_reminder: updates.settings_streak_reminder !== void 0 ? Number(Boolean(updates.settings_streak_reminder)) : void 0,
    settings_new_message: updates.settings_new_message !== void 0 ? Number(Boolean(updates.settings_new_message)) : void 0,
    notify_friend_request: updates.notify_friend_request !== void 0 ? Number(Boolean(updates.notify_friend_request)) : void 0,
    notify_study_group: updates.notify_study_group !== void 0 ? Number(Boolean(updates.notify_study_group)) : void 0,
    notify_news_update: updates.notify_news_update !== void 0 ? Number(Boolean(updates.notify_news_update)) : void 0,
    allow_friend_request: updates.allow_friend_request !== void 0 ? Number(Boolean(updates.allow_friend_request)) : void 0,
    is_public_stats: updates.is_public_stats !== void 0 ? Number(Boolean(updates.is_public_stats)) : void 0,
    is_online_visible: updates.is_online_visible !== void 0 ? Number(Boolean(updates.is_online_visible)) : void 0
  };
  const data = pickExisting(normalized, USER_UPDATE_COLUMNS);
  const entries = Object.entries(data);
  if (entries.length === 0) return getUserById(db, id);
  const sql = `UPDATE users SET ${entries.map(([key]) => `${key} = ?`).join(", ")} WHERE id = ?`;
  await db.prepare(sql).bind(...entries.map(([, value]) => value), String(id)).run();
  return getUserById(db, id);
}
__name(updateUser, "updateUser");
async function deleteUser(db, id) {
  await db.prepare("DELETE FROM users WHERE id = ?").bind(String(id)).run();
}
__name(deleteUser, "deleteUser");
async function touchUserLastActive(db, id, at = nowIso()) {
  await db.prepare("UPDATE users SET last_active_at = ?, updated_at = ? WHERE id = ?").bind(at, at, String(id)).run();
}
__name(touchUserLastActive, "touchUserLastActive");
async function createSystemLog(db, payload) {
  const id = generateTextId();
  const createdAt = payload.created_at || nowIso();
  const details = payload.details === void 0 ? null : typeof payload.details === "string" ? payload.details : JSON.stringify(payload.details);
  await db.prepare("INSERT INTO system_logs (id, action, user_id, details, created_at) VALUES (?, ?, ?, ?, ?)").bind(id, payload.action, payload.user_id ?? null, details, createdAt).run();
  return { id, action: payload.action, user_id: payload.user_id ?? null, details, created_at: createdAt };
}
__name(createSystemLog, "createSystemLog");
async function getNewsById(db, id) {
  const row = await db.prepare("SELECT * FROM news WHERE id = ? LIMIT 1").bind(String(id)).first();
  return parseNewsRow(row);
}
__name(getNewsById, "getNewsById");
async function createNews(db, body) {
  const createdAt = body.created_at || nowIso();
  const updatedAt = body.updated_at || createdAt;
  const metadata = mergeNewsMetadata(body);
  const row = {
    id: body.id || generateTextId(),
    title: body.title || "",
    content: body.content || "",
    category: body.category || "",
    agency: body.agency || "",
    author: body.author || "",
    external_link: body.external_link || "",
    status: body.status || "active",
    application_start: body.application_start || "",
    application_end: body.application_end || "",
    metadata: Object.keys(metadata).length > 0 ? JSON.stringify(metadata) : null,
    created_at: createdAt,
    updated_at: updatedAt
  };
  await db.prepare(
    `INSERT INTO news (${NEWS_BASE_COLUMNS.join(", ")}) VALUES (${NEWS_BASE_COLUMNS.map(() => "?").join(", ")})`
  ).bind(...NEWS_BASE_COLUMNS.map((column) => row[column])).run();
  return getNewsById(db, row.id);
}
__name(createNews, "createNews");
async function updateNews(db, id, body) {
  const existing = await getNewsById(db, id);
  if (!existing) return null;
  const metadata = mergeNewsMetadata(body, existing.metadata || {});
  const data = pickExisting(
    {
      ...body,
      metadata: Object.keys(metadata).length > 0 ? JSON.stringify(metadata) : null,
      updated_at: body.updated_at || nowIso()
    },
    NEWS_UPDATE_COLUMNS
  );
  const entries = Object.entries(data);
  if (entries.length === 0) return existing;
  const sql = `UPDATE news SET ${entries.map(([key]) => `${key} = ?`).join(", ")} WHERE id = ?`;
  await db.prepare(sql).bind(...entries.map(([, value]) => value), String(id)).run();
  return getNewsById(db, id);
}
__name(updateNews, "updateNews");
async function deleteNews(db, id) {
  await db.prepare("DELETE FROM news WHERE id = ?").bind(String(id)).run();
}
__name(deleteNews, "deleteNews");
async function toggleNewsFeatured(db, id) {
  const existing = await getNewsById(db, id);
  if (!existing) return null;
  const metadata = {
    ...existing.metadata || {},
    is_featured: !Boolean(existing.metadata?.is_featured)
  };
  await db.prepare("UPDATE news SET metadata = ?, updated_at = ? WHERE id = ?").bind(JSON.stringify(metadata), nowIso(), String(id)).run();
  return getNewsById(db, id);
}
__name(toggleNewsFeatured, "toggleNewsFeatured");
var EXAM_ROOM_COLUMNS = [
  "id",
  "title",
  "host_id",
  "type",
  "config",
  "status",
  "season_id",
  "is_private",
  "password",
  "created_at",
  "updated_at",
  "code",
  "name",
  "mode",
  "tutor_submode",
  "host_user_id",
  "subject",
  "category",
  "max_participants",
  "question_count",
  "settings",
  "question_ids",
  "custom_questions",
  "theme",
  "theme_color",
  "background_url"
];
var EXAM_ROOM_PARTICIPANT_COLUMNS = [
  "id",
  "room_id",
  "user_id",
  "score",
  "time_taken",
  "joined_at",
  "completed_at",
  "status",
  "current_question_index",
  "nickname",
  "answers",
  "updated_at"
];
var EXAM_RESULT_COLUMNS = [
  "id",
  "user_id",
  "classroom_id",
  "score",
  "total_score",
  "mode",
  "subject_scores",
  "skill_scores",
  "questions",
  "time_taken",
  "taken_at",
  "rating",
  "feedback_comment",
  "created_at",
  "updated_at"
];
var EXAM_ROOM_UPDATE_COLUMNS = EXAM_ROOM_COLUMNS.filter((col) => col !== "id");
var EXAM_ROOM_PARTICIPANT_UPDATE_COLUMNS = EXAM_ROOM_PARTICIPANT_COLUMNS.filter((col) => col !== "id");
var EXAM_RESULT_UPDATE_COLUMNS = EXAM_RESULT_COLUMNS.filter((col) => col !== "id");
var parseStructuredValue = /* @__PURE__ */ __name((value, fallback) => {
  if (value === null || value === void 0) return fallback;
  if (typeof value === "string") return safeJsonParse(value, fallback);
  if (typeof value === "object") return value;
  return fallback;
}, "parseStructuredValue");
var maybeJsonStringify = /* @__PURE__ */ __name((value) => {
  if (value === void 0 || value === null) return null;
  if (typeof value === "string") return value;
  return JSON.stringify(value);
}, "maybeJsonStringify");
var parseQuestionRow = /* @__PURE__ */ __name((row) => {
  if (!row) return null;
  const choices = parseStructuredValue(row.choices, { A: "", B: "", C: "", D: "" });
  return {
    ...row,
    choices,
    choice_a: row.choice_a ?? choices.A ?? "",
    choice_b: row.choice_b ?? choices.B ?? "",
    choice_c: row.choice_c ?? choices.C ?? "",
    choice_d: row.choice_d ?? choices.D ?? ""
  };
}, "parseQuestionRow");
var parseExamRoomRow = /* @__PURE__ */ __name((row) => {
  if (!row) return null;
  const config = parseStructuredValue(row.config, {});
  const settings = parseStructuredValue(row.settings ?? config.settings, {});
  const questionIds = parseStructuredValue(row.question_ids ?? config.question_ids, []);
  const customQuestions = parseStructuredValue(row.custom_questions ?? config.custom_questions, null);
  const theme = parseStructuredValue(row.theme ?? config.theme, null);
  return {
    ...config,
    ...row,
    id: String(row.id),
    code: row.code ?? config.code ?? null,
    name: row.name ?? row.title ?? config.name ?? null,
    mode: row.mode ?? row.type ?? config.mode ?? null,
    tutor_submode: row.tutor_submode ?? config.tutor_submode ?? "step",
    host_user_id: String(row.host_user_id ?? row.host_id ?? config.host_user_id ?? ""),
    subject: row.subject ?? config.subject ?? null,
    category: row.category ?? config.category ?? null,
    max_participants: Number(row.max_participants ?? config.max_participants ?? 20),
    question_count: Number(row.question_count ?? config.question_count ?? 0),
    settings,
    question_ids: questionIds,
    custom_questions: customQuestions,
    theme,
    status: row.status ?? config.status ?? "waiting",
    password: row.password ?? config.password ?? null,
    created_at: row.created_at ?? config.created_at ?? null,
    updated_at: row.updated_at ?? config.updated_at ?? null,
    title: row.title ?? config.title ?? row.name ?? config.name ?? null,
    host_id: row.host_id ?? config.host_id ?? row.host_user_id ?? config.host_user_id ?? null,
    type: row.type ?? config.type ?? row.mode ?? config.mode ?? null,
    config
  };
}, "parseExamRoomRow");
var buildExamRoomRow = /* @__PURE__ */ __name((data) => {
  const timestamp = data.created_at || nowIso();
  const config = {
    code: data.code ?? null,
    name: data.name ?? data.title ?? null,
    mode: data.mode ?? data.type ?? null,
    tutor_submode: data.tutor_submode ?? "step",
    host_user_id: data.host_user_id ?? data.host_id ?? null,
    subject: data.subject ?? null,
    category: data.category ?? null,
    max_participants: Number(data.max_participants ?? 20),
    question_count: Number(data.question_count ?? 0),
    settings: parseStructuredValue(data.settings, {}),
    question_ids: parseStructuredValue(data.question_ids, []),
    custom_questions: parseStructuredValue(data.custom_questions, null),
    theme: parseStructuredValue(data.theme, null),
    theme_color: data.theme_color ?? null,
    background_url: data.background_url ?? null
  };
  return {
    id: String(data.id || generateTextId()),
    title: data.title ?? config.name ?? "",
    host_id: String(data.host_id ?? config.host_user_id ?? ""),
    type: data.type ?? config.mode ?? "",
    config: JSON.stringify(config),
    status: data.status ?? "waiting",
    season_id: data.season_id ?? null,
    is_private: data.is_private ?? (data.password ? 1 : 0),
    password: data.password ?? null,
    created_at: timestamp,
    updated_at: data.updated_at ?? timestamp,
    code: config.code,
    name: config.name,
    mode: config.mode,
    tutor_submode: config.tutor_submode,
    host_user_id: config.host_user_id ? String(config.host_user_id) : null,
    subject: config.subject,
    category: config.category,
    max_participants: config.max_participants,
    question_count: config.question_count,
    settings: maybeJsonStringify(config.settings),
    question_ids: maybeJsonStringify(config.question_ids),
    custom_questions: maybeJsonStringify(config.custom_questions),
    theme: maybeJsonStringify(config.theme),
    theme_color: config.theme_color,
    background_url: config.background_url
  };
}, "buildExamRoomRow");
var parseExamRoomParticipantRow = /* @__PURE__ */ __name((row) => {
  if (!row) return null;
  return {
    ...row,
    id: String(row.id),
    room_id: String(row.room_id),
    user_id: String(row.user_id),
    score: Number(row.score ?? 0),
    time_taken: Number(row.time_taken ?? 0),
    status: row.status ?? "joined",
    current_question_index: Number(row.current_question_index ?? 0),
    answers: parseStructuredValue(row.answers, row.answers ?? null),
    nickname: row.nickname ?? null,
    joined_at: row.joined_at ?? null,
    completed_at: row.completed_at ?? null,
    updated_at: row.updated_at ?? null
  };
}, "parseExamRoomParticipantRow");
var buildExamRoomParticipantRow = /* @__PURE__ */ __name((roomId, userId, data, existingId) => {
  const timestamp = data.updated_at || nowIso();
  return {
    id: String(existingId || data.id || `${roomId}:${userId}`),
    room_id: String(roomId),
    user_id: String(userId),
    score: Number(data.score ?? 0),
    time_taken: Number(data.time_taken ?? 0),
    joined_at: data.joined_at ?? data.created_at ?? timestamp,
    completed_at: data.completed_at ?? null,
    status: data.status ?? "joined",
    current_question_index: Number(data.current_question_index ?? 0),
    nickname: data.nickname ?? null,
    answers: maybeJsonStringify(data.answers),
    updated_at: timestamp
  };
}, "buildExamRoomParticipantRow");
var parseExamResultRow = /* @__PURE__ */ __name((row) => {
  if (!row) return null;
  return {
    ...row,
    id: String(row.id),
    user_id: row.user_id !== null && row.user_id !== void 0 ? String(row.user_id) : null,
    classroom_id: row.classroom_id !== null && row.classroom_id !== void 0 ? String(row.classroom_id) : null,
    score: Number(row.score ?? 0),
    total_score: Number(row.total_score ?? 0),
    time_taken: Number(row.time_taken ?? 0),
    subject_scores: parseStructuredValue(row.subject_scores, null),
    skill_scores: parseStructuredValue(row.skill_scores, null),
    questions: parseStructuredValue(row.questions, null)
  };
}, "parseExamResultRow");
var buildExamResultRow = /* @__PURE__ */ __name((data) => {
  const timestamp = data.created_at || data.taken_at || nowIso();
  return {
    id: String(data.id || generateTextId()),
    user_id: data.user_id !== void 0 && data.user_id !== null ? String(data.user_id) : null,
    classroom_id: data.classroom_id !== void 0 && data.classroom_id !== null ? String(data.classroom_id) : null,
    score: Number(data.score ?? 0),
    total_score: Number(data.total_score ?? 0),
    mode: data.mode ?? "practice",
    subject_scores: maybeJsonStringify(data.subject_scores),
    skill_scores: maybeJsonStringify(data.skill_scores),
    questions: maybeJsonStringify(data.questions),
    time_taken: Number(data.time_taken ?? 0),
    taken_at: data.taken_at ?? timestamp,
    rating: data.rating ?? null,
    feedback_comment: data.feedback_comment ?? null,
    created_at: timestamp,
    updated_at: data.updated_at ?? timestamp
  };
}, "buildExamResultRow");
async function getQuestionsByIds(db, ids) {
  if (!ids.length) return [];
  const normalizedIds = Array.from(new Set(ids.map((id) => String(id))));
  const placeholders = normalizedIds.map(() => "?").join(", ");
  const { results } = await db.prepare(`SELECT * FROM questions WHERE id IN (${placeholders})`).bind(...normalizedIds).all();
  return (results || []).map(parseQuestionRow);
}
__name(getQuestionsByIds, "getQuestionsByIds");
async function getExamRoomById(db, id) {
  const row = await db.prepare("SELECT * FROM exam_rooms WHERE id = ? LIMIT 1").bind(String(id)).first();
  return parseExamRoomRow(row);
}
__name(getExamRoomById, "getExamRoomById");
async function findExamRoomByCode(db, code) {
  const row = await db.prepare("SELECT * FROM exam_rooms WHERE code = ? LIMIT 1").bind(String(code)).first();
  return parseExamRoomRow(row);
}
__name(findExamRoomByCode, "findExamRoomByCode");
async function listExamRooms(db, limit = 100) {
  const { results } = await db.prepare("SELECT * FROM exam_rooms ORDER BY datetime(created_at) DESC LIMIT ?").bind(limit).all();
  return (results || []).map(parseExamRoomRow);
}
__name(listExamRooms, "listExamRooms");
async function createExamRoom(db, data) {
  const row = buildExamRoomRow(data);
  await db.prepare(`INSERT INTO exam_rooms (${EXAM_ROOM_COLUMNS.join(", ")}) VALUES (${EXAM_ROOM_COLUMNS.map(() => "?").join(", ")})`).bind(...EXAM_ROOM_COLUMNS.map((column) => row[column])).run();
  return getExamRoomById(db, row.id);
}
__name(createExamRoom, "createExamRoom");
async function updateExamRoom(db, id, updates) {
  const existing = await getExamRoomById(db, id);
  if (!existing) return null;
  const merged = buildExamRoomRow({ ...existing, ...updates, id: String(id), created_at: existing.created_at });
  const data = pickExisting(merged, EXAM_ROOM_UPDATE_COLUMNS);
  const entries = Object.entries(data);
  if (entries.length === 0) return existing;
  const sql = `UPDATE exam_rooms SET ${entries.map(([key]) => `${key} = ?`).join(", ")} WHERE id = ?`;
  await db.prepare(sql).bind(...entries.map(([, value]) => value), String(id)).run();
  return getExamRoomById(db, id);
}
__name(updateExamRoom, "updateExamRoom");
async function deleteExamRoom(db, id) {
  await db.prepare("DELETE FROM exam_room_participants WHERE room_id = ?").bind(String(id)).run();
  await db.prepare("DELETE FROM exam_rooms WHERE id = ?").bind(String(id)).run();
}
__name(deleteExamRoom, "deleteExamRoom");
async function listExamRoomParticipants(db, roomId) {
  const { results } = await db.prepare("SELECT * FROM exam_room_participants WHERE room_id = ? ORDER BY datetime(joined_at) ASC").bind(String(roomId)).all();
  return (results || []).map(parseExamRoomParticipantRow);
}
__name(listExamRoomParticipants, "listExamRoomParticipants");
async function getExamRoomParticipant(db, roomId, userId) {
  const row = await db.prepare("SELECT * FROM exam_room_participants WHERE room_id = ? AND user_id = ? LIMIT 1").bind(String(roomId), String(userId)).first();
  return parseExamRoomParticipantRow(row);
}
__name(getExamRoomParticipant, "getExamRoomParticipant");
async function upsertExamRoomParticipant(db, roomId, userId, updates) {
  const existing = await getExamRoomParticipant(db, roomId, userId);
  const row = buildExamRoomParticipantRow(roomId, userId, { ...existing, ...updates }, existing?.id);
  if (existing) {
    const data = pickExisting(row, EXAM_ROOM_PARTICIPANT_UPDATE_COLUMNS);
    const entries = Object.entries(data);
    const sql = `UPDATE exam_room_participants SET ${entries.map(([key]) => `${key} = ?`).join(", ")} WHERE id = ?`;
    await db.prepare(sql).bind(...entries.map(([, value]) => value), existing.id).run();
  } else {
    await db.prepare(
      `INSERT INTO exam_room_participants (${EXAM_ROOM_PARTICIPANT_COLUMNS.join(", ")}) VALUES (${EXAM_ROOM_PARTICIPANT_COLUMNS.map(() => "?").join(", ")})`
    ).bind(...EXAM_ROOM_PARTICIPANT_COLUMNS.map((column) => row[column])).run();
  }
  return getExamRoomParticipant(db, roomId, userId);
}
__name(upsertExamRoomParticipant, "upsertExamRoomParticipant");
async function resetExamRoomParticipants(db, roomId) {
  const timestamp = nowIso();
  await db.prepare(
    "UPDATE exam_room_participants SET score = 0, time_taken = 0, status = 'joined', current_question_index = 0, answers = NULL, completed_at = NULL, updated_at = ? WHERE room_id = ?"
  ).bind(timestamp, String(roomId)).run();
}
__name(resetExamRoomParticipants, "resetExamRoomParticipants");
async function createExamResult(db, data) {
  const row = buildExamResultRow(data);
  await db.prepare(
    `INSERT INTO exam_results (${EXAM_RESULT_COLUMNS.join(", ")}) VALUES (${EXAM_RESULT_COLUMNS.map(() => "?").join(", ")})`
  ).bind(...EXAM_RESULT_COLUMNS.map((column) => row[column])).run();
  return getExamResultById(db, row.id);
}
__name(createExamResult, "createExamResult");
async function getExamResultById(db, id) {
  const row = await db.prepare("SELECT * FROM exam_results WHERE id = ? LIMIT 1").bind(String(id)).first();
  return parseExamResultRow(row);
}
__name(getExamResultById, "getExamResultById");
async function listExamResultsByUser(db, userId, limit) {
  const sql = limit ? "SELECT * FROM exam_results WHERE user_id = ? ORDER BY datetime(taken_at) DESC LIMIT ?" : "SELECT * FROM exam_results WHERE user_id = ? ORDER BY datetime(taken_at) DESC";
  const stmt = db.prepare(sql);
  const result = limit ? await stmt.bind(String(userId), limit).all() : await stmt.bind(String(userId)).all();
  return (result.results || []).map(parseExamResultRow);
}
__name(listExamResultsByUser, "listExamResultsByUser");
async function listSeasons(db) {
  const { results } = await db.prepare("SELECT * FROM seasons ORDER BY datetime(start_date) DESC, datetime(created_at) DESC").all();
  return results || [];
}
__name(listSeasons, "listSeasons");
async function getSeasonById(db, id) {
  return await db.prepare("SELECT * FROM seasons WHERE id = ? LIMIT 1").bind(String(id)).first();
}
__name(getSeasonById, "getSeasonById");
async function getActiveSeason(db) {
  return await db.prepare("SELECT * FROM seasons WHERE status = 'active' ORDER BY datetime(start_date) DESC, datetime(created_at) DESC LIMIT 1").first();
}
__name(getActiveSeason, "getActiveSeason");
async function createSeason(db, data) {
  const now = nowIso();
  const row = {
    id: String(data.id || (/* @__PURE__ */ new Date()).getFullYear()),
    name: data.name || `Season ${data.id || (/* @__PURE__ */ new Date()).getFullYear()}`,
    start_date: data.start_date || now,
    end_date: data.end_date || null,
    status: data.status || "active",
    responsible_admin_id: data.responsible_admin_id || null,
    created_at: data.created_at || now,
    updated_at: data.updated_at || now
  };
  await db.prepare(
    "INSERT OR REPLACE INTO seasons (id, name, start_date, end_date, status, responsible_admin_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
  ).bind(
    row.id,
    row.name,
    row.start_date,
    row.end_date,
    row.status,
    row.responsible_admin_id,
    row.created_at,
    row.updated_at
  ).run();
  return getSeasonById(db, row.id);
}
__name(createSeason, "createSeason");
async function updateSeason(db, id, updates) {
  const existing = await getSeasonById(db, id);
  if (!existing) return null;
  const row = {
    ...existing,
    ...updates,
    id: String(id),
    updated_at: updates.updated_at || nowIso()
  };
  const allowed = ["name", "start_date", "end_date", "status", "responsible_admin_id", "updated_at"];
  const data = pickExisting(row, allowed);
  const entries = Object.entries(data);
  const sql = `UPDATE seasons SET ${entries.map(([key]) => `${key} = ?`).join(", ")} WHERE id = ?`;
  await db.prepare(sql).bind(...entries.map(([, value]) => value), String(id)).run();
  return getSeasonById(db, id);
}
__name(updateSeason, "updateSeason");
async function completeActiveSeasons(db, endedAt = nowIso()) {
  await db.prepare("UPDATE seasons SET status = 'completed', end_date = ?, updated_at = ? WHERE status = 'active'").bind(endedAt, endedAt).run();
}
__name(completeActiveSeasons, "completeActiveSeasons");
async function getRankingById(db, id) {
  return await db.prepare("SELECT * FROM rankings WHERE id = ? LIMIT 1").bind(String(id)).first();
}
__name(getRankingById, "getRankingById");
async function listRankingsBySeason(db, seasonId, limit = 50) {
  const { results } = await db.prepare("SELECT * FROM rankings WHERE season_id = ? ORDER BY total_score DESC, exams_taken DESC, datetime(updated_at) ASC LIMIT ?").bind(String(seasonId), limit).all();
  return results || [];
}
__name(listRankingsBySeason, "listRankingsBySeason");
async function upsertRankingScore(db, seasonId, userId, scoreToAdd) {
  const id = `${seasonId}_${userId}`;
  const existing = await getRankingById(db, id);
  const updatedAt = nowIso();
  if (existing) {
    const totalScore = (Number(existing.total_score) || 0) + Number(scoreToAdd || 0);
    const examsTaken = (Number(existing.exams_taken) || 0) + 1;
    await db.prepare("UPDATE rankings SET total_score = ?, exams_taken = ?, updated_at = ? WHERE id = ?").bind(totalScore, examsTaken, updatedAt, id).run();
  } else {
    await db.prepare("INSERT INTO rankings (id, season_id, user_id, total_score, exams_taken, updated_at) VALUES (?, ?, ?, ?, ?, ?)").bind(id, String(seasonId), String(userId), Number(scoreToAdd || 0), 1, updatedAt).run();
  }
  return getRankingById(db, id);
}
__name(upsertRankingScore, "upsertRankingScore");
var parseMaybeJson = /* @__PURE__ */ __name((value) => typeof value === "string" ? safeJsonParse(value, value) : value, "parseMaybeJson");
var parseQuestionFullRow = /* @__PURE__ */ __name((row) => {
  const q = parseQuestionRow(row);
  if (!q) return null;
  return {
    ...q,
    catalogs: parseStructuredValue(q.catalogs, []),
    exam_year: q.exam_year ?? null,
    exam_set: q.exam_set ?? null,
    skill: q.skill ?? null
  };
}, "parseQuestionFullRow");
async function listAllQuestions(db) {
  const { results } = await db.prepare("SELECT * FROM questions").all();
  return (results || []).map(parseQuestionFullRow);
}
__name(listAllQuestions, "listAllQuestions");
async function getQuestionById(db, id) {
  const row = await db.prepare("SELECT * FROM questions WHERE id = ? LIMIT 1").bind(String(id)).first();
  return parseQuestionFullRow(row);
}
__name(getQuestionById, "getQuestionById");
async function createQuestion(db, data) {
  const row = {
    id: String(data.id || generateTextId()),
    question_text: data.question_text ?? "",
    choices: maybeJsonStringify(data.choices ?? { A: "", B: "", C: "", D: "" }),
    correct_answer: data.correct_answer ?? "",
    explanation: data.explanation ?? "",
    category: data.category ?? "",
    subject: data.subject ?? "",
    difficulty: Number(data.difficulty ?? 0),
    is_custom: Number(Boolean(data.is_custom)),
    host_user_id: data.host_user_id ?? null,
    created_at: data.created_at ?? nowIso(),
    updated_at: data.updated_at ?? data.created_at ?? nowIso(),
    catalogs: maybeJsonStringify(data.catalogs ?? []),
    skill: data.skill ?? null,
    exam_year: data.exam_year ?? null,
    exam_set: data.exam_set ?? null
  };
  await db.prepare(
    "INSERT INTO questions (id, question_text, choices, correct_answer, explanation, category, subject, difficulty, is_custom, host_user_id, created_at, updated_at, catalogs, skill, exam_year, exam_set) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
  ).bind(
    row.id,
    row.question_text,
    row.choices,
    row.correct_answer,
    row.explanation,
    row.category,
    row.subject,
    row.difficulty,
    row.is_custom,
    row.host_user_id,
    row.created_at,
    row.updated_at,
    row.catalogs,
    row.skill,
    row.exam_year,
    row.exam_set
  ).run();
  return getQuestionById(db, row.id);
}
__name(createQuestion, "createQuestion");
async function updateQuestion(db, id, data) {
  const normalized = {
    ...data,
    choices: data.choices !== void 0 ? maybeJsonStringify(data.choices) : void 0,
    catalogs: data.catalogs !== void 0 ? maybeJsonStringify(data.catalogs) : void 0,
    updated_at: data.updated_at ?? nowIso()
  };
  const allowed = [
    "question_text",
    "choices",
    "correct_answer",
    "explanation",
    "category",
    "subject",
    "difficulty",
    "is_custom",
    "host_user_id",
    "updated_at",
    "catalogs",
    "skill",
    "exam_year",
    "exam_set"
  ];
  const entries = Object.entries(pickExisting(normalized, allowed));
  if (!entries.length) return getQuestionById(db, id);
  const sql = `UPDATE questions SET ${entries.map(([key]) => `${key} = ?`).join(", ")} WHERE id = ?`;
  await db.prepare(sql).bind(...entries.map(([, value]) => value), String(id)).run();
  return getQuestionById(db, id);
}
__name(updateQuestion, "updateQuestion");
async function deleteQuestion(db, id) {
  await db.prepare("DELETE FROM questions WHERE id = ?").bind(String(id)).run();
}
__name(deleteQuestion, "deleteQuestion");
async function listBookmarksByUser(db, userId) {
  const { results } = await db.prepare("SELECT * FROM bookmarks WHERE user_id = ? ORDER BY datetime(created_at) DESC").bind(String(userId)).all();
  return results || [];
}
__name(listBookmarksByUser, "listBookmarksByUser");
async function createBookmark(db, data) {
  const row = {
    id: String(data.id || generateTextId()),
    user_id: String(data.user_id),
    question_id: data.question_id ?? data.target_id ?? null,
    note: data.note ?? data.title ?? null,
    created_at: data.created_at ?? nowIso(),
    target_type: data.target_type ?? null,
    target_id: data.target_id ?? null,
    title: data.title ?? null
  };
  await db.prepare("INSERT INTO bookmarks (id, user_id, question_id, note, created_at, target_type, target_id, title) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").bind(row.id, row.user_id, row.question_id, row.note, row.created_at, row.target_type, row.target_id, row.title).run();
  return row;
}
__name(createBookmark, "createBookmark");
async function getBookmarkById(db, id) {
  return await db.prepare("SELECT * FROM bookmarks WHERE id = ? LIMIT 1").bind(String(id)).first();
}
__name(getBookmarkById, "getBookmarkById");
async function deleteBookmark(db, id) {
  await db.prepare("DELETE FROM bookmarks WHERE id = ?").bind(String(id)).run();
}
__name(deleteBookmark, "deleteBookmark");
var parseMessageRow = /* @__PURE__ */ __name((row) => row ? { ...row, is_read: Boolean(Number(row.is_read ?? 0)) } : null, "parseMessageRow");
async function listDirectMessagesForUser(db, userId) {
  const { results } = await db.prepare("SELECT * FROM messages WHERE sender_id = ? OR receiver_id = ? ORDER BY datetime(created_at) ASC").bind(String(userId), String(userId)).all();
  return (results || []).map(parseMessageRow);
}
__name(listDirectMessagesForUser, "listDirectMessagesForUser");
async function listReceivedMessages(db, userId) {
  const { results } = await db.prepare("SELECT * FROM messages WHERE receiver_id = ? ORDER BY datetime(created_at) DESC").bind(String(userId)).all();
  return (results || []).map(parseMessageRow);
}
__name(listReceivedMessages, "listReceivedMessages");
async function createDirectMessage(db, data) {
  const row = {
    id: String(data.id || generateTextId()),
    room_id: data.room_id ?? null,
    sender_id: String(data.sender_id),
    text: data.text ?? data.content ?? null,
    created_at: data.created_at ?? nowIso(),
    receiver_id: String(data.receiver_id),
    content: data.content ?? data.text ?? "",
    is_read: Number(Boolean(data.is_read))
  };
  await db.prepare("INSERT INTO messages (id, room_id, sender_id, text, created_at, receiver_id, content, is_read) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").bind(row.id, row.room_id, row.sender_id, row.text, row.created_at, row.receiver_id, row.content, row.is_read).run();
  return parseMessageRow(row);
}
__name(createDirectMessage, "createDirectMessage");
async function markMessagesRead(db, receiverId, senderId) {
  if (senderId) {
    await db.prepare("UPDATE messages SET is_read = 1 WHERE receiver_id = ? AND sender_id = ? AND COALESCE(is_read,0) = 0").bind(String(receiverId), String(senderId)).run();
  } else {
    await db.prepare("UPDATE messages SET is_read = 1 WHERE receiver_id = ?").bind(String(receiverId)).run();
  }
}
__name(markMessagesRead, "markMessagesRead");
async function listFriendsByUser(db, userId) {
  const { results } = await db.prepare("SELECT * FROM friends WHERE requester_id = ? OR target_id = ? OR user_id1 = ? OR user_id2 = ?").bind(String(userId), String(userId), String(userId), String(userId)).all();
  return results || [];
}
__name(listFriendsByUser, "listFriendsByUser");
async function createFriendRequest(db, requesterId, targetId) {
  const row = {
    id: generateTextId(),
    user_id1: requesterId,
    user_id2: targetId,
    status: "pending",
    created_at: nowIso(),
    updated_at: nowIso(),
    requester_id: requesterId,
    target_id: targetId
  };
  await db.prepare("INSERT INTO friends (id, user_id1, user_id2, status, created_at, updated_at, requester_id, target_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").bind(row.id, row.user_id1, row.user_id2, row.status, row.created_at, row.updated_at, row.requester_id, row.target_id).run();
  return row;
}
__name(createFriendRequest, "createFriendRequest");
async function updateFriend(db, id, updates) {
  const normalized = { ...updates, updated_at: updates.updated_at ?? nowIso() };
  const allowed = ["status", "updated_at"];
  const entries = Object.entries(pickExisting(normalized, allowed));
  const sql = `UPDATE friends SET ${entries.map(([key]) => `${key} = ?`).join(", ")} WHERE id = ?`;
  await db.prepare(sql).bind(...entries.map(([, value]) => value), String(id)).run();
}
__name(updateFriend, "updateFriend");
async function deleteFriend(db, id) {
  await db.prepare("DELETE FROM friends WHERE id = ?").bind(String(id)).run();
}
__name(deleteFriend, "deleteFriend");
var parseNotificationRow = /* @__PURE__ */ __name((row) => row ? { ...row, is_read: Boolean(Number(row.is_read ?? 0)), data: parseMaybeJson(row.data) } : null, "parseNotificationRow");
async function listNotificationsByUser(db, userId, limit = 50) {
  const { results } = await db.prepare("SELECT * FROM notifications WHERE user_id = ? ORDER BY datetime(created_at) DESC LIMIT ?").bind(String(userId), limit).all();
  return (results || []).map(parseNotificationRow);
}
__name(listNotificationsByUser, "listNotificationsByUser");
async function markNotificationRead(db, id) {
  await db.prepare("UPDATE notifications SET is_read = 1 WHERE id = ?").bind(String(id)).run();
}
__name(markNotificationRead, "markNotificationRead");
async function markAllNotificationsRead(db, userId) {
  await db.prepare("UPDATE notifications SET is_read = 1 WHERE user_id = ?").bind(String(userId)).run();
}
__name(markAllNotificationsRead, "markAllNotificationsRead");
var parseThreadRow = /* @__PURE__ */ __name((row) => row ? {
  ...row,
  user_id: row.user_id ?? row.author_id,
  author_id: row.author_id ?? row.user_id,
  tags: parseStructuredValue(row.tags, []),
  stats: parseStructuredValue(row.stats, row.stats ?? null)
} : null, "parseThreadRow");
async function listThreads(db, limit = 100) {
  const { results } = await db.prepare("SELECT * FROM threads ORDER BY datetime(created_at) DESC LIMIT ?").bind(limit).all();
  return (results || []).map(parseThreadRow);
}
__name(listThreads, "listThreads");
async function listThreadsByUser(db, userId) {
  const { results } = await db.prepare("SELECT * FROM threads WHERE COALESCE(user_id, author_id) = ? ORDER BY datetime(created_at) DESC").bind(String(userId)).all();
  return (results || []).map(parseThreadRow);
}
__name(listThreadsByUser, "listThreadsByUser");
async function getThreadById(db, id) {
  const row = await db.prepare("SELECT * FROM threads WHERE id = ? LIMIT 1").bind(String(id)).first();
  return parseThreadRow(row);
}
__name(getThreadById, "getThreadById");
async function createThread(db, data) {
  const row = {
    id: String(data.id || generateTextId()),
    author_id: String(data.author_id ?? data.user_id),
    title: data.title ?? "",
    content: data.content ?? "",
    category: data.category ?? "",
    likes: Number(data.likes ?? 0),
    created_at: data.created_at ?? nowIso(),
    updated_at: data.updated_at ?? data.created_at ?? nowIso(),
    user_id: String(data.user_id ?? data.author_id),
    tags: maybeJsonStringify(data.tags ?? []),
    background_style: data.background_style ?? null,
    image_url: data.image_url ?? null,
    views: Number(data.views ?? 0),
    stats: maybeJsonStringify(data.stats ?? null),
    deleted_at: data.deleted_at ?? null
  };
  await db.prepare("INSERT INTO threads (id, author_id, title, content, category, likes, created_at, updated_at, user_id, tags, background_style, image_url, views, stats, deleted_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").bind(row.id, row.author_id, row.title, row.content, row.category, row.likes, row.created_at, row.updated_at, row.user_id, row.tags, row.background_style, row.image_url, row.views, row.stats, row.deleted_at).run();
  return getThreadById(db, row.id);
}
__name(createThread, "createThread");
async function deleteThread(db, id) {
  await db.prepare("DELETE FROM threads WHERE id = ?").bind(String(id)).run();
}
__name(deleteThread, "deleteThread");
var parseCommentRow = /* @__PURE__ */ __name((row) => row ? { ...row, user_id: row.user_id ?? row.author_id, author_id: row.author_id ?? row.user_id } : null, "parseCommentRow");
async function listCommentsByThread(db, threadId) {
  const { results } = await db.prepare("SELECT * FROM comments WHERE thread_id = ? ORDER BY datetime(created_at) ASC").bind(String(threadId)).all();
  return (results || []).map(parseCommentRow);
}
__name(listCommentsByThread, "listCommentsByThread");
async function createComment(db, data) {
  const row = {
    id: String(data.id || generateTextId()),
    thread_id: String(data.thread_id),
    author_id: String(data.author_id ?? data.user_id),
    content: data.content ?? "",
    likes: Number(data.likes ?? 0),
    created_at: data.created_at ?? nowIso(),
    updated_at: data.updated_at ?? data.created_at ?? nowIso(),
    user_id: String(data.user_id ?? data.author_id),
    parent_id: data.parent_id ?? null
  };
  await db.prepare("INSERT INTO comments (id, thread_id, author_id, content, likes, created_at, updated_at, user_id, parent_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)").bind(row.id, row.thread_id, row.author_id, row.content, row.likes, row.created_at, row.updated_at, row.user_id, row.parent_id).run();
  return parseCommentRow(row);
}
__name(createComment, "createComment");
async function getCommentById(db, id) {
  const row = await db.prepare("SELECT * FROM comments WHERE id = ? LIMIT 1").bind(String(id)).first();
  return parseCommentRow(row);
}
__name(getCommentById, "getCommentById");
async function updateComment(db, id, updates) {
  const normalized = { ...updates, updated_at: updates.updated_at ?? nowIso() };
  const allowed = ["content", "likes", "updated_at"];
  const entries = Object.entries(pickExisting(normalized, allowed));
  const sql = `UPDATE comments SET ${entries.map(([key]) => `${key} = ?`).join(", ")} WHERE id = ?`;
  await db.prepare(sql).bind(...entries.map(([, value]) => value), String(id)).run();
  return getCommentById(db, id);
}
__name(updateComment, "updateComment");
async function listPaymentPlans(db) {
  const { results } = await db.prepare("SELECT * FROM payment_plans ORDER BY COALESCE(display_order,0) ASC, price ASC").all();
  return (results || []).map((row) => ({ ...row, features: parseStructuredValue(row.features, row.features ?? []) }));
}
__name(listPaymentPlans, "listPaymentPlans");
async function getPaymentPlanById(db, id) {
  const row = await db.prepare("SELECT * FROM payment_plans WHERE id = ? LIMIT 1").bind(String(id)).first();
  return row ? { ...row, features: parseStructuredValue(row.features, row.features ?? []) } : null;
}
__name(getPaymentPlanById, "getPaymentPlanById");
async function createPaymentPlan(db, data) {
  const row = {
    id: String(data.id || generateTextId()),
    name: data.name ?? "",
    price: Number(data.price ?? 0),
    duration_days: Number(data.duration_days ?? 0),
    features: maybeJsonStringify(data.features ?? []),
    created_at: data.created_at ?? nowIso(),
    updated_at: data.updated_at ?? data.created_at ?? nowIso(),
    description: data.description ?? null,
    is_active: data.is_active === void 0 ? 1 : Number(Boolean(data.is_active)),
    display_order: Number(data.display_order ?? 0)
  };
  await db.prepare("INSERT INTO payment_plans (id, name, price, duration_days, features, created_at, updated_at, description, is_active, display_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").bind(row.id, row.name, row.price, row.duration_days, row.features, row.created_at, row.updated_at, row.description, row.is_active, row.display_order).run();
  return getPaymentPlanById(db, row.id);
}
__name(createPaymentPlan, "createPaymentPlan");
async function updatePaymentPlan(db, id, updates) {
  const normalized = {
    ...updates,
    features: updates.features !== void 0 ? maybeJsonStringify(updates.features) : void 0,
    is_active: updates.is_active !== void 0 ? Number(Boolean(updates.is_active)) : void 0,
    updated_at: updates.updated_at ?? nowIso()
  };
  const allowed = ["name", "price", "duration_days", "features", "updated_at", "description", "is_active", "display_order"];
  const entries = Object.entries(pickExisting(normalized, allowed));
  const sql = `UPDATE payment_plans SET ${entries.map(([key]) => `${key} = ?`).join(", ")} WHERE id = ?`;
  await db.prepare(sql).bind(...entries.map(([, value]) => value), String(id)).run();
}
__name(updatePaymentPlan, "updatePaymentPlan");
async function deletePaymentPlan(db, id) {
  await db.prepare("DELETE FROM payment_plans WHERE id = ?").bind(String(id)).run();
}
__name(deletePaymentPlan, "deletePaymentPlan");
async function createTransaction(db, data) {
  const row = {
    id: String(data.id || generateTextId()),
    user_id: data.user_id ?? null,
    plan_id: data.plan_id ?? null,
    amount: Number(data.amount ?? 0),
    status: data.status ?? "pending",
    session_id: data.session_id ?? null,
    created_at: data.created_at ?? nowIso(),
    updated_at: data.updated_at ?? data.created_at ?? nowIso(),
    payment_method: data.payment_method ?? null,
    type: data.type ?? null
  };
  await db.prepare("INSERT INTO transactions (id, user_id, plan_id, amount, status, session_id, created_at, updated_at, payment_method, type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").bind(row.id, row.user_id, row.plan_id, row.amount, row.status, row.session_id, row.created_at, row.updated_at, row.payment_method, row.type).run();
  return row;
}
__name(createTransaction, "createTransaction");
async function listAssets(db) {
  const { results } = await db.prepare("SELECT * FROM assets ORDER BY datetime(created_at) DESC").all();
  return results || [];
}
__name(listAssets, "listAssets");
async function createAsset(db, data) {
  const row = {
    id: String(data.id || generateTextId()),
    name: data.name ?? "",
    type: data.type ?? "",
    url: data.url ?? "",
    is_premium: Number(Boolean(data.is_premium)),
    created_at: data.created_at ?? nowIso(),
    updated_at: data.updated_at ?? data.created_at ?? nowIso()
  };
  await db.prepare("INSERT INTO assets (id, name, type, url, is_premium, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)").bind(row.id, row.name, row.type, row.url, row.is_premium, row.created_at, row.updated_at).run();
  return row;
}
__name(createAsset, "createAsset");
async function deleteAsset(db, id) {
  await db.prepare("DELETE FROM assets WHERE id = ?").bind(String(id)).run();
}
__name(deleteAsset, "deleteAsset");
async function getSystemConfig(db, id) {
  const row = await db.prepare("SELECT value FROM system_config WHERE id = ? LIMIT 1").bind(String(id)).first();
  return row?.value ? parseStructuredValue(row.value, {}) : null;
}
__name(getSystemConfig, "getSystemConfig");
async function upsertSystemConfig(db, id, value) {
  await db.prepare("INSERT OR REPLACE INTO system_config (id, value) VALUES (?, ?)").bind(String(id), JSON.stringify(value ?? {})).run();
}
__name(upsertSystemConfig, "upsertSystemConfig");
var parseBusinessRow = /* @__PURE__ */ __name((row) => row ? { ...row, stats: parseStructuredValue(row.stats, row.stats ?? null) } : null, "parseBusinessRow");
async function listBusinesses(db, limit = 100) {
  const { results } = await db.prepare("SELECT * FROM businesses ORDER BY datetime(created_at) DESC LIMIT ?").bind(limit).all();
  return (results || []).map(parseBusinessRow);
}
__name(listBusinesses, "listBusinesses");
async function getBusinessById(db, id) {
  const row = await db.prepare("SELECT * FROM businesses WHERE id = ? LIMIT 1").bind(String(id)).first();
  return parseBusinessRow(row);
}
__name(getBusinessById, "getBusinessById");
async function getBusinessByOwner(db, ownerUid) {
  const row = await db.prepare("SELECT * FROM businesses WHERE owner_uid = ? LIMIT 1").bind(String(ownerUid)).first();
  return parseBusinessRow(row);
}
__name(getBusinessByOwner, "getBusinessByOwner");
async function createBusiness(db, data) {
  const row = {
    id: String(data.id || generateTextId()),
    owner_uid: String(data.owner_uid),
    name: data.name ?? "",
    tagline: data.tagline ?? null,
    about: data.about ?? null,
    category: data.category ?? null,
    contact_link: data.contact_link ?? null,
    contact_line_id: data.contact_line_id ?? null,
    contact_facebook_url: data.contact_facebook_url ?? null,
    status: data.status ?? "approved",
    logo_image: data.logo_image ?? null,
    stats: maybeJsonStringify(data.stats ?? null),
    created_at: data.created_at ?? nowIso(),
    updated_at: data.updated_at ?? data.created_at ?? nowIso()
  };
  await db.prepare("INSERT INTO businesses (id, owner_uid, name, tagline, about, category, contact_link, contact_line_id, contact_facebook_url, status, logo_image, stats, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").bind(row.id, row.owner_uid, row.name, row.tagline, row.about, row.category, row.contact_link, row.contact_line_id, row.contact_facebook_url, row.status, row.logo_image, row.stats, row.created_at, row.updated_at).run();
  return getBusinessById(db, row.id);
}
__name(createBusiness, "createBusiness");
async function updateBusiness(db, id, updates) {
  const normalized = { ...updates, stats: updates.stats !== void 0 ? maybeJsonStringify(updates.stats) : void 0, updated_at: updates.updated_at ?? nowIso() };
  const allowed = ["name", "tagline", "about", "category", "contact_link", "contact_line_id", "contact_facebook_url", "status", "logo_image", "stats", "updated_at"];
  const entries = Object.entries(pickExisting(normalized, allowed));
  const sql = `UPDATE businesses SET ${entries.map(([key]) => `${key} = ?`).join(", ")} WHERE id = ?`;
  await db.prepare(sql).bind(...entries.map(([, value]) => value), String(id)).run();
  return getBusinessById(db, id);
}
__name(updateBusiness, "updateBusiness");
async function deleteBusiness(db, id) {
  await db.prepare("DELETE FROM businesses WHERE id = ?").bind(String(id)).run();
}
__name(deleteBusiness, "deleteBusiness");
async function listBusinessPosts(db, businessId, limit = 50) {
  if (businessId) {
    const { results: results2 } = await db.prepare("SELECT * FROM business_posts WHERE business_id = ? ORDER BY datetime(created_at) DESC LIMIT ?").bind(String(businessId), limit).all();
    return results2 || [];
  }
  const { results } = await db.prepare("SELECT * FROM business_posts ORDER BY datetime(created_at) DESC LIMIT ?").bind(limit).all();
  return results || [];
}
__name(listBusinessPosts, "listBusinessPosts");
async function listTickets(db, userId) {
  const result = userId ? await db.prepare("SELECT * FROM tickets WHERE user_id = ? ORDER BY datetime(created_at) DESC").bind(String(userId)).all() : await db.prepare("SELECT * FROM tickets ORDER BY datetime(created_at) DESC").all();
  return result.results || [];
}
__name(listTickets, "listTickets");
async function getTicketById(db, id) {
  return await db.prepare("SELECT * FROM tickets WHERE id = ? LIMIT 1").bind(String(id)).first();
}
__name(getTicketById, "getTicketById");
async function createTicket(db, data) {
  const row = {
    id: String(data.id || generateTextId()),
    user_id: data.user_id ?? null,
    subject: data.subject ?? "",
    status: data.status ?? "open",
    created_at: data.created_at ?? nowIso(),
    updated_at: data.updated_at ?? data.created_at ?? nowIso(),
    ticket_id: data.ticket_id ?? data.id ?? null,
    description: data.description ?? null,
    category: data.category ?? null
  };
  await db.prepare("INSERT INTO tickets (id, user_id, subject, status, created_at, updated_at, ticket_id, description, category) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)").bind(row.id, row.user_id, row.subject, row.status, row.created_at, row.updated_at, row.ticket_id, row.description, row.category).run();
  return row;
}
__name(createTicket, "createTicket");
async function updateTicket(db, id, updates) {
  const normalized = { ...updates, updated_at: updates.updated_at ?? nowIso() };
  const allowed = ["subject", "status", "updated_at", "description", "category"];
  const entries = Object.entries(pickExisting(normalized, allowed));
  const sql = `UPDATE tickets SET ${entries.map(([key]) => `${key} = ?`).join(", ")} WHERE id = ?`;
  await db.prepare(sql).bind(...entries.map(([, value]) => value), String(id)).run();
}
__name(updateTicket, "updateTicket");
async function listTicketMessages(db, ticketId) {
  const { results } = await db.prepare("SELECT * FROM ticket_messages WHERE ticket_id = ? ORDER BY datetime(created_at) ASC").bind(String(ticketId)).all();
  return results || [];
}
__name(listTicketMessages, "listTicketMessages");
async function createTicketMessage(db, ticketId, data) {
  const row = {
    id: String(data.id || generateTextId()),
    ticket_id: String(ticketId),
    sender_id: String(data.sender_id ?? data.user_id ?? "anonymous"),
    message: data.message ?? "",
    is_admin: Number(Boolean(data.is_admin || data.is_internal_note)),
    created_at: data.created_at ?? nowIso()
  };
  await db.prepare("INSERT INTO ticket_messages (id, ticket_id, sender_id, message, is_admin, created_at) VALUES (?, ?, ?, ?, ?, ?)").bind(row.id, row.ticket_id, row.sender_id, row.message, row.is_admin, row.created_at).run();
  return row;
}
__name(createTicketMessage, "createTicketMessage");
async function listPayments(db, userId, limit = 200) {
  const result = userId ? await db.prepare("SELECT * FROM payments WHERE user_id = ? ORDER BY datetime(created_at) DESC LIMIT ?").bind(String(userId), limit).all() : await db.prepare("SELECT * FROM payments ORDER BY datetime(created_at) DESC LIMIT ?").bind(limit).all();
  return (result.results || []).map((row) => ({ ...row, metadata: parseMaybeJson(row.metadata) }));
}
__name(listPayments, "listPayments");

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
  }
  static {
    __name(this, "RealtimeDO");
  }
  attachments = /* @__PURE__ */ new WeakMap();
  getAttachment(ws) {
    const nativeAttachment = ws.deserializeAttachment?.();
    if (nativeAttachment && typeof nativeAttachment === "object") {
      return nativeAttachment;
    }
    return this.attachments.get(ws);
  }
  setAttachment(ws, attachment) {
    this.attachments.set(ws, attachment);
    ws.serializeAttachment?.(attachment);
  }
  async getRoomInfo(roomId) {
    const room = await getExamRoomById(this.env.DB, roomId);
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
    const score = Number.isFinite(fields.score) ? fields.score : 0;
    const status = fields.status || "joined";
    await upsertExamRoomParticipant(this.env.DB, roomId, userId, {
      score,
      status,
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    });
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
      this.setAttachment(server, { ...attachment, token });
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
      const attachment = this.getAttachment(ws);
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
    const attachment = this.getAttachment(ws) || {
      rooms: []
    };
    const event = payload.event;
    const data = payload.data;
    if (event === "join_user") {
      const id = typeof data === "string" || typeof data === "number" ? String(data) : null;
      if (id) {
        attachment.userId = id;
        attachment.rooms = Array.from(/* @__PURE__ */ new Set([...attachment.rooms || [], `user:${id}`]));
        this.setAttachment(ws, attachment);
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
        this.setAttachment(ws, attachment);
        this.broadcast({ event: "user_joined", data: { userId: attachment.userId } }, `room:${roomKey}`);
      }
      return;
    }
    if (event === "leave_room") {
      const roomId = data?.roomId;
      const userId = data?.userId;
      const roomKey = toRoomKey(roomId);
      if (roomKey) {
        attachment.rooms = (attachment.rooms || []).filter((r) => r !== `room:${roomKey}`);
        this.setAttachment(ws, attachment);
        this.broadcast({ event: "user_left", data: { userId } }, `room:${roomKey}`);
      }
      return;
    }
    if (event === "join_ticket") {
      const ticketId = toRoomKey(data);
      if (ticketId) {
        attachment.rooms = Array.from(/* @__PURE__ */ new Set([...attachment.rooms || [], `ticket:${ticketId}`]));
        this.setAttachment(ws, attachment);
      }
      return;
    }
    if (event === "leave_ticket") {
      const ticketId = toRoomKey(data);
      if (ticketId) {
        attachment.rooms = (attachment.rooms || []).filter((r) => r !== `ticket:${ticketId}`);
        this.setAttachment(ws, attachment);
      }
      return;
    }
    if (event === "join_group") {
      const groupKey = toRoomKey(data) || toRoomKey(data?.room) || toRoomKey(data?.group);
      if (groupKey) {
        attachment.rooms = Array.from(/* @__PURE__ */ new Set([...attachment.rooms || [], `group:${groupKey}`]));
        this.setAttachment(ws, attachment);
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
            await updateExamRoom(this.env.DB, roomKey, {
              status: "in_progress",
              updated_at: (/* @__PURE__ */ new Date()).toISOString()
            });
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
      if (roomKey) {
        const payload2 = { questionIndex: data?.questionIndex };
        this.broadcast({ event: "navigate_question", data: payload2 }, `room:${roomKey}`);
        this.broadcast({ event: "tutor_navigate", data: payload2 }, `room:${roomKey}`);
      }
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
          await upsertExamRoomParticipant(this.env.DB, roomKey, String(userId), {
            current_question_index: questionIndex,
            updated_at: (/* @__PURE__ */ new Date()).toISOString()
          });
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
          await upsertExamRoomParticipant(this.env.DB, roomKey, String(userId), {
            nickname: String(nickname),
            updated_at: (/* @__PURE__ */ new Date()).toISOString()
          });
          this.broadcast({ event: "nickname_updated", data: { userId, nickname } }, `room:${roomKey}`);
        } catch {
        }
      }
      return;
    }
    if (event === "finish_exam") {
      const roomId = data?.roomId;
      const roomKey = toRoomKey(roomId);
      if (roomKey) {
        try {
          const userId = data?.userId;
          const score = Number(data?.score ?? 0);
          const timeTaken = Number(data?.timeTaken ?? 0);
          if (userId === void 0 || userId === null) return;
          await upsertExamRoomParticipant(this.env.DB, roomKey, String(userId), {
            score,
            status: "finished",
            time_taken: timeTaken,
            completed_at: (/* @__PURE__ */ new Date()).toISOString(),
            updated_at: (/* @__PURE__ */ new Date()).toISOString()
          });
          const info = await this.getRoomInfo(roomKey);
          if (info) {
            const subjectScores = info.subject ? JSON.stringify({ [info.subject]: score }) : null;
            await createExamResult(this.env.DB, {
              user_id: String(userId),
              classroom_id: roomKey,
              score,
              total_score: info.questionCount,
              mode: "classroom",
              subject_scores: subjectScores,
              skill_scores: null,
              questions: null,
              time_taken: timeTaken,
              taken_at: (/* @__PURE__ */ new Date()).toISOString()
            });
            const parts = await listExamRoomParticipants(this.env.DB, roomKey);
            const total = parts.length;
            const finished = parts.filter((p) => p.status === "finished").length;
            if (total > 0 && total === finished) {
              await updateExamRoom(this.env.DB, roomKey, {
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
      if (roomKey && userId !== void 0 && userId !== null) {
        try {
          const info = await this.getRoomInfo(roomKey);
          if (info && info.hostUserId === String(userId)) {
            await updateExamRoom(this.env.DB, roomKey, {
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
      if (roomKey) {
        try {
          await resetExamRoomParticipants(this.env.DB, roomKey);
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
init_modules_watch_stub();
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
init_modules_watch_stub();

// node_modules/bcryptjs/index.js
init_modules_watch_stub();
var import_crypto = __toESM(require_crypto(), 1);
var randomFallback = null;
function randomBytes(len) {
  try {
    return crypto.getRandomValues(new Uint8Array(len));
  } catch {
  }
  try {
    return import_crypto.default.randomBytes(len);
  } catch {
  }
  if (!randomFallback) {
    throw Error(
      "Neither WebCryptoAPI nor a crypto module is available. Use bcrypt.setRandomFallback to set an alternative"
    );
  }
  return randomFallback(len);
}
__name(randomBytes, "randomBytes");
function genSaltSync(rounds, seed_length) {
  rounds = rounds || GENSALT_DEFAULT_LOG2_ROUNDS;
  if (typeof rounds !== "number")
    throw Error(
      "Illegal arguments: " + typeof rounds + ", " + typeof seed_length
    );
  if (rounds < 4) rounds = 4;
  else if (rounds > 31) rounds = 31;
  var salt = [];
  salt.push("$2b$");
  if (rounds < 10) salt.push("0");
  salt.push(rounds.toString());
  salt.push("$");
  salt.push(base64_encode(randomBytes(BCRYPT_SALT_LEN), BCRYPT_SALT_LEN));
  return salt.join("");
}
__name(genSaltSync, "genSaltSync");
function hashSync(password, salt) {
  if (typeof salt === "undefined") salt = GENSALT_DEFAULT_LOG2_ROUNDS;
  if (typeof salt === "number") salt = genSaltSync(salt);
  if (typeof password !== "string" || typeof salt !== "string")
    throw Error("Illegal arguments: " + typeof password + ", " + typeof salt);
  return _hash(password, salt);
}
__name(hashSync, "hashSync");
function safeStringCompare(known, unknown) {
  var diff = known.length ^ unknown.length;
  for (var i = 0; i < known.length; ++i) {
    diff |= known.charCodeAt(i) ^ unknown.charCodeAt(i);
  }
  return diff === 0;
}
__name(safeStringCompare, "safeStringCompare");
function compareSync(password, hash) {
  if (typeof password !== "string" || typeof hash !== "string")
    throw Error("Illegal arguments: " + typeof password + ", " + typeof hash);
  if (hash.length !== 60) return false;
  return safeStringCompare(
    hashSync(password, hash.substring(0, hash.length - 31)),
    hash
  );
}
__name(compareSync, "compareSync");
var nextTick = typeof setImmediate === "function" ? setImmediate : typeof scheduler === "object" && typeof scheduler.postTask === "function" ? scheduler.postTask.bind(scheduler) : setTimeout;
function utf8Length(string) {
  var len = 0, c = 0;
  for (var i = 0; i < string.length; ++i) {
    c = string.charCodeAt(i);
    if (c < 128) len += 1;
    else if (c < 2048) len += 2;
    else if ((c & 64512) === 55296 && (string.charCodeAt(i + 1) & 64512) === 56320) {
      ++i;
      len += 4;
    } else len += 3;
  }
  return len;
}
__name(utf8Length, "utf8Length");
function utf8Array(string) {
  var offset = 0, c1, c2;
  var buffer = new Array(utf8Length(string));
  for (var i = 0, k = string.length; i < k; ++i) {
    c1 = string.charCodeAt(i);
    if (c1 < 128) {
      buffer[offset++] = c1;
    } else if (c1 < 2048) {
      buffer[offset++] = c1 >> 6 | 192;
      buffer[offset++] = c1 & 63 | 128;
    } else if ((c1 & 64512) === 55296 && ((c2 = string.charCodeAt(i + 1)) & 64512) === 56320) {
      c1 = 65536 + ((c1 & 1023) << 10) + (c2 & 1023);
      ++i;
      buffer[offset++] = c1 >> 18 | 240;
      buffer[offset++] = c1 >> 12 & 63 | 128;
      buffer[offset++] = c1 >> 6 & 63 | 128;
      buffer[offset++] = c1 & 63 | 128;
    } else {
      buffer[offset++] = c1 >> 12 | 224;
      buffer[offset++] = c1 >> 6 & 63 | 128;
      buffer[offset++] = c1 & 63 | 128;
    }
  }
  return buffer;
}
__name(utf8Array, "utf8Array");
var BASE64_CODE = "./ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789".split("");
var BASE64_INDEX = [
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  0,
  1,
  54,
  55,
  56,
  57,
  58,
  59,
  60,
  61,
  62,
  63,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  2,
  3,
  4,
  5,
  6,
  7,
  8,
  9,
  10,
  11,
  12,
  13,
  14,
  15,
  16,
  17,
  18,
  19,
  20,
  21,
  22,
  23,
  24,
  25,
  26,
  27,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  28,
  29,
  30,
  31,
  32,
  33,
  34,
  35,
  36,
  37,
  38,
  39,
  40,
  41,
  42,
  43,
  44,
  45,
  46,
  47,
  48,
  49,
  50,
  51,
  52,
  53,
  -1,
  -1,
  -1,
  -1,
  -1
];
function base64_encode(b, len) {
  var off = 0, rs = [], c1, c2;
  if (len <= 0 || len > b.length) throw Error("Illegal len: " + len);
  while (off < len) {
    c1 = b[off++] & 255;
    rs.push(BASE64_CODE[c1 >> 2 & 63]);
    c1 = (c1 & 3) << 4;
    if (off >= len) {
      rs.push(BASE64_CODE[c1 & 63]);
      break;
    }
    c2 = b[off++] & 255;
    c1 |= c2 >> 4 & 15;
    rs.push(BASE64_CODE[c1 & 63]);
    c1 = (c2 & 15) << 2;
    if (off >= len) {
      rs.push(BASE64_CODE[c1 & 63]);
      break;
    }
    c2 = b[off++] & 255;
    c1 |= c2 >> 6 & 3;
    rs.push(BASE64_CODE[c1 & 63]);
    rs.push(BASE64_CODE[c2 & 63]);
  }
  return rs.join("");
}
__name(base64_encode, "base64_encode");
function base64_decode(s, len) {
  var off = 0, slen = s.length, olen = 0, rs = [], c1, c2, c3, c4, o, code;
  if (len <= 0) throw Error("Illegal len: " + len);
  while (off < slen - 1 && olen < len) {
    code = s.charCodeAt(off++);
    c1 = code < BASE64_INDEX.length ? BASE64_INDEX[code] : -1;
    code = s.charCodeAt(off++);
    c2 = code < BASE64_INDEX.length ? BASE64_INDEX[code] : -1;
    if (c1 == -1 || c2 == -1) break;
    o = c1 << 2 >>> 0;
    o |= (c2 & 48) >> 4;
    rs.push(String.fromCharCode(o));
    if (++olen >= len || off >= slen) break;
    code = s.charCodeAt(off++);
    c3 = code < BASE64_INDEX.length ? BASE64_INDEX[code] : -1;
    if (c3 == -1) break;
    o = (c2 & 15) << 4 >>> 0;
    o |= (c3 & 60) >> 2;
    rs.push(String.fromCharCode(o));
    if (++olen >= len || off >= slen) break;
    code = s.charCodeAt(off++);
    c4 = code < BASE64_INDEX.length ? BASE64_INDEX[code] : -1;
    o = (c3 & 3) << 6 >>> 0;
    o |= c4;
    rs.push(String.fromCharCode(o));
    ++olen;
  }
  var res = [];
  for (off = 0; off < olen; off++) res.push(rs[off].charCodeAt(0));
  return res;
}
__name(base64_decode, "base64_decode");
var BCRYPT_SALT_LEN = 16;
var GENSALT_DEFAULT_LOG2_ROUNDS = 10;
var BLOWFISH_NUM_ROUNDS = 16;
var MAX_EXECUTION_TIME = 100;
var P_ORIG = [
  608135816,
  2242054355,
  320440878,
  57701188,
  2752067618,
  698298832,
  137296536,
  3964562569,
  1160258022,
  953160567,
  3193202383,
  887688300,
  3232508343,
  3380367581,
  1065670069,
  3041331479,
  2450970073,
  2306472731
];
var S_ORIG = [
  3509652390,
  2564797868,
  805139163,
  3491422135,
  3101798381,
  1780907670,
  3128725573,
  4046225305,
  614570311,
  3012652279,
  134345442,
  2240740374,
  1667834072,
  1901547113,
  2757295779,
  4103290238,
  227898511,
  1921955416,
  1904987480,
  2182433518,
  2069144605,
  3260701109,
  2620446009,
  720527379,
  3318853667,
  677414384,
  3393288472,
  3101374703,
  2390351024,
  1614419982,
  1822297739,
  2954791486,
  3608508353,
  3174124327,
  2024746970,
  1432378464,
  3864339955,
  2857741204,
  1464375394,
  1676153920,
  1439316330,
  715854006,
  3033291828,
  289532110,
  2706671279,
  2087905683,
  3018724369,
  1668267050,
  732546397,
  1947742710,
  3462151702,
  2609353502,
  2950085171,
  1814351708,
  2050118529,
  680887927,
  999245976,
  1800124847,
  3300911131,
  1713906067,
  1641548236,
  4213287313,
  1216130144,
  1575780402,
  4018429277,
  3917837745,
  3693486850,
  3949271944,
  596196993,
  3549867205,
  258830323,
  2213823033,
  772490370,
  2760122372,
  1774776394,
  2652871518,
  566650946,
  4142492826,
  1728879713,
  2882767088,
  1783734482,
  3629395816,
  2517608232,
  2874225571,
  1861159788,
  326777828,
  3124490320,
  2130389656,
  2716951837,
  967770486,
  1724537150,
  2185432712,
  2364442137,
  1164943284,
  2105845187,
  998989502,
  3765401048,
  2244026483,
  1075463327,
  1455516326,
  1322494562,
  910128902,
  469688178,
  1117454909,
  936433444,
  3490320968,
  3675253459,
  1240580251,
  122909385,
  2157517691,
  634681816,
  4142456567,
  3825094682,
  3061402683,
  2540495037,
  79693498,
  3249098678,
  1084186820,
  1583128258,
  426386531,
  1761308591,
  1047286709,
  322548459,
  995290223,
  1845252383,
  2603652396,
  3431023940,
  2942221577,
  3202600964,
  3727903485,
  1712269319,
  422464435,
  3234572375,
  1170764815,
  3523960633,
  3117677531,
  1434042557,
  442511882,
  3600875718,
  1076654713,
  1738483198,
  4213154764,
  2393238008,
  3677496056,
  1014306527,
  4251020053,
  793779912,
  2902807211,
  842905082,
  4246964064,
  1395751752,
  1040244610,
  2656851899,
  3396308128,
  445077038,
  3742853595,
  3577915638,
  679411651,
  2892444358,
  2354009459,
  1767581616,
  3150600392,
  3791627101,
  3102740896,
  284835224,
  4246832056,
  1258075500,
  768725851,
  2589189241,
  3069724005,
  3532540348,
  1274779536,
  3789419226,
  2764799539,
  1660621633,
  3471099624,
  4011903706,
  913787905,
  3497959166,
  737222580,
  2514213453,
  2928710040,
  3937242737,
  1804850592,
  3499020752,
  2949064160,
  2386320175,
  2390070455,
  2415321851,
  4061277028,
  2290661394,
  2416832540,
  1336762016,
  1754252060,
  3520065937,
  3014181293,
  791618072,
  3188594551,
  3933548030,
  2332172193,
  3852520463,
  3043980520,
  413987798,
  3465142937,
  3030929376,
  4245938359,
  2093235073,
  3534596313,
  375366246,
  2157278981,
  2479649556,
  555357303,
  3870105701,
  2008414854,
  3344188149,
  4221384143,
  3956125452,
  2067696032,
  3594591187,
  2921233993,
  2428461,
  544322398,
  577241275,
  1471733935,
  610547355,
  4027169054,
  1432588573,
  1507829418,
  2025931657,
  3646575487,
  545086370,
  48609733,
  2200306550,
  1653985193,
  298326376,
  1316178497,
  3007786442,
  2064951626,
  458293330,
  2589141269,
  3591329599,
  3164325604,
  727753846,
  2179363840,
  146436021,
  1461446943,
  4069977195,
  705550613,
  3059967265,
  3887724982,
  4281599278,
  3313849956,
  1404054877,
  2845806497,
  146425753,
  1854211946,
  1266315497,
  3048417604,
  3681880366,
  3289982499,
  290971e4,
  1235738493,
  2632868024,
  2414719590,
  3970600049,
  1771706367,
  1449415276,
  3266420449,
  422970021,
  1963543593,
  2690192192,
  3826793022,
  1062508698,
  1531092325,
  1804592342,
  2583117782,
  2714934279,
  4024971509,
  1294809318,
  4028980673,
  1289560198,
  2221992742,
  1669523910,
  35572830,
  157838143,
  1052438473,
  1016535060,
  1802137761,
  1753167236,
  1386275462,
  3080475397,
  2857371447,
  1040679964,
  2145300060,
  2390574316,
  1461121720,
  2956646967,
  4031777805,
  4028374788,
  33600511,
  2920084762,
  1018524850,
  629373528,
  3691585981,
  3515945977,
  2091462646,
  2486323059,
  586499841,
  988145025,
  935516892,
  3367335476,
  2599673255,
  2839830854,
  265290510,
  3972581182,
  2759138881,
  3795373465,
  1005194799,
  847297441,
  406762289,
  1314163512,
  1332590856,
  1866599683,
  4127851711,
  750260880,
  613907577,
  1450815602,
  3165620655,
  3734664991,
  3650291728,
  3012275730,
  3704569646,
  1427272223,
  778793252,
  1343938022,
  2676280711,
  2052605720,
  1946737175,
  3164576444,
  3914038668,
  3967478842,
  3682934266,
  1661551462,
  3294938066,
  4011595847,
  840292616,
  3712170807,
  616741398,
  312560963,
  711312465,
  1351876610,
  322626781,
  1910503582,
  271666773,
  2175563734,
  1594956187,
  70604529,
  3617834859,
  1007753275,
  1495573769,
  4069517037,
  2549218298,
  2663038764,
  504708206,
  2263041392,
  3941167025,
  2249088522,
  1514023603,
  1998579484,
  1312622330,
  694541497,
  2582060303,
  2151582166,
  1382467621,
  776784248,
  2618340202,
  3323268794,
  2497899128,
  2784771155,
  503983604,
  4076293799,
  907881277,
  423175695,
  432175456,
  1378068232,
  4145222326,
  3954048622,
  3938656102,
  3820766613,
  2793130115,
  2977904593,
  26017576,
  3274890735,
  3194772133,
  1700274565,
  1756076034,
  4006520079,
  3677328699,
  720338349,
  1533947780,
  354530856,
  688349552,
  3973924725,
  1637815568,
  332179504,
  3949051286,
  53804574,
  2852348879,
  3044236432,
  1282449977,
  3583942155,
  3416972820,
  4006381244,
  1617046695,
  2628476075,
  3002303598,
  1686838959,
  431878346,
  2686675385,
  1700445008,
  1080580658,
  1009431731,
  832498133,
  3223435511,
  2605976345,
  2271191193,
  2516031870,
  1648197032,
  4164389018,
  2548247927,
  300782431,
  375919233,
  238389289,
  3353747414,
  2531188641,
  2019080857,
  1475708069,
  455242339,
  2609103871,
  448939670,
  3451063019,
  1395535956,
  2413381860,
  1841049896,
  1491858159,
  885456874,
  4264095073,
  4001119347,
  1565136089,
  3898914787,
  1108368660,
  540939232,
  1173283510,
  2745871338,
  3681308437,
  4207628240,
  3343053890,
  4016749493,
  1699691293,
  1103962373,
  3625875870,
  2256883143,
  3830138730,
  1031889488,
  3479347698,
  1535977030,
  4236805024,
  3251091107,
  2132092099,
  1774941330,
  1199868427,
  1452454533,
  157007616,
  2904115357,
  342012276,
  595725824,
  1480756522,
  206960106,
  497939518,
  591360097,
  863170706,
  2375253569,
  3596610801,
  1814182875,
  2094937945,
  3421402208,
  1082520231,
  3463918190,
  2785509508,
  435703966,
  3908032597,
  1641649973,
  2842273706,
  3305899714,
  1510255612,
  2148256476,
  2655287854,
  3276092548,
  4258621189,
  236887753,
  3681803219,
  274041037,
  1734335097,
  3815195456,
  3317970021,
  1899903192,
  1026095262,
  4050517792,
  356393447,
  2410691914,
  3873677099,
  3682840055,
  3913112168,
  2491498743,
  4132185628,
  2489919796,
  1091903735,
  1979897079,
  3170134830,
  3567386728,
  3557303409,
  857797738,
  1136121015,
  1342202287,
  507115054,
  2535736646,
  337727348,
  3213592640,
  1301675037,
  2528481711,
  1895095763,
  1721773893,
  3216771564,
  62756741,
  2142006736,
  835421444,
  2531993523,
  1442658625,
  3659876326,
  2882144922,
  676362277,
  1392781812,
  170690266,
  3921047035,
  1759253602,
  3611846912,
  1745797284,
  664899054,
  1329594018,
  3901205900,
  3045908486,
  2062866102,
  2865634940,
  3543621612,
  3464012697,
  1080764994,
  553557557,
  3656615353,
  3996768171,
  991055499,
  499776247,
  1265440854,
  648242737,
  3940784050,
  980351604,
  3713745714,
  1749149687,
  3396870395,
  4211799374,
  3640570775,
  1161844396,
  3125318951,
  1431517754,
  545492359,
  4268468663,
  3499529547,
  1437099964,
  2702547544,
  3433638243,
  2581715763,
  2787789398,
  1060185593,
  1593081372,
  2418618748,
  4260947970,
  69676912,
  2159744348,
  86519011,
  2512459080,
  3838209314,
  1220612927,
  3339683548,
  133810670,
  1090789135,
  1078426020,
  1569222167,
  845107691,
  3583754449,
  4072456591,
  1091646820,
  628848692,
  1613405280,
  3757631651,
  526609435,
  236106946,
  48312990,
  2942717905,
  3402727701,
  1797494240,
  859738849,
  992217954,
  4005476642,
  2243076622,
  3870952857,
  3732016268,
  765654824,
  3490871365,
  2511836413,
  1685915746,
  3888969200,
  1414112111,
  2273134842,
  3281911079,
  4080962846,
  172450625,
  2569994100,
  980381355,
  4109958455,
  2819808352,
  2716589560,
  2568741196,
  3681446669,
  3329971472,
  1835478071,
  660984891,
  3704678404,
  4045999559,
  3422617507,
  3040415634,
  1762651403,
  1719377915,
  3470491036,
  2693910283,
  3642056355,
  3138596744,
  1364962596,
  2073328063,
  1983633131,
  926494387,
  3423689081,
  2150032023,
  4096667949,
  1749200295,
  3328846651,
  309677260,
  2016342300,
  1779581495,
  3079819751,
  111262694,
  1274766160,
  443224088,
  298511866,
  1025883608,
  3806446537,
  1145181785,
  168956806,
  3641502830,
  3584813610,
  1689216846,
  3666258015,
  3200248200,
  1692713982,
  2646376535,
  4042768518,
  1618508792,
  1610833997,
  3523052358,
  4130873264,
  2001055236,
  3610705100,
  2202168115,
  4028541809,
  2961195399,
  1006657119,
  2006996926,
  3186142756,
  1430667929,
  3210227297,
  1314452623,
  4074634658,
  4101304120,
  2273951170,
  1399257539,
  3367210612,
  3027628629,
  1190975929,
  2062231137,
  2333990788,
  2221543033,
  2438960610,
  1181637006,
  548689776,
  2362791313,
  3372408396,
  3104550113,
  3145860560,
  296247880,
  1970579870,
  3078560182,
  3769228297,
  1714227617,
  3291629107,
  3898220290,
  166772364,
  1251581989,
  493813264,
  448347421,
  195405023,
  2709975567,
  677966185,
  3703036547,
  1463355134,
  2715995803,
  1338867538,
  1343315457,
  2802222074,
  2684532164,
  233230375,
  2599980071,
  2000651841,
  3277868038,
  1638401717,
  4028070440,
  3237316320,
  6314154,
  819756386,
  300326615,
  590932579,
  1405279636,
  3267499572,
  3150704214,
  2428286686,
  3959192993,
  3461946742,
  1862657033,
  1266418056,
  963775037,
  2089974820,
  2263052895,
  1917689273,
  448879540,
  3550394620,
  3981727096,
  150775221,
  3627908307,
  1303187396,
  508620638,
  2975983352,
  2726630617,
  1817252668,
  1876281319,
  1457606340,
  908771278,
  3720792119,
  3617206836,
  2455994898,
  1729034894,
  1080033504,
  976866871,
  3556439503,
  2881648439,
  1522871579,
  1555064734,
  1336096578,
  3548522304,
  2579274686,
  3574697629,
  3205460757,
  3593280638,
  3338716283,
  3079412587,
  564236357,
  2993598910,
  1781952180,
  1464380207,
  3163844217,
  3332601554,
  1699332808,
  1393555694,
  1183702653,
  3581086237,
  1288719814,
  691649499,
  2847557200,
  2895455976,
  3193889540,
  2717570544,
  1781354906,
  1676643554,
  2592534050,
  3230253752,
  1126444790,
  2770207658,
  2633158820,
  2210423226,
  2615765581,
  2414155088,
  3127139286,
  673620729,
  2805611233,
  1269405062,
  4015350505,
  3341807571,
  4149409754,
  1057255273,
  2012875353,
  2162469141,
  2276492801,
  2601117357,
  993977747,
  3918593370,
  2654263191,
  753973209,
  36408145,
  2530585658,
  25011837,
  3520020182,
  2088578344,
  530523599,
  2918365339,
  1524020338,
  1518925132,
  3760827505,
  3759777254,
  1202760957,
  3985898139,
  3906192525,
  674977740,
  4174734889,
  2031300136,
  2019492241,
  3983892565,
  4153806404,
  3822280332,
  352677332,
  2297720250,
  60907813,
  90501309,
  3286998549,
  1016092578,
  2535922412,
  2839152426,
  457141659,
  509813237,
  4120667899,
  652014361,
  1966332200,
  2975202805,
  55981186,
  2327461051,
  676427537,
  3255491064,
  2882294119,
  3433927263,
  1307055953,
  942726286,
  933058658,
  2468411793,
  3933900994,
  4215176142,
  1361170020,
  2001714738,
  2830558078,
  3274259782,
  1222529897,
  1679025792,
  2729314320,
  3714953764,
  1770335741,
  151462246,
  3013232138,
  1682292957,
  1483529935,
  471910574,
  1539241949,
  458788160,
  3436315007,
  1807016891,
  3718408830,
  978976581,
  1043663428,
  3165965781,
  1927990952,
  4200891579,
  2372276910,
  3208408903,
  3533431907,
  1412390302,
  2931980059,
  4132332400,
  1947078029,
  3881505623,
  4168226417,
  2941484381,
  1077988104,
  1320477388,
  886195818,
  18198404,
  3786409e3,
  2509781533,
  112762804,
  3463356488,
  1866414978,
  891333506,
  18488651,
  661792760,
  1628790961,
  3885187036,
  3141171499,
  876946877,
  2693282273,
  1372485963,
  791857591,
  2686433993,
  3759982718,
  3167212022,
  3472953795,
  2716379847,
  445679433,
  3561995674,
  3504004811,
  3574258232,
  54117162,
  3331405415,
  2381918588,
  3769707343,
  4154350007,
  1140177722,
  4074052095,
  668550556,
  3214352940,
  367459370,
  261225585,
  2610173221,
  4209349473,
  3468074219,
  3265815641,
  314222801,
  3066103646,
  3808782860,
  282218597,
  3406013506,
  3773591054,
  379116347,
  1285071038,
  846784868,
  2669647154,
  3771962079,
  3550491691,
  2305946142,
  453669953,
  1268987020,
  3317592352,
  3279303384,
  3744833421,
  2610507566,
  3859509063,
  266596637,
  3847019092,
  517658769,
  3462560207,
  3443424879,
  370717030,
  4247526661,
  2224018117,
  4143653529,
  4112773975,
  2788324899,
  2477274417,
  1456262402,
  2901442914,
  1517677493,
  1846949527,
  2295493580,
  3734397586,
  2176403920,
  1280348187,
  1908823572,
  3871786941,
  846861322,
  1172426758,
  3287448474,
  3383383037,
  1655181056,
  3139813346,
  901632758,
  1897031941,
  2986607138,
  3066810236,
  3447102507,
  1393639104,
  373351379,
  950779232,
  625454576,
  3124240540,
  4148612726,
  2007998917,
  544563296,
  2244738638,
  2330496472,
  2058025392,
  1291430526,
  424198748,
  50039436,
  29584100,
  3605783033,
  2429876329,
  2791104160,
  1057563949,
  3255363231,
  3075367218,
  3463963227,
  1469046755,
  985887462
];
var C_ORIG = [
  1332899944,
  1700884034,
  1701343084,
  1684370003,
  1668446532,
  1869963892
];
function _encipher(lr, off, P, S) {
  var n, l = lr[off], r = lr[off + 1];
  l ^= P[0];
  n = S[l >>> 24];
  n += S[256 | l >> 16 & 255];
  n ^= S[512 | l >> 8 & 255];
  n += S[768 | l & 255];
  r ^= n ^ P[1];
  n = S[r >>> 24];
  n += S[256 | r >> 16 & 255];
  n ^= S[512 | r >> 8 & 255];
  n += S[768 | r & 255];
  l ^= n ^ P[2];
  n = S[l >>> 24];
  n += S[256 | l >> 16 & 255];
  n ^= S[512 | l >> 8 & 255];
  n += S[768 | l & 255];
  r ^= n ^ P[3];
  n = S[r >>> 24];
  n += S[256 | r >> 16 & 255];
  n ^= S[512 | r >> 8 & 255];
  n += S[768 | r & 255];
  l ^= n ^ P[4];
  n = S[l >>> 24];
  n += S[256 | l >> 16 & 255];
  n ^= S[512 | l >> 8 & 255];
  n += S[768 | l & 255];
  r ^= n ^ P[5];
  n = S[r >>> 24];
  n += S[256 | r >> 16 & 255];
  n ^= S[512 | r >> 8 & 255];
  n += S[768 | r & 255];
  l ^= n ^ P[6];
  n = S[l >>> 24];
  n += S[256 | l >> 16 & 255];
  n ^= S[512 | l >> 8 & 255];
  n += S[768 | l & 255];
  r ^= n ^ P[7];
  n = S[r >>> 24];
  n += S[256 | r >> 16 & 255];
  n ^= S[512 | r >> 8 & 255];
  n += S[768 | r & 255];
  l ^= n ^ P[8];
  n = S[l >>> 24];
  n += S[256 | l >> 16 & 255];
  n ^= S[512 | l >> 8 & 255];
  n += S[768 | l & 255];
  r ^= n ^ P[9];
  n = S[r >>> 24];
  n += S[256 | r >> 16 & 255];
  n ^= S[512 | r >> 8 & 255];
  n += S[768 | r & 255];
  l ^= n ^ P[10];
  n = S[l >>> 24];
  n += S[256 | l >> 16 & 255];
  n ^= S[512 | l >> 8 & 255];
  n += S[768 | l & 255];
  r ^= n ^ P[11];
  n = S[r >>> 24];
  n += S[256 | r >> 16 & 255];
  n ^= S[512 | r >> 8 & 255];
  n += S[768 | r & 255];
  l ^= n ^ P[12];
  n = S[l >>> 24];
  n += S[256 | l >> 16 & 255];
  n ^= S[512 | l >> 8 & 255];
  n += S[768 | l & 255];
  r ^= n ^ P[13];
  n = S[r >>> 24];
  n += S[256 | r >> 16 & 255];
  n ^= S[512 | r >> 8 & 255];
  n += S[768 | r & 255];
  l ^= n ^ P[14];
  n = S[l >>> 24];
  n += S[256 | l >> 16 & 255];
  n ^= S[512 | l >> 8 & 255];
  n += S[768 | l & 255];
  r ^= n ^ P[15];
  n = S[r >>> 24];
  n += S[256 | r >> 16 & 255];
  n ^= S[512 | r >> 8 & 255];
  n += S[768 | r & 255];
  l ^= n ^ P[16];
  lr[off] = r ^ P[BLOWFISH_NUM_ROUNDS + 1];
  lr[off + 1] = l;
  return lr;
}
__name(_encipher, "_encipher");
function _streamtoword(data, offp) {
  for (var i = 0, word = 0; i < 4; ++i)
    word = word << 8 | data[offp] & 255, offp = (offp + 1) % data.length;
  return { key: word, offp };
}
__name(_streamtoword, "_streamtoword");
function _key(key, P, S) {
  var offset = 0, lr = [0, 0], plen = P.length, slen = S.length, sw;
  for (var i = 0; i < plen; i++)
    sw = _streamtoword(key, offset), offset = sw.offp, P[i] = P[i] ^ sw.key;
  for (i = 0; i < plen; i += 2)
    lr = _encipher(lr, 0, P, S), P[i] = lr[0], P[i + 1] = lr[1];
  for (i = 0; i < slen; i += 2)
    lr = _encipher(lr, 0, P, S), S[i] = lr[0], S[i + 1] = lr[1];
}
__name(_key, "_key");
function _ekskey(data, key, P, S) {
  var offp = 0, lr = [0, 0], plen = P.length, slen = S.length, sw;
  for (var i = 0; i < plen; i++)
    sw = _streamtoword(key, offp), offp = sw.offp, P[i] = P[i] ^ sw.key;
  offp = 0;
  for (i = 0; i < plen; i += 2)
    sw = _streamtoword(data, offp), offp = sw.offp, lr[0] ^= sw.key, sw = _streamtoword(data, offp), offp = sw.offp, lr[1] ^= sw.key, lr = _encipher(lr, 0, P, S), P[i] = lr[0], P[i + 1] = lr[1];
  for (i = 0; i < slen; i += 2)
    sw = _streamtoword(data, offp), offp = sw.offp, lr[0] ^= sw.key, sw = _streamtoword(data, offp), offp = sw.offp, lr[1] ^= sw.key, lr = _encipher(lr, 0, P, S), S[i] = lr[0], S[i + 1] = lr[1];
}
__name(_ekskey, "_ekskey");
function _crypt(b, salt, rounds, callback, progressCallback) {
  var cdata = C_ORIG.slice(), clen = cdata.length, err;
  if (rounds < 4 || rounds > 31) {
    err = Error("Illegal number of rounds (4-31): " + rounds);
    if (callback) {
      nextTick(callback.bind(this, err));
      return;
    } else throw err;
  }
  if (salt.length !== BCRYPT_SALT_LEN) {
    err = Error(
      "Illegal salt length: " + salt.length + " != " + BCRYPT_SALT_LEN
    );
    if (callback) {
      nextTick(callback.bind(this, err));
      return;
    } else throw err;
  }
  rounds = 1 << rounds >>> 0;
  var P, S, i = 0, j;
  if (typeof Int32Array === "function") {
    P = new Int32Array(P_ORIG);
    S = new Int32Array(S_ORIG);
  } else {
    P = P_ORIG.slice();
    S = S_ORIG.slice();
  }
  _ekskey(salt, b, P, S);
  function next() {
    if (progressCallback) progressCallback(i / rounds);
    if (i < rounds) {
      var start = Date.now();
      for (; i < rounds; ) {
        i = i + 1;
        _key(b, P, S);
        _key(salt, P, S);
        if (Date.now() - start > MAX_EXECUTION_TIME) break;
      }
    } else {
      for (i = 0; i < 64; i++)
        for (j = 0; j < clen >> 1; j++) _encipher(cdata, j << 1, P, S);
      var ret = [];
      for (i = 0; i < clen; i++)
        ret.push((cdata[i] >> 24 & 255) >>> 0), ret.push((cdata[i] >> 16 & 255) >>> 0), ret.push((cdata[i] >> 8 & 255) >>> 0), ret.push((cdata[i] & 255) >>> 0);
      if (callback) {
        callback(null, ret);
        return;
      } else return ret;
    }
    if (callback) nextTick(next);
  }
  __name(next, "next");
  if (typeof callback !== "undefined") {
    next();
  } else {
    var res;
    while (true) if (typeof (res = next()) !== "undefined") return res || [];
  }
}
__name(_crypt, "_crypt");
function _hash(password, salt, callback, progressCallback) {
  var err;
  if (typeof password !== "string" || typeof salt !== "string") {
    err = Error("Invalid string / salt: Not a string");
    if (callback) {
      nextTick(callback.bind(this, err));
      return;
    } else throw err;
  }
  var minor, offset;
  if (salt.charAt(0) !== "$" || salt.charAt(1) !== "2") {
    err = Error("Invalid salt version: " + salt.substring(0, 2));
    if (callback) {
      nextTick(callback.bind(this, err));
      return;
    } else throw err;
  }
  if (salt.charAt(2) === "$") minor = String.fromCharCode(0), offset = 3;
  else {
    minor = salt.charAt(2);
    if (minor !== "a" && minor !== "b" && minor !== "y" || salt.charAt(3) !== "$") {
      err = Error("Invalid salt revision: " + salt.substring(2, 4));
      if (callback) {
        nextTick(callback.bind(this, err));
        return;
      } else throw err;
    }
    offset = 4;
  }
  if (salt.charAt(offset + 2) > "$") {
    err = Error("Missing salt rounds");
    if (callback) {
      nextTick(callback.bind(this, err));
      return;
    } else throw err;
  }
  var r1 = parseInt(salt.substring(offset, offset + 1), 10) * 10, r2 = parseInt(salt.substring(offset + 1, offset + 2), 10), rounds = r1 + r2, real_salt = salt.substring(offset + 3, offset + 25);
  password += minor >= "a" ? "\0" : "";
  var passwordb = utf8Array(password), saltb = base64_decode(real_salt, BCRYPT_SALT_LEN);
  function finish(bytes) {
    var res = [];
    res.push("$2");
    if (minor >= "a") res.push(minor);
    res.push("$");
    if (rounds < 10) res.push("0");
    res.push(rounds.toString());
    res.push("$");
    res.push(base64_encode(saltb, saltb.length));
    res.push(base64_encode(bytes, C_ORIG.length * 4 - 1));
    return res.join("");
  }
  __name(finish, "finish");
  if (typeof callback == "undefined")
    return finish(_crypt(passwordb, saltb, rounds));
  else {
    _crypt(
      passwordb,
      saltb,
      rounds,
      function(err2, bytes) {
        if (err2) callback(err2, null);
        else callback(null, finish(bytes));
      },
      progressCallback
    );
  }
}
__name(_hash, "_hash");

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
  if (stored.startsWith("$2a$") || stored.startsWith("$2b$") || stored.startsWith("$2y$")) {
    try {
      return compareSync(password, stored);
    } catch {
      return false;
    }
  }
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
init_modules_watch_stub();
var aiGeneratorState = {
  isRunning: false,
  logs: []
};
var delay = /* @__PURE__ */ __name((ms) => new Promise((r) => setTimeout(r, ms)), "delay");
async function runAIGenerator(prompt, env) {
  async function updateStatus(isRunning, logMessage) {
    aiGeneratorState.isRunning = isRunning;
    if (logMessage) {
      aiGeneratorState.logs.push(logMessage);
      console.log(logMessage);
    }
    try {
      const data = {
        isRunning: aiGeneratorState.isRunning,
        logs: aiGeneratorState.logs,
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      await upsertSystemConfig(env.DB, "generator_status", data);
    } catch (e) {
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
    await updateStatus(true, `[System] Parsed ${questions.length} questions. Saving to D1...`);
    let successCount = 0;
    for (const q of questions) {
      q.id = Math.floor(Math.random() * 1e9).toString();
      q.created_at = (/* @__PURE__ */ new Date()).toISOString();
      q.updated_at = q.created_at;
      q.catalogs = typeof q.catalogs === "string" ? (() => {
        try {
          return JSON.parse(q.catalogs);
        } catch {
          return [q.catalogs];
        }
      })() : q.catalogs || [];
      q.choices = {
        A: q.choice_a || "",
        B: q.choice_b || "",
        C: q.choice_c || "",
        D: q.choice_d || ""
      };
      await createQuestion(env.DB, q);
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
var CACHE_TTL = 60 * 60 * 1e3;
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
      await touchUserLastActive(env.DB, userId, new Date(now).toISOString());
    } catch (e) {
      console.error("Failed to update last active:", e);
    }
  }
  return { userId };
}, "requireAuthUserId");
var requireAdmin = /* @__PURE__ */ __name(async (req, env) => {
  const auth = await requireAuthUserId(req, env);
  if ("error" in auth) return auth;
  const user = await getUserById(env.DB, auth.userId);
  if (!user || user.role !== "admin") return { error: json({ error: "forbidden" }, { status: 403 }) };
  return { userId: auth.userId };
}, "requireAdmin");
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
  const parsedChoices = typeof q.choices === "string" ? (() => {
    try {
      return JSON.parse(q.choices);
    } catch {
      return null;
    }
  })() : q.choices && typeof q.choices === "object" ? q.choices : null;
  const normalized = {
    ...q,
    choice_a: q.choice_a ?? parsedChoices?.A ?? "",
    choice_b: q.choice_b ?? parsedChoices?.B ?? "",
    choice_c: q.choice_c ?? parsedChoices?.C ?? "",
    choice_d: q.choice_d ?? parsedChoices?.D ?? "",
    choices: parsedChoices ?? q.choices ?? { A: "", B: "", C: "", D: "" }
  };
  const ans = String(normalized.correct_answer || "").trim();
  const lowerAns = ans.toLowerCase();
  if (lowerAns === "a" || lowerAns === "b" || lowerAns === "c" || lowerAns === "d") {
    return { ...normalized, correct_answer: ans.toUpperCase() };
  }
  let mapped = ans;
  if (lowerAns === String(normalized.choice_a || "").trim().toLowerCase()) mapped = "A";
  else if (lowerAns === String(normalized.choice_b || "").trim().toLowerCase()) mapped = "B";
  else if (lowerAns === String(normalized.choice_c || "").trim().toLowerCase()) mapped = "C";
  else if (lowerAns === String(normalized.choice_d || "").trim().toLowerCase()) mapped = "D";
  return { ...normalized, correct_answer: mapped.toUpperCase() };
}, "normalizeQuestion");
var parseRoomSettings = /* @__PURE__ */ __name((room) => {
  const raw = room?.settings;
  if (raw && typeof raw === "object") return { ...raw };
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") return parsed;
    } catch {
    }
  }
  return {};
}, "parseRoomSettings");
var createEmptyAnswerCounts = /* @__PURE__ */ __name(() => ({ A: 0, B: 0, C: 0, D: 0 }), "createEmptyAnswerCounts");
var createTutorState = /* @__PURE__ */ __name((settings = {}) => ({
  current_question_index: Number(settings?.tutor_state?.current_question_index ?? 0),
  is_answer_revealed: Boolean(settings?.tutor_state?.is_answer_revealed ?? false),
  answer_counts: {
    ...createEmptyAnswerCounts(),
    ...settings?.tutor_state?.answer_counts || {}
  }
}), "createTutorState");
var src_default = {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (request.method === "OPTIONS") {
      return withCors(new Response(null, { status: 204 }));
    }
    if (url.pathname === "/api/health") {
      return json({
        ok: true,
        status: "healthy",
        services: {
          d1: "configured",
          jwt: env.JWT_SECRET ? "configured" : "missing_config"
        }
      });
    }
    if (url.pathname.startsWith("/api/ws") || url.pathname.startsWith("/api/realtime")) {
      const id = env.REALTIME.idFromName("global");
      const stub = env.REALTIME.get(id);
      return stub.fetch(request);
    }
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
      const existingUser = await getUserByEmail(env.DB, email);
      if (existingUser) return json({ success: false, message: "Email already in use" }, { status: 409 });
      const passwordHash = await hashPassword(password);
      const user = await createUser(env.DB, {
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
      const existing = await getUserByEmail(env.DB, email);
      let user = existing;
      if (existing) {
        try {
          await touchUserLastActive(env.DB, user.id, (/* @__PURE__ */ new Date()).toISOString());
          user.last_active_at = (/* @__PURE__ */ new Date()).toISOString();
        } catch (e) {
        }
      } else {
        const shortId = deviceId.slice(-5) + Math.floor(100 + Math.random() * 900);
        user = await createUser(env.DB, {
          email,
          display_name: `Guest-${shortId}`,
          role: "user",
          plan_type: "free",
          status: "active",
          created_at: (/* @__PURE__ */ new Date()).toISOString(),
          updated_at: (/* @__PURE__ */ new Date()).toISOString(),
          last_active_at: (/* @__PURE__ */ new Date()).toISOString()
        });
      }
      const token = await signJwtHs256({ id: user.id, email: user.email, role: user.role }, env.JWT_SECRET || "default_secret");
      try {
        await createSystemLog(env.DB, {
          action: existing ? "SYS_GUEST_LOGIN" : "SYS_GUEST_CREATE",
          details: {
            type: "auto",
            ip_address: request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for") || "unknown",
            user_agent: request.headers.get("user-agent") || "unknown"
          },
          user_id: user.id,
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
      let user = await getUserByEmail(env.DB, email);
      if (user) {
        const updates = { last_active_at: (/* @__PURE__ */ new Date()).toISOString() };
        if (picture && user.avatar !== picture) {
          updates.avatar = picture;
        }
        try {
          user = await updateUser(env.DB, user.id, updates);
          user.last_active_at = updates.last_active_at;
        } catch (e) {
        }
      } else {
        user = await createUser(env.DB, {
          email,
          display_name: name,
          avatar: picture,
          role: "user",
          plan_type: "free",
          status: "active",
          last_active_at: (/* @__PURE__ */ new Date()).toISOString(),
          created_at: (/* @__PURE__ */ new Date()).toISOString(),
          updated_at: (/* @__PURE__ */ new Date()).toISOString()
        });
      }
      const token = await signJwtHs256({ id: user.id, email: user.email, role: user.role }, env.JWT_SECRET || "default_secret");
      try {
        await createSystemLog(env.DB, {
          action: "SYS_GOOGLE_LOGIN",
          details: {
            type: "auto",
            google_id: googleId,
            ip_address: request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for") || "unknown",
            user_agent: request.headers.get("user-agent") || "unknown"
          },
          user_id: user.id,
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
      const user = await getUserByEmail(env.DB, email);
      if (!user || !user.password_hash) return json({ success: false, message: "Invalid credentials" }, { status: 401 });
      const ok = await verifyPassword(password, String(user.password_hash));
      if (!ok) return json({ success: false, message: "Invalid credentials" }, { status: 401 });
      try {
        await touchUserLastActive(env.DB, user.id, (/* @__PURE__ */ new Date()).toISOString());
        user.last_active_at = (/* @__PURE__ */ new Date()).toISOString();
      } catch (e) {
      }
      const exp = Math.floor(Date.now() / 1e3) + 60 * 60 * 24 * 30;
      const token = await signJwtHs256({ id: user.id, exp }, secret);
      try {
        await createSystemLog(env.DB, {
          action: "SYS_EMAIL_LOGIN",
          details: {
            type: "auto",
            ip_address: request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for") || "unknown",
            user_agent: request.headers.get("user-agent") || "unknown"
          },
          user_id: user.id,
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
      let user = await getUserByEmail(env.DB, email);
      if (!user) {
        const displayName = `Guest-${deviceId.slice(0, 6)}`;
        user = await createUser(env.DB, {
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
      const user = await getUserById(env.DB, userId);
      if (!user) return json({ success: false, message: "Unauthorized" }, { status: 401 });
      return json({ success: true, user: sanitizeUser(user) });
    }
    if (url.pathname === "/api/rooms" && request.method === "GET") {
      const auth = await requireAuthUserId(request, env);
      if ("error" in auth) return auth.error;
      const page = Math.max(1, Number(url.searchParams.get("page") || 1));
      const limit = Math.max(1, Math.min(50, Number(url.searchParams.get("limit") || 20)));
      const recentRooms = await listExamRooms(env.DB, 100);
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
        const participants = await listExamRoomParticipants(env.DB, rId);
        participantCounts.set(rId, participants.length);
      }
      const hostIds = Array.from(new Set(rooms.map((r) => r.host_user_id).filter(Boolean)));
      const hosts = /* @__PURE__ */ new Map();
      for (const hid of hostIds) {
        const u = await getUserById(env.DB, hid);
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
      const maxParticipants = Math.min(20, Math.max(1, Number(body.max_participants || 20)));
      const questionCount = Math.max(1, Math.min(200, Number(body.question_count || 20)));
      const timeLimit = Math.max(5, Math.min(60, Number(body.time_limit || 60)));
      const password = body.password ? String(body.password) : null;
      const customQuestions = body.custom_questions;
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      const settings = JSON.stringify({ time_limit: timeLimit });
      let selectedIds = [];
      let customQuestionsPayload = null;
      if (customQuestions && Array.isArray(customQuestions) && customQuestions.length > 0) {
        customQuestionsPayload = customQuestions.map((q) => ({
          question_text: q.question_text || "",
          choices: q.choices || { A: "", B: "", C: "", D: "" },
          correct_answer: q.correct_answer || "A",
          explanation: q.explanation || "",
          category: "custom",
          subject: "custom",
          is_custom: true
        }));
        selectedIds = [];
      } else {
        try {
          const whereParts = [];
          const params = [];
          if (subject) {
            whereParts.push("subject = ?");
            params.push(subject);
          }
          if (category) {
            whereParts.push("category = ?");
            params.push(category);
          }
          const whereClause = whereParts.length ? `WHERE ${whereParts.join(" AND ")}` : "";
          const { results } = await env.DB.prepare(`SELECT id FROM questions ${whereClause} ORDER BY RANDOM() LIMIT ?`).bind(...params, questionCount).all();
          selectedIds = (results || []).map((q) => String(q.id));
        } catch (e) {
        }
      }
      if (selectedIds.length === 0 && !customQuestionsPayload?.length) {
        return json({ success: false, message: "No questions found." }, { status: 400 });
      }
      const room = await createExamRoom(env.DB, {
        code,
        name,
        mode,
        tutor_submode: body.tutor_submode || "step",
        host_user_id: auth.userId,
        subject,
        category,
        max_participants: maxParticipants,
        question_count: customQuestionsPayload?.length ? customQuestionsPayload.length : selectedIds.length > 0 ? selectedIds.length : questionCount,
        status: "waiting",
        settings,
        password,
        question_ids: selectedIds,
        custom_questions: customQuestionsPayload,
        theme: body.theme || null,
        created_at: (/* @__PURE__ */ new Date()).toISOString(),
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      });
      await upsertExamRoomParticipant(env.DB, room.id, auth.userId, {
        user_id: auth.userId,
        score: 0,
        status: "joined",
        current_question_index: 0,
        joined_at: (/* @__PURE__ */ new Date()).toISOString(),
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      });
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
      const room = await findExamRoomByCode(env.DB, code);
      if (!room) return json({ success: false, message: "Room not found" }, { status: 404 });
      if (room.password) {
        if (!password) return json({ success: false, message: "Password required", requirePassword: true }, { status: 403 });
        if (password !== String(room.password)) return json({ success: false, message: "Invalid password" }, { status: 403 });
      }
      if (String(room.status) !== "waiting") {
        return json({ success: false, message: "Room is already in progress or finished" }, { status: 400 });
      }
      const existingPart = await getExamRoomParticipant(env.DB, room.id, auth.userId);
      if (!existingPart) {
        await upsertExamRoomParticipant(env.DB, room.id, auth.userId, {
          user_id: auth.userId,
          score: 0,
          status: "joined",
          current_question_index: 0,
          joined_at: (/* @__PURE__ */ new Date()).toISOString(),
          updated_at: (/* @__PURE__ */ new Date()).toISOString()
        });
      }
      return json({ success: true, data: { ...room, password: void 0 } });
    }
    const roomIdMatch = url.pathname.match(/^\/api\/rooms\/([a-zA-Z0-9_-]+)$/);
    if (roomIdMatch && request.method === "GET") {
      const auth = await requireAuthUserId(request, env);
      if ("error" in auth) return auth.error;
      const roomId = roomIdMatch[1];
      const room = await getExamRoomById(env.DB, roomId);
      if (!room) return json({ success: false, message: "Room not found" }, { status: 404 });
      const participants = await listExamRoomParticipants(env.DB, roomId);
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
        const userPromises = chunk.map((id) => getUserById(env.DB, String(id)));
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
      const questionIds = Array.isArray(room.question_ids) ? room.question_ids : [];
      const questionsMap = /* @__PURE__ */ new Map();
      const missingQIds = [];
      for (const qid of questionIds) {
        const cachedQ = getCache(`q_${qid}`);
        if (cachedQ) questionsMap.set(String(qid), normalizeQuestion(cachedQ));
        else missingQIds.push(qid);
      }
      for (let i = 0; i < missingQIds.length; i += 30) {
        const chunk = missingQIds.slice(i, i + 30);
        const qs = await getQuestionsByIds(env.DB, chunk);
        for (const q of qs) {
          if (q && q.id) {
            questionsMap.set(String(q.id), normalizeQuestion(q));
            setCache(`q_${q.id}`, q, 24 * 60 * 60 * 1e3);
          }
        }
      }
      const questions = room.custom_questions?.length ? room.custom_questions.map((q, idx) => normalizeQuestion({ ...q, id: q.id || `custom_${idx}` })) : questionIds.map((id) => questionsMap.get(String(id))).filter(Boolean);
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
    const roomStartMatch = url.pathname.match(/^\/api\/rooms\/([a-zA-Z0-9_-]+)\/start$/);
    if (roomStartMatch && request.method === "POST") {
      const auth = await requireAuthUserId(request, env);
      if ("error" in auth) return auth.error;
      const roomId = roomStartMatch[1];
      const room = await getExamRoomById(env.DB, roomId);
      if (!room) return json({ success: false, message: "Room not found" }, { status: 404 });
      if (String(room.host_user_id) !== auth.userId) {
        return json({ success: false, message: "Not authorized to start this room" }, { status: 403 });
      }
      const settings = parseRoomSettings(room);
      const updated = await updateExamRoom(env.DB, roomId, {
        status: "in_progress",
        settings: {
          ...settings,
          tutor_state: {
            current_question_index: 0,
            is_answer_revealed: false,
            answer_counts: createEmptyAnswerCounts()
          }
        },
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      });
      return json({ success: true, data: updated });
    }
    const roomFinishMatch = url.pathname.match(/^\/api\/rooms\/([a-zA-Z0-9_-]+)\/finish$/);
    if (roomFinishMatch && request.method === "POST") {
      const auth = await requireAuthUserId(request, env);
      if ("error" in auth) return auth.error;
      const roomId = roomFinishMatch[1];
      const room = await getExamRoomById(env.DB, roomId);
      if (!room) return json({ success: false, message: "Room not found" }, { status: 404 });
      const body = await readJson(request);
      if (!body) return json({ success: false, message: "invalid_body" }, { status: 400 });
      const score = Number(body.score || 0);
      const timeTaken = Number(body.timeTaken || 0);
      const answers = body.answers && typeof body.answers === "object" ? body.answers : {};
      const totalScore = Array.isArray(room.question_ids) && room.question_ids.length ? room.question_ids.length : Array.isArray(room.custom_questions) ? room.custom_questions.length : Number(room.question_count || 0);
      await upsertExamRoomParticipant(env.DB, roomId, auth.userId, {
        user_id: auth.userId,
        score,
        time_taken: timeTaken,
        status: "finished",
        current_question_index: totalScore,
        answers,
        completed_at: (/* @__PURE__ */ new Date()).toISOString(),
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      });
      await createExamResult(env.DB, {
        user_id: auth.userId,
        classroom_id: roomId,
        score,
        total_score: totalScore,
        mode: room.mode || "exam",
        questions: answers,
        time_taken: timeTaken,
        taken_at: (/* @__PURE__ */ new Date()).toISOString(),
        created_at: (/* @__PURE__ */ new Date()).toISOString(),
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      });
      const participants = await listExamRoomParticipants(env.DB, roomId);
      const unfinished = participants.some((participant) => String(participant.status) !== "finished");
      const nextStatus = unfinished ? "in_progress" : "finished";
      const updated = await updateExamRoom(env.DB, roomId, {
        status: nextStatus,
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      });
      return json({ success: true, data: updated });
    }
    const roomScoreMatch = url.pathname.match(/^\/api\/rooms\/([a-zA-Z0-9_-]+)\/score$/);
    if (roomScoreMatch && request.method === "POST") {
      const auth = await requireAuthUserId(request, env);
      if ("error" in auth) return auth.error;
      const roomId = roomScoreMatch[1];
      const room = await getExamRoomById(env.DB, roomId);
      if (!room) return json({ success: false, message: "Room not found" }, { status: 404 });
      const body = await readJson(request);
      if (!body) return json({ success: false, message: "invalid_body" }, { status: 400 });
      await upsertExamRoomParticipant(env.DB, roomId, auth.userId, {
        user_id: auth.userId,
        score: Number(body.score || 0),
        status: body.status || void 0,
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      });
      return json({ success: true });
    }
    const roomProgressMatch = url.pathname.match(/^\/api\/rooms\/([a-zA-Z0-9_-]+)\/progress$/);
    if (roomProgressMatch && request.method === "POST") {
      const auth = await requireAuthUserId(request, env);
      if ("error" in auth) return auth.error;
      const roomId = roomProgressMatch[1];
      const room = await getExamRoomById(env.DB, roomId);
      if (!room) return json({ success: false, message: "Room not found" }, { status: 404 });
      const body = await readJson(request);
      if (!body) return json({ success: false, message: "invalid_body" }, { status: 400 });
      await upsertExamRoomParticipant(env.DB, roomId, auth.userId, {
        user_id: auth.userId,
        current_question_index: Number(body.questionIndex || 0),
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      });
      return json({ success: true });
    }
    const roomNicknameMatch = url.pathname.match(/^\/api\/rooms\/([a-zA-Z0-9_-]+)\/nickname$/);
    if (roomNicknameMatch && request.method === "POST") {
      const auth = await requireAuthUserId(request, env);
      if ("error" in auth) return auth.error;
      const roomId = roomNicknameMatch[1];
      const room = await getExamRoomById(env.DB, roomId);
      if (!room) return json({ success: false, message: "Room not found" }, { status: 404 });
      const body = await readJson(request);
      const nickname = String(body?.nickname || "").trim();
      if (!nickname) return json({ success: false, message: "invalid_nickname" }, { status: 400 });
      await upsertExamRoomParticipant(env.DB, roomId, auth.userId, {
        user_id: auth.userId,
        nickname,
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      });
      return json({ success: true });
    }
    const roomChatMatch = url.pathname.match(/^\/api\/rooms\/([a-zA-Z0-9_-]+)\/chat$/);
    if (roomChatMatch && request.method === "POST") {
      const auth = await requireAuthUserId(request, env);
      if ("error" in auth) return auth.error;
      const roomId = roomChatMatch[1];
      const room = await getExamRoomById(env.DB, roomId);
      if (!room) return json({ success: false, message: "Room not found" }, { status: 404 });
      const body = await readJson(request);
      const message = String(body?.message || "").trim();
      const displayName = String(body?.displayName || "").trim();
      if (!message) return json({ success: false, message: "invalid_message" }, { status: 400 });
      const settings = parseRoomSettings(room);
      const nextMessages = Array.isArray(settings.chat_messages) ? [...settings.chat_messages] : [];
      nextMessages.push({
        id: crypto.randomUUID(),
        userId: auth.userId,
        displayName: displayName || "\u0E1C\u0E39\u0E49\u0E43\u0E0A\u0E49",
        message,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
      await updateExamRoom(env.DB, roomId, {
        settings: {
          ...settings,
          chat_messages: nextMessages.slice(-50)
        },
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      });
      return json({ success: true });
    }
    const roomTutorNavigateMatch = url.pathname.match(/^\/api\/rooms\/([a-zA-Z0-9_-]+)\/tutor\/navigate$/);
    if (roomTutorNavigateMatch && request.method === "POST") {
      const auth = await requireAuthUserId(request, env);
      if ("error" in auth) return auth.error;
      const roomId = roomTutorNavigateMatch[1];
      const room = await getExamRoomById(env.DB, roomId);
      if (!room) return json({ success: false, message: "Room not found" }, { status: 404 });
      if (String(room.host_user_id) !== auth.userId) {
        return json({ success: false, message: "Not authorized" }, { status: 403 });
      }
      const body = await readJson(request);
      const settings = parseRoomSettings(room);
      const tutorState = createTutorState(settings);
      tutorState.current_question_index = Number(body?.questionIndex || 0);
      tutorState.is_answer_revealed = false;
      tutorState.answer_counts = createEmptyAnswerCounts();
      await updateExamRoom(env.DB, roomId, {
        settings: {
          ...settings,
          tutor_state: tutorState
        },
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      });
      return json({ success: true });
    }
    const roomTutorRevealMatch = url.pathname.match(/^\/api\/rooms\/([a-zA-Z0-9_-]+)\/tutor\/reveal$/);
    if (roomTutorRevealMatch && request.method === "POST") {
      const auth = await requireAuthUserId(request, env);
      if ("error" in auth) return auth.error;
      const roomId = roomTutorRevealMatch[1];
      const room = await getExamRoomById(env.DB, roomId);
      if (!room) return json({ success: false, message: "Room not found" }, { status: 404 });
      if (String(room.host_user_id) !== auth.userId) {
        return json({ success: false, message: "Not authorized" }, { status: 403 });
      }
      const settings = parseRoomSettings(room);
      const tutorState = createTutorState(settings);
      tutorState.is_answer_revealed = true;
      await updateExamRoom(env.DB, roomId, {
        settings: {
          ...settings,
          tutor_state: tutorState
        },
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      });
      return json({ success: true });
    }
    const roomTutorAnswerMatch = url.pathname.match(/^\/api\/rooms\/([a-zA-Z0-9_-]+)\/tutor\/answer$/);
    if (roomTutorAnswerMatch && request.method === "POST") {
      const auth = await requireAuthUserId(request, env);
      if ("error" in auth) return auth.error;
      const roomId = roomTutorAnswerMatch[1];
      const room = await getExamRoomById(env.DB, roomId);
      if (!room) return json({ success: false, message: "Room not found" }, { status: 404 });
      const body = await readJson(request);
      const choice = String(body?.choice || "").trim().toUpperCase();
      if (!["A", "B", "C", "D"].includes(choice)) {
        return json({ success: false, message: "invalid_choice" }, { status: 400 });
      }
      const settings = parseRoomSettings(room);
      const tutorState = createTutorState(settings);
      tutorState.answer_counts = {
        ...createEmptyAnswerCounts(),
        ...tutorState.answer_counts,
        [choice]: Number(tutorState.answer_counts?.[choice] || 0) + 1
      };
      await updateExamRoom(env.DB, roomId, {
        settings: {
          ...settings,
          tutor_state: tutorState
        },
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      });
      return json({ success: true });
    }
    const roomCloseMatch = url.pathname.match(/^\/api\/rooms\/([a-zA-Z0-9_-]+)\/close$/);
    if (roomCloseMatch && request.method === "POST") {
      const auth = await requireAuthUserId(request, env);
      if ("error" in auth) return auth.error;
      const roomId = roomCloseMatch[1];
      const room = await getExamRoomById(env.DB, roomId);
      if (!room) return json({ success: false, message: "Room not found" }, { status: 404 });
      if (String(room.host_user_id) !== auth.userId) {
        return json({ success: false, message: "Not authorized" }, { status: 403 });
      }
      const updated = await updateExamRoom(env.DB, roomId, {
        status: "finished",
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      });
      return json({ success: true, data: updated });
    }
    const roomResetMatch = url.pathname.match(/^\/api\/rooms\/([a-zA-Z0-9_-]+)\/reset$/);
    if (roomResetMatch && request.method === "POST") {
      const auth = await requireAuthUserId(request, env);
      if ("error" in auth) return auth.error;
      const roomId = roomResetMatch[1];
      const room = await getExamRoomById(env.DB, roomId);
      if (!room) return json({ success: false, message: "Room not found" }, { status: 404 });
      if (String(room.host_user_id) !== auth.userId) {
        return json({ success: false, message: "Not authorized" }, { status: 403 });
      }
      const settings = parseRoomSettings(room);
      await resetExamRoomParticipants(env.DB, roomId);
      const updated = await updateExamRoom(env.DB, roomId, {
        status: "waiting",
        settings: {
          ...settings,
          tutor_state: {
            current_question_index: 0,
            is_answer_revealed: false,
            answer_counts: createEmptyAnswerCounts()
          }
        },
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      });
      return json({ success: true, data: updated });
    }
    if (roomIdMatch && request.method === "DELETE") {
      const auth = await requireAuthUserId(request, env);
      if ("error" in auth) return auth.error;
      const roomId = roomIdMatch[1];
      const room = await getExamRoomById(env.DB, roomId);
      if (!room) return json({ success: true, message: "Room already deleted or not found" });
      if (String(room.host_user_id) !== auth.userId) {
        return json({ success: false, message: "Not authorized to delete this room" }, { status: 403 });
      }
      await deleteExamRoom(env.DB, roomId);
      return json({ success: true, message: "Room deleted successfully" });
    }
    if (url.pathname.startsWith("/api/")) {
      try {
        if (url.pathname.startsWith("/api/admin/")) {
          const admin = await requireAdmin(request, env);
          if ("error" in admin) return admin.error;
        }
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
            created = await createSystemLog(env.DB, {
              action,
              details: {
                ...typeof details === "object" && details ? details : { value: details },
                ip_address: request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for") || "unknown",
                user_agent: request.headers.get("user-agent") || "unknown"
              },
              user_id: userId,
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
            const qs = await listAllQuestions(env.DB);
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
            const qs = await listAllQuestions(env.DB);
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
            const qs = await listAllQuestions(env.DB);
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
            let qs = await listAllQuestions(env.DB);
            if (subject && subject !== "undefined" && subject !== "null") qs = qs.filter((q) => q.subject === subject);
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
          const q = await getQuestionById(env.DB, qIdMatch[1]);
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
          const cacheKey = `qs_list_${JSON.stringify({ subject, exam_year, exam_set })}`;
          let allQs = getCache(cacheKey);
          if (!allQs) {
            allQs = await listAllQuestions(env.DB);
            if (subject && subject !== "undefined" && subject !== "null") allQs = allQs.filter((q) => q.subject === subject);
            if (exam_year && exam_year !== "undefined" && exam_year !== "null") allQs = allQs.filter((q) => String(q.exam_year) === String(exam_year));
            if (exam_set && exam_set !== "undefined" && exam_set !== "null") allQs = allQs.filter((q) => String(q.exam_set) === String(exam_set));
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
          const userDoc = await getUserById(env.DB, auth.userId);
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
            const allDocs = await listAllQuestions(env.DB);
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
            created_at: (/* @__PURE__ */ new Date()).toISOString(),
            updated_at: (/* @__PURE__ */ new Date()).toISOString()
          };
          const createdQuestion = await createQuestion(env.DB, newQuestion);
          return json({ success: true, data: createdQuestion }, { status: 201 });
        }
        if (qIdMatch && request.method === "PUT") {
          const auth = await requireAuthUserId(request, env);
          if ("error" in auth) return auth.error;
          const userDoc = await getUserById(env.DB, auth.userId);
          if (!userDoc || userDoc.role !== "admin") return json({ success: false, message: "Forbidden: Admin access required" }, { status: 403 });
          const body = await readJson(request);
          if (!body) return json({ success: false, message: "invalid_body" }, { status: 400 });
          const doc = await getQuestionById(env.DB, qIdMatch[1]);
          if (!doc) return json({ success: false, message: "Question not found" }, { status: 404 });
          const updateData = { ...body, updated_at: (/* @__PURE__ */ new Date()).toISOString() };
          const updated = await updateQuestion(env.DB, qIdMatch[1], updateData);
          return json({ success: true, data: normalizeQuestion(updated) });
        }
        if (qIdMatch && request.method === "DELETE") {
          const auth = await requireAuthUserId(request, env);
          if ("error" in auth) return auth.error;
          const userDoc = await getUserById(env.DB, auth.userId);
          if (!userDoc || userDoc.role !== "admin") return json({ success: false, message: "Forbidden: Admin access required" }, { status: 403 });
          const doc = await getQuestionById(env.DB, qIdMatch[1]);
          if (!doc) return json({ success: false, message: "Question not found" }, { status: 404 });
          await deleteQuestion(env.DB, qIdMatch[1]);
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
            const qs = await getQuestionsByIds(env.DB, chunk);
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
          const examResult = await createExamResult(env.DB, {
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
            const activeSeason = await getActiveSeason(env.DB);
            if (activeSeason) {
              await upsertRankingScore(env.DB, activeSeason.id, auth.userId, score);
            }
          } catch (e) {
            console.error("Failed to update ranking:", e);
          }
          const xpGained = total_score * 10 + 50;
          try {
            const userDoc = await getUserById(env.DB, auth.userId);
            if (userDoc) {
              const currentXp = (Number(userDoc.xp) || 0) + xpGained;
              const currentLevel = userDoc.level || 1;
              const newLevel = Math.floor((1 + Math.sqrt(1 + 4 * (currentXp / 1e3))) / 2);
              const updates = { xp: currentXp };
              if (newLevel > currentLevel) {
                updates.level = newLevel;
              }
              await updateUser(env.DB, auth.userId, updates);
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
          const activeSeason = await getActiveSeason(env.DB);
          if (!activeSeason) return json({ success: true, data: { total_score: 0, exams_taken: 0 } });
          const rankingId = `${activeSeason.id}_${auth.userId}`;
          const ranking = await getRankingById(env.DB, rankingId);
          return json({ success: true, data: ranking || { total_score: 0, exams_taken: 0 } });
        }
        if (url.pathname === "/api/rankings" && request.method === "GET") {
          const activeSeason = await getActiveSeason(env.DB);
          if (!activeSeason) return json({ success: true, data: [] });
          const activeSeasonId = activeSeason.id;
          const cacheKey = `rankings_${activeSeasonId}`;
          let rankings = getCache(cacheKey);
          if (!rankings) {
            rankings = await listRankingsBySeason(env.DB, activeSeasonId, 50);
            for (const r of rankings) {
              const u = await getUserById(env.DB, String(r.user_id));
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
            const results = await listExamResultsByUser(env.DB, auth.userId);
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
            await createTicket(env.DB, ticketData);
            return json({ success: true, message: "Report submitted successfully" });
          } catch (e) {
            return json({ success: false, message: "Failed to submit report" }, { status: 500 });
          }
        }
        const bookmarksMatch = url.pathname.match(/^\/api\/bookmarks(?:\/([a-zA-Z0-9_-]+))?$/);
        if (bookmarksMatch) {
          const auth = await requireAuthUserId(request, env);
          if ("error" in auth) return auth.error;
          if (request.method === "GET") {
            const bookmarks = await listBookmarksByUser(env.DB, auth.userId);
            return json({ success: true, data: bookmarks });
          }
          if (request.method === "POST") {
            try {
              const body = await request.json();
              const { target_type, target_id, title } = body;
              if (!target_type || !target_id) {
                return json({ success: false, message: "Missing required fields" }, { status: 400 });
              }
              const existing = await listBookmarksByUser(env.DB, auth.userId);
              if (existing && existing.some((b) => String(b.target_id) === String(target_id) && b.target_type === target_type)) {
                return json({ success: false, message: "Already bookmarked" }, { status: 400 });
              }
              const bookmark = await createBookmark(env.DB, {
                user_id: auth.userId,
                target_type,
                target_id: String(target_id),
                title: title ? String(title).substring(0, 200) : "Untitled",
                created_at: (/* @__PURE__ */ new Date()).toISOString()
              });
              return json({ success: true, data: bookmark });
            } catch (e) {
              return json({ success: false, message: e.message || "Internal Error", stack: e.stack }, { status: 500 });
            }
          }
          if (request.method === "DELETE" && bookmarksMatch[1]) {
            const bookmarkId = bookmarksMatch[1];
            const bookmark = await getBookmarkById(env.DB, bookmarkId);
            if (!bookmark) return notFound();
            if (bookmark.user_id !== auth.userId) {
              return json({ success: false, message: "Unauthorized" }, { status: 403 });
            }
            await deleteBookmark(env.DB, bookmarkId);
            return json({ success: true });
          }
        }
        if (url.pathname.startsWith("/api/chat")) {
          const auth = await requireAuthUserId(request, env);
          if ("error" in auth) return auth.error;
          const myId = auth.userId;
          if (url.pathname === "/api/chat/unread-count" && request.method === "GET") {
            const received = await listReceivedMessages(env.DB, myId);
            const unreadCount = received.filter((m) => !m.is_read).length;
            return json({ success: true, data: { unread: unreadCount } });
          }
          if (url.pathname === "/api/chat/inbox/conversations" && request.method === "GET") {
            const allMsgs = await listDirectMessagesForUser(env.DB, myId);
            const convsMap = /* @__PURE__ */ new Map();
            for (const m of allMsgs) {
              const friendId = m.sender_id === myId ? m.receiver_id : m.sender_id;
              const current = convsMap.get(friendId);
              const mDate = new Date(m.created_at).getTime();
              if (!current || mDate > new Date(current.created_at).getTime()) {
                convsMap.set(friendId, m);
              }
            }
            const conversations = await Promise.all(Array.from(convsMap.entries()).map(async ([friendId, lastMessage]) => {
              const friendDoc = await getUserById(env.DB, friendId);
              const isRead = lastMessage.sender_id === myId || lastMessage.is_read;
              return {
                friend: friendDoc ? { id: friendId, display_name: friendDoc.display_name, avatar: friendDoc.avatar } : { id: friendId, display_name: "Unknown User" },
                lastMessage,
                isRead
              };
            }));
            conversations.sort((a, b) => new Date(b.lastMessage.created_at).getTime() - new Date(a.lastMessage.created_at).getTime());
            return json({ success: true, data: conversations });
          }
          if (url.pathname === "/api/chat/send" && request.method === "POST") {
            const body = await readJson(request);
            if (!body.friendId || !body.message) return json({ success: false, message: "Missing fields" }, { status: 400 });
            const newMsg = await createDirectMessage(env.DB, {
              sender_id: myId,
              receiver_id: body.friendId,
              content: body.message,
              is_read: false,
              created_at: (/* @__PURE__ */ new Date()).toISOString()
            });
            return json({ success: true, data: newMsg });
          }
          if (url.pathname === "/api/chat/read" && request.method === "POST") {
            const body = await readJson(request);
            const friendId = body.friendId;
            await markMessagesRead(env.DB, myId, friendId);
            return json({ success: true });
          }
          const chatMatch = url.pathname.match(/^\/api\/chat\/([a-zA-Z0-9_-]+)$/);
          if (chatMatch && request.method === "GET") {
            const friendId = chatMatch[1];
            const allMsgs = await listDirectMessagesForUser(env.DB, myId);
            const chatHistory = allMsgs.filter((m) => m.sender_id === myId && m.receiver_id === friendId || m.sender_id === friendId && m.receiver_id === myId);
            chatHistory.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
            return json({ success: true, data: chatHistory });
          }
        }
        if (url.pathname.startsWith("/api/notifications")) {
          const auth = await requireAuthUserId(request, env);
          if ("error" in auth) return auth.error;
          const myId = auth.userId;
          if (url.pathname === "/api/notifications" && request.method === "GET") {
            const limitStr = url.searchParams.get("limit") || "50";
            const notifications = await listNotificationsByUser(env.DB, myId, parseInt(limitStr, 10));
            return json({ success: true, data: notifications });
          }
          if (url.pathname === "/api/notifications/unread-count" && request.method === "GET") {
            const notifications = await listNotificationsByUser(env.DB, myId, 1e3);
            const unreadCount = notifications.filter((n) => !n.is_read).length;
            return json({ success: true, data: { unread: unreadCount } });
          }
          if (url.pathname === "/api/notifications/read" && request.method === "POST") {
            const body = await readJson(request);
            if (body.id) {
              await markNotificationRead(env.DB, body.id);
            } else {
              await markAllNotificationsRead(env.DB, myId);
            }
            return json({ success: true });
          }
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
          let allThreads = await listThreads(env.DB, 200);
          if (category && category !== "all" && category !== "undefined" && category !== "null") {
            allThreads = allThreads.filter((t) => t.category === category);
          }
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
            const users = await Promise.all(chunk.map((id) => getUserById(env.DB, String(id))));
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
          const created = await createThread(env.DB, threadData);
          return json({ success: true, data: created }, { status: 201 });
        }
        const examIdMatch = url.pathname.match(/^\/api\/exams\/([a-zA-Z0-9_-]+)$/);
        if (examIdMatch && request.method === "GET") {
          const auth = await requireAuthUserId(request, env);
          if ("error" in auth) return auth.error;
          const result = await getExamResultById(env.DB, examIdMatch[1]);
          if (!result) return json({ success: false, message: "Result not found" }, { status: 404 });
          return json({ success: true, data: result });
        }
        const threadIdMatch = url.pathname.match(/^\/api\/community\/threads\/([a-zA-Z0-9_-]+)$/);
        if (threadIdMatch && request.method === "GET") {
          const threadDoc = await getThreadById(env.DB, threadIdMatch[1]);
          if (!threadDoc) return notFound();
          if (!threadDoc.stats) threadDoc.stats = { views: threadDoc.views || 0, likes: threadDoc.likes || 0, comments_count: 0 };
          const u = await getUserById(env.DB, String(threadDoc.user_id));
          if (u) {
            threadDoc.User = { id: u.id, display_name: u.display_name || "Unknown User", avatar: u.avatar || null, plan_type: u.plan_type || "free" };
          }
          return json(threadDoc);
        }
        const userThreadsMatch = url.pathname.match(/^\/api\/community\/threads\/user\/([a-zA-Z0-9_-]+)$/);
        if (userThreadsMatch && request.method === "GET") {
          const userId = userThreadsMatch[1];
          const threads = await listThreadsByUser(env.DB, userId);
          threads.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          return json({ success: true, data: threads });
        }
        if (threadIdMatch && request.method === "DELETE") {
          const auth = await requireAuthUserId(request, env);
          if ("error" in auth) return auth.error;
          const threadDoc = await getThreadById(env.DB, threadIdMatch[1]);
          if (!threadDoc) return notFound();
          if (threadDoc.user_id !== auth.userId) {
            return json({ success: false, message: "Unauthorized" }, { status: 403 });
          }
          await deleteThread(env.DB, threadIdMatch[1]);
          return json({ success: true });
        }
        const commentsMatch = url.pathname.match(/^\/api\/community\/comments\/([a-zA-Z0-9_-]+)$/);
        if (commentsMatch && request.method === "GET") {
          const threadId = commentsMatch[1];
          let comments = await listCommentsByThread(env.DB, threadId);
          const userIds = [...new Set(comments.map((c) => c.user_id).filter(Boolean))];
          const usersMap = /* @__PURE__ */ new Map();
          for (let i = 0; i < userIds.length; i += 30) {
            const chunk = userIds.slice(i, i + 30);
            const users = await Promise.all(chunk.map((id) => getUserById(env.DB, String(id))));
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
          const created = await createComment(env.DB, commentData);
          return json({ success: true, data: created });
        }
        const commentLikeMatch = url.pathname.match(/^\/api\/community\/comments\/([a-zA-Z0-9_-]+)\/like$/);
        if (commentLikeMatch && request.method === "POST") {
          const auth = await requireAuthUserId(request, env);
          if ("error" in auth) return auth.error;
          const commentId = commentLikeMatch[1];
          const comment = await getCommentById(env.DB, commentId);
          if (!comment) return notFound();
          const currentLikes = comment.likes || 0;
          await updateComment(env.DB, commentId, { likes: currentLikes + 1 });
          return json({ success: true, likes: currentLikes + 1 });
        }
        if (url.pathname === "/api/news" && request.method === "GET") {
          try {
            const agency = url.searchParams.get("agency");
            const search = url.searchParams.get("search");
            const { results } = await env.DB.prepare("SELECT * FROM news ORDER BY created_at DESC LIMIT 100").all();
            const news = results.map((r) => {
              const metadata = r.metadata ? JSON.parse(r.metadata) : {};
              return {
                ...r,
                metadata,
                summary: metadata?.summary || null,
                is_featured: !!metadata?.is_featured,
                recruitment_type: metadata?.recruitment_type || null,
                published_date: metadata?.published_date || null,
                views: metadata?.views || 0
              };
            });
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
          const created = await createNews(env.DB, body);
          return json({ success: true, data: created });
        }
        if (url.pathname === "/api/news/agency-stats" && request.method === "GET") {
          try {
            const typeFilter = url.searchParams.get("type");
            const { results } = await env.DB.prepare("SELECT * FROM news ORDER BY created_at DESC LIMIT 100").all();
            const news = results.map((r) => {
              const metadata = r.metadata ? JSON.parse(r.metadata) : {};
              return {
                ...r,
                metadata,
                recruitment_type: metadata?.recruitment_type || null,
                published_date: metadata?.published_date || null
              };
            });
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
            const doc = await getNewsById(env.DB, id);
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
          const updated = await updateNews(env.DB, id, body);
          if (!updated) return json({ success: false, message: "not_found" }, { status: 404 });
          return json({ success: true, data: updated });
        }
        if (newsIdMatch && request.method === "DELETE") {
          const auth = await requireAuthUserId(request, env);
          if ("error" in auth) return auth.error;
          const id = newsIdMatch[1];
          await deleteNews(env.DB, id);
          return json({ success: true, message: "Deleted" });
        }
        const newsFeatureMatch = url.pathname.match(/^\/api\/news\/([a-zA-Z0-9_-]+)\/feature$/);
        if (newsFeatureMatch && request.method === "PUT") {
          const auth = await requireAuthUserId(request, env);
          if ("error" in auth) return auth.error;
          const id = newsFeatureMatch[1];
          const updated = await toggleNewsFeatured(env.DB, id);
          if (!updated) return json({ success: false, message: "Not found" }, { status: 404 });
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
            const { results } = await env.DB.prepare("SELECT * FROM news ORDER BY created_at DESC LIMIT 50").all();
            const news = results.map((r) => ({ ...r, metadata: r.metadata ? JSON.parse(r.metadata) : null }));
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
            const { results: sources } = await env.DB.prepare("SELECT * FROM news_sources ORDER BY name ASC").all();
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
          const created = await createNews(env.DB, jobData);
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
        if (url.pathname === "/api/users/profile" && request.method === "GET") {
          const auth = await requireAuthUserId(request, env);
          if ("error" in auth) return auth.error;
          const user = await getUserById(env.DB, auth.userId);
          return json({ success: true, data: sanitizeUser(user) });
        }
        if (url.pathname === "/api/users/profile" && request.method === "PUT") {
          const auth = await requireAuthUserId(request, env);
          if ("error" in auth) return auth.error;
          const body = await readJson(request);
          if (!body || !body.username) return json({ success: false, message: "Username is required" }, { status: 400 });
          const updates = {
            display_name: String(body.username).trim(),
            updated_at: (/* @__PURE__ */ new Date()).toISOString()
          };
          await updateUser(env.DB, auth.userId, updates);
          const updatedUser = await getUserById(env.DB, auth.userId);
          return json({ success: true, data: sanitizeUser(updatedUser) });
        }
        if (url.pathname === "/api/users/profile" && request.method === "DELETE") {
          const auth = await requireAuthUserId(request, env);
          if ("error" in auth) return auth.error;
          await deleteUser(env.DB, auth.userId);
          return json({ success: true, message: "Account deleted successfully" });
        }
        if (url.pathname === "/api/users/settings" && request.method === "PUT") {
          const auth = await requireAuthUserId(request, env);
          if ("error" in auth) return auth.error;
          const body = await readJson(request);
          if (!body) return json({ success: false, message: "Invalid payload" }, { status: 400 });
          const updates = {
            settings_friends_online: !!body.friends_online,
            settings_streak_reminder: !!body.streak_reminder,
            settings_new_message: !!body.new_message,
            updated_at: (/* @__PURE__ */ new Date()).toISOString()
          };
          await updateUser(env.DB, auth.userId, updates);
          const updatedUser = await getUserById(env.DB, auth.userId);
          return json({ success: true, data: sanitizeUser(updatedUser) });
        }
        if (url.pathname === "/api/users/stats" && request.method === "GET") {
          const auth = await requireAuthUserId(request, env);
          if ("error" in auth) return auth.error;
          try {
            const results = await listExamResultsByUser(env.DB, auth.userId);
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
            const results = await listExamResultsByUser(env.DB, auth.userId);
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
            const results = await listExamResultsByUser(env.DB, auth.userId);
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
            const relations = await listFriendsByUser(env.DB, myId);
            const exists = relations.find((r) => r.requester_id === myId && r.target_id === friendId || r.target_id === myId && r.requester_id === friendId);
            if (exists) return json({ success: false, message: "Request already exists or already friends" }, { status: 400 });
            const newReq = await createFriendRequest(env.DB, myId, friendId);
            return json({ success: true, data: newReq });
          }
          if (url.pathname === "/api/friends/accept" && request.method === "POST") {
            const body = await readJson(request);
            const friendId = body.friendId;
            const tgts = await listFriendsByUser(env.DB, myId);
            const req = tgts.find((r) => r.requester_id === friendId && r.status === "pending");
            if (!req) return json({ success: false, message: "Request not found" }, { status: 404 });
            await updateFriend(env.DB, req.id, { status: "accepted" });
            return json({ success: true });
          }
          const removeMatch = url.pathname.match(/^\/api\/friends\/remove\/(.+)$/);
          if (removeMatch && request.method === "DELETE") {
            const friendId = removeMatch[1];
            const relations = await listFriendsByUser(env.DB, myId);
            const toDelete = [
              ...relations.filter((r) => r.target_id === friendId || r.requester_id === friendId)
            ];
            for (const doc of toDelete) {
              await deleteFriend(env.DB, doc.id);
            }
            return json({ success: true });
          }
          if (url.pathname === "/api/friends/list" && request.method === "GET") {
            const relations = await listFriendsByUser(env.DB, myId);
            const friendsList = [
              ...relations.filter((r) => r.status === "accepted")
            ];
            const friendIds = friendsList.map((f) => f.requester_id === myId ? f.target_id : f.requester_id);
            const friendProfiles = await Promise.all(friendIds.map(async (fid) => {
              const doc = await getUserById(env.DB, fid);
              if (!doc) return null;
              return { id: fid, display_name: doc.display_name, avatar: doc.avatar, level: doc.level };
            }));
            return json({ success: true, data: friendProfiles.filter(Boolean) });
          }
          if (url.pathname === "/api/friends/pending" && request.method === "GET") {
            const tgts = await listFriendsByUser(env.DB, myId);
            const pendingList = tgts.filter((r) => r.status === "pending");
            const pendingProfiles = await Promise.all(pendingList.map(async (f) => {
              const doc = await getUserById(env.DB, f.requester_id);
              if (!doc) return null;
              return { id: f.requester_id, display_name: doc.display_name, avatar: doc.avatar, level: doc.level, request_id: f.id };
            }));
            return json({ success: true, data: pendingProfiles.filter(Boolean) });
          }
          const checkMatch = url.pathname.match(/^\/api\/friends\/check\/(.+)$/);
          if (checkMatch && request.method === "GET") {
            const friendId = checkMatch[1];
            const relations = await listFriendsByUser(env.DB, myId);
            const r1 = relations.find((r) => r.requester_id === myId && r.target_id === friendId);
            const r2 = relations.find((r) => r.target_id === myId && r.requester_id === friendId);
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
            const userDoc = await getUserById(env.DB, auth.userId);
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
            await updateUser(env.DB, auth.userId, updates);
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
            const results = await listPaymentPlans(env.DB);
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
            const planDoc = await getPaymentPlanById(env.DB, plan_id);
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
            await createTransaction(env.DB, transactionData);
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
            await updatePaymentPlan(env.DB, id, { ...body, updated_at: (/* @__PURE__ */ new Date()).toISOString() });
            return json({ success: true });
          }
          if (request.method === "DELETE") {
            await deletePaymentPlan(env.DB, id);
            return json({ success: true });
          }
        } else if (url.pathname === "/api/admin/payments/plans") {
          const auth = await requireAuthUserId(request, env);
          if ("error" in auth) return auth.error;
          if (request.method === "GET") {
            try {
              const results = await listPaymentPlans(env.DB);
              return json({ success: true, plans: results });
            } catch (e) {
              return json({ success: true, plans: [] });
            }
          }
          if (request.method === "POST") {
            const body = await request.json();
            const planData = await createPaymentPlan(env.DB, { ...body, id: crypto.randomUUID(), created_at: (/* @__PURE__ */ new Date()).toISOString(), updated_at: (/* @__PURE__ */ new Date()).toISOString() });
            return json({ success: true, plan: planData });
          }
        }
        const assetMatch = url.pathname.match(/^\/api\/assets\/([^\/]+)$/);
        if (assetMatch) {
          const id = decodeURIComponent(assetMatch[1]);
          if (request.method === "DELETE") {
            const auth = await requireAuthUserId(request, env);
            if ("error" in auth) return auth.error;
            await deleteAsset(env.DB, id);
            return json({ success: true });
          }
        } else if (url.pathname === "/api/assets") {
          if (request.method === "GET") {
            try {
              const results = await listAssets(env.DB);
              return json({ success: true, data: results });
            } catch (e) {
              return json({ success: true, data: [] });
            }
          }
          if (request.method === "POST") {
            const auth = await requireAuthUserId(request, env);
            if ("error" in auth) return auth.error;
            const body = await request.json();
            const assetData = await createAsset(env.DB, { ...body, id: crypto.randomUUID(), created_at: (/* @__PURE__ */ new Date()).toISOString(), updated_at: (/* @__PURE__ */ new Date()).toISOString() });
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
              const settings = await getSystemConfig(env.DB, "general_settings");
              return json({ success: true, settings: settings || {} });
            } catch (e) {
              return json({ success: true, settings: {} });
            }
          }
          if (request.method === "PUT") {
            const body = await request.json();
            await upsertSystemConfig(env.DB, "general_settings", body);
            return json({ success: true, settings: body });
          }
        }
        if (url.pathname === "/api/public/settings") {
          if (request.method === "GET") {
            try {
              const settings = await getSystemConfig(env.DB, "general_settings");
              return json({ success: true, settings: settings || {} });
            } catch (e) {
              return json({ success: true, settings: {} });
            }
          }
        }
        if (url.pathname === "/api/legal/policy") {
          if (request.method === "GET") {
            try {
              const policy = await getSystemConfig(env.DB, "privacy_policy");
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
              await upsertSystemConfig(env.DB, "privacy_policy", { content: body.content });
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
            let businesses = await listBusinesses(env.DB, 50);
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
        if (cleanPathname === "/api/business" && (request.method === "POST" || request.method === "PUT")) {
          const auth = await requireAuthUserId(request, env);
          if ("error" in auth) return auth.error;
          try {
            const body = await request.json();
            const business = await getBusinessByOwner(env.DB, auth.userId);
            if (request.method === "POST") {
              if (business) {
                return json({ success: false, message: "User already has a business page." }, { status: 400 });
              }
              const businessData = {
                owner_uid: auth.userId,
                name: body.name || "",
                tagline: body.tagline || null,
                category: body.category || null,
                contact_link: body.contact_link || null,
                contact_line_id: body.contact_line_id || null,
                contact_facebook_url: body.contact_facebook_url || null,
                status: "approved",
                stats: { followers: 0, views: 0, rating_avg: 0, rating_count: 0 },
                created_at: (/* @__PURE__ */ new Date()).toISOString(),
                updated_at: (/* @__PURE__ */ new Date()).toISOString()
              };
              const createdBusiness = await createBusiness(env.DB, businessData);
              return json({ success: true, business: createdBusiness }, { status: 201 });
            } else {
              if (!business) {
                return json({ success: false, message: "Business not found." }, { status: 404 });
              }
              const docId = business.id;
              const updateData = { updated_at: (/* @__PURE__ */ new Date()).toISOString() };
              if (body.name !== void 0) updateData.name = body.name;
              if (body.tagline !== void 0) updateData.tagline = body.tagline;
              if (body.about !== void 0) updateData.about = body.about;
              if (body.category !== void 0) updateData.category = body.category;
              if (body.contact_link !== void 0) updateData.contact_link = body.contact_link;
              if (body.contact_line_id !== void 0) updateData.contact_line_id = body.contact_line_id;
              if (body.contact_facebook_url !== void 0) updateData.contact_facebook_url = body.contact_facebook_url;
              const updated = await updateBusiness(env.DB, docId, updateData);
              return json({ success: true, message: "Business updated successfully", business: updated });
            }
          } catch (err) {
            return json({ success: false, message: "Error processing business.", error: String(err) }, { status: 500 });
          }
        }
        if (url.pathname === "/api/business/feed" && request.method === "GET") {
          try {
            const posts = await listBusinessPosts(env.DB, void 0, 50);
            const businessIds = Array.from(new Set(posts.map((p) => p.business_id).filter(Boolean)));
            const businessesMap = /* @__PURE__ */ new Map();
            for (const bid of businessIds) {
              const b = await getBusinessById(env.DB, String(bid));
              if (b) businessesMap.set(String(bid), b);
            }
            const feed = posts.map((p) => {
              const b = businessesMap.get(p.business_id);
              return {
                ...p,
                business_name: b ? b.name : "Unknown Business",
                business_logo: b ? b.logo_image : null
              };
            });
            return json({ success: true, feed });
          } catch (err) {
            return json({ success: true, feed: [] });
          }
        }
        if (url.pathname === "/api/business/my-business" && request.method === "GET") {
          const auth = await requireAuthUserId(request, env);
          if ("error" in auth) return auth.error;
          try {
            const business = await getBusinessByOwner(env.DB, auth.userId);
            if (!business) {
              return json({ success: false, message: "Business not found." }, { status: 404 });
            }
            return json({ success: true, business });
          } catch (err) {
            return json({ success: false, message: "Error fetching business.", error: String(err) }, { status: 500 });
          }
        }
        if (url.pathname === "/api/business/my-business" && request.method === "DELETE") {
          const auth = await requireAuthUserId(request, env);
          if ("error" in auth) return auth.error;
          try {
            const business = await getBusinessByOwner(env.DB, auth.userId);
            if (business) await deleteBusiness(env.DB, business.id);
            return json({ success: true, message: "Business page deleted" });
          } catch (err) {
            return json({ success: false, message: "Error deleting business", error: String(err) }, { status: 500 });
          }
        }
        if (url.pathname === "/api/ads/stats/daily-burn" && request.method === "GET") {
          return json([]);
        }
        if (url.pathname === "/api/ads/dashboard" && request.method === "GET") {
          return json({ activeAds: 0, totalViews: 0, totalClicks: 0, totalSpent: 0, dailyStats: [] });
        }
        if (url.pathname === "/api/ads/wallet" && request.method === "GET") {
          return json({ balance: 0, currency: "THB", businessName: "Business Name" });
        }
        if (url.pathname === "/api/business/inbox" && request.method === "GET") {
          return json({ success: true, conversations: [] });
        }
        if (url.pathname === "/api/ads/my-ads" && request.method === "GET") {
          return json([]);
        }
        if (url.pathname === "/api/ads/wallet/transactions" && request.method === "GET") {
          return json([]);
        }
        if (url.pathname === "/api/business/posts" && request.method === "GET") {
          try {
            const businessId = url.searchParams.get("business_id");
            if (!businessId) return json({ success: false, message: "business_id is required" }, { status: 400 });
            const posts = await listBusinessPosts(env.DB, businessId, 50);
            return json({ success: true, posts });
          } catch (err) {
            return json({ success: true, posts: [] });
          }
        }
        const businessMatch = url.pathname.match(/^\/api\/business\/([a-zA-Z0-9_:-]+)$/);
        if (businessMatch && request.method === "GET") {
          try {
            const id = businessMatch[1];
            const business = await getBusinessById(env.DB, id);
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
            const results = await listTickets(env.DB);
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
            const created = await createTicket(env.DB, ticketData);
            return json({ success: true, data: created });
          } catch (e) {
            return json({ success: false, message: "Failed to create ticket" }, { status: 500 });
          }
        }
        if (url.pathname === "/api/support/tickets/my" && request.method === "GET") {
          try {
            const auth = await requireAuthUserId(request, env);
            if ("error" in auth) return auth.error;
            const results = await listTickets(env.DB, auth.userId);
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
            const ticket = await getTicketById(env.DB, ticketId);
            if (!ticket) return json({ success: false, message: "Ticket not found" }, { status: 404 });
            const messages = await listTicketMessages(env.DB, ticketId);
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
            await updateTicket(env.DB, ticketId, {
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
            const created = await createTicketMessage(env.DB, ticketId, messageData);
            await updateTicket(env.DB, ticketId, {
              updated_at: (/* @__PURE__ */ new Date()).toISOString()
            });
            return json({ success: true, data: created });
          } catch (e) {
            console.error("Add message error:", e);
            return json({ success: false, message: "Failed to add message" }, { status: 500 });
          }
        }
        if (url.pathname === "/api/admin/payments") return json(await listPayments(env.DB, void 0, 100));
        if (url.pathname === "/api/admin/ads/pending") return json([]);
        if (url.pathname === "/api/news/sources/all") {
          const { results } = await env.DB.prepare("SELECT * FROM news_sources ORDER BY name ASC").all();
          return json({ success: true, data: results || [] });
        }
        if (url.pathname === "/api/assets") return json({ success: true, data: [] });
        if (url.pathname === "/api/admin/stats" && request.method === "GET") {
          const auth = await requireAuthUserId(request, env);
          if ("error" in auth) return auth.error;
          try {
            const now = /* @__PURE__ */ new Date();
            const startOfDay = new Date(now);
            startOfDay.setHours(0, 0, 0, 0);
            const totalUsersRes = await env.DB.prepare("SELECT COUNT(*) AS c FROM users").first();
            const premiumUsersRes = await env.DB.prepare("SELECT COUNT(*) AS c FROM users WHERE plan_type = 'premium'").first();
            const activeUsersRes = await env.DB.prepare("SELECT COUNT(*) AS c FROM users WHERE last_active_at >= ?").bind(startOfDay.toISOString()).first();
            const totalUsers = Number(totalUsersRes?.c || 0);
            const premiumUsers = Number(premiumUsersRes?.c || 0);
            const realActiveUsers = Number(activeUsersRes?.c || 0);
            const currentMonth = now.getMonth();
            const currentYear = now.getFullYear();
            const payments = await listPayments(env.DB, void 0, 200);
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
            const revenueQuery = /* @__PURE__ */ __name(async (statuses, dateStart) => {
              const placeholders = statuses.map(() => "?").join(", ");
              const sql = dateStart ? `SELECT COALESCE(SUM(amount), 0) AS total FROM payments WHERE lower(status) IN (${placeholders}) AND created_at >= ?` : `SELECT COALESCE(SUM(amount), 0) AS total FROM payments WHERE lower(status) IN (${placeholders})`;
              const stmt = env.DB.prepare(sql);
              const row = dateStart ? await stmt.bind(...statuses.map((s) => s.toLowerCase()), dateStart).first() : await stmt.bind(...statuses.map((s) => s.toLowerCase())).first();
              return Number(row?.total || 0);
            }, "revenueQuery");
            const [pendingRevenue, totalRevenue, yearlyRevenue, monthlyRevenue] = await Promise.all([
              revenueQuery(["pending"]),
              revenueQuery(successStatuses),
              revenueQuery(successStatuses, startOfYear),
              revenueQuery(successStatuses, startOfMonth)
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
            const rawUserId = value?.stringValue ?? value?.integerValue ?? value;
            const { results } = await env.DB.prepare("SELECT * FROM system_logs WHERE user_id = ? ORDER BY datetime(created_at) DESC LIMIT 10").bind(String(rawUserId)).all();
            return results || [];
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
          const userDoc = await getUserById(env.DB, id);
          if (!userDoc) return json({ message: "User not found" }, { status: 404 });
          const examHistory = await listExamResultsByUser(env.DB, id, 20);
          const paymentHistory = await listPayments(env.DB, id, 10);
          return json({ success: true, user: userDoc, examHistory, paymentHistory });
        }
        const adminUserStatusMatch = url.pathname.match(/^\/api\/admin\/users\/([a-zA-Z0-9_-]+)\/status$/);
        if (adminUserStatusMatch && request.method === "PUT") {
          const auth = await requireAuthUserId(request, env);
          if ("error" in auth) return auth.error;
          const body = await request.json();
          await updateUser(env.DB, adminUserStatusMatch[1], { status: body.status });
          return json({ success: true });
        }
        const adminUserPermMatch = url.pathname.match(/^\/api\/admin\/users\/([a-zA-Z0-9_-]+)\/permissions$/);
        if (adminUserPermMatch && request.method === "PUT") {
          const auth = await requireAuthUserId(request, env);
          if ("error" in auth) return auth.error;
          const body = await request.json();
          await updateUser(env.DB, adminUserPermMatch[1], { admin_permissions: body.permissions });
          return json({ success: true });
        }
        const adminUserUpdateMatch = url.pathname.match(/^\/api\/admin\/users\/([a-zA-Z0-9_-]+)$/);
        if (adminUserUpdateMatch && request.method === "PUT") {
          const auth = await requireAuthUserId(request, env);
          if ("error" in auth) return auth.error;
          const body = await request.json();
          await updateUser(env.DB, adminUserUpdateMatch[1], body);
          return json({ success: true });
        }
        if (url.pathname === "/api/admin/messages" && request.method === "GET") {
          const auth = await requireAuthUserId(request, env);
          if ("error" in auth) return auth.error;
          try {
            const { results: messages } = await env.DB.prepare("SELECT * FROM contact_messages ORDER BY datetime(created_at) DESC LIMIT 50").all();
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
              const { results: messages } = await env.DB.prepare("SELECT * FROM contact_messages LIMIT 50").all();
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
          const users = await listUsers(env.DB, 100);
          return json(users);
        }
        if (url.pathname === "/api/admin/seasons" && request.method === "GET") {
          const auth = await requireAuthUserId(request, env);
          if ("error" in auth) return auth.error;
          try {
            const seasons = await listSeasons(env.DB);
            return json({ success: true, data: seasons });
          } catch (e) {
            return json({ success: true, data: [] });
          }
        }
        if (url.pathname === "/api/admin/seasons" && request.method === "POST") {
          const auth = await requireAuthUserId(request, env);
          if ("error" in auth) return auth.error;
          const body = await readJson(request);
          await completeActiveSeasons(env.DB, (/* @__PURE__ */ new Date()).toISOString());
          const id = body.id || String((/* @__PURE__ */ new Date()).getFullYear());
          const newSeason = await createSeason(env.DB, {
            id,
            name: body.name || `Season ${id}`,
            start_date: (/* @__PURE__ */ new Date()).toISOString(),
            status: "active",
            responsible_admin_id: body.responsible_admin_id || auth.userId,
            created_at: (/* @__PURE__ */ new Date()).toISOString(),
            updated_at: (/* @__PURE__ */ new Date()).toISOString()
          });
          return json({ success: true, data: newSeason });
        }
        const seasonMatch = url.pathname.match(/^\/api\/admin\/seasons\/([a-zA-Z0-9_-]+)$/);
        if (seasonMatch && request.method === "PUT") {
          const auth = await requireAuthUserId(request, env);
          if ("error" in auth) return auth.error;
          const id = seasonMatch[1];
          const body = await readJson(request);
          const season = await getSeasonById(env.DB, id);
          if (!season) return json({ success: false, message: "Season not found" }, { status: 404 });
          await updateSeason(env.DB, id, { ...body, updated_at: (/* @__PURE__ */ new Date()).toISOString() });
          return json({ success: true });
        }
        if (url.pathname === "/api/admin/businesses" && request.method === "GET") {
          const auth = await requireAuthUserId(request, env);
          if ("error" in auth) return auth.error;
          const businesses = await listBusinesses(env.DB, 100);
          businesses.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
          return json(businesses);
        }
        if (url.pathname === "/api/admin/payments" && request.method === "GET") {
          const auth = await requireAuthUserId(request, env);
          if ("error" in auth) return auth.error;
          const payments = await listPayments(env.DB, void 0, 100);
          return json(payments);
        }
        if (url.pathname === "/api/admin/threads" && request.method === "GET") {
          const auth = await requireAuthUserId(request, env);
          if ("error" in auth) return auth.error;
          const threads = await listThreads(env.DB, 100);
          return json({ threads, pagination: { page: 1, totalPages: 1, total: threads.length } });
        }
        if (url.pathname === "/api/admin/migrate-news" && request.method === "POST") {
          const auth = await requireAdmin(request, env);
          if ("error" in auth) return auth.error;
          return json({ success: true, message: "News already runs on D1." });
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
              const { results } = await env.DB.prepare("SELECT external_link FROM news WHERE author = '\u0E23\u0E30\u0E1A\u0E1A\u0E2D\u0E31\u0E15\u0E42\u0E19\u0E21\u0E31\u0E15\u0E34 (OCSC)'").all();
              const existingLinks = new Set(results.map((j) => j.external_link).filter(Boolean));
              const newDocs = [];
              for (const job of parsedJobs) {
                const externalLink = "https://job.ocsc.go.th/portal/jobs/" + job.id;
                if (existingLinks.has(externalLink)) {
                  skipCount++;
                  continue;
                }
                const newDoc = {
                  id: crypto.randomUUID(),
                  title: job.position,
                  content: `\u0E23\u0E31\u0E1A\u0E2A\u0E21\u0E31\u0E04\u0E23 ${job.vacancy}`,
                  category: job.category,
                  agency: job.department,
                  author: "\u0E23\u0E30\u0E1A\u0E1A\u0E2D\u0E31\u0E15\u0E42\u0E19\u0E21\u0E31\u0E15\u0E34 (OCSC)",
                  external_link: externalLink,
                  status: "published",
                  application_start: job.start_date,
                  application_end: job.end_date,
                  metadata: {
                    ministry: job.ministry,
                    department: job.department,
                    organization: job.department,
                    position_type: job.recruitment_type,
                    agency_logo: job.agency_logo,
                    location: job.location,
                    vacancy_count: job.vacancy_count
                  },
                  created_at: (/* @__PURE__ */ new Date()).toISOString(),
                  updated_at: (/* @__PURE__ */ new Date()).toISOString()
                };
                newDocs.push(newDoc);
                existingLinks.add(externalLink);
              }
              if (newDocs.length > 0) {
                addLog(`[System] Batch inserting ${newDocs.length} new jobs...`);
                const stmt = env.DB.prepare(`
                            INSERT INTO news (id, title, content, category, agency, author, external_link, status, application_start, application_end, metadata, created_at, updated_at)
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                        `);
                const batch = newDocs.map((doc) => stmt.bind(
                  doc.id,
                  doc.title,
                  doc.content,
                  doc.category,
                  doc.agency,
                  doc.author,
                  doc.external_link,
                  doc.status,
                  doc.application_start,
                  doc.application_end,
                  JSON.stringify(doc.metadata),
                  doc.created_at,
                  doc.updated_at
                ));
                await env.DB.batch(batch);
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
            const doc = await getSystemConfig(env.DB, "generator_status");
            if (doc) statusDoc = doc;
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
    const { results: news } = await env.DB.prepare("SELECT id, category, status, application_end FROM news LIMIT 500").all();
    const now = /* @__PURE__ */ new Date();
    let expiredCount = 0;
    for (const job of news || []) {
      if (job.category === "\u0E07\u0E32\u0E19\u0E23\u0E32\u0E0A\u0E01\u0E32\u0E23" && job.status !== "expired" && job.application_end) {
        const endD = parseThaiDate(job.application_end);
        if (endD && endD < now) {
          await env.DB.prepare("UPDATE news SET status = ?, updated_at = ? WHERE id = ?").bind("expired", (/* @__PURE__ */ new Date()).toISOString(), job.id).run();
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
  try {
    const rooms = await listExamRooms(env.DB, 1e3);
    const now = (/* @__PURE__ */ new Date()).getTime();
    let deletedCount = 0;
    const oneDayMs = 24 * 60 * 60 * 1e3;
    for (const room of rooms) {
      const createdAt = new Date(String(room.created_at || room.updated_at || Date.now())).getTime();
      if (now - createdAt > oneDayMs) {
        await deleteExamRoom(env.DB, room.id);
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

// node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
init_modules_watch_stub();
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// .wrangler/tmp/bundle-GedDbd/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default
];
var middleware_insertion_facade_default = src_default;

// node_modules/wrangler/templates/middleware/common.ts
init_modules_watch_stub();
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-GedDbd/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  RealtimeDO,
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=index.js.map
