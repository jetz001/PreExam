import { FirestoreClient, parseServiceAccount } from "./firestore";

type RealtimeMessage =
  | { event: string; data?: unknown }
  | { type: "ping" }
  | { type: "pong" };

type SocketAttachment = {
  userId?: string | number;
  rooms?: string[];
};

const toRoomKey = (raw: unknown) => {
  if (typeof raw === "string" && raw.trim()) return raw.trim();
  return null;
};

const parseJson = async (req: Request) => {
  const contentType = req.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) return null;
  try {
    return await req.json();
  } catch {
    return null;
  }
};

export type Env = {
  REALTIME: DurableObjectNamespace;
  INTERNAL_API_KEY: string;
  JWT_SECRET?: string;
  FIREBASE_SERVICE_ACCOUNT?: string;
  GEMINI_API_KEY?: string;
  OLLAMA_URL?: string;
  OLLAMA_MODEL?: string;
  OLLAMA_API_KEY?: string;
};

export class RealtimeDO {
  private firestore: FirestoreClient | null = null;

  constructor(
    private readonly state: DurableObjectState,
    private readonly env: Env
  ) {
    const config = parseServiceAccount(this.env);
    if (config) {
      this.firestore = new FirestoreClient(config);
    }
  }

  private async getRoomInfo(roomId: string) {
    if (!this.firestore) return null;
    const room = await this.firestore.getDocument("exam_rooms", roomId);
    if (!room) return null;
    return {
      id: room.id,
      hostUserId: String(room.host_user_id),
      questionCount: Number(room.question_count || 0),
      subject: room.subject ? String(room.subject) : null,
      status: room.status ? String(room.status) : null,
    };
  }

