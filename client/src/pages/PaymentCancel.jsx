import React from 'react';
import { useNavigate } from 'react-router-dom';
import { XCircle } from 'lucide-react';
import Navbar from '../components/Navbar';

const PaymentCancel = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />
            <div className="flex-1 flex flex-col items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <XCircle className="w-10 h-10 text-red-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Cancelled</h1>
                    <p className="text-gray-600 mb-8">
                        The payment process was cancelled. No charges have been made.
                    </p>
                    <div className="space-y-3">
                        <button
                            onClick={() => navigate(-1)}
                            className="w-full py-3 bg-primary text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 transition"
                        >
                            Try Again
                        </button>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="w-full py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition"
                        >
                            Back to Dashboard
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentCancel;
