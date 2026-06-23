import React, { useState, useEffect } from 'react';
import { Check, Star, Shield, Zap, X } from 'lucide-react';
import api from '../services/api';
import paymentService from '../services/paymentService'; // Import payment service
import SlipUploadModal from '../components/payment/SlipUploadModal';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../assets/css/pricing.css'; // Import the new CSS

const PricingPage = () => {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPlan, setSelectedPlan] = useState(null); // Plan object
    const [transaction, setTransaction] = useState(null); // Created transaction
    const [showUploadModal, setShowUploadModal] = useState(false);
    const { user } = useAuth();
    const navigate = useNavigate();

    // Prevent non-admins from viewing the pricing page for now
    if (!user || user.role !== 'admin') {
        return <Navigate to="/" replace />;
    }

    useEffect(() => {
        fetchPlans();
    }, []);

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

    const handleSelectPlan = (plan) => {
        setSelectedPlan(plan);
        createTransaction(plan.id);
    };

    const createTransaction = async (planId) => {
        try {
            const res = await api.post('/payments/checkout', {
                plan_id: planId,
                payment_method: 'transfer_slip'
            });

            if (res.data.success) {
                setTransaction(res.data.transaction);
            }
        } catch (error) {
            console.error('Checkout error:', error);
            alert('Failed to start transaction. Please try again.');
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-[#f2f2f2] flex items-center justify-center kahoot-bg">
            <div className="text-4xl font-black text-gray-700 animate-pulse uppercase tracking-widest">Loading...</div>
        </div>
    );

    // Payment Flow Step 2: Show Bank Details & Upload
    if (transaction) {
        return (
            <div className="min-h-screen bg-[#f2f2f2] kahoot-bg flex flex-col relative overflow-hidden">
                {/* Background Shapes */}
                <div className="shape shape-triangle" style={{ top: '10%', left: '10%' }}></div>
                <div className="shape shape-circle" style={{ top: '20%', right: '15%' }}></div>
                <div className="shape shape-square" style={{ bottom: '15%', left: '20%' }}></div>
                <div className="shape shape-diamond" style={{ bottom: '25%', right: '10%' }}></div>

                <div className="flex-1 container mx-auto px-4 pt-28 pb-8 max-w-2xl z-10 relative">
                    <div className="bg-white rounded-3xl shadow-2xl p-8 border-b-8 border-gray-300">
                        <h2 className="text-4xl font-black text-center mb-6 text-gray-800 uppercase tracking-wide">Checkout</h2>

                        <div className="bg-[#e5f2ff] p-6 rounded-2xl mb-8 border-4 border-[#b3d9ff]">
                            <h3 className="font-black text-2xl mb-4 text-[#0066cc] uppercase">Bank Transfer</h3>
                            <div className="space-y-3 text-lg text-gray-700 font-bold">
                                <div className="flex justify-between items-center">
                                    <span>Bank:</span>
                                    <span className="bg-[#26890c] text-white px-3 py-1 rounded-lg shadow-sm">K-Bank</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span>Account Name:</span>
                                    <span>PreExam Co., Ltd.</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span>Account Number:</span>
                                    <span className="text-2xl font-black tracking-wider text-gray-800">123-4-56789-0</span>
                                </div>
                                <div className="flex justify-between items-center pt-4 border-t-4 border-[#b3d9ff] mt-2">
                                    <span>Amount to Pay:</span>
                                    <span className="font-black text-4xl text-[#e21b3c]">{transaction.amount} THB</span>
                                </div>
                            </div>
                        </div>

                        <div className="text-center space-y-4">
                            <p className="text-gray-500 font-bold mb-4 text-lg">Please transfer the exact amount and upload your slip.</p>
                            <button
                                onClick={() => setShowUploadModal(true)}
                                className="bg-[#26890c] text-white w-full py-4 rounded-xl font-black text-xl btn-kahoot border-b-4 border-[#1a5c08] hover:bg-[#2eaa10] transition-colors"
                            >
                                UPLOAD SLIP
                            </button>

                            <div className="relative flex py-6 items-center">
                                <div className="flex-grow border-t-4 border-gray-200 rounded"></div>
                                <span className="flex-shrink-0 mx-4 text-gray-400 font-black">OR</span>
                                <div className="flex-grow border-t-4 border-gray-200 rounded"></div>
                            </div>

                            <button
                                onClick={async () => {
                                    try {
                                        const session = await paymentService.createCheckoutSession({
                                            packageId: selectedPlan.id, // Using plan ID as package ID
                                            amount: selectedPlan.price,
                                            type: 'PLAN_PURCHASE', // Assuming this is handled in backend logic or we map it
                                            planId: selectedPlan.id,
                                            metadata: { planId: selectedPlan.id }
                                        });
                                        if (session.url) window.location.href = session.url;
                                    } catch (err) {
                                        console.error(err);
                                        alert('Stripe Error: ' + err.message);
                                    }
                                }}
                                className="bg-[#46178f] text-white w-full py-4 rounded-xl font-black text-xl btn-kahoot border-b-4 border-[#331166] hover:bg-[#5c1ecc] transition-colors"
                            >
                                PAY WITH CARD / PROMPTPAY QR
                            </button>
                            
                            <div className="pt-6">
                                <button
                                    onClick={() => { setTransaction(null); setSelectedPlan(null); }}
                                    className="text-gray-400 hover:text-gray-600 font-black uppercase tracking-wider transition-colors"
                                >
                                    Cancel / Go Back
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <SlipUploadModal
                    isOpen={showUploadModal}
                    onClose={() => setShowUploadModal(false)}
                    transactionId={transaction.id}
                    onSuccess={() => {
                        alert('Slip uploaded! Waiting for admin verification.');
                        navigate('/dashboard'); // Or profile
                    }}
                />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f2f2f2] kahoot-bg flex flex-col relative overflow-hidden font-sans">
            {/* Background Shapes */}
            <div className="shape shape-triangle" style={{ top: '5%', left: '5%' }}></div>
            <div className="shape shape-circle" style={{ top: '15%', right: '10%' }}></div>
            <div className="shape shape-square" style={{ bottom: '10%', left: '15%' }}></div>
            <div className="shape shape-diamond" style={{ bottom: '20%', right: '5%' }}></div>
            <div className="shape shape-circle" style={{ top: '60%', left: '45%', backgroundColor: '#cc66ff', width: '60px', height: '60px' }}></div>

            <div className="flex-1 container mx-auto px-4 pt-28 pb-12 z-10 relative">
                <div className="text-center max-w-4xl mx-auto mb-16">
                    <h1 className="text-5xl md:text-7xl font-black text-gray-800 mb-6 drop-shadow-sm tracking-tight uppercase" style={{ fontFamily: 'Inter, Montserrat, sans-serif' }}>
                        Ready to <span className="text-[#46178f]">Play</span> & <span className="text-[#e21b3c]">Learn?</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-600 font-bold">Pick the plan that works for you and let the fun begin!</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {/* Free Plan */}
                    <div className="bg-white rounded-[2rem] p-8 border-b-8 border-gray-300 shadow-xl flex flex-col transform hover:-translate-y-2 transition-transform duration-300">
                        <div className="mb-4">
                            <h3 className="text-3xl font-black text-[#26890c] uppercase">Free Pass</h3>
                            <p className="text-gray-500 font-bold text-lg">For casual players</p>
                        </div>
                        <div className="text-6xl font-black mb-6 text-gray-800">0 <span className="text-2xl text-gray-500 font-bold">THB</span></div>
                        <ul className="space-y-4 mb-8 flex-1 font-bold text-gray-700 text-lg">
                            <li className="flex items-center"><Check size={28} strokeWidth={3} className="text-[#26890c] mr-3" /> Access Public Exams</li>
                            <li className="flex items-center"><Check size={28} strokeWidth={3} className="text-[#26890c] mr-3" /> Create Basic Rooms</li>
                            <li className="flex items-center"><Check size={28} strokeWidth={3} className="text-[#26890c] mr-3" /> View Basic Stats</li>
                            <li className="flex items-center text-gray-400"><X size={28} strokeWidth={3} className="mr-3" /> Custom Themes</li>
                            <li className="flex items-center text-gray-400"><X size={28} strokeWidth={3} className="mr-3" /> Smart Growth Tools</li>
                        </ul>
                        <button className="w-full py-4 bg-gray-200 text-gray-400 font-black text-2xl rounded-xl btn-kahoot border-gray-300 border-b-4 cursor-not-allowed uppercase">Current Plan</button>
                    </div>

                    {/* Premium Plans */}
                    {plans.map((plan, index) => {
                        const colors = [
                            { bg: 'bg-[#46178f]', text: 'text-[#46178f]', border: 'border-[#331166]', highlight: 'text-yellow-400', hoverBg: 'hover:bg-[#5c1ecc]' },
                            { bg: 'bg-[#1368ce]', text: 'text-[#1368ce]', border: 'border-[#0e4e9a]', highlight: 'text-yellow-400', hoverBg: 'hover:bg-[#1a80fa]' },
                            { bg: 'bg-[#e21b3c]', text: 'text-[#e21b3c]', border: 'border-[#b3152f]', highlight: 'text-yellow-400', hoverBg: 'hover:bg-[#f23555]' },
                        ];
                        const theme = colors[index % colors.length];
                        
                        return (
                            <div key={plan.id} className="relative bg-white rounded-[2rem] p-8 border-b-8 shadow-2xl flex flex-col transform hover:-translate-y-2 transition-transform duration-300" style={{ borderColor: theme.border.replace('border-[', '').replace(']', '') }}>
                                {plan.duration_days > 30 && (
                                    <div className="absolute -top-5 -right-3 bg-[#eb670f] text-white text-md font-black px-4 py-2 rounded-xl border-b-4 border-[#b84c06] shadow-lg transform rotate-6 uppercase">
                                        BEST VALUE!
                                    </div>
                                )}
                                <div className="mb-4">
                                    <h3 className={`text-3xl font-black uppercase flex items-center ${theme.text}`}>
                                        {plan.name} <Star size={28} fill="currentColor" strokeWidth={0} className={`ml-2 ${theme.highlight}`} />
                                    </h3>
                                    <p className="text-gray-500 font-bold text-lg">{plan.duration_days} Days VIP Access</p>
                                </div>
                                <div className="text-6xl font-black mb-2 text-gray-800">{plan.price} <span className="text-2xl text-gray-500 font-bold">THB</span></div>
                                <p className="text-gray-400 text-md font-black mb-8 uppercase tracking-widest">One-time payment</p>

                                <ul className="space-y-4 mb-8 flex-1 font-bold text-gray-700 text-lg">
                                    {(plan.features || []).map((feature, i) => {
                                        const PREDEFINED_FEATURES = {
                                            no_ads: "ปลอดโฆษณา (No Ads)",
                                            custom_lobby_bg: "เปลี่ยนพื้นหลังล๊อบบี้ (Custom Lobby Background)",
                                            custom_card_bg: "เปลี่ยนพื้นหลังการ์ดห้อง (Custom Room Card Background)",
                                            create_rooms: "สร้างห้องได้ (Create Rooms)",
                                            unlock_exam_filters: "ปลดล๊อคฟิลเตอร์ปีและชุดข้อสอบ (Unlock Exam Filters)"
                                        };
                                        const label = PREDEFINED_FEATURES[feature] || feature;
                                        return (
                                            <li key={i} className="flex items-center text-left">
                                                <Check size={28} strokeWidth={3} className={`min-w-[28px] ${theme.text} mr-3`} /> {label}
                                            </li>
                                        );
                                    })}
                                    {(!plan.features || plan.features.length === 0) && (
                                        <li className="flex items-center text-gray-500 italic">No features listed</li>
                                    )}
                                </ul>

                                <button
                                    onClick={() => handleSelectPlan(plan)}
                                    className={`w-full py-4 ${theme.bg} text-white font-black text-2xl rounded-xl btn-kahoot border-b-4 ${theme.border} uppercase transition-colors`}
                                >
                                    GET PREMIUM
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default PricingPage;
