import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import examService from '../../services/examService';
import ExpGuideModal from '../../components/ExpGuideModal';
import toast from 'react-hot-toast';

const ProfileDashboard = () => {
  const { user, stats, xpInfo } = useOutletContext();
  const [recentHistory, setRecentHistory] = useState([]);
  const [isExpGuideOpen, setIsExpGuideOpen] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [hasClaimed, setHasClaimed] = useState(false);

  // Check if claimed today locally (best effort)
  useEffect(() => {
    if (user?.last_claim_date) {
      const todayStr = new Date().toISOString().split("T")[0];
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
          setRecentHistory(res.data.slice(0, 4)); // Get latest 4
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
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL || import.meta.env.NEXT_PUBLIC_VITE_API_URL || "https://preexam-api.jimwar02.workers.dev";
      const res = await fetch(`${apiUrl}/api/users/claim-streak`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`ยินดีด้วย! คุณได้รับ ${data.data.xpGained} EXP 🔥`);
        setHasClaimed(true);
        if (data.data.levelUp) {
          setTimeout(() => toast.success(`🎉 เลเวลอัปเป็น LVL ${data.data.levelUp}!`), 1000);
        }
      } else {
        if (data.message === "Already claimed today") {
          setHasClaimed(true);
          toast.error("รับไปแล้ววันนี้ พรุ่งนี้มารับใหม่นะ!");
        } else {
          toast.error(data.message || "เกิดข้อผิดพลาด");
        }
      }
    } catch (e) {
      toast.error("Network error");
    } finally {
      setIsClaiming(false);
    }
  };

  const totalGames = stats ? stats.totalExams : 0;
  const timeTakenMinutes = stats ? Math.round(stats.timeTaken / 60) : 0;
  const displayName = user?.display_name || 'Guest';

  return (
    <div id="sec-dashboard">
      <ExpGuideModal isOpen={isExpGuideOpen} onClose={() => setIsExpGuideOpen(false)} />
      {/* Profile Hero */}
      <div className="profile-hero">
        <div className="avatar-big">
          {user?.avatar ? <img src={user.avatar} alt="Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : '🦊'}
          <div className="level-badge" onClick={() => setIsExpGuideOpen(true)} style={{cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px'}}>
            LVL {xpInfo?.level || user?.level || 1} 
            <span style={{background: 'rgba(255,255,255,0.2)', borderRadius: '50%', width: '16px', height: '16px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px'}}>?</span>
          </div>
        </div>
        <div className="profile-info">
          <h1>{displayName}</h1>
          <div className="handle">@{(user?.public_id || 'player').substring(0, 8)} · เข้าร่วมแล้ว {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'เพิ่งเข้าร่วม'}</div>
          <div className="profile-chips">
            <span className="chip yellow">🏆 Champion</span>
            <span className="chip teal">⚡ Speed Runner</span>
            {user?.streak_count > 0 && <span className="chip red">🔥 {user.streak_count}-Day Streak</span>}
          </div>
        </div>
        <div className="profile-stats">
          <div className="stat-box">
            <span className="stat-num y">{xpInfo?.currentXP?.toLocaleString() || 0}</span>
            <div className="stat-lbl">XP Total</div>
          </div>
          <div className="stat-box">
            <span className="stat-num" style={{ color: '#8b5cf6' }}>{stats?.ranking?.total_score?.toLocaleString() || 0}</span>
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
      <div className="grid-2" style={{ marginBottom: '28px' }}>
        <div className="streak-card">
          <div className="streak-fire">🔥</div>
          <div>
            <div className="streak-num">{user?.streak_count || 0}</div>
            <div className="streak-label">DAY STREAK — ไม่มีวันหยุด!</div>
            <button 
              className="btn-play" 
              style={{ marginTop: '10px', opacity: hasClaimed ? 0.6 : 1, cursor: hasClaimed ? 'not-allowed' : 'pointer' }}
              onClick={handleClaimStreak}
              disabled={isClaiming || hasClaimed}
            >
              {isClaiming ? 'กำลังรับ...' : hasClaimed ? 'รับแล้ว 🥳' : '🎉 เฉลิมฉลอง!'}
            </button>
          </div>
        </div>
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '18px', padding: '20px', animation: 'fadeSlideIn 0.5s 0.15s both' }}>
          <div className="section-title" style={{ marginBottom: '14px' }}><div className="dot"></div>Skills Progress</div>
          <div className="progress-row">
            <div className="progress-label"><span>🎯 Overall Accuracy</span><span>{stats?.accuracy || 0}%</span></div>
            <div className="progress-track"><div className="progress-fill t" style={{ width: `${stats?.accuracy || 0}%` }}></div></div>
          </div>
          <div className="progress-row">
            <div className="progress-label"><span>🏆 Win Rate</span><span>{stats?.totalExams ? Math.round((stats?.gamesWon / stats?.totalExams) * 100) : 0}%</span></div>
            <div className="progress-track"><div className="progress-fill y" style={{ width: `${stats?.totalExams ? Math.round((stats?.gamesWon / stats?.totalExams) * 100) : 0}%` }}></div></div>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="section-title"><div className="dot"></div>สถิติทั้งหมด</div>
      <div className="grid-3">
        <div className="stat-card yellow">
          <span className="sc-icon">🏆</span>
          <div className="sc-value" style={{ color: 'var(--k-yellow)' }}>{stats?.gamesWon || 0}</div>
          <div className="sc-label">Games Won</div>
        </div>
        <div className="stat-card teal">
          <span className="sc-icon">⚡</span>
          <div className="sc-value" style={{ color: 'var(--k-teal)' }}>{stats?.avgAnswerTime || '0.0'}s</div>
          <div className="sc-label">Avg Answer Time</div>
        </div>
        <div className="stat-card red">
          <span className="sc-icon">❤️</span>
          <div className="sc-value" style={{ color: '#ff6b87' }}>{stats?.accuracy || 0}%</div>
          <div className="sc-label">Accuracy</div>
        </div>
        <div className="stat-card blue">
          <span className="sc-icon">🎯</span>
          <div className="sc-value" style={{ color: '#5a9eff' }}>{stats?.totalExams || 0}</div>
          <div className="sc-label">Total Games</div>
        </div>
        <div className="stat-card orange">
          <span className="sc-icon">🌟</span>
          <div className="sc-value" style={{ color: 'var(--k-orange)' }}>{stats?.badgesEarned || 0}</div>
          <div className="sc-label">Badges Earned</div>
        </div>
        <div className="stat-card purple">
          <span className="sc-icon">👥</span>
          <div className="sc-value" style={{ color: '#b07fff' }}>{stats?.friendsCount || 0}</div>
          <div className="sc-label">Friends</div>
        </div>
      </div>

      {/* Activity + Leaderboard */}
      <div className="grid-2">
        <div>
          <div className="section-title"><div className="dot"></div>กิจกรรมล่าสุด</div>
          <div className="activity-card">
            {recentHistory.length > 0 ? recentHistory.map((item, index) => (
              <div className="activity-item" key={item.id || index}>
                <div className={`act-icon ${index % 2 === 0 ? 'y' : 't'}`}>
                  {item.score >= (item.total_score || 10) * 0.8 ? '🏆' : '🎯'}
                </div>
                <div className="act-body">
                  <div className="act-title">{item.exam_set || 'Quiz Challenge'}</div>
                  <div className="act-sub">ได้คะแนน {item.score} / {item.total_score || '?'}</div>
                </div>
                <div className="act-right">
                  <div className={`act-pts ${index % 2 === 0 ? 'y' : 't'}`}>+{item.score * 10} XP</div>
                  <div className="act-time">{new Date(item.taken_at).toLocaleDateString()}</div>
                </div>
              </div>
            )) : (
              <div style={{ padding: '20px', color: 'var(--text-muted)' }}>ยังไม่มีประวัติการทำข้อสอบ</div>
            )}
          </div>
        </div>

        <div>
          <div className="section-title"><div className="dot"></div>Leaderboard สัปดาห์นี้</div>
          <div className="lb-card">
            <div className="lb-row" style={{ opacity: 0.6 }}>
              <div className="lb-rank gold">🥇</div>
              <div className="lb-avatar" style={{ background: 'rgba(255,204,0,0.2)' }}>👑</div>
              <div className="lb-name">Top Player 1</div>
              <div className="lb-score">? XP</div>
            </div>
            <div className="lb-row" style={{ opacity: 0.6 }}>
              <div className="lb-rank silver">🥈</div>
              <div className="lb-avatar" style={{ background: 'rgba(192,192,192,0.15)' }}>⚡</div>
              <div className="lb-name">Top Player 2</div>
              <div className="lb-score">? XP</div>
            </div>
            <div className="lb-row me" style={{ marginTop: '10px' }}>
              <div className="lb-rank me-r">⭐</div>
              <div className="lb-avatar" style={{ background: 'rgba(255,119,0,0.2)' }}>{user?.avatar ? <img src={user.avatar} style={{width:'100%', borderRadius:'50%'}} /> : '🦊'}</div>
              <div className="lb-name" style={{ color: 'var(--k-yellow)' }}>{user?.display_name || 'You'}</div>
              <div className="lb-score">{xpInfo?.currentXP?.toLocaleString() || 0} XP</div>
            </div>
          </div>

          {/* Achievements */}
          <div style={{ marginTop: '16px' }}>
            <div className="section-title"><div className="dot"></div>Badges ล่าสุด</div>
            <div className="achievements-card">
              <div className="badges-grid">
                <div style={{ color: 'var(--text-muted)', padding: '10px' }}>ระบบ Badges กำลังจะมาเร็วๆ นี้!</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileDashboard;
