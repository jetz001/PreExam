import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import DetailedSolution from './exam/DetailedSolution';
import examService from '../services/examService';

const ExamResultKorPor = ({ result, onRetry, config }) => {
    const { data: metaRes } = useQuery({
        queryKey: ['examSetsMetaResult'],
        queryFn: examService.getExamSetsMeta
    });
    
    const setsMeta = metaRes?.data || [];
    const currentSetMeta = setsMeta.find(s => s.name === config?.exam_set) || {};
    const eduLevel = currentSetMeta.education_level || 'bachelor';

    // Grouping
    const groups = {
        'วิเคราะห์': { title: 'วิชาความสามารถในการคิดวิเคราะห์', maxQuestions: 50, scorePerQ: 2, passPct: eduLevel === 'master' ? 65 : 60, correct: 0, total: 0, questions: [] },
        'ภาษาอังกฤษ': { title: 'วิชาภาษาอังกฤษ', maxQuestions: 25, scorePerQ: 2, passPct: 50, correct: 0, total: 0, questions: [] },
        'กฎหมาย': { title: 'วิชาความรู้และลักษณะการเป็นข้าราชการที่ดี', maxQuestions: 25, scorePerQ: 2, passPct: 60, correct: 0, total: 0, questions: [] }
    };

    const qs = result?.questions || [];
    
    // Fallback classification if catalog is missing
    const classifyQuestion = (q) => {
        let catStr = '';
        if (Array.isArray(q.catalogs) && q.catalogs.length > 0) {
            catStr = q.catalogs.join(' ');
        } else if (typeof q.catalogs === 'string') {
            try {
                const arr = JSON.parse(q.catalogs);
                if (Array.isArray(arr) && arr.length > 0) catStr = arr.join(' ');
            } catch (e) {
                catStr = q.catalogs;
            }
        }
        
        catStr = (catStr + ' ' + (q.subject || '') + ' ' + (q.category || '')).toLowerCase();
        
        const engKeywords = ['อังกฤษ', 'english', 'grammar', 'vocabulary', 'reading', 'conversation', 'reading comprehension'];
        const lawKeywords = ['กฎหมาย', 'ข้าราชการ', 'พระราชบัญญัติ', 'พ.ร.บ', 'พ.ร.ฎ', 'รัฐธรรมนูญ', 'ระเบียบ', 'ละเมิด', 'ปกครอง', 'คุณธรรม', 'จริยธรรม', 'บ้านเมืองที่ดี', 'บริหารราชการ'];
        
        if (engKeywords.some(kw => catStr.includes(kw))) return 'ภาษาอังกฤษ';
        if (lawKeywords.some(kw => catStr.includes(kw))) return 'กฎหมาย';
        return 'วิเคราะห์'; // Default to Analysis for Thai/Math
    };

    qs.forEach(q => {
        const groupKey = classifyQuestion(q);
        if (groups[groupKey]) {
            groups[groupKey].total++;
            groups[groupKey].questions.push(q);
            if (q.is_correct) {
                groups[groupKey].correct++;
            }
        }
    });

    // Compute scores and pass status before rendering
    let overallPass = true;
    Object.keys(groups).forEach(key => {
        const g = groups[key];
        g.score = g.correct * g.scorePerQ;
        // Strictly use the number of actual questions fetched for this group
        g.maxScore = g.total * g.scorePerQ;
        g.pct = g.maxScore > 0 ? (g.score / g.maxScore) * 100 : 0;
        
        // If there are no questions for this group, we assume they pass it so it doesn't fail the whole exam
        g.passed = g.maxScore > 0 ? (g.pct >= g.passPct) : true;
        if (!g.passed) overallPass = false;
    });

    const userAnswers = qs.reduce((acc, curr) => ({...acc, [curr.question_id || curr.id]: curr.user_answer}), {});

    const renderGroup = (key) => {
        const g = groups[key];
        
        return (
            <div key={key} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-4">
                <div className="flex flex-col md:flex-row justify-between md:items-center border-b border-slate-100 pb-4 mb-4">
                    <div>
                        <h3 className="text-lg font-bold text-slate-800">{g.title}</h3>
                        <p className="text-sm text-slate-500">เกณฑ์ผ่าน {g.passPct}%</p>
                    </div>
                    <div className="mt-4 md:mt-0 text-right">
                        <div className="text-3xl font-black text-blue-600">{g.score} / {g.maxScore}</div>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${g.passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {g.passed ? '✅ ผ่านเกณฑ์' : '❌ ไม่ผ่านเกณฑ์'}
                        </span>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-6">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-800 rounded-2xl shadow-xl overflow-hidden mb-8">
                <div className="p-8 text-center text-white">
                    <h1 className="text-3xl font-black mb-2">ผลสอบ ภาค ก. (จำลอง)</h1>
                    <p className="text-blue-100 mb-6">ชุดข้อสอบ: {config?.exam_set || 'ไม่ระบุ'} • ระดับ: {eduLevel === 'master' ? 'ปริญญาโท' : 'ปวช./ปวส./ปริญญาตรี'}</p>
                    
                    <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 inline-block">
                        <div className="text-5xl mb-2">{overallPass ? '🎉' : '💪'}</div>
                        <h2 className="text-2xl font-bold">{overallPass ? 'คุณสอบผ่านเกณฑ์!' : 'พยายามใหม่อีกนิด!'}</h2>
                        <p className="text-sm opacity-80 mt-2">ต้องผ่านเกณฑ์คะแนนทุกวิชาตามที่ ก.พ. กำหนด</p>
                    </div>
                    
                    <div className="mt-8 flex justify-center space-x-4">
                        <button onClick={onRetry} className="px-6 py-3 bg-white text-blue-700 font-bold rounded-xl shadow hover:bg-slate-50 transition-colors">
                            ทำข้อสอบอีกครั้ง
                        </button>
                        <Link to="/" className="px-6 py-3 bg-blue-800 text-white font-bold rounded-xl shadow hover:bg-blue-900 transition-colors border border-blue-500">
                            กลับหน้าแรก
                        </Link>
                    </div>
                </div>
            </div>

            <h2 className="text-2xl font-black text-slate-800 mb-6 flex items-center">
                <span className="w-2 h-8 bg-blue-500 rounded-full mr-3"></span>
                สรุปคะแนนรายวิชา
            </h2>

            {renderGroup('วิเคราะห์')}
            {renderGroup('ภาษาอังกฤษ')}
            {renderGroup('กฎหมาย')}
            
            <div className="mt-12">
                <h2 className="text-2xl font-black text-slate-800 mb-6 flex items-center">
                    <span className="w-2 h-8 bg-blue-500 rounded-full mr-3"></span>
                    เฉลยคำตอบทั้งหมด
                </h2>
                <DetailedSolution questions={qs} answers={userAnswers} />
            </div>
        </div>
    );
};

export default ExamResultKorPor;
