import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, User, Check, X, MessageSquare, UserPlus } from 'lucide-react';
import friendService from '../../services/friendService';

const ProfileFriends = () => {
  const navigate = useNavigate();
  const [friends, setFriends] = useState([]);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFriendsData = async () => {
      try {
        const [friendsRes, pendingRes] = await Promise.all([
          friendService.getFriends(),
          friendService.getPendingRequests(),
        ]);
        setFriends(friendsRes?.data || friendsRes || []);
        setPending(pendingRes?.data || pendingRes || []);
      } catch (err) {
        console.error('Error fetching friends:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFriendsData();
  }, []);

  const handleAccept = async (id) => {
    try {
      await friendService.acceptRequest(id);
      const acceptedUser = pending.find((req) => req.id === id);
      if (acceptedUser) {
        setFriends((prev) => [...prev, acceptedUser]);
      }
      setPending((prev) => prev.filter((req) => req.id !== id));
    } catch (err) {
      console.error('Error accepting friend:', err);
    }
  };

  const handleRemove = async (id) => {
    try {
      await friendService.removeFriend(id);
      setFriends((prev) => prev.filter((f) => f.id !== id));
      setPending((prev) => prev.filter((req) => req.id !== id));
    } catch (err) {
      console.error('Error removing friend:', err);
    }
  };

  return (
    <div id="sec-friends">
      <div className="section-title" style={{ marginBottom: '20px', fontSize: '20px' }}>
        <div className="dot" />
        <Users size={20} className="text-amber-300" />
        <span>Friends</span>
      </div>

      {loading ? (
        <div className="py-10 text-center text-white/75 font-bold">กำลังโหลดรายชื่อเพื่อน...</div>
      ) : (
        <div className="grid-2" style={{ animation: 'fadeSlideIn 0.4s both' }}>
          <div className="activity-card">
            <div className="mb-4 flex items-center gap-2 text-sm font-black text-white">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-300 shadow-[0_0_8px_rgba(253,224,71,0.7)]" />
              <span>เพื่อนของคุณ ({friends.length})</span>
            </div>
            <div className="flex flex-col gap-2.5">
              {friends.length > 0 ? (
                friends.map((friend, i) => (
                  <div
                    key={friend.id || i}
                    className="flex items-center gap-3 rounded-xl p-2.5 transition-colors hover:bg-white/10"
                  >
                    <div className="relative shrink-0">
                      <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-orange-500 to-rose-600 text-white border border-white/25">
                        {friend.avatar ? (
                          <img
                            src={
                              friend.avatar.startsWith('http')
                                ? friend.avatar
                                : `https://preexam.online${friend.avatar}`
                            }
                            alt={friend.display_name || friend.username || 'Avatar'}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <User size={18} />
                        )}
                      </div>
                      <span
                        className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[#2d0d6b] ${
                          friend.isOnline ? 'bg-emerald-400' : 'bg-orange-400'
                        }`}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-extrabold text-white">
                        {friend.display_name || friend.username || 'User'}
                      </div>
                      <div
                        className={`text-[11px] font-semibold ${
                          friend.isOnline ? 'text-emerald-300' : 'text-white/65'
                        }`}
                      >
                        {friend.isOnline ? 'Online' : 'Offline'}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigate('/profile/messages', { state: { friend } })}
                      className="btn-outline shrink-0"
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                    >
                      <MessageSquare size={13} />
                      <span>ทักทาย</span>
                    </button>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-sm text-white/70 font-semibold">
                  ยังไม่มีเพื่อนในรายชื่อ
                </div>
              )}
            </div>
          </div>

          <div className="activity-card">
            <div className="mb-4 flex items-center gap-2 text-sm font-black text-white">
              <UserPlus size={16} className="text-amber-300" />
              <span>คำขอเป็นเพื่อน ({pending.length})</span>
            </div>
            <div className="flex flex-col gap-2.5">
              {pending.length > 0 ? (
                pending.map((req, i) => (
                  <div
                    key={req.id || i}
                    className="flex items-center gap-3 rounded-xl p-2.5 transition-colors hover:bg-white/10"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-amber-400/15 text-amber-300 border border-amber-300/30">
                      {req.avatar ? (
                        <img
                          src={
                            req.avatar.startsWith('http')
                              ? req.avatar
                              : `https://preexam.online${req.avatar}`
                          }
                          alt={req.display_name || 'Avatar'}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <User size={18} />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-extrabold text-white">
                        {req.display_name || 'User'}
                      </div>
                      <div className="text-[11px] text-white/70">ต้องการเป็นเพื่อนกับคุณ</div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleAccept(req.id)}
                        aria-label="ตอบรับคำขอเป็นเพื่อน"
                        title="ตอบรับ"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-amber-300 text-slate-950 font-black transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                      >
                        <Check size={15} strokeWidth={2.8} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemove(req.id)}
                        aria-label="ปฏิเสธคำขอเป็นเพื่อน"
                        title="ปฏิเสธ"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white transition-colors hover:bg-rose-500/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
                      >
                        <X size={15} strokeWidth={2.5} />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-sm text-white/70 font-semibold">
                  ไม่มีคำขอเป็นเพื่อนใหม่
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileFriends;
