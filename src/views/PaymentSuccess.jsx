import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import BrandLogo from '../components/common/BrandLogo';

const PaymentSuccess = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const sessionId = searchParams.get('session_id');
    const [secondsLeft, setSecondsLeft] = useState(5);

    useEffect(() => {
        const timer = setTimeout(() => {
            navigate('/profile');
        }, 5000);

        const countdown = setInterval(() => {
            setSecondsLeft((prev) => (prev > 1 ? prev - 1 : 1));
        }, 1000);

        return () => {
            clearTimeout(timer);
            clearInterval(countdown);
        };
    }, [navigate, sessionId]);

    return (
        <div
            className="-mt-20 pt-24 pb-12 min-h-screen bg-[radial-gradient(circle_at_top,#4c1d95_0%,#240b52_48%,#0f0724_100%)] text-white flex flex-col items-center justify-center p-4 relative overflow-x-hidden"
            style={{ fontFamily: "'Sarabun', 'Nunito', sans-serif" }}
        >
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-24 left-1/4 w-96 h-96 rounded-full bg-emerald-500/20 blur-[120px]" />
                <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full bg-indigo-500/20 blur-[120px]" />
            </div>

            <div className="relative z-10 bg-white/10 backdrop-blur-2xl rounded-3xl shadow-[0_24px_64px_rgba(8,3,28,0.65)] border border-white/18 p-6 sm:p-9 max-w-md w-full text-center">
                <div className="flex justify-center mb-6">
                    <BrandLogo variant="dark" size="sm" badge="PRO" />
                </div>

                <div className="relative w-20 h-20 mx-auto mb-6">
                    <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-400 to-teal-600 p-[1px] shadow-[0_0_32px_rgba(16,185,129,0.45)]">
                        <div className="w-full h-full rounded-[23px] bg-slate-950/35 backdrop-blur-md flex items-center justify-center text-emerald-200">
                            <CheckCircle2 className="w-10 h-10" />
                        </div>
                    </div>
                    <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shadow-lg">
                        <Sparkles size={14} />
                    </span>
                </div>

                <h1
                    className="text-2xl sm:text-3xl font-black text-white mb-2.5"
                    style={{ fontFamily: "'Nunito', 'Sarabun', sans-serif" }}
                >
                    Payment Successful!
                </h1>
                <p className="text-sm sm:text-base text-slate-200 leading-relaxed mb-7">
                    ขอบคุณสำหรับการสนับสนุน ระบบดำเนินการชำระเงินของคุณเรียบร้อยแล้วและพร้อมใช้งานทันที
                </p>

                {sessionId && (
                    <div className="mb-6 px-3.5 py-2 rounded-xl bg-white/8 border border-white/12 text-xs text-slate-300 font-mono truncate">
                        Ref: {sessionId}
                    </div>
                )}

                <button
                    type="button"
                    onClick={() => navigate('/profile')}
                    className="w-full py-3.5 px-6 bg-gradient-to-r from-emerald-500 to-teal-500 hover:brightness-110 text-white font-extrabold rounded-2xl shadow-[0_12px_28px_-6px_rgba(16,185,129,0.5)] transition-all inline-flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                >
                    <span>กลับสู่หน้าโปรไฟล์</span>
                    <ArrowRight size={18} />
                </button>

                <div className="mt-5 flex items-center justify-center gap-2 text-xs text-slate-300 font-medium">
                    <ShieldCheck size={14} className="text-emerald-300 shrink-0" />
                    <span>กำลังพาคุณไปหน้าโปรไฟล์อัตโนมัติใน {secondsLeft} วินาที...</span>
                </div>
            </div>
        </div>
    );
};

export default PaymentSuccess;
