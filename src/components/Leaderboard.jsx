import React from 'react';
import { Trophy } from 'lucide-react';

const Leaderboard = ({ participants }) => {
    // Sort participants by score (desc)
    const sortedParticipants = [...participants].sort((a, b) => b.score - a.score);

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-3 border-b border-gray-200 bg-yellow-50 flex items-center">
                <Trophy className="w-5 h-5 text-yellow-600 mr-2" />
                <h3 className="font-bold text-gray-700">Live Leaderboard</h3>
            </div>
            <div className="p-0">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th className="px-4 py-2">Rank</th>
                            <th className="px-4 py-2">Name</th>
                            <th className="px-4 py-2 text-right">Score</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedParticipants.map((p, index) => (
                            <tr key={p.id} className="border-b hover:bg-gray-50">
                                <td className="px-4 py-2 font-medium">
                                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                                </td>
                                <td className="px-4 py-2 font-medium text-gray-900">
                                    {p.User?.display_name}
                                </td>
                                <td className="px-4 py-2 text-right font-bold text-primary">
                                    {p.score}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Leaderboard;
