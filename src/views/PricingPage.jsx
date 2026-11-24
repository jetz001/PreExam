import React, { useState, useEffect } from 'react';
import { Check, Star, Shield, Zap, X, Sparkles, Crown, ArrowRight, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import api from '../services/api';
import paymentService from '../services/paymentService';
import SlipUploadModal from '../components/payment/SlipUploadModal';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { isPremiumUser } from '../utils/userAccess';
import '../assets/css/pricing.css';

const PREDEFINED_FEATURES = {
  no_ads: 'ปลอดโฆษณา (No Ads)',
  custom_lobby_bg: 'เปลี่ยนพื้นหลังล๊อบบี้ (Custom Lobby Background)',
  custom_card_bg: 'เปลี่ยนพื้นหลังการ์ดห้อง (Custom Room Card Background)',
  create_rooms: 'สร้างห้องได้ (Create Rooms)',
  unlock_exam_filters: 'ปลดล๊อคฟิลเตอร์ปีและชุดข้อสอบ (Unlock Exam Filters)',
};

const PricingPage = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [transaction, setTransaction] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [checkoutPlanId, setCheckoutPlanId] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, refreshUser, updateUser } = useAuth();
  const navigate = useNavigate();
  const userIsPremium = isPremiumUser(user);

  useEffect(() => {
    fetchPlans();
  }, []);

  useEffect(() => {
    const isSuccess = searchParams.get('success') === 'true';
    const isCanceled = searchParams.get('canceled') === 'true';
    const sessionId = searchParams.get('session_id');

    if (!isSuccess && !isCanceled) return undefined;

    let cancelled = false;

    if (isCanceled) {
      setPaymentStatus({
        state: 'canceled',
        message: 'คุณได้ยกเลิกการชำระเงิน สามารถเลือกแพ็กเกจใหม่ได้ทุกเมื่อ',
      });
      toast('ยกเลิกการชำระเงินแล้ว');
      setSearchParams({}, { replace: true });
      return undefined;
    }

    const confirmPayment = async () => {
      setPaymentStatus({
        state: 'verifying',
        message: 'กำลังตรวจสอบการชำระเงินและอัปเกรดบัญชีเป็น Premium...',
      });

      try {
        if (sessionId) {
          const res = await paymentService.verifyCheckoutSession(sessionId);
          if (cancelled) return;
          if (res?.paid && res?.user) {
            updateUser(res.user);
            setPaymentStatus({
              state: 'success',
              message: 'ชำระเงินสำเร็จ! บัญชีของคุณได้รับการอัปเกรดเป็น Premium เรียบร้อยแล้ว',
            });
            toast.success('อัปเกรดเป็น Premium สำเร็จ!');
            setSearchParams({}, { replace: true });
            return;
          }
        }

        for (let attempt = 0; attempt < 4; attempt += 1) {
          if (cancelled) return;
          const fresh = await refreshUser?.();
          if (cancelled) return;
          if (isPremiumUser(fresh)) {
            setPaymentStatus({
              state: 'success',
              message: 'ชำระเงินสำเร็จ! บัญชีของคุณได้รับการอัปเกรดเป็น Premium เรียบร้อยแล้ว',
            });
            toast.success('อัปเกรดเป็น Premium สำเร็จ!');
            setSearchParams({}, { replace: true });
            return;
          }
          if (attempt < 3) {
            await new Promise((resolve) => setTimeout(resolve, 2000));
          }
        }

        if (!cancelled) {
          setPaymentStatus({
            state: 'pending',
            message: 'ระบบได้รับคำขอชำระเงินแล้ว กำลังรอการยืนยันจากธนาคาร กรุณารีเฟรชหน้านี้ในอีกสักครู่',
          });
          setSearchParams({}, { replace: true });
        }
      } catch (err) {
        console.error('Failed to verify checkout session:', err);
        if (!cancelled) {
          const fresh = await refreshUser?.();
          if (isPremiumUser(fresh)) {
            setPaymentStatus({
              state: 'success',
              message: 'ชำระเงินสำเร็จ! บัญชีของคุณได้รับการอัปเกรดเป็น Premium เรียบร้อยแล้ว',
            });
            toast.success('อัปเกรดเป็น Premium สำเร็จ!');
          } else {
            setPaymentStatus({
              state: 'pending',
              message: 'กำลังตรวจสอบสถานะการชำระเงิน กรุณารอสักครู่แล้วรีเฟรชหน้านี้',
            });
          }
          setSearchParams({}, { replace: true });
        }
      }
    };

    confirmPayment();
    return () => {
      cancelled = true;
    };
  }, [searchParams, setSearchParams, refreshUser, updateUser]);

  const fetchPlans = async () => {
    try {
      const res = await api.get('/payments/plans');
      if (res.data.success) {
        setPlans(res.data.plans);
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = async (plan) => {
    try {
      setSelectedPlan(plan);
      setCheckoutPlanId(plan.id);
      const session = await paymentService.createCheckoutSession({
        packageId: plan.id,
        amount: plan.price,
        type: 'PLAN_PURCHASE',
        planId: plan.id,
        metadata: { planId: plan.id },
      });
      if (session.url) window.location.href = session.url;
    } catch (err) {
      console.error(err);
      const errorMsg = err.response?.data?.message || err.message;
      alert('Stripe Error: ' + errorMsg);
      setCheckoutPlanId(null);
    }
  };

  if (loading) {
    return (
      <div
        className="min-h-screen bg-[#f2f2f2] flex items-center justify-center kahoot-bg"
        style={{ fontFamily: "'Nunito', 'Sarabun', sans-serif" }}
      >
        <div className="inline-flex items-center gap-3 rounded-2xl border border-slate-200 bg-white/80 px-6 py-4 backdrop-blur-md shadow-lg">
          <Sparkles size={24} className="text-[#46178f] animate-spin" />
          <span className="text-xl font-black text-slate-700 tracking-wider uppercase">
            กำลังโหลดแพ็กเกจ...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-[#f2f2f2] kahoot-bg flex flex-col relative overflow-hidden"
      style={{ fontFamily: "'Sarabun', 'Nunito', sans-serif" }}
    >
      {/* Background Shapes */}
      <div className="shape shape-triangle" style={{ top: '5%', left: '5%' }} aria-hidden="true" />
      <div className="shape shape-circle" style={{ top: '15%', right: '10%' }} aria-hidden="true" />
      <div className="shape shape-square" style={{ bottom: '10%', left: '15%' }} aria-hidden="true" />
      <div className="shape shape-diamond" style={{ bottom: '20%', right: '5%' }} aria-hidden="true" />
      <div
        className="shape shape-circle"
        style={{ top: '60%', left: '45%', backgroundColor: '#cc66ff', width: '60px', height: '60px' }}
        aria-hidden="true"
      />

      <div className="flex-1 container mx-auto px-4 pt-28 pb-16 z-10 relative">
        <div className="text-center max-w-4xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-white/90 px-4 py-1.5 text-xs font-black uppercase tracking-wider text-[#46178f] shadow-sm backdrop-blur-md mb-5">
            <Crown size={15} className="text-amber-500" />
            <span>PreExam Pro &amp; VIP Passes</span>
          </div>

          <h1
            className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 mb-5 drop-shadow-xs tracking-tight leading-tight"
            style={{ fontFamily: "'Nunito', 'Sarabun', sans-serif" }}
          >
            Ready to <span className="text-[#46178f]">Play</span> &amp;{' '}
            <span className="text-[#e21b3c]">Learn?</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-600 font-bold max-w-2xl mx-auto">
            เลือกแพ็กเกจที่เหมาะกับเป้าหมายการสอบของคุณ แล้วปลดล็อกฟีเจอร์พิเศษได้ทันที
          </p>
          {userIsPremium && (
            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-sm font-bold text-emerald-700 shadow-sm">
              <Crown size={15} className="text-amber-500" />
              <span>
                คุณเป็นสมาชิก Premium อยู่แล้ว
                {user?.premium_expiry
                  ? ` (ใช้ได้ถึง ${new Date(user.premium_expiry).toLocaleDateString('th-TH')})`
                  : ''}
              </span>
            </div>
          )}
        </div>

        {paymentStatus && (
          <div
            role="status"
            className={`max-w-4xl mx-auto mb-8 rounded-2xl border p-4 sm:p-5 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 backdrop-blur-md ${
              paymentStatus.state === 'success'
                ? 'bg-emerald-50/95 border-emerald-200 text-emerald-900'
                : paymentStatus.state === 'canceled'
                ? 'bg-amber-50/95 border-amber-200 text-amber-900'
                : 'bg-indigo-50/95 border-indigo-200 text-indigo-900'
            }`}
          >
            <div className="flex items-center gap-3 font-bold text-sm sm:text-base">
              {paymentStatus.state === 'verifying' ? (
                <Loader2 size={20} className="animate-spin text-indigo-600 shrink-0" />
              ) : paymentStatus.state === 'success' ? (
                <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle size={20} className="text-amber-600 shrink-0" />
              )}
              <span>{paymentStatus.message}</span>
            </div>
            {paymentStatus.state === 'success' && (
              <button
                type="button"
                onClick={() => navigate('/profile')}
                className="shrink-0 inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 py-2 text-xs sm:text-sm font-black text-white transition-colors"
              >
                <span>ไปที่โปรไฟล์</span>
                <ArrowRight size={15} />
              </button>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-7 max-w-6xl mx-auto items-stretch">
          {/* Free Plan */}
          <div className="bg-white/95 backdrop-blur-md rounded-[2rem] p-7 sm:p-8 border border-slate-200/80 border-b-8 border-b-slate-300 shadow-xl flex flex-col transform hover:-translate-y-1.5 transition-all duration-300">
            <div className="mb-4 flex items-start justify-between gap-2">
              <div>
                <h2
                  className="text-2xl sm:text-3xl font-black text-[#15803d] uppercase"
                  style={{ fontFamily: "'Nunito', 'Sarabun', sans-serif" }}
                >
                  Free Pass
                </h2>
                <p className="text-slate-500 font-bold text-base mt-1">สำหรับผู้เริ่มต้นซ้อมสอบ</p>
              </div>
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-[#15803d] border border-emerald-200">
                <Shield size={20} />
              </span>
            </div>

            <div
              className="text-5xl font-black mb-6 text-slate-900 tabular-nums"
              style={{ fontFamily: "'Nunito', 'Sarabun', sans-serif" }}
            >
              0 <span className="text-xl text-slate-500 font-bold">THB</span>
            </div>

            <ul className="space-y-3.5 mb-8 flex-1 font-bold text-slate-700 text-base">
              <li className="flex items-center gap-3">
                <Check size={22} strokeWidth={3} className="text-[#15803d] shrink-0" />
                <span>เข้าถึงข้อสอบสาธารณะได้ทั้งหมด</span>
              </li>
              <li className="flex items-center gap-3">
                <Check size={22} strokeWidth={3} className="text-[#15803d] shrink-0" />
                <span>สร้างห้องสอบพื้นฐาน</span>
              </li>
              <li className="flex items-center gap-3">
                <Check size={22} strokeWidth={3} className="text-[#15803d] shrink-0" />
                <span>ดูสถิติพื้นฐานและประวัติการทำข้อสอบ</span>
              </li>
              <li className="flex items-center gap-3 text-slate-500">
                <X size={22} strokeWidth={2.5} className="text-slate-400 shrink-0" />
                <span>ปรับแต่งธีมและพื้นหลังห้อง</span>
              </li>
              <li className="flex items-center gap-3 text-slate-500">
                <X size={22} strokeWidth={2.5} className="text-slate-400 shrink-0" />
                <span>เครื่องมือวิเคราะห์เชิงลึก (Smart Tools)</span>
              </li>
            </ul>

            <button
              type="button"
              disabled
              className="w-full py-3.5 bg-slate-100 text-slate-500 font-black text-lg rounded-xl btn-kahoot border border-slate-200 border-b-4 border-b-slate-300 cursor-not-allowed uppercase"
              style={{ fontFamily: "'Nunito', 'Sarabun', sans-serif" }}
            >
              {userIsPremium ? 'Free Tier' : 'Current Plan'}
            </button>
          </div>

          {/* Premium Plans */}
          {plans.map((plan, index) => {
            const colors = [
              {
                bg: 'bg-[#46178f]',
                text: 'text-[#46178f]',
                badgeBg: 'bg-purple-50 border-purple-200',
                borderBottom: '#331166',
                hoverBg: 'hover:bg-[#5c1ecc]',
              },
              {
                bg: 'bg-[#1368ce]',
                text: 'text-[#1368ce]',
                badgeBg: 'bg-blue-50 border-blue-200',
                borderBottom: '#0e4e9a',
                hoverBg: 'hover:bg-[#1a7ae8]',
              },
              {
                bg: 'bg-[#e21b3c]',
                text: 'text-[#e21b3c]',
                badgeBg: 'bg-rose-50 border-rose-200',
                borderBottom: '#b3152f',
                hoverBg: 'hover:bg-[#f03050]',
              },
            ];
            const theme = colors[index % colors.length];
            const isSubmitting = checkoutPlanId === plan.id;

            return (
              <div
                key={plan.id}
                className="relative bg-white/95 backdrop-blur-md rounded-[2rem] p-7 sm:p-8 border border-slate-200/80 border-b-8 shadow-2xl flex flex-col transform hover:-translate-y-1.5 transition-all duration-300"
                style={{ borderBottomColor: theme.borderBottom }}
              >
                {plan.duration_days > 30 && (
                  <div className="absolute -top-4 right-4 inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-black px-3.5 py-1.5 rounded-full border-b-2 border-orange-700 shadow-lg uppercase tracking-wide">
                    <Zap size={13} fill="currentColor" />
                    <span>Best Value</span>
                  </div>
                )}

                <div className="mb-4 flex items-start justify-between gap-2">
                  <div>
                    <h2
                      className={`text-2xl sm:text-3xl font-black uppercase flex items-center gap-2 ${theme.text}`}
                      style={{ fontFamily: "'Nunito', 'Sarabun', sans-serif" }}
                    >
                      <span>{plan.name}</span>
                    </h2>
                    <p className="text-slate-500 font-bold text-base mt-1">
                      {plan.duration_days} Days VIP Access
                    </p>
                  </div>
                  <span
                    className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border ${theme.badgeBg} ${theme.text}`}
                  >
                    <Star size={20} fill="currentColor" />
                  </span>
                </div>

                <div
                  className="text-5xl font-black mb-1 text-slate-900 tabular-nums"
                  style={{ fontFamily: "'Nunito', 'Sarabun', sans-serif" }}
                >
                  {plan.price} <span className="text-xl text-slate-500 font-bold">THB</span>
                </div>
                <p className="text-slate-500 text-xs font-extrabold mb-7 uppercase tracking-widest">
                  ชำระครั้งเดียว · ไม่ต่ออายุอัตโนมัติ
                </p>

                <ul className="space-y-3.5 mb-8 flex-1 font-bold text-slate-700 text-base">
                  {(plan.features || []).map((feature, i) => {
                    const label = PREDEFINED_FEATURES[feature] || feature;
                    return (
                      <li key={i} className="flex items-start gap-3 text-left">
                        <Check size={22} strokeWidth={3} className={`shrink-0 mt-0.5 ${theme.text}`} />
                        <span>{label}</span>
                      </li>
                    );
                  })}
                  {(!plan.features || plan.features.length === 0) && (
                    <li className="flex items-center text-slate-500 italic">ไม่มีรายการฟีเจอร์ระบุ</li>
                  )}
                </ul>

                <button
                  type="button"
                  onClick={() => handleSelectPlan(plan)}
                  disabled={isSubmitting}
                  className={`w-full py-3.5 ${theme.bg} ${theme.hoverBg} text-white font-black text-lg rounded-xl btn-kahoot border-b-4 uppercase transition-all flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-purple-400/50 disabled:opacity-70`}
                  style={{
                    borderBottomColor: theme.borderBottom,
                    fontFamily: "'Nunito', 'Sarabun', sans-serif",
                  }}
                >
                  <span>{isSubmitting ? 'กำลังเปิดหน้าชำระเงิน...' : userIsPremium ? 'ต่ออายุ Premium' : 'Get Premium'}</span>
                  {!isSubmitting && <ArrowRight size={19} />}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {showUploadModal && (
        <SlipUploadModal
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          transactionId={transaction?.id}
          onSuccess={() => {
            setShowUploadModal(false);
            navigate('/profile/billing-history');
          }}
        />
      )}
    </div>
  );
};

export default PricingPage;
