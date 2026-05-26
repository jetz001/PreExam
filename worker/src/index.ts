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
  return new Response(res.body, { status: res.status, statusText: res.statusText, headers });
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
    avatar: row.avatar || null,
    role: row.role,
    plan_type: row.plan_type,
    status: row.status,
  };
};

const normalizeQuestion = (q: any) => {
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
};

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return withCors(new Response(null, { status: 204 }));
    }

    if (url.pathname === "/api/health") {
      const saConfig = parseServiceAccount(env);
      if (!saConfig) return json({ error: "missing_firebase_config" }, { status: 500 });
      const firestore = new FirestoreClient(saConfig);
      const user6 = await firestore.getDocument("users", "6");
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

    // /api/auth/guest
    if (url.pathname === "/api/auth/guest" && request.method === "POST") {
      const body = (await readJson(request)) as any;
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
      } else {
        const shortId = deviceId.slice(-5) + Math.floor(100 + Math.random() * 900);
        user = await firestore.createDocument("users", {
          email,
          display_name: `Guest-${shortId}`,
          role: "user",
          plan_type: "free",
          created_at: new Date().toISOString()
        });
      }

      const token = await signJwtHs256({ id: user.id, email: user.email, role: user.role }, env.JWT_SECRET || "default_secret");
      return json({ success: true, token, user: sanitizeUser(user) });
    }

    // /api/auth/google
    if (url.pathname === "/api/auth/google" && request.method === "POST") {
      const body = (await readJson(request)) as any;
      if (!body || !body.token) return json({ success: false, message: "invalid_body" }, { status: 400 });

      const tokenStr = body.token;

      // Verify token using Google tokeninfo endpoint
      const googleRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${tokenStr}`);
      if (!googleRes.ok) return json({ success: false, message: "Google login failed" }, { status: 400 });

      const ticket = await googleRes.json() as any;
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
        if (picture && user.avatar !== picture) {
          await firestore.updateDocument("users", user.id, { avatar: picture });
        }
      } else {
        const existingByEmail = await firestore.runQuery({
          from: [{ collectionId: "users" }],
          where: { fieldFilter: { field: { fieldPath: "email" }, op: "EQUAL", value: { stringValue: email } } },
          limit: 1
        });
        if (existingByEmail.length > 0) {
          user = existingByEmail[0];
          const updates: any = { google_id: googleId };
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
            created_at: new Date().toISOString()
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
        from: [{ collectionId: "exam_rooms" }],
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
        const parts = await firestore.listDocuments(`exam_rooms/${rId}/participants`);
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

      // Fetch random questions based on criteria
      const filters: any[] = [];
      if (subject) filters.push({ fieldFilter: { field: { fieldPath: "subject" }, op: "EQUAL", value: { stringValue: subject } } });
      if (category) filters.push({ fieldFilter: { field: { fieldPath: "category" }, op: "EQUAL", value: { stringValue: category } } });

      let query: any = { from: [{ collectionId: "questions" }] };
      if (filters.length === 1) query.where = filters[0];
      else if (filters.length > 1) query.where = { compositeFilter: { op: "AND", filters } };

      let selectedIds: string[] = [];
      try {
        const allQs = await firestore.runQuery(query);
        // Shuffle and pick
        const shuffled = allQs.sort(() => Math.random() - 0.5);
        selectedIds = shuffled.slice(0, questionCount).map((q: any) => q.id);
      } catch (e) {
        // Fallback or empty if query fails
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
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      await firestore.createDocument(`exam_rooms/${room.id}/participants`, {
        user_id: auth.userId,
        score: 0,
        status: "joined",
        current_question_index: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, auth.userId);

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
        from: [{ collectionId: "exam_rooms" }],
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
      const existingPart = await firestore.getDocument(`exam_rooms/${room.id}/participants`, auth.userId);

      if (!existingPart) {
        await firestore.createDocument(`exam_rooms/${room.id}/participants`, {
          user_id: auth.userId,
          score: 0,
          status: "joined",
          current_question_index: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }, auth.userId);
      }

      return json({ success: true, data: { ...room, password: undefined } });
    }

    const roomIdMatch = url.pathname.match(/^\/api\/rooms\/([a-zA-Z0-9_-]+)$/);
    if (roomIdMatch && request.method === "GET") {
      const auth = await requireAuthUserId(request, env);
      if ("error" in auth) return auth.error;

      const roomId = roomIdMatch[1];
      const room = await firestore.getDocument("exam_rooms", roomId);
      if (!room) return json({ success: false, message: "Room not found" }, { status: 404 });

      const participants = await firestore.listDocuments(`exam_rooms/${roomId}/participants`);

      // Fetch users for participants
      const userIds = participants.map((p: any) => p.user_id);
      const uniqueUserIds = Array.from(new Set(userIds));
      const usersMap = new Map();
      
      for (let i = 0; i < uniqueUserIds.length; i += 30) {
        const chunk = uniqueUserIds.slice(i, i + 30);
        const userPromises = chunk.map((id: any) => firestore.getDocument("users", String(id)));
        const users = await Promise.all(userPromises);
        for (const u of users) {
          if (u && u.id) usersMap.set(String(u.id), u);
        }
      }

      const populatedParticipants = participants.map((p: any) => ({
        ...p,
        User: usersMap.get(String(p.user_id)) ? sanitizeUser(usersMap.get(String(p.user_id))) : { display_name: "Unknown", avatar: null }
      }));

      const questionIds = room.question_ids ? JSON.parse(String(room.question_ids)) : [];
      const questionsMap = new Map();
      for (let i = 0; i < questionIds.length; i += 30) {
        const chunk = questionIds.slice(i, i + 30);
        const qPromises = chunk.map((id: string) => firestore.getDocument("questions", id));
        const qs = await Promise.all(qPromises);
        for (const q of qs) {
          if (q && q.id) questionsMap.set(q.id, normalizeQuestion(q));
        }
      }
      const questions = questionIds.map((id: string) => questionsMap.get(id)).filter(Boolean);

      return json({
        success: true,
        data: {
          ...room,
          password: undefined,
          Host: usersMap.get(String(room.host_user_id)) ? sanitizeUser(usersMap.get(String(room.host_user_id))) : { id: room.host_user_id, display_name: null },
          RoomParticipants: populatedParticipants,
          questions: questions,
        },
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
        const saConfig = parseServiceAccount(env);
        if (!saConfig) return json({ error: "missing_firebase_config" }, { status: 500 });
        const firestore = new FirestoreClient(saConfig);

        // /api/questions/subjects
        if (url.pathname === "/api/questions/subjects" && request.method === "GET") {
          const qs = await firestore.runQuery({ from: [{ collectionId: "questions" }] });
          const subjects = new Set<string>();
          for (const q of qs) if (q.subject) subjects.add(q.subject);
          return json({ success: true, data: Array.from(subjects).sort() });
        }

        // /api/questions/years
        if (url.pathname === "/api/questions/years" && request.method === "GET") {
          const qs = await firestore.runQuery({ from: [{ collectionId: "questions" }] });
          const years = new Set<string>();
          for (const q of qs) if (q.exam_year) years.add(String(q.exam_year));
          return json({ success: true, data: Array.from(years).sort((a, b) => b.localeCompare(a)) });
        }

        // /api/questions/sets
        if (url.pathname === "/api/questions/sets" && request.method === "GET") {
          const qs = await firestore.runQuery({ from: [{ collectionId: "questions" }] });
          const sets = new Set<string>();
          for (const q of qs) if (q.exam_set) sets.add(q.exam_set);
          return json({ success: true, data: Array.from(sets).sort() });
        }

        // /api/questions/categories
        if (url.pathname === "/api/questions/categories" && request.method === "GET") {
          const subject = url.searchParams.get("subject");
          const query: any = { from: [{ collectionId: "questions" }] };
          if (subject && subject !== "undefined" && subject !== "null") {
            query.where = { fieldFilter: { field: { fieldPath: "subject" }, op: "EQUAL", value: { stringValue: subject } } };
          }
          const qs = await firestore.runQuery(query);
          const allTags = new Set<string>();
          for (const q of qs) {
            if (q.category) {
              q.category.split(",").forEach((tag: string) => {
                const t = tag.trim();
                if (t) allTags.add(t);
              });
            }
            if (q.catalogs && Array.isArray(q.catalogs)) {
              q.catalogs.forEach((tag: string) => {
                if (tag) allTags.add(tag.trim());
              });
            }
          }
          return json({ success: true, data: Array.from(allTags).sort() });
        }

        // /api/questions/:id
        const qIdMatch = url.pathname.match(/^\/api\/questions\/([a-zA-Z0-9_-]+)$/);
        if (qIdMatch && request.method === "GET") {
          const q = await firestore.getDocument("questions", qIdMatch[1]);
          if (!q) return json({ success: false, message: "Question not found" }, { status: 404 });
          return json({ success: true, data: normalizeQuestion(q) });
        }

        // /api/questions (List)
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

          const filters: any[] = [];
          if (subject && subject !== "undefined" && subject !== "null") {
            filters.push({ fieldFilter: { field: { fieldPath: "subject" }, op: "EQUAL", value: { stringValue: subject } } });
          }
          if (exam_year && exam_year !== "undefined" && exam_year !== "null") {
            filters.push({ fieldFilter: { field: { fieldPath: "exam_year" }, op: "EQUAL", value: { stringValue: exam_year } } });
          }
          if (exam_set && exam_set !== "undefined" && exam_set !== "null") {
            filters.push({ fieldFilter: { field: { fieldPath: "exam_set" }, op: "EQUAL", value: { stringValue: exam_set } } });
          }

          let query: any = { from: [{ collectionId: "questions" }] };
          if (filters.length === 1) {
            query.where = filters[0];
          } else if (filters.length > 1) {
            query.where = { compositeFilter: { op: "AND", filters } };
          }

          const allQs = await firestore.runQuery(query);
          let rows: any[] = [];

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
              totalPages: Math.ceil(count / limit) || 1,
            },
          });
        }
        // /api/exams/submit
        if (url.pathname === "/api/exams/submit" && request.method === "POST") {
          const auth = await requireAuthUserId(request, env);
          if ("error" in auth) return auth.error;

          const body = await readJson(request);
          if (!body) return json({ success: false, message: "invalid_body" }, { status: 400 });

          const { answers, mode, classroom_id, total_time } = body as any;
          if (!answers || typeof answers !== "object") return json({ success: false, message: "invalid_params" }, { status: 400 });

          const questionIds = Object.keys(answers);
          if (questionIds.length === 0) return json({ success: false, message: "No answers provided" }, { status: 400 });

          // Fetch questions. Firestore REST API IN operator supports max 30 elements.
          // Since exams might have up to 50 or 100 questions, we fetch them individually or use multiple queries.
          const questionsMap = new Map();
          for (let i = 0; i < questionIds.length; i += 30) {
            const chunk = questionIds.slice(i, i + 30);
            const qPromises = chunk.map(id => firestore.getDocument("questions", String(id)));
            const qs = await Promise.all(qPromises);
            for (const q of qs) {
              if (q && q.id) questionsMap.set(q.id, q);
            }
          }

          let score = 0;
          let total_score = 0;
          const subject_scores: Record<string, any> = {};
          const skill_scores: Record<string, any> = {};
          const questionsDetail: any[] = [];

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

          const examResult = await firestore.createDocument("exam_results", {
            user_id: auth.userId,
            classroom_id: classroom_id || null,
            score,
            total_score,
            mode: mode || "solo",
            subject_scores: subject_scores,
            skill_scores: skill_scores,
            questions: questionsDetail,
            time_taken: total_time || 0,
            taken_at: new Date().toISOString()
          });

          return json({ success: true, data: examResult }, { status: 201 });
        }

        // /api/exams/history
        if (url.pathname === "/api/exams/history" && request.method === "GET") {
          const auth = await requireAuthUserId(request, env);
          if ("error" in auth) return auth.error;

          const results = await firestore.runQuery({
            from: [{ collectionId: "exam_results" }],
            where: { fieldFilter: { field: { fieldPath: "user_id" }, op: "EQUAL", value: { stringValue: auth.userId } } },
            orderBy: [{ field: { fieldPath: "taken_at" }, direction: "DESCENDING" }]
          });

          return json({ success: true, data: results });
        }

        // /api/community/threads (GET)
        if (url.pathname === "/api/community/threads" && request.method === "GET") {
          const category = url.searchParams.get("category");
          const search = url.searchParams.get("search");
          const limitStr = url.searchParams.get("limit") || "10";
          const limit = parseInt(limitStr, 10);
          
          let query: any = { 
            from: [{ collectionId: "threads" }],
            orderBy: [{ field: { fieldPath: "created_at" }, direction: "DESCENDING" }],
            limit: { value: limit } // FirestoreREST limit expects integer or object? The struct is usually { value: limit } for Protobuf Int32Value. 
            // Wait, firestore REST API `limit` is just an integer in the query object!
          };
          query.limit = limit;

          const filters: any[] = [];
          if (category && category !== "all" && category !== "undefined" && category !== "null") {
            filters.push({ fieldFilter: { field: { fieldPath: "category" }, op: "EQUAL", value: { stringValue: category } } });
          }
          if (filters.length === 1) {
            query.where = filters[0];
          } else if (filters.length > 1) {
            query.where = { compositeFilter: { op: "AND", filters } };
          }

          let allThreads = await firestore.runQuery(query);
          
          // Client-side search filtering
          if (search && search !== "undefined") {
             const searchLower = search.toLowerCase();
             allThreads = allThreads.filter((t: any) => {
               if (t.title && t.title.toLowerCase().includes(searchLower)) return true;
               if (t.tags && Array.isArray(t.tags) && t.tags.some((tag: string) => tag.toLowerCase().includes(searchLower))) return true;
               return false;
             });
          }

          // Fetch authors for threads
          const userIds = [...new Set(allThreads.map((t: any) => t.user_id).filter(Boolean))];
          const usersMap = new Map();
          for (let i = 0; i < userIds.length; i += 30) {
            const chunk = userIds.slice(i, i + 30);
            const userPromises = chunk.map(id => firestore.getDocument("users", String(id)));
            const users = await Promise.all(userPromises);
            for (const u of users) {
              if (u && u.id) usersMap.set(String(u.id), u);
            }
          }

          allThreads = allThreads.map((t: any) => {
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

        // /api/community/threads (POST)
        if (url.pathname === "/api/community/threads" && request.method === "POST") {
          const auth = await requireAuthUserId(request, env);
          if ("error" in auth) return auth.error;

          const body: any = await readJson(request);
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
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            deleted_at: null,
          };

          const created = await firestore.createDocument("threads", threadData);
          return json({ success: true, data: created }, { status: 201 });
        }

        // /api/exams/:id
        const examIdMatch = url.pathname.match(/^\/api\/exams\/([a-zA-Z0-9_-]+)$/);
        if (examIdMatch && request.method === "GET") {
          const auth = await requireAuthUserId(request, env);
          if ("error" in auth) return auth.error;

          const result = await firestore.getDocument("exam_results", examIdMatch[1]);
          if (!result) return json({ success: false, message: "Result not found" }, { status: 404 });

          return json({ success: true, data: result });
        }

        // /api/community/threads/:id (GET)
        const threadIdMatch = url.pathname.match(/^\/api\/community\/threads\/([a-zA-Z0-9_-]+)$/);
        if (threadIdMatch && request.method === "GET") {
          const threadDoc = await firestore.getDocument("threads", threadIdMatch[1]);
          if (!threadDoc) return notFound();
          
          if (!threadDoc.stats) threadDoc.stats = { views: threadDoc.views || 0, likes: threadDoc.likes || 0, comments_count: 0 };
          
          const u = await firestore.getDocument("users", String(threadDoc.user_id));
          if (u) {
            threadDoc.User = { id: u.id, display_name: u.display_name || "Unknown User", avatar: u.avatar || null, plan_type: u.plan_type || "free" };
          }
          
          return json(threadDoc); // Note: frontend expects raw thread data here
        }

        // /api/community/comments/:threadId (GET)
        const commentsMatch = url.pathname.match(/^\/api\/community\/comments\/([a-zA-Z0-9_-]+)$/);
        if (commentsMatch && request.method === "GET") {
          const threadId = commentsMatch[1];
          // Fetch comments
          let comments = await firestore.runQuery({
            from: [{ collectionId: "comments" }],
            where: {
              fieldFilter: {
                field: { fieldPath: "thread_id" },
                op: "EQUAL",
                value: { stringValue: threadId }
              }
            }
          });
          
          // Fetch users for comments
          const userIds = [...new Set(comments.map((c: any) => c.user_id).filter(Boolean))];
          const usersMap = new Map();
          for (let i = 0; i < userIds.length; i += 30) {
            const chunk = userIds.slice(i, i + 30);
            const userPromises = chunk.map(id => firestore.getDocument("users", String(id)));
            const users = await Promise.all(userPromises);
            for (const u of users) {
              if (u && u.id) usersMap.set(String(u.id), u);
            }
          }
          
          comments = comments.map((c: any) => {
            const u = usersMap.get(String(c.user_id));
            if (u) {
              c.User = { id: u.id, display_name: u.display_name || "Unknown User", avatar: u.avatar || null, plan_type: u.plan_type || "free" };
            } else {
              c.User = { id: c.user_id, display_name: "Unknown User" };
            }
            c.likes = c.likes || 0;
            return c;
          });
          
          return json(comments); // Raw array
        }

        // /api/community/comments (POST)
        if (url.pathname === "/api/community/comments" && request.method === "POST") {
          const auth = await requireAuthUserId(request, env);
          if ("error" in auth) return auth.error;
          
          const body = (await request.json()) as any;
          const commentData = {
             thread_id: body.thread_id,
             content: body.content,
             parent_id: body.parent_id || null,
             user_id: auth.userId,
             likes: 0,
             created_at: new Date().toISOString(),
             updated_at: new Date().toISOString()
          };
          
          const created = await firestore.createDocument("comments", commentData);
          
          return json({ success: true, data: created });
        }
        
        // /api/community/comments/:id/like (POST)
        const commentLikeMatch = url.pathname.match(/^\/api\/community\/comments\/([a-zA-Z0-9_-]+)\/like$/);
        if (commentLikeMatch && request.method === "POST") {
          const auth = await requireAuthUserId(request, env);
          if ("error" in auth) return auth.error;
          
          const commentId = commentLikeMatch[1];
          const comment = await firestore.getDocument("comments", commentId);
          if (!comment) return notFound();
          
          const currentLikes = comment.likes || 0;
          await firestore.updateDocument("comments", commentId, { likes: currentLikes + 1 });
          
          return json({ success: true, likes: currentLikes + 1 });
        }

        // /api/news
        if (url.pathname === "/api/news" && request.method === "GET") {
          try {
            const agency = url.searchParams.get("agency");
            const search = url.searchParams.get("search");
            const news = await firestore.runQuery({ from: [{ collectionId: "news" }], limit: 100 });
            let filteredNews = news;
            if (agency && agency !== 'undefined') {
                filteredNews = filteredNews.filter((n: any) => n.agency === agency || (n.metadata && n.metadata.organization === agency));
            }
            if (search && search !== 'undefined') {
                const sLower = search.toLowerCase();
                filteredNews = filteredNews.filter((n: any) => n.title?.toLowerCase().includes(sLower) || n.summary?.toLowerCase().includes(sLower));
            }
            filteredNews.sort((a: any, b: any) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
            return json({ success: true, data: filteredNews });
          } catch(e) {
            return json({ success: true, data: [] });
          }
        }

        // /api/news/agency-stats
        if (url.pathname === "/api/news/agency-stats" && request.method === "GET") {
          try {
            const news = await firestore.runQuery({ from: [{ collectionId: "news" }], limit: 1000 });
            const agencies = new Map();
            news.forEach((item: any) => {
              const agency = item.agency || (item.metadata && item.metadata.organization);
              if (agency) {
                  agencies.set(agency, (agencies.get(agency) || 0) + 1);
              }
            });
            const stats = Array.from(agencies.entries()).map(([name, count]) => ({ name, job_count: count }));
            return json({ success: true, data: stats });
          } catch(e) {
            return json({ success: true, data: [] });
          }
        }

        // /api/news/popular-keywords
        if (url.pathname === "/api/news/popular-keywords" && request.method === "GET") {
            return json({ success: true, data: [] });
        }

        // /api/news/sources/all
        if (url.pathname === "/api/news/sources/all" && request.method === "GET") {
            try {
              const sources = await firestore.runQuery({ from: [{ collectionId: "news_sources" }] });
              return json({ success: true, data: sources });
            } catch(e) {
              return json({ success: true, data: [] });
            }
        }



        // /api/scraper/jobs
        if (url.pathname === "/api/scraper/jobs" && request.method === "POST") {
            const body = await readJson(request);
            if (!body) return json({ success: false, message: "invalid_body" }, { status: 400 });
            
            // Check API Key
            const apiKey = request.headers.get("x-api-key");
            if (apiKey !== "dev_scraper_key") {
                return json({ success: false, message: "Unauthorized" }, { status: 401 });
            }

            const jobData: any = body;
            jobData.created_at = new Date().toISOString();
            jobData.published_at = new Date().toISOString();
            const created = await firestore.createDocument("news", jobData);
            return json({ success: true, data: created });
        }

        // Stub missing routes to prevent 404 crashes
        if (url.pathname === "/api/users/stats") return json({ success: true, stats: { total_tests: 0, avg_score: 0 }});
        if (url.pathname === "/api/public/settings") return json({ success: true, settings: {} });
        if (url.pathname === "/api/groups") return json({ success: true, groups: [] });
        if (url.pathname === "/api/community/tags/trending") return json([]);
        if (url.pathname === "/api/friends/list") return json({ success: true, friends: [] });
        if (url.pathname === "/api/users/leaderboard") return json({ success: true, leaderboard: [] });

        // Admin and System Stubs / Simple Implementation
        if (url.pathname === "/api/admin/stats") return json({ revenue: { total: 0, monthly: 0, yearly: 0, pending: 0, trend: [] }, conversionRate: 0, activeUsers: 0, commercialViability: [], painPoints: [], communityHealth: {} });
        if (url.pathname === "/api/admin/users" && request.method === "GET") {
          const auth = await requireAuthUserId(request, env);
          if ("error" in auth) return auth.error;
          const users = await firestore.runQuery({ from: [{ collectionId: "users" }], orderBy: [{ field: { fieldPath: "created_at" }, direction: "DESCENDING" }], limit: 1000 });
          return json(users);
        }
        if (url.pathname === "/api/admin/businesses" && request.method === "GET") {
          const auth = await requireAuthUserId(request, env);
          if ("error" in auth) return auth.error;
          const businesses = await firestore.runQuery({ from: [{ collectionId: "businesses" }], limit: 1000 });
          businesses.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
          return json(businesses);
        }
        if (url.pathname === "/api/admin/payments" && request.method === "GET") {
          const auth = await requireAuthUserId(request, env);
          if ("error" in auth) return auth.error;
          const payments = await firestore.runQuery({ from: [{ collectionId: "payments" }], orderBy: [{ field: { fieldPath: "created_at" }, direction: "DESCENDING" }], limit: 1000 });
          return json(payments);
        }
        if (url.pathname === "/api/admin/threads" && request.method === "GET") {
          const auth = await requireAuthUserId(request, env);
          if ("error" in auth) return auth.error;
          const threads = await firestore.runQuery({ from: [{ collectionId: "threads" }], orderBy: [{ field: { fieldPath: "created_at" }, direction: "DESCENDING" }], limit: 1000 });
          return json({ threads, pagination: { page: 1, totalPages: 1, total: threads.length } });
        }
        if (url.pathname === "/api/admin/scraper/start" && request.method === "POST") {
            return json({ success: true, message: "Scraper started" });
        }
        if (url.pathname === "/api/admin/scraper/status") {
            return json({ success: true, data: { isRunning: false, logs: [] } });
        }
        if (url.pathname === "/api/admin/generator/status") {
            return json({ success: true, data: { isRunning: false, logs: [] } });
        }
        if (url.pathname === "/api/terminal/status") return json({ status: 'online' });
        if (url.pathname === "/api/terminal/command") return json({ message: ">>> Status: Idle (Active Provider: Google Gemini)" });


      } catch (err: any) {
        return json({ success: false, message: err.message }, { status: 500 });
      }
    }

    return fetch(request);
  },
};
