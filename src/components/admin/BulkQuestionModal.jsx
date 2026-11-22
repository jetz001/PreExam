import React, { useEffect, useState } from 'react';
import { X, Plus, Trash2, Layers, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import adminService from '../../services/adminService';

const BulkQuestionModal = ({ onClose, onSuccess }) => {
    const [category, setCategory] = useState('local_gov');
    const [subject, setSubject] = useState('thai');
    const [questions, setQuestions] = useState([
        { question_text: '', choice_a: '', choice_b: '', choice_c: '', choice_d: '', correct_answer: 'A', explanation: '' }
    ]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const onKeyDown = (e) => {
            if (e.key === 'Escape' && !loading) onClose();
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [onClose, loading]);

    const handleQuestionChange = (index, field, value) => {
        const newQuestions = [...questions];
        newQuestions[index][field] = value;
        setQuestions(newQuestions);
    };

    const addQuestion = () => {
        setQuestions([
            ...questions,
            { question_text: '', choice_a: '', choice_b: '', choice_c: '', choice_d: '', correct_answer: 'A', explanation: '' }
        ]);
    };

    const removeQuestion = (index) => {
        if (questions.length > 1) {
            setQuestions(questions.filter((_, i) => i !== index));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const catalogsArray = category
                .split(',')
                .map((t) => t.trim())
                .filter(Boolean);
            const primaryCategory = catalogsArray[0] || '';

            const dataToSubmit = questions.map((q) => ({
                ...q,
                choices: {
                    A: q.choice_a,
                    B: q.choice_b,
                    C: q.choice_c,
                    D: q.choice_d
                },
                choice_a: q.choice_a,
                choice_b: q.choice_b,
                choice_c: q.choice_c,
                choice_d: q.choice_d,
                correct_answer: String(q.correct_answer || 'A').toUpperCase(),
                catalogs: catalogsArray,
                category: primaryCategory,
                subject
            }));

            await adminService.bulkCreateQuestions({ questions: dataToSubmit });
            toast.success('เพิ่มชุดข้อสอบเรียบร้อยแล้ว');
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Error bulk creating questions:', error);
            toast.error('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl shadow-2xl border border-slate-200/80 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200/80 bg-slate-50/80">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-sm">
                            <Layers size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                                เพิ่มชุดข้อสอบ (Bulk Add Questions)
                            </h3>
                            <p className="text-xs text-slate-500">
                                กำหนดหมวดหมู่และวิชาแล้วเพิ่มข้อสอบหลายข้อพร้อมกัน ({questions.length} ข้อ)
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="ปิดหน้าต่างเพิ่มชุดข้อสอบ"
                        className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 p-6 space-y-4">
                    {/* Global Settings */}
                    <div className="bg-slate-50/90 p-4 rounded-2xl grid grid-cols-1 sm:grid-cols-2 gap-4 border border-slate-200/80">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                หมวดหมู่ (Tags)
                            </label>
                            <div className="flex flex-wrap gap-2 border border-slate-200 rounded-xl p-2.5 min-h-[44px] bg-white focus-within:ring-2 focus-within:ring-indigo-500/30 focus-within:border-indigo-500">
                                {category
                                    .split(',')
                                    .filter((t) => t.trim())
                                    .map((tag, index) => (
                                        <span
                                            key={index}
                                            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/70"
                                        >
                                            {tag.trim()}
                                            <button
                                                type="button"
                                                aria-label={`ลบแท็ก ${tag.trim()}`}
                                                onClick={() => {
                                                    const newTags = category.split(',').filter((t) => t.trim());
                                                    newTags.splice(index, 1);
                                                    setCategory(newTags.join(','));
                                                }}
                                                className="inline-flex items-center justify-center w-4 h-4 rounded-full text-indigo-600 hover:bg-indigo-200/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </span>
                                    ))}
                                <input
                                    type="text"
                                    placeholder={category ? '' : 'พิมพ์แล้วกด Enter...'}
                                    className="flex-1 outline-none border-none min-w-[120px] text-sm text-slate-900 placeholder:text-slate-500 focus:ring-0 p-0 bg-transparent"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            const val = e.target.value.trim();
                                            if (val) {
                                                const currentTags = category.split(',').filter((t) => t.trim());
                                                if (!currentTags.includes(val)) {
                                                    setCategory([...currentTags, val].join(','));
                                                }
                                                e.target.value = '';
                                            }
                                        }
                                    }}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">วิชา (Subject)</label>
                            <input
                                type="text"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                className="block w-full border border-slate-200 rounded-xl bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                                required
                            />
                        </div>
                    </div>

                    {/* Questions List */}
                    <div className="space-y-4 flex-1 overflow-y-auto pr-1">
                        {questions.map((q, index) => (
                            <div
                                key={index}
                                className="border border-slate-200/80 rounded-2xl p-4 sm:p-5 bg-white shadow-sm hover:border-indigo-200 transition-all"
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <h4 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700 text-xs font-extrabold border border-indigo-200/70">
                                            {index + 1}
                                        </span>
                                        <span>ข้อที่ {index + 1}</span>
                                    </h4>
                                    {questions.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeQuestion(index)}
                                            aria-label={`ลบข้อที่ ${index + 1}`}
                                            title="ลบข้อนี้"
                                            className="p-1.5 rounded-lg text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200/70 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>

                                <div className="space-y-3">
                                    <div>
                                        <textarea
                                            placeholder="โจทย์คำถาม..."
                                            value={q.question_text}
                                            onChange={(e) => handleQuestionChange(index, 'question_text', e.target.value)}
                                            className="w-full border border-slate-200 rounded-xl p-3 text-sm text-slate-900 placeholder:text-slate-500 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                                            rows="2"
                                            required
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <input
                                            type="text"
                                            placeholder="ตัวเลือก A"
                                            value={q.choice_a}
                                            onChange={(e) => handleQuestionChange(index, 'choice_a', e.target.value)}
                                            className="border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                                            required
                                        />
                                        <input
                                            type="text"
                                            placeholder="ตัวเลือก B"
                                            value={q.choice_b}
                                            onChange={(e) => handleQuestionChange(index, 'choice_b', e.target.value)}
                                            className="border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                                            required
                                        />
                                        <input
                                            type="text"
                                            placeholder="ตัวเลือก C"
                                            value={q.choice_c}
                                            onChange={(e) => handleQuestionChange(index, 'choice_c', e.target.value)}
                                            className="border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                                            required
                                        />
                                        <input
                                            type="text"
                                            placeholder="ตัวเลือก D"
                                            value={q.choice_d}
                                            onChange={(e) => handleQuestionChange(index, 'choice_d', e.target.value)}
                                            className="border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                                            required
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-600 mb-1">
                                                คำตอบที่ถูก
                                            </label>
                                            <select
                                                value={q.correct_answer}
                                                onChange={(e) =>
                                                    handleQuestionChange(index, 'correct_answer', e.target.value)
                                                }
                                                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                                            >
                                                <option value="A">A</option>
                                                <option value="B">B</option>
                                                <option value="C">C</option>
                                                <option value="D">D</option>
                                            </select>
                                        </div>
                                        <div className="sm:col-span-3">
                                            <label className="block text-xs font-semibold text-slate-600 mb-1">
                                                คำอธิบาย (Optional)
                                            </label>
                                            <input
                                                type="text"
                                                value={q.explanation}
                                                onChange={(e) => handleQuestionChange(index, 'explanation', e.target.value)}
                                                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                                                placeholder="อธิบายเฉลย..."
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="pt-4 border-t border-slate-200/80 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
                        <button
                            type="button"
                            onClick={addQuestion}
                            className="inline-flex items-center justify-center gap-1.5 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/70 px-4 py-2 rounded-xl text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                        >
                            <Plus className="w-4 h-4" /> เพิ่มข้ออีก
                        </button>
                        <div className="flex justify-end gap-2.5">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                            >
                                ยกเลิก
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white text-sm font-semibold px-6 py-2 rounded-xl shadow-sm disabled:opacity-50 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                            >
                                {loading && <Loader2 size={15} className="animate-spin" />}
                                <span>{loading ? 'กำลังบันทึก...' : 'บันทึกทั้งหมด'}</span>
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BulkQuestionModal;
