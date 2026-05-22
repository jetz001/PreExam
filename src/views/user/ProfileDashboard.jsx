import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import examService from '../../services/examService';

const ProfileDashboard = () => {
  const { user, stats, xpInfo } = useOutletContext();
  const [recentHistory, setRecentHistory] = useState([]);

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

  const totalGames = stats ? stats.totalExams : 0;
  const timeTakenMinutes = stats ? Math.round(stats.timeTaken / 60) : 0;
  const displayName = user?.display_name || 'Guest';

  return (
    <div id="sec-dashboard">
      {/* Profile Hero */}
      <div className="profile-hero">
        <div className="avatar-big">
          {user?.avatar ? <img src={user.avatar} alt="Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : '🦊'}
          <div className="level-badge">LVL {xpInfo?.level || 1}</div>
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
            <div className="streak-num">42</div>
            <div className="streak-label">DAY STREAK — ไม่มีวันหยุด!</div>
            <button className="btn-play" style={{ marginTop: '10px' }}>🎉 เฉลิมฉลอง!</button>
          </div>
        </div>
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '18px', padding: '20px', animation: 'fadeSlideIn 0.5s 0.15s both' }}>
          <div className="section-title" style={{ marginBottom: '14px' }}><div className="dot"></div>Skills Progress</div>
          <div className="progress-row">
            <div className="progress-label"><span>🔬 Science</span><span>87%</span></div>
            <div className="progress-track"><div className="progress-fill t" style={{ width: '87%' }}></div></div>
          </div>
          <div className="progress-row">
            <div className="progress-label"><span>📐 Math</span><span>72%</span></div>
            <div className="progress-track"><div className="progress-fill y" style={{ width: '72%' }}></div></div>
          </div>
          <div className="progress-row">
            <div className="progress-label"><span>🌍 Geography</span><span>95%</span></div>
            <div className="progress-track"><div className="progress-fill b" style={{ width: '95%' }}></div></div>
          </div>
          <div className="progress-row" style={{ marginBottom: '0' }}>
            <div className="progress-label"><span>🎨 Art</span><span>58%</span></div>
            <div className="progress-track"><div className="progress-fill r" style={{ width: '58%' }}></div></div>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="section-title"><div className="dot"></div>สถิติสัปดาห์นี้</div>
      <div className="grid-3">
        <div className="stat-card yellow">
          <span className="sc-delta up">+18%</span>
          <span className="sc-icon">🏆</span>
          <div className="sc-value" style={{ color: 'var(--k-yellow)' }}>186</div>
          <div className="sc-label">Games Won</div>
        </div>
        <div className="stat-card teal">
          <span className="sc-delta up">+5%</span>
          <span className="sc-icon">⚡</span>
          <div className="sc-value" style={{ color: 'var(--k-teal)' }}>1.4s</div>
          <div className="sc-label">Avg Answer Time</div>
        </div>
        <div className="stat-card red">
          <span className="sc-delta down">-2%</span>
          <span className="sc-icon">❤️</span>
          <div className="sc-value" style={{ color: '#ff6b87' }}>94%</div>
          <div className="sc-label">Accuracy</div>
        </div>
        <div className="stat-card blue">
          <span className="sc-delta up">+12</span>
          <span className="sc-icon">🎯</span>
          <div className="sc-value" style={{ color: '#5a9eff' }}>248</div>
          <div className="sc-label">Total Games</div>
        </div>
        <div className="stat-card orange">
          <span className="sc-delta up">New!</span>
          <span className="sc-icon">🌟</span>
          <div className="sc-value" style={{ color: 'var(--k-orange)' }}>32</div>
          <div className="sc-label">Badges Earned</div>
        </div>
        <div className="stat-card purple">
          <span className="sc-delta up">+8</span>
          <span className="sc-icon">👥</span>
          <div className="sc-value" style={{ color: '#b07fff' }}>156</div>
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
            <div className="lb-row">
              <div className="lb-rank gold">🥇</div>
              <div className="lb-avatar" style={{ background: 'rgba(255,204,0,0.2)' }}>😎</div>
              <div className="lb-name">StarQueen99</div>
              <div className="lb-score">4,820 XP</div>
            </div>
            <div className="lb-row">
              <div className="lb-rank silver">🥈</div>
              <div className="lb-avatar" style={{ background: 'rgba(192,192,192,0.15)' }}>🐯</div>
              <div className="lb-name">TigerByte</div>
              <div className="lb-score">4,210 XP</div>
            </div>
            <div className="lb-row">
              <div className="lb-rank bronze">🥉</div>
              <div className="lb-avatar" style={{ background: 'rgba(205,127,50,0.15)' }}>🦁</div>
              <div className="lb-name">LionHeart_TH</div>
              <div className="lb-score">3,990 XP</div>
            </div>
            <div className="lb-row">
              <div className="lb-rank" style={{ color: 'var(--text-muted)' }}>4</div>
              <div className="lb-avatar" style={{ background: 'rgba(255,119,0,0.15)' }}>🐉</div>
              <div className="lb-name">DragonKid</div>
              <div className="lb-score" style={{ color: 'var(--text-muted)' }}>3,450 XP</div>
            </div>
            <div className="lb-row me">
              <div className="lb-rank me-r">⭐5</div>
              <div className="lb-avatar" style={{ background: 'rgba(255,119,0,0.2)' }}>🦊</div>
              <div className="lb-name" style={{ color: 'var(--k-yellow)' }}>NinjaFox9000 (คุณ)</div>
              <div className="lb-score">2,840 XP</div>
            </div>
          </div>

          {/* Achievements */}
          <div style={{ marginTop: '16px' }}>
            <div className="section-title"><div className="dot"></div>Badges ล่าสุด</div>
            <div className="achievements-card">
              <div className="badges-grid">
                <div className="badge-item earned">
                  <div className="badge-icon" style={{ background: 'rgba(255,204,0,0.15)' }}>🏆</div>
                  <div className="badge-name">Champion</div>
                </div>
                <div className="badge-item earned">
                  <div className="badge-icon" style={{ background: 'rgba(255,119,0,0.15)' }}>🔥</div>
                  <div className="badge-name">On Fire</div>
                </div>
                <div className="badge-item earned">
                  <div className="badge-icon" style={{ background: 'rgba(0,201,133,0.15)' }}>⚡</div>
                  <div className="badge-name">Speed King</div>
                </div>
                <div className="badge-item earned">
                  <div className="badge-icon" style={{ background: 'rgba(19,104,206,0.2)' }}>🌍</div>
                  <div className="badge-name">World Expert</div>
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
