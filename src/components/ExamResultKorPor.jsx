import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import DetailedSolution from './exam/DetailedSolution';
import examService from '../services/examService';
import { useAuth } from '../context/AuthContext';

const ExamResultKorPor = ({ result, onRetry, config }) => {
    const { user } = useAuth();
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
        // ... (unchanged)
        if (q.skill) {
            const skillLower = q.skill.toLowerCase();
            if (skillLower.includes('อังกฤษ') || skillLower.includes('english')) return 'ภาษาอังกฤษ';
            if (skillLower.includes('กฎหมาย') || skillLower.includes('ข้าราชการ')) return 'กฎหมาย';
            if (skillLower.includes('วิเคราะห์')) return 'วิเคราะห์';
        }

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
        
        const engKeywords = ['อังกฤษ', 'english', 'grammar', 'vocabulary', 'reading', 'conversation', 'structure', 'reading comprehension'];
        const lawKeywords = ['กฎหมาย', 'ข้าราชการ', 'พ.ร.บ.บริหารราชการแผ่นดิน', 'พ.ร.ฎ.กิจการบ้านเมืองที่ดี', 'พ.ร.บ.วิธีปฏิบัติราชการทางปกครอง', 'พ.ร.บ.มาตรฐานทางจริยธรรม', 'พ.ร.บ.ความรับผิดทางละเมิดฯ', 'ป.อาญา ความผิดต่อตำแหน่งหน้าที่', 'พระราชบัญญัติ', 'พ.ร.บ', 'พ.ร.ฎ', 'รัฐธรรมนูญ', 'ระเบียบ', 'ละเมิด', 'ปกครอง', 'คุณธรรม', 'จริยธรรม', 'บ้านเมืองที่ดี', 'บริหารราชการ'];
        const analysisKeywords = ['วิเคราะห์', 'อนุกรม', 'เลขทั่วไป', 'ตาราง', 'เงื่อนไขสัญลักษณ์', 'เงื่อนไขภาษา', 'เรียงประโยค', 'สรุปความ', 'อุปมาอุปไมย'];
        
        if (engKeywords.some(kw => catStr.includes(kw.toLowerCase()))) return 'ภาษาอังกฤษ';
        if (lawKeywords.some(kw => catStr.includes(kw.toLowerCase()))) return 'กฎหมาย';
        if (analysisKeywords.some(kw => catStr.includes(kw.toLowerCase()))) return 'วิเคราะห์';
        
        return 'วิเคราะห์'; // Default fallback
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
        // Use fixed max score based on official standard
        g.maxScore = g.maxQuestions * g.scorePerQ;
        g.pct = (g.score / g.maxScore) * 100;
        
        g.passed = g.pct >= g.passPct;
        if (!g.passed) overallPass = false;
    });

    const userAnswers = qs.reduce((acc, curr) => ({...acc, [curr.question_id || curr.id]: curr.user_answer}), {});

    const renderTable = () => {
        const displayName = user?.display_name || user?.name || user?.email?.split('@')[0] || 'ผู้เข้าสอบ';
        
        return (
            <div className="bg-white p-6 md:p-10 rounded-xl shadow-lg border border-slate-200 mt-6 max-w-3xl mx-auto">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-slate-800 mb-6">ผลสอบ ภาค ก. {config?.mode === 'simulation' ? '(จำลอง)' : '(ฝึกฝน)'}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left max-w-lg mx-auto bg-slate-50 p-4 rounded-lg border border-slate-100">
                        <div className="text-slate-600"><strong>ชื่อ-นามสกุล :</strong> {displayName}</div>
                        <div className="text-slate-600"><strong>วุฒิที่ใช้สอบ :</strong> {eduLevel === 'master' ? 'ระดับปริญญาโท' : 'ระดับปริญญาตรี'}</div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-slate-300">
                        <thead>
                            <tr className="bg-slate-50">
                                <th className="border border-slate-300 py-4 px-4 text-center font-bold text-slate-700 w-3/5">วิชาที่สอบ</th>
                                <th className="border border-slate-300 py-4 px-4 text-center font-bold text-slate-700 w-1/5">คะแนน<br/>เต็ม</th>
                                <th className="border border-slate-300 py-4 px-4 text-center font-bold text-slate-700 w-1/5">คะแนน<br/>ที่ได้</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* วิชาที่ 1 */}
                            <tr>
                                <td className="border border-slate-300 py-4 px-6 align-top">
                                    <div className="font-bold text-slate-800 mb-2">1. {groups['วิเคราะห์'].title}</div>
                                    <div className="text-red-600 font-semibold text-sm">
                                        เกณฑ์การสอบผ่านต้องได้คะแนนไม่ต่ำกว่าร้อยละ {groups['วิเคราะห์'].passPct} ({Math.ceil(groups['วิเคราะห์'].maxScore * groups['วิเคราะห์'].passPct / 100)} คะแนนขึ้นไป)
                                    </div>
                                </td>
                                <td className="border border-slate-300 py-4 px-4 text-center align-middle font-bold text-slate-800">
                                    {(groups['วิเคราะห์'].maxScore).toFixed(2)}
                                </td>
                                <td className="border border-slate-300 py-4 px-4 text-center align-middle font-bold text-slate-800">
                                    {(groups['วิเคราะห์'].score).toFixed(2)}
                                </td>
                            </tr>
                            
                            {/* วิชาที่ 2 */}
                            <tr>
                                <td className="border border-slate-300 py-4 px-6 align-top">
                                    <div className="font-bold text-slate-800 mb-2">2. {groups['ภาษาอังกฤษ'].title}</div>
                                    <div className="text-red-600 font-semibold text-sm">
                                        เกณฑ์การสอบผ่านต้องได้คะแนนไม่ต่ำกว่าร้อยละ {groups['ภาษาอังกฤษ'].passPct} ({Math.ceil(groups['ภาษาอังกฤษ'].maxScore * groups['ภาษาอังกฤษ'].passPct / 100)} คะแนนขึ้นไป)
                                    </div>
                                </td>
                                <td className="border border-slate-300 py-4 px-4 text-center align-middle font-bold text-slate-800">
                                    {(groups['ภาษาอังกฤษ'].maxScore).toFixed(2)}
                                </td>
                                <td className="border border-slate-300 py-4 px-4 text-center align-middle font-bold text-slate-800">
                                    {(groups['ภาษาอังกฤษ'].score).toFixed(2)}
                                </td>
                            </tr>

                            {/* วิชาที่ 3 */}
                            <tr>
                                <td className="border border-slate-300 py-4 px-6 align-top">
                                    <div className="font-bold text-slate-800 mb-2">3. {groups['กฎหมาย'].title}</div>
                                    <div className="text-red-600 font-semibold text-sm">
                                        เกณฑ์การสอบผ่านต้องได้คะแนนไม่ต่ำกว่าร้อยละ {groups['กฎหมาย'].passPct} ({Math.ceil(groups['กฎหมาย'].maxScore * groups['กฎหมาย'].passPct / 100)} คะแนนขึ้นไป)
                                    </div>
                                </td>
                                <td className="border border-slate-300 py-4 px-4 text-center align-middle font-bold text-slate-800">
                                    {(groups['กฎหมาย'].maxScore).toFixed(2)}
                                </td>
                                <td className="border border-slate-300 py-4 px-4 text-center align-middle font-bold text-slate-800">
                                    {(groups['กฎหมาย'].score).toFixed(2)}
                                </td>
                            </tr>

                            {/* สรุปผล */}
                            <tr>
                                <td colSpan="3" className="border border-slate-300 py-6 px-4 bg-slate-50">
                                    <div className="text-center">
                                        <div className="font-bold text-slate-800 mb-4 text-lg">ผลการทดสอบเพื่อวัดความรู้ความสามารถทั่วไป</div>
                                        <div className={`text-4xl font-black ${overallPass ? 'text-green-600' : 'text-red-600'}`}>
                                            {overallPass ? 'ผ่าน' : 'ไม่ผ่าน'}
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div className="mt-8 flex justify-center space-x-4">
                    <button onClick={onRetry} className="px-6 py-3 bg-white text-slate-700 font-bold rounded-xl shadow-sm border border-slate-300 hover:bg-slate-50 transition-colors">
                        ทำข้อสอบอีกครั้ง
                    </button>
                    <Link to="/" className="px-6 py-3 bg-blue-700 text-white font-bold rounded-xl shadow hover:bg-blue-800 transition-colors">
                        กลับหน้าแรก
                    </Link>
                </div>
            </div>
        );
    };

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-6 pb-20">
            {renderTable()}
            
            {/* เฉลยคำตอบทั้งหมดจะแสดงในโหมดฝึกฝน */}
            {config?.mode !== 'simulation' && (
                <div className="mt-12">
                    <h2 className="text-2xl font-black text-slate-800 mb-6 flex items-center">
                        <span className="w-2 h-8 bg-blue-500 rounded-full mr-3"></span>
                        เฉลยคำตอบทั้งหมด
                    </h2>
                    <DetailedSolution questions={qs} answers={userAnswers} />
                </div>
            )}
        </div>
    );
};

export default ExamResultKorPor;
