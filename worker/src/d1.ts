const USER_COLUMNS = [
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
  "extra_json",
] as const;

const NEWS_BASE_COLUMNS = [
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
  "updated_at",
] as const;

type UserColumn = (typeof USER_COLUMNS)[number];
type NewsBaseColumn = (typeof NEWS_BASE_COLUMNS)[number];

const USER_UPDATE_COLUMNS: UserColumn[] = USER_COLUMNS.filter((col) => col !== "id");
const NEWS_UPDATE_COLUMNS: NewsBaseColumn[] = NEWS_BASE_COLUMNS.filter((col) => col !== "id" && col !== "created_at");

const nowIso = () => new Date().toISOString();

export const generateTextId = () => crypto.randomUUID().replace(/-/g, "");

const safeJsonParse = <T>(value: unknown, fallback: T): T => {
  if (typeof value !== "string" || !value.trim()) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
};

const pickExisting = <T extends readonly string[]>(source: Record<string, any>, keys: T) => {
  const picked: Record<string, any> = {};
  for (const key of keys) {
    if (source[key] !== undefined) picked[key] = source[key];
  }
  return picked;
};

const parseNewsRow = (row: any) => {
  if (!row) return null;
  const metadata = safeJsonParse<Record<string, any>>(row.metadata, {});
  return {
    ...row,
    metadata,
    summary: metadata.summary ?? null,
    is_featured: Boolean(metadata.is_featured),
    published_date: metadata.published_date ?? null,
    recruitment_type: metadata.recruitment_type ?? null,
    views: metadata.views ?? 0,
  };
};

const parseUserRow = (row: any) => {
  if (!row) return null;
  const xp = Number(row.xp ?? row.xp_points ?? 0) || 0;
  return {
    ...row,
    xp,
    xp_points: Number(row.xp_points ?? xp) || 0,
    level: Number(row.level ?? 1) || 1,
    wallet_balance: Number(row.wallet_balance ?? 0) || 0,
    streak_count: Number(row.streak_count ?? 0) || 0,
    settings_friends_online: row.settings_friends_online === null || row.settings_friends_online === undefined ? null : Boolean(Number(row.settings_friends_online)),
    settings_streak_reminder: row.settings_streak_reminder === null || row.settings_streak_reminder === undefined ? null : Boolean(Number(row.settings_streak_reminder)),
    settings_new_message: row.settings_new_message === null || row.settings_new_message === undefined ? null : Boolean(Number(row.settings_new_message)),
    notify_friend_request: row.notify_friend_request === null || row.notify_friend_request === undefined ? null : Boolean(Number(row.notify_friend_request)),
    notify_study_group: row.notify_study_group === null || row.notify_study_group === undefined ? null : Boolean(Number(row.notify_study_group)),
    notify_news_update: row.notify_news_update === null || row.notify_news_update === undefined ? null : Boolean(Number(row.notify_news_update)),
    allow_friend_request: row.allow_friend_request === null || row.allow_friend_request === undefined ? null : Boolean(Number(row.allow_friend_request)),
    is_public_stats: row.is_public_stats === null || row.is_public_stats === undefined ? null : Boolean(Number(row.is_public_stats)),
    is_online_visible: row.is_online_visible === null || row.is_online_visible === undefined ? null : Boolean(Number(row.is_online_visible)),
    admin_permissions: parseStructuredValue<any[]>(row.admin_permissions, []),
    business_info: parseStructuredValue<any>(row.business_info, null),
    mistake_history: parseStructuredValue<any>(row.mistake_history, null),
    extra_json: parseStructuredValue<any>(row.extra_json, null),
  };
};

const mergeNewsMetadata = (body: Record<string, any>, existingMetadata: Record<string, any> = {}) => {
  const metadata: Record<string, any> = {
    ...existingMetadata,
    ...(body.metadata && typeof body.metadata === "object" && !Array.isArray(body.metadata) ? body.metadata : {}),
  };

  for (const [key, value] of Object.entries(body)) {
    if (
      NEWS_BASE_COLUMNS.includes(key as NewsBaseColumn) ||
      key === "metadata" ||
      key === "created_at" ||
      key === "updated_at"
    ) {
      continue;
    }
    metadata[key] = value;
  }

  for (const [key, value] of Object.entries(metadata)) {
    if (value === undefined) delete metadata[key];
  }

  return metadata;
};

export async function getUserById(db: D1Database, id: string) {
  return parseUserRow(await db.prepare("SELECT * FROM users WHERE id = ? LIMIT 1").bind(String(id)).first());
}

export async function getUserByEmail(db: D1Database, email: string) {
  return parseUserRow(await db.prepare("SELECT * FROM users WHERE lower(email) = lower(?) LIMIT 1").bind(String(email)).first());
}

export async function listUsers(db: D1Database, limit = 100) {
  const { results } = await db
    .prepare("SELECT * FROM users ORDER BY datetime(created_at) DESC LIMIT ?")
    .bind(limit)
    .all();
  return ((results || []) as any[]).map(parseUserRow);
}

export async function createUser(db: D1Database, data: Record<string, any>) {
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
    settings_friends_online:
      data.settings_friends_online === undefined ? null : Number(Boolean(data.settings_friends_online)),
    settings_streak_reminder:
      data.settings_streak_reminder === undefined ? null : Number(Boolean(data.settings_streak_reminder)),
    settings_new_message:
      data.settings_new_message === undefined ? null : Number(Boolean(data.settings_new_message)),
    notify_friend_request:
      data.notify_friend_request === undefined ? 1 : Number(Boolean(data.notify_friend_request)),
    notify_study_group:
      data.notify_study_group === undefined ? 1 : Number(Boolean(data.notify_study_group)),
    notify_news_update:
      data.notify_news_update === undefined ? 1 : Number(Boolean(data.notify_news_update)),
    allow_friend_request:
      data.allow_friend_request === undefined ? 1 : Number(Boolean(data.allow_friend_request)),
    is_public_stats:
      data.is_public_stats === undefined ? 1 : Number(Boolean(data.is_public_stats)),
    is_online_visible:
      data.is_online_visible === undefined ? 1 : Number(Boolean(data.is_online_visible)),
    admin_permissions: maybeJsonStringify(data.admin_permissions ?? []),
    business_name: data.business_name ?? null,
    business_info: maybeJsonStringify(data.business_info),
    ip_address: data.ip_address ?? null,
    mistake_history: maybeJsonStringify(data.mistake_history),
    reset_password_token: data.reset_password_token ?? null,
    reset_password_expires: data.reset_password_expires ?? null,
    last_announcement_at: data.last_announcement_at ?? null,
    tax_id: data.tax_id ?? null,
    xp_points: Number.isFinite(Number(data.xp_points)) ? Number(data.xp_points) : (Number.isFinite(Number(data.xp)) ? Number(data.xp) : 0),
    extra_json: maybeJsonStringify(data.extra_json),
  };

  await db
    .prepare(
      `INSERT INTO users (${USER_COLUMNS.join(", ")}) VALUES (${USER_COLUMNS.map(() => "?").join(", ")})`
    )
    .bind(...USER_COLUMNS.map((column) => row[column]))
    .run();

  return getUserById(db, row.id);
}

