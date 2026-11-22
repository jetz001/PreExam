import React, { useState, useEffect } from 'react';
import {
    Lock,
    ArrowRight,
    ArrowLeft,
    Gamepad2,
    GraduationCap,
    Sparkles,
    X,
    MessageCircle,
    BookOpen,
    Layers,
    FolderOpen,
    CalendarDays,
    FileText,
    Target,
    Users,
    Timer,
    Palette,
    Image,
    Film,
    Rocket,
    Zap,
    Minus,
    Plus
} from 'lucide-react';
import useUserRole from '../../hooks/useUserRole';
import api from '../../services/api';
import CustomQuestionBuilder from './CustomQuestionBuilder';
import LottieViewer from './LottieViewer';
import { STATIC_BACKGROUNDS, STATIC_FRAMES } from '../../utils/assets';

const CreateRoomModal = ({ isOpen, onClose, onCreate }) => {
    const { isPremium } = useUserRole();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '',
        mode: 'exam',
        subject: '',
        category: '',
        max_participants: 20,
        question_count: 20,
        time_limit: 60,
        exam_year: '',
        exam_set: '',
        theme: { background_id: null, frame_id: null },
        tutor_submode: 'step', // 'step' or 'independent'
        disable_animation: false
    });

    const [questionSource, setQuestionSource] = useState('platform');
    const [customQuestions, setCustomQuestions] = useState([]);

    const [subjects, setSubjects] = useState([]);
    const [categories, setCategories] = useState([]);
    const [years, setYears] = useState([]);
    const [sets, setSets] = useState([]);
    const [assets, setAssets] = useState({ backgrounds: [], frames: [] });

    useEffect(() => {
        if (isOpen) {
            setStep(1);
            setQuestionSource('platform');
            setCustomQuestions([]);
            setFormData({
                name: '',
                mode: 'exam',
                subject: '',
                category: '',
                max_participants: 20,
                question_count: 20,
                time_limit: 60,
                exam_year: '',
                exam_set: '',
                theme: { background_id: null, frame_id: null },
                tutor_submode: 'step',
                disable_animation: false
            });
            fetchOptions();
            fetchAssets();
        }
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;
        const handleKey = (e) => {
            if (e.key === 'Escape') onClose?.();
        };
        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, [isOpen, onClose]);

    const fetchOptions = async () => {
        try {
            const [subjRes, catRes] = await Promise.all([
                api.get('/questions/subjects').then(r => r.data),
                api.get('/questions/categories').then(r => r.data)
            ]);
            if (subjRes.success) setSubjects(subjRes.data);
            if (catRes.success) setCategories(catRes.data);

            const [yearsRes, setsRes] = await Promise.all([
                api.get('/questions/years').then(r => r.data),
                api.get('/questions/sets').then(r => r.data)
            ]);
            if (yearsRes.success) setYears(yearsRes.data);
            if (setsRes.success) setSets(setsRes.data);
        } catch (error) {
            console.error('Error fetching options:', error);
        }
    };

    const fetchAssets = async () => {
        try {
            const response = await api.get('/assets');
            const data = response.data;
            let bgs = [];
            let frms = [];
            if (data.success && data.data && data.data.length > 0) {
                bgs = data.data.filter(a => a.type === 'background');
                frms = data.data.filter(a => a.type === 'frame');
            }

            // Static Premium Assets
            if (bgs.length === 0) {
                bgs = STATIC_BACKGROUNDS;
            }

            if (frms.length === 0) {
                frms = STATIC_FRAMES;
            }

            setAssets({ backgrounds: bgs, frames: frms });
        } catch (error) {
            console.error('Error fetching assets:', error);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (step < 4) {
            if (step === 2 && !formData.name) {
                alert('โปรดตั้งชื่อห้อง');
                return;
            }
            if (step === 2 && questionSource === 'custom' && customQuestions.length === 0) {
                alert('โปรดเพิ่มข้อสอบอย่างน้อย 1 ข้อ หรือนำเข้าไฟล์ CSV');
                return;
            }
            setStep(step + 1);
        } else {
            onCreate({ ...formData, custom_questions: questionSource === 'custom' ? customQuestions : null });
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 flex items-center justify-center z-[250] p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md"
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-room-modal-title"
        >
            <style>{`
                .crm-input { width: 100%; border: 1.5px solid rgba(255,255,255,0.28); border-radius: 14px; padding: 12px 16px; background: rgba(255,255,255,0.1); font-weight: 700; color: white; transition: all 0.2s; outline: none; font-size: 0.95rem; }
                .crm-input::placeholder { color: rgba(255,255,255,0.55); }
                .crm-input option { color: #1e293b; background: #ffffff; }
                .crm-input:focus { border-color: #fde047; background: rgba(255,255,255,0.16); box-shadow: 0 0 0 3px rgba(253,224,71,0.25); }
                .crm-label { display: flex; align-items: center; gap: 8px; font-size: 0.9rem; font-weight: 800; color: white; margin-bottom: 8px; }
                .crm-btn { padding: 13px 22px; border-radius: 16px; font-weight: 900; cursor: pointer; transition: all 0.15s; border: none; display: flex; align-items: center; justify-content: center; gap: 10px; font-size: 1rem; flex: 1; }
                .crm-btn-primary { background: linear-gradient(135deg, #10b981, #059669); color: white; box-shadow: 0 5px 0 #047857; }
                .crm-btn-primary:hover { filter: brightness(1.06); }
                .crm-btn-primary:active { transform: translateY(4px); box-shadow: 0 1px 0 #047857; }
                .crm-btn-secondary { background: rgba(255,255,255,0.14); color: white; box-shadow: 0 5px 0 rgba(15,23,42,0.35); border: 1.5px solid rgba(255,255,255,0.28); }
                .crm-btn-secondary:hover { background: rgba(255,255,255,0.22); }
                .crm-btn-secondary:active { transform: translateY(4px); box-shadow: 0 1px 0 rgba(15,23,42,0.35); }
                @keyframes jelly {
                    0% { transform: scale(1, 1) translateY(-3px); }
                    30% { transform: scale(1.04, 0.96) translateY(-3px); }
                    50% { transform: scale(0.98, 1.02) translateY(-3px); }
                    100% { transform: scale(1, 1) translateY(-3px); }
                }
                .crm-mode-btn { width: 100%; border: 2px solid rgba(255,255,255,0.25); border-radius: 22px; padding: 22px 16px; background: rgba(255,255,255,0.08); cursor: pointer; transition: all 0.2s; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 12px; }
                .crm-mode-btn.active.exam { border-color: #fb7185; background: rgba(225, 29, 72, 0.22); box-shadow: 0 6px 0 #be123c; transform: translateY(-3px); animation: jelly 0.55s ease-in-out; }
                .crm-mode-btn.active.tutor { border-color: #60a5fa; background: rgba(37, 99, 235, 0.24); box-shadow: 0 6px 0 #1d4ed8; transform: translateY(-3px); animation: jelly 0.55s ease-in-out; }
                .crm-mode-btn:hover:not(.active) { background: rgba(255,255,255,0.16); transform: translateY(-2px); }
                .crm-number-wrapper { position: relative; display: flex; align-items: center; background: rgba(255,255,255,0.1); border: 1.5px solid rgba(255,255,255,0.28); border-radius: 14px; padding: 5px; gap: 6px; }
                .crm-number-wrapper:focus-within { border-color: #fde047; background: rgba(255,255,255,0.16); }
                .crm-number-wrapper input { min-width: 0; width: 100%; background: transparent; border: none; text-align: center; color: white; font-weight: 900; outline: none; font-size: 1.15rem; }
                .crm-number-btn { width: 38px; height: 38px; shrink: 0; border-radius: 10px; border: none; background: #2563eb; color: white; font-weight: 900; cursor: pointer; transition: 0.12s; display: flex; align-items: center; justify-content: center; box-shadow: 0 3px 0 #1d4ed8; flex-shrink: 0; }
                .crm-number-btn:active { transform: translateY(3px); box-shadow: 0 0 0 #1d4ed8; }
                .crm-number-btn.btn-red { background: #e11d48; box-shadow: 0 3px 0 #be123c; }
                .crm-number-btn.btn-red:active { box-shadow: 0 0 0 #be123c; }
                input[type=number]::-webkit-inner-spin-button, input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
            `}</style>

            <div
                className="relative rounded-3xl shadow-[0_24px_60px_rgba(0,0,0,0.55)] w-full max-w-lg p-5 sm:p-7 max-h-[92vh] overflow-y-auto custom-scrollbar bg-gradient-to-br from-[#2d0d6b]/95 via-[#3b1285]/95 to-[#1e1b4b]/95 backdrop-blur-xl border border-white/25"
                style={{ fontFamily: "'Nunito', 'Sarabun', sans-serif" }}
            >
                <div className="flex items-center gap-3.5 mb-5 relative pr-11">
                    <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-indigo-500/40 to-fuchsia-500/40 border border-white/30 flex items-center justify-center shadow-lg shrink-0">
                        <Gamepad2 className="w-7 h-7 text-amber-300" strokeWidth={2.3} />
                    </div>
                    <div className="min-w-0">
                        <h2 id="create-room-modal-title" className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
                            สร้างห้องสอบใหม่
                        </h2>
                        <p className="text-white/85 text-xs sm:text-sm font-bold mt-1 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                            <span>ขั้นตอนที่ {step} จาก 4</span>
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="ปิดหน้าต่างสร้างห้อง"
                        className="absolute right-0 top-0 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-all shadow-sm border border-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Progress Steps */}
                <div className="flex items-center justify-center gap-2 mb-6" aria-label={`ขั้นตอนที่ ${step} จาก 4`}>
                    {[1, 2, 3, 4].map(s => (
                        <div
                            key={s}
                            className={`h-2 rounded-full transition-all duration-300 ${
                                step === s
                                    ? 'w-8 bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.6)]'
                                    : step > s
                                    ? 'w-5 bg-emerald-400/80'
                                    : 'w-2.5 bg-white/25'
                            }`}
                        />
                    ))}
                </div>

                <form onSubmit={handleSubmit}>
                    {/* STEP 1: MODE */}
                    {step === 1 && (
                        <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                            <h3 className="text-lg sm:text-xl font-black text-white text-center">เลือกโหมดการเล่นของคุณ</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                                <button
                                    type="button"
                                    className={`crm-mode-btn exam focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 ${formData.mode === 'exam' ? 'active' : ''}`}
                                    onClick={() => setFormData(prev => ({ ...prev, mode: 'exam' }))}
                                    aria-pressed={formData.mode === 'exam'}
                                >
                                    <div className="w-16 h-16 bg-gradient-to-br from-rose-500 to-red-600 rounded-2xl flex items-center justify-center text-white shadow-[0_4px_0_#9f1239] border border-white/25">
                                        <Gamepad2 size={32} strokeWidth={2.5} />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-black text-white mb-0.5">แข่งขัน</h4>
                                        <p className="text-xs sm:text-sm font-bold text-white/80">โหมดสอบแข่งทำเวลา</p>
                                    </div>
                                </button>
                                <button
                                    type="button"
                                    className={`crm-mode-btn tutor focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 ${formData.mode === 'tutor' ? 'active' : ''}`}
                                    onClick={() => setFormData(prev => ({ ...prev, mode: 'tutor' }))}
                                    aria-pressed={formData.mode === 'tutor'}
                                >
                                    <div className="w-16 h-16 bg-gradient-to-br from-sky-500 to-blue-600 rounded-2xl flex items-center justify-center text-white shadow-[0_4px_0_#1e40af] border border-white/25">
                                        <GraduationCap size={32} strokeWidth={2.5} />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-black text-white mb-0.5">ติวเตอร์</h4>
                                        <p className="text-xs sm:text-sm font-bold text-white/80">เน้นเรียนรู้ ดูเฉลย</p>
                                    </div>
                                </button>
                            </div>

                            {/* Tutor Sub-mode Selection */}
                            {formData.mode === 'tutor' && (
                                <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 animate-in fade-in slide-in-from-top-2">
                                    <h4 className="text-white font-extrabold text-sm mb-3 text-center">เลือกรูปแบบการติว</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                        <button
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, tutor_submode: 'step' }))}
                                            aria-pressed={formData.tutor_submode === 'step'}
                                            className={`py-3 px-3 rounded-xl border-2 transition-all text-xs sm:text-sm font-bold flex flex-col items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 cursor-pointer ${
                                                formData.tutor_submode === 'step'
                                                    ? 'border-emerald-400 bg-emerald-500/20 text-white shadow-[0_3px_0_#059669]'
                                                    : 'border-white/20 text-white/80 hover:bg-white/10'
                                            }`}
                                        >
                                            <GraduationCap className="w-5 h-5 text-emerald-300" />
                                            <span>ไปพร้อมกันทีละข้อ</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, tutor_submode: 'independent' }))}
                                            aria-pressed={formData.tutor_submode === 'independent'}
                                            className={`py-3 px-3 rounded-xl border-2 transition-all text-xs sm:text-sm font-bold flex flex-col items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 cursor-pointer ${
                                                formData.tutor_submode === 'independent'
                                                    ? 'border-emerald-400 bg-emerald-500/20 text-white shadow-[0_3px_0_#059669]'
                                                    : 'border-white/20 text-white/80 hover:bg-white/10'
                                            }`}
                                        >
                                            <Zap className="w-5 h-5 text-amber-300" />
                                            <span>ต่างคนต่างทำ (เฉลยตอนจบ)</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* STEP 2: BASIC INFO & QUESTIONS */}
                    {step === 2 && (
                        <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div>
                                <label htmlFor="crm-room-name" className="crm-label">
                                    <MessageCircle className="w-4 h-4 text-sky-300" />
                                    <span>ชื่อห้อง</span>
                                </label>
                                <input
                                    id="crm-room-name"
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="crm-input"
                                    placeholder="ตั้งชื่อห้องเก๋ๆ ของคุณ..."
                                    required
                                    autoFocus
                                />
                            </div>

                            <div>
                                <div className="crm-label">
                                    <BookOpen className="w-4 h-4 text-emerald-300" />
                                    <span>แหล่งที่มาของข้อสอบ</span>
                                </div>
                                <div className="flex gap-2 p-1 bg-white/10 rounded-xl border border-white/20">
                                    <button
                                        type="button"
                                        onClick={() => setQuestionSource('platform')}
                                        className={`flex-1 py-2 px-2 rounded-lg font-bold text-xs sm:text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 cursor-pointer ${
                                            questionSource === 'platform' ? 'bg-white text-[#2d0d6b] shadow-sm' : 'text-white/85 hover:text-white'
                                        }`}
                                    >
                                        คลังข้อสอบระบบ
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setQuestionSource('custom')}
                                        className={`flex-1 py-2 px-2 rounded-lg font-bold text-xs sm:text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 cursor-pointer ${
                                            questionSource === 'custom' ? 'bg-emerald-500 text-white shadow-sm' : 'text-white/85 hover:text-white'
                                        }`}
                                    >
                                        พิมพ์/นำเข้าเอง (Custom)
                                    </button>
                                </div>
                            </div>

                            {questionSource === 'platform' ? (
                                <>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="crm-subject" className="crm-label">
                                                <Layers className="w-4 h-4 text-indigo-300" />
                                                <span>วิชา</span>
                                            </label>
                                            <select
                                                id="crm-subject"
                                                value={formData.subject}
                                                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                                className="crm-input"
                                            >
                                                <option value="">เลือกวิชา</option>
                                                {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label htmlFor="crm-category" className="crm-label">
                                                <FolderOpen className="w-4 h-4 text-amber-300" />
                                                <span>หมวดหมู่</span>
                                            </label>
                                            <select
                                                id="crm-category"
                                                value={formData.category || ''}
                                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                                className="crm-input"
                                            >
                                                <option value="">เลือกหมวดหมู่</option>
                                                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <label htmlFor="crm-year" className="crm-label !mb-0">
                                                    <CalendarDays className="w-4 h-4 text-fuchsia-300" />
                                                    <span>ปีข้อสอบ</span>
                                                </label>
                                                <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-amber-300 text-slate-900">PREMIUM</span>
                                            </div>
                                            <select
                                                id="crm-year"
                                                value={formData.exam_year}
                                                onChange={(e) => setFormData({ ...formData, exam_year: e.target.value })}
                                                disabled={!isPremium}
                                                className={`crm-input ${!isPremium ? 'opacity-60 cursor-not-allowed bg-white/5 text-white/75' : ''}`}
                                            >
                                                <option value="">ทั้งหมด</option>
                                                {years.map(y => <option key={y} value={y}>{y}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <label htmlFor="crm-set" className="crm-label !mb-0">
                                                    <FileText className="w-4 h-4 text-cyan-300" />
                                                    <span>ชุดข้อสอบ</span>
                                                </label>
                                                <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-amber-300 text-slate-900">PREMIUM</span>
                                            </div>
                                            <select
                                                id="crm-set"
                                                value={formData.exam_set}
                                                onChange={(e) => setFormData({ ...formData, exam_set: e.target.value })}
                                                disabled={!isPremium}
                                                className={`crm-input ${!isPremium ? 'opacity-60 cursor-not-allowed bg-white/5 text-white/75' : ''}`}
                                            >
                                                <option value="">ทั้งหมด</option>
                                                {sets.map(s => (
                                                    <option key={s} value={s}>
                                                        {s.trim() === 'Mock Exam' ? 'แนวข้อสอบ' : (s.trim() === 'Real Exam' || s.trim() === 'Past Exam') ? 'ข้อสอบจริง' : s}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <CustomQuestionBuilder customQuestions={customQuestions} setCustomQuestions={setCustomQuestions} />
                            )}
                        </div>
                    )}

                    {/* STEP 3: LIMITS */}
                    {step === 3 && (
                        <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div>
                                <label htmlFor="crm-q-count" className="crm-label">
                                    <Target className="w-4 h-4 text-rose-300" />
                                    <span>จำนวนข้อ</span>
                                </label>
                                {questionSource === 'custom' ? (
                                    <div className="crm-input opacity-85 bg-white/5 border-white/20 text-center">
                                        ใช้ข้อสอบ Custom จำนวน {customQuestions.length} ข้อ
                                    </div>
                                ) : (
                                    <div className="crm-number-wrapper">
                                        <button
                                            type="button"
                                            className="crm-number-btn btn-red focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
                                            aria-label="ลดจำนวนข้อ"
                                            onClick={() => setFormData(prev => ({ ...prev, question_count: Math.max(5, prev.question_count - 1) }))}
                                        >
                                            <Minus size={18} strokeWidth={3} />
                                        </button>
                                        <input
                                            id="crm-q-count"
                                            type="number"
                                            value={formData.question_count}
                                            onChange={(e) => setFormData({ ...formData, question_count: e.target.value === '' ? '' : parseInt(e.target.value) })}
                                            min="5"
                                            max="100"
                                        />
                                        <button
                                            type="button"
                                            className="crm-number-btn focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
                                            aria-label="เพิ่มจำนวนข้อ"
                                            onClick={() => setFormData(prev => ({ ...prev, question_count: Math.min(100, prev.question_count + 1) }))}
                                        >
                                            <Plus size={18} strokeWidth={3} />
                                        </button>
                                    </div>
                                )}
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="crm-max-users" className="crm-label">
                                        <Users className="w-4 h-4 text-sky-300" />
                                        <span>ผู้เข้าสอบ (สูงสุด 20)</span>
                                    </label>
                                    <div className="crm-number-wrapper">
                                        <button
                                            type="button"
                                            className="crm-number-btn btn-red focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
                                            aria-label="ลดจำนวนผู้เข้าสอบ"
                                            onClick={() => setFormData(prev => ({ ...prev, max_participants: Math.max(1, prev.max_participants - 1) }))}
                                        >
                                            <Minus size={18} strokeWidth={3} />
                                        </button>
                                        <input
                                            id="crm-max-users"
                                            type="number"
                                            value={formData.max_participants}
                                            onChange={(e) => setFormData({ ...formData, max_participants: e.target.value === '' ? '' : parseInt(e.target.value) })}
                                            min="1"
                                            max="20"
                                        />
                                        <button
                                            type="button"
                                            className="crm-number-btn focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
                                            aria-label="เพิ่มจำนวนผู้เข้าสอบ"
                                            onClick={() => setFormData(prev => ({ ...prev, max_participants: Math.min(20, prev.max_participants + 1) }))}
                                        >
                                            <Plus size={18} strokeWidth={3} />
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="crm-time-limit" className="crm-label">
                                        <Timer className="w-4 h-4 text-amber-300" />
                                        <span>เวลาที่ใช้สอบ (นาที)</span>
                                    </label>
                                    <div className="crm-number-wrapper">
                                        <button
                                            type="button"
                                            className="crm-number-btn btn-red focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
                                            aria-label="ลดเวลาสอบ"
                                            onClick={() => setFormData(prev => ({ ...prev, time_limit: Math.max(5, prev.time_limit - 1) }))}
                                        >
                                            <Minus size={18} strokeWidth={3} />
                                        </button>
                                        <input
                                            id="crm-time-limit"
                                            type="number"
                                            value={formData.time_limit}
                                            onChange={(e) => setFormData({ ...formData, time_limit: e.target.value === '' ? '' : parseInt(e.target.value) })}
                                            min="5"
                                            max="60"
                                        />
                                        <button
                                            type="button"
                                            className="crm-number-btn focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
                                            aria-label="เพิ่มเวลาสอบ"
                                            onClick={() => setFormData(prev => ({ ...prev, time_limit: Math.min(60, prev.time_limit + 1) }))}
                                        >
                                            <Plus size={18} strokeWidth={3} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 4: DECORATE & SUBMIT */}
                    {step === 4 && (
                        <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                            <h3 className="text-lg sm:text-xl font-black text-white flex items-center gap-2 drop-shadow-sm">
                                <Palette className="w-5 h-5 text-fuchsia-300" />
                                <span>ปรับแต่งห้อง</span>
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-amber-300 text-slate-900 shadow-sm">
                                    PREMIUM
                                </span>
                            </h3>
                            <div className="space-y-5">
                                <div>
                                    <div className="crm-label">
                                        <Sparkles className="w-4 h-4 text-indigo-300" />
                                        <span>พื้นหลัง</span>
                                    </div>
                                    <div className="flex space-x-3 overflow-x-auto p-2 -mx-2 custom-scrollbar">
                                        <button
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, theme: { ...prev.theme, background_id: null, background_url: null } }))}
                                            className={`flex-shrink-0 w-20 h-20 border-3 rounded-2xl cursor-pointer flex items-center justify-center bg-white/10 font-bold text-sm text-white/90 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 ${
                                                !formData.theme?.background_id ? 'border-white scale-105 shadow-[0_4px_12px_rgba(255,255,255,0.28)]' : 'border-white/15 hover:bg-white/20'
                                            }`}
                                        >
                                            ไม่มี
                                        </button>
                                        {assets.backgrounds.map(bg => (
                                            <button
                                                type="button"
                                                key={bg.id}
                                                onClick={() => {
                                                    if (!isPremium) { alert('Premium Feature'); return; }
                                                    setFormData(prev => ({ ...prev, theme: { ...prev.theme, background_id: bg.id, background_url: bg.url } }));
                                                }}
                                                aria-label={`เลือกพื้นหลัง ${bg.name}`}
                                                className={`relative flex-shrink-0 w-20 h-20 border-3 rounded-2xl cursor-pointer overflow-hidden group transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 ${
                                                    formData.theme?.background_id === bg.id ? 'border-white scale-105 shadow-[0_4px_12px_rgba(255,255,255,0.28)]' : 'border-white/15 hover:opacity-90'
                                                }`}
                                            >
                                                {bg.url.endsWith('.json') ? (
                                                    <LottieViewer url={bg.url} className="w-full h-full object-cover bg-[#1a1a2e]" />
                                                ) : (
                                                    <img src={bg.url} alt={bg.name} className="w-full h-full object-cover" />
                                                )}
                                                {!isPremium && (
                                                    <div className="absolute inset-0 bg-slate-950/65 flex items-center justify-center">
                                                        <Lock className="text-white w-5 h-5" />
                                                    </div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <div className="crm-label">
                                        <Image className="w-4 h-4 text-amber-300" />
                                        <span>กรอบรูป</span>
                                    </div>
                                    <div className="flex space-x-3 overflow-x-auto p-2 -mx-2 custom-scrollbar">
                                        <button
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, theme: { ...prev.theme, frame_id: null, frame_url: null } }))}
                                            className={`flex-shrink-0 w-20 h-20 border-3 rounded-2xl cursor-pointer flex items-center justify-center bg-white/10 font-bold text-sm text-white/90 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 ${
                                                !formData.theme?.frame_id ? 'border-white scale-105 shadow-[0_4px_12px_rgba(255,255,255,0.28)]' : 'border-white/15 hover:bg-white/20'
                                            }`}
                                        >
                                            ไม่มี
                                        </button>
                                        {assets.frames.map(frm => (
                                            <button
                                                type="button"
                                                key={frm.id}
                                                onClick={() => {
                                                    if (!isPremium) { alert('Premium Feature'); return; }
                                                    setFormData(prev => ({ ...prev, theme: { ...prev.theme, frame_id: frm.id, frame_url: frm.url } }));
                                                }}
                                                aria-label={`เลือกกรอบรูป ${frm.name}`}
                                                className={`relative flex-shrink-0 w-20 h-20 border-3 rounded-2xl cursor-pointer overflow-hidden p-2 transition-all bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 ${
                                                    formData.theme?.frame_id === frm.id ? 'border-white scale-105 shadow-[0_4px_12px_rgba(255,255,255,0.28)]' : 'border-white/15 hover:bg-white/20'
                                                }`}
                                            >
                                                {frm.url.endsWith('.json') ? (
                                                    <div className="absolute inset-0 z-0 pointer-events-none opacity-85 scale-150">
                                                        <LottieViewer url={frm.url} className="w-full h-full" />
                                                    </div>
                                                ) : (
                                                    <div className="absolute inset-0 border-[6px] z-0 pointer-events-none" style={{ borderImage: `url(${frm.url}) 30 round` }}></div>
                                                )}
                                                {!isPremium && (
                                                    <div className="absolute inset-0 bg-slate-950/65 flex items-center justify-center z-10">
                                                        <Lock className="text-white w-5 h-5" />
                                                    </div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="p-3.5 rounded-2xl bg-white/10 border border-white/15">
                                    <div className="flex items-center justify-between gap-3">
                                        <span className="flex items-center gap-2 text-sm font-extrabold text-white">
                                            <Film className="w-4 h-4 text-emerald-300 shrink-0" />
                                            <span>แอนิเมชันตอนทำข้อสอบ</span>
                                        </span>
                                        <div className="flex items-center gap-2.5 shrink-0">
                                            <span className="text-xs font-bold text-white/85">{formData.disable_animation ? 'ปิด' : 'เปิด'}</span>
                                            <button
                                                type="button"
                                                role="switch"
                                                aria-checked={!formData.disable_animation}
                                                aria-label="เปิดหรือปิดแอนิเมชันตอนทำข้อสอบ"
                                                onClick={() => setFormData(prev => ({ ...prev, disable_animation: !prev.disable_animation }))}
                                                className={`relative w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 cursor-pointer ${
                                                    !formData.disable_animation ? 'bg-emerald-500' : 'bg-white/25'
                                                }`}
                                            >
                                                <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ease-in-out ${!formData.disable_animation ? 'translate-x-6' : 'translate-x-0'}`} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex gap-3 mt-7">
                        {step > 1 && (
                            <button
                                type="button"
                                onClick={() => setStep(step - 1)}
                                className="crm-btn crm-btn-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                            >
                                <ArrowLeft size={20} /> กลับ
                            </button>
                        )}
                        <button
                            type="submit"
                            className="crm-btn crm-btn-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
                        >
                            {step < 4 ? (
                                <>ถัดไป <ArrowRight size={20} /></>
                            ) : (
                                <><Rocket size={20} /> สร้างห้องเลย!</>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateRoomModal;
