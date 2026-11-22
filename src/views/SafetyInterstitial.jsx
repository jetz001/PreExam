import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ShieldAlert, ExternalLink, ArrowLeft, Globe, Lock } from 'lucide-react';
import BrandLogo from '../components/common/BrandLogo';

const isSafeHttpUrl = (rawUrl) => {
    if (!rawUrl) return false;
    try {
        const parsed = new URL(rawUrl, 'https://preexam.local');
        return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
        return false;
    }
};

const SafetyInterstitial = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(location.search);
    const targetUrl = queryParams.get('target');
    const validTarget = isSafeHttpUrl(targetUrl);

    if (!targetUrl || !validTarget) {
        return (
            <div
                className="-mt-20 pt-24 pb-12 min-h-screen flex items-center justify-center bg-[radial-gradient(circle_at_top,#5b21b6_0%,#311068_50%,#14082e_100%)] px-4 text-white"
                style={{ fontFamily: "'Sarabun', 'Nunito', sans-serif" }}
            >
                <div className="bg-white/10 backdrop-blur-2xl max-w-md w-full rounded-3xl shadow-2xl p-8 border border-white/18 text-center">
                    <div className="flex justify-center mb-6">
                        <BrandLogo variant="dark" size="sm" />
                    </div>
                    <div className="w-16 h-16 rounded-2xl bg-rose-500/20 border border-rose-400/35 text-rose-300 flex items-center justify-center mx-auto mb-5">
                        <ShieldAlert size={32} />
                    </div>
                    <h1 className="text-2xl font-extrabold text-white mb-2">ลิงก์ไม่ถูกต้อง</h1>
                    <p className="text-sm text-slate-300 mb-6">
                        ไม่พบปลายทางที่ต้องการเปิด หรือรูปแบบลิงก์ไม่ปลอดภัย
                    </p>
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="w-full py-3 px-5 bg-white/12 hover:bg-white/20 border border-white/20 text-white font-bold rounded-2xl transition-all inline-flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                    >
                        <ArrowLeft size={18} />
                        <span>ย้อนกลับ</span>
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div
            className="-mt-20 pt-24 pb-12 min-h-screen flex flex-col items-center justify-center bg-[radial-gradient(circle_at_top,#5b21b6_0%,#311068_50%,#14082e_100%)] p-4 text-white relative overflow-x-hidden"
            style={{ fontFamily: "'Sarabun', 'Nunito', sans-serif" }}
        >
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-24 left-1/4 w-96 h-96 rounded-full bg-indigo-500/20 blur-[120px]" />
                <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full bg-amber-500/15 blur-[120px]" />
            </div>

            <div className="relative z-10 bg-white/10 backdrop-blur-2xl max-w-lg w-full rounded-3xl shadow-[0_24px_64px_rgba(8,3,28,0.6)] p-6 sm:p-8 border border-white/18 text-center">
                <div className="flex justify-center mb-6">
                    <BrandLogo variant="dark" size="sm" badge="SAFE LINK" />
                </div>

                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-400/25 to-orange-500/25 border border-amber-300/40 flex items-center justify-center mx-auto mb-5 shadow-[0_0_28px_rgba(251,191,36,0.28)]">
                    <ShieldAlert size={40} className="text-amber-300" />
                </div>

                <h1
                    className="text-2xl sm:text-3xl font-black text-white mb-2.5"
                    style={{ fontFamily: "'Nunito', 'Sarabun', sans-serif" }}
                >
                    คุณกำลังออกจาก PreExam
                </h1>
                <p className="text-sm sm:text-base text-slate-200 leading-relaxed mb-6">
                    ลิงก์ภายนอกอาจมีความเสี่ยง โปรดตรวจสอบ URL ด้านล่างให้แน่ใจก่อนกรอกรหัสผ่านหรือข้อมูลส่วนตัวบนเว็บไซต์อื่น
                </p>

                <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-white/15 mb-7 text-left flex items-start gap-2.5">
                    <Globe size={18} className="text-sky-300 shrink-0 mt-0.5" />
                    <span className="break-all font-mono text-xs sm:text-sm text-amber-200 leading-relaxed">
                        {targetUrl}
                    </span>
                </div>

                <div className="space-y-3">
                    <a
                        href={targetUrl}
                        rel="noopener noreferrer"
                        className="w-full py-3.5 px-5 bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-600 hover:brightness-110 text-white font-extrabold rounded-2xl transition-all shadow-[0_12px_28px_-6px_rgba(99,102,241,0.55)] flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                    >
                        <ExternalLink size={18} />
                        <span>ไปยังเว็บไซต์ปลายทาง</span>
                    </a>

                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="w-full py-3.5 px-5 bg-white/10 hover:bg-white/18 border border-white/18 text-slate-100 font-bold rounded-2xl transition-all flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                    >
                        <ArrowLeft size={18} />
                        <span>ย้อนกลับ</span>
                    </button>
                </div>

                <div className="mt-6 pt-4 border-t border-white/12 flex items-center justify-center gap-1.5 text-xs text-slate-300">
                    <Lock size={13} className="text-slate-300 shrink-0" />
                    <span>PreExam ไม่รับผิดชอบต่อเนื้อหาหรือความปลอดภัยของเว็บไซต์ภายนอก</span>
                </div>
            </div>
        </div>
    );
};

export default SafetyInterstitial;
