import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import userService from '../../services/userService';
import { BarChart, Bar, ResponsiveContainer, XAxis, Tooltip, RadarChart, PolarGrid, PolarAngleAxis, Radar } from 'recharts';

const ProfileHistoryOverview = () => {
    const { stats } = useOutletContext();
    const [animateGraph, setAnimateGraph] = useState(false);
    const [heatmapData, setHeatmapData] = useState([]);
    const [radarStats, setRadarStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState(7); // 7, 30, 90, 9999 (all)

    useEffect(() => {
        setTimeout(() => setAnimateGraph(true), 100);
        const fetchData = async () => {
            setLoading(true);
            try {
                const [heatmapRes, radarRes] = await Promise.all([
                    userService.getHeatmapStats(period),
                    userService.getRadarStats()
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
        return <div style={{ textAlign: 'center', padding: '40px' }}>Loading overview...</div>;
    }

    return (
        <div id="sec-history-overview">
            <div className="section-title" style={{ marginBottom: '20px', fontSize: '22px' }}><div className="dot"></div>History Overview</div>
            
            <div className="grid-3" style={{ marginBottom: '24px' }}>
                <div className="stat-card yellow"><span className="sc-icon">🎮</span><div className="sc-value" style={{ color: 'var(--k-yellow)' }}>{totalGames}</div><div className="sc-label">Total Games</div></div>
                <div className="stat-card teal"><span className="sc-icon">✅</span><div className="sc-value" style={{ color: 'var(--k-teal)' }}>{gamesWon}</div><div className="sc-label">Games Won</div></div>
                <div className="stat-card orange"><span className="sc-icon">📅</span><div className="sc-value" style={{ color: 'var(--k-orange)' }}>{daysActive}</div><div className="sc-label">Days Active</div></div>
            </div>
            <div className="tab-bar">
                <button className={`tab-btn ${period === 7 ? 'active' : ''}`} onClick={() => setPeriod(7)}>7 วัน</button>
                <button className={`tab-btn ${period === 30 ? 'active' : ''}`} onClick={() => setPeriod(30)}>30 วัน</button>
                <button className={`tab-btn ${period === 90 ? 'active' : ''}`} onClick={() => setPeriod(90)}>3 เดือน</button>
                <button className={`tab-btn ${period === 9999 ? 'active' : ''}`} onClick={() => setPeriod(9999)}>ทั้งหมด</button>
            </div>

            {(!heatmapData || heatmapData.length === 0) && !radarStats ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    No history data available.
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '18px', padding: '28px', textAlign: 'center', animation: 'fadeSlideIn 0.4s both' }}>
                        <div style={{ fontSize: '48px', marginBottom: '12px' }}>📈</div>
                        <div style={{ fontFamily: "'Lilita One', cursive", fontSize: '20px', marginBottom: '8px' }}>Active History</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                            Daily Exams Taken
                        </div>
                        
                        <div style={{ marginTop: '20px', height: '140px', width: '100%' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={heatmapData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                                    <XAxis dataKey="date" hide={period > 14} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(val) => {
                                        const d = new Date(val);
                                        return d.toLocaleDateString('th-TH', { weekday: 'short' });
                                    }}/>
                                    <Tooltip 
                                        contentStyle={{ background: 'var(--bg-color)', border: '1px solid var(--card-border)', borderRadius: '8px' }}
                                        labelFormatter={(val) => new Date(val).toLocaleDateString('th-TH', { month: 'short', day: 'numeric' })}
                                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                    />
                                    <Bar dataKey="value" name="Exams" fill="var(--k-yellow)" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    
                    <div style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '18px', padding: '28px', textAlign: 'center', animation: 'fadeSlideIn 0.4s 0.1s both' }}>
                        <div style={{ fontSize: '48px', marginBottom: '12px' }}>🎯</div>
                        <div style={{ fontFamily: "'Lilita One', cursive", fontSize: '20px', marginBottom: '8px' }}>Subject Mastery</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                            Accuracy by Subject
                        </div>
                        
                        <div style={{ marginTop: '10px', height: '160px', width: '100%' }}>
                            {radarStats && radarStats.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarStats}>
                                        <PolarGrid stroke="var(--card-border)" />
                                        <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-color)', fontSize: 11 }} />
                                        <Radar name="Accuracy %" dataKey="score" stroke="var(--k-teal)" fill="var(--k-teal)" fillOpacity={0.5} />
                                        <Tooltip contentStyle={{ background: 'var(--bg-color)', border: '1px solid var(--card-border)', borderRadius: '8px' }} />
                                    </RadarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
                                    Not enough data
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ProfileHistoryOverview;
