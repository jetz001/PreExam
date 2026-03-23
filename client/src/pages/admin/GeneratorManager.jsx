import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Play, Square, Settings, RefreshCw, Terminal, Clock, Activity, FileText, Bot } from 'lucide-react';
import TerminalUI from '../../components/admin/TerminalUI';

const GeneratorManager = () => {
    const [status, setStatus] = useState({
        isRunning: false,
        logs: [],
        lastRun: null,
        nextRun: 'Every midnight (Cron)',
    });
    const [loading, setLoading] = useState(true);
    const [isTriggering, setIsTriggering] = useState(false);
    const [schedule, setSchedule] = useState('0 0 * * *');

    const fetchStatus = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('/api/admin/generator/status', {
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
            console.error('Error fetching generator status:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStatus();
        const interval = setInterval(() => {
            fetchStatus();
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleRunNow = async () => {
        const confirmRun = window.confirm('คุณต้องการสั่งสร้างข้อสอบใหม่เดี๋ยวนี้เลยหรือไม่? (กินโควต้า Gemini API)');
        if (!confirmRun) return;

        setIsTriggering(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post('/api/admin/generator/start', {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                toast.success('เริ่มต้นกระบวนการสร้างข้อสอบแล้ว กรุณารอสักครู่ (ใช้เวลาสูงสุด 2 นาที)');
                fetchStatus();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'เกิดข้อผิดพลาดในการสั่งรัน');
        } finally {
            setIsTriggering(false);
        }
    };

    const handleUpdateSchedule = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post('/api/admin/generator/schedule', { frequency: schedule }, {
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
                    <Bot className="mr-2 text-indigo-600" />
                    ระบบสร้างข้อสอบอัตโนมัติ (Generator)
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
                                <><span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></span> กำลังสร้างข้อสอบ...</>
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
                                {status.isRunning ? 'กำลังทำงาน' : 'สั่งสร้างข้อสอบ 1 ครั้ง'}
                            </button>
                        </div>

                        {/* Terminal UI */}
                        <div className="mt-8">
                            <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center justify-between">
                                <div className="flex items-center">
                                    <Terminal size={18} className="mr-2 text-indigo-500" />
                                    Virtual Terminal (AI Control)
                                </div>
                                <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-mono uppercase tracking-tighter">Connected</span>
                            </h3>
                            <TerminalUI />
                        </div>

                        {/* Recent Logs (Simplified) */}
                        <div className="mt-8 pt-6 border-t border-slate-100">
                            <h3 className="text-sm font-semibold text-slate-700 mb-2 flex items-center">
                                <Activity size={16} className="mr-2 text-slate-400" />
                                ข้อมูลการทำงานล่าสุด (Last Logs)
                            </h3>
                            <div className="bg-slate-50 rounded-lg p-3 h-32 overflow-y-auto font-mono text-[10px] text-slate-500 border border-slate-200">
                                {status.logs.length === 0 ? (
                                    <span>-- No recent logs --</span>
                                ) : (
                                    status.logs.slice(-10).map((log, index) => (
                                        <div key={index} className="mb-0.5 whitespace-pre-wrap">
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
                            ตั้งค่าระดับโควต้า AI
                        </h2>
                    </div>
                    <div className="p-6">
                        <form onSubmit={handleUpdateSchedule} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">ความถี่ในการสร้างข้อสอบ (Cron Format)</label>
                                <input
                                    type="text"
                                    value={schedule}
                                    onChange={(e) => setSchedule(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors font-mono text-sm"
                                    placeholder="0 0 * * *"
                                />
                                <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                                    ตัวอย่าง:<br />
                                    <code className="bg-slate-100 px-1 rounded">0 0 * * *</code> = 1 ข้อต่อวัน (เที่ยงคืน)<br />
                                    <code className="bg-slate-100 px-1 rounded">0 */2 * * *</code> = 1 ข้อทุก 2 ชั่วโมง<br />
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
                                เกี่ยวกับ API โควต้า (Gemini)
                            </h3>
                            <ul className="text-xs text-slate-600 space-y-2 list-disc list-inside">
                                <li>ระบบมีกลไก Exponential Backoff ช่วยรอและยิงซ้ำหากโควต้าเต็ม (Rate Limit)</li>
                                <li>หลังจาก AI สร้างข้อสอบเสร็จสมบูรณ์ระบบจะส่งการแจ้งเตือนเข้าไปยัง <strong>Inbox</strong></li>
                                <li>ข้อสอบใหม่จะเข้าไปปรากฏที่ <strong>"จัดการคลังข้อสอบ"</strong> ให้อัตโนมัติ</li>
                            </ul>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default GeneratorManager;
