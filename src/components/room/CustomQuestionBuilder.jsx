import React, { useState, useEffect } from 'react';
import {
    Plus,
    Trash2,
    Upload,
    CheckSquare,
    Square,
    RefreshCw,
    Save,
    BookOpen,
    X,
    Edit2,
    ImagePlus,
    Loader2,
} from 'lucide-react';
import DOMPurify from 'dompurify';
import toast from 'react-hot-toast';
import examService from '../../services/examService';
import api from '../../services/api';

const INITIAL_QUESTION_STATE = {
    question_text: '',
    correct_answer: 'A',
    explanation: '',
    category: 'custom',
    subject: 'custom',
    difficulty: 50,
    choices: { A: '', B: '', C: '', D: '' },
};

const CustomQuestionBuilder = ({ customQuestions = [], setCustomQuestions = () => {}, mode = 'select' }) => {
    const [view, setView] = useState('list'); // 'list' | 'import' | 'create'
    const [userBank, setUserBank] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [newQ, setNewQ] = useState(INITIAL_QUESTION_STATE);

    useEffect(() => {
        loadUserBank();
    }, []);

    const loadUserBank = async () => {
        setIsLoading(true);
        try {
            const res = await examService.getUserQuestions();
            if (res.success) {
                setUserBank(res.data || []);
            }
        } catch (e) {
            console.error('Failed to load user questions', e);
            toast.error('ไม่สามารถโหลดคลังข้อสอบส่วนตัวได้');
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setEditingId(null);
        setNewQ(INITIAL_QUESTION_STATE);
    };

    const handleStartCreate = () => {
        resetForm();
        setView('create');
    };

    const handleStartEdit = (q) => {
        setEditingId(q.id);
        setNewQ({
            question_text: q.question_text || '',
            correct_answer: String(q.correct_answer || 'A').toUpperCase(),
            explanation: q.explanation || '',
            category: q.category || 'custom',
            subject: q.subject || 'custom',
            difficulty: q.difficulty ?? 50,
            choices: {
                A: q.choices?.A ?? q.choice_a ?? '',
                B: q.choices?.B ?? q.choice_b ?? '',
                C: q.choices?.C ?? q.choice_c ?? '',
                D: q.choices?.D ?? q.choice_d ?? '',
            },
        });
        setView('create');
    };

    const handleCancelForm = () => {
        resetForm();
        setView('list');
    };

    const handleRemoveFromBank = async (id) => {
        if (!window.confirm('คุณต้องการลบข้อสอบนี้จากคลังของคุณหรือไม่?')) return;
        try {
            await examService.deleteUserQuestion(id);
            setCustomQuestions(customQuestions.filter((q) => q.id !== id));
            toast.success('ลบข้อสอบเรียบร้อยแล้ว');
            await loadUserBank();
        } catch (e) {
            console.error(e);
            toast.error('เกิดข้อผิดพลาดในการลบข้อสอบ');
        }
    };

    const toggleSelection = (q) => {
        const isSelected = customQuestions.find((cq) => cq.id === q.id);
        if (isSelected) {
            setCustomQuestions(customQuestions.filter((cq) => cq.id !== q.id));
        } else {
            setCustomQuestions([...customQuestions, q]);
        }
    };

    const selectAll = () => {
        setCustomQuestions([...userBank]);
    };

    const deselectAll = () => {
        setCustomQuestions([]);
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploadingImage(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            const res = await api.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            const uploadedUrl = res.data?.url;
            if (!uploadedUrl) {
                throw new Error('Missing uploaded media URL');
            }
            const imgMarkup = `<p><img src="${uploadedUrl}" alt="question-image" /></p>`;
            setNewQ((prev) => ({
                ...prev,
                question_text: prev.question_text ? `${prev.question_text}\n${imgMarkup}` : imgMarkup,
            }));
            toast.success('อัปโหลดรูปประกอบลง R2 สำเร็จ');
        } catch (err) {
            console.error('Failed to upload question image', err);
            toast.error('อัปโหลดรูปภาพไม่สำเร็จ กรุณาลองใหม่');
        } finally {
            setIsUploadingImage(false);
            e.target.value = '';
        }
    };

    const handleCsvUpload = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsSaving(true);
        const reader = new FileReader();
        reader.onload = async (evt) => {
            const text = String(evt.target?.result || '');
            const rows = text.split('\n').filter((row) => row.trim().length > 0);
            const parsed = rows
                .slice(1)
                .map((row) => {
                    const cols = row.split(',').map((c) => c.trim().replace(/^"|"$/g, ''));
                    if (cols.length >= 6) {
                        return {
                            question_text: cols[0],
                            choices: { A: cols[1], B: cols[2], C: cols[3], D: cols[4] },
                            correct_answer: String(cols[5] || 'A').toUpperCase(),
                            explanation: cols[6] || '',
                            category: 'custom',
                            subject: 'custom',
                            difficulty: 50,
                        };
                    }
                    return null;
                })
                .filter(Boolean);

            try {
                if (parsed.length > 0) {
                    await examService.bulkCreateUserQuestions({ questions: parsed });
                    toast.success(`นำเข้าข้อสอบสำเร็จ ${parsed.length} ข้อ`);
                    await loadUserBank();
                } else {
                    toast.error('ไม่พบข้อมูลข้อสอบที่ถูกต้องในไฟล์ CSV');
                }
            } catch (err) {
                console.error(err);
                toast.error('เกิดข้อผิดพลาดในการนำเข้าข้อสอบ');
            } finally {
                setIsSaving(false);
                setView('list');
                e.target.value = '';
            }
        };
        reader.readAsText(file);
    };

    const handleSaveQuestion = async () => {
        if (!newQ.question_text?.trim() || !newQ.choices.A?.trim() || !newQ.choices.B?.trim()) {
            toast.error('กรุณากรอกโจทย์และตัวเลือก A, B ให้ครบ');
            return;
        }

        setIsSaving(true);
        const normalizedChoices = {
            A: newQ.choices.A || '',
            B: newQ.choices.B || '',
            C: newQ.choices.C || '',
            D: newQ.choices.D || '',
        };
        const payload = {
            question_text: newQ.question_text,
            choices: normalizedChoices,
            choice_a: normalizedChoices.A,
            choice_b: normalizedChoices.B,
            choice_c: normalizedChoices.C,
            choice_d: normalizedChoices.D,
            correct_answer: String(newQ.correct_answer || 'A').toUpperCase(),
            explanation: newQ.explanation || '',
            category: newQ.category?.trim() || 'custom',
            subject: newQ.subject?.trim() || 'custom',
            difficulty: newQ.difficulty ?? 50,
        };

        try {
            if (editingId) {
                const res = await examService.updateUserQuestion(editingId, payload);
                const updatedQuestion = res?.data;
                if (updatedQuestion) {
                    setCustomQuestions(
                        customQuestions.map((cq) => (cq.id === editingId ? updatedQuestion : cq))
                    );
                }
                toast.success('อัปเดตข้อสอบเรียบร้อยแล้ว');
            } else {
                await examService.createUserQuestion(payload);
                toast.success('บันทึกข้อสอบใหม่เรียบร้อยแล้ว');
            }
            await loadUserBank();
            resetForm();
            setView('list');
        } catch (e) {
            console.error(e);
            toast.error('เกิดข้อผิดพลาดในการบันทึกข้อสอบ');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div
            className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 sm:p-5 mt-3 text-white shadow-inner"
            style={{ fontFamily: "'Sarabun', 'Nunito', sans-serif" }}
        >
            <div className="flex flex-wrap gap-3 justify-between items-center mb-4">
                <h4 className="font-extrabold text-base sm:text-lg flex items-center gap-2 min-w-0">
                    <span className="w-8 h-8 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center shrink-0">
                        <BookOpen size={16} className="text-amber-300" />
                    </span>
                    <span className="truncate">คลังข้อสอบส่วนตัว</span>
                    <span className="text-xs font-black bg-white/20 border border-white/20 px-2.5 py-0.5 rounded-full shrink-0">
                        {userBank.length} ข้อ
                    </span>
                </h4>
                {view === 'list' && (
                    <div className="flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={() => setView('import')}
                            className="px-3 py-1.5 bg-sky-500/20 text-sky-100 rounded-xl hover:bg-sky-500/30 flex items-center gap-1.5 text-xs sm:text-sm font-bold border border-sky-400/40 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 cursor-pointer"
                        >
                            <Upload size={15} /> นำเข้า CSV
                        </button>
                        <button
                            type="button"
                            onClick={handleStartCreate}
                            className="px-3 py-1.5 bg-emerald-500/25 text-emerald-100 rounded-xl hover:bg-emerald-500/35 flex items-center gap-1.5 text-xs sm:text-sm font-bold border border-emerald-400/40 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 cursor-pointer"
                        >
                            <Plus size={15} /> เพิ่มข้อ
                        </button>
                    </div>
                )}
            </div>

            {view === 'import' && (
                <div className="p-5 sm:p-6 border-2 border-dashed border-white/30 bg-slate-950/30 rounded-2xl text-center mb-2">
                    {isSaving ? (
                        <div className="flex flex-col items-center justify-center p-4">
                            <RefreshCw className="animate-spin mb-2 text-sky-300" size={32} />
                            <p className="font-bold text-sky-200">กำลังบันทึกข้อสอบ...</p>
                        </div>
                    ) : (
                        <>
                            <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mx-auto mb-3">
                                <Upload className="text-sky-300" size={24} />
                            </div>
                            <p className="text-sm font-bold text-white/90 mb-4 leading-relaxed">
                                อัปโหลดไฟล์ CSV เพื่อนำเข้าข้อสอบ
                                <br />
                                <span className="text-xs text-white/70 font-medium">
                                    (รูปแบบ: โจทย์, ก, ข, ค, ง, คำตอบ(A/B/C/D), คำอธิบาย)
                                </span>
                            </p>
                            <label className="cursor-pointer bg-white/20 hover:bg-white/30 px-5 py-2.5 rounded-xl text-white font-bold text-sm transition-all border border-white/25 inline-flex items-center gap-2 focus-within:ring-2 focus-within:ring-amber-300">
                                <Upload size={16} /> เลือกไฟล์ CSV
                                <input type="file" accept=".csv" className="hidden" onChange={handleCsvUpload} />
                            </label>
                            <button
                                type="button"
                                onClick={() => setView('list')}
                                className="block mx-auto mt-4 text-sm font-bold text-rose-300 hover:text-rose-200 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 rounded-md px-2 py-1 cursor-pointer"
                            >
                                ยกเลิก
                            </button>
                        </>
                    )}
                </div>
            )}

            {view === 'create' && (
                <div className="bg-slate-950/40 backdrop-blur-md p-4 rounded-2xl border border-white/15 mb-2 relative">
                    <div className="flex items-center justify-between mb-3 gap-2">
                        <h5 className="font-extrabold text-white text-base">
                            {editingId ? 'แก้ไขข้อสอบ' : 'สร้างข้อสอบใหม่'}
                        </h5>
                        <button
                            type="button"
                            onClick={handleCancelForm}
                            aria-label={editingId ? 'ปิดฟอร์มแก้ไขข้อสอบ' : 'ปิดฟอร์มสร้างข้อสอบ'}
                            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white cursor-pointer"
                        >
                            <X size={16} />
                        </button>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <label
                            htmlFor="cqb-question-text"
                            className="text-xs font-bold text-white/80"
                        >
                            โจทย์คำถาม
                        </label>
                        <label
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer focus-within:ring-2 focus-within:ring-indigo-300 ${
                                isUploadingImage
                                    ? 'bg-indigo-500/20 border-indigo-400/30 text-indigo-200 opacity-75 cursor-wait'
                                    : 'bg-indigo-500/25 hover:bg-indigo-500/35 border-indigo-400/45 text-indigo-100'
                            }`}
                        >
                            {isUploadingImage ? (
                                <Loader2 size={14} className="animate-spin" />
                            ) : (
                                <ImagePlus size={14} />
                            )}
                            <span>{isUploadingImage ? 'กำลังอัปโหลดรูป...' : 'อัปโหลดรูปประกอบ (R2)'}</span>
                            <input
                                type="file"
                                accept="image/*"
                                disabled={isUploadingImage}
                                onChange={handleImageUpload}
                                className="hidden"
                            />
                        </label>
                    </div>

                    <textarea
                        id="cqb-question-text"
                        value={newQ.question_text}
                        onChange={(e) => setNewQ({ ...newQ, question_text: e.target.value })}
                        className="w-full bg-slate-900/60 border border-white/20 rounded-xl p-3 text-white text-sm placeholder:text-white/50 outline-none focus:border-white/60 focus-visible:ring-2 focus-visible:ring-amber-300 mb-3"
                        placeholder="พิมพ์โจทย์คำถาม..."
                        aria-label="โจทย์คำถาม"
                        rows={3}
                    />

                    {newQ.question_text?.includes('<img') && (
                        <div className="mb-3 rounded-xl border border-white/15 bg-slate-900/50 p-3">
                            <div className="text-[11px] font-bold text-white/65 mb-1.5">
                                ตัวอย่างโจทย์และรูปภาพประกอบ
                            </div>
                            <div
                                className="text-sm text-white/95 prose prose-invert max-w-none [&_img]:max-h-44 [&_img]:rounded-xl [&_img]:border [&_img]:border-white/20 [&_img]:object-contain"
                                dangerouslySetInnerHTML={{
                                    __html: DOMPurify.sanitize(newQ.question_text),
                                }}
                            />
                        </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                        <div>
                            <label
                                htmlFor="cqb-subject"
                                className="block text-xs font-bold text-white/75 mb-1"
                            >
                                วิชา (Subject)
                            </label>
                            <input
                                id="cqb-subject"
                                type="text"
                                value={newQ.subject}
                                onChange={(e) => setNewQ({ ...newQ, subject: e.target.value })}
                                className="w-full bg-slate-900/60 border border-white/20 rounded-xl px-3 py-2 text-white text-sm placeholder:text-white/50 outline-none focus:border-white/60 focus-visible:ring-2 focus-visible:ring-amber-300"
                                placeholder="เช่น ความสามารถทั่วไป, ภาษาอังกฤษ"
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="cqb-category"
                                className="block text-xs font-bold text-white/75 mb-1"
                            >
                                หมวดหมู่ (Category)
                            </label>
                            <input
                                id="cqb-category"
                                type="text"
                                value={newQ.category}
                                onChange={(e) => setNewQ({ ...newQ, category: e.target.value })}
                                className="w-full bg-slate-900/60 border border-white/20 rounded-xl px-3 py-2 text-white text-sm placeholder:text-white/50 outline-none focus:border-white/60 focus-visible:ring-2 focus-visible:ring-amber-300"
                                placeholder="เช่น ก.พ., ครูผู้ช่วย, custom"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                        {['A', 'B', 'C', 'D'].map((choice) => (
                            <div key={choice} className="flex items-center gap-2 min-w-0">
                                <button
                                    type="button"
                                    onClick={() => setNewQ({ ...newQ, correct_answer: choice })}
                                    aria-label={`เลือกข้อ ${choice} เป็นคำตอบที่ถูกต้อง`}
                                    aria-pressed={newQ.correct_answer === choice}
                                    className={`w-9 h-9 rounded-xl border-2 flex items-center justify-center shrink-0 font-black text-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 cursor-pointer ${
                                        newQ.correct_answer === choice
                                            ? 'border-emerald-400 bg-emerald-500/25 text-emerald-200 shadow-[0_0_12px_rgba(52,211,153,0.3)]'
                                            : 'border-white/30 text-white/75 hover:bg-white/10'
                                    }`}
                                >
                                    {choice}
                                </button>
                                <input
                                    type="text"
                                    value={newQ.choices[choice]}
                                    onChange={(e) =>
                                        setNewQ({
                                            ...newQ,
                                            choices: { ...newQ.choices, [choice]: e.target.value },
                                        })
                                    }
                                    className={`min-w-0 w-full bg-slate-900/60 border rounded-xl px-3 py-2 text-white text-sm placeholder:text-white/50 outline-none transition-all focus-visible:ring-2 focus-visible:ring-amber-300 ${
                                        newQ.correct_answer === choice
                                            ? 'border-emerald-400/60'
                                            : 'border-white/20 focus:border-white/60'
                                    }`}
                                    placeholder={`ตัวเลือก ${choice}`}
                                    aria-label={`ตัวเลือก ${choice}`}
                                />
                            </div>
                        ))}
                    </div>

                    <textarea
                        value={newQ.explanation}
                        onChange={(e) => setNewQ({ ...newQ, explanation: e.target.value })}
                        className="w-full bg-slate-900/60 border border-white/20 rounded-xl p-2.5 text-white/95 placeholder:text-white/50 outline-none focus:border-white/60 focus-visible:ring-2 focus-visible:ring-amber-300 text-sm mb-4"
                        placeholder="คำอธิบาย (ถ้ามี)..."
                        aria-label="คำอธิบายคำตอบ"
                        rows={2}
                    />
                    <div className="flex flex-wrap justify-end gap-2">
                        <button
                            type="button"
                            onClick={handleCancelForm}
                            className="px-4 py-2 rounded-xl font-bold text-sm text-white/80 hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white cursor-pointer"
                        >
                            ยกเลิก
                        </button>
                        <button
                            type="button"
                            onClick={handleSaveQuestion}
                            disabled={isSaving || isUploadingImage}
                            className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold text-sm transition-colors flex items-center gap-2 shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 cursor-pointer"
                        >
                            {isSaving ? <RefreshCw className="animate-spin" size={16} /> : <Save size={16} />}
                            {editingId ? 'บันทึกการแก้ไข' : 'บันทึกข้อสอบ'}
                        </button>
                    </div>
                </div>
            )}

            {view === 'list' && (
                <>
                    {mode !== 'bank' && (
                        <div className="flex flex-wrap justify-between items-center gap-2 mb-3 px-1">
                            <div className="text-sm font-bold text-white/90">
                                เลือกข้อสอบสำหรับห้องนี้:{' '}
                                <span className="text-emerald-300 font-black">{customQuestions.length} ข้อ</span>
                            </div>
                            <div className="flex gap-3 text-xs sm:text-sm font-bold">
                                <button
                                    type="button"
                                    onClick={selectAll}
                                    className="text-sky-200 hover:text-white underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 rounded px-1 cursor-pointer"
                                >
                                    เลือกทั้งหมด
                                </button>
                                <button
                                    type="button"
                                    onClick={deselectAll}
                                    className="text-white/75 hover:text-white underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded px-1 cursor-pointer"
                                >
                                    ยกเลิกทั้งหมด
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="space-y-2.5 max-h-[380px] overflow-y-auto custom-scrollbar pr-1">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center p-8 text-white/75">
                                <RefreshCw className="animate-spin mb-2" size={24} />
                                <span className="text-xs font-bold">กำลังโหลดคลังข้อสอบ...</span>
                            </div>
                        ) : userBank.length === 0 ? (
                            <div className="text-center p-6 sm:p-8 text-white/80 font-bold text-sm border-2 border-dashed border-white/20 rounded-xl bg-slate-950/25">
                                ยังไม่มีข้อสอบในคลัง กด &quot;เพิ่มข้อ&quot; หรือ &quot;นำเข้า CSV&quot; เพื่อเริ่มต้น
                            </div>
                        ) : (
                            userBank.map((q) => {
                                const isSelected = !!customQuestions.find((cq) => cq.id === q.id);
                                const sanitizedQuestion = DOMPurify.sanitize(q.question_text || '');
                                const choiceA = q.choices?.A ?? q.choice_a ?? '';
                                const choiceB = q.choices?.B ?? q.choice_b ?? '';
                                const choiceC = q.choices?.C ?? q.choice_c ?? '';
                                const choiceD = q.choices?.D ?? q.choice_d ?? '';

                                return (
                                    <div
                                        key={q.id}
                                        role={mode !== 'bank' ? 'button' : undefined}
                                        tabIndex={mode !== 'bank' ? 0 : undefined}
                                        onClick={() => {
                                            if (mode !== 'bank') toggleSelection(q);
                                        }}
                                        onKeyDown={(e) => {
                                            if (mode !== 'bank' && (e.key === 'Enter' || e.key === ' ')) {
                                                e.preventDefault();
                                                toggleSelection(q);
                                            }
                                        }}
                                        className={`p-3 rounded-xl border flex items-start gap-3 transition-all duration-150 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 ${
                                            mode !== 'bank' ? 'cursor-pointer' : ''
                                        } ${
                                            isSelected && mode !== 'bank'
                                                ? 'bg-emerald-500/15 border-emerald-400/60 shadow-[0_0_15px_rgba(34,197,94,0.12)]'
                                                : 'bg-slate-950/30 border-white/15 hover:border-white/35 hover:bg-slate-950/45'
                                        }`}
                                    >
                                        {mode !== 'bank' && (
                                            <div className="mt-0.5 shrink-0">
                                                {isSelected ? (
                                                    <CheckSquare className="text-emerald-300" size={20} />
                                                ) : (
                                                    <Square className="text-white/50 group-hover:text-white/80" size={20} />
                                                )}
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <div
                                                className="text-sm font-bold text-white leading-snug break-words [&_img]:max-h-28 [&_img]:rounded-lg [&_img]:mt-1.5 [&_img]:border [&_img]:border-white/20 [&_img]:object-contain"
                                                dangerouslySetInnerHTML={{ __html: sanitizedQuestion }}
                                            />
                                            <div className="text-xs text-white/75 mt-1.5 flex flex-wrap gap-x-3 gap-y-1">
                                                <span className="truncate max-w-[140px]">A: {choiceA}</span>
                                                <span className="truncate max-w-[140px]">B: {choiceB}</span>
                                                <span className="truncate max-w-[140px]">C: {choiceC}</span>
                                                <span className="truncate max-w-[140px]">D: {choiceD}</span>
                                                <span className="text-emerald-300 font-bold">
                                                    เฉลย: {String(q.correct_answer || 'A').toUpperCase()}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 shrink-0">
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleStartEdit(q);
                                                }}
                                                aria-label="แก้ไขข้อสอบ"
                                                title="แก้ไขข้อสอบ"
                                                className="text-white/70 hover:text-amber-300 transition-colors p-2 rounded-lg hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 cursor-pointer"
                                            >
                                                <Edit2 size={15} />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleRemoveFromBank(q.id);
                                                }}
                                                aria-label="ลบข้อสอบออกจากคลัง"
                                                title="ลบข้อสอบ"
                                                className="text-white/60 hover:text-rose-300 transition-colors p-2 rounded-lg hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 cursor-pointer"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default CustomQuestionBuilder;
