import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import userService from '../../services/userService';

const ProfileHistoryOverview = () => {
    const { stats } = useOutletContext();
    const [animateGraph, setAnimateGraph] = useState(false);
    const [heatmapData, setHeatmapData] = useState([]);

    useEffect(() => {
        setTimeout(() => setAnimateGraph(true), 100);
        const fetchHeatmap = async () => {
            try {
                const res = await userService.getHeatmapStats();
                if (res.success && res.data) {
                    setHeatmapData(res.data);
                }
            } catch (err) {
                console.error(err);
            }
        };
        fetchHeatmap();
    }, []);

    const totalGames = stats ? stats.totalExams : 0;
    // Approximation for won games (we don't have exact won count in stats currently)
    // Assume if score > 80% it's a win, but stats API doesn't return won count.
    // So we just mock or use totalGames for now.
    const gamesWon = stats ? Math.floor(stats.totalExams * 0.8) : 0;
    // Days active could be approximated or mocked for now since backend doesn't provide exact days active easily without full heatmap length
    const daysActive = heatmapData.length || 1;

    return (
        <div id="sec-history-overview">
            <div className="section-title" style={{ marginBottom: '20px', fontSize: '22px' }}><div className="dot"></div>History Overview</div>
            <div className="grid-3" style={{ marginBottom: '24px' }}>
                <div className="stat-card yellow"><span className="sc-icon">🎮</span><div className="sc-value" style={{ color: 'var(--k-yellow)' }}>{totalGames}</div><div className="sc-label">Total Games</div></div>
                <div className="stat-card teal"><span className="sc-icon">✅</span><div className="sc-value" style={{ color: 'var(--k-teal)' }}>{gamesWon}</div><div className="sc-label">Games Won</div></div>
                <div className="stat-card orange"><span className="sc-icon">📅</span><div className="sc-value" style={{ color: 'var(--k-orange)' }}>{daysActive}</div><div className="sc-label">Days Active</div></div>
            </div>
            <div className="tab-bar">
                <button className="tab-btn active">7 วัน</button>
                <button className="tab-btn">30 วัน</button>
                <button className="tab-btn">3 เดือน</button>
                <button className="tab-btn">ทั้งหมด</button>
            </div>
            <div style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '18px', padding: '28px', textAlign: 'center', animation: 'fadeSlideIn 0.4s both' }}>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>📈</div>
                <div style={{ fontFamily: "'Lilita One', cursive", fontSize: '20px', marginBottom: '8px' }}>กราฟ XP รายสัปดาห์</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Mon 280 · Tue 450 · Wed 320 · Thu 610 · Fri 290 · Sat 480 · Sun 410</div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '20px', alignItems: 'flex-end', justifyContent: 'center', height: '80px' }}>
                    <div style={{ background: 'var(--k-purple-light)', borderRadius: '6px 6px 0 0', width: '32px', height: animateGraph ? '46%' : '0%', transition: 'height 1s 0.1s' }}></div>
                    <div style={{ background: 'var(--k-yellow)', borderRadius: '6px 6px 0 0', width: '32px', height: animateGraph ? '74%' : '0%', transition: 'height 1s 0.2s' }}></div>
                    <div style={{ background: 'var(--k-purple-light)', borderRadius: '6px 6px 0 0', width: '32px', height: animateGraph ? '52%' : '0%', transition: 'height 1s 0.3s' }}></div>
                    <div style={{ background: 'var(--k-yellow)', borderRadius: '6px 6px 0 0', width: '32px', height: animateGraph ? '100%' : '0%', transition: 'height 1s 0.4s' }}></div>
                    <div style={{ background: 'var(--k-purple-light)', borderRadius: '6px 6px 0 0', width: '32px', height: animateGraph ? '47%' : '0%', transition: 'height 1s 0.5s' }}></div>
                    <div style={{ background: 'var(--k-teal)', borderRadius: '6px 6px 0 0', width: '32px', height: animateGraph ? '78%' : '0%', transition: 'height 1s 0.6s' }}></div>
                    <div style={{ background: 'var(--k-teal)', borderRadius: '6px 6px 0 0', width: '32px', height: animateGraph ? '67%' : '0%', transition: 'height 1s 0.7s' }}></div>
                </div>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '8px', fontSize: '11px', color: 'var(--text-muted)' }}>
                    <span style={{ width: '32px', textAlign: 'center' }}>จ.</span>
                    <span style={{ width: '32px', textAlign: 'center' }}>อ.</span>
                    <span style={{ width: '32px', textAlign: 'center' }}>พ.</span>
                    <span style={{ width: '32px', textAlign: 'center' }}>พฤ.</span>
                    <span style={{ width: '32px', textAlign: 'center' }}>ศ.</span>
                    <span style={{ width: '32px', textAlign: 'center' }}>ส.</span>
                    <span style={{ width: '32px', textAlign: 'center' }}>อา.</span>
                </div>
            </div>
        </div>
    );
}

export default ProfileHistoryOverview;
