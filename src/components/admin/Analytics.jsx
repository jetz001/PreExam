import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Users, FileQuestion, CheckCircle, CreditCard } from 'lucide-react';
import CommerceChart from './CommerceChart';

const Analytics = () => {
    const [stats, setStats] = useState(null);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await api.get('/admin/stats');
            setStats(response.data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    if (!stats) return <div>Loading...</div>;

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">ภาพรวมระบบ</h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <div className="bg-blue-100 p-3 rounded-lg">
                            <Users className="h-6 w-6 text-primary" />
                        </div>
                        <span className="text-sm font-medium text-gray-500">ทั้งหมด</span>
                    </div>
                    <div className="text-3xl font-bold text-gray-900">{stats.totalUsers}</div>
                    <div className="text-sm text-gray-500 mt-1">ผู้ใช้งานในระบบ</div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <div className="bg-green-100 p-3 rounded-lg">
                            <FileQuestion className="h-6 w-6 text-green-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-500">ทั้งหมด</span>
                    </div>
                    <div className="text-3xl font-bold text-gray-900">{stats.totalQuestions}</div>
                    <div className="text-sm text-gray-500 mt-1">ข้อสอบในคลัง</div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <div className="bg-purple-100 p-3 rounded-lg">
                            <CheckCircle className="h-6 w-6 text-purple-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-500">ทั้งหมด</span>
                    </div>
                    <div className="text-3xl font-bold text-gray-900">{stats.totalExamsTaken}</div>
                    <div className="text-sm text-gray-500 mt-1">ครั้งที่สอบไปแล้ว</div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <div className="bg-yellow-100 p-3 rounded-lg">
                            <CreditCard className="h-6 w-6 text-yellow-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-500">รอตรวจสอบ</span>
                    </div>
                    <div className="text-3xl font-bold text-gray-900">{stats.pendingPayments}</div>
                    <div className="text-sm text-gray-500 mt-1">รายการแจ้งโอน</div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 col-span-1 md:col-span-4">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Commercial Viability Score (III)</h3>
                <div className="h-96 w-full">
                    {stats.commercialData && <CommerceChart data={stats.commercialData} />}
                </div>
            </div>
        </div>
    );
};

export default Analytics;
