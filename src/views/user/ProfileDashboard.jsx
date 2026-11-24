import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
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
  Play,
  ArrowRight,
  Clock,
  Lock,
  BookOpen,
  ShieldCheck,
} from 'lucide-react';
import examService from '../../services/examService';
import userService from '../../services/userService';
import friendService from '../../services/friendService';
import api from '../../services/api';
import ExpGuideModal from '../../components/ExpGuideModal';
import toast from 'react-hot-toast';
import useUserRole from '../../hooks/useUserRole';

const RadialGauge = ({ value = 0, label, sublabel, color = '#34d399', trackColor = 'rgba(255,255,255,0.12)' }) => {
  const clamped = Math.max(0, Math.min(100, Number(value) || 0));
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clamped / 100) * circumference;

  return (
    <div
      className="radial-gauge-item"
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`${label} ${clamped}%`}
    >
      <div className="radial-gauge-svg-wrap">
        <svg viewBox="0 0 84 84" className="radial-gauge-svg" aria-hidden="true">
          <circle cx="42" cy="42" r={radius} fill="none" stroke={trackColor} strokeWidth="7" />
          <circle
            cx="42"
            cy="42"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="radial-gauge-arc"
          />
        </svg>
        <span className="radial-gauge-val" style={{ color }}>
          {clamped}%
        </span>
      </div>
      <div className="radial-gauge-meta">
        <div className="radial-gauge-label">{label}</div>
        <div className="radial-gauge-sub">{sublabel}</div>
      </div>
    </div>
  );
};

const computeAchievements = ({
  totalExams,
  gamesWon,
  accuracy,
  avgAnswerTime,
  localStreak,
  currentXP,
}) => {
  const avgSec = Number(avgAnswerTime) || 0;
  return [
    {
      id: 'first-step',
      title: 'ก้าวแรกสู่สนาม',
      requirement: 'ทำข้อสอบ 1 ชุด',
      progress: `${Math.min(totalExams, 1)}/1`,
      unlocked: totalExams >= 1,
      Icon: BookOpen,
      tone: 'teal',
    },
    {
      id: 'quiz-veteran',
      title: 'นักสู้คลังข้อสอบ',
      requirement: 'ทำข้อสอบ 10 ชุด',
      progress: `${Math.min(totalExams, 10)}/10`,
      unlocked: totalExams >= 10,
      Icon: Gamepad2,
      tone: 'blue',
    },
    {
      id: 'sharp-shooter',
      title: 'แม่นยำระดับเซียน',
      requirement: 'แม่นยำ ≥ 80% (≥3 ชุด)',
      progress: `${accuracy}%`,
      unlocked: accuracy >= 80 && totalExams >= 3,
      Icon: Target,
      tone: 'emerald',
    },
    {
      id: 'champion',
      title: 'ผู้พิชิต 80%+',
      requirement: 'ผ่านเกณฑ์ 5 ครั้ง',
      progress: `${Math.min(gamesWon, 5)}/5`,
      unlocked: gamesWon >= 5,
      Icon: Trophy,
      tone: 'yellow',
    },
    {
      id: 'speed-runner',
      title: 'สายฟ้าแลบ',
      requirement: 'เฉลี่ย ≤ 20 วิ/ข้อ',
      progress: totalExams > 0 && avgSec > 0 ? `${avgSec}s` : '-',
      unlocked: totalExams >= 1 && avgSec > 0 && avgSec <= 20,
      Icon: Zap,
      tone: 'orange',
    },
    {
      id: 'on-fire',
      title: 'ไฟแรงต่อเนื่อง',
      requirement: 'Streak 3 วันติด',
      progress: `${Math.min(localStreak, 3)}/3 วัน`,
      unlocked: localStreak >= 3,
      Icon: Flame,
      tone: 'red',
    },
    {
      id: 'week-warrior',
      title: 'วินัยครบสัปดาห์',
      requirement: 'Streak 7 วันติด',
      progress: `${Math.min(localStreak, 7)}/7 วัน`,
      unlocked: localStreak >= 7,
      Icon: ShieldCheck,
      tone: 'purple',
    },
    {
      id: 'xp-collector',
      title: 'นักสะสม XP',
      requirement: 'สะสม 5,000 XP',
      progress: `${Math.min(currentXP, 5000).toLocaleString()}/5K`,
      unlocked: currentXP >= 5000,
      Icon: Sparkles,
      tone: 'yellow',
    },
  ];
};

