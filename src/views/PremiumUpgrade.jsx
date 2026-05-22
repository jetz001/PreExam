import React, { useState, useEffect } from 'react';
import paymentService from '../services/paymentService'; // Use service
import { useNavigate } from 'react-router-dom';
import { CreditCard, Upload, CheckCircle, AlertCircle, Loader } from 'lucide-react';

const PremiumUpgrade = () => {
    const [qrCode, setQrCode] = useState('');
    const [amount, setAmount] = useState(0);
    const [plans, setPlans] = useState([]);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [bankDetails, setBankDetails] = useState(null);
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            // Fetch Plans
            const plansRes = await paymentService.getPlans();
            const availablePlans = plansRes.plans || [];
            setPlans(availablePlans);

            // Default to the first paid plan or just the first one
            const premium = availablePlans.find(p => p.price > 0) || availablePlans[0];
            setSelectedPlan(premium);
            if (premium) setAmount(premium.price);

            // Fetch Generic QR (Optional, or generate based on plan)
            // For now, let's keep the static QR logic or use the one from checkout?
            // Existing logic uses a static endpoint. Let's keep it for display.
            const qrRes = await paymentService.getQRCode(premium ? premium.price : 0);
            setQrCode(qrRes.qrCode);
            if (qrRes.bankDetails) setBankDetails(qrRes.bankDetails);
        } catch (error) {
            console.error('Error loading data:', error);
            setMessage('Failed to load payment details.');
        }
    };

    const handlePlanSelect = async (plan) => {
        setSelectedPlan(plan);
        setAmount(plan.price);
        try {
            // Re-fetch QR for new amount
            const qrRes = await paymentService.getQRCode(plan.price);
            setQrCode(qrRes.qrCode);
            if (qrRes.bankDetails) setBankDetails(qrRes.bankDetails);
        } catch (error) {
            console.error("Failed to update QR", error);
        }
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) {
            alert('Please select a slip image.');
            return;
        }
        if (!selectedPlan) {
            alert('No plan selected.');
            return;
        }

        setUploading(true);
        try {
            // 1. Create Transaction
            const txRes = await paymentService.createTransaction({
                plan_id: selectedPlan.id,
                payment_method: 'promptpay' // Assuming QR/Transfer
            });

            if (!txRes.success) throw new Error('Failed to create transaction');
            const transactionId = txRes.transaction.id;

            // 2. Upload Slip
            const formData = new FormData();
            formData.append('slip', file);
            formData.append('transaction_id', transactionId);

            await paymentService.uploadSlip(formData);

            alert('Slip uploaded successfully! Please wait for admin approval.');
            navigate('/profile');
        } catch (error) {
            console.error('Payment failed:', error);
            setMessage('Failed to process payment. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="bg-white dark:bg-slate-800 shadow rounded-lg overflow-hidden">
                <div className="px-6 py-4 bg-primary border-b border-gray-200 dark:border-slate-700">
                    <h2 className="text-xl font-bold text-white flex items-center">
                        <CreditCard className="mr-2" /> อัปเกรดเป็น Premium
                    </h2>
                </div>

                <div className="p-8 flex flex-col items-center">
                    <p className="text-gray-600 dark:text-gray-300 mb-8 text-center max-w-lg">
                        เลือกแพ็กเกจเพื่อปลดล็อกฟีเจอร์พรีเมียม ชำระเงินง่ายๆ ผ่านบัตรเครดิตหรือ PromptPay ไม่ต้องแจ้งสลิป
                    </p>

                    {/* Plan Selection */}
                    <div className="flex flex-wrap gap-4 justify-center mb-8 w-full">
                        {plans.map(plan => (
                            <button
                                key={plan.id}
                                onClick={() => handlePlanSelect(plan)}
                                className={`px-6 py-4 rounded-xl border-2 transition-all flex flex-col items-center min-w-[140px] ${selectedPlan?.id === plan.id
                                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-md transform scale-105'
                                    : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                                    }`}
                            >
                                <div className="font-bold text-lg">{plan.name}</div>
                                <div className="text-sm font-medium">{plan.price.toLocaleString()} THB</div>
                            </button>
                        ))}
                    </div>

                    <div className="w-full max-w-md bg-gray-50 dark:bg-slate-700/50 p-6 rounded-2xl text-center">
                        <div className="mb-6">
                            <p className="text-gray-500 dark:text-gray-400 text-sm uppercase tracking-wide font-semibold">ยอดชำระทั้งหมด</p>
                            <p className="text-4xl font-extrabold text-indigo-600 mt-2">{(amount || 0).toLocaleString()} <span className="text-lg text-gray-400 font-medium">THB</span></p>
                            {selectedPlan && <p className="text-sm text-gray-500 mt-1">{selectedPlan.name}</p>}
                        </div>

                        {/* Stripe Payment Button */}
                        <button
                            onClick={async () => {
                                if (!selectedPlan) return;
                                try {
                                    setMessage('Redirecting to payment...');
                                    const session = await paymentService.createCheckoutSession({
                                        type: 'PLAN_PURCHASE',
                                        amount: selectedPlan.price,
                                        planId: selectedPlan.id,
                                        metadata: { planId: selectedPlan.id }
                                    });
                                    if (session.url) window.location.href = session.url;
                                } catch (err) {
                                    console.error(err);
                                    const errorMsg = err.response?.data?.error || err.message || "Payment initialization failed";
                                    alert('Error: ' + errorMsg);
                                    setMessage('');
                                }
                            }}
                            disabled={!selectedPlan}
                            className={`w-full py-4 text-white font-bold rounded-xl shadow-lg transition-all transform active:scale-95 flex items-center justify-center gap-3 ${!selectedPlan ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-500/30'
                                }`}
                        >
                            {message ? (
                                <>
                                    <Loader className="animate-spin" size={20} />
                                    {message}
                                </>
                            ) : (
                                <>
                                    <div className="flex -space-x-1">
                                        <div className="w-3 h-3 rounded-full bg-red-400 border-2 border-indigo-600"></div>
                                        <div className="w-3 h-3 rounded-full bg-yellow-400 border-2 border-indigo-600"></div>
                                        <div className="w-3 h-3 rounded-full bg-green-400 border-2 border-indigo-600"></div>
                                    </div>
                                    ชำระเงินทันที
                                </>
                            )}
                        </button>
                        <p className="mt-4 text-xs text-gray-400">
                            ชำระเงินปลอดภัยผ่าน Stripe บัญชีของคุณจะได้รับการอัปเกรดอัตโนมัติทันที
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PremiumUpgrade;
