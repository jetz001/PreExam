import React, { useEffect, useState } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import userService from '../services/userService';
import examService from '../services/examService';
import authService from '../services/authService';
import { useNavigate } from 'react-router-dom';
import FriendList from '../components/Community/FriendList';
import FriendRequests from '../components/Community/FriendRequests';
import UserSearch from '../components/Community/UserSearch';

const Dashboard = () => {
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState(null);
    const [history, setHistory] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const currentUser = authService.getCurrentUser();
        if (!currentUser) {
            navigate('/login');
            return;
        }
        setUser(currentUser);

        const fetchData = async () => {
            try {
                const statsRes = await userService.getStats();
                setStats(statsRes.data);
                const historyRes = await examService.getHistory();
                setHistory(historyRes.data);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            }
        };

        fetchData();
    }, [navigate]);

    if (!user || !stats) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="md:flex md:items-center md:justify-between mb-8">
                <div className="flex-1 min-w-0">
                    <h2 id="tour-welcome" className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                        สวัสดี, {user.display_name}
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                        Member ID: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{user.public_id}</span>
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                        ยินดีต้อนรับกลับสู่ PreExam
                    </p>
                </div>
                <div className="mt-4 flex md:mt-0 md:ml-4">
                    <button
                        type="button"
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                        onClick={() => {
                            const newName = prompt('Enter new display name:', user.display_name);
                            if (newName && newName !== user.display_name) {
                                userService.updateProfile({ display_name: newName })
                                    .then(res => setUser(res.data))
                                    .catch(err => alert('Failed to update name'));
                            }
                        }}
                    >
                        แก้ไขชื่อ
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Stats Overview */}
                <div id="tour-stats" className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <dt className="text-sm font-medium text-gray-500 truncate">
                            จำนวนข้อสอบที่ทำไป
                        </dt>
                        <dd className="mt-1 text-3xl font-semibold text-gray-900">
                            {stats.totalExams} ชุด
                        </dd>
                    </div>
                </div>
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <dt className="text-sm font-medium text-gray-500 truncate">
                            คะแนนเฉลี่ยรวม
                        </dt>
                        <dd className="mt-1 text-3xl font-semibold text-gray-900">
                            {(stats.averageScore || 0).toFixed(2)}%
                        </dd>
                    </div>
                </div>
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <dt className="text-sm font-medium text-gray-500 truncate">
                            สถานะสมาชิก
                        </dt>
                        <dd className="mt-1 text-3xl font-semibold text-primary">
                            {user.plan_type === 'premium' ? 'Premium' : 'Free'}
                        </dd>
                        {user.plan_type === 'free' && (
                            <button
                                onClick={() => navigate('/premium-upgrade')}
                                className="mt-2 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-yellow-500 hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                            >
                                Upgrade Now
                            </button>
                        )}
                    </div>
                </div>

                {/* Skill Radar */}
                <div className="md:col-span-2 bg-white overflow-hidden shadow rounded-lg p-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                        วิเคราะห์จุดแข็ง/จุดอ่อน
                    </h3>
                    <div className="h-80 w-full" style={{ minHeight: '320px' }}>
                        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={stats.radarData}>
                                <PolarGrid />
                                <PolarAngleAxis dataKey="subject" />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                                <Radar
                                    name="Skill"
                                    dataKey="score"
                                    stroke="#4169E1"
                                    fill="#4169E1"
                                    fillOpacity={0.6}
                                />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Recent History */}
                <div className="bg-white overflow-hidden shadow rounded-lg p-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                        ประวัติการสอบล่าสุด
                    </h3>
                    <ul className="divide-y divide-gray-200">
                        {history.slice(0, 5).map((item) => (
                            <li key={item.id} className="py-4">
                                <div className="flex space-x-3">
                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-sm font-medium text-gray-900">
                                                {item.mode === 'classroom' ? 'Multiplayer Class' :
                                                    item.mode === 'simulation' ? 'Simulation Exam' :
                                                        'Practice Mode'}
                                            </h3>
                                            <p className="text-sm text-gray-500">{new Date(item.taken_at).toLocaleDateString()}</p>
                                        </div>
                                        <p className="text-sm text-gray-500">
                                            คะแนน: {item.score}/{item.total_score}
                                        </p>
                                    </div>
                                </div>
                            </li>
                        ))}
                        {history.length === 0 && (
                            <li className="py-4 text-center text-gray-500">ยังไม่มีประวัติการสอบ</li>
                        )}
                    </ul>
                </div>
            </div>

            {/* Friends Section */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2">
                    <FriendList />
                </div>
                <div>
                    <FriendRequests />
                    <div className="mt-8">
                        <UserSearch />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
