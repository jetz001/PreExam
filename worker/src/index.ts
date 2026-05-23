import { RealtimeDO, type Env } from "./realtime";
import { requireUserId, signJwtHs256 } from "./auth";
import { hashPassword, verifyPassword } from "./password";
import { FirestoreClient, parseServiceAccount } from "./firestore";

export { RealtimeDO };

const withCors = (res: Response) => {
  const headers = new Headers(res.headers);
  headers.set("access-control-allow-origin", "*");
  headers.set("access-control-allow-methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  headers.set("access-control-allow-headers", "content-type,authorization");
  return new Response(res.body, { ...res, headers });
};

const json = (body: unknown, init?: ResponseInit) => withCors(Response.json(body, init));

const readJson = async (req: Request) => {
  const contentType = req.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) return null;
  try {
    return await req.json();
  } catch {
    return null;
  }
};

const notFound = () => json({ error: "not_found" }, { status: 404 });

const requireJwtSecret = (env: Env) => {
  const secret = (env as any).JWT_SECRET as string | undefined;
  if (!secret) return null;
  return secret;
};

const requireAuthUserId = async (req: Request, env: Env) => {
  const secret = requireJwtSecret(env);
  if (!secret) return { error: json({ error: "missing_jwt_secret" }, { status: 500 }) };
  const userId = await requireUserId(req, secret);
  if (!userId) return { error: json({ error: "unauthorized" }, { status: 401 }) };
  return { userId };
};

const oneDayAgoIso = () => new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

