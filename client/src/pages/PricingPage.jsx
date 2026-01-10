import React, { useState, useEffect } from 'react';
import { Check, Star, Shield, Zap } from 'lucide-react';
import api from '../services/api';
import paymentService from '../services/paymentService'; // Import payment service
import Navbar from '../components/Navbar';
import SlipUploadModal from '../components/payment/SlipUploadModal';
import { useNavigate } from 'react-router-dom';

const PricingPage = () => {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPlan, setSelectedPlan] = useState(null); // Plan object
    const [transaction, setTransaction] = useState(null); // Created transaction
    const [showUploadModal, setShowUploadModal] = useState(false);
    const navigate = useNavigate();

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
            // Default to 'transfer_slip' for now
            // But we can now switch to Stripe if plan name matches or we add a toggle
            // For this specific 'Premium' flow with 59/590, let's assume we want Stripe for convenience
            // BUT allow fallback to slip.

            // For now, let's try Stripe first if user wants.
            // Let's modify handleSelectPlan to ask or just default to showing both options.
            // Simplified: Just use the existing logic to set Plan, then in the UI below, offer choice.

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

    if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;

    // Payment Flow Step 2: Show Bank Details & Upload
    if (transaction) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <Navbar />
                <div className="flex-1 container mx-auto px-4 py-8 max-w-2xl">
                    <div className="bg-white rounded-2xl shadow-xl p-8">
                        <h2 className="text-2xl font-bold text-center mb-6">Complete Your Payment</h2>

                        <div className="bg-blue-50 p-6 rounded-xl mb-6">
                            <h3 className="font-bold text-lg mb-4 text-blue-900">Bank Transfer Details</h3>
                            <div className="space-y-2 text-blue-800">
                                <div className="flex justify-between">
                                    <span>Bank:</span>
                                    <span className="font-bold">Kasikorn Bank (K-Bank)</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Account Name:</span>
                                    <span className="font-bold">PreExam Co., Ltd.</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Account Number:</span>
                                    <span className="font-bold text-xl">123-4-56789-0</span>
                                </div>
                                <div className="flex justify-between pt-2 border-t border-blue-200 mt-2">
                                    <span>Amount to Pay:</span>
                                    <span className="font-bold text-2xl text-primary">{transaction.amount} THB</span>
                                </div>
                            </div>
                        </div>

                        <div className="text-center space-y-4">
                            <p className="text-gray-600">Please transfer the exact amount and upload your slip.</p>
                            <button
                                onClick={() => setShowUploadModal(true)}
                                className="bg-primary text-white w-full py-3 rounded-xl font-bold text-lg shadow-lg hover:bg-blue-700 transition-transform transform hover:scale-105"
                            >
                                Upload Payment Slip
                            </button>

                            <div className="relative flex py-5 items-center">
                                <div className="flex-grow border-t border-gray-200"></div>
                                <span className="flex-shrink-0 mx-4 text-gray-400">OR</span>
                                <div className="flex-grow border-t border-gray-200"></div>
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
                                className="bg-indigo-600 text-white w-full py-3 rounded-xl font-bold text-lg shadow-lg hover:bg-indigo-700 transition-transform transform hover:scale-105"
                            >
                                Pay with Credit Card / QR Code (Auto)
                            </button>
                            <button
                                onClick={() => { setTransaction(null); setSelectedPlan(null); }}
                                className="text-gray-400 hover:text-gray-600 font-medium"
                            >
                                Cancel / Change Plan
                            </button>
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
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />
            <div className="flex-1 container mx-auto px-4 py-12">
                <div className="text-center max-w-3xl mx-auto mb-12">
                    <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Upgrade to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Premium</span></h1>
                    <p className="text-lg text-gray-600">Unlock your full potential with exclusive features, unlimited customization, and smart growth tools.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {/* Free Plan */}
                    <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100 flex flex-col">
                        <div className="mb-4">
                            <h3 className="text-xl font-bold text-gray-900">Member</h3>
                            <p className="text-gray-500">For casual learners</p>
                        </div>
                        <div className="text-3xl font-bold mb-6">Free</div>
                        <ul className="space-y-3 mb-8 flex-1">
                            <li className="flex items-center text-gray-600"><Check size={18} className="text-green-500 mr-2" /> Access Public Exams</li>
                            <li className="flex items-center text-gray-600"><Check size={18} className="text-green-500 mr-2" /> Create Basic Rooms</li>
                            <li className="flex items-center text-gray-600"><Check size={18} className="text-green-500 mr-2" /> View Basic Stats</li>
                            <li className="flex items-center text-gray-400"><X size={18} className="mr-2" /> Custom Themes</li>
                            <li className="flex items-center text-gray-400"><X size={18} className="mr-2" /> Smart Growth Tools</li>
                        </ul>
                        <button className="w-full py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200">Current Plan</button>
                    </div>

                    {/* Premium Plans */}
                    {plans.map((plan) => (
                        <div key={plan.id} className="relative bg-white rounded-2xl shadow-xl p-8 border-2 border-primary transform hover:-translate-y-2 transition-all flex flex-col">
                            {plan.duration_days > 30 && (
                                <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-xl">
                                    BEST VALUE
                                </div>
                            )}
                            <div className="mb-4">
                                <h3 className="text-xl font-bold text-primary flex items-center">
                                    {plan.name} <Star size={16} fill="currentColor" className="ml-2" />
                                </h3>
                                <p className="text-gray-500">{plan.duration_days} Days Access</p>
                            </div>
                            <div className="text-4xl font-bold mb-2">{plan.price} <span className="text-lg text-gray-400 font-normal">THB</span></div>
                            <p className="text-gray-400 text-sm mb-6">Billed once</p>

                            <ul className="space-y-3 mb-8 flex-1">
                                <li className="flex items-center text-gray-700 font-medium"><Check size={18} className="text-primary mr-2" /> All Free Features</li>
                                <li className="flex items-center text-gray-700 font-medium"><Zap size={18} className="text-primary mr-2" /> Unlimited Custom Themes</li>
                                <li className="flex items-center text-gray-700 font-medium"><Shield size={18} className="text-primary mr-2" /> Ad-Free Experience</li>
                                <li className="flex items-center text-gray-700 font-medium"><Star size={18} className="text-primary mr-2" /> Mistake Review Notebook</li>
                            </ul>

                            <button
                                onClick={() => handleSelectPlan(plan)}
                                className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-purple-700 transition-all"
                            >
                                Get Premium
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PricingPage;
