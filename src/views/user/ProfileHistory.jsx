import React, { useState, useEffect } from 'react';
import { Clock, Trophy, Target } from 'lucide-react';
import examService from '../../services/examService';

const ProfileHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const res = await examService.getHistory();
        if (res.success && res.data) {
          setHistory(res.data);
        } else if (Array.isArray(res)) {
          setHistory(res);
        } else if (res.data) {
          setHistory(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  if (loading) {
    return (
      <div className="py-12 text-center text-white/75 font-bold">
        กำลังโหลดประวัติการสอบ...
      </div>
    );
  }

  return (
    <div id="sec-history">
      <div className="section-title" style={{ marginBottom: '20px', fontSize: '20px' }}>
        <div className="dot" />
        <Clock size={20} className="text-amber-300" />
        <span>History</span>
      </div>

      {history.length === 0 ? (
        <div className="activity-card py-10 text-center text-white/75 font-semibold">
          <Clock size={32} className="mx-auto mb-3 opacity-60" />
          <div>ยังไม่มีประวัติการทำข้อสอบ</div>
        </div>
      ) : (
        <div className="activity-card" style={{ animation: 'fadeSlideIn 0.4s both' }}>
          {history.map((item, index) => {
            const modeLabel =
              item.mode === 'classroom'
                ? 'Multiplayer Class'
                : item.mode === 'simulation'
                  ? 'Simulation Exam'
                  : item.mode === 'practice'
                    ? 'Practice Mode'
                    : 'General Exam';

            const dateStr = item.taken_at || item.createdAt || Date.now();
            const timeStr = item.time_taken
              ? ` • เวลา: ${Math.floor(item.time_taken / 60)}m ${item.time_taken % 60}s`
              : '';
            const xpEarned = (item.score || 0) * 10;
            const isHigh = (item.score || 0) >= (item.total_score || 10) * 0.7;

            return (
              <div
                className="activity-item flex-wrap sm:flex-nowrap"
                key={item.id || item._id || index}
                style={{ padding: '14px 10px' }}
              >
                <div className={`act-icon ${isHigh ? 'y' : 't'}`}>
                  {isHigh ? <Trophy size={19} strokeWidth={2.2} /> : <Target size={19} strokeWidth={2.2} />}
                </div>
                <div className="act-body">
                  <div className="act-title" style={{ fontSize: '15px' }}>
                    {modeLabel}
                  </div>
                  <div className="act-sub" style={{ fontSize: '13px', marginTop: '3px' }}>
                    คะแนน: <strong className="text-white">{item.score || 0}</strong> /{' '}
                    {item.total_score || 0}
                    {timeStr}
                  </div>
                  {item.subject_scores && Object.keys(item.subject_scores).length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {Object.entries(item.subject_scores).map(([subj, subjData]) => (
                        <span
                          key={subj}
                          className="rounded-full border border-white/15 bg-white/10 px-2.5 py-0.5 text-[11px] font-semibold text-white/90"
                        >
                          {subj} {subjData.score}/{subjData.total}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="act-right" style={{ minWidth: '96px' }}>
                  <div className="act-pts y">+{xpEarned} XP</div>
                  <div className="act-time">
                    {new Date(dateStr).toLocaleString('th-TH', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProfileHistory;
