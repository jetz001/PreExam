import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import Navbar from '../components/Navbar';

const PaymentSuccess = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const sessionId = searchParams.get('session_id');

    useEffect(() => {
        // Optional: Verify session status with backend if needed
        // For now, we trust the redirect and show success
        const timer = setTimeout(() => {
            // Redirect logic based on context (can be improved by passing state or checking user role)
            // For simplicity, go to dashboard
            navigate('/dashboard');
        }, 5000);
        return () => clearTimeout(timer);
    }, [navigate, sessionId]);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />
            <div className="flex-1 flex flex-col items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-10 h-10 text-green-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
                    <p className="text-gray-600 mb-8">
                        Thank you for your purchase. Your transaction has been processed successfully.
                    </p>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="w-full py-3 bg-primary text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 transition"
                    >
                        Return to Dashboard
                    </button>
                    <p className="text-sm text-gray-400 mt-4">Redirecting automatically in 5 seconds...</p>
                </div>
            </div>
        </div>
    );
};

export default PaymentSuccess;
