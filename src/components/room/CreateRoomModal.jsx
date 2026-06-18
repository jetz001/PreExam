import React, { useState, useEffect } from 'react';
import { Lock, ArrowRight, ArrowLeft, Gamepad2, GraduationCap, Sparkles, Wand2 } from 'lucide-react';
import useUserRole from '../../hooks/useUserRole';
import api from '../../services/api';
import CustomQuestionBuilder from './CustomQuestionBuilder';

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
            if (data.success) {
                const bgs = data.data.filter(a => a.type === 'background');
                const frms = data.data.filter(a => a.type === 'frame');
                setAssets({ backgrounds: bgs, frames: frms });
            }
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
        <div className="fixed inset-0 flex items-center justify-center z-[100] p-4" style={{ background: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(5px)' }}>
            <style>{`
                .crm-input { width: 100%; border: 2px solid rgba(255,255,255,0.3); border-radius: 16px; padding: 14px 20px; background: rgba(255,255,255,0.1); font-weight: 800; color: white; transition: all 0.2s; outline: none; font-size: 1rem; }
                .crm-input::placeholder { color: rgba(255,255,255,0.5); }
                .crm-input option { color: #333; }
                .crm-input:focus { border-color: white; background: rgba(255,255,255,0.2); box-shadow: 0 0 0 4px rgba(255,255,255,0.2); }
                .crm-label { display: flex; align-items: center; gap: 8px; font-size: 0.95rem; font-weight: 800; color: white; margin-bottom: 8px; }
                .crm-btn { padding: 16px 32px; border-radius: 16px; font-weight: 900; cursor: pointer; transition: all 0.1s; border: none; display: flex; align-items: center; justify-content: center; gap: 12px; font-size: 1.2rem; flex: 1; }
                .crm-btn-primary { background: #00c985; color: white; box-shadow: 0 6px 0 #009e69; }
                .crm-btn-primary:active { transform: translateY(6px); box-shadow: 0 0 0 #009e69; }
                .crm-btn-secondary { background: rgba(255,255,255,0.2); color: white; box-shadow: 0 6px 0 rgba(255,255,255,0.1); border: 2px solid rgba(255,255,255,0.3); }
                .crm-btn-secondary:active { transform: translateY(6px); box-shadow: 0 0 0 rgba(255,255,255,0.1); }
                @keyframes jelly {
                    0% { transform: scale(1, 1) translateY(-4px); }
                    30% { transform: scale(1.05, 0.95) translateY(-4px); }
                    40% { transform: scale(0.95, 1.05) translateY(-4px); }
                    50% { transform: scale(1.02, 0.98) translateY(-4px); }
                    65% { transform: scale(0.98, 1.02) translateY(-4px); }
                    75% { transform: scale(1.01, 0.99) translateY(-4px); }
                    100% { transform: scale(1, 1) translateY(-4px); }
                }

                .crm-mode-btn { border: 3px solid rgba(255,255,255,0.3); border-radius: 24px; padding: 32px; background: rgba(255,255,255,0.1); cursor: pointer; transition: all 0.2s; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 16px; }
                .crm-mode-btn.active.exam { border-color: #e21b3c; background: rgba(226, 27, 60, 0.2); box-shadow: 0 8px 0 #e21b3c; transform: translateY(-4px); animation: jelly 0.6s ease-in-out; }
                .crm-mode-btn.active.tutor { border-color: #1368ce; background: rgba(19, 104, 206, 0.2); box-shadow: 0 8px 0 #1368ce; transform: translateY(-4px); animation: jelly 0.6s ease-in-out; }
                .crm-mode-btn:hover:not(.active) { background: rgba(255,255,255,0.2); transform: translateY(-2px); box-shadow: 0 4px 10px rgba(0,0,0,0.2); }
                
                .crm-number-wrapper { position: relative; display: flex; align-items: center; background: rgba(255,255,255,0.1); border: 2px solid rgba(255,255,255,0.3); border-radius: 16px; padding: 6px; }
                .crm-number-wrapper:focus-within { border-color: white; background: rgba(255,255,255,0.2); }
                .crm-number-wrapper input { width: 100%; background: transparent; border: none; text-align: center; color: white; font-weight: 900; outline: none; font-size: 1.2rem; }
                .crm-number-btn { width: 40px; height: 40px; border-radius: 12px; border: none; background: #1368ce; color: white; font-weight: 900; cursor: pointer; transition: 0.1s; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; box-shadow: 0 4px 0 #0e55a3; }
                .crm-number-btn:active { transform: translateY(4px); box-shadow: 0 0 0 #0e55a3; }
                .crm-number-btn.btn-red { background: #e21b3c; box-shadow: 0 4px 0 #b3142e; }
                .crm-number-btn.btn-red:active { box-shadow: 0 0 0 #b3142e; }
                input[type=number]::-webkit-inner-spin-button, input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
                
                .crm-step-dot { width: 12px; height: 12px; border-radius: 50%; background: rgba(255,255,255,0.3); transition: all 0.3s; }
                .crm-step-dot.active { background: #00c985; transform: scale(1.3); }
            `}</style>

            <div className="relative rounded-[32px] shadow-[0_12px_40px_rgba(0,0,0,0.5)] w-full max-w-lg p-8 max-h-[90vh] overflow-y-auto custom-scrollbar bg-[#2d0d6b]/95 backdrop-blur-xl border border-white/20">
                <div className="flex items-center gap-4 mb-6 relative">
                    <div className="w-16 h-16 bg-white/20 rounded-[20px] flex items-center justify-center text-3xl shadow-[0_4px_0_rgba(255,255,255,0.2)] rotate-[-5deg] backdrop-blur-sm">🎮</div>
                    <div>
                        <h2 className="text-3xl font-black text-white tracking-tight">สร้างห้องสอบใหม่</h2>
                        <p className="text-white/80 text-sm font-bold mt-1">ขั้นตอนที่ {step}/4 ✨</p>
                    </div>
                    <button onClick={onClose} className="absolute right-0 top-0 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white font-bold text-2xl transition-all shadow-sm border border-white/20">&times;</button>
                </div>
                
                <div className="flex justify-center gap-2 mb-8">
                    {[1, 2, 3, 4].map(s => (
                        <div key={s} className={`crm-step-dot ${step === s ? 'active' : ''} ${step > s ? 'bg-[#00c985]' : ''}`} />
                    ))}
                </div>

                <form onSubmit={handleSubmit}>
                    {/* STEP 1: MODE */}
                    {step === 1 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            <h3 className="text-xl font-black text-white text-center mb-2">เลือกโหมดการเล่นของคุณ!</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div 
                                    className={`crm-mode-btn exam ${formData.mode === 'exam' ? 'active' : ''}`}
                                    onClick={() => setFormData(prev => ({ ...prev, mode: 'exam' }))}
                                >
                                    <div className="w-20 h-20 bg-[#e21b3c] rounded-full flex items-center justify-center text-white shadow-[0_4px_0_#b3142e]">
                                        <Gamepad2 size={40} strokeWidth={2.5}/>
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-black text-[#e21b3c] mb-1">แข่งขัน</h4>
                                        <p className="text-sm font-bold text-white/70">โหมดสอบแข่งทำเวลา</p>
                                    </div>
                                </div>
                                <div 
                                    className={`crm-mode-btn tutor ${formData.mode === 'tutor' ? 'active' : ''}`}
                                    onClick={() => setFormData(prev => ({ ...prev, mode: 'tutor' }))}
                                >
                                    <div className="w-20 h-20 bg-[#1368ce] rounded-full flex items-center justify-center text-white shadow-[0_4px_0_#0e55a3]">
                                        <GraduationCap size={40} strokeWidth={2.5}/>
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-black text-[#1368ce] mb-1">ติวเตอร์</h4>
                                        <p className="text-sm font-bold text-white/70">เน้นเรียนรู้ ดูเฉลย</p>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Tutor Sub-mode Selection */}
                            {formData.mode === 'tutor' && (
                                <div className="mt-6 p-4 bg-white/10 rounded-2xl border border-white/20 animate-in fade-in slide-in-from-top-2">
                                    <h4 className="text-white font-bold mb-3 text-center">เลือกรูปแบบการติว</h4>
                                    <div className="flex gap-2">
                                        <button 
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, tutor_submode: 'step' }))}
                                            className={`flex-1 py-3 px-2 rounded-xl border-2 transition-all text-sm font-bold flex flex-col items-center gap-1 ${formData.tutor_submode === 'step' ? 'border-[#00c985] bg-[#00c985]/20 text-white shadow-[0_4px_0_#00a86b]' : 'border-white/20 text-white/60 hover:bg-white/10 hover:translate-y-[-2px]'}`}
                                        >
                                            <span className="text-xl">🧑‍🏫</span>
                                            ไปพร้อมกันทีละข้อ
                                        </button>
                                        <button 
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, tutor_submode: 'independent' }))}
                                            className={`flex-1 py-3 px-2 rounded-xl border-2 transition-all text-sm font-bold flex flex-col items-center gap-1 ${formData.tutor_submode === 'independent' ? 'border-[#00c985] bg-[#00c985]/20 text-white shadow-[0_4px_0_#00a86b]' : 'border-white/20 text-white/60 hover:bg-white/10 hover:translate-y-[-2px]'}`}
                                        >
                                            <span className="text-xl">🏃‍♂️</span>
                                            ต่างคนต่างทำ (เฉลยตอนจบ)
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* STEP 2: BASIC INFO & QUESTIONS */}
                    {step === 2 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div>
                                <label className="crm-label">💬 ชื่อห้อง</label>
                                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="crm-input" placeholder="ตั้งชื่อห้องเก๋ๆ ของคุณ..." required autoFocus />
                            </div>
                            
                            <div>
                                <label className="crm-label">📖 แหล่งที่มาของข้อสอบ</label>
                                <div className="flex gap-2 p-1 bg-white/10 rounded-xl border border-white/20">
                                    <button type="button" onClick={() => setQuestionSource('platform')} className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all ${questionSource === 'platform' ? 'bg-white text-[#2d0d6b] shadow-sm' : 'text-white/70 hover:text-white'}`}>คลังข้อสอบระบบ</button>
                                    <button type="button" onClick={() => setQuestionSource('custom')} className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all ${questionSource === 'custom' ? 'bg-[#00c985] text-white shadow-sm' : 'text-white/70 hover:text-white'}`}>พิมพ์/นำเข้าเอง (Custom)</button>
                                </div>
                            </div>

                            {questionSource === 'platform' ? (
                                <>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="crm-label">📚 วิชา</label>
                                            <select value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} className="crm-input">
                                                <option value="">เลือกวิชา</option>
                                                {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="crm-label">📁 หมวดหมู่</label>
                                            <select value={formData.category || ''} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="crm-input">
                                                <option value="">เลือกหมวดหมู่</option>
                                                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <label className="crm-label !mb-0">📅 ปีข้อสอบ</label>
                                                <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-[#ffcc00] text-[#333]">PREMIUM</span>
                                            </div>
                                            <select value={formData.exam_year} onChange={(e) => setFormData({ ...formData, exam_year: e.target.value })} disabled={!isPremium} className={`crm-input ${!isPremium ? 'opacity-60 cursor-not-allowed bg-gray-200' : ''}`}>
                                                <option value="">ทั้งหมด</option>
                                                {years.map(y => <option key={y} value={y}>{y}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <label className="crm-label !mb-0">📑 ชุดข้อสอบ</label>
                                                <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-[#ffcc00] text-[#333]">PREMIUM</span>
                                            </div>
                                            <select value={formData.exam_set} onChange={(e) => setFormData({ ...formData, exam_set: e.target.value })} disabled={!isPremium} className={`crm-input ${!isPremium ? 'opacity-60 cursor-not-allowed bg-gray-200' : ''}`}>
                                                <option value="">ทั้งหมด</option>
                                                {sets.map(s => <option key={s} value={s}>{s.trim() === 'Mock Exam' ? 'แนวข้อสอบ' : (s.trim() === 'Real Exam' || s.trim() === 'Past Exam') ? 'ข้อสอบจริง' : s}</option>)}
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
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div>
                                <label className="crm-label">🎯 จำนวนข้อ</label>
                                {questionSource === 'custom' ? (
                                    <div className="crm-input opacity-70 bg-white/5 border-white/20 text-center">
                                        ใช้ข้อสอบ Custom จำนวน {customQuestions.length} ข้อ
                                    </div>
                                ) : (
                                    <div className="crm-number-wrapper">
                                        <button type="button" className="crm-number-btn btn-red" onClick={() => setFormData(prev => ({ ...prev, question_count: Math.max(5, prev.question_count - 1) }))}>-</button>
                                        <input type="number" value={formData.question_count} onChange={(e) => setFormData({ ...formData, question_count: e.target.value === '' ? '' : parseInt(e.target.value) })} min="5" max="100" />
                                        <button type="button" className="crm-number-btn" onClick={() => setFormData(prev => ({ ...prev, question_count: Math.min(100, prev.question_count + 1) }))}>+</button>
                                    </div>
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="crm-label">👥 ผู้เข้าสอบ (สูงสุด 20)</label>
                                    <div className="crm-number-wrapper">
                                        <button type="button" className="crm-number-btn btn-red" onClick={() => setFormData(prev => ({ ...prev, max_participants: Math.max(1, prev.max_participants - 1) }))}>-</button>
                                        <input type="number" value={formData.max_participants} onChange={(e) => setFormData({ ...formData, max_participants: e.target.value === '' ? '' : parseInt(e.target.value) })} min="1" max="20" />
                                        <button type="button" className="crm-number-btn" onClick={() => setFormData(prev => ({ ...prev, max_participants: Math.min(20, prev.max_participants + 1) }))}>+</button>
                                    </div>
                                </div>
                                <div>
                                    <label className="crm-label">⏱️ เวลาที่ใช้สอบ (นาที)</label>
                                    <div className="crm-number-wrapper">
                                        <button type="button" className="crm-number-btn btn-red" onClick={() => setFormData(prev => ({ ...prev, time_limit: Math.max(5, prev.time_limit - 1) }))}>-</button>
                                        <input type="number" value={formData.time_limit} onChange={(e) => setFormData({ ...formData, time_limit: e.target.value === '' ? '' : parseInt(e.target.value) })} min="5" max="60" />
                                        <button type="button" className="crm-number-btn" onClick={() => setFormData(prev => ({ ...prev, time_limit: Math.min(60, prev.time_limit + 1) }))}>+</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 4: DECORATE & SUBMIT */}
                    {step === 4 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            <h3 className="text-xl font-black mb-4 text-white flex items-center gap-2 drop-shadow-sm">🎨 ปรับแต่งห้อง <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-[#ffcc00] text-[#333] shadow-sm">PREMIUM</span></h3>
                            <div className="space-y-5">
                                <div>
                                    <label className="crm-label">🌌 พื้นหลัง</label>
                                    <div className="flex space-x-3 overflow-x-auto p-2 -mx-2 custom-scrollbar">
                                        <div onClick={() => setFormData(prev => ({ ...prev, theme: { ...prev.theme, background_id: null } }))} className={`flex-shrink-0 w-20 h-20 border-4 rounded-2xl cursor-pointer flex items-center justify-center bg-white/10 font-bold text-white/70 transition-all ${!formData.theme?.background_id ? 'border-white scale-105 shadow-[0_4px_10px_rgba(255,255,255,0.3)]' : 'border-transparent hover:bg-white/20'}`}>ไม่มี</div>
                                        {assets.backgrounds.map(bg => (
                                            <div key={bg.id} onClick={() => { if (!isPremium) { alert('Premium Feature'); return; } setFormData(prev => ({ ...prev, theme: { ...prev.theme, background_id: bg.id } })); }} className={`relative flex-shrink-0 w-20 h-20 border-4 rounded-2xl cursor-pointer overflow-hidden group transition-all ${formData.theme?.background_id === bg.id ? 'border-white scale-105 shadow-[0_4px_10px_rgba(255,255,255,0.3)]' : 'border-transparent hover:opacity-80'}`}>
                                                <img src={bg.url} alt={bg.name} className="w-full h-full object-cover" />
                                                {!isPremium && <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center"><Lock className="text-white w-6 h-6" /></div>}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="crm-label">🖼️ กรอบรูป</label>
                                    <div className="flex space-x-3 overflow-x-auto p-2 -mx-2 custom-scrollbar">
                                        <div onClick={() => setFormData(prev => ({ ...prev, theme: { ...prev.theme, frame_id: null } }))} className={`flex-shrink-0 w-20 h-20 border-4 rounded-2xl cursor-pointer flex items-center justify-center bg-white/10 font-bold text-white/70 transition-all ${!formData.theme?.frame_id ? 'border-white scale-105 shadow-[0_4px_10px_rgba(255,255,255,0.3)]' : 'border-transparent hover:bg-white/20'}`}>ไม่มี</div>
                                        {assets.frames.map(frm => (
                                            <div key={frm.id} onClick={() => { if (!isPremium) { alert('Premium Feature'); return; } setFormData(prev => ({ ...prev, theme: { ...prev.theme, frame_id: frm.id } })); }} className={`relative flex-shrink-0 w-20 h-20 border-4 rounded-2xl cursor-pointer overflow-hidden p-2 transition-all bg-white/10 ${formData.theme?.frame_id === frm.id ? 'border-white scale-105 shadow-[0_4px_10px_rgba(255,255,255,0.3)]' : 'border-transparent hover:bg-white/20'}`}>
                                                <div className="absolute inset-0 border-[6px]" style={{ borderImage: `url(${frm.url}) 30 round` }}></div>
                                                {!isPremium && <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center z-10"><Lock className="text-white w-6 h-6" /></div>}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="crm-label flex items-center justify-between">
                                        <span>🎬 แอนิเมชันตอนทำข้อสอบ</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-bold text-white/80">{formData.disable_animation ? 'ปิด' : 'เปิด'}</span>
                                            <button 
                                                type="button"
                                                onClick={() => setFormData(prev => ({ ...prev, disable_animation: !prev.disable_animation }))}
                                                className={`relative w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out ${!formData.disable_animation ? 'bg-[#22c55e]' : 'bg-white/20'}`}
                                            >
                                                <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ease-in-out ${!formData.disable_animation ? 'translate-x-6' : 'translate-x-0'}`} />
                                            </button>
                                        </div>
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex gap-4 mt-10">
                        {step > 1 && (
                            <button type="button" onClick={() => setStep(step - 1)} className="crm-btn crm-btn-secondary">
                                <ArrowLeft size={24} /> กลับ
                            </button>
                        )}
                        <button type="submit" className="crm-btn crm-btn-primary">
                            {step < 4 ? (
                                <>ถัดไป <ArrowRight size={24} /></>
                            ) : (
                                <>🚀 สร้างห้องเลย! ✨</>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateRoomModal;
