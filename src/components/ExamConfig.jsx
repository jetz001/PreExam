import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import HomeNavbar from './HomeNavbar';
import publicService from '../services/publicService';
import AdaptiveLottie from './common/AdaptiveLottie';
import toast from 'react-hot-toast';

/* ─────────────────────────────────────────────
   ExamConfig  — Kahoot-style redesign
   Quick start big button  +  advanced panel
───────────────────────────────────────────── */

const MODE_OPTIONS = [
    {
        id: 'practice',
        emoji: '📝',
        label: 'ฝึกฝน',
        sub: 'เฉลยทันทีทุกข้อ',
        color: '#22c55e',
        bg: '#22c55e',
        shadow: '#15803d',
    },
    {
        id: 'simulation',
        emoji: '⏱️',
        label: 'จำลองสนามสอบ',
        sub: 'จับเวลา / ไม่เฉลย',
        color: '#f59e0b',
        bg: '#f59e0b',
        shadow: '#b45309',
    },
];

const QUICK_AMOUNTS = [10, 20, 30, 50];

export default function ExamConfig({ onStart }) {
    const { user } = useAuth();
    const isPremium = user?.plan_type === 'subscription' || user?.role === 'admin';

    const [showAdvanced, setShowAdvanced] = useState(false);
    const [mode, setMode] = useState('practice');
    const [quickAmount, setQuickAmount] = useState(10);
    const [loading, setLoading] = useState(false);
    const [disableAnimation, setDisableAnimation] = useState(false);

    // Advanced state
    const [subjects, setSubjects]     = useState([]);
    const [categories, setCategories] = useState([]);
    const [years, setYears]           = useState([]);
    const [sets, setSets]             = useState([]);
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
                @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@700;800;900&display=swap');

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
                    30%     { transform:translateY(-8px) scale(1.04); }
                    60%     { transform:translateY(-3px) scale(1.01); }
                }
                @keyframes ecFloat {
                    0%   { transform:translateY(110vh) rotate(0deg); opacity:0.8; }
                    100% { transform:translateY(-10vh) rotate(720deg); opacity:0; }
                }

                .ec-root {
                    min-height: 100vh;
                    background: #46178f;
                    position: relative;
                    overflow: hidden;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 80px 16px 32px;
                    font-family: 'Sarabun','Nunito',sans-serif;
                }
                .ec-card {
                    position: relative; z-index: 10;
                    width: 100%; max-width: 520px;
                    animation: ecSlideUp 0.5s ease both;
                }
                .ec-title {
                    font-family: 'Nunito','Sarabun',sans-serif;
                    font-weight: 900;
                    font-size: clamp(2.2rem,7vw,3.2rem);
                    color: #fff;
                    text-align: center;
                    letter-spacing: -1.5px;
                    margin-bottom: 6px;
                    text-shadow: 0 6px 30px rgba(0,0,0,0.4), 0 0 60px rgba(167,139,250,0.5);
                    animation: ecBounce 2.5s ease-in-out infinite;
                    display: inline-block;
                    width: 100%;
                }
                .ec-sub {
                    text-align: center;
                    color: rgba(255,255,255,0.65);
                    font-size: 1rem;
                    font-weight: 700;
                    margin-bottom: 28px;
                    letter-spacing: 0.3px;
                }
                /* Mode cards */
                .ec-modes {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 12px;
                    margin-bottom: 20px;
                }
                .ec-mode-card {
                    border-radius: 20px;
                    padding: 24px 14px;
                    cursor: pointer;
                    border: 3px solid rgba(255,255,255,0.2);
                    transition: all 0.15s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    text-align: center;
                    position: relative;
                    overflow: hidden;
                }
                .ec-mode-card:hover { 
                    transform: translateY(-4px); 
                    filter: brightness(1.1);
                }
                .ec-mode-card:active {
                    transform: translateY(6px);
                    box-shadow: 0 0 0 transparent !important;
                }
                .ec-mode-card.active {
                    border-color: #fff;
                    transform: translateY(-2px) scale(1.03);
                }
                .ec-mode-emoji { font-size: 2rem; margin-bottom: 6px; }
                .ec-mode-label {
                    font-weight: 900;
                    font-size: 1rem;
                    color: #fff;
                    font-family: 'Nunito','Sarabun',sans-serif;
                }
                .ec-mode-sub { font-size: 0.72rem; color: rgba(255,255,255,0.75); margin-top: 2px; font-weight: 600; }
                .ec-mode-check {
                    position: absolute; top: 12px; right: 12px;
                    width: 24px; height: 24px; border-radius: 50%;
                    background: #fff; color: #16a34a;
                    font-size: 14px; font-weight: 900;
                    display: flex; align-items: center; justify-content: center;
                    box-shadow: 0 4px 10px rgba(0,0,0,0.2);
                    transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }
                .ec-mode-card.active .ec-mode-check {
                    transform: scale(1.2) rotate(10deg);
                }
                /* Amount selector */
                .ec-amounts {
                    display: flex;
                    gap: 8px;
                    justify-content: center;
                    margin-bottom: 24px;
                }
                .ec-amount-btn {
                    width: 58px; height: 44px;
                    border-radius: 12px;
                    font-weight: 800; font-size: 1rem;
                    border: 2.5px solid rgba(255,255,255,0.3);
                    background: rgba(255,255,255,0.1);
                    color: rgba(255,255,255,0.7);
                    cursor: pointer;
                    transition: all 0.15s;
                }
                .ec-amount-btn.active {
                    background: #fff;
                    color: #46178f;
                    border-color: #fff;
                    box-shadow: 0 4px 20px rgba(255,255,255,0.3);
                    transform: scale(1.08);
                }
                .ec-amount-btn:hover:not(.active) { background: rgba(255,255,255,0.2); color: #fff; }
                /* Big start button */
                .ec-start-btn {
                    width: 100%;
                    padding: 20px;
                    border-radius: 20px;
                    border: none;
                    background: linear-gradient(135deg,#ffcc00,#ff9800);
                    color: #1a0533;
                    font-weight: 900;
                    font-size: 1.25rem;
                    font-family: 'Nunito','Sarabun',sans-serif;
                    cursor: pointer;
                    box-shadow: 0 8px 32px rgba(255,200,0,0.45);
                    transition: transform 0.18s cubic-bezier(.34,1.6,.64,1), box-shadow 0.18s, filter 0.18s;
                    display: flex; align-items: center; justify-content: center; gap: 10px;
                    margin-bottom: 16px;
                }
                .ec-start-btn:hover:not(:disabled) {
                    transform: translateY(-4px) scale(1.02);
                    box-shadow: 0 16px 48px rgba(255,200,0,0.6);
                    filter: brightness(1.05);
                }
                .ec-start-btn:active:not(:disabled) { transform: scale(0.97); }
                .ec-start-btn:disabled { opacity: 0.6; cursor: not-allowed; }
                .ec-spinner {
                    width: 22px; height: 22px;
                    border: 3px solid rgba(0,0,0,0.2);
                    border-top-color: #1a0533;
                    border-radius: 50%;
                    animation: ecSpin 0.7s linear infinite;
                }
                /* Advanced toggle */
                .ec-adv-toggle {
                    width: 100%;
                    background: rgba(255,255,255,0.1);
                    border: 2px solid rgba(255,255,255,0.25);
                    color: rgba(255,255,255,0.8);
                    border-radius: 14px;
                    padding: 12px;
                    font-weight: 700; font-size: 0.88rem;
                    cursor: pointer;
                    transition: background 0.15s, color 0.15s;
                    display: flex; align-items: center; justify-content: center; gap: 8px;
                }
                .ec-adv-toggle:hover { background: rgba(255,255,255,0.18); color: #fff; }
                /* Advanced panel — glassmorphism */
                .ec-adv-panel {
                    margin-top: 14px;
                    background: rgba(255, 255, 255, 0.05);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.15);
                    border-top: 1px solid rgba(255, 255, 255, 0.3);
                    border-left: 1px solid rgba(255, 255, 255, 0.3);
                    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.2);
                    border-radius: 24px;
                    padding: 24px 20px;
                    animation: ecPanelDown 0.3s ease both;
                }
                .ec-adv-label {
                    display: block;
                    font-size: 0.75rem;
                    font-weight: 800;
                    color: rgba(255, 255, 255, 0.9);
                    margin-bottom: 6px;
                    letter-spacing: 0.5px;
                    text-transform: uppercase;
                }
                .ec-adv-select, .ec-adv-input {
                    width: 100%;
                    border: 1px solid rgba(255, 255, 255, 0.15);
                    border-radius: 12px;
                    padding: 11px 14px;
                    font-size: 0.92rem;
                    font-weight: 700;
                    color: #fff;
                    background: rgba(255, 255, 255, 0.08);
                    transition: border-color 0.15s, background 0.15s;
                    outline: none;
                    font-family: 'Sarabun','Nunito',sans-serif;
                }
                .ec-adv-select option { background: #46178f; color: #fff; }
                .ec-adv-select:focus, .ec-adv-input:focus {
                    border-color: #fff;
                    background: rgba(255, 255, 255, 0.15);
                }
                .ec-adv-select:disabled { opacity: 0.35; cursor: not-allowed; }
                .ec-adv-submit {
                    width: 100%;
                    padding: 15px;
                    border-radius: 16px;
                    border: none;
                    background: linear-gradient(135deg,#a855f7,#7c3aed);
                    color: #fff;
                    font-weight: 900;
                    font-size: 1.05rem;
                    cursor: pointer;
                    font-family: 'Nunito','Sarabun',sans-serif;
                    box-shadow: 0 8px 30px rgba(168,85,247,0.5);
                    transition: transform 0.18s cubic-bezier(.34,1.6,.64,1), box-shadow 0.18s;
                    margin-top: 20px;
                    letter-spacing: 0.3px;
                }
                .ec-adv-submit:hover { transform: translateY(-3px) scale(1.01); box-shadow: 0 14px 40px rgba(168,85,247,0.65); }
                .ec-premium-badge {
                    font-size: 0.6rem; font-weight: 800;
                    background: linear-gradient(135deg,#fbbf24,#f59e0b);
                    color: #1a0533;
                    border-radius: 5px; padding: 2px 6px;
                    vertical-align: middle; margin-left: 5px;
                    letter-spacing: 0.5px;
                }
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


                <div className="ec-card">
                    {/* Title */}
                    <div className="ec-title">🎯 เลือกโหมดสอบ</div>
                    <div className="ec-sub">Solo Exam — ทำคนเดียว ได้ทุกที่</div>

                    {/* Mode selector */}
                    <div className="ec-modes">
                        {MODE_OPTIONS.map(m => (
                            <div
                                key={m.id}
                                className={`ec-mode-card ${mode === m.id ? 'active' : ''}`}
                                style={{ 
                                    background: m.bg,
                                    boxShadow: mode === m.id 
                                        ? `0 8px 0 ${m.shadow}, 0 15px 30px rgba(0,0,0,0.3)` 
                                        : `0 6px 0 ${m.shadow}`
                                }}
                                onClick={() => setMode(m.id)}
                            >
                                {mode === m.id && <div className="ec-mode-check">✓</div>}
                                <div className="ec-mode-emoji">{m.emoji}</div>
                                <div className="ec-mode-label">{m.label}</div>
                                <div className="ec-mode-sub">{m.sub}</div>
                            </div>
                        ))}
                    </div>

                    {/* Question amount or Exam Set Selector depending on mode */}
                    {mode !== 'simulation' ? (
                        <>
                            <div style={{ textAlign:'center', marginBottom:10, color:'rgba(255,255,255,0.6)', fontSize:'0.78rem', fontWeight:700, letterSpacing:1, textTransform:'uppercase' }}>
                                จำนวนข้อ
                            </div>
                            <div className="ec-amounts">
                                {QUICK_AMOUNTS.map(n => (
                                    <button
                                        key={n}
                                        className={`ec-amount-btn ${quickAmount === n ? 'active' : ''}`}
                                        onClick={() => setQuickAmount(n)}
                                    >
                                        {n}
                                    </button>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div style={{ marginBottom: 24, padding: '0 16px' }}>
                            <div style={{ textAlign:'center', marginBottom:10, color:'rgba(255,255,255,0.6)', fontSize:'0.78rem', fontWeight:700, letterSpacing:1, textTransform:'uppercase' }}>
                                เลือกชุดข้อสอบ
                            </div>
                            <select 
                                name="exam_set" 
                                value={config.exam_set} 
                                onChange={handleChange} 
                                className="ec-adv-select"
                                style={{ width: '100%', padding: '14px', borderRadius: '16px', background: 'rgba(255,255,255,0.15)', color: '#fff', fontSize: '1rem', fontWeight: 'bold' }}
                            >
                                <option value="" style={{ color: '#000' }}>-- กรุณาเลือกชุดข้อสอบ --</option>
                                {examSetsMeta.map((s,i) => (
                                    <option key={`meta-${i}`} value={s.name} style={{ color: '#000' }}>
                                        {s.name} {s.is_korpor_format ? '(ก.พ.)' : ''} {s.total_questions ? `(${s.total_questions} ข้อ)` : ''}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Animation toggle */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '16px', color: '#fff', fontSize: '0.9rem', fontWeight: 600 }}>
                        <input 
                            type="checkbox" 
                            id="anim-toggle" 
                            checked={!disableAnimation}
                            onChange={(e) => setDisableAnimation(!e.target.checked)}
                            style={{ width: '16px', height: '16px', accentColor: '#ffcc00', cursor: 'pointer' }}
                        />
                        <label htmlFor="anim-toggle" style={{ cursor: 'pointer' }}>เปิดใช้งานแอนิเมชันตอนตอบ</label>
                    </div>

                    {/* Start button */}
                    <button
                        className="ec-start-btn"
                        onClick={handleQuickStart}
                        disabled={loading}
                    >
                        {loading
                            ? <><div className="ec-spinner"/> กำลังโหลด...</>
                            : <>🚀 &nbsp;เริ่มสอบเลย!{mode !== 'simulation' && <span style={{ opacity:0.6, fontSize:'0.9rem' }}> &nbsp;({quickAmount} ข้อ)</span>}</>
                        }
                    </button>

                    {/* Advanced toggle */}
                    {mode !== 'simulation' && (
                        <button
                            className="ec-adv-toggle"
                            onClick={() => setShowAdvanced(v => !v)}
                        >
                            <span style={{ fontSize:'1rem' }}>{showAdvanced ? '▲' : '⚙️'}</span>
                            {showAdvanced ? 'ซ่อนตัวกรอง' : 'ตั้งค่าเอง (ขั้นสูง)'}
                        </button>
                    )}

                    {/* Advanced panel */}
                    {showAdvanced && mode !== 'simulation' && (
                        <div className="ec-adv-panel">
                            <form onSubmit={handleAdvancedSubmit}>
                                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                                    {/* Subject */}
                                    <div style={{ gridColumn:'1/-1' }}>
                                        <label className="ec-adv-label">วิชา</label>
                                        <select name="subject" value={config.subject} onChange={handleChange} className="ec-adv-select">
                                            <option value="">ทั้งหมด</option>
                                            {subjects.map((s,i) => <option key={i} value={s}>{s}</option>)}
                                        </select>
                                    </div>
                                    {/* Category */}
                                    <div style={{ gridColumn:'1/-1' }}>
                                        <label className="ec-adv-label">หมวดหมู่</label>
                                        <select name="category" value={config.category} onChange={handleChange} className="ec-adv-select">
                                            <option value="">ทั้งหมด</option>
                                            {categories.map((c,i) => (
                                                <option key={i} value={c}>
                                                    {c === 'local_gov' ? 'ความรู้พื้นฐานในการปฏิบัติราชการ' : c}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    {/* Year */}
                                    <div>
                                        <label className="ec-adv-label">
                                            ปีข้อสอบ
                                            {!isPremium && <span className="ec-premium-badge">PREMIUM</span>}
                                        </label>
                                        <select name="exam_year" value={config.exam_year} onChange={handleChange} disabled={!isPremium} className="ec-adv-select">
                                            <option value="">ทั้งหมด</option>
                                            {years.map((y,i) => <option key={i} value={y}>{y}</option>)}
                                        </select>
                                    </div>
                                    {/* Set */}
                                    <div>
                                        <label className="ec-adv-label">
                                            ชุดข้อสอบ
                                            {!isPremium && <span className="ec-premium-badge">PREMIUM</span>}
                                        </label>
                                        <select name="exam_set" value={config.exam_set} onChange={handleChange} disabled={!isPremium} className="ec-adv-select">
                                            <option value="">ทั้งหมด</option>
                                            {examSetsMeta.map((s,i) => (
                                                <option key={`meta-${i}`} value={s.name}>
                                                    {s.name} {s.is_korpor_format ? '(ก.พ.)' : ''}
                                                </option>
                                            ))}
                                            {sets.filter(s => !examSetsMeta.find(m => m.name === s)).map((s,i) => (
                                                <option key={`old-${i}`} value={s}>
                                                    {s.trim() === 'Mock Exam' ? 'แนวข้อสอบ' : (s.trim() === 'Real Exam' || s.trim() === 'Past Exam') ? 'ข้อสอบจริง' : s}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    {/* Limit */}
                                    <div style={{ gridColumn:'1/-1' }}>
                                        <label className="ec-adv-label">จำนวนข้อ</label>
                                        <input type="number" name="limit" value={config.limit} onChange={handleChange} min="5" max="100" className="ec-adv-input"/>
                                    </div>
                                </div>
                                <button type="submit" className="ec-adv-submit">
                                    🎯 เริ่มสอบด้วยตัวกรองนี้
                                </button>
                            </form>
                        </div>
                    )}

                    <div style={{ marginTop:28, textAlign:'center', color:'rgba(255,255,255,0.25)', fontSize:'0.72rem', fontWeight:600 }}>
                        © {new Date().getFullYear()} PreExam
                    </div>
                </div>
            </div>
        </>
    );
}
