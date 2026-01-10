import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, XCircle } from 'lucide-react';
import DetailedSolution from './exam/DetailedSolution';
import AdSlot from './ads/AdSlot';

const ExamResult = ({ result, onRetry }) => {
    const percentage = (result.score / result.total_score) * 100;
    const isPassed = percentage >= 60;

    return (
        <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8 text-center">
            <div className={`rounded-full h-24 w-24 flex items-center justify-center mx-auto mb-6 ${isPassed ? 'bg-green-100' : 'bg-red-100'}`}>
                {isPassed ? (
                    <CheckCircle className="h-12 w-12 text-green-600" />
                ) : (
                    <XCircle className="h-12 w-12 text-red-600" />
                )}
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
                {isPassed ? 'ยินดีด้วย! คุณสอบผ่าน' : 'เสียใจด้วย คุณยังไม่ผ่านเกณฑ์'}
            </h2>
            <p className="text-gray-500 mb-8">
                คะแนนของคุณคือ
            </p>
            <div className="text-6xl font-bold text-primary mb-8">
                {result.score} <span className="text-2xl text-gray-400">/ {result.total_score}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
                    <div className="text-sm text-gray-500">เวลาที่ใช้</div>
                    <div className="text-xl font-bold">{Math.floor(result.time_taken / 60)} นาที {result.time_taken % 60} วินาที</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
                    <div className="text-sm text-gray-500">ความแม่นยำ</div>
                    <div className="text-xl font-bold">{percentage.toFixed(1)}%</div>
                </div>
            </div>

            {/* Ad Injection for Single Exam Result */}
            <div className="mb-8">
                <AdSlot placement="result" />
            </div>


            {/* Detailed Solutions (Premium sees more) */}
            {
                result.questions && result.answers && (
                    <div className="mb-8">
                        <DetailedSolution questions={result.questions} answers={result.answers} />
                    </div>
                )
            }

            <div className="flex justify-center space-x-4">
                <button
                    onClick={onRetry}
                    className="px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-blue-700"
                >
                    ทำข้อสอบอีกครั้ง
                </button>
                <Link
                    to="/profile"
                    className="px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                    กลับสู่แดชบอร์ด
                </Link>
            </div>
        </div >
    );
};

export default ExamResult;
