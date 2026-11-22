import React from 'react';
import { useNavigate } from 'react-router-dom';
import { XCircle, RotateCcw, LayoutDashboard, ShieldCheck } from 'lucide-react';
import BrandLogo from '../components/common/BrandLogo';

const PaymentCancel = () => {
    const navigate = useNavigate();

    return (
        <div
            className="-mt-20 pt-24 pb-12 min-h-screen bg-[radial-gradient(circle_at_top,#4c1d95_0%,#240b52_48%,#0f0724_100%)] text-white flex flex-col items-center justify-center p-4 relative overflow-x-hidden"
            style={{ fontFamily: "'Sarabun', 'Nunito', sans-serif" }}
        >
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-24 left-1/4 w-96 h-96 rounded-full bg-rose-500/18 blur-[120px]" />
                <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full bg-indigo-500/20 blur-[120px]" />
            </div>

            <div className="relative z-10 bg-white/10 backdrop-blur-2xl rounded-3xl shadow-[0_24px_64px_rgba(8,3,28,0.65)] border border-white/18 p-6 sm:p-9 max-w-md w-full text-center">
                <div className="flex justify-center mb-6">
                    <BrandLogo variant="dark" size="sm" />
                </div>

                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-rose-500 to-orange-500 p-[1px] mx-auto mb-6 shadow-[0_0_32px_rgba(244,63,94,0.4)]">
                    <div className="w-full h-full rounded-[23px] bg-slate-950/35 backdrop-blur-md flex items-center justify-center text-rose-200">
                        <XCircle className="w-10 h-10" />
                    </div>
                </div>

                <h1
                    className="text-2xl sm:text-3xl font-black text-white mb-2.5"
                    style={{ fontFamily: "'Nunito', 'Sarabun', sans-serif" }}
                >
                    Payment Cancelled
                </h1>
                <p className="text-sm sm:text-base text-slate-200 leading-relaxed mb-7">
                    การทำรายการชำระเงินถูกยกเลิกแล้ว โดยไม่มีการเรียกเก็บเงินจากบัญชีของคุณแต่อย่างใด
                </p>

                <div className="space-y-3">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="w-full py-3.5 px-6 bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-600 hover:brightness-110 text-white font-extrabold rounded-2xl shadow-[0_12px_28px_-6px_rgba(99,102,241,0.5)] transition-all inline-flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                    >
                        <RotateCcw size={18} />
                        <span>ลองใหม่อีกครั้ง</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/dashboard')}
                        className="w-full py-3.5 px-6 bg-white/10 hover:bg-white/18 border border-white/18 text-slate-100 font-bold rounded-2xl transition-all inline-flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                    >
                        <LayoutDashboard size={18} />
                        <span>กลับหน้าแดชบอร์ด</span>
                    </button>
                </div>

                <div className="mt-5 flex items-center justify-center gap-2 text-xs text-slate-300 font-medium">
                    <ShieldCheck size={14} className="text-emerald-300 shrink-0" />
                    <span>ไม่มีการหักค่าใช้จ่ายจากรายการนี้</span>
                </div>
            </div>
        </div>
    );
};

export default PaymentCancel;