const buildSevenDayTracker = (heatmapDays, hasClaimedToday, localStreak) => {
  const mapByDate = new Map();
  if (Array.isArray(heatmapDays)) {
    heatmapDays.forEach((d) => {
      if (d?.date) mapByDate.set(String(d.date).split('T')[0], Number(d.value) || 0);
    });
  }

  const today = new Date();
  const days = [];
  for (let offset = 6; offset >= 0; offset -= 1) {
    const dt = new Date(today);
    dt.setDate(today.getDate() - offset);
    const iso = dt.toISOString().split('T')[0];
    const isToday = offset === 0;
    const examCount = mapByDate.get(iso) || 0;
    const streakCoversDay = localStreak > offset && (hasClaimedToday || !isToday);
    const active = examCount > 0 || (isToday && hasClaimedToday) || streakCoversDay;
    const label = isToday
      ? 'วันนี้'
      : dt.toLocaleDateString('th-TH', { weekday: 'short' }).replace('.', '');

    days.push({ iso, label, active, isToday, examCount });
  }
  return days;
};

const ProfileDashboard = () => {
  const navigate = useNavigate();
  const { user, stats, xpInfo, refreshProfile } = useOutletContext();
  const { isPremium } = useUserRole();

  const [recentHistory, setRecentHistory] = useState([]);
  const [heatmapDays, setHeatmapDays] = useState([]);
  const [radarStats, setRadarStats] = useState([]);
  const [rankings, setRankings] = useState([]);
  const [friendsCount, setFriendsCount] = useState(0);
  const [loadingWidgets, setLoadingWidgets] = useState(true);

  const [isExpGuideOpen, setIsExpGuideOpen] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [hasClaimed, setHasClaimed] = useState(false);
  const [localStreak, setLocalStreak] = useState(0);

  useEffect(() => {
    if (user) {
      setLocalStreak(user.streak_count || 0);
      if (user.last_claim_date) {
        const todayStr = new Date().toISOString().split('T')[0];
        setHasClaimed(user.last_claim_date === todayStr);
      }
    }
  }, [user]);

  useEffect(() => {
    let cancelled = false;
    const fetchWidgets = async () => {
      setLoadingWidgets(true);
      try {
        const [histRes, heatRes, radarRes, rankRes, friendRes] = await Promise.allSettled([
          examService.getHistory(),
          userService.getHeatmapStats(7),
          userService.getRadarStats(),
          api.get('/rankings'),
          friendService.getFriends(),
        ]);

        if (cancelled) return;

        if (histRes.status === 'fulfilled' && histRes.value?.success && Array.isArray(histRes.value.data)) {
          setRecentHistory(histRes.value.data.slice(0, 5));
        }

        if (heatRes.status === 'fulfilled') {
          const hd = heatRes.value?.data ?? heatRes.value;
          if (Array.isArray(hd)) setHeatmapDays(hd);
        }

        if (radarRes.status === 'fulfilled') {
          const rd = radarRes.value?.data ?? radarRes.value;
          if (Array.isArray(rd)) setRadarStats(rd);
        }

        if (rankRes.status === 'fulfilled') {
          const rList = rankRes.value?.data?.data ?? rankRes.value?.data;
          if (Array.isArray(rList)) setRankings(rList);
        }

        if (friendRes.status === 'fulfilled') {
          const fList = friendRes.value?.data ?? friendRes.value;
          if (Array.isArray(fList)) setFriendsCount(fList.length);
        }
      } catch (err) {
        console.error('Error loading dashboard widgets', err);
      } finally {
        if (!cancelled) setLoadingWidgets(false);
      }
    };

    fetchWidgets();
    return () => {
      cancelled = true;
    };
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
          setTimeout(() => toast.success(`เลเวลอัปเป็น LVL ${data.data.levelUp}!`), 900);
        }
        await refreshProfile?.();
      } else if (data.message === 'Already claimed today') {
        setHasClaimed(true);
        toast.error('รับไปแล้ววันนี้ พรุ่งนี้มารับใหม่นะ!');
      } else {
        toast.error(data.message || 'เกิดข้อผิดพลาด');
      }
    } catch (e) {
      toast.error('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้');
    } finally {
      setIsClaiming(false);
    }
  };

  const totalGames = stats?.totalExams || 0;
  const gamesWon = stats?.gamesWon || 0;
  const accuracy = stats?.accuracy || 0;
  const avgAnswerTime = stats?.avgAnswerTime || '0.0';
  const timeTakenMinutes = stats ? Math.round((stats.timeTaken || 0) / 60) : 0;
  const displayName = user?.display_name || 'Guest';
  const winRate = totalGames ? Math.round((gamesWon / totalGames) * 100) : 0;
  const currentXP = xpInfo?.currentXP || 0;
  const currentLevel = xpInfo?.level || 1;
  const xpToNext = Math.max(0, (xpInfo?.nextLevelXP || 2000) - currentXP);

  const badges = useMemo(
    () =>
      computeAchievements({
        totalExams: totalGames,
        gamesWon,
        accuracy,
        avgAnswerTime,
        localStreak,
        currentXP,
      }),
    [totalGames, gamesWon, accuracy, avgAnswerTime, localStreak, currentXP]
  );

  const unlockedBadgesCount = badges.filter((b) => b.unlocked).length;
  const sevenDayItems = useMemo(
    () => buildSevenDayTracker(heatmapDays, hasClaimed, localStreak),
    [heatmapDays, hasClaimed, localStreak]
  );

  const topRankings = useMemo(() => rankings.slice(0, 5), [rankings]);
  const myRankIndex = useMemo(() => {
    if (!user || !rankings.length) return -1;
    return rankings.findIndex(
      (r) => String(r.user_id) === String(user.id) || (user.display_name && r.user_name === user.display_name)
    );
  }, [rankings, user]);
  const mySeasonScore =
    myRankIndex >= 0 ? Number(rankings[myRankIndex]?.total_score) || 0 : stats?.ranking?.total_score || 0;
  const isUserInTop5 = myRankIndex >= 0 && myRankIndex < 5;

  const hasSubjectData = radarStats.some((r) => (Number(r.score) || 0) > 0);
  const subjectColors = ['t', 'b', 'y', 'r'];

  return (
    <div id="sec-dashboard" className="dashboard-bento">
      <ExpGuideModal isOpen={isExpGuideOpen} onClose={() => setIsExpGuideOpen(false)} />

      {/* ─── Row 1: Elevated Glassmorphic Profile Hero ─── */}
      <section className="profile-hero" aria-label="ข้อมูลโปรไฟล์หลัก">
        <div className="profile-hero-left">
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
              <span>LVL {currentLevel}</span>
              <HelpCircle size={12} strokeWidth={2.5} />
            </button>
          </div>

          <div className="profile-info">
            <div className="profile-name-row">
              <h1>{displayName}</h1>
              {isPremium && (
                <span className="premium-pill">
                  <Crown size={13} strokeWidth={2.6} />
                  <span>PREMIUM</span>
                </span>
              )}
            </div>

            <div className="handle">
              @{(user?.public_id || 'player').substring(0, 8)} · เข้าร่วม{' '}
              {user?.created_at ? new Date(user.created_at).toLocaleDateString('th-TH') : 'เพิ่งเข้าร่วม'} · อีก{' '}
              <strong className="text-emerald-300 tabular-nums">{xpToNext.toLocaleString()} XP</strong> ถึง LVL{' '}
              {currentLevel + 1}
            </div>

            <div className="profile-chips">
              <span className="chip yellow">
                <Award size={13} strokeWidth={2.4} />
                <span>
                  {unlockedBadgesCount}/{badges.length} Badges
                </span>
              </span>
              {totalGames > 0 ? (
                <span className="chip teal">
                  <Target size={13} strokeWidth={2.4} />
                  <span>ความแม่นยำ {accuracy}%</span>
                </span>
              ) : (
                <span className="chip teal">
                  <Sparkles size={13} strokeWidth={2.4} />
                  <span>พร้อมเริ่มฝึกข้อสอบ</span>
                </span>
              )}
              {localStreak > 0 && (
                <span className="chip red">
                  <Flame size={13} strokeWidth={2.4} />
                  <span>{localStreak}-Day Streak</span>
                </span>
              )}
            </div>

            <div className="hero-actions">
              <button
                type="button"
                className="btn-play hero-cta-btn"
                onClick={() => navigate('/exam')}
              >
                <Play size={15} fill="currentColor" strokeWidth={2.2} />
                <span>เริ่มฝึกทำข้อสอบ</span>
              </button>
              <button
                type="button"
                className="btn-outline hero-secondary-btn"
                onClick={() => navigate('/profile/history-overview')}
              >
                <span>วิเคราะห์สถิติ</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </div>

        <div className="profile-stats">
          <div className="stat-box">
            <span className="stat-num y">{currentXP.toLocaleString()}</span>
            <div className="stat-lbl">XP Total</div>
          </div>
          <div className="stat-box">
            <span className="stat-num" style={{ color: '#c4b5fd' }}>
              {mySeasonScore.toLocaleString()}
            </span>
            <div className="stat-lbl">Season Score</div>
          </div>
          <div className="stat-box">
            <span className="stat-num t">{totalGames.toLocaleString()}</span>
            <div className="stat-lbl">Games Played</div>
          </div>
          <div className="stat-box">
            <span className="stat-num o">{timeTakenMinutes.toLocaleString()}m</span>
            <div className="stat-lbl">Time Played</div>
          </div>
        </div>
      </section>

      {/* ─── Row 2 Bento: 7-Day Streak + Skills Mastery Analytics ─── */}
      <div className="bento-row-2">
        <section className="streak-card" aria-label="ความต่อเนื่องรายวัน">
          <div className="streak-top">
            <div className="streak-fire" aria-hidden="true">
              <Flame size={34} strokeWidth={2.2} />
            </div>
            <div className="streak-head-text">
              <div className="streak-num-row">
                <span className="streak-num">{localStreak}</span>
                <span className="streak-unit">วันติด</span>
              </div>
              <div className="streak-label">DAY STREAK — ครบ 7 วันรับโบนัส 100 EXP!</div>
            </div>
          </div>

          <div className="streak-week-strip" aria-label="ปฏิทินความต่อเนื่อง 7 วันล่าสุด">
            {sevenDayItems.map((day) => (
              <div
                key={day.iso}
                className={`streak-day-pill ${day.active ? 'active' : ''} ${day.isToday ? 'today' : ''}`}
                title={`${day.label}: ${day.examCount > 0 ? `ทำข้อสอบ ${day.examCount} ชุด` : day.active ? 'เช็กอินแล้ว' : 'ยังไม่ทำกิจกรรม'}`}
              >
                <span className="streak-day-dot" aria-hidden="true">
                  {day.active ? <CheckCircle2 size={14} strokeWidth={2.6} /> : <span>·</span>}
                </span>
                <span className="streak-day-lbl">{day.label}</span>
              </div>
            ))}
          </div>

          <button
            type="button"
            className="btn-play streak-claim-btn"
            style={{
              opacity: hasClaimed ? 0.68 : 1,
              cursor: hasClaimed || isClaiming ? 'not-allowed' : 'pointer',
            }}
            onClick={handleClaimStreak}
            disabled={isClaiming || hasClaimed}
            aria-label={hasClaimed ? 'รับโบนัส Streak วันนี้แล้ว' : 'รับโบนัส Streak วันนี้'}
          >
            {isClaiming ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>กำลังรับโบนัส...</span>
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
        </section>

        <section className="skills-card" aria-label="การวิเคราะห์ทักษะ">
          <div className="skills-card-header">
            <div className="section-title" style={{ marginBottom: 0 }}>
              <div className="dot" />
              <span>Skills Mastery</span>
            </div>
            <button
              type="button"
              className="section-link-btn"
              onClick={() => navigate('/profile/history-overview')}
            >
              <span>ดูกราฟทั้งหมด</span>
              <ArrowRight size={13} />
            </button>
          </div>

          <div className="radial-gauges-grid">
            <RadialGauge
              value={accuracy}
              label="Overall Accuracy"
              sublabel={`จาก ${stats?.totalQuestions || 0} ข้อ`}
              color="#34d399"
            />
            <RadialGauge
              value={winRate}
              label="Win Rate (≥80%)"
              sublabel={`${gamesWon} / ${totalGames} ชุด`}
              color="#fde047"
            />
          </div>

          <div className="subject-mastery-list">
            {hasSubjectData ? (
              radarStats.slice(0, 4).map((subj, idx) => {
                const pct = Math.max(0, Math.min(100, Number(subj.score) || 0));
                const tone = subjectColors[idx % subjectColors.length];
                return (
                  <div className="progress-row" key={subj.subject || idx}>
                    <div className="progress-label">
                      <span>{subj.subject}</span>
                      <span>{pct}%</span>
                    </div>
                    <div className="progress-track">
                      <div className={`progress-fill ${tone}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="subject-empty-hint">
                <span>ยังไม่มีข้อมูลคะแนนรายวิชา — ลองทำข้อสอบชุดแรกเพื่อปลดล็อก</span>
                <button type="button" className="section-link-btn" onClick={() => navigate('/exam')}>
                  <span>ทำข้อสอบเลย</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* ─── Row 3 Bento: Compact 6-Metric Stat Grid ─── */}
      <div className="section-title">
        <div className="dot" />
        <span>สถิติทั้งหมด</span>
      </div>
      <div className="grid-3">
        <div className="stat-card yellow">
          <span className="sc-icon yellow">
            <Trophy size={21} strokeWidth={2.2} />
          </span>
          <div className="sc-value" style={{ color: '#fde047' }}>
            {gamesWon.toLocaleString()}
          </div>
          <div className="sc-label">Games Won</div>
          <div className="sc-sub">ทำคะแนนผ่านเกณฑ์ ≥ 80%</div>
        </div>

        <div className="stat-card teal">
          <span className="sc-icon teal">
            <Zap size={21} strokeWidth={2.2} />
          </span>
          <div className="sc-value" style={{ color: '#34d399' }}>
            {avgAnswerTime}s
          </div>
          <div className="sc-label">Avg Answer Time</div>
          <div className="sc-sub">เวลาเฉลี่ยต่อคำถาม</div>
        </div>

        <div className="stat-card red">
          <span className="sc-icon red">
            <Heart size={21} strokeWidth={2.2} />
          </span>
          <div className="sc-value" style={{ color: '#fda4af' }}>
            {accuracy}%
          </div>
          <div className="sc-label">Accuracy</div>
          <div className="sc-sub">จาก {(stats?.totalQuestions || 0).toLocaleString()} ข้อที่ทำ</div>
        </div>

        <div className="stat-card blue">
          <span className="sc-icon blue">
            <Gamepad2 size={21} strokeWidth={2.2} />
          </span>
          <div className="sc-value" style={{ color: '#93c5fd' }}>
            {totalGames.toLocaleString()}
          </div>
          <div className="sc-label">Total Games</div>
          <div className="sc-sub">ใช้งานแล้ว {stats?.daysActive || 0} วัน</div>
        </div>

        <div className="stat-card orange">
          <span className="sc-icon orange">
            <Award size={21} strokeWidth={2.2} />
          </span>
          <div className="sc-value" style={{ color: '#fdba74' }}>
            {unlockedBadgesCount}
            <span className="sc-value-denom">/{badges.length}</span>
          </div>
          <div className="sc-label">Badges Earned</div>
          <div className="sc-sub">เหรียญความสำเร็จที่ปลดล็อก</div>
        </div>

        <div className="stat-card purple">
          <span className="sc-icon purple">
            <Users size={21} strokeWidth={2.2} />
          </span>
          <div className="sc-value" style={{ color: '#d8b4fe' }}>
            {friendsCount.toLocaleString()}
          </div>
          <div className="sc-label">Friends</div>
          <div className="sc-sub">เพื่อนร่วมติวสอบ</div>
        </div>
      </div>

      {/* ─── Row 4 Bento: Recent Activity + Real Leaderboard + Dynamic Badges ─── */}
      <div className="grid-2">
        <div>
          <div className="section-header-row">
            <div className="section-title" style={{ marginBottom: 0 }}>
              <div className="dot" />
              <span>กิจกรรมล่าสุด</span>
            </div>
            <button
              type="button"
              className="section-link-btn"
              onClick={() => navigate('/profile/history')}
            >
              <span>ดูทั้งหมด</span>
              <ArrowRight size={13} />
            </button>
          </div>
          <div className="activity-card">
            {loadingWidgets && recentHistory.length === 0 ? (
              <div className="widget-empty-state">
                <Loader2 size={20} className="animate-spin opacity-75" />
                <span>กำลังโหลดประวัติกิจกรรม...</span>
              </div>
            ) : recentHistory.length > 0 ? (
              recentHistory.map((item, index) => {
                const totalQ = Number(item.total_score) || 10;
                const scoreNum = Number(item.score) || 0;
                const isHigh = scoreNum >= totalQ * 0.8;
                return (
                  <button
                    type="button"
                    className="activity-item activity-item-btn"
                    key={item.id || index}
                    onClick={() => item.id && navigate(`/exam/result/${item.id}`)}
                    aria-label={`ดูผลสอบ ${item.exam_set || 'Quiz Challenge'} คะแนน ${scoreNum} จาก ${item.total_score || '?'}`}
                  >
                    <div className={`act-icon ${index % 2 === 0 ? 'y' : 't'}`}>
                      {isHigh ? <Trophy size={18} strokeWidth={2.2} /> : <Target size={18} strokeWidth={2.2} />}
                    </div>
                    <div className="act-body">
                      <div className="act-title">{item.exam_set || 'Quiz Challenge'}</div>
                      <div className="act-sub">
                        ได้คะแนน {scoreNum} / {item.total_score || '?'}
                      </div>
                    </div>
                    <div className="act-right">
                      <div className={`act-pts ${index % 2 === 0 ? 'y' : 't'}`}>+{scoreNum * 10} XP</div>
                      <div className="act-time">
                        {item.taken_at ? new Date(item.taken_at).toLocaleDateString('th-TH') : '-'}
                      </div>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="widget-empty-state">
                <Clock size={22} className="opacity-65" />
                <span>ยังไม่มีประวัติการทำข้อสอบ</span>
                <button type="button" className="section-link-btn" onClick={() => navigate('/exam')}>
                  <span>เริ่มทำข้อสอบชุดแรก</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="bento-right-stack">
          <div>
            <div className="section-header-row">
              <div className="section-title" style={{ marginBottom: 0 }}>
                <div className="dot" />
                <span>Leaderboard ประจำซีซั่น</span>
              </div>
              <span className="section-meta-pill">คะแนนสะสมจริง</span>
            </div>

            <div className="lb-card">
              {loadingWidgets && topRankings.length === 0 ? (
                <div className="widget-empty-state">
                  <Loader2 size={20} className="animate-spin opacity-75" />
                  <span>กำลังโหลดอันดับ...</span>
                </div>
              ) : topRankings.length > 0 ? (
                <>
                  {topRankings.map((r, idx) => {
                    const isMe =
                      user &&
                      (String(r.user_id) === String(user.id) ||
                        (user.display_name && r.user_name === user.display_name));
                    const rankClass =
                      idx === 0 ? 'gold' : idx === 1 ? 'silver' : idx === 2 ? 'bronze' : '';
                    return (
                      <div className={`lb-row ${isMe ? 'me' : ''}`} key={r.user_id || idx}>
                        <div className={`lb-rank ${rankClass}`}>
                          {idx < 3 ? <Medal size={18} strokeWidth={2.3} /> : <span>#{idx + 1}</span>}
                        </div>
                        <div
                          className="lb-avatar"
                          style={{
                            background:
                              idx === 0
                                ? 'rgba(253, 224, 71, 0.2)'
                                : idx === 1
                                ? 'rgba(203, 213, 225, 0.18)'
                                : 'rgba(255, 255, 255, 0.12)',
                            color: idx === 0 ? '#fde047' : '#e2e8f0',
                            overflow: 'hidden',
                          }}
                        >
                          {r.user_avatar ? (
                            <img
                              src={r.user_avatar}
                              alt={r.user_name || 'Player'}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          ) : (
                            <User size={16} strokeWidth={2.3} />
                          )}
                        </div>
                        <div className="lb-name" style={isMe ? { color: '#fde047' } : undefined}>
                          <span>{r.user_name || `ผู้เข้าสอบ #${idx + 1}`}</span>
                          {isMe && <span className="lb-you-tag">คุณ</span>}
                        </div>
                        <div className="lb-score">{(Number(r.total_score) || 0).toLocaleString()} คะแนน</div>
                      </div>
                    );
                  })}

                  {!isUserInTop5 && (
                    <div className="lb-row me" style={{ marginTop: '10px' }}>
                      <div className="lb-rank me-r">
                        {myRankIndex >= 0 ? `#${myRankIndex + 1}` : <Star size={17} strokeWidth={2.4} />}
                      </div>
                      <div
                        className="lb-avatar"
                        style={{ background: 'rgba(249, 115, 22, 0.28)', color: '#fdba74', overflow: 'hidden' }}
                      >
                        {user?.avatar ? (
                          <img
                            src={user.avatar}
                            alt={displayName}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : (
                          <User size={16} strokeWidth={2.3} />
                        )}
                      </div>
                      <div className="lb-name" style={{ color: '#fde047' }}>
                        <span>{displayName}</span>
                        <span className="lb-you-tag">คุณ</span>
                      </div>
                      <div className="lb-score">{mySeasonScore.toLocaleString()} คะแนน</div>
                    </div>
                  )}
                </>
              ) : (
                <div className="lb-row me">
                  <div className="lb-rank me-r">
                    <Star size={17} strokeWidth={2.4} />
                  </div>
                  <div
                    className="lb-avatar"
                    style={{ background: 'rgba(249, 115, 22, 0.28)', color: '#fdba74', overflow: 'hidden' }}
                  >
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={displayName}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <User size={16} strokeWidth={2.3} />
                    )}
                  </div>
                  <div className="lb-name" style={{ color: '#fde047' }}>
                    <span>{displayName}</span>
                    <span className="lb-you-tag">ซีซั่นใหม่</span>
                  </div>
                  <div className="lb-score">{mySeasonScore.toLocaleString()} คะแนน</div>
                </div>
              )}
            </div>
          </div>

          {/* Dynamic Achievements & Badges */}
          <div>
            <div className="section-header-row">
              <div className="section-title" style={{ marginBottom: 0 }}>
                <div className="dot" />
                <span>Achievements & Badges</span>
              </div>
              <span className="section-meta-pill">
                ปลดล็อก {unlockedBadgesCount}/{badges.length}
              </span>
            </div>

            <div className="achievements-card">
              <div className="badges-grid">
                {badges.map((badge) => {
                  const BadgeIcon = badge.Icon;
                  return (
                    <div
                      key={badge.id}
                      className={`badge-item ${badge.unlocked ? 'earned' : ''}`}
                      title={`${badge.title} — ${badge.requirement}`}
                    >
                      <div className={`badge-icon badge-tone-${badge.tone} ${badge.unlocked ? '' : 'locked'}`}>
                        <BadgeIcon size={22} strokeWidth={2.2} />
                        {!badge.unlocked && (
                          <span className="badge-lock-pip" aria-hidden="true">
                            <Lock size={10} strokeWidth={2.6} />
                          </span>
                        )}
                      </div>
                      <div className="badge-name">{badge.title}</div>
                      <div className="badge-req">
                        {badge.unlocked ? 'ปลดล็อกแล้ว' : badge.progress}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileDashboard;
