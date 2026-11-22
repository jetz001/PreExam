import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
    GraduationCap,
    User,
    Award,
    CheckCircle2,
    XCircle,
    RotateCcw,
    Home,
    BookOpenCheck,
} from 'lucide-react';
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

    const userAnswers = qs.reduce((acc, curr) => ({ ...acc, [curr.question_id || curr.id]: curr.user_answer }), {});

    const subjectRows = [
        { num: 1, key: 'วิเคราะห์' },
        { num: 2, key: 'ภาษาอังกฤษ' },
        { num: 3, key: 'กฎหมาย' },
    ];

    const renderTable = () => {
        const displayName = user?.display_name || user?.name || user?.email?.split('@')[0] || 'ผู้เข้าสอบ';

        return (
            <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl p-4 sm:p-8 md:p-10 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-700/70 mt-4 max-w-3xl mx-auto">
                <div className="text-center mb-7">
                    <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-400/35 flex items-center justify-center text-indigo-600 dark:text-indigo-300 shadow-inner">
                        <GraduationCap size={28} aria-hidden="true" />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mb-5">
                        ผลสอบ ภาค ก. {config?.mode === 'simulation' ? '(จำลอง)' : '(ฝึกฝน)'}
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left max-w-xl mx-auto bg-slate-50/90 dark:bg-slate-800/75 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/60">
                        <div className="flex items-center gap-2.5 text-sm text-slate-700 dark:text-slate-200 min-w-0">
                            <span className="w-8 h-8 rounded-xl bg-indigo-500/15 border border-indigo-400/25 flex items-center justify-center text-indigo-600 dark:text-indigo-300 shrink-0">
                                <User size={16} aria-hidden="true" />
                            </span>
                            <span className="truncate">
                                <strong className="font-extrabold">ชื่อ-นามสกุล :</strong> {displayName}
                            </span>
                        </div>
                        <div className="flex items-center gap-2.5 text-sm text-slate-700 dark:text-slate-200 min-w-0">
                            <span className="w-8 h-8 rounded-xl bg-violet-500/15 border border-violet-400/25 flex items-center justify-center text-violet-600 dark:text-violet-300 shrink-0">
                                <Award size={16} aria-hidden="true" />
                            </span>
                            <span className="truncate">
                                <strong className="font-extrabold">วุฒิที่ใช้สอบ :</strong> {eduLevel === 'master' ? 'ระดับปริญญาโท' : 'ระดับปริญญาตรี'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-slate-100/90 dark:bg-slate-800/90">
                                <th className="border-b border-r border-slate-200 dark:border-slate-700 py-3.5 px-3 sm:px-5 text-left sm:text-center font-extrabold text-xs sm:text-sm text-slate-700 dark:text-slate-200 w-3/5">
                                    วิชาที่สอบ
                                </th>
                                <th className="border-b border-r border-slate-200 dark:border-slate-700 py-3.5 px-2 sm:px-4 text-center font-extrabold text-xs sm:text-sm text-slate-700 dark:text-slate-200 w-1/5">
                                    คะแนน<br />เต็ม
                                </th>
                                <th className="border-b border-slate-200 dark:border-slate-700 py-3.5 px-2 sm:px-4 text-center font-extrabold text-xs sm:text-sm text-slate-700 dark:text-slate-200 w-1/5">
                                    คะแนน<br />ที่ได้
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {subjectRows.map(({ num, key }) => {
                                const grp = groups[key];
                                const passScore = Math.ceil((grp.maxScore * grp.passPct) / 100);
                                return (
                                    <tr key={key} className="bg-white/60 dark:bg-slate-900/50">
                                        <td className="border-b border-r border-slate-200 dark:border-slate-700 py-4 px-3 sm:px-5 align-top">
                                            <div className="flex items-start justify-between gap-2 mb-1.5">
                                                <div className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                                                    {num}. {grp.title}
                                                </div>
                                                <span
                                                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold shrink-0 ${
                                                        grp.passed
                                                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                                                            : 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                                                    }`}
                                                >
                                                    {grp.passed ? <CheckCircle2 size={12} aria-hidden="true" /> : <XCircle size={12} aria-hidden="true" />}
                                                    <span>{grp.passed ? 'ผ่าน' : 'ไม่ผ่าน'}</span>
                                                </span>
                                            </div>
                                            <div className="text-rose-600 dark:text-rose-400 font-semibold text-xs sm:text-sm">
                                                เกณฑ์การสอบผ่านต้องได้คะแนนไม่ต่ำกว่าร้อยละ {grp.passPct} ({passScore} คะแนนขึ้นไป)
                                            </div>
                                        </td>
                                        <td className="border-b border-r border-slate-200 dark:border-slate-700 py-4 px-2 sm:px-4 text-center align-middle font-extrabold text-sm sm:text-base text-slate-800 dark:text-slate-100">
                                            {grp.maxScore.toFixed(2)}
                                        </td>
                                        <td className={`border-b border-slate-200 dark:border-slate-700 py-4 px-2 sm:px-4 text-center align-middle font-black text-sm sm:text-base ${
                                            grp.passed ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                                        }`}>
                                            {grp.score.toFixed(2)}
                                        </td>
                                    </tr>
                                );
                            })}

                            {/* สรุปผล */}
                            <tr>
                                <td colSpan="3" className="py-6 px-4 bg-slate-50/90 dark:bg-slate-800/80">
                                    <div className="text-center flex flex-col items-center gap-2">
                                        <div className="font-bold text-slate-700 dark:text-slate-200 text-sm sm:text-lg">
                                            ผลการทดสอบเพื่อวัดความรู้ความสามารถทั่วไป
                                        </div>
                                        <div
                                            className={`inline-flex items-center gap-2.5 px-6 py-2.5 rounded-2xl text-2xl sm:text-4xl font-black border ${
                                                overallPass
                                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60'
                                                    : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800/60'
                                            }`}
                                        >
                                            {overallPass ? <CheckCircle2 size={30} aria-hidden="true" /> : <XCircle size={30} aria-hidden="true" />}
                                            <span>{overallPass ? 'ผ่าน' : 'ไม่ผ่าน'}</span>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
                    <button
                        type="button"
                        onClick={onRetry}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-100 font-bold rounded-2xl shadow-sm border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 cursor-pointer"
                    >
                        <RotateCcw size={18} aria-hidden="true" />
                        <span>ทำข้อสอบอีกครั้ง</span>
                    </button>
                    <Link
                        to="/"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-700 hover:from-indigo-500 hover:to-blue-600 text-white font-bold rounded-2xl shadow-lg shadow-indigo-500/25 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                    >
                        <Home size={18} aria-hidden="true" />
                        <span>กลับหน้าแรก</span>
                    </Link>
                </div>
            </div>
        );
    };

    return (
        <div className="max-w-4xl mx-auto p-3 sm:p-6 pb-20 font-['Sarabun','Nunito',sans-serif]">
            {renderTable()}

            {/* เฉลยคำตอบทั้งหมดจะแสดงในโหมดฝึกฝน */}
            {config?.mode !== 'simulation' && (
                <div className="mt-10 bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border border-slate-200/80 dark:border-slate-700/70 rounded-3xl p-4 sm:p-6 shadow-xl">
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mb-5 flex items-center gap-3">
                        <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-400/35 flex items-center justify-center text-blue-600 dark:text-blue-300 shrink-0">
                            <BookOpenCheck size={20} aria-hidden="true" />
                        </span>
                        <span>เฉลยคำตอบทั้งหมด</span>
                    </h2>
                    <DetailedSolution questions={qs} answers={userAnswers} />
                </div>
            )}
        </div>
    );
};

export default ExamResultKorPor;
