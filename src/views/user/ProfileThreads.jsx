import React, { useEffect, useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { MessageSquare, Clock, Eye, Heart, MessageCircle, Trash2, Sparkles } from 'lucide-react';
import communityService from '../../services/communityService';

const ProfileThreads = () => {
  const { user } = useOutletContext();
  const navigate = useNavigate();
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchThreads = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await communityService.getUserThreads(user.id);
      setThreads(res?.data || res || []);
    } catch (err) {
      console.error('Error fetching user threads:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchThreads();
  }, [user?.id]);

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('คุณต้องการลบกระทู้นี้ใช่หรือไม่?')) return;
    try {
      await communityService.deleteThread(id);
      setThreads((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error('Failed to delete thread', err);
      alert('ไม่สามารถลบกระทู้ได้');
    }
  };

  return (
    <div id="sec-threads">
      <div className="section-title" style={{ marginBottom: '20px', fontSize: '20px' }}>
        <div className="dot" />
        <MessageSquare size={20} className="text-amber-300" />
        <span>กระทู้ของฉัน</span>
      </div>

      {loading ? (
        <div className="py-10 text-center text-white/75 font-bold">กำลังโหลดกระทู้...</div>
      ) : threads.length > 0 ? (
        <div className="flex flex-col gap-3" style={{ animation: 'fadeSlideIn 0.4s both' }}>
          {threads.map((thread, i) => (
            <div
              key={thread.id || i}
              onClick={() => navigate(`/community?threadId=${thread.id}`)}
              className="activity-card relative cursor-pointer transition-transform duration-200 hover:-translate-y-0.5"
            >
              <div className="flex items-start gap-3">
                <div className="act-icon b mt-0.5">
                  <MessageSquare size={18} />
                </div>
                <div className="min-w-0 flex-1 pr-10">
                  <div className="font-extrabold text-base text-white mb-1 truncate">
                    {thread.title || 'Untitled Thread'}
                  </div>
                  <div className="text-white/75 text-sm mb-2.5 line-clamp-2">
                    {thread.content?.replace(/<[^>]+>/g, '') || 'No content'}
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-white/70 font-semibold">
                    <span className="inline-flex items-center gap-1">
                      <Clock size={13} />
                      {new Date(thread.created_at).toLocaleDateString('th-TH')}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Eye size={13} />
                      {thread.stats?.views || 0}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Heart size={13} className="text-rose-300" />
                      {thread.stats?.likes || 0}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MessageCircle size={13} className="text-emerald-300" />
                      {thread.stats?.comments_count || 0}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => handleDelete(e, thread.id)}
                  aria-label="ลบกระทู้"
                  title="ลบกระทู้"
                  className="absolute right-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-full bg-rose-500/15 text-rose-300 transition-colors hover:bg-rose-500/30 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-white/25 bg-white/10 p-8 text-center text-white/80 backdrop-blur-md">
          <div className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-emerald-300">
            <Sparkles size={24} />
          </div>
          <div className="font-black text-white">ยังไม่มีกระทู้</div>
          <div className="mt-1 text-sm text-white/70">กระทู้ที่คุณสร้างจะแสดงที่นี่</div>
        </div>
      )}
    </div>
  );
};

export default ProfileThreads;