  private async upsertParticipant(roomId: string, userId: string, fields: { score?: number; status?: string }) {
    if (!this.firestore) return;
    const score = Number.isFinite(fields.score as number) ? (fields.score as number) : 0;
    const status = fields.status || "joined";

    const docPath = `exam_rooms/${roomId}/participants`;
    const existing = await this.firestore.getDocument(docPath, userId);

    if (existing) {
      await this.firestore.updateDocument(docPath, userId, {
        score: fields.score !== undefined ? score : existing.score,
        status,
        updated_at: new Date().toISOString(),
      });
    } else {
      await this.firestore.createDocument(docPath, {
        user_id: userId,
        score,
        status,
        current_question_index: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, userId);
    }
  }

  async fetch(request: Request) {
    const url = new URL(request.url);

    if ((url.pathname.endsWith("/ws") || url.pathname.endsWith("/ws/")) && request.headers.get("upgrade")?.toLowerCase() === "websocket") {
      const pair = new WebSocketPair();
      const client = pair[0];
      const server = pair[1];

      this.state.acceptWebSocket(server);

      const token = url.searchParams.get("token") || undefined;
      const userId = url.searchParams.get("userId") || undefined;

      const attachment: SocketAttachment = {
        userId,
        rooms: [],
      };

      server.serializeAttachment({ ...attachment, token });

      // Socket.IO Handshake
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

      const event = (body as any).event;
      const data = (body as any).data;
      const room = toRoomKey((body as any).room);
      if (typeof event !== "string" || !event) {
        return Response.json({ error: "invalid_event" }, { status: 400 });
      }

      this.broadcast({ event, data }, room);
      return Response.json({ ok: true });
    }

    return Response.json({ error: "not_found" }, { status: 404 });
  }

  private broadcast(msg: { event: string; data?: unknown }, room: string | null) {
    const sockets = this.state.getWebSockets();
    const payload = `42${JSON.stringify([msg.event, msg.data])}`;
    for (const ws of sockets) {
      const attachment = ws.deserializeAttachment() as SocketAttachment | undefined;
      if (room) {
        const rooms = attachment?.rooms || [];
        if (!rooms.includes(room)) continue;
      }
      ws.send(payload);
    }
  }

  async webSocketMessage(ws: WebSocket, message: ArrayBuffer | string) {
    if (typeof message !== "string") return;

    if (message === "2" || message === "2probe") {
      ws.send("3");
      return;
    }

    if (message.startsWith("40")) {
      ws.send(`40{"sid":"123456"}`);
      return;
    }

    let payload: RealtimeMessage | null = null;
    
    // Parse Socket.IO message (e.g. 42["event", data])
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
      // Fallback for standard JSON webSockets
      try {
        payload = JSON.parse(message);
      } catch {
        payload = null;
      }
    }

    if (!payload) return;

    if ((payload as any).type === "ping") {
      ws.send(JSON.stringify({ type: "pong" }));
      return;
    }

    if (!("event" in payload) || typeof payload.event !== "string") return;

    const attachment = (ws.deserializeAttachment() as SocketAttachment | undefined) || {
      rooms: [],
    };

    const event = payload.event;
    const data = (payload as any).data;

    if (event === "join_user") {
      const id = typeof data === "string" || typeof data === "number" ? String(data) : null;
      if (id) {
        attachment.userId = id;
        attachment.rooms = Array.from(new Set([...(attachment.rooms || []), `user:${id}`]));
        ws.serializeAttachment(attachment);
      }
      return;
    }

    if (event === "join_room") {
      const roomId = (data as any)?.roomId;
      const userId = (data as any)?.userId;
      const roomKey = toRoomKey(roomId);
      if (roomKey) {
        attachment.rooms = Array.from(new Set([...(attachment.rooms || []), `room:${roomKey}`]));
        if (userId !== undefined && userId !== null) attachment.userId = String(userId);
        ws.serializeAttachment(attachment);
        this.broadcast({ event: "user_joined", data: { userId: attachment.userId } }, `room:${roomKey}`);
      }
      return;
    }

    if (event === "join_ticket") {
      const ticketId = toRoomKey(data);
      if (ticketId) {
        attachment.rooms = Array.from(new Set([...(attachment.rooms || []), `ticket:${ticketId}`]));
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
      const groupKey = toRoomKey(data) || toRoomKey((data as any)?.room) || toRoomKey((data as any)?.group);
      if (groupKey) {
        attachment.rooms = Array.from(new Set([...(attachment.rooms || []), `group:${groupKey}`]));
        ws.serializeAttachment(attachment);
      }
      return;
    }

    if (event === "send_message") {
      const roomId = (data as any)?.roomId;
      const roomKey = toRoomKey(roomId);
      if (roomKey) this.broadcast({ event: "receive_message", data }, `room:${roomKey}`);
      return;
    }

    if (event === "start_exam") {
      const roomId = (data as any)?.roomId;
      const userId = (data as any)?.userId;
      const roomKey = toRoomKey(roomId);
      if (roomKey && userId !== undefined && userId !== null) {
        try {
          const info = await this.getRoomInfo(roomKey);
          if (info && info.hostUserId === String(userId)) {
            if (this.firestore) {
              await this.firestore.updateDocument("exam_rooms", roomKey, {
                status: "in_progress",
                updated_at: new Date().toISOString(),
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
      const roomId = (data as any)?.roomId;
      const roomKey = toRoomKey(roomId);
      if (roomKey) {
        try {
          const userId = (data as any)?.userId;
          const score = Number((data as any)?.score ?? 0);
          if (userId !== undefined && userId !== null) {
            await this.upsertParticipant(roomKey, String(userId), { score, status: (data as any)?.status });
            this.broadcast({ event: "score_updated", data: { userId, score } }, `room:${roomKey}`);
          }
        } catch {
          return;
        }
      }
      return;
    }

    if (event === "tutor_navigate") {
      const roomId = (data as any)?.roomId;
      const roomKey = toRoomKey(roomId);
      if (roomKey) this.broadcast({ event: "navigate_question", data: { questionIndex: (data as any)?.questionIndex } }, `room:${roomKey}`);
      return;
    }

    if (event === "tutor_show_answer") {
      const roomId = (data as any)?.roomId;
      const roomKey = toRoomKey(roomId);
      if (roomKey) this.broadcast({ event: "tutor_show_answer", data: { questionIndex: (data as any)?.questionIndex } }, `room:${roomKey}`);
      return;
    }

    if (event === "tutor_player_answer") {
      const roomId = (data as any)?.roomId;
      const roomKey = toRoomKey(roomId);
      if (roomKey) this.broadcast({ event: "tutor_player_answered", data: { choice: (data as any)?.choice } }, `room:${roomKey}`);
      return;
    }

    if (event === "submit_progress") {
      const roomId = (data as any)?.roomId;
      const roomKey = toRoomKey(roomId);
      const userId = (data as any)?.userId;
      const questionIndex = (data as any)?.questionIndex;
      
      if (roomKey && userId !== undefined && userId !== null) {
        try {
          if (this.firestore) {
            await this.firestore.updateDocument(`exam_rooms/${roomKey}/participants`, String(userId), {
              current_question_index: questionIndex,
              updated_at: new Date().toISOString(),
            });
          }
          this.broadcast({ event: "progress_updated", data: { userId, questionIndex } }, `room:${roomKey}`);
        } catch {
          // ignore
        }
      }
      return;
    }

    if (event === "set_nickname") {
      const roomId = (data as any)?.roomId;
      const roomKey = toRoomKey(roomId);
      const userId = (data as any)?.userId;
      const nickname = (data as any)?.nickname;
      
      if (roomKey && userId !== undefined && userId !== null && nickname) {
        try {
          if (this.firestore) {
            await this.firestore.updateDocument(`exam_rooms/${roomKey}/participants`, String(userId), {
              nickname: String(nickname),
              updated_at: new Date().toISOString(),
            });
          }
          this.broadcast({ event: "nickname_updated", data: { userId, nickname } }, `room:${roomKey}`);
        } catch {
          // ignore
        }
      }
      return;
    }

    if (event === "finish_exam") {
      const roomId = (data as any)?.roomId;
      const roomKey = toRoomKey(roomId);
      if (roomKey && this.firestore) {
        try {
          const userId = (data as any)?.userId;
          const score = Number((data as any)?.score ?? 0);
          const timeTaken = Number((data as any)?.timeTaken ?? 0);
          if (userId === undefined || userId === null) return;

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
              taken_at: new Date().toISOString(),
            });

            const parts = await this.firestore.listDocuments(`exam_rooms/${roomKey}/participants`);

            const total = parts.length;
            const finished = parts.filter((p: any) => p.status === "finished").length;
            if (total > 0 && total === finished) {
              await this.firestore.updateDocument("exam_rooms", roomKey, {
                status: "finished",
                updated_at: new Date().toISOString(),
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
      const roomId = (data as any)?.roomId;
      const userId = (data as any)?.userId;
      const roomKey = toRoomKey(roomId);
      if (roomKey && userId !== undefined && userId !== null && this.firestore) {
        try {
          const info = await this.getRoomInfo(roomKey);
          if (info && info.hostUserId === String(userId)) {
            await this.firestore.updateDocument("exam_rooms", roomKey, {
              status: "finished",
              updated_at: new Date().toISOString(),
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
      const roomId = (data as any)?.roomId;
      const roomKey = toRoomKey(roomId);
      if (roomKey && this.firestore) {
        try {
          const parts = await this.firestore.listDocuments(`exam_rooms/${roomKey}/participants`);

          for (const p of parts) {
            await this.firestore.updateDocument(`exam_rooms/${roomKey}/participants`, p.id, {
              score: 0,
              status: "joined",
              current_question_index: 0,
              updated_at: new Date().toISOString(),
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
}
