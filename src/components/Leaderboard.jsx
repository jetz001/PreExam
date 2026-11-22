import React from 'react';
import { Trophy, Crown, Medal, Award, Sparkles } from 'lucide-react';

const getRankBadge = (index) => {
    if (index === 0) {
        return (
            <span
                className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-500 text-amber-950 shadow-sm border border-amber-200"
                aria-label="อันดับที่ 1"
                title="อันดับที่ 1"
            >
                <Crown className="w-4 h-4" strokeWidth={2.5} />
            </span>
        );
    }
    if (index === 1) {
        return (
            <span
                className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-slate-200 via-slate-300 to-slate-400 text-slate-800 shadow-sm border border-white"
                aria-label="อันดับที่ 2"
                title="อันดับที่ 2"
            >
                <Medal className="w-4 h-4" strokeWidth={2.5} />
            </span>
        );
    }
    if (index === 2) {
        return (
            <span
                className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-orange-300 via-amber-500 to-orange-600 text-white shadow-sm border border-orange-200"
                aria-label="อันดับที่ 3"
                title="อันดับที่ 3"
            >
                <Award className="w-4 h-4" strokeWidth={2.5} />
            </span>
        );
    }
    return (
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-slate-100 text-slate-700 font-extrabold text-xs border border-slate-200">
            {index + 1}
        </span>
    );
};

const Leaderboard = ({ participants = [] }) => {
    // Sort participants by score (desc)
    const sortedParticipants = [...participants].sort((a, b) => (b.score || 0) - (a.score || 0));

    return (
        <div
            className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-white/60 overflow-hidden"
            style={{ fontFamily: "'Nunito', 'Sarabun', sans-serif" }}
        >
            <div className="px-4 py-3.5 border-b border-amber-200/70 bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center shadow-sm shrink-0">
                        <Trophy className="w-4.5 h-4.5" strokeWidth={2.5} />
                    </span>
                    <div className="min-w-0">
                        <h3 className="font-black text-slate-800 text-sm sm:text-base leading-tight truncate">
                            Live Leaderboard
                        </h3>
                        <p className="text-xs font-semibold text-slate-600">
                            อันดับคะแนนแบบเรียลไทม์
                        </p>
                    </div>
                </div>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold bg-amber-100 text-amber-800 border border-amber-200 shrink-0">
                    <Sparkles className="w-3.5 h-3.5" />
                    {sortedParticipants.length} คน
                </span>
            </div>

            {sortedParticipants.length === 0 ? (
                <div className="p-8 text-center text-slate-600 font-semibold text-sm">
                    ยังไม่มีผู้เล่นในตารางอันดับ
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-600 uppercase bg-slate-50/90 border-b border-slate-200/80">
                            <tr>
                                <th className="px-4 py-2.5 font-extrabold w-16">Rank</th>
                                <th className="px-4 py-2.5 font-extrabold">Player</th>
                                <th className="px-4 py-2.5 font-extrabold text-right">Score</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {sortedParticipants.map((p, index) => {
                                const playerName = p.nickname || p.User?.display_name || 'ผู้เล่น';
                                return (
                                    <tr
                                        key={p.user_id || index}
                                        className={`transition-colors duration-150 ${
                                            index === 0
                                                ? 'bg-amber-50/50 hover:bg-amber-50/80'
                                                : 'hover:bg-indigo-50/40'
                                        }`}
                                    >
                                        <td className="px-4 py-2.5 font-bold whitespace-nowrap">
                                            {getRankBadge(index)}
                                        </td>
                                        <td className="px-4 py-2.5 font-bold text-slate-800">
                                            <div className="flex items-center gap-2.5 min-w-0">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white text-xs font-black flex items-center justify-center shrink-0 overflow-hidden border border-white shadow-xs">
                                                    {p.User?.avatar ? (
                                                        <img
                                                            src={p.User.avatar}
                                                            alt={playerName}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        playerName.charAt(0).toUpperCase()
                                                    )}
                                                </div>
                                                <span className="truncate max-w-[140px] sm:max-w-[240px]">
                                                    {playerName}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-2.5 text-right whitespace-nowrap">
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-black text-sm border border-indigo-100">
                                                {(p.score || 0).toLocaleString()}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default Leaderboard;
