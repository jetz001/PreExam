import React, { useState } from 'react';
import useUserRole from '../hooks/useUserRole';
import HomeNavbar from './HomeNavbar';
import BrandLogo from './common/BrandLogo';
import publicService from '../services/publicService';
import AdaptiveLottie from './common/AdaptiveLottie';
import toast from 'react-hot-toast';
import {
    BookOpenCheck,
    Timer,
    Check,
    Rocket,
    SlidersHorizontal,
    ChevronUp,
    Target,
    Crown,
    Sparkles,
} from 'lucide-react';

/* ─────────────────────────────────────────────
   ExamConfig  — Modernized Glassmorphic Solo Setup
   Quick start big button  +  advanced panel
───────────────────────────────────────────── */

const MODE_OPTIONS = [
    {
        id: 'practice',
        Icon: BookOpenCheck,
        label: 'ฝึกฝน',
        sub: 'เฉลยทันทีทุกข้อ',
        color: '#22c55e',
        bg: 'linear-gradient(145deg, #22c55e 0%, #16a34a 100%)',
        shadow: '#15803d',
    },
    {
        id: 'simulation',
        Icon: Timer,
        label: 'จำลองสนามสอบ',
        sub: 'จับเวลา / ไม่เฉลย',
        color: '#f59e0b',
        bg: 'linear-gradient(145deg, #f59e0b 0%, #d97706 100%)',
        shadow: '#b45309',
    },
];

const QUICK_AMOUNTS = [10, 20, 30, 50];