const sanitizeUser = (row: any) => {
  if (!row) return null;
  return {
    id: row.id,
    email: row.email,
    display_name: row.display_name,
    role: row.role,
    plan_type: row.plan_type,
    status: row.status,
  };
};

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return withCors(new Response(null, { status: 204 }));
    }

    if (url.pathname === "/api/health") {
      return json({ ok: true });
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
      const email = String((body as any).email || "").trim().toLowerCase();
      const password = String((body as any).password || "");
      const displayName = String((body as any).display_name || (body as any).displayName || "").trim();
      if (!email || !password || password.length < 6 || !displayName) {
        return json({ success: false, message: "invalid_params" }, { status: 400 });
      }

      const existingUsers = await firestore.runQuery({
        from: [{ collectionId: "users" }],
        where: { fieldFilter: { field: { fieldPath: "email" }, op: "EQUAL", value: { stringValue: email } } },
        limit: 1,
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
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30;
      const token = await signJwtHs256({ id: user.id, exp }, secret);
      return json({ success: true, token, user: sanitizeUser(user) });
    }

    if (url.pathname === "/api/auth/login" && request.method === "POST") {
      const secret = requireJwtSecret(env);
      if (!secret) return json({ error: "missing_jwt_secret" }, { status: 500 });

      const body = await readJson(request);
      if (!body) return json({ success: false, message: "invalid_body" }, { status: 400 });
      const email = String((body as any).email || "").trim().toLowerCase();
      const password = String((body as any).password || "");
      if (!email || !password) return json({ success: false, message: "invalid_params" }, { status: 400 });

      const users = await firestore.runQuery({
        from: [{ collectionId: "users" }],
        where: { fieldFilter: { field: { fieldPath: "email" }, op: "EQUAL", value: { stringValue: email } } },
        limit: 1,
      });

      const user = users[0];
      if (!user || !user.password_hash) return json({ success: false, message: "Invalid credentials" }, { status: 401 });
      const ok = await verifyPassword(password, String(user.password_hash));
      if (!ok) return json({ success: false, message: "Invalid credentials" }, { status: 401 });

      const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30;
      const token = await signJwtHs256({ id: user.id, exp }, secret);
      return json({ success: true, token, user: sanitizeUser(user) });
    }

    if (url.pathname === "/api/auth/guest" && request.method === "POST") {
      const secret = requireJwtSecret(env);
      if (!secret) return json({ error: "missing_jwt_secret" }, { status: 500 });

      const body = await readJson(request);
      if (!body) return json({ success: false, message: "invalid_body" }, { status: 400 });
      const deviceId = String((body as any).deviceId || "").trim();
      if (!deviceId) return json({ success: false, message: "invalid_params" }, { status: 400 });

      const email = `guest_${deviceId}@guest.local`;
      const users = await firestore.runQuery({
        from: [{ collectionId: "users" }],
        where: { fieldFilter: { field: { fieldPath: "email" }, op: "EQUAL", value: { stringValue: email } } },
        limit: 1,
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
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }

      const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30;
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
        from: [{ collectionId: "rooms" }],
        orderBy: [{ field: { fieldPath: "created_at" }, direction: "DESCENDING" }],
        limit: 100, // Fetch up to 100 to filter in memory
      });

      const oneDayAgo = oneDayAgoIso();
      const filteredRooms = recentRooms.filter((r) => {
        return r.status === "waiting" || r.status === "in_progress" || (r.status === "finished" && r.updated_at >= oneDayAgo);
      });

      const total = filteredRooms.length;
      const offset = (page - 1) * limit;
      const rooms = filteredRooms.slice(offset, offset + limit);

      if (rooms.length === 0) {
        return json({ success: true, data: [], pagination: { total, page, totalPages: Math.ceil(total / limit) } });
      }

      // Fetch participants to count
      const roomIds = rooms.map((r) => r.id);
      const participantCounts = new Map<string, number>();

      for (const rId of roomIds) {
        const parts = await firestore.runQuery({
          from: [{ collectionId: "room_participants" }],
          where: { fieldFilter: { field: { fieldPath: "room_id" }, op: "EQUAL", value: { stringValue: rId } } },
        });
        participantCounts.set(rId, parts.length);
      }

      const data = rooms.map((r) => ({
        ...r,
        password: undefined,
        participant_count: participantCounts.get(r.id) || 0,
        RoomParticipants: [],
      }));

      return json({
        success: true,
        data,
        pagination: { total, page, totalPages: Math.ceil(total / limit) },
      });
    }

    if (url.pathname === "/api/rooms" && request.method === "POST") {
      const auth = await requireAuthUserId(request, env);
      if ("error" in auth) return auth.error;

      const body = await readJson(request);
      if (!body) return json({ success: false, message: "invalid_body" }, { status: 400 });

      const name = String((body as any).name || "").trim();
      const mode = String((body as any).mode || "").trim();
      if (!name || !["exam", "tutor", "event"].includes(mode)) {
        return json({ success: false, message: "invalid_params" }, { status: 400 });
      }

      const subject = (body as any).subject ? String((body as any).subject) : null;
      const category = (body as any).category ? String((body as any).category) : null;
      const maxParticipants = Math.min(20, Math.max(2, Number((body as any).max_participants || 20)));
      const questionCount = Math.max(1, Math.min(200, Number((body as any).question_count || 20)));
      const timeLimit = Math.max(5, Math.min(60, Number((body as any).time_limit || 60)));
      const password = (body as any).password ? String((body as any).password) : null;

      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      const settings = JSON.stringify({ time_limit: timeLimit });

      const room = await firestore.createDocument("rooms", {
        code,
        name,
        mode,
        host_user_id: auth.userId,
        subject,
        category,
        max_participants: maxParticipants,
        question_count: questionCount,
        status: "waiting",
        settings,
        password,
        question_ids: "[]",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      await firestore.createDocument("room_participants", {
        room_id: room.id,
        user_id: auth.userId,
        score: 0,
        status: "joined",
        current_question_index: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      return json({ success: true, data: room }, { status: 201 });
    }

    if (url.pathname === "/api/rooms/join" && request.method === "POST") {
      const auth = await requireAuthUserId(request, env);
      if ("error" in auth) return auth.error;

      const body = await readJson(request);
      if (!body) return json({ success: false, message: "invalid_body" }, { status: 400 });
      const code = String((body as any).code || "").trim().toUpperCase();
      const password = (body as any).password ? String((body as any).password) : null;
      if (!code) return json({ success: false, message: "invalid_params" }, { status: 400 });

      const rooms = await firestore.runQuery({
        from: [{ collectionId: "rooms" }],
        where: { fieldFilter: { field: { fieldPath: "code" }, op: "EQUAL", value: { stringValue: code } } },
        limit: 1,
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

      // Check if already joined
      const existingPart = await firestore.runQuery({
        from: [{ collectionId: "room_participants" }],
        where: {
          compositeFilter: {
            op: "AND",
            filters: [
              { fieldFilter: { field: { fieldPath: "room_id" }, op: "EQUAL", value: { stringValue: room.id } } },
              { fieldFilter: { field: { fieldPath: "user_id" }, op: "EQUAL", value: { stringValue: auth.userId } } },
            ],
          },
        },
        limit: 1,
      });

      if (existingPart.length === 0) {
        await firestore.createDocument("room_participants", {
          room_id: room.id,
          user_id: auth.userId,
          score: 0,
          status: "joined",
          current_question_index: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }

      return json({ success: true, data: { ...room, password: undefined } });
    }

    const roomIdMatch = url.pathname.match(/^\/api\/rooms\/([a-zA-Z0-9_-]+)$/);
    if (roomIdMatch && request.method === "GET") {
      const auth = await requireAuthUserId(request, env);
      if ("error" in auth) return auth.error;

      const roomId = roomIdMatch[1];
      const room = await firestore.getDocument("rooms", roomId);
      if (!room) return json({ success: false, message: "Room not found" }, { status: 404 });

      const participants = await firestore.runQuery({
        from: [{ collectionId: "room_participants" }],
        where: { fieldFilter: { field: { fieldPath: "room_id" }, op: "EQUAL", value: { stringValue: roomId } } },
      });

      // Sort by score DESC, updated_at ASC
      participants.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
      });

      return json({
        success: true,
        data: {
          ...room,
          password: undefined,
          Host: { id: room.host_user_id, display_name: null },
          RoomParticipants: participants,
          questions: [],
        },
      });
    }

    if (roomIdMatch && request.method === "DELETE") {
      const auth = await requireAuthUserId(request, env);
      if ("error" in auth) return auth.error;

      const roomId = roomIdMatch[1];
      const room = await firestore.getDocument("rooms", roomId);
      if (!room) return json({ success: true, message: "Room already deleted or not found" });

      if (String(room.host_user_id) !== auth.userId) {
        return json({ success: false, message: "Not authorized to delete this room" }, { status: 403 });
      }

      const participants = await firestore.runQuery({
        from: [{ collectionId: "room_participants" }],
        where: { fieldFilter: { field: { fieldPath: "room_id" }, op: "EQUAL", value: { stringValue: roomId } } },
      });

      for (const p of participants) {
        await firestore.deleteDocument("room_participants", p.id);
      }
      await firestore.deleteDocument("rooms", roomId);
      return json({ success: true, message: "Room deleted successfully" });
    }

    if (url.pathname === "/api/questions" && request.method === "GET") {
      try {
        const limitStr = url.searchParams.get("limit") || "100";
        const limit = parseInt(limitStr, 10);
        
        const questions = await firestore.runQuery({
          from: [{ collectionId: "questions" }],
          limit,
        });

        return json({
          success: true,
          data: {
            rows: questions,
            total: questions.length,
            page: 1,
            totalPages: 1,
          },
        });
      } catch (err: any) {
        return json({ success: false, message: err.message }, { status: 500 });
      }
    }

    return notFound();
  },
};
