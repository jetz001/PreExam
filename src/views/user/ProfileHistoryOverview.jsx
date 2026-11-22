import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import {
  Gamepad2,
  CheckCircle2,
  Calendar,
  TrendingUp,
  Target,
  ArrowRight,
  BarChart3,
} from 'lucide-react';
import userService from '../../services/userService';
import {
  BarChart,
  Bar,
  ResponsiveContainer,
  XAxis,
  Tooltip,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
} from 'recharts';

const ProfileHistoryOverview = () => {
  const { stats } = useOutletContext();
  const navigate = useNavigate();
  const [heatmapData, setHeatmapData] = useState([]);
  const [radarStats, setRadarStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState(7); // 7, 30, 90, 9999 (all)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [heatmapRes, radarRes] = await Promise.all([
          userService.getHeatmapStats(period),
          userService.getRadarStats(),
        ]);
        if (heatmapRes.success && heatmapRes.data) {
          setHeatmapData(heatmapRes.data);
        } else if (Array.isArray(heatmapRes)) {
          setHeatmapData(heatmapRes);
        } else if (heatmapRes.data) {
          setHeatmapData(heatmapRes.data);
        }

        if (radarRes.success && radarRes.data) {
          setRadarStats(radarRes.data);
        } else if (radarRes.data) {
          setRadarStats(radarRes.data);
        } else {
          setRadarStats(radarRes);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [period]);

  const totalGames = stats ? stats.totalExams : 0;
  const gamesWon = stats ? stats.gamesWon : 0;
  const daysActive = stats ? stats.daysActive || 0 : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-white/75 font-bold">
        กำลังโหลดภาพรวมสถิติ...
      </div>
    );
  }

  return (
    <div id="sec-history-overview">
      <div className="section-title" style={{ marginBottom: '20px', fontSize: '20px' }}>
        <div className="dot" />
        <BarChart3 size={20} className="text-amber-300" />
        <span>History Overview</span>
      </div>

      <div className="grid-3" style={{ marginBottom: '24px' }}>
        <div className="stat-card yellow">
          <span className="sc-icon yellow">
            <Gamepad2 size={22} strokeWidth={2.2} />
          </span>
          <div className="sc-value" style={{ color: '#fde047' }}>
            {totalGames}
          </div>
          <div className="sc-label">Total Games</div>
        </div>
        <div className="stat-card teal">
          <span className="sc-icon teal">
            <CheckCircle2 size={22} strokeWidth={2.2} />
          </span>
          <div className="sc-value" style={{ color: '#34d399' }}>
            {gamesWon}
          </div>
          <div className="sc-label">Games Won</div>
        </div>
        <div className="stat-card orange">
          <span className="sc-icon orange">
            <Calendar size={22} strokeWidth={2.2} />
          </span>
          <div className="sc-value" style={{ color: '#fdba74' }}>
            {daysActive}
          </div>
          <div className="sc-label">Days Active</div>
        </div>
      </div>

      <div className="tab-bar">
        <button
          type="button"
          className={`tab-btn ${period === 7 ? 'active' : ''}`}
          onClick={() => setPeriod(7)}
        >
          7 วัน
        </button>
        <button
          type="button"
          className={`tab-btn ${period === 30 ? 'active' : ''}`}
          onClick={() => setPeriod(30)}
        >
          30 วัน
        </button>
        <button
          type="button"
          className={`tab-btn ${period === 90 ? 'active' : ''}`}
          onClick={() => setPeriod(90)}
        >
          3 เดือน
        </button>
        <button
          type="button"
          className={`tab-btn ${period === 9999 ? 'active' : ''}`}
          onClick={() => setPeriod(9999)}
        >
          ทั้งหมด
        </button>
      </div>

      {(!heatmapData || heatmapData.length === 0) && !radarStats ? (
        <div className="activity-card text-center py-10 text-white/75 font-semibold">
          ยังไม่มีข้อมูลสถิติการทำข้อสอบในช่วงเวลานี้
        </div>
      ) : (
        <div className="grid-2">
          <div className="skills-card text-center">
            <div className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-300/35 bg-amber-400/15 text-amber-300">
              <TrendingUp size={24} />
            </div>
            <div
              className="text-lg font-black text-white mb-1"
              style={{ fontFamily: "'Nunito', 'Sarabun', sans-serif" }}
            >
              Active History
            </div>
            <div className="text-xs font-semibold text-white/70">Daily Exams Taken</div>

            <div style={{ marginTop: '18px', height: '160px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={heatmapData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <XAxis
                    dataKey="date"
                    hide={period > 14}
                    tick={{ fill: 'rgba(255,255,255,0.75)', fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => {
                      const d = new Date(val);
                      return d.toLocaleDateString('th-TH', { weekday: 'short' });
                    }}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(20, 7, 46, 0.96)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '12px',
                      color: '#fff',
                    }}
                    labelFormatter={(val) =>
                      new Date(val).toLocaleDateString('th-TH', { month: 'short', day: 'numeric' })
                    }
                    cursor={{ fill: 'rgba(255,255,255,0.08)' }}
                  />
                  <Bar dataKey="value" name="Exams" fill="#fde047" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="skills-card text-center">
            <div className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-300/35 bg-emerald-400/15 text-emerald-300">
              <Target size={24} />
            </div>
            <div
              className="text-lg font-black text-white mb-1"
              style={{ fontFamily: "'Nunito', 'Sarabun', sans-serif" }}
            >
              Subject Mastery
            </div>
            <div className="text-xs font-semibold text-white/70">Accuracy by Subject</div>

            <div style={{ marginTop: '12px', height: '160px', width: '100%' }}>
              {radarStats && radarStats.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarStats}>
                    <PolarGrid stroke="rgba(255,255,255,0.2)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#ffffff', fontSize: 11 }} />
                    <Radar
                      name="Accuracy %"
                      dataKey="score"
                      stroke="#34d399"
                      fill="#34d399"
                      fillOpacity={0.45}
                    />
                    <Tooltip
                      contentStyle={{
                        background: 'rgba(20, 7, 46, 0.96)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '12px',
                        color: '#fff',
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-white/70 font-semibold">
                  ยังไม่มีข้อมูลรายวิชาเพียงพอ
                </div>
              )}
            </div>

            <div className="mt-4">
              <button
                type="button"
                onClick={() => navigate('/exam')}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-400 px-5 py-2.5 text-sm font-black text-slate-950 shadow-md transition-all hover:bg-emerald-300 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <Target size={16} />
                <span>ไปทำข้อสอบฝึกฝน</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileHistoryOverview;
