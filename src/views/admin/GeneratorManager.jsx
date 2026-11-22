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
        // Poll status every 2 seconds if running
        const interval = setInterval(() => {
            if (status.isRunning) {
                fetchStatus();
            }
        }, 2000);
        return () => clearInterval(interval);
    }, [status.isRunning]);

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

    if (loading && !status.logs.length) {
        return (
            <div className="space-y-6 animate-pulse" role="status" aria-label="กำลังโหลดข้อมูล AI Generator">
                <div className="h-24 rounded-2xl bg-slate-200/80" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 h-96 rounded-2xl bg-slate-200/80" />
                    <div className="h-96 rounded-2xl bg-slate-200/80" />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-8">
            {/* Executive Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl bg-white/90 backdrop-blur-sm p-5 sm:p-6 border border-slate-200/80 shadow-sm">
                <div className="flex items-center gap-3.5 min-w-0">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-500/20">
                        <Bot size={24} />
                    </div>
                    <div className="min-w-0">
                        <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 truncate">
                            ระบบสร้างข้อสอบอัตโนมัติ (AI Generator)
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                            สั่งสร้างข้อสอบด้วย AI ควบคุมคำสั่งผ่าน Virtual Terminal และตั้งค่ารอบการสร้างอัตโนมัติ
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={fetchStatus}
                    aria-label="รีเฟรชสถานะ Generator"
                    className="inline-flex items-center justify-center gap-2 self-start sm:self-auto px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 border border-slate-200/80 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                >
                    <RefreshCw size={16} />
                    <span>รีเฟรช</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Status Card */}
                <div className="rounded-2xl bg-white/90 backdrop-blur-sm border border-slate-200/80 shadow-sm overflow-hidden col-span-1 md:col-span-2">
                    <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-wrap justify-between items-center gap-3 bg-slate-50/60">
                        <h3 className="text-base sm:text-lg font-bold text-slate-900">สถานะการทำงานปัจจุบัน</h3>
                        <div
                            className={`px-3.5 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-2 border ${
                                status.isRunning
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : 'bg-slate-100 text-slate-700 border-slate-200'
                            }`}
                        >
                            <span
                                className={`w-2 h-2 rounded-full ${
                                    status.isRunning ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'
                                }`}
                            />
                            <span>{status.isRunning ? 'กำลังสร้างข้อสอบ...' : 'หยุดพัก (Idle)'}</span>
                        </div>
                    </div>

                    <div className="p-5 sm:p-6 space-y-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl bg-slate-50/80 border border-slate-200/70 p-4">
                            <div className="flex items-center gap-3 text-slate-700">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200/70">
                                    <Clock size={18} />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-900">รอบการทำงานถัดไป</p>
                                    <p className="text-xs font-medium text-slate-500">{status.nextRun}</p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={handleRunNow}
                                disabled={status.isRunning || isTriggering}
                                className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                                    status.isRunning
                                        ? 'bg-slate-200 text-slate-600 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-md shadow-indigo-500/20'
                                }`}
                            >
                                {isTriggering ? (
                                    <RefreshCw size={17} className="animate-spin" />
                                ) : status.isRunning ? (
                                    <Square size={17} />
                                ) : (
                                    <Play size={17} />
                                )}
                                <span>{status.isRunning ? 'กำลังทำงาน' : 'สั่งสร้างข้อสอบ 1 ครั้ง'}</span>
                            </button>
                        </div>

                        {/* Terminal UI */}
                        <div>
                            <div className="text-sm font-bold text-slate-800 mb-3 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Terminal size={17} className="text-indigo-600" />
                                    <span>Virtual Terminal (AI Control)</span>
                                </div>
                                <span className="text-[11px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full font-semibold">
                                    Connected
                                </span>
                            </div>
                            <TerminalUI />
                        </div>

                        {/* Recent Logs */}
                        <div className="pt-5 border-t border-slate-100">
                            <h4 className="text-sm font-bold text-slate-800 mb-2.5 flex items-center gap-2">
                                <Activity size={16} className="text-indigo-600" />
                                <span>ข้อมูลการทำงานล่าสุด (Last Logs)</span>
                            </h4>
                            <div className="bg-slate-50 rounded-xl p-3.5 h-32 overflow-y-auto font-mono text-xs text-slate-700 border border-slate-200/80 custom-scrollbar">
                                {status.logs.length === 0 ? (
                                    <span className="text-slate-500">-- No recent logs --</span>
                                ) : (
                                    status.logs.slice(-10).map((log, index) => (
                                        <div key={index} className="mb-1 whitespace-pre-wrap leading-relaxed">
                                            {log}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Settings Card */}
                <div className="rounded-2xl bg-white/90 backdrop-blur-sm border border-slate-200/80 shadow-sm overflow-hidden col-span-1">
                    <div className="p-5 sm:p-6 border-b border-slate-100 bg-slate-50/60">
                        <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                            <Settings size={18} className="text-indigo-600" />
                            <span>ตั้งค่าระดับโควต้า AI</span>
                        </h3>
                    </div>
                    <div className="p-5 sm:p-6">
                        <form onSubmit={handleUpdateSchedule} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                    ความถี่ในการสร้างข้อสอบ (Cron Format)
                                </label>
                                <input
                                    type="text"
                                    value={schedule}
                                    onChange={(e) => setSchedule(e.target.value)}
                                    className="w-full px-3.5 py-2.5 border border-slate-200 bg-slate-50/70 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none transition-all font-mono text-sm text-slate-900"
                                    placeholder="0 0 * * *"
                                />
                                <p className="mt-2.5 text-xs text-slate-600 leading-relaxed space-y-1">
                                    <span className="block font-semibold text-slate-700">ตัวอย่าง:</span>
                                    <span className="block">
                                        <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-slate-800">0 0 * * *</code> = 1 ข้อต่อวัน (เที่ยงคืน)
                                    </span>
                                    <span className="block">
                                        <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-slate-800">0 */2 * * *</code> = 1 ข้อทุก 2 ชั่วโมง
                                    </span>
                                    <span className="text-amber-700 font-medium block mt-1.5">
                                        * หมายเหตุ: โปรดแก้ไขไฟล์ Cron บน Server ด้วยหากต้องการให้มีผลจริง
                                    </span>
                                </p>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2.5 px-4 rounded-xl text-sm transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                            >
                                บันทึกการตั้งค่า
                            </button>
                        </form>

                        <div className="mt-6 pt-5 border-t border-slate-100">
                            <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                                <FileText size={16} className="text-indigo-600" />
                                <span>เกี่ยวกับ API โควต้า (Gemini)</span>
                            </h4>
                            <ul className="text-xs text-slate-600 space-y-2 list-disc list-inside leading-relaxed">
                                <li>ระบบมีกลไก Exponential Backoff ช่วยรอและยิงซ้ำหากโควต้าเต็ม (Rate Limit)</li>
                                <li>หลังจาก AI สร้างข้อสอบเสร็จสมบูรณ์ระบบจะส่งการแจ้งเตือนเข้าไปยัง <strong>Inbox</strong></li>
                                <li>ข้อสอบใหม่จะเข้าไปปรากฏที่ <strong>&ldquo;จัดการคลังข้อสอบ&rdquo;</strong> ให้อัตโนมัติ</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GeneratorManager;
