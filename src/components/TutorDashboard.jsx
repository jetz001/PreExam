import React, { useState, useRef } from 'react';
import { Users, Flag, Trophy, Maximize, Minimize } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';

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
                <div className="bg-white p-4 rounded-xl shadow-xl border-2 border-gray-100">
                    <p className="font-black text-lg text-gray-800 mb-2">{label}</p>
                    <p className="font-bold text-blue-600">คะแนน: {payload[0].value}</p>
                    <p className="font-bold text-gray-500">
                        ทำไปแล้ว: {payload[0].payload.progress} / {totalQuestions} ข้อ
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div ref={dashboardRef} className="relative flex flex-col h-full bg-[#fdfbf7] font-sans p-6 overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-40 h-40 bg-pink-300 rounded-3xl opacity-40 animate-[spin_20s_linear_infinite]" />
                <div className="absolute top-[20%] right-[-5%] w-60 h-60 bg-blue-300 rounded-[3rem] opacity-30 animate-[spin_30s_linear_infinite_reverse]" />
                <div className="absolute bottom-[-15%] left-[20%] w-52 h-52 bg-yellow-300 rounded-full opacity-40 animate-pulse" />
                <div className="absolute bottom-[30%] right-[10%] w-32 h-32 bg-green-300 rounded-2xl opacity-40 animate-[bounce_5s_infinite]" />
                <div className="absolute top-[40%] left-[30%] w-24 h-24 bg-purple-300 rounded-[2rem] opacity-30 animate-[spin_15s_linear_infinite]" />
                
                {/* Floating boxes */}
                {[...Array(12)].map((_, i) => (
                    <div 
                        key={`box-${i}`}
                        className="absolute bg-white/60 backdrop-blur-md border border-white/50 rounded-2xl shadow-lg"
                        style={{
                            width: Math.random() * 80 + 30 + 'px',
                            height: Math.random() * 80 + 30 + 'px',
                            left: Math.random() * 100 + '%',
                            top: Math.random() * 100 + '%',
                            animation: `float-up ${Math.random() * 15 + 15}s ease-in-out infinite`,
                            animationDelay: `-${Math.random() * 15}s`
                        }}
                    />
                ))}
                <style>{`
                    @keyframes float-up {
                        0%, 100% { transform: translateY(0) rotate(0deg) scale(1); }
                        50% { transform: translateY(-150px) rotate(180deg) scale(1.1); }
                    }
                `}</style>
            </div>

            {/* Main Content */}
            <div className="relative z-10 flex flex-col h-full">
                <div className="bg-white/90 backdrop-blur-sm p-6 rounded-3xl shadow-xl mb-6 flex justify-between items-center border-b-4 border-gray-200">
                    <div>
                        <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 flex items-center gap-3">
                            <Users className="text-blue-600" size={32} />
                            Live Scoreboard
                        </h2>
                        <p className="text-gray-500 font-bold mt-1 text-sm">
                            แสดงคะแนนของผู้เล่นทั้งหมดแบบ Real-time
                        </p>
                    </div>
                    <button
                        onClick={onEndExam}
                        className="bg-gradient-to-r from-[#e21b3c] to-[#ff4b6a] hover:from-[#c91835] hover:to-[#e21b3c] text-white px-8 py-4 rounded-2xl font-black text-lg shadow-[0_6px_0_#b3152d] active:translate-y-[6px] active:shadow-none transition-all flex items-center gap-3"
                    >
                        <Flag size={24} />
                        จบเกมและดูเฉลย
                    </button>
                </div>

                <div className="flex-1 bg-white/20 backdrop-blur-sm rounded-3xl shadow-2xl border-4 border-white p-6 flex flex-col">
                {sortedParticipants.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400">
                        <Users size={64} className="mb-4 opacity-50" />
                        <h3 className="text-xl font-bold">ยังไม่มีผู้เข้าร่วม</h3>
                    </div>
                ) : (
                    <>
                        <div className="flex justify-between items-center mb-6 px-4">
                            <h3 className="text-xl font-black text-gray-700 flex items-center gap-2">
                                <Trophy className="text-yellow-500" />
                                อันดับคะแนน
                            </h3>
                            <div className="flex items-center gap-4">
                                <div className="text-sm font-bold text-gray-500">
                                    รวม {sortedParticipants.length} คน
                                </div>
                                <button
                                    onClick={toggleFullScreen}
                                    className="p-2 bg-white/50 hover:bg-white/80 rounded-xl transition-colors text-gray-600 shadow-sm"
                                    title="สลับเต็มจอ"
                                >
                                    {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 min-h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={chartData}
                                    margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                    <XAxis 
                                        dataKey="name" 
                                        tick={{ fill: '#4b5563', fontWeight: 'bold', fontSize: 14 }}
                                        tickLine={false}
                                        axisLine={{ stroke: '#cbd5e1', strokeWidth: 2 }}
                                        interval={0}
                                        angle={-45}
                                        textAnchor="end"
                                        height={60}
                                    />
                                    <YAxis 
                                        allowDecimals={false}
                                        tick={{ fill: '#4b5563', fontWeight: 'bold' }}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                                    <Bar dataKey="score" radius={[8, 8, 0, 0]} animationDuration={1000}>
                                        {chartData.map((entry, index) => {
                                            // Assign different colors based on rank
                                            let color = '#3b82f6'; // default blue
                                            if (index === 0) color = '#eab308'; // gold
                                            else if (index === 1) color = '#94a3b8'; // silver
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