export default function ExamConfig({ onStart }) {
    const { user, isPremium } = useUserRole();

    const [showAdvanced, setShowAdvanced] = useState(false);
    const [mode, setMode] = useState('practice');
    const [quickAmount, setQuickAmount] = useState(10);
    const [loading, setLoading] = useState(false);
    const [disableAnimation, setDisableAnimation] = useState(false);

    // Advanced state
    const [subjects, setSubjects]         = useState([]);
    const [categories, setCategories]     = useState([]);
    const [years, setYears]               = useState([]);
    const [sets, setSets]                 = useState([]);
    const [examSetsMeta, setExamSetsMeta] = useState([]);
    const [config, setConfig] = useState({
        category: '',
        subject: '',
        exam_year: '',
        exam_set: '',
        limit: 10,
        mode: 'practice',
    });

    // Load advanced data lazily or when in simulation mode
    React.useEffect(() => {
        if (!showAdvanced && mode !== 'simulation') return;
        (async () => {
            try {
                const examService = (await import('../services/examService')).default;
                const [subjectsRes, yearsRes, setsRes, metaRes] = await Promise.all([
                    examService.getSubjects(),
                    examService.getExamYears(),
                    examService.getExamSets(),
                    examService.getExamSetsMeta(),
                ]);
                if (subjectsRes.success)  setSubjects(subjectsRes.data);
                if (yearsRes.success)     setYears(yearsRes.data);
                if (setsRes.success)      setSets(setsRes.data);
                if (metaRes.success) {
                    setExamSetsMeta(metaRes.data);
                    if (mode === 'simulation' && metaRes.data.length > 0 && !config.exam_set) {
                        setConfig(p => ({ ...p, exam_set: metaRes.data[0].name }));
                    }
                }
            } catch (e) { console.error(e); }
        })();
    }, [showAdvanced, mode]);

    React.useEffect(() => {
        if (!showAdvanced) return;
        (async () => {
            try {
                const examService = (await import('../services/examService')).default;
                const res = await examService.getCategories({ subject: config.subject });
                if (res.success) {
                    setCategories(res.data);
                    if (res.data.length > 0 && config.category !== '' && !res.data.includes(config.category))
                        setConfig(p => ({ ...p, category: '' }));
                }
            } catch (e) { console.error(e); }
        })();
    }, [config.subject, showAdvanced]);

    const handleQuickStart = async () => {
        setLoading(true);
        if (mode === 'simulation') {
            if (!config.exam_set) {
                toast?.error('กรุณาเลือกชุดข้อสอบ');
                setLoading(false);
                return;
            }
            const selectedSet = examSetsMeta.find(s => s.name === config.exam_set);
            publicService.logActivity('BTN_START_EXAM', { mode, exam_set: config.exam_set, type: 'simulation', disable_animation: disableAnimation });
            await onStart({ exam_set: config.exam_set, mode, time_limit_minutes: selectedSet?.time_limit_minutes, disable_animation: disableAnimation });
        } else {
            publicService.logActivity('BTN_START_EXAM', { mode, limit: quickAmount, type: 'quick', disable_animation: disableAnimation });
            await onStart({ category: '', subject: '', exam_year: '', exam_set: '', limit: quickAmount, mode, disable_animation: disableAnimation });
        }
        setLoading(false);
    };

    const handleAdvancedSubmit = (e) => {
        e.preventDefault();
        const selectedSet = examSetsMeta.find(s => s.name === config.exam_set);
        publicService.logActivity('BTN_START_EXAM_ADVANCED', { ...config, mode, disable_animation: disableAnimation });
        onStart({ ...config, mode, time_limit_minutes: selectedSet?.time_limit_minutes, disable_animation: disableAnimation });
    };

    const handleChange = (e) =>
        setConfig(p => ({ ...p, [e.target.name]: e.target.value }));

    return (
        <>
            <style>{`
                @keyframes ecBlobDrift {
                    0%,100% { transform:translate(0,0) scale(1); }
                    40%     { transform:translate(30px,-20px) scale(1.06); }
                    70%     { transform:translate(-15px,15px) scale(0.96); }
                }
                @keyframes ecSlideUp {
                    from { opacity:0; transform:translateY(28px) scale(0.97); }
                    to   { opacity:1; transform:translateY(0) scale(1); }
                }
                @keyframes ecPanelDown {
                    from { opacity:0; transform:translateY(-8px); }
                    to   { opacity:1; transform:translateY(0); }
                }
                @keyframes ecSpin {
                    to { transform:rotate(360deg); }
                }
                @keyframes ecBounce {
                    0%,100% { transform:translateY(0) scale(1); }
                    30%     { transform:translateY(-6px) scale(1.03); }
                    60%     { transform:translateY(-2px) scale(1.01); }
                }
                @keyframes ecFloat {
                    0%   { transform:translateY(110vh) rotate(0deg); opacity:0.8; }
                    100% { transform:translateY(-10vh) rotate(720deg); opacity:0; }
                }

                .ec-root {
                    min-height: 100vh;
                    background: linear-gradient(155deg, #2e0d63 0%, #46178f 48%, #5b21b6 100%);
                    position: relative;
                    overflow-x: hidden;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 84px 16px 36px;
                    font-family: 'Sarabun','Nunito',sans-serif;
                }
                .ec-card {
                    position: relative; z-index: 10;
                    width: 100%; max-width: 540px;
                    animation: ecSlideUp 0.5s ease both;
                }
                .ec-title {
                    font-family: 'Nunito','Sarabun',sans-serif;
                    font-weight: 900;
                    font-size: clamp(1.85rem, 6.5vw, 2.75rem);
                    color: #fff;
                    text-align: center;
                    letter-spacing: -0.8px;
                    text-shadow: 0 6px 30px rgba(0,0,0,0.4), 0 0 60px rgba(167,139,250,0.5);
                    animation: ecBounce 3s ease-in-out infinite;
                }
                .ec-mode-card {
                    border-radius: 22px;
                    padding: 20px 12px;
                    cursor: pointer;
                    border: 2.5px solid rgba(255,255,255,0.22);
                    transition: transform 0.16s cubic-bezier(0.175, 0.885, 0.32, 1.275), filter 0.16s, border-color 0.16s, box-shadow 0.16s;
                    text-align: center;
                    position: relative;
                    overflow: hidden;
                    width: 100%;
                }
                .ec-mode-card:hover {
                    transform: translateY(-4px);
                    filter: brightness(1.08);
                }
                .ec-mode-card:active {
                    transform: translateY(4px);
                    box-shadow: 0 0 0 transparent !important;
                }
                .ec-mode-card.active {
                    border-color: #fff;
                    transform: translateY(-2px) scale(1.02);
                }
                .ec-mode-check {
                    position: absolute; top: 10px; right: 10px;
                    width: 24px; height: 24px; border-radius: 50%;
                    background: #fff; color: #16a34a;
                    display: flex; align-items: center; justify-content: center;
                    box-shadow: 0 4px 10px rgba(0,0,0,0.25);
                    transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }
                .ec-mode-card.active .ec-mode-check {
                    transform: scale(1.15);
                }
                .ec-amount-btn {
                    min-width: 58px; height: 44px;
                    padding: 0 14px;
                    border-radius: 14px;
                    font-weight: 800; font-size: 1rem;
                    border: 2px solid rgba(255,255,255,0.28);
                    background: rgba(255,255,255,0.12);
                    backdrop-filter: blur(8px);
                    color: rgba(255,255,255,0.85);
                    cursor: pointer;
                    transition: all 0.15s;
                }
                .ec-amount-btn.active {
                    background: #fff;
                    color: #46178f;
                    border-color: #fff;
                    box-shadow: 0 6px 20px rgba(255,255,255,0.35);
                    transform: scale(1.06);
                }
                .ec-amount-btn:hover:not(.active) { background: rgba(255,255,255,0.22); color: #fff; }
                .ec-start-btn {
                    width: 100%;
                    padding: 18px 20px;
                    border-radius: 20px;
                    border: none;
                    background: linear-gradient(135deg,#fde047 0%,#ffcc00 45%,#f59e0b 100%);
                    color: #1a0533;
                    font-weight: 900;
                    font-size: 1.2rem;
                    font-family: 'Nunito','Sarabun',sans-serif;
                    cursor: pointer;
                    box-shadow: 0 8px 32px rgba(255,200,0,0.45);
                    transition: transform 0.18s cubic-bezier(.34,1.6,.64,1), box-shadow 0.18s, filter 0.18s;
                    display: flex; align-items: center; justify-content: center; gap: 10px;
                    margin-bottom: 14px;
                }
                .ec-start-btn:hover:not(:disabled) {
                    transform: translateY(-3px) scale(1.015);
                    box-shadow: 0 16px 44px rgba(255,200,0,0.6);
                    filter: brightness(1.04);
                }
                .ec-start-btn:active:not(:disabled) { transform: scale(0.98); }
                .ec-start-btn:disabled { opacity: 0.6; cursor: not-allowed; }
                .ec-spinner {
                    width: 22px; height: 22px;
                    border: 3px solid rgba(0,0,0,0.2);
                    border-top-color: #1a0533;
                    border-radius: 50%;
                    animation: ecSpin 0.7s linear infinite;
                }
                .ec-adv-panel {
                    margin-top: 14px;
                    background: rgba(255, 255, 255, 0.08);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.22);
                    box-shadow: 0 14px 36px 0 rgba(0, 0, 0, 0.25);
                    border-radius: 24px;
                    padding: 22px 18px;
                    animation: ecPanelDown 0.28s ease both;
                }
                .ec-adv-label {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 0.78rem;
                    font-weight: 800;
                    color: rgba(255, 255, 255, 0.92);
                    margin-bottom: 6px;
                    letter-spacing: 0.4px;
                    text-transform: uppercase;
                }
                .ec-adv-select, .ec-adv-input {
                    width: 100%;
                    border: 1px solid rgba(255, 255, 255, 0.22);
                    border-radius: 14px;
                    padding: 11px 14px;
                    font-size: 0.94rem;
                    font-weight: 700;
                    color: #fff;
                    background: rgba(255, 255, 255, 0.1);
                    transition: border-color 0.15s, background 0.15s, box-shadow 0.15s;
                    outline: none;
                    font-family: 'Sarabun','Nunito',sans-serif;
                }
                .ec-adv-select option { background: #2e0d63; color: #fff; }
                .ec-adv-select:focus-visible, .ec-adv-input:focus-visible {
                    border-color: #fde047;
                    background: rgba(255, 255, 255, 0.16);
                    box-shadow: 0 0 0 2px rgba(253, 224, 71, 0.45);
                }
                .ec-adv-select:disabled { opacity: 0.4; cursor: not-allowed; }
            `}</style>

            <div className="ec-root">
                {/* Floating Transparent Navbar */}
                <HomeNavbar />

                {/* Background blobs */}
                <div style={{ position:'absolute', inset:0, overflow:'hidden', pointerEvents:'none' }}>
                    <div style={{ position:'absolute', top:'-15%', left:'-10%', width:'60vw', height:'60vw', maxWidth:600, maxHeight:600, borderRadius:'50%', background:'radial-gradient(circle at 40% 40%,#8b2fc9 0%,#6b21a8 60%,transparent 100%)', animation:'ecBlobDrift 14s ease-in-out infinite', willChange: 'transform' }}/>
                    <div style={{ position:'absolute', bottom:'-20%', right:'-10%', width:'65vw', height:'65vw', maxWidth:660, maxHeight:660, borderRadius:'50%', background:'radial-gradient(circle at 60% 60%,#7c3aed 0%,#5b21b6 55%,transparent 100%)', animation:'ecBlobDrift 18s ease-in-out infinite reverse', willChange: 'transform' }}/>
                </div>

                {/* Floating confetti dots */}
                {[
                    { left:'8%',  delay:'0s',   dur:'7s',  size:10, color:'#ffcc00' },
                    { left:'20%', delay:'1.5s', dur:'9s',  size:7,  color:'#ff6b8a' },
                    { left:'35%', delay:'0.8s', dur:'6s',  size:12, color:'#22c55e' },
                    { left:'55%', delay:'2.2s', dur:'8s',  size:8,  color:'#00b4d8' },
                    { left:'70%', delay:'0.3s', dur:'10s', size:6,  color:'#fbbf24' },
                    { left:'85%', delay:'1.8s', dur:'7.5s',size:11, color:'#a855f7' },
                    { left:'92%', delay:'0.9s', dur:'8.5s',size:7,  color:'#ff9800' },
                ].map((dot, i) => (
                    <div key={i} style={{
                        position:'absolute', bottom:'-20px', left:dot.left,
                        width:dot.size, height:dot.size, borderRadius:'50%',
                        background:dot.color, pointerEvents:'none',
                        animation:`ecFloat ${dot.dur} ${dot.delay} ease-in infinite`,
                        willChange: 'transform, opacity',
                        opacity:0.75,
                    }}/>
                ))}

                <div className="ec-card min-w-0">
                    {/* Hero BrandLogo + Title */}
                    <div className="flex flex-col items-center text-center mb-6">
                        <div className="mb-4">
                            <BrandLogo
                                variant="glass"
                                size="md"
                                badge="SOLO"
                                subtitle="สนามฝึกทำข้อสอบเดี่ยว"
                            />
                        </div>

                        <div className="flex items-center justify-center gap-3 flex-wrap">
                            <span className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400/25 to-fuchsia-500/25 backdrop-blur-md border border-white/30 flex items-center justify-center text-amber-300 shadow-[0_0_24px_rgba(253,224,71,0.3)] shrink-0">
                                <Target size={24} aria-hidden="true" />
                            </span>
                            <h1 className="ec-title m-0">เลือกโหมดสอบ</h1>
                        </div>

                        <p className="mt-2 text-sm sm:text-base font-bold text-white/80 tracking-wide">
                            Solo Exam — ทำคนเดียว ได้ทุกที่ ทุกเวลา
                        </p>
                    </div>

                    {/* Mode selector */}
                    <div className="grid grid-cols-2 gap-3 mb-5">
                        {MODE_OPTIONS.map((m) => {
                            const IconComp = m.Icon;
                            const isActive = mode === m.id;
                            return (
                                <button
                                    key={m.id}
                                    type="button"
                                    aria-pressed={isActive}
                                    className={`ec-mode-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#46178f] ${isActive ? 'active' : ''}`}
                                    style={{
                                        background: m.bg,
                                        boxShadow: isActive
                                            ? `0 8px 0 ${m.shadow}, 0 15px 30px rgba(0,0,0,0.32)`
                                            : `0 6px 0 ${m.shadow}`,
                                    }}
                                    onClick={() => setMode(m.id)}
                                >
                                    {isActive && (
                                        <span className="ec-mode-check" aria-hidden="true">
                                            <Check size={14} strokeWidth={3} />
                                        </span>
                                    )}
                                    <span className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/20 backdrop-blur-md border border-white/35 flex items-center justify-center mx-auto mb-2.5 text-white shadow-inner">
                                        <IconComp size={26} aria-hidden="true" />
                                    </span>
                                    <div className="font-black text-sm sm:text-base text-white font-['Nunito','Sarabun',sans-serif] leading-snug">
                                        {m.label}
                                    </div>
                                    <div className="text-[11px] sm:text-xs text-white/90 mt-1 font-semibold">
                                        {m.sub}
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Question amount or Exam Set Selector depending on mode */}
                    {mode !== 'simulation' ? (
                        <div className="mb-5">
                            <div className="text-center mb-2.5 text-white/80 text-xs font-extrabold tracking-widest uppercase">
                                จำนวนข้อ
                            </div>
                            <div className="flex flex-wrap gap-2 justify-center" role="group" aria-label="เลือกจำนวนข้อ">
                                {QUICK_AMOUNTS.map(n => (
                                    <button
                                        key={n}
                                        type="button"
                                        aria-pressed={quickAmount === n}
                                        className={`ec-amount-btn focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 ${quickAmount === n ? 'active' : ''}`}
                                        onClick={() => setQuickAmount(n)}
                                    >
                                        {n}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="mb-5">
                            <label
                                htmlFor="simulation-exam-set"
                                className="block text-center mb-2.5 text-white/80 text-xs font-extrabold tracking-widest uppercase"
                            >
                                เลือกชุดข้อสอบ
                            </label>
                            <select
                                id="simulation-exam-set"
                                name="exam_set"
                                value={config.exam_set}
                                onChange={handleChange}
                                aria-label="เลือกชุดข้อสอบ"
                                className="ec-adv-select w-full py-3.5 px-4 rounded-2xl bg-white/15 backdrop-blur-md text-white text-sm sm:text-base font-bold"
                            >
                                <option value="">-- กรุณาเลือกชุดข้อสอบ --</option>
                                {examSetsMeta.map((s, i) => (
                                    <option key={`meta-${i}`} value={s.name}>
                                        {s.name} {s.is_korpor_format ? '(ก.พ.)' : ''} {s.total_questions ? `(${s.total_questions} ข้อ)` : ''}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Animation toggle */}
                    <div className="flex justify-center mb-4">
                        <label
                            htmlFor="anim-toggle"
                            className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs sm:text-sm font-bold cursor-pointer hover:bg-white/15 transition-colors"
                        >
                            <input
                                type="checkbox"
                                id="anim-toggle"
                                checked={!disableAnimation}
                                onChange={(e) => setDisableAnimation(!e.target.checked)}
                                className="w-4 h-4 accent-[#ffcc00] cursor-pointer rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
                            />
                            <Sparkles size={15} className="text-amber-300 shrink-0" aria-hidden="true" />
                            <span>เปิดใช้งานแอนิเมชันตอนตอบ</span>
                        </label>
                    </div>

                    {/* Start button */}
                    <button
                        type="button"
                        className="ec-start-btn focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#46178f]"
                        onClick={handleQuickStart}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span className="ec-spinner" aria-hidden="true" />
                                <span>กำลังโหลด...</span>
                            </>
                        ) : (
                            <>
                                <Rocket size={21} className="shrink-0" aria-hidden="true" />
                                <span>เริ่มสอบเลย!</span>
                                {mode !== 'simulation' && (
                                    <span className="opacity-75 text-sm sm:text-base font-extrabold">
                                        ({quickAmount} ข้อ)
                                    </span>
                                )}
                            </>
                        )}
                    </button>

                    {/* Advanced toggle */}
                    {mode !== 'simulation' && (
                        <button
                            type="button"
                            aria-expanded={showAdvanced}
                            className="w-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/25 text-white/90 hover:text-white rounded-2xl py-3 px-4 font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                            onClick={() => setShowAdvanced(v => !v)}
                        >
                            {showAdvanced ? (
                                <ChevronUp size={18} aria-hidden="true" />
                            ) : (
                                <SlidersHorizontal size={17} aria-hidden="true" />
                            )}
                            <span>{showAdvanced ? 'ซ่อนตัวกรอง' : 'ตั้งค่าเอง (ขั้นสูง)'}</span>
                        </button>
                    )}

                    {/* Advanced panel */}
                    {showAdvanced && mode !== 'simulation' && (
                        <div className="ec-adv-panel">
                            <form onSubmit={handleAdvancedSubmit}>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {/* Subject */}
                                    <div className="sm:col-span-2">
                                        <label htmlFor="adv-subject" className="ec-adv-label">วิชา</label>
                                        <select id="adv-subject" name="subject" value={config.subject} onChange={handleChange} className="ec-adv-select">
                                            <option value="">ทั้งหมด</option>
                                            {subjects.map((s, i) => <option key={i} value={s}>{s}</option>)}
                                        </select>
                                    </div>
                                    {/* Category */}
                                    <div className="sm:col-span-2">
                                        <label htmlFor="adv-category" className="ec-adv-label">หมวดหมู่</label>
                                        <select id="adv-category" name="category" value={config.category} onChange={handleChange} className="ec-adv-select">
                                            <option value="">ทั้งหมด</option>
                                            {categories.map((c, i) => (
                                                <option key={i} value={c}>
                                                    {c === 'local_gov' ? 'ความรู้พื้นฐานในการปฏิบัติราชการ' : c}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    {/* Year */}
                                    <div>
                                        <label htmlFor="adv-year" className="ec-adv-label">
                                            <span>ปีข้อสอบ</span>
                                            {!isPremium && (
                                                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold bg-gradient-to-r from-amber-300 to-amber-500 text-[#1a0533] rounded-md px-1.5 py-0.5 tracking-wide">
                                                    <Crown size={10} aria-hidden="true" />
                                                    PREMIUM
                                                </span>
                                            )}
                                        </label>
                                        <select id="adv-year" name="exam_year" value={config.exam_year} onChange={handleChange} disabled={!isPremium} className="ec-adv-select">
                                            <option value="">ทั้งหมด</option>
                                            {years.map((y, i) => <option key={i} value={y}>{y}</option>)}
                                        </select>
                                    </div>
                                    {/* Set */}
                                    <div>
                                        <label htmlFor="adv-set" className="ec-adv-label">
                                            <span>ชุดข้อสอบ</span>
                                            {!isPremium && (
                                                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold bg-gradient-to-r from-amber-300 to-amber-500 text-[#1a0533] rounded-md px-1.5 py-0.5 tracking-wide">
                                                    <Crown size={10} aria-hidden="true" />
                                                    PREMIUM
                                                </span>
                                            )}
                                        </label>
                                        <select id="adv-set" name="exam_set" value={config.exam_set} onChange={handleChange} disabled={!isPremium} className="ec-adv-select">
                                            <option value="">ทั้งหมด</option>
                                            {examSetsMeta.map((s, i) => (
                                                <option key={`meta-${i}`} value={s.name}>
                                                    {s.name} {s.is_korpor_format ? '(ก.พ.)' : ''}
                                                </option>
                                            ))}
                                            {sets.filter(s => !examSetsMeta.find(m => m.name === s)).map((s, i) => (
                                                <option key={`old-${i}`} value={s}>
                                                    {s.trim() === 'Mock Exam' ? 'แนวข้อสอบ' : (s.trim() === 'Real Exam' || s.trim() === 'Past Exam' || s.trim() === 'ข้อสอบจริง') ? 'ข้อสอบจริง' : s}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    {/* Limit */}
                                    <div className="sm:col-span-2">
                                        <label htmlFor="adv-limit" className="ec-adv-label">จำนวนข้อ</label>
                                        <input id="adv-limit" type="number" name="limit" value={config.limit} onChange={handleChange} min="5" max="100" className="ec-adv-input" />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full mt-5 py-3.5 px-5 rounded-2xl border border-white/25 bg-gradient-to-r from-violet-500 to-indigo-600 hover:from-violet-400 hover:to-indigo-500 text-white font-black text-base font-['Nunito','Sarabun',sans-serif] shadow-[0_8px_28px_rgba(124,58,237,0.5)] hover:shadow-[0_12px_36px_rgba(124,58,237,0.65)] hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                                >
                                    <Target size={19} aria-hidden="true" />
                                    <span>เริ่มสอบด้วยตัวกรองนี้</span>
                                </button>
                            </form>
                        </div>
                    )}

                    <div className="mt-7 text-center text-white/40 text-xs font-semibold">
                        © {new Date().getFullYear()} PreExam
                    </div>
                </div>
            </div>
        </>
    );
}