export async function updateUser(db: D1Database, id: string, updates: Record<string, any>) {
  const normalized = {
    ...updates,
    updated_at: updates.updated_at ?? nowIso(),
    admin_permissions:
      updates.admin_permissions !== undefined ? maybeJsonStringify(updates.admin_permissions) : undefined,
    business_info: updates.business_info !== undefined ? maybeJsonStringify(updates.business_info) : undefined,
    mistake_history: updates.mistake_history !== undefined ? maybeJsonStringify(updates.mistake_history) : undefined,
    extra_json: updates.extra_json !== undefined ? maybeJsonStringify(updates.extra_json) : undefined,
    settings_friends_online:
      updates.settings_friends_online !== undefined ? Number(Boolean(updates.settings_friends_online)) : undefined,
    settings_streak_reminder:
      updates.settings_streak_reminder !== undefined ? Number(Boolean(updates.settings_streak_reminder)) : undefined,
    settings_new_message:
      updates.settings_new_message !== undefined ? Number(Boolean(updates.settings_new_message)) : undefined,
    notify_friend_request:
      updates.notify_friend_request !== undefined ? Number(Boolean(updates.notify_friend_request)) : undefined,
    notify_study_group:
      updates.notify_study_group !== undefined ? Number(Boolean(updates.notify_study_group)) : undefined,
    notify_news_update:
      updates.notify_news_update !== undefined ? Number(Boolean(updates.notify_news_update)) : undefined,
    allow_friend_request:
      updates.allow_friend_request !== undefined ? Number(Boolean(updates.allow_friend_request)) : undefined,
    is_public_stats:
      updates.is_public_stats !== undefined ? Number(Boolean(updates.is_public_stats)) : undefined,
    is_online_visible:
      updates.is_online_visible !== undefined ? Number(Boolean(updates.is_online_visible)) : undefined,
  };
  const data = pickExisting(normalized, USER_UPDATE_COLUMNS);
  const entries = Object.entries(data);
  if (entries.length === 0) return getUserById(db, id);

  const sql = `UPDATE users SET ${entries.map(([key]) => `${key} = ?`).join(", ")} WHERE id = ?`;
  await db.prepare(sql).bind(...entries.map(([, value]) => value), String(id)).run();
  return getUserById(db, id);
}

export async function deleteUser(db: D1Database, id: string) {
  await db.prepare("DELETE FROM users WHERE id = ?").bind(String(id)).run();
}

export async function touchUserLastActive(db: D1Database, id: string, at = nowIso()) {
  await db
    .prepare("UPDATE users SET last_active_at = ?, updated_at = ? WHERE id = ?")
    .bind(at, at, String(id))
    .run();
}

export async function createSystemLog(
  db: D1Database,
  payload: { action: string; user_id?: string | null; details?: unknown; created_at?: string }
) {
  const id = generateTextId();
  const createdAt = payload.created_at || nowIso();
  const details =
    payload.details === undefined
      ? null
      : typeof payload.details === "string"
        ? payload.details
        : JSON.stringify(payload.details);

  await db
    .prepare("INSERT INTO system_logs (id, action, user_id, details, created_at) VALUES (?, ?, ?, ?, ?)")
    .bind(id, payload.action, payload.user_id ?? null, details, createdAt)
    .run();

  return { id, action: payload.action, user_id: payload.user_id ?? null, details, created_at: createdAt };
}

export async function getNewsById(db: D1Database, id: string) {
  const row = await db.prepare("SELECT * FROM news WHERE id = ? LIMIT 1").bind(String(id)).first();
  return parseNewsRow(row);
}

export async function createNews(db: D1Database, body: Record<string, any>) {
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
    updated_at: updatedAt,
  };

  await db
    .prepare(
      `INSERT INTO news (${NEWS_BASE_COLUMNS.join(", ")}) VALUES (${NEWS_BASE_COLUMNS.map(() => "?").join(", ")})`
    )
    .bind(...NEWS_BASE_COLUMNS.map((column) => row[column]))
    .run();

  return getNewsById(db, row.id);
}

export async function updateNews(db: D1Database, id: string, body: Record<string, any>) {
  const existing = await getNewsById(db, id);
  if (!existing) return null;

  const metadata = mergeNewsMetadata(body, existing.metadata || {});
  const data = pickExisting(
    {
      ...body,
      metadata: Object.keys(metadata).length > 0 ? JSON.stringify(metadata) : null,
      updated_at: body.updated_at || nowIso(),
    },
    NEWS_UPDATE_COLUMNS
  );

  const entries = Object.entries(data);
  if (entries.length === 0) return existing;

  const sql = `UPDATE news SET ${entries.map(([key]) => `${key} = ?`).join(", ")} WHERE id = ?`;
  await db.prepare(sql).bind(...entries.map(([, value]) => value), String(id)).run();
  return getNewsById(db, id);
}

export async function deleteNews(db: D1Database, id: string) {
  await db.prepare("DELETE FROM news WHERE id = ?").bind(String(id)).run();
}

export async function toggleNewsFeatured(db: D1Database, id: string) {
  const existing = await getNewsById(db, id);
  if (!existing) return null;

  const metadata = {
    ...(existing.metadata || {}),
    is_featured: !Boolean(existing.metadata?.is_featured),
  };

  await db
    .prepare("UPDATE news SET metadata = ?, updated_at = ? WHERE id = ?")
    .bind(JSON.stringify(metadata), nowIso(), String(id))
    .run();

  return getNewsById(db, id);
}

