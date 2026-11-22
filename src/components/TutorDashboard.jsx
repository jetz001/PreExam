import React, { useState, useRef } from 'react';
import { Users, Flag, Trophy, Maximize, Minimize } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';

const FLOATING_ORBS = [
    { width: 64, height: 64, left: '8%', top: '12%', dur: 18, delay: -2 },
    { width: 92, height: 92, left: '78%', top: '14%', dur: 22, delay: -6 },
    { width: 48, height: 48, left: '22%', top: '68%', dur: 16, delay: -4 },
    { width: 76, height: 76, left: '64%', top: '72%', dur: 24, delay: -9 },
    { width: 54, height: 54, left: '46%', top: '26%', dur: 20, delay: -11 },
    { width: 84, height: 84, left: '86%', top: '52%', dur: 26, delay: -5 },
    { width: 40, height: 40, left: '12%', top: '42%', dur: 19, delay: -8 },
    { width: 68, height: 68, left: '38%', top: '82%', dur: 21, delay: -3 },
];

const TutorDashboard = ({ participants = [], totalQuestions = 0, onEndExam }) => {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const dashboardRef = useRef(null);

    const toggleFullScreen = () => {
        if (!document.fullscreenElement) {
            dashboardRef.current?.requestFullscreen().catch(err => console.log(err));
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    // Sort participants by score (desc), then by progress (desc)
    const sortedParticipants = [...participants].sort((a, b) => {
        const scoreDiff = (b.score || 0) - (a.score || 0);
        if (scoreDiff !== 0) return scoreDiff;

        const progA = a.status === 'finished' ? totalQuestions : (a.current_question_index || 0);
        const progB = b.status === 'finished' ? totalQuestions : (b.current_question_index || 0);
        return progB - progA;
    });

    const chartData = sortedParticipants.map(p => {
        const isFinished = p.status === 'finished';
        let progressCount = isFinished ? totalQuestions : (p.current_question_index || 0);
        if (progressCount > totalQuestions) progressCount = totalQuestions;

        return {
            name: p.nickname || p.User?.display_name || 'Player',
            score: p.score || 0,
            progress: progressCount
        };
    });

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-slate-200">
                    <p className="font-black text-base text-slate-800 mb-1.5">{label}</p>
                    <p className="font-bold text-indigo-600 text-sm">คะแนน: {payload[0].value}</p>
                    <p className="font-semibold text-slate-600 text-xs mt-0.5">
                        ทำไปแล้ว: {payload[0].payload.progress} / {totalQuestions} ข้อ
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div
            ref={dashboardRef}
            className="relative flex flex-col h-full bg-gradient-to-br from-slate-50 via-indigo-50/70 to-violet-50/70 rounded-2xl p-4 sm:p-6 overflow-hidden border border-white/60"
            style={{ fontFamily: "'Nunito', 'Sarabun', sans-serif" }}
        >
            {/* Animated Ambient Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0" aria-hidden="true">
                <div className="absolute top-[-10%] left-[-10%] w-40 h-40 bg-pink-300/35 rounded-3xl animate-[spin_20s_linear_infinite]" />
                <div className="absolute top-[20%] right-[-5%] w-60 h-60 bg-blue-300/30 rounded-[3rem] animate-[spin_30s_linear_infinite_reverse]" />
                <div className="absolute bottom-[-15%] left-[20%] w-52 h-52 bg-amber-200/40 rounded-full animate-pulse" />
                <div className="absolute bottom-[30%] right-[10%] w-32 h-32 bg-emerald-200/40 rounded-2xl animate-[bounce_5s_infinite]" />

                {FLOATING_ORBS.map((orb, i) => (
                    <div
                        key={`box-${i}`}
                        className="absolute bg-white/55 backdrop-blur-md border border-white/60 rounded-2xl shadow-sm"
                        style={{
                            width: `${orb.width}px`,
                            height: `${orb.height}px`,
                            left: orb.left,
                            top: orb.top,
                            animation: `float-up ${orb.dur}s ease-in-out infinite`,
                            animationDelay: `${orb.delay}s`
                        }}
                    />
                ))}
                <style>{`
                    @keyframes float-up {
                        0%, 100% { transform: translateY(0) rotate(0deg) scale(1); }
                        50% { transform: translateY(-90px) rotate(180deg) scale(1.06); }
                    }
                `}</style>
            </div>

            {/* Main Content */}
            <div className="relative z-10 flex flex-col h-full min-h-0">
                <div className="bg-white/90 backdrop-blur-md p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-lg mb-4 sm:mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border border-slate-200/80">
                    <div>
                        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-3">
                            <span className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center shadow-md shrink-0">
                                <Users size={22} strokeWidth={2.5} />
                            </span>
                            <span className="bg-gradient-to-r from-indigo-700 to-violet-700 bg-clip-text text-transparent">
                                Live Scoreboard
                            </span>
                        </h2>
                        <p className="text-slate-600 font-bold mt-1 text-xs sm:text-sm">
                            แสดงคะแนนของผู้เล่นทั้งหมดแบบ Real-time
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onEndExam}
                        className="w-full sm:w-auto bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white px-6 py-3 sm:py-3.5 rounded-2xl font-black text-sm sm:text-base shadow-[0_5px_0_#9f1239] active:translate-y-[4px] active:shadow-none transition-all flex items-center justify-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 cursor-pointer"
                    >
                        <Flag size={20} />
                        <span>จบเกมและดูเฉลย</span>
                    </button>
                </div>

                <div className="flex-1 min-h-0 bg-white/85 backdrop-blur-md rounded-2xl sm:rounded-3xl shadow-xl border border-white/80 p-4 sm:p-6 flex flex-col">
                    {sortedParticipants.length === 0 ? (
                        <div className="h-full min-h-[240px] flex flex-col items-center justify-center text-slate-600">
                            <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center mb-3 text-slate-500">
                                <Users size={32} />
                            </div>
                            <h3 className="text-lg font-extrabold text-slate-700">ยังไม่มีผู้เข้าร่วม</h3>
                            <p className="text-sm text-slate-500 mt-1">รอผู้เล่นเข้าสู่ห้องสอบและเริ่มทำข้อสอบ</p>
                        </div>
                    ) : (
                        <>
                            <div className="flex flex-wrap justify-between items-center gap-3 mb-4 sm:mb-6">
                                <h3 className="text-lg sm:text-xl font-black text-slate-800 flex items-center gap-2.5">
                                    <span className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 border border-amber-200 flex items-center justify-center">
                                        <Trophy size={18} />
                                    </span>
                                    <span>อันดับคะแนน</span>
                                </h3>
                                <div className="flex items-center gap-3">
                                    <span className="text-xs sm:text-sm font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                                        รวม {sortedParticipants.length} คน
                                    </span>
                                    <button
                                        type="button"
                                        onClick={toggleFullScreen}
                                        aria-label={isFullscreen ? 'ออกจากโหมดเต็มจอ' : 'ขยายเต็มจอ'}
                                        title="สลับเต็มจอ"
                                        className="p-2 bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 rounded-xl transition-colors border border-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 cursor-pointer"
                                    >
                                        {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
                                    </button>
                                </div>
                            </div>
                            <div className="flex-1 min-h-[260px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={chartData}
                                        margin={{ top: 16, right: 16, left: 0, bottom: 56 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                        <XAxis
                                            dataKey="name"
                                            tick={{ fill: '#334155', fontWeight: 'bold', fontSize: 13 }}
                                            tickLine={false}
                                            axisLine={{ stroke: '#cbd5e1', strokeWidth: 2 }}
                                            interval={0}
                                            angle={-35}
                                            textAnchor="end"
                                            height={60}
                                        />
                                        <YAxis
                                            allowDecimals={false}
                                            tick={{ fill: '#334155', fontWeight: 'bold', fontSize: 12 }}
                                            tickLine={false}
                                            axisLine={false}
                                        />
                                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99, 102, 241, 0.08)' }} />
                                        <Bar dataKey="score" radius={[10, 10, 0, 0]} animationDuration={800}>
                                            {chartData.map((entry, index) => {
                                                let color = '#4f46e5'; // indigo
                                                if (index === 0) color = '#eab308'; // gold
                                                else if (index === 1) color = '#64748b'; // silver
                                                else if (index === 2) color = '#d97706'; // bronze

                                                return <Cell key={`cell-${index}`} fill={color} />;
                                            })}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TutorDashboard;
