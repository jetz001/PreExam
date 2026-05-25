import React, { useState, useEffect } from 'react';
import { Lock } from 'lucide-react';
import useUserRole from '../../hooks/useUserRole'; // Updated import path
import api from '../../services/api';

const CreateRoomModal = ({ isOpen, onClose, onCreate }) => {
    const { isPremium } = useUserRole();
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
        theme: { background_id: null, frame_id: null }
    });

    const [subjects, setSubjects] = useState([]);
    const [categories, setCategories] = useState([]);
    const [years, setYears] = useState([]);
    const [sets, setSets] = useState([]);
    const [assets, setAssets] = useState({ backgrounds: [], frames: [] });

    useEffect(() => {
        if (isOpen) {
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

            // Always fetch years/sets (to show as disabled options for free users)
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
        onCreate(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-[100] p-4" style={{ background: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(5px)' }}>
            <style>{`
                .crm-input {
                    width: 100%; 
                    border: 2px solid #e0e0e0; 
                    border-radius: 16px; 
                    padding: 14px 20px;
                    background: #f2f2f2; 
                    font-weight: 800; 
                    color: #333; 
                    transition: all 0.2s; 
                    outline: none;
                    font-size: 1rem;
                }
                .crm-input::placeholder { color: #aaa; }
                .crm-input:focus { 
                    border-color: #46178f; 
                    background: #fff; 
                    box-shadow: 0 0 0 4px rgba(70, 23, 143, 0.1); 
                }
                .crm-label { 
                    display: flex; 
                    align-items: center; 
                    gap: 8px; 
                    font-size: 0.95rem; 
                    font-weight: 800; 
                    color: #555; 
                    margin-bottom: 8px; 
                }
                .crm-btn {
                    padding: 16px 32px; 
                    border-radius: 16px; 
                    font-weight: 900; 
                    cursor: pointer; 
                    transition: all 0.1s; 
                    border: none; 
                    display: flex; 
                    align-items: center; 
                    justify-content: center; 
                    gap: 12px; 
                    width: 100%;
                    font-size: 1.2rem;
                }
                .crm-btn-primary { 
                    background: #00c985; 
                    color: white; 
                    box-shadow: 0 6px 0 #009e69; 
                }
                .crm-btn-primary:active { 
                    transform: translateY(6px); 
                    box-shadow: 0 0 0 #009e69; 
                }
                .crm-number-wrapper { 
                    position: relative; 
                    display: flex; 
                    align-items: center; 
                    background: #f2f2f2; 
                    border: 2px solid #e0e0e0; 
                    border-radius: 16px; 
                    padding: 6px; 
                }
                .crm-number-wrapper:focus-within {
                    border-color: #46178f;
                    background: #fff;
                }
                .crm-number-wrapper input { 
                    width: 100%; 
                    background: transparent; 
                    border: none; 
                    text-align: center; 
                    color: #333; 
                    font-weight: 900; 
                    outline: none; 
                    font-size: 1.2rem; 
                }
                .crm-number-btn { 
                    width: 40px; 
                    height: 40px; 
                    border-radius: 12px; 
                    border: none; 
                    background: #1368ce; 
                    color: white; 
                    font-weight: 900; 
                    cursor: pointer; 
                    transition: 0.1s; 
                    display: flex; 
                    align-items: center; 
                    justify-content: center; 
                    font-size: 1.5rem; 
                    box-shadow: 0 4px 0 #0e55a3;
                }
                .crm-number-btn:active { 
                    transform: translateY(4px); 
                    box-shadow: 0 0 0 #0e55a3; 
                }
                .crm-number-btn.btn-red {
                    background: #e21b3c;
                    box-shadow: 0 4px 0 #b3142e;
                }
                .crm-number-btn.btn-red:active {
                    box-shadow: 0 0 0 #b3142e;
                }
                input[type=number]::-webkit-inner-spin-button, 
                input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
            `}</style>
            
            {/* Playful Floating Shapes behind modal */}
            <div className="absolute top-10 right-10 text-6xl opacity-50 animate-pulse pointer-events-none">✨</div>
            <div className="absolute bottom-10 left-10 text-7xl opacity-50 animate-bounce pointer-events-none">⭐</div>

            <div className="relative rounded-[32px] shadow-[0_12px_40px_rgba(0,0,0,0.3)] w-full max-w-lg p-8 max-h-[90vh] overflow-y-auto custom-scrollbar bg-white">
                <div className="flex items-center gap-4 mb-8 relative">
                    <div className="w-16 h-16 bg-[#46178f] rounded-[20px] flex items-center justify-center text-3xl shadow-[0_4px_0_#2d0d6b] rotate-[-5deg]">🎮</div>
                    <div>
                        <h2 className="text-3xl font-black text-[#333] tracking-tight">สร้างห้องสอบใหม่</h2>
                        <p className="text-gray-500 text-sm font-bold mt-1">ตั้งค่าห้องสอบสุดมันส์ของคุณ ✨</p>
                    </div>
                    <button onClick={onClose} className="absolute right-0 top-0 w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-500 font-bold text-2xl transition-all shadow-sm">&times;</button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="crm-label">💬 ชื่อห้อง</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="crm-input"
                            placeholder="ตั้งชื่อห้องเก๋ๆ ของคุณ..."
                            required
                        />
                    </div>
                    <div>
                        <label className="crm-label">🔥 โหมด</label>
                        <select
                            value={formData.mode}
                            onChange={(e) => setFormData({ ...formData, mode: e.target.value })}
                            className="crm-input"
                        >
                            <option value="exam">🔥 โหมดสอบ (แข่งขัน)</option>
                            <option value="tutor">📚 โหมดติว (เน้นเรียนรู้)</option>
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="crm-label">📚 วิชา</label>
                            <select
                                value={formData.subject}
                                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                className="crm-input"
                            >
                                <option value="">เลือกวิชา</option>
                                {subjects.map(s => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="crm-label">📁 หมวดหมู่</label>
                            <select
                                value={formData.category || ''}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="crm-input"
                            >
                                <option value="">เลือกหมวดหมู่</option>
                                {categories.map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <label className="crm-label !mb-0">📅 ปีข้อสอบ</label>
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-sm">PREMIUM</span>
                            </div>
                            <select
                                value={formData.exam_year}
                                onChange={(e) => setFormData({ ...formData, exam_year: e.target.value })}
                                disabled={!isPremium}
                                className={`crm-input ${!isPremium ? 'opacity-60 cursor-not-allowed bg-white/10' : ''}`}
                            >
                                <option value="">ทั้งหมด</option>
                                {years.map(y => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <label className="crm-label !mb-0">📑 ชุดข้อสอบ</label>
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-sm">PREMIUM</span>
                            </div>
                            <select
                                value={formData.exam_set}
                                onChange={(e) => setFormData({ ...formData, exam_set: e.target.value })}
                                disabled={!isPremium}
                                className={`crm-input ${!isPremium ? 'opacity-60 cursor-not-allowed bg-white/10' : ''}`}
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
                    <div>
                        <label className="crm-label">🎯 จำนวนข้อ</label>
                        <div className="crm-number-wrapper">
                            <button type="button" className="crm-number-btn btn-red" onClick={() => setFormData(prev => ({ ...prev, question_count: Math.max(5, prev.question_count - 1) }))}>-</button>
                            <input
                                type="number"
                                value={formData.question_count}
                                onChange={(e) => setFormData({ ...formData, question_count: e.target.value === '' ? '' : parseInt(e.target.value) })}
                                min="5"
                                max="100"
                            />
                            <button type="button" className="crm-number-btn" onClick={() => setFormData(prev => ({ ...prev, question_count: Math.min(100, prev.question_count + 1) }))}>+</button>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="crm-label">👥 ผู้เข้าสอบ (สูงสุด 20)</label>
                            <div className="crm-number-wrapper">
                                <button type="button" className="crm-number-btn btn-red" onClick={() => setFormData(prev => ({ ...prev, max_participants: Math.max(1, prev.max_participants - 1) }))}>-</button>
                                <input
                                    type="number"
                                    value={formData.max_participants}
                                    onChange={(e) => setFormData({ ...formData, max_participants: e.target.value === '' ? '' : parseInt(e.target.value) })}
                                    min="1"
                                    max="20"
                                />
                                <button type="button" className="crm-number-btn" onClick={() => setFormData(prev => ({ ...prev, max_participants: Math.min(20, prev.max_participants + 1) }))}>+</button>
                            </div>
                        </div>
                        <div>
                            <label className="crm-label">⏱️ เวลาที่ใช้สอบ (นาที)</label>
                            <div className="crm-number-wrapper">
                                <button type="button" className="crm-number-btn btn-red" onClick={() => setFormData(prev => ({ ...prev, time_limit: Math.max(5, prev.time_limit - 1) }))}>-</button>
                                <input
                                    type="number"
                                    value={formData.time_limit}
                                    onChange={(e) => setFormData({ ...formData, time_limit: e.target.value === '' ? '' : parseInt(e.target.value) })}
                                    min="5"
                                    max="60"
                                />
                                <button type="button" className="crm-number-btn" onClick={() => setFormData(prev => ({ ...prev, time_limit: Math.min(60, prev.time_limit + 1) }))}>+</button>
                            </div>
                        </div>
                    </div>

                    {/* Theme Selection */}
                    <div className="border-t-2 border-dashed border-gray-200 pt-6 mt-4">
                        <h3 className="text-xl font-black mb-4 text-[#333] flex items-center gap-2 drop-shadow-sm">🎨 ปรับแต่งห้อง <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-[#ffcc00] text-[#333] shadow-sm">PREMIUM</span></h3>
                        <div className="space-y-5">
                            {/* Backgrounds */}
                            <div>
                                <label className="crm-label">🌌 พื้นหลัง</label>
                                <div className="flex space-x-3 overflow-x-auto p-2 -mx-2 custom-scrollbar">
                                    <div
                                        onClick={() => setFormData(prev => ({ ...prev, theme: { ...prev.theme, background_id: null } }))}
                                        className={`flex-shrink-0 w-20 h-20 border-4 rounded-2xl cursor-pointer flex items-center justify-center bg-gray-100 font-bold text-gray-500 transition-all ${!formData.theme?.background_id ? 'border-[#46178f] scale-105 shadow-[0_4px_10px_rgba(70,23,143,0.3)]' : 'border-transparent hover:bg-gray-200'}`}
                                    >
                                        ไม่มี
                                    </div>
                                    {assets.backgrounds.map(bg => (
                                        <div
                                            key={bg.id}
                                            onClick={() => {
                                                if (!isPremium) {
                                                    alert('Premium Feature: Upgrade to customize your room background.');
                                                    return;
                                                }
                                                setFormData(prev => ({ ...prev, theme: { ...prev.theme, background_id: bg.id } }));
                                            }}
                                            className={`relative flex-shrink-0 w-20 h-20 border-4 rounded-2xl cursor-pointer overflow-hidden group transition-all ${formData.theme?.background_id === bg.id ? 'border-[#46178f] scale-105 shadow-[0_4px_10px_rgba(70,23,143,0.3)]' : 'border-transparent hover:opacity-80'}`}
                                        >
                                            <img src={bg.url.startsWith('http') ? bg.url : bg.url} alt={bg.name} className="w-full h-full object-cover" />
                                            {!isPremium && (
                                                <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center backdrop-blur-[1px]">
                                                    <Lock className="text-white w-6 h-6" />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Frames */}
                            <div>
                                <label className="crm-label">🖼️ กรอบรูป</label>
                                <div className="flex space-x-3 overflow-x-auto p-2 -mx-2 custom-scrollbar">
                                    <div
                                        onClick={() => setFormData(prev => ({ ...prev, theme: { ...prev.theme, frame_id: null } }))}
                                        className={`flex-shrink-0 w-20 h-20 border-4 rounded-2xl cursor-pointer flex items-center justify-center bg-gray-100 font-bold text-gray-500 transition-all ${!formData.theme?.frame_id ? 'border-[#46178f] scale-105 shadow-[0_4px_10px_rgba(70,23,143,0.3)]' : 'border-transparent hover:bg-gray-200'}`}
                                    >
                                        ไม่มี
                                    </div>
                                    {assets.frames.map(frm => (
                                        <div
                                            key={frm.id}
                                            onClick={() => {
                                                if (!isPremium) {
                                                    alert('Premium Feature: Upgrade to customize your room frame.');
                                                    return;
                                                }
                                                setFormData(prev => ({ ...prev, theme: { ...prev.theme, frame_id: frm.id } }));
                                            }}
                                            className={`relative flex-shrink-0 w-20 h-20 border-4 rounded-2xl cursor-pointer overflow-hidden p-2 transition-all bg-gray-50 ${formData.theme?.frame_id === frm.id ? 'border-[#46178f] scale-105 shadow-[0_4px_10px_rgba(70,23,143,0.3)]' : 'border-transparent hover:bg-gray-100'}`}
                                        >
                                            <div className="absolute inset-0 border-[6px]" style={{ borderImage: `url(${frm.url.startsWith('http') ? frm.url : frm.url}) 30 round` }}></div>
                                            {!isPremium && (
                                                <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center z-10 backdrop-blur-[1px]">
                                                    <Lock className="text-white w-6 h-6" />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 pt-4">
                        <button
                            type="submit"
                            className="crm-btn crm-btn-primary"
                        >
                            🚀 สร้างห้องสอบเลย! ✨
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateRoomModal;
