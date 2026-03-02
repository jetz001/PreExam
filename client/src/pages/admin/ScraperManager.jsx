import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Play, Square, Settings, RefreshCw, Terminal, Clock, Activity, FileText } from 'lucide-react';

const ScraperManager = () => {
    const [status, setStatus] = useState({
        isRunning: false,
        logs: [],
        lastRun: null,
        nextRun: 'Every midnight (Cron)',
    });
    const [loading, setLoading] = useState(true);
    const [isTriggering, setIsTriggering] = useState(false);

    // Config form
    const [schedule, setSchedule] = useState('0 0 * * *');

    const fetchStatus = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('/api/admin/scraper/status', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setStatus(prev => ({
                    ...prev,
                    isRunning: res.data.data.isRunning,
                    logs: res.data.data.logs || []
                }));
            }
        } catch (error) {
            console.error('Error fetching scraper status:', error);
            // toast.error('ไม่สามารถดึงสถานะ Scraper ได้');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStatus();
        // Poll every 5 seconds if running
        const interval = setInterval(() => {
            fetchStatus();
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleRunNow = async () => {
        const confirmRun = window.confirm('คุณต้องการสั่งรันสคริปต์ดึงข้อมูลเดี๋ยวนี้เลยหรือไม่?');
        if (!confirmRun) return;

        setIsTriggering(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post('/api/admin/scraper/start', {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                toast.success('เริ่มต้นดึงข้อมูลแล้ว กรุณารอสักครู่...');
                fetchStatus();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'เกิดข้อผิดพลาดในการสั่งลั่น');
        } finally {
            setIsTriggering(false);
        }
    };

    const handleUpdateSchedule = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post('/api/admin/scraper/schedule', { frequency: schedule }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                toast.success('อัปเดตความถี่สำเร็จ (ในเวอร์ชั่นนี้ยังเป็นการจำลอง)');
            }
        } catch (error) {
            toast.error('เกิดข้อผิดพลาดในการอัปเดตตั้งเวลา');
        }
    };

    if (loading && !status.logs.length) return <div className="p-8 text-center text-gray-500">กำลังโหลดข้อมูล...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold tracking-tight text-slate-800 flex items-center">
                    <Activity className="mr-2 text-indigo-600" />
                    ระบบดึงข้อมูลอัตโนมัติ (OCSC Scraper)
                </h1>
                <button
                    onClick={fetchStatus}
                    className="flex items-center text-sm text-gray-500 hover:text-indigo-600 transition-colors"
                >
                    <RefreshCw size={16} className="mr-1" /> รีเฟรช
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Status Card */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden col-span-1 md:col-span-2">
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                        <h2 className="text-lg font-semibold text-slate-800">สถานะการทำงานปัจจุบัน</h2>
                        <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center ${status.isRunning ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                            {status.isRunning ? (
                                <><span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></span> กำลังดึงข้อมูล...</>
                            ) : (
                                <><span className="w-2 h-2 rounded-full bg-slate-400 mr-2"></span> หยุดพัก (Idle)</>
                            )}
                        </div>
                    </div>

                    <div className="p-6">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center space-x-3 text-slate-600">
                                <Clock size={20} className="text-slate-400" />
                                <div>
                                    <p className="text-sm font-medium">รอบการทำงานถัดไป</p>
                                    <p className="text-xs text-slate-500">{status.nextRun}</p>
                                </div>
                            </div>

                            <button
                                onClick={handleRunNow}
                                disabled={status.isRunning || isTriggering}
                                className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all shadow-sm ${status.isRunning
                                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                        : 'bg-indigo-600 hover:bg-indigo-700 text-white hover:shadow-md'
                                    }`}
                            >
                                {isTriggering ? (
                                    <RefreshCw size={18} className="mr-2 animate-spin" />
                                ) : status.isRunning ? (
                                    <Square size={18} className="mr-2" />
                                ) : (
                                    <Play size={18} className="mr-2" />
                                )}
                                {status.isRunning ? 'กำลังทำงาน' : 'สั่งรันดึงข้อมูล 1 ครั้ง'}
                            </button>
                        </div>

                        {/* Logs Terminal */}
                        <div className="mt-4">
                            <h3 className="text-sm font-semibold text-slate-700 mb-2 flex items-center">
                                <Terminal size={16} className="mr-2" />
                                Log ล่าสุดจากระบบ
                            </h3>
                            <div className="bg-slate-900 rounded-lg p-4 h-64 overflow-y-auto font-mono text-xs text-green-400 border border-slate-700 shadow-inner">
                                {status.logs.length === 0 ? (
                                    <span className="text-slate-500">-- ไม่มีประวัติการทำงาน หรือกำลังรอรอบแรก --</span>
                                ) : (
                                    status.logs.map((log, index) => (
                                        <div key={index} className="mb-1 opacity-90 hover:opacity-100 leading-relaxed">
                                            {log}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Settings Card */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden col-span-1">
                    <div className="p-6 border-b border-slate-100">
                        <h2 className="text-lg font-semibold text-slate-800 flex items-center">
                            <Settings size={20} className="mr-2 text-slate-500" />
                            ตั้งค่าความถี่ (Schedule)
                        </h2>
                    </div>
                    <div className="p-6">
                        <form onSubmit={handleUpdateSchedule} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">ความถี่ในการดึงข้อมูล (Cron Format)</label>
                                <input
                                    type="text"
                                    value={schedule}
                                    onChange={(e) => setSchedule(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors font-mono text-sm"
                                    placeholder="0 0 * * *"
                                />
                                <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                                    ตัวอย่าง:<br />
                                    <code className="bg-slate-100 px-1 rounded">0 0 * * *</code> = ดึงข้อมูลทุกเที่ยงคืน<br />
                                    <code className="bg-slate-100 px-1 rounded">0 */12 * * *</code> = ดึงข้อมูลทุก 12 ชั่วโมง<br />
                                    <span className="text-amber-600 block mt-1">* หมายเหตุ: โปรดแก้ไขไฟล์ Cron บน Server ด้วยหากต้องการให้มีผลจริง </span>
                                </p>
                            </div>

                            <button
                                type="submit"
                                className="w-full mt-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-2 px-4 rounded-lg transition-colors border border-slate-200"
                            >
                                บันทึกการตั้งค่า
                            </button>
                        </form>

                        <div className="mt-8 pt-6 border-t border-slate-100">
                            <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center">
                                <FileText size={16} className="mr-2" />
                                คู่มือการใช้งานย่อ
                            </h3>
                            <ul className="text-xs text-slate-600 space-y-2 list-disc list-inside">
                                <li>ระบบจะเช็คงานซ้ำให้อัตโนมัติ งานไหนเอามาแล้วจะไม่เอามาอีก</li>
                                <li>การสั่ง Manual จะทำงานหลังบ้าน (ไม่หยุดแม้ปิดหน้าเว็บนี้)</li>
                                <li>เมื่อดึงข้อมูลเสร็จ ข่าวจะไปอยู่ใน <strong>"จัดการข่าวสาร"</strong> (สถานะร่าง)</li>
                            </ul>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ScraperManager;