const EXAM_ROOM_COLUMNS = [
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
  "background_url",
] as const;

const EXAM_ROOM_PARTICIPANT_COLUMNS = [
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
  "updated_at",
] as const;

const EXAM_RESULT_COLUMNS = [
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
  "updated_at",
] as const;

const EXAM_ROOM_UPDATE_COLUMNS = EXAM_ROOM_COLUMNS.filter((col) => col !== "id");
const EXAM_ROOM_PARTICIPANT_UPDATE_COLUMNS = EXAM_ROOM_PARTICIPANT_COLUMNS.filter((col) => col !== "id");
const EXAM_RESULT_UPDATE_COLUMNS = EXAM_RESULT_COLUMNS.filter((col) => col !== "id");

const parseStructuredValue = <T>(value: unknown, fallback: T): T => {
  if (value === null || value === undefined) return fallback;
  if (typeof value === "string") return safeJsonParse<T>(value, fallback);
  if (typeof value === "object") return value as T;
  return fallback;
};

const maybeJsonStringify = (value: unknown) => {
  if (value === undefined || value === null) return null;
  if (typeof value === "string") return value;
  return JSON.stringify(value);
};

const parseQuestionRow = (row: any) => {
  if (!row) return null;
  const choices = parseStructuredValue<Record<string, string>>(row.choices, { A: "", B: "", C: "", D: "" });
  return {
    ...row,
    choices,
    choice_a: row.choice_a ?? choices.A ?? "",
    choice_b: row.choice_b ?? choices.B ?? "",
    choice_c: row.choice_c ?? choices.C ?? "",
    choice_d: row.choice_d ?? choices.D ?? "",
  };
};

const parseExamRoomRow = (row: any) => {
  if (!row) return null;
  const config = parseStructuredValue<Record<string, any>>(row.config, {});
  const settings = parseStructuredValue<Record<string, any>>(row.settings ?? config.settings, {});
  const questionIds = parseStructuredValue<any[]>(row.question_ids ?? config.question_ids, []);
  const customQuestions = parseStructuredValue<any[] | null>(row.custom_questions ?? config.custom_questions, null);
  const theme = parseStructuredValue<any>(row.theme ?? config.theme, null);

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
    config,
  };
};

const buildExamRoomRow = (data: Record<string, any>) => {
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
    settings: parseStructuredValue<Record<string, any>>(data.settings, {}),
    question_ids: parseStructuredValue<any[]>(data.question_ids, []),
    custom_questions: parseStructuredValue<any[] | null>(data.custom_questions, null),
    theme: parseStructuredValue<any>(data.theme, null),
    theme_color: data.theme_color ?? null,
    background_url: data.background_url ?? null,
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
    background_url: config.background_url,
  };
};

const parseExamRoomParticipantRow = (row: any) => {
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
    answers: parseStructuredValue<any>(row.answers, row.answers ?? null),
    nickname: row.nickname ?? null,
    joined_at: row.joined_at ?? null,
    completed_at: row.completed_at ?? null,
    updated_at: row.updated_at ?? null,
  };
};

const buildExamRoomParticipantRow = (roomId: string, userId: string, data: Record<string, any>, existingId?: string) => {
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
    updated_at: timestamp,
  };
};

const parseExamResultRow = (row: any) => {
  if (!row) return null;
  return {
    ...row,
    id: String(row.id),
    user_id: row.user_id !== null && row.user_id !== undefined ? String(row.user_id) : null,
    classroom_id: row.classroom_id !== null && row.classroom_id !== undefined ? String(row.classroom_id) : null,
    score: Number(row.score ?? 0),
    total_score: Number(row.total_score ?? 0),
    time_taken: Number(row.time_taken ?? 0),
    subject_scores: parseStructuredValue<any>(row.subject_scores, null),
    skill_scores: parseStructuredValue<any>(row.skill_scores, null),
    questions: parseStructuredValue<any>(row.questions, null),
  };
};

const buildExamResultRow = (data: Record<string, any>) => {
  const timestamp = data.created_at || data.taken_at || nowIso();
  return {
    id: String(data.id || generateTextId()),
    user_id: data.user_id !== undefined && data.user_id !== null ? String(data.user_id) : null,
    classroom_id: data.classroom_id !== undefined && data.classroom_id !== null ? String(data.classroom_id) : null,
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
    updated_at: data.updated_at ?? timestamp,
  };
};

export async function getQuestionsByIds(db: D1Database, ids: string[]) {
  if (!ids.length) return [];
  const normalizedIds = Array.from(new Set(ids.map((id) => String(id))));
  const placeholders = normalizedIds.map(() => "?").join(", ");
  const { results } = await db
    .prepare(`SELECT * FROM questions WHERE id IN (${placeholders})`)
    .bind(...normalizedIds)
    .all();
  return (results || []).map(parseQuestionRow);
}

export async function getExamRoomById(db: D1Database, id: string) {
  const row = await db.prepare("SELECT * FROM exam_rooms WHERE id = ? LIMIT 1").bind(String(id)).first();
  return parseExamRoomRow(row);
}

export async function findExamRoomByCode(db: D1Database, code: string) {
  const row = await db.prepare("SELECT * FROM exam_rooms WHERE code = ? LIMIT 1").bind(String(code)).first();
  return parseExamRoomRow(row);
}

export async function listExamRooms(db: D1Database, limit = 100) {
  const { results } = await db
    .prepare("SELECT * FROM exam_rooms ORDER BY datetime(created_at) DESC LIMIT ?")
    .bind(limit)
    .all();
  return (results || []).map(parseExamRoomRow);
}

export async function createExamRoom(db: D1Database, data: Record<string, any>) {
  const row = buildExamRoomRow(data);
  await db
    .prepare(`INSERT INTO exam_rooms (${EXAM_ROOM_COLUMNS.join(", ")}) VALUES (${EXAM_ROOM_COLUMNS.map(() => "?").join(", ")})`)
    .bind(...EXAM_ROOM_COLUMNS.map((column) => row[column]))
    .run();
  return getExamRoomById(db, row.id);
}

