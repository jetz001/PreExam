import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ShieldAlert, ExternalLink, ArrowLeft } from 'lucide-react';

const SafetyInterstitial = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(location.search);
    const targetUrl = queryParams.get('target');

    if (!targetUrl) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center p-8">
                    <h1 className="text-xl font-bold text-gray-800">Invalid Link</h1>
                    <button onClick={() => navigate(-1)} className="mt-4 text-indigo-600 hover:underline">Go Back</button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
            <div className="bg-white max-w-lg w-full rounded-2xl shadow-xl p-8 border border-gray-100 text-center">
                <div className="w-20 h-20 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <ShieldAlert size={48} className="text-yellow-500" />
                </div>

                <h1 className="text-2xl font-bold text-gray-900 mb-2">You are leaving PreExam</h1>
                <p className="text-gray-600 mb-6">
                    Links can be risky. Always check the URL before entering your password or personal information on external sites.
                </p>

                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 mb-8 break-all font-mono text-sm text-gray-600">
                    {targetUrl}
                </div>

                <div className="space-y-3">
                    <a
                        href={targetUrl}
                        rel="noopener noreferrer" // IMPORTANT: No target="_blank" here usually, we want to navigate away OR open in new tab? 
                        // If we used a linker that opened this in a new tab, then this "Continue" should likely just replace location or open new.
                        // Standard: This page is the "tab". Clicking continue goes to the site.
                        className="block w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                        <ExternalLink size={18} /> Continue to Site
                    </a>

                    <button
                        onClick={() => navigate(-1)}
                        className="block w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                        <ArrowLeft size={18} /> Go Back
                    </button>
                </div>

                <div className="mt-6 text-xs text-gray-400">
                    PreExam is not responsible for the content of external websites.
                </div>
            </div>
        </div>
    );
};

export default SafetyInterstitial;
