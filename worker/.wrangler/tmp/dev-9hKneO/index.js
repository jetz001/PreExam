var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// src/d1.ts
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
      const maxParticipants = Math.min(20, Math.max(2, Number(body.max_participants || 20)));
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

// node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-AkxTrY/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = src_default;

// node_modules/wrangler/templates/middleware/common.ts
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

// .wrangler/tmp/bundle-AkxTrY/middleware-loader.entry.ts
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