export async function updateExamRoom(db: D1Database, id: string, updates: Record<string, any>) {
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

export async function deleteExamRoom(db: D1Database, id: string) {
  await db.prepare("DELETE FROM exam_room_participants WHERE room_id = ?").bind(String(id)).run();
  await db.prepare("DELETE FROM exam_rooms WHERE id = ?").bind(String(id)).run();
}

export async function listExamRoomParticipants(db: D1Database, roomId: string) {
  const { results } = await db
    .prepare("SELECT * FROM exam_room_participants WHERE room_id = ? ORDER BY datetime(joined_at) ASC")
    .bind(String(roomId))
    .all();
  return (results || []).map(parseExamRoomParticipantRow);
}

export async function getExamRoomParticipant(db: D1Database, roomId: string, userId: string) {
  const row = await db
    .prepare("SELECT * FROM exam_room_participants WHERE room_id = ? AND user_id = ? LIMIT 1")
    .bind(String(roomId), String(userId))
    .first();
  return parseExamRoomParticipantRow(row);
}

export async function upsertExamRoomParticipant(db: D1Database, roomId: string, userId: string, updates: Record<string, any>) {
  const existing = await getExamRoomParticipant(db, roomId, userId);
  const row = buildExamRoomParticipantRow(roomId, userId, { ...existing, ...updates }, existing?.id);

  if (existing) {
    const data = pickExisting(row, EXAM_ROOM_PARTICIPANT_UPDATE_COLUMNS);
    const entries = Object.entries(data);
    const sql = `UPDATE exam_room_participants SET ${entries.map(([key]) => `${key} = ?`).join(", ")} WHERE id = ?`;
    await db.prepare(sql).bind(...entries.map(([, value]) => value), existing.id).run();
  } else {
    await db
      .prepare(
        `INSERT INTO exam_room_participants (${EXAM_ROOM_PARTICIPANT_COLUMNS.join(", ")}) VALUES (${EXAM_ROOM_PARTICIPANT_COLUMNS.map(() => "?").join(", ")})`
      )
      .bind(...EXAM_ROOM_PARTICIPANT_COLUMNS.map((column) => row[column]))
      .run();
  }

  return getExamRoomParticipant(db, roomId, userId);
}

export async function deleteExamRoomParticipant(db: D1Database, roomId: string, userId: string) {
  await db
    .prepare("DELETE FROM exam_room_participants WHERE room_id = ? AND user_id = ?")
    .bind(String(roomId), String(userId))
    .run();
}

export async function resetExamRoomParticipants(db: D1Database, roomId: string) {
  const timestamp = nowIso();
  await db
    .prepare(
      "UPDATE exam_room_participants SET score = 0, time_taken = 0, status = 'joined', current_question_index = 0, answers = NULL, completed_at = NULL, updated_at = ? WHERE room_id = ?"
    )
    .bind(timestamp, String(roomId))
    .run();
}

export async function createExamResult(db: D1Database, data: Record<string, any>) {
  const row = buildExamResultRow(data);
  await db
    .prepare(
      `INSERT INTO exam_results (${EXAM_RESULT_COLUMNS.join(", ")}) VALUES (${EXAM_RESULT_COLUMNS.map(() => "?").join(", ")})`
    )
    .bind(...EXAM_RESULT_COLUMNS.map((column) => row[column]))
    .run();
  return getExamResultById(db, row.id);
}

export async function getExamResultById(db: D1Database, id: string) {
  const row = await db.prepare("SELECT * FROM exam_results WHERE id = ? LIMIT 1").bind(String(id)).first();
  return parseExamResultRow(row);
}

export async function listExamResultsByUser(db: D1Database, userId: string, limit?: number) {
  const sql = limit
    ? "SELECT * FROM exam_results WHERE user_id = ? ORDER BY datetime(taken_at) DESC LIMIT ?"
    : "SELECT * FROM exam_results WHERE user_id = ? ORDER BY datetime(taken_at) DESC";
  const stmt = db.prepare(sql);
  const result = limit ? await stmt.bind(String(userId), limit).all() : await stmt.bind(String(userId)).all();
  return ((result.results || []) as any[]).map(parseExamResultRow);
}

export async function updateExamResult(db: D1Database, id: string, updates: Record<string, any>) {
  const existing = await getExamResultById(db, id);
  if (!existing) return null;
  const row = buildExamResultRow({ ...existing, ...updates, id: String(id), created_at: existing.created_at });
  const data = pickExisting(row, EXAM_RESULT_UPDATE_COLUMNS);
  const entries = Object.entries(data);
  const sql = `UPDATE exam_results SET ${entries.map(([key]) => `${key} = ?`).join(", ")} WHERE id = ?`;
  await db.prepare(sql).bind(...entries.map(([, value]) => value), String(id)).run();
  return getExamResultById(db, id);
}

export async function listSeasons(db: D1Database) {
  const { results } = await db
    .prepare("SELECT * FROM seasons ORDER BY datetime(start_date) DESC, datetime(created_at) DESC")
    .all();
  return (results || []) as any[];
}

export async function getSeasonById(db: D1Database, id: string) {
  return (await db.prepare("SELECT * FROM seasons WHERE id = ? LIMIT 1").bind(String(id)).first()) as any;
}

export async function getActiveSeason(db: D1Database) {
  return (await db
    .prepare("SELECT * FROM seasons WHERE status = 'active' ORDER BY datetime(start_date) DESC, datetime(created_at) DESC LIMIT 1")
    .first()) as any;
}

export async function createSeason(db: D1Database, data: Record<string, any>) {
  const now = nowIso();
  const row = {
    id: String(data.id || new Date().getFullYear()),
    name: data.name || `Season ${data.id || new Date().getFullYear()}`,
    start_date: data.start_date || now,
    end_date: data.end_date || null,
    status: data.status || "active",
    responsible_admin_id: data.responsible_admin_id || null,
    created_at: data.created_at || now,
    updated_at: data.updated_at || now,
  };
  await db
    .prepare(
      "INSERT OR REPLACE INTO seasons (id, name, start_date, end_date, status, responsible_admin_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
    )
    .bind(
      row.id,
      row.name,
      row.start_date,
      row.end_date,
      row.status,
      row.responsible_admin_id,
      row.created_at,
      row.updated_at
    )
    .run();
  return getSeasonById(db, row.id);
}

export async function updateSeason(db: D1Database, id: string, updates: Record<string, any>) {
  const existing = await getSeasonById(db, id);
  if (!existing) return null;
  const row = {
    ...existing,
    ...updates,
    id: String(id),
    updated_at: updates.updated_at || nowIso(),
  };
  const allowed = ["name", "start_date", "end_date", "status", "responsible_admin_id", "updated_at"] as const;
  const data = pickExisting(row, allowed);
  const entries = Object.entries(data);
  const sql = `UPDATE seasons SET ${entries.map(([key]) => `${key} = ?`).join(", ")} WHERE id = ?`;
  await db.prepare(sql).bind(...entries.map(([, value]) => value), String(id)).run();
  return getSeasonById(db, id);
}

export async function completeActiveSeasons(db: D1Database, endedAt = nowIso()) {
  await db
    .prepare("UPDATE seasons SET status = 'completed', end_date = ?, updated_at = ? WHERE status = 'active'")
    .bind(endedAt, endedAt)
    .run();
}

export async function getRankingById(db: D1Database, id: string) {
  return (await db.prepare("SELECT * FROM rankings WHERE id = ? LIMIT 1").bind(String(id)).first()) as any;
}

export async function listRankingsBySeason(db: D1Database, seasonId: string, limit = 50) {
  const { results } = await db
    .prepare("SELECT * FROM rankings WHERE season_id = ? ORDER BY total_score DESC, exams_taken DESC, datetime(updated_at) ASC LIMIT ?")
    .bind(String(seasonId), limit)
    .all();
  return (results || []) as any[];
}

export async function upsertRankingScore(db: D1Database, seasonId: string, userId: string, scoreToAdd: number) {
  const id = `${seasonId}_${userId}`;
  const existing = await getRankingById(db, id);
  const updatedAt = nowIso();
  if (existing) {
    const totalScore = (Number(existing.total_score) || 0) + Number(scoreToAdd || 0);
    const examsTaken = (Number(existing.exams_taken) || 0) + 1;
    await db
      .prepare("UPDATE rankings SET total_score = ?, exams_taken = ?, updated_at = ? WHERE id = ?")
      .bind(totalScore, examsTaken, updatedAt, id)
      .run();
  } else {
    await db
      .prepare("INSERT INTO rankings (id, season_id, user_id, total_score, exams_taken, updated_at) VALUES (?, ?, ?, ?, ?, ?)")
      .bind(id, String(seasonId), String(userId), Number(scoreToAdd || 0), 1, updatedAt)
      .run();
  }
  return getRankingById(db, id);
}

const parseMaybeJson = (value: any) =>
  typeof value === "string" ? safeJsonParse<any>(value, value) : value;

const parseQuestionFullRow = (row: any) => {
  const q = parseQuestionRow(row);
  if (!q) return null;
  return {
    ...q,
    catalogs: parseStructuredValue<any[]>(q.catalogs, []),
    exam_year: q.exam_year ?? null,
    exam_set: q.exam_set ?? null,
    skill: q.skill ?? null,
  };
};

export async function listAllQuestions(db: D1Database) {
  const { results } = await db.prepare("SELECT * FROM questions").all();
  return ((results || []) as any[]).map(parseQuestionFullRow);
}

export async function getQuestionById(db: D1Database, id: string) {
  const row = await db.prepare("SELECT * FROM questions WHERE id = ? LIMIT 1").bind(String(id)).first();
  return parseQuestionFullRow(row);
}

export async function createQuestion(db: D1Database, data: Record<string, any>) {
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
    exam_set: data.exam_set ?? null,
  };
  await db
    .prepare(
      "INSERT INTO questions (id, question_text, choices, correct_answer, explanation, category, subject, difficulty, is_custom, host_user_id, created_at, updated_at, catalogs, skill, exam_year, exam_set) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    )
    .bind(
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
    )
    .run();
  return getQuestionById(db, row.id);
}

export async function updateQuestion(db: D1Database, id: string, data: Record<string, any>) {
  const normalized = {
    ...data,
    choices: data.choices !== undefined ? maybeJsonStringify(data.choices) : undefined,
    catalogs: data.catalogs !== undefined ? maybeJsonStringify(data.catalogs) : undefined,
    updated_at: data.updated_at ?? nowIso(),
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
    "exam_set",
  ] as const;
  const entries = Object.entries(pickExisting(normalized, allowed));
  if (!entries.length) return getQuestionById(db, id);
  const sql = `UPDATE questions SET ${entries.map(([key]) => `${key} = ?`).join(", ")} WHERE id = ?`;
  await db.prepare(sql).bind(...entries.map(([, value]) => value), String(id)).run();
  return getQuestionById(db, id);
}

export async function deleteQuestion(db: D1Database, id: string) {
  await db.prepare("DELETE FROM questions WHERE id = ?").bind(String(id)).run();
}

export async function listBookmarksByUser(db: D1Database, userId: string) {
  const { results } = await db
    .prepare("SELECT * FROM bookmarks WHERE user_id = ? ORDER BY datetime(created_at) DESC")
    .bind(String(userId))
    .all();
  return (results || []) as any[];
}

export async function createBookmark(db: D1Database, data: Record<string, any>) {
  const row = {
    id: String(data.id || generateTextId()),
    user_id: String(data.user_id),
    question_id: data.question_id ?? data.target_id ?? null,
    note: data.note ?? data.title ?? null,
    created_at: data.created_at ?? nowIso(),
    target_type: data.target_type ?? null,
    target_id: data.target_id ?? null,
    title: data.title ?? null,
  };
  await db
    .prepare("INSERT INTO bookmarks (id, user_id, question_id, note, created_at, target_type, target_id, title) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
    .bind(row.id, row.user_id, row.question_id, row.note, row.created_at, row.target_type, row.target_id, row.title)
    .run();
  return row;
}

export async function getBookmarkById(db: D1Database, id: string) {
  return (await db.prepare("SELECT * FROM bookmarks WHERE id = ? LIMIT 1").bind(String(id)).first()) as any;
}

export async function deleteBookmark(db: D1Database, id: string) {
  await db.prepare("DELETE FROM bookmarks WHERE id = ?").bind(String(id)).run();
}

const parseMessageRow = (row: any) => row ? ({ ...row, is_read: Boolean(Number(row.is_read ?? 0)) }) : null;
export async function listDirectMessagesForUser(db: D1Database, userId: string) {
  const { results } = await db
    .prepare("SELECT * FROM messages WHERE sender_id = ? OR receiver_id = ? ORDER BY datetime(created_at) ASC")
    .bind(String(userId), String(userId))
    .all();
  return ((results || []) as any[]).map(parseMessageRow);
}

export async function listReceivedMessages(db: D1Database, userId: string) {
  const { results } = await db
    .prepare("SELECT * FROM messages WHERE receiver_id = ? ORDER BY datetime(created_at) DESC")
    .bind(String(userId))
    .all();
  return ((results || []) as any[]).map(parseMessageRow);
}

export async function createDirectMessage(db: D1Database, data: Record<string, any>) {
  const row = {
    id: String(data.id || generateTextId()),
    room_id: data.room_id ?? null,
    sender_id: String(data.sender_id),
    text: data.text ?? data.content ?? null,
    created_at: data.created_at ?? nowIso(),
    receiver_id: String(data.receiver_id),
    content: data.content ?? data.text ?? "",
    is_read: Number(Boolean(data.is_read)),
  };
  await db
    .prepare("INSERT INTO messages (id, room_id, sender_id, text, created_at, receiver_id, content, is_read) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
    .bind(row.id, row.room_id, row.sender_id, row.text, row.created_at, row.receiver_id, row.content, row.is_read)
    .run();
  return parseMessageRow(row);
}

export async function markMessagesRead(db: D1Database, receiverId: string, senderId?: string) {
  if (senderId) {
    await db
      .prepare("UPDATE messages SET is_read = 1 WHERE receiver_id = ? AND sender_id = ? AND COALESCE(is_read,0) = 0")
      .bind(String(receiverId), String(senderId))
      .run();
  } else {
    await db.prepare("UPDATE messages SET is_read = 1 WHERE receiver_id = ?").bind(String(receiverId)).run();
  }
}

export async function listFriendsByUser(db: D1Database, userId: string) {
  const { results } = await db
    .prepare("SELECT * FROM friends WHERE requester_id = ? OR target_id = ? OR user_id1 = ? OR user_id2 = ?")
    .bind(String(userId), String(userId), String(userId), String(userId))
    .all();
  return (results || []) as any[];
}

export async function createFriendRequest(db: D1Database, requesterId: string, targetId: string) {
  const row = {
    id: generateTextId(),
    user_id1: requesterId,
    user_id2: targetId,
    status: "pending",
    created_at: nowIso(),
    updated_at: nowIso(),
    requester_id: requesterId,
    target_id: targetId,
  };
  await db
    .prepare("INSERT INTO friends (id, user_id1, user_id2, status, created_at, updated_at, requester_id, target_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
    .bind(row.id, row.user_id1, row.user_id2, row.status, row.created_at, row.updated_at, row.requester_id, row.target_id)
    .run();
  return row;
}

export async function updateFriend(db: D1Database, id: string, updates: Record<string, any>) {
  const normalized = { ...updates, updated_at: updates.updated_at ?? nowIso() };
  const allowed = ["status", "updated_at"] as const;
  const entries = Object.entries(pickExisting(normalized, allowed));
  const sql = `UPDATE friends SET ${entries.map(([key]) => `${key} = ?`).join(", ")} WHERE id = ?`;
  await db.prepare(sql).bind(...entries.map(([, value]) => value), String(id)).run();
}

export async function deleteFriend(db: D1Database, id: string) {
  await db.prepare("DELETE FROM friends WHERE id = ?").bind(String(id)).run();
}

const parseNotificationRow = (row: any) => row ? ({ ...row, is_read: Boolean(Number(row.is_read ?? 0)), data: parseMaybeJson(row.data) }) : null;
export async function listNotificationsByUser(db: D1Database, userId: string, limit = 50) {
  const { results } = await db
    .prepare("SELECT * FROM notifications WHERE user_id = ? ORDER BY datetime(created_at) DESC LIMIT ?")
    .bind(String(userId), limit)
    .all();
  return ((results || []) as any[]).map(parseNotificationRow);
}

export async function markNotificationRead(db: D1Database, id: string) {
  await db.prepare("UPDATE notifications SET is_read = 1 WHERE id = ?").bind(String(id)).run();
}

export async function markAllNotificationsRead(db: D1Database, userId: string) {
  await db.prepare("UPDATE notifications SET is_read = 1 WHERE user_id = ?").bind(String(userId)).run();
}

const parseThreadRow = (row: any) =>
  row
    ? {
        ...row,
        user_id: row.user_id ?? row.author_id,
        author_id: row.author_id ?? row.user_id,
        tags: parseStructuredValue<any[]>(row.tags, []),
        stats: parseStructuredValue<any>(row.stats, row.stats ?? null),
      }
    : null;

export async function listThreads(db: D1Database, limit = 100) {
  const { results } = await db.prepare("SELECT * FROM threads ORDER BY datetime(created_at) DESC LIMIT ?").bind(limit).all();
  return ((results || []) as any[]).map(parseThreadRow);
}

export async function listThreadsByUser(db: D1Database, userId: string) {
  const { results } = await db
    .prepare("SELECT * FROM threads WHERE COALESCE(user_id, author_id) = ? ORDER BY datetime(created_at) DESC")
    .bind(String(userId))
    .all();
  return ((results || []) as any[]).map(parseThreadRow);
}

export async function getThreadById(db: D1Database, id: string) {
  const row = await db.prepare("SELECT * FROM threads WHERE id = ? LIMIT 1").bind(String(id)).first();
  return parseThreadRow(row);
}

export async function createThread(db: D1Database, data: Record<string, any>) {
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
    deleted_at: data.deleted_at ?? null,
  };
  await db
    .prepare("INSERT INTO threads (id, author_id, title, content, category, likes, created_at, updated_at, user_id, tags, background_style, image_url, views, stats, deleted_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
    .bind(row.id, row.author_id, row.title, row.content, row.category, row.likes, row.created_at, row.updated_at, row.user_id, row.tags, row.background_style, row.image_url, row.views, row.stats, row.deleted_at)
    .run();
  return getThreadById(db, row.id);
}

export async function deleteThread(db: D1Database, id: string) {
  await db.prepare("DELETE FROM threads WHERE id = ?").bind(String(id)).run();
}

const parseCommentRow = (row: any) => row ? ({ ...row, user_id: row.user_id ?? row.author_id, author_id: row.author_id ?? row.user_id }) : null;
export async function listCommentsByThread(db: D1Database, threadId: string) {
  const { results } = await db
    .prepare("SELECT * FROM comments WHERE thread_id = ? ORDER BY datetime(created_at) ASC")
    .bind(String(threadId))
    .all();
  return ((results || []) as any[]).map(parseCommentRow);
}

export async function createComment(db: D1Database, data: Record<string, any>) {
  const row = {
    id: String(data.id || generateTextId()),
    thread_id: String(data.thread_id),
    author_id: String(data.author_id ?? data.user_id),
    content: data.content ?? "",
    likes: Number(data.likes ?? 0),
    created_at: data.created_at ?? nowIso(),
    updated_at: data.updated_at ?? data.created_at ?? nowIso(),
    user_id: String(data.user_id ?? data.author_id),
    parent_id: data.parent_id ?? null,
  };
  await db
    .prepare("INSERT INTO comments (id, thread_id, author_id, content, likes, created_at, updated_at, user_id, parent_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)")
    .bind(row.id, row.thread_id, row.author_id, row.content, row.likes, row.created_at, row.updated_at, row.user_id, row.parent_id)
    .run();
  return parseCommentRow(row);
}

export async function getCommentById(db: D1Database, id: string) {
  const row = await db.prepare("SELECT * FROM comments WHERE id = ? LIMIT 1").bind(String(id)).first();
  return parseCommentRow(row);
}

export async function updateComment(db: D1Database, id: string, updates: Record<string, any>) {
  const normalized = { ...updates, updated_at: updates.updated_at ?? nowIso() };
  const allowed = ["content", "likes", "updated_at"] as const;
  const entries = Object.entries(pickExisting(normalized, allowed));
  const sql = `UPDATE comments SET ${entries.map(([key]) => `${key} = ?`).join(", ")} WHERE id = ?`;
  await db.prepare(sql).bind(...entries.map(([, value]) => value), String(id)).run();
  return getCommentById(db, id);
}

export async function listPaymentPlans(db: D1Database) {
  const { results } = await db.prepare("SELECT * FROM payment_plans ORDER BY COALESCE(display_order,0) ASC, price ASC").all();
  return ((results || []) as any[]).map((row) => ({ ...row, features: parseStructuredValue<any>(row.features, row.features ?? []) }));
}

export async function getPaymentPlanById(db: D1Database, id: string) {
  const row = await db.prepare("SELECT * FROM payment_plans WHERE id = ? LIMIT 1").bind(String(id)).first();
  return row ? { ...row, features: parseStructuredValue<any>(row.features, row.features ?? []) } : null;
}

export async function createPaymentPlan(db: D1Database, data: Record<string, any>) {
  const row = {
    id: String(data.id || generateTextId()),
    name: data.name ?? "",
    price: Number(data.price ?? 0),
    duration_days: Number(data.duration_days ?? 0),
    features: maybeJsonStringify(data.features ?? []),
    created_at: data.created_at ?? nowIso(),
    updated_at: data.updated_at ?? data.created_at ?? nowIso(),
    description: data.description ?? null,
    is_active: data.is_active === undefined ? 1 : Number(Boolean(data.is_active)),
    display_order: Number(data.display_order ?? 0),
  };
  await db
    .prepare("INSERT INTO payment_plans (id, name, price, duration_days, features, created_at, updated_at, description, is_active, display_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
    .bind(row.id, row.name, row.price, row.duration_days, row.features, row.created_at, row.updated_at, row.description, row.is_active, row.display_order)
    .run();
  return getPaymentPlanById(db, row.id);
}

export async function updatePaymentPlan(db: D1Database, id: string, updates: Record<string, any>) {
  const normalized = {
    ...updates,
    features: updates.features !== undefined ? maybeJsonStringify(updates.features) : undefined,
    is_active: updates.is_active !== undefined ? Number(Boolean(updates.is_active)) : undefined,
    updated_at: updates.updated_at ?? nowIso(),
  };
  const allowed = ["name", "price", "duration_days", "features", "updated_at", "description", "is_active", "display_order"] as const;
  const entries = Object.entries(pickExisting(normalized, allowed));
  const sql = `UPDATE payment_plans SET ${entries.map(([key]) => `${key} = ?`).join(", ")} WHERE id = ?`;
  await db.prepare(sql).bind(...entries.map(([, value]) => value), String(id)).run();
}

export async function deletePaymentPlan(db: D1Database, id: string) {
  await db.prepare("DELETE FROM payment_plans WHERE id = ?").bind(String(id)).run();
}

export async function createTransaction(db: D1Database, data: Record<string, any>) {
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
    type: data.type ?? null,
  };
  await db
    .prepare("INSERT INTO transactions (id, user_id, plan_id, amount, status, session_id, created_at, updated_at, payment_method, type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
    .bind(row.id, row.user_id, row.plan_id, row.amount, row.status, row.session_id, row.created_at, row.updated_at, row.payment_method, row.type)
    .run();
  return row;
}

export async function listAssets(db: D1Database) {
  const { results } = await db.prepare("SELECT * FROM assets ORDER BY datetime(created_at) DESC").all();
  return (results || []) as any[];
}

export async function createAsset(db: D1Database, data: Record<string, any>) {
  const row = {
    id: String(data.id || generateTextId()),
    name: data.name ?? "",
    type: data.type ?? "",
    url: data.url ?? "",
    is_premium: Number(Boolean(data.is_premium)),
    created_at: data.created_at ?? nowIso(),
    updated_at: data.updated_at ?? data.created_at ?? nowIso(),
  };
  await db
    .prepare("INSERT INTO assets (id, name, type, url, is_premium, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)")
    .bind(row.id, row.name, row.type, row.url, row.is_premium, row.created_at, row.updated_at)
    .run();
  return row;
}

export async function deleteAsset(db: D1Database, id: string) {
  await db.prepare("DELETE FROM assets WHERE id = ?").bind(String(id)).run();
}

export async function getSystemConfig(db: D1Database, id: string) {
  const row = await db.prepare("SELECT value FROM system_config WHERE id = ? LIMIT 1").bind(String(id)).first() as any;
  return row?.value ? parseStructuredValue<any>(row.value, {}) : null;
}

export async function upsertSystemConfig(db: D1Database, id: string, value: any) {
  await db
    .prepare("INSERT OR REPLACE INTO system_config (id, value) VALUES (?, ?)")
    .bind(String(id), JSON.stringify(value ?? {}))
    .run();
}

const parseBusinessRow = (row: any) => row ? ({ ...row, stats: parseStructuredValue<any>(row.stats, row.stats ?? null) }) : null;
export async function listBusinesses(db: D1Database, limit = 100) {
  const { results } = await db.prepare("SELECT * FROM businesses ORDER BY datetime(created_at) DESC LIMIT ?").bind(limit).all();
  return ((results || []) as any[]).map(parseBusinessRow);
}

export async function getBusinessById(db: D1Database, id: string) {
  const row = await db.prepare("SELECT * FROM businesses WHERE id = ? LIMIT 1").bind(String(id)).first();
  return parseBusinessRow(row);
}

export async function getBusinessByOwner(db: D1Database, ownerUid: string) {
  const row = await db.prepare("SELECT * FROM businesses WHERE owner_uid = ? LIMIT 1").bind(String(ownerUid)).first();
  return parseBusinessRow(row);
}

export async function createBusiness(db: D1Database, data: Record<string, any>) {
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
    updated_at: data.updated_at ?? data.created_at ?? nowIso(),
  };
  await db
    .prepare("INSERT INTO businesses (id, owner_uid, name, tagline, about, category, contact_link, contact_line_id, contact_facebook_url, status, logo_image, stats, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
    .bind(row.id, row.owner_uid, row.name, row.tagline, row.about, row.category, row.contact_link, row.contact_line_id, row.contact_facebook_url, row.status, row.logo_image, row.stats, row.created_at, row.updated_at)
    .run();
  return getBusinessById(db, row.id);
}

export async function updateBusiness(db: D1Database, id: string, updates: Record<string, any>) {
  const normalized = { ...updates, stats: updates.stats !== undefined ? maybeJsonStringify(updates.stats) : undefined, updated_at: updates.updated_at ?? nowIso() };
  const allowed = ["name", "tagline", "about", "category", "contact_link", "contact_line_id", "contact_facebook_url", "status", "logo_image", "stats", "updated_at"] as const;
  const entries = Object.entries(pickExisting(normalized, allowed));
  const sql = `UPDATE businesses SET ${entries.map(([key]) => `${key} = ?`).join(", ")} WHERE id = ?`;
  await db.prepare(sql).bind(...entries.map(([, value]) => value), String(id)).run();
  return getBusinessById(db, id);
}

export async function deleteBusiness(db: D1Database, id: string) {
  await db.prepare("DELETE FROM businesses WHERE id = ?").bind(String(id)).run();
}

export async function listBusinessPosts(db: D1Database, businessId?: string, limit = 50) {
  if (businessId) {
    const { results } = await db
      .prepare("SELECT * FROM business_posts WHERE business_id = ? ORDER BY datetime(created_at) DESC LIMIT ?")
      .bind(String(businessId), limit)
      .all();
    return (results || []) as any[];
  }
  const { results } = await db.prepare("SELECT * FROM business_posts ORDER BY datetime(created_at) DESC LIMIT ?").bind(limit).all();
  return (results || []) as any[];
}

export async function listTickets(db: D1Database, userId?: string) {
  const result = userId
    ? await db.prepare("SELECT * FROM tickets WHERE user_id = ? ORDER BY datetime(created_at) DESC").bind(String(userId)).all()
    : await db.prepare("SELECT * FROM tickets ORDER BY datetime(created_at) DESC").all();
  return (result.results || []) as any[];
}

export async function getTicketById(db: D1Database, id: string) {
  return (await db.prepare("SELECT * FROM tickets WHERE id = ? LIMIT 1").bind(String(id)).first()) as any;
}

export async function createTicket(db: D1Database, data: Record<string, any>) {
  const row = {
    id: String(data.id || generateTextId()),
    user_id: data.user_id ?? null,
    subject: data.subject ?? "",
    status: data.status ?? "open",
    created_at: data.created_at ?? nowIso(),
    updated_at: data.updated_at ?? data.created_at ?? nowIso(),
    ticket_id: data.ticket_id ?? data.id ?? null,
    description: data.description ?? null,
    category: data.category ?? null,
  };
  await db
    .prepare("INSERT INTO tickets (id, user_id, subject, status, created_at, updated_at, ticket_id, description, category) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)")
    .bind(row.id, row.user_id, row.subject, row.status, row.created_at, row.updated_at, row.ticket_id, row.description, row.category)
    .run();
  return row;
}

export async function updateTicket(db: D1Database, id: string, updates: Record<string, any>) {
  const normalized = { ...updates, updated_at: updates.updated_at ?? nowIso() };
  const allowed = ["subject", "status", "updated_at", "description", "category"] as const;
  const entries = Object.entries(pickExisting(normalized, allowed));
  const sql = `UPDATE tickets SET ${entries.map(([key]) => `${key} = ?`).join(", ")} WHERE id = ?`;
  await db.prepare(sql).bind(...entries.map(([, value]) => value), String(id)).run();
}

export async function listTicketMessages(db: D1Database, ticketId: string) {
  const { results } = await db
    .prepare("SELECT * FROM ticket_messages WHERE ticket_id = ? ORDER BY datetime(created_at) ASC")
    .bind(String(ticketId))
    .all();
  return (results || []) as any[];
}

export async function createTicketMessage(db: D1Database, ticketId: string, data: Record<string, any>) {
  const row = {
    id: String(data.id || generateTextId()),
    ticket_id: String(ticketId),
    sender_id: String(data.sender_id ?? data.user_id ?? "anonymous"),
    message: data.message ?? "",
    is_admin: Number(Boolean(data.is_admin || data.is_internal_note)),
    created_at: data.created_at ?? nowIso(),
  };
  await db
    .prepare("INSERT INTO ticket_messages (id, ticket_id, sender_id, message, is_admin, created_at) VALUES (?, ?, ?, ?, ?, ?)")
    .bind(row.id, row.ticket_id, row.sender_id, row.message, row.is_admin, row.created_at)
    .run();
  return row;
}

export async function listPayments(db: D1Database, userId?: string, limit = 200) {
  const result = userId
    ? await db.prepare("SELECT * FROM payments WHERE user_id = ? ORDER BY datetime(created_at) DESC LIMIT ?").bind(String(userId), limit).all()
    : await db.prepare("SELECT * FROM payments ORDER BY datetime(created_at) DESC LIMIT ?").bind(limit).all();
  return ((result.results || []) as any[]).map((row) => ({ ...row, metadata: parseMaybeJson(row.metadata) }));
}
