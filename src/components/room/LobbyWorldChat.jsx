import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Globe,
  Send,
  Ticket,
  Trash2,
  ArrowDown,
  Users,
  X,
  LogIn,
  Shield,
  Sparkles,
  Play,
  Share2,
} from 'lucide-react';
import api from '../../services/api';
import roomService from '../../services/roomService';
import { createRoomRealtimeClient } from '../../services/roomRealtimeClient';

const QUICK_STARTERS = [
  'หาคนเข้าห้องติว ก.พ. 70!',
  'มาแข่งอนุกรมกัน!',
  'ทักทายทุกคน 👋',
];

function mergeWorldMessages(prev, incoming) {
  const list = Array.isArray(incoming) ? incoming : [incoming];
  const byId = new Map();
  for (const item of prev) {
    if (item?.id) byId.set(item.id, item);
  }
  for (const item of list) {
    if (item?.id) byId.set(item.id, item);
  }
  return Array.from(byId.values())
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    .slice(-100);
}

function getWorldWsBase() {
  let baseUrl = api.defaults.baseURL || window.location.origin;
  if (baseUrl.startsWith('/')) {
    baseUrl = `${window.location.origin}${baseUrl}`;
  }
  return baseUrl.replace(/\/+$/, '');
}

function formatThaiTime(isoString) {
  try {
    return new Date(isoString).toLocaleTimeString('th-TH', {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
}

export default function LobbyWorldChat({
  user,
  xpLevel = 1,
  rooms = [],
  onJoinRoom,
  invitedRoom = null,
  onClearInvitedRoom,
  onNewIncomingMessage,
  isHiddenOnMobile = false,
}) {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineCount, setOnlineCount] = useState(1);
  const [showRoomPicker, setShowRoomPicker] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);

  const listRef = useRef(null);
  const isNearBottomRef = useRef(true);
  const clientRef = useRef(null);
  const isHiddenRef = useRef(isHiddenOnMobile);

  useEffect(() => {
    isHiddenRef.current = isHiddenOnMobile;
  }, [isHiddenOnMobile]);

  useEffect(() => {
    if (invitedRoom?.code) {
      setSelectedRoom({
        code: invitedRoom.code,
        name: invitedRoom.name || invitedRoom.code,
      });
      setShowRoomPicker(false);
    }
  }, [invitedRoom]);

  const scrollToBottom = useCallback((behavior = 'smooth') => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior });
    isNearBottomRef.current = true;
    setShowScrollBottom(false);
  }, []);

  const fetchHistory = useCallback(async (initial = false) => {
    try {
      const res = await roomService.getWorldChatMessages(60);
      if (res?.success && Array.isArray(res.data)) {
        setMessages((prev) => mergeWorldMessages(initial ? [] : prev, res.data));
        if (initial) {
          requestAnimationFrame(() => scrollToBottom('auto'));
        }
      }
    } catch (err) {
      console.error('Failed to load world chat history:', err);
    } finally {
      if (initial) setLoading(false);
    }
  }, [scrollToBottom]);

  useEffect(() => {
    fetchHistory(true);
  }, [fetchHistory]);

  useEffect(() => {
    let disposed = false;
    let reconnectTimer = null;
    let attempt = 0;

    const myUserId = user?.id
      ? String(user.id)
      : `guest_${Math.floor(Math.random() * 100000)}`;

    const connectSocket = () => {
      if (disposed) return;
      const token = localStorage.getItem('token');
      const client = createRoomRealtimeClient({
        baseUrl: getWorldWsBase(),
        path: '/ws',
        token,
        userId: myUserId,
      });
      clientRef.current = client;

      client.on('connect', () => {
        if (disposed) return;
        const wasReconnect = attempt > 0;
        attempt = 0;
        setIsConnected(true);
        client.emit('join_world_chat', { userId: myUserId });
        if (wasReconnect) {
          fetchHistory(false);
        }
      });

      client.on('world_presence', (data) => {
        if (disposed) return;
        const count = Number(data?.onlineCount);
        if (Number.isFinite(count) && count >= 1) {
          setOnlineCount(count);
        }
      });

      client.on('world_chat_message', (msg) => {
        if (disposed || !msg?.id) return;
        setMessages((prev) => {
          const alreadyExists = prev.some((m) => m.id === msg.id);
          if (alreadyExists) return prev;
          return mergeWorldMessages(prev, msg);
        });

        const isMine = user?.id && String(msg.user_id) === String(user.id);
        if (isHiddenRef.current && !isMine) {
          onNewIncomingMessage?.();
        }
        if (isMine || isNearBottomRef.current) {
          requestAnimationFrame(() => scrollToBottom('smooth'));
        } else {
          setShowScrollBottom(true);
        }
      });

      client.on('world_chat_deleted', (data) => {
        if (disposed || !data?.id) return;
        setMessages((prev) => prev.filter((m) => m.id !== data.id));
      });

      client.on('disconnect', () => {
        if (disposed) return;
        setIsConnected(false);
        attempt += 1;
        const delay = Math.min(15000, 2500 * Math.pow(1.5, Math.min(attempt - 1, 5)));
        reconnectTimer = setTimeout(connectSocket, delay);
      });
    };

    connectSocket();

    return () => {
      disposed = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (clientRef.current) {
        try {
          if (clientRef.current.connected) {
            clientRef.current.emit('leave_world_chat', { userId: myUserId });
          }
          clientRef.current.disconnect();
        } catch {
          // ignore disconnect cleanup errors
        }
        clientRef.current = null;
      }
    };
  }, [user?.id, fetchHistory, onNewIncomingMessage, scrollToBottom]);

  const handleScroll = () => {
    const el = listRef.current;
    if (!el) return;
    const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
    const near = distance < 72;
    isNearBottomRef.current = near;
    if (near) setShowScrollBottom(false);
  };

  const clearAttachedRoom = () => {
    setSelectedRoom(null);
    onClearInvitedRoom?.();
  };

  const handleSubmit = async (e, overrideText = null) => {
    if (e) e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }

    const text = (overrideText !== null ? overrideText : input).trim();
    if (!text || sending) return;

    setSending(true);
    try {
      const res = await roomService.sendWorldChatMessage({
        message: text,
        roomCode: selectedRoom?.code || undefined,
      });
      if (res?.success && res.data) {
        setMessages((prev) => mergeWorldMessages(prev, res.data));
        if (overrideText === null) setInput('');
        clearAttachedRoom();
        requestAnimationFrame(() => scrollToBottom('smooth'));
      }
    } catch (err) {
      const msg = err?.response?.data?.message || 'ส่งข้อความไม่สำเร็จ';
      toast.error(msg);
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (msgId) => {
    try {
      const res = await roomService.deleteWorldChatMessage(msgId);
      if (res?.success) {
        setMessages((prev) => prev.filter((m) => m.id !== msgId));
        toast.success('ลบข้อความแล้ว');
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'ลบข้อความไม่สำเร็จ');
    }
  };

  const waitingRooms = rooms.filter((r) => String(r.status || 'waiting') === 'waiting');

  return (
    <section
      aria-label="แชทเวิลด์ ห้องสอบกลุ่ม"
      className="flex flex-col bg-[#160a33]/80 backdrop-blur-xl border border-white/20 rounded-3xl shadow-[0_20px_50px_rgba(15,5,36,0.45)] overflow-hidden h-[540px] lg:h-[580px]"
    >
      {/* Header */}
      <div className="px-4 py-3.5 bg-gradient-to-r from-violet-950/90 via-indigo-950/85 to-purple-950/90 border-b border-white/15 flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="w-9 h-9 rounded-2xl bg-gradient-to-br from-sky-400 to-indigo-600 text-white flex items-center justify-center shadow-md border border-white/20 shrink-0">
            <Globe className="w-5 h-5" strokeWidth={2.3} />
          </span>
          <div className="min-w-0">
            <h2 className="text-base font-black text-white leading-tight truncate">
              แชทเวิลด์
            </h2>
            <p className="text-xs font-bold text-slate-300 flex items-center gap-1.5 mt-0.5">
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${
                  isConnected ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-amber-400 animate-pulse'
                }`}
              />
              <span>
                {isConnected ? `ออนไลน์ ${onlineCount} คน` : 'กำลังเชื่อมต่อ...'}
              </span>
            </p>
          </div>
        </div>
        <span className="text-xs font-extrabold text-indigo-100 bg-white/12 border border-white/15 px-2.5 py-1 rounded-full shrink-0">
          {messages.length} ข้อความ
        </span>
      </div>

      {/* Message Feed */}
      <div className="relative flex-1 min-h-0 flex flex-col">
        <div
          ref={listRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto px-3.5 py-3.5 space-y-3 bg-slate-950/35"
        >
          {loading ? (
            <div className="space-y-3 animate-pulse">
              {[0, 1, 2, 3].map((idx) => (
                <div key={idx} className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-white/15 shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 w-28 bg-white/15 rounded" />
                    <div className="h-10 w-4/5 bg-white/10 rounded-2xl" />
                  </div>
                </div>
              ))}
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center px-4 py-6">
              <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center text-sky-300 mb-3">
                <Sparkles className="w-6 h-6" />
              </div>
              <p className="text-sm font-black text-white">ยังไม่มีข้อความในแชทเวิลด์</p>
              <p className="text-xs text-slate-300 mt-1 mb-4">
                ทักทายเพื่อนๆ หรือกดแชร์ห้องสอบเพื่อหาคนร่วมแข่งขันได้เลย
              </p>
              {user && (
                <div className="flex flex-wrap justify-center gap-2">
                  {QUICK_STARTERS.map((starter) => (
                    <button
                      key={starter}
                      type="button"
                      onClick={() => handleSubmit(null, starter)}
                      disabled={sending}
                      className="text-xs font-bold px-3 py-1.5 rounded-full bg-white/12 hover:bg-white/22 text-sky-100 border border-white/20 transition-all cursor-pointer"
                    >
                      {starter}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = Boolean(user?.id && String(user.id) === String(msg.user_id));
              const isAdminMsg = String(msg.role || '').toLowerCase() === 'admin';
              const canDelete = Boolean(
                user && (isMe || String(user.role || '').toLowerCase() === 'admin')
              );
              const initial = (msg.display_name || '?').trim().charAt(0).toUpperCase();

              return (
                <div key={msg.id} className="group flex items-start gap-2.5">
                  {msg.avatar ? (
                    <img
                      src={msg.avatar}
                      alt={msg.display_name}
                      className="w-8 h-8 rounded-full object-cover border border-white/25 shrink-0 mt-0.5"
                    />
                  ) : (
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black border border-white/25 shrink-0 mt-0.5 ${
                        isMe
                          ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-slate-950'
                          : 'bg-gradient-to-br from-sky-400 to-indigo-600 text-white'
                      }`}
                    >
                      {initial}
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span
                        className={`text-xs font-extrabold truncate max-w-[135px] ${
                          isMe ? 'text-amber-300' : 'text-sky-200'
                        }`}
                      >
                        {msg.display_name}
                      </span>
                      <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-amber-400/15 text-amber-200 border border-amber-300/25 leading-none">
                        Lv.{msg.level || 1}
                      </span>
                      {isAdminMsg && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-black px-1.5 py-0.5 rounded-md bg-rose-500/25 text-rose-200 border border-rose-400/35 leading-none">
                          <Shield className="w-2.5 h-2.5" />
                          ADMIN
                        </span>
                      )}
                      <span className="text-[11px] text-slate-400 font-semibold">
                        {formatThaiTime(msg.created_at)}
                      </span>
                      {canDelete && (
                        <button
                          type="button"
                          onClick={() => handleDelete(msg.id)}
                          aria-label="ลบข้อความ"
                          title="ลบข้อความ"
                          className="ml-auto opacity-70 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100 text-slate-400 hover:text-rose-300 p-1 rounded-lg hover:bg-rose-500/15 transition-all cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div
                      className={`mt-1 px-3 py-2 rounded-2xl rounded-tl-sm text-sm leading-relaxed break-words whitespace-pre-wrap ${
                        isMe
                          ? 'bg-indigo-500/30 border border-indigo-400/35 text-white'
                          : 'bg-white/10 border border-white/15 text-slate-100'
                      }`}
                    >
                      {msg.message}

                      {msg.room_code && (
                        <div className="mt-2 p-2.5 rounded-xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-400/35 flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 text-[11px] font-black text-emerald-200">
                              <Ticket className="w-3.5 h-3.5 shrink-0" />
                              <span>รหัส {msg.room_code}</span>
                            </div>
                            <div className="text-xs font-extrabold text-white truncate mt-0.5">
                              {msg.room_name || 'ห้องสอบกลุ่ม'}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => onJoinRoom?.(msg.room_code)}
                            className="shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black shadow-md transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
                          >
                            <Play className="w-3 h-3 fill-current" />
                            <span>เข้าห้องเลย</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {showScrollBottom && (
          <button
            type="button"
            onClick={() => scrollToBottom('smooth')}
            className="absolute bottom-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black shadow-lg transition-all cursor-pointer"
          >
            <ArrowDown className="w-3.5 h-3.5" />
            <span>ข้อความใหม่</span>
          </button>
        )}
      </div>

      {/* Footer / Composer */}
      {user ? (
        <div className="p-3 bg-slate-950/75 border-t border-white/15 shrink-0 space-y-2">
          {showRoomPicker && (
            <div className="bg-slate-900/95 border border-white/20 rounded-2xl p-2.5 max-h-40 overflow-y-auto space-y-1.5">
              <div className="flex items-center justify-between px-1 mb-1">
                <span className="text-xs font-extrabold text-sky-200 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" />
                  <span>เลือกห้องที่เปิดรออยู่เพื่อแนบคำเชิญ</span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowRoomPicker(false)}
                  aria-label="ปิดตัวเลือกห้อง"
                  className="text-slate-400 hover:text-white p-0.5 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              {waitingRooms.length === 0 ? (
                <p className="text-xs text-slate-400 px-2 py-2 text-center">
                  ยังไม่มีห้องที่รอแข่งอยู่ สร้างห้องใหม่ด้านบนได้เลย!
                </p>
              ) : (
                waitingRooms.slice(0, 8).map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => {
                      setSelectedRoom({ code: r.code, name: r.name });
                      setShowRoomPicker(false);
                    }}
                    className="w-full text-left px-2.5 py-2 rounded-xl bg-white/8 hover:bg-white/16 border border-white/10 flex items-center justify-between gap-2 transition-colors cursor-pointer"
                  >
                    <span className="text-xs font-bold text-white truncate">{r.name}</span>
                    <span className="text-[11px] font-black text-emerald-300 bg-emerald-500/15 border border-emerald-400/25 px-2 py-0.5 rounded-md shrink-0">
                      {r.code}
                    </span>
                  </button>
                ))
              )}
            </div>
          )}

          {selectedRoom && (
            <div className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-xs">
              <span className="font-bold text-emerald-100 truncate">
                แนบคำเชิญ: {selectedRoom.name} ({selectedRoom.code})
              </span>
              <button
                type="button"
                onClick={clearAttachedRoom}
                aria-label="ยกเลิกแนบห้อง"
                className="text-emerald-200 hover:text-white shrink-0 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <form onSubmit={(e) => handleSubmit(e)} className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowRoomPicker((prev) => !prev)}
              aria-label="แนบคำเชิญห้องสอบ"
              title="แนบคำเชิญห้องสอบ"
              className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 ${
                selectedRoom || showRoomPicker
                  ? 'bg-emerald-500/25 border-emerald-400/60 text-emerald-200'
                  : 'bg-white/10 hover:bg-white/18 border-white/20 text-slate-200'
              }`}
            >
              <Share2 className="w-4 h-4" />
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              maxLength={300}
              placeholder={selectedRoom ? 'พิมพ์ข้อความชวนเพื่อนเข้าห้อง...' : 'พิมพ์คุยในแชทเวิลด์...'}
              aria-label="พิมพ์ข้อความแชทเวิลด์"
              className="min-w-0 flex-1 bg-white/10 border border-white/20 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:border-sky-400 focus-visible:ring-2 focus-visible:ring-sky-400"
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              aria-label="ส่งข้อความแชทเวิลด์"
              className="bg-gradient-to-r from-sky-500 to-indigo-600 hover:brightness-110 disabled:opacity-45 disabled:cursor-not-allowed text-white w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-md shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          {input.length > 220 && (
            <div className="text-[11px] font-bold text-right text-amber-200/90 pr-1">
              {input.length} / 300
            </div>
          )}
        </div>
      ) : (
        <div className="p-3.5 bg-slate-950/75 border-t border-white/15 flex items-center justify-between gap-3 shrink-0">
          <p className="text-xs font-bold text-slate-300 leading-snug">
            เข้าสู่ระบบเพื่อพิมพ์พูดคุยและชวนเพื่อนเข้าห้องสอบ
          </p>
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 text-xs font-black shadow-md hover:brightness-105 transition-all cursor-pointer"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>เข้าสู่ระบบ</span>
          </button>
        </div>
      )}
    </section>
  );
}
