import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import examService from '../services/examService';
import { ChevronLeft } from 'lucide-react';
import ExamResultComponent from '../components/ExamResult';

const ExamResult = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchResult = async () => {
            try {
                const data = await examService.getResultById(id);
                setResult(data.data || data);
            } catch (err) {
                console.error(err);
                setError("Could not load exam details.");
            } finally {
                setLoading(false);
            }
        };
        fetchResult();
    }, [id]);

    if (loading) return <div className="flex justify-center items-center min-h-screen">Loading Result...</div>;

    // Fallback UI or Error
    if (error || !result) return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <button onClick={() => navigate(-1)} className="flex items-center text-gray-500 hover:text-gray-900 mb-4">
                <ChevronLeft /> Back
            </button>
            <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg text-center">
                <h2 className="text-xl font-bold mb-2">Exam Result Not Found</h2>
                <p className="text-gray-500 mb-4">{error || "The requested exam result does not exist."}</p>
                <div className="p-4 bg-yellow-50 text-yellow-800 rounded-lg inline-block">
                    Note: Since this is mock data, only valid database IDs work.
                </div>
            </div>
        </div>
    );

    return <ExamResultComponent result={result} onRetry={() => navigate('/exam')} />;
};

export default ExamResult;
