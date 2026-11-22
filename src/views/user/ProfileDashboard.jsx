import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  User,
  HelpCircle,
  Crown,
  Trophy,
  Zap,
  Flame,
  Sparkles,
  CheckCircle2,
  Loader2,
  Target,
  Heart,
  Gamepad2,
  Award,
  Users,
  Medal,
  Star,
} from 'lucide-react';
import examService from '../../services/examService';
import api from '../../services/api';
import ExpGuideModal from '../../components/ExpGuideModal';
import toast from 'react-hot-toast';
import useUserRole from '../../hooks/useUserRole';

const ProfileDashboard = () => {
  const { user, stats, xpInfo } = useOutletContext();
  const { isPremium } = useUserRole();
  const [recentHistory, setRecentHistory] = useState([]);
  const [isExpGuideOpen, setIsExpGuideOpen] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [hasClaimed, setHasClaimed] = useState(false);
  const [localStreak, setLocalStreak] = useState(0);

  // Sync initial user state
  useEffect(() => {
    if (user) {
      setLocalStreak(user.streak_count || 0);
    }
  }, [user]);

  // Check if claimed today locally (best effort)
  useEffect(() => {
    if (user?.last_claim_date) {
      const todayStr = new Date().toISOString().split('T')[0];
      if (user.last_claim_date === todayStr) {
        setHasClaimed(true);
      }
    }
  }, [user]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await examService.getHistory();
        if (res.success && res.data) {
          setRecentHistory(res.data.slice(0, 4));
        }
      } catch (err) {
        console.error('Error fetching history', err);
      }
    };
    fetchHistory();
  }, []);

  const handleClaimStreak = async () => {
    if (isClaiming || hasClaimed) return;
    setIsClaiming(true);
    try {
      const res = await api.post('/users/claim-streak');
      const data = res.data;
      if (data.success) {
        toast.success(`ยินดีด้วย! คุณได้รับ ${data.data.xpGained} EXP`);
        setHasClaimed(true);
        if (data.data.newStreak !== undefined) {
          setLocalStreak(data.data.newStreak);
        }
        if (data.data.levelUp) {
          setTimeout(() => toast.success(`เลเวลอัปเป็น LVL ${data.data.levelUp}!`), 1000);
        }
      } else {
        if (data.message === 'Already claimed today') {
          setHasClaimed(true);
          toast.error('รับไปแล้ววันนี้ พรุ่งนี้มารับใหม่นะ!');
        } else {
          toast.error(data.message || 'เกิดข้อผิดพลาด');
        }
      }
    } catch (e) {
      toast.error('Network error');
    } finally {
      setIsClaiming(false);
    }
  };

  const totalGames = stats ? stats.totalExams : 0;
  const timeTakenMinutes = stats ? Math.round(stats.timeTaken / 60) : 0;
  const displayName = user?.display_name || 'Guest';
  const winRate = stats?.totalExams ? Math.round((stats?.gamesWon / stats?.totalExams) * 100) : 0;

  return (
    <div id="sec-dashboard">
      <ExpGuideModal isOpen={isExpGuideOpen} onClose={() => setIsExpGuideOpen(false)} />

      {/* Profile Hero */}
      <div className="profile-hero">
        <div className="avatar-big">
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={displayName}
              style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
            />
          ) : (
            <User size={38} strokeWidth={2.2} />
          )}
          <button
            type="button"
            className="level-badge"
            onClick={() => setIsExpGuideOpen(true)}
            aria-label="ดูคู่มือ Level และ EXP"
            title="คู่มือ Level & EXP"
          >
            <span>LVL {xpInfo?.level || user?.level || 1}</span>
            <HelpCircle size={12} strokeWidth={2.5} />
          </button>
        </div>

        <div className="profile-info">
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <span>{displayName}</span>
            {isPremium && (
              <span
                style={{
                  fontSize: '0.44em',
                  background: 'linear-gradient(135deg, #fde047 0%, #f59e0b 100%)',
                  color: '#1a0533',
                  padding: '5px 12px',
                  borderRadius: '999px',
                  fontWeight: '900',
                  letterSpacing: '0.8px',
                  textTransform: 'uppercase',
                  boxShadow: '0 4px 16px rgba(245, 158, 11, 0.45)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                }}
              >
                <Crown size={13} strokeWidth={2.6} />
                PREMIUM
              </span>
            )}
          </h1>
          <div className="handle">
            @{(user?.public_id || 'player').substring(0, 8)} · เข้าร่วมแล้ว{' '}
            {user?.created_at ? new Date(user.created_at).toLocaleDateString('th-TH') : 'เพิ่งเข้าร่วม'}
          </div>
          <div className="profile-chips">
            <span className="chip yellow">
              <Trophy size={13} strokeWidth={2.4} />
              <span>Champion</span>
            </span>
            <span className="chip teal">
              <Zap size={13} strokeWidth={2.4} />
              <span>Speed Runner</span>
            </span>
            {localStreak > 0 && (
              <span className="chip red">
                <Flame size={13} strokeWidth={2.4} />
                <span>{localStreak}-Day Streak</span>
              </span>
            )}
          </div>
        </div>

        <div className="profile-stats">
          <div className="stat-box">
            <span className="stat-num y">{xpInfo?.currentXP?.toLocaleString() || 0}</span>
            <div className="stat-lbl">XP Total</div>
          </div>
          <div className="stat-box">
            <span className="stat-num" style={{ color: '#c4b5fd' }}>
              {stats?.ranking?.total_score?.toLocaleString() || 0}
            </span>
            <div className="stat-lbl">Season Score</div>
          </div>
          <div className="stat-box">
            <span className="stat-num t">{totalGames}</span>
            <div className="stat-lbl">Games Played</div>
          </div>
          <div className="stat-box">
            <span className="stat-num o">{timeTakenMinutes}m</span>
            <div className="stat-lbl">Time Played</div>
          </div>
        </div>
      </div>

      {/* Streak + Quick Stats */}
      <div className="grid-2" style={{ marginBottom: '26px' }}>
        <div className="streak-card">
          <div className="streak-fire" aria-hidden="true">
            <Flame size={38} strokeWidth={2.2} />
          </div>
          <div>
            <div className="streak-num">{localStreak}</div>
            <div className="streak-label">DAY STREAK — สะสมความต่อเนื่องทุกวัน!</div>
            <button
              type="button"
              className="btn-play"
              style={{
                marginTop: '12px',
                opacity: hasClaimed ? 0.65 : 1,
                cursor: hasClaimed || isClaiming ? 'not-allowed' : 'pointer',
              }}
              onClick={handleClaimStreak}
              disabled={isClaiming || hasClaimed}
            >
              {isClaiming ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>กำลังรับ...</span>
                </>
              ) : hasClaimed ? (
                <>
                  <CheckCircle2 size={16} strokeWidth={2.5} />
                  <span>รับรางวัลวันนี้แล้ว</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} strokeWidth={2.5} />
                  <span>รับโบนัส Streak วันนี้!</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="skills-card">
          <div className="section-title" style={{ marginBottom: '16px' }}>
            <div className="dot" />
            <span>Skills Progress</span>
          </div>
          <div className="progress-row">
            <div className="progress-label">
              <span>
                <Target size={15} className="text-emerald-300" />
                Overall Accuracy
              </span>
              <span>{stats?.accuracy || 0}%</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill t" style={{ width: `${stats?.accuracy || 0}%` }} />
            </div>
          </div>
          <div className="progress-row">
            <div className="progress-label">
              <span>
                <Trophy size={15} className="text-amber-300" />
                Win Rate
              </span>
              <span>{winRate}%</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill y" style={{ width: `${winRate}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="section-title">
        <div className="dot" />
        <span>สถิติทั้งหมด</span>
      </div>
      <div className="grid-3">
        <div className="stat-card yellow">
          <span className="sc-icon yellow">
            <Trophy size={22} strokeWidth={2.2} />
          </span>
          <div className="sc-value" style={{ color: '#fde047' }}>
            {stats?.gamesWon || 0}
          </div>
          <div className="sc-label">Games Won</div>
        </div>

        <div className="stat-card teal">
          <span className="sc-icon teal">
            <Zap size={22} strokeWidth={2.2} />
          </span>
          <div className="sc-value" style={{ color: '#34d399' }}>
            {stats?.avgAnswerTime || '0.0'}s
          </div>
          <div className="sc-label">Avg Answer Time</div>
        </div>

        <div className="stat-card red">
          <span className="sc-icon red">
            <Heart size={22} strokeWidth={2.2} />
          </span>
          <div className="sc-value" style={{ color: '#fda4af' }}>
            {stats?.accuracy || 0}%
          </div>
          <div className="sc-label">Accuracy</div>
        </div>

        <div className="stat-card blue">
          <span className="sc-icon blue">
            <Gamepad2 size={22} strokeWidth={2.2} />
          </span>
          <div className="sc-value" style={{ color: '#93c5fd' }}>
            {stats?.totalExams || 0}
          </div>
          <div className="sc-label">Total Games</div>
        </div>

        <div className="stat-card orange">
          <span className="sc-icon orange">
            <Award size={22} strokeWidth={2.2} />
          </span>
          <div className="sc-value" style={{ color: '#fdba74' }}>
            {stats?.badgesEarned || 0}
          </div>
          <div className="sc-label">Badges Earned</div>
        </div>

        <div className="stat-card purple">
          <span className="sc-icon purple">
            <Users size={22} strokeWidth={2.2} />
          </span>
          <div className="sc-value" style={{ color: '#d8b4fe' }}>
            {stats?.friendsCount || 0}
          </div>
          <div className="sc-label">Friends</div>
        </div>
      </div>

      {/* Activity + Leaderboard */}
      <div className="grid-2">
        <div>
          <div className="section-title">
            <div className="dot" />
            <span>กิจกรรมล่าสุด</span>
          </div>
          <div className="activity-card">
            {recentHistory.length > 0 ? (
              recentHistory.map((item, index) => {
                const isHigh = item.score >= (item.total_score || 10) * 0.8;
                return (
                  <div className="activity-item" key={item.id || index}>
                    <div className={`act-icon ${index % 2 === 0 ? 'y' : 't'}`}>
                      {isHigh ? <Trophy size={18} strokeWidth={2.2} /> : <Target size={18} strokeWidth={2.2} />}
                    </div>
                    <div className="act-body">
                      <div className="act-title">{item.exam_set || 'Quiz Challenge'}</div>
                      <div className="act-sub">
                        ได้คะแนน {item.score} / {item.total_score || '?'}
                      </div>
                    </div>
                    <div className="act-right">
                      <div className={`act-pts ${index % 2 === 0 ? 'y' : 't'}`}>+{item.score * 10} XP</div>
                      <div className="act-time">{new Date(item.taken_at).toLocaleDateString('th-TH')}</div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ padding: '20px', color: 'var(--text-muted)', textAlign: 'center', fontSize: '14px' }}>
                ยังไม่มีประวัติการทำข้อสอบ
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="section-title">
            <div className="dot" />
            <span>Leaderboard สัปดาห์นี้</span>
          </div>
          <div className="lb-card">
            <div className="lb-row" style={{ opacity: 0.72 }}>
              <div className="lb-rank gold">
                <Medal size={18} strokeWidth={2.3} />
              </div>
              <div className="lb-avatar" style={{ background: 'rgba(253, 224, 71, 0.2)', color: '#fde047' }}>
                <Crown size={16} strokeWidth={2.3} />
              </div>
              <div className="lb-name">Top Player 1</div>
              <div className="lb-score">? XP</div>
            </div>
            <div className="lb-row" style={{ opacity: 0.72 }}>
              <div className="lb-rank silver">
                <Medal size={18} strokeWidth={2.3} />
              </div>
              <div className="lb-avatar" style={{ background: 'rgba(203, 213, 225, 0.18)', color: '#e2e8f0' }}>
                <Zap size={16} strokeWidth={2.3} />
              </div>
              <div className="lb-name">Top Player 2</div>
              <div className="lb-score">? XP</div>
            </div>
            <div className="lb-row me" style={{ marginTop: '10px' }}>
              <div className="lb-rank me-r">
                <Star size={17} strokeWidth={2.4} />
              </div>
              <div
                className="lb-avatar"
                style={{ background: 'rgba(249, 115, 22, 0.28)', color: '#fdba74', overflow: 'hidden' }}
              >
                {user?.avatar ? (
                  <img src={user.avatar} alt={displayName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <User size={16} strokeWidth={2.3} />
                )}
              </div>
              <div className="lb-name" style={{ color: '#fde047' }}>
                {user?.display_name || 'You'}
              </div>
              <div className="lb-score">{xpInfo?.currentXP?.toLocaleString() || 0} XP</div>
            </div>
          </div>

          {/* Achievements */}
          <div style={{ marginTop: '18px' }}>
            <div className="section-title">
              <div className="dot" />
              <span>Badges ล่าสุด</span>
            </div>
            <div className="achievements-card">
              <div className="flex items-center gap-3 text-sm font-semibold text-white/80">
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-300/35 bg-amber-400/15 text-amber-300">
                  <Award size={20} />
                </span>
                <div>
                  <div className="font-bold text-white">ระบบ Badges กำลังจะมาเร็วๆ นี้!</div>
                  <div className="text-xs text-white/65">
                    สะสม XP และสถิติการสอบเพื่อปลดล็อกเหรียญตราพิเศษ
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileDashboard;
