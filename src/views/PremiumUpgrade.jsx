import React, { useState, useEffect } from 'react';
import paymentService from '../services/paymentService';
import { useNavigate } from 'react-router-dom';
import {
    CreditCard,
    CheckCircle2,
    AlertCircle,
    Loader2,
    Crown,
    Sparkles,
    ShieldCheck,
    Zap,
    ArrowLeft,
} from 'lucide-react';
import toast from 'react-hot-toast';
import BrandLogo from '../components/common/BrandLogo';

const PremiumUpgrade = () => {
    const [qrCode, setQrCode] = useState('');
    const [amount, setAmount] = useState(0);
    const [plans, setPlans] = useState([]);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [bankDetails, setBankDetails] = useState(null);
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [plansLoading, setPlansLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setPlansLoading(true);
        setErrorMessage('');
        try {
            const plansRes = await paymentService.getPlans();
            const availablePlans = plansRes.plans || [];
            setPlans(availablePlans);

            const premium = availablePlans.find((p) => p.price > 0) || availablePlans[0];
            setSelectedPlan(premium || null);
            if (premium) setAmount(premium.price);

            const qrRes = await paymentService.getQRCode(premium ? premium.price : 0);
            setQrCode(qrRes.qrCode);
            if (qrRes.bankDetails) setBankDetails(qrRes.bankDetails);
        } catch (error) {
            console.error('Error loading data:', error);
            setErrorMessage('ไม่สามารถโหลดข้อมูลแพ็กเกจได้ในขณะนี้');
        } finally {
            setPlansLoading(false);
        }
    };

    const handlePlanSelect = async (plan) => {
        setSelectedPlan(plan);
        setAmount(plan.price);
        setErrorMessage('');
        try {
            const qrRes = await paymentService.getQRCode(plan.price);
            setQrCode(qrRes.qrCode);
            if (qrRes.bankDetails) setBankDetails(qrRes.bankDetails);
        } catch (error) {
            console.error('Failed to update QR', error);
        }
    };

    const handleFileChange = (e) => {
        setFile(e.target.files?.[0] || null);
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) {
            toast.error('กรุณาเลือกรูปสลิปการโอนเงิน');
            return;
        }
        if (!selectedPlan) {
            toast.error('กรุณาเลือกแพ็กเกจที่ต้องการ');
            return;
        }

        setUploading(true);
        try {
            const txRes = await paymentService.createTransaction({
                plan_id: selectedPlan.id,
                payment_method: 'promptpay',
            });

            if (!txRes.success) throw new Error('Failed to create transaction');
            const transactionId = txRes.transaction.id;

            const formData = new FormData();
            formData.append('slip', file);
            formData.append('transaction_id', transactionId);

            await paymentService.uploadSlip(formData);

            toast.success('อัปโหลดสลิปเรียบร้อยแล้ว โปรดรอการตรวจสอบ');
            navigate('/profile');
        } catch (error) {
            console.error('Payment failed:', error);
            setErrorMessage('ไม่สามารถดำเนินการชำระเงินได้ โปรดลองใหม่อีกครั้ง');
        } finally {
            setUploading(false);
        }
    };

    const handleStripeCheckout = async () => {
        if (!selectedPlan) return;
        setErrorMessage('');
        try {
            setMessage('กำลังเชื่อมต่อไปยังหน้าชำระเงิน...');
            const session = await paymentService.createCheckoutSession({
                type: 'PLAN_PURCHASE',
                amount: selectedPlan.price,
                planId: selectedPlan.id,
                metadata: { planId: selectedPlan.id },
            });
            if (session.url) {
                window.location.href = session.url;
            } else {
                setMessage('');
            }
        } catch (err) {
            console.error(err);
            const errMsg = err.response?.data?.error || err.message || 'ไม่สามารถเริ่มต้นการชำระเงินได้';
            setErrorMessage(errMsg);
            toast.error(errMsg);
            setMessage('');
        }
    };

    return (
        <div
            className="-mt-20 pt-24 pb-16 min-h-screen bg-[radial-gradient(circle_at_top,#5b21b6_0%,#311068_48%,#0f0724_100%)] text-white relative overflow-x-hidden"
            style={{ fontFamily: "'Sarabun', 'Nunito', sans-serif" }}
        >
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-24 left-1/4 w-96 h-96 rounded-full bg-amber-400/16 blur-[130px]" />
                <div className="absolute top-1/3 -right-24 w-96 h-96 rounded-full bg-indigo-500/20 blur-[130px]" />
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/18 border border-white/18 text-white font-bold text-sm transition-all mb-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                >
                    <ArrowLeft size={16} />
                    <span>ย้อนกลับ</span>
                </button>

                <div className="bg-white/10 backdrop-blur-2xl border border-white/18 shadow-[0_24px_64px_rgba(8,3,28,0.65)] rounded-3xl overflow-hidden">
                    {/* Hero Header */}
                    <div className="px-6 py-7 sm:px-10 bg-gradient-to-r from-indigo-600/80 via-violet-600/80 to-fuchsia-600/75 border-b border-white/15 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-amber-300 to-orange-500 p-[1px] shadow-[0_10px_28px_rgba(245,158,11,0.45)] shrink-0">
                                <div className="w-full h-full rounded-[15px] bg-slate-950/35 flex items-center justify-center text-amber-200">
                                    <Crown size={26} />
                                </div>
                            </div>
                            <div>
                                <div className="inline-flex items-center gap-1.5 text-xs font-extrabold text-amber-200 uppercase tracking-wider mb-1">
                                    <Sparkles size={13} />
                                    <span>PreExam Membership</span>
                                </div>
                                <h1
                                    className="text-2xl sm:text-3xl font-black text-white leading-tight"
                                    style={{ fontFamily: "'Nunito', 'Sarabun', sans-serif" }}
                                >
                                    อัปเกรดเป็น Premium
                                </h1>
                            </div>
                        </div>

                        <div className="self-start sm:self-auto">
                            <BrandLogo variant="glass" size="sm" badge="PRO" />
                        </div>
                    </div>

                    <div className="p-5 sm:p-8 md:p-10 flex flex-col items-center">
                        <p className="text-slate-200 mb-7 text-center max-w-xl text-sm sm:text-base leading-relaxed">
                            เลือกแพ็กเกจเพื่อปลดล็อกฟีเจอร์พรีเมียม ชำระเงินง่ายและปลอดภัยผ่าน PromptPay ผ่าน Stripe อัปเกรดอัตโนมัติทันทีไม่ต้องแจ้งสลิป
                        </p>

                        {errorMessage && (
                            <div
                                role="alert"
                                className="w-full max-w-2xl mb-6 flex items-center gap-3 p-4 rounded-2xl bg-rose-500/20 border border-rose-400/35 text-rose-100 text-sm font-semibold"
                            >
                                <AlertCircle size={18} className="text-rose-300 shrink-0" />
                                <span>{errorMessage}</span>
                            </div>
                        )}

                        {/* Plan Selection */}
                        {plansLoading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8 w-full animate-pulse">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="h-32 rounded-2xl bg-white/10 border border-white/15" />
                                ))}
                            </div>
                        ) : plans.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8 w-full">
                                {plans.map((plan) => {
                                    const isSelected = selectedPlan?.id === plan.id;
                                    return (
                                        <button
                                            key={plan.id}
                                            type="button"
                                            onClick={() => handlePlanSelect(plan)}
                                            aria-pressed={isSelected}
                                            className={`relative p-5 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                                                isSelected
                                                    ? 'bg-gradient-to-br from-indigo-500/30 via-violet-500/25 to-amber-500/20 border-amber-300 shadow-[0_14px_34px_-10px_rgba(251,191,36,0.45)] -translate-y-0.5'
                                                    : 'bg-white/8 border-white/15 hover:bg-white/14 hover:border-white/30'
                                            }`}
                                        >
                                            <div className="flex items-start justify-between gap-2 mb-3">
                                                <div className="font-extrabold text-lg text-white leading-snug">
                                                    {plan.name}
                                                </div>
                                                {isSelected && (
                                                    <CheckCircle2 size={20} className="text-amber-300 shrink-0" />
                                                )}
                                            </div>
                                            <div>
                                                <div className="text-2xl font-black text-amber-200">
                                                    {Number(plan.price || 0).toLocaleString()}{' '}
                                                    <span className="text-xs font-bold text-slate-200 uppercase">THB</span>
                                                </div>
                                                {plan.duration_days && (
                                                    <p className="text-xs text-slate-300 mt-1">
                                                        ระยะเวลา {plan.duration_days} วัน
                                                    </p>
                                                )}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="w-full max-w-md mb-8 p-6 rounded-2xl bg-white/8 border border-white/15 text-center text-slate-300 text-sm">
                                ยังไม่มีแพ็กเกจเปิดให้เลือกในขณะนี้
                            </div>
                        )}

                        {/* Checkout Summary Card */}
                        <div className="w-full max-w-md bg-slate-950/45 border border-white/18 p-6 sm:p-7 rounded-3xl text-center shadow-xl">
                            <div className="mb-6">
                                <p className="text-slate-300 text-xs uppercase tracking-widest font-bold">
                                    ยอดชำระทั้งหมด
                                </p>
                                <p
                                    className="text-4xl sm:text-5xl font-black text-white mt-2"
                                    style={{ fontFamily: "'Nunito', 'Sarabun', sans-serif" }}
                                >
                                    {(amount || 0).toLocaleString()}{' '}
                                    <span className="text-base sm:text-lg text-amber-300 font-extrabold">THB</span>
                                </p>
                                {selectedPlan && (
                                    <div className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-bold text-amber-200">
                                        <Crown size={13} />
                                        <span>{selectedPlan.name}</span>
                                    </div>
                                )}
                            </div>

                            {/* Benefits quick list */}
                            <div className="grid grid-cols-1 gap-2 text-left text-xs sm:text-sm text-slate-200 bg-white/6 border border-white/10 rounded-2xl p-4 mb-6">
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 size={15} className="text-emerald-300 shrink-0" />
                                    <span>เข้าถึงคลังข้อสอบและเฉลยละเอียดครบทุกชุด</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Zap size={15} className="text-amber-300 shrink-0" />
                                    <span>ใช้งานห้องสอบและโหมดฝึกพิเศษได้ไม่จำกัด</span>
                                </div>
                            </div>

                            {/* Stripe Payment Button */}
                            <button
                                type="button"
                                onClick={handleStripeCheckout}
                                disabled={!selectedPlan || Boolean(message)}
                                className={`w-full py-3.5 px-6 text-white font-extrabold rounded-2xl shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                                    !selectedPlan || message
                                        ? 'bg-slate-600/70 cursor-not-allowed opacity-70'
                                        : 'bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-600 hover:brightness-110 shadow-[0_12px_28px_-6px_rgba(99,102,241,0.55)]'
                                }`}
                            >
                                {message ? (
                                    <>
                                        <Loader2 className="animate-spin" size={19} />
                                        <span>{message}</span>
                                    </>
                                ) : (
                                    <>
                                        <CreditCard size={19} />
                                        <span>ชำระเงินทันที</span>
                                    </>
                                )}
                            </button>

                            <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-slate-300 leading-relaxed">
                                <ShieldCheck size={14} className="text-emerald-300 shrink-0" />
                                <span>ชำระเงินปลอดภัยผ่าน Stripe อัปเกรดบัญชีอัตโนมัติทันที</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PremiumUpgrade;
