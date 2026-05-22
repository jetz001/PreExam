import React from 'react';

const ProfileHistory = () => {
    return (
        <div id="sec-history">
            <div className="section-title" style={{ marginBottom: '20px', fontSize: '22px' }}><div className="dot"></div>🕐 History</div>
            <div className="activity-card" style={{ animation: 'fadeSlideIn 0.4s both' }}>
                <div className="activity-item">
                    <div className="act-icon y">🏆</div><div className="act-body"><div className="act-title">World Geography Quiz</div><div className="act-sub">อันดับ 1 · 24 ผู้เล่น · ถูก 20/20</div></div>
                    <div className="act-right"><div className="act-pts y">+450 XP</div><div className="act-time">2 ชม. ที่แล้ว</div></div>
                </div>
                <div className="activity-item">
                    <div className="act-icon t">⚡</div><div className="act-body"><div className="act-title">Speed Math Challenge</div><div className="act-sub">อันดับ 2 · 18 ผู้เล่น · ถูก 19/20</div></div>
                    <div className="act-right"><div className="act-pts t">+280 XP</div><div className="act-time">เมื่อวาน</div></div>
                </div>
                <div className="activity-item">
                    <div className="act-icon b">🔬</div><div className="act-body"><div className="act-title">Science Blast!</div><div className="act-sub">อันดับ 1 · 30 ผู้เล่น · ถูก 18/20</div></div>
                    <div className="act-right"><div className="act-pts t">+320 XP</div><div className="act-time">2 วันที่แล้ว</div></div>
                </div>
                <div className="activity-item">
                    <div className="act-icon r">🎌</div><div className="act-body"><div className="act-title">Anime Trivia</div><div className="act-sub">อันดับ 8 · 42 ผู้เล่น · ถูก 14/20</div></div>
                    <div className="act-right"><div className="act-pts r">+90 XP</div><div className="act-time">3 วันที่แล้ว</div></div>
                </div>
                <div className="activity-item">
                    <div className="act-icon y">🏛️</div><div className="act-body"><div className="act-title">History of Rome</div><div className="act-sub">อันดับ 3 · 20 ผู้เล่น · ถูก 17/20</div></div>
                    <div className="act-right"><div className="act-pts y">+200 XP</div><div className="act-time">4 วันที่แล้ว</div></div>
                </div>
            </div>
        </div>
    );
};

export default ProfileHistory;
