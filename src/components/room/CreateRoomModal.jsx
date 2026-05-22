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
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <style>{`
                .crm-input {
                    width: 100%; border: 2px solid #e5e7eb; border-radius: 16px; padding: 12px 16px;
                    background: #f9fafb; font-weight: 700; color: #1f2937; transition: all 0.2s; outline: none;
                }
                .crm-input:focus { border-color: #46178f; background: #fff; box-shadow: 0 0 0 4px rgba(70,23,143,0.1); }
                .crm-label { display: block; font-size: 0.85rem; font-weight: 800; color: #4b5563; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px; }
                .crm-btn {
                    padding: 12px 24px; border-radius: 16px; font-weight: 900; cursor: pointer; transition: all 0.1s; border: none; display: flex; align-items: center; justify-content: center; gap: 8px;
                }
                .crm-btn-primary { background: #00c985; color: white; box-shadow: 0 6px 0 #009e69; }
                .crm-btn-primary:active { transform: translateY(6px); box-shadow: 0 0 0 #009e69; }
                .crm-btn-secondary { background: #e5e7eb; color: #4b5563; box-shadow: 0 6px 0 #d1d5db; }
                .crm-btn-secondary:active { transform: translateY(6px); box-shadow: 0 0 0 #d1d5db; }
            `}</style>
            
            <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-lg p-8 max-h-[90vh] overflow-y-auto custom-scrollbar border-4 border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center text-2xl shadow-sm border-2 border-purple-200">🎮</div>
                    <h2 className="text-2xl font-black text-gray-900">สร้างห้องสอบใหม่</h2>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="crm-label">ชื่อห้อง</label>
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
                        <label className="crm-label">โหมด</label>
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
                            <label className="crm-label">วิชา</label>
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
                            <label className="crm-label">หมวดหมู่</label>
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
                                <label className="crm-label !mb-0">ปีข้อสอบ</label>
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-sm">PREMIUM</span>
                            </div>
                            <select
                                value={formData.exam_year}
                                onChange={(e) => setFormData({ ...formData, exam_year: e.target.value })}
                                disabled={!isPremium}
                                className={`crm-input ${!isPremium ? 'opacity-60 cursor-not-allowed bg-gray-100 border-gray-200' : ''}`}
                            >
                                <option value="">ทั้งหมด</option>
                                {years.map(y => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <label className="crm-label !mb-0">ชุดข้อสอบ</label>
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-sm">PREMIUM</span>
                            </div>
                            <select
                                value={formData.exam_set}
                                onChange={(e) => setFormData({ ...formData, exam_set: e.target.value })}
                                disabled={!isPremium}
                                className={`crm-input ${!isPremium ? 'opacity-60 cursor-not-allowed bg-gray-100 border-gray-200' : ''}`}
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
                        <label className="crm-label">จำนวนข้อ</label>
                        <input
                            type="number"
                            value={formData.question_count}
                            onChange={(e) => setFormData({ ...formData, question_count: e.target.value === '' ? '' : parseInt(e.target.value) })}
                            className="crm-input"
                            min="5"
                            max="100"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="crm-label">จำนวนผู้เข้าสอบ (สูงสุด 20)</label>
                            <input
                                type="number"
                                value={formData.max_participants}
                                onChange={(e) => setFormData({ ...formData, max_participants: e.target.value === '' ? '' : parseInt(e.target.value) })}
                                className="crm-input"
                                min="1"
                                max="20"
                            />
                        </div>
                        <div>
                            <label className="crm-label">เวลาที่ใช้สอบ (นาที)</label>
                            <input
                                type="number"
                                value={formData.time_limit}
                                onChange={(e) => setFormData({ ...formData, time_limit: e.target.value === '' ? '' : parseInt(e.target.value) })}
                                className="crm-input"
                                min="5"
                                max="60"
                            />
                        </div>
                    </div>

                    {/* Theme Selection */}
                    <div className="border-t-2 border-dashed border-gray-200 pt-6 mt-4">
                        <h3 className="text-lg font-black mb-4 text-gray-900 flex items-center gap-2">🎨 ปรับแต่งห้อง <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-sm">PREMIUM</span></h3>
                        <div className="space-y-5">
                            {/* Backgrounds */}
                            <div>
                                <label className="crm-label">พื้นหลัง</label>
                                <div className="flex space-x-3 overflow-x-auto p-2 -mx-2 custom-scrollbar">
                                    <div
                                        onClick={() => setFormData(prev => ({ ...prev, theme: { ...prev.theme, background_id: null } }))}
                                        className={`flex-shrink-0 w-20 h-20 border-4 rounded-2xl cursor-pointer flex items-center justify-center bg-gray-100 font-bold text-gray-500 transition-all ${!formData.theme?.background_id ? 'border-primary scale-105 shadow-md' : 'border-transparent hover:bg-gray-200'}`}
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
                                            className={`relative flex-shrink-0 w-20 h-20 border-4 rounded-2xl cursor-pointer overflow-hidden group transition-all ${formData.theme?.background_id === bg.id ? 'border-primary scale-105 shadow-md' : 'border-transparent hover:opacity-80'}`}
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
                                <label className="crm-label">กรอบรูป</label>
                                <div className="flex space-x-3 overflow-x-auto p-2 -mx-2 custom-scrollbar">
                                    <div
                                        onClick={() => setFormData(prev => ({ ...prev, theme: { ...prev.theme, frame_id: null } }))}
                                        className={`flex-shrink-0 w-20 h-20 border-4 rounded-2xl cursor-pointer flex items-center justify-center bg-gray-100 font-bold text-gray-500 transition-all ${!formData.theme?.frame_id ? 'border-primary scale-105 shadow-md' : 'border-transparent hover:bg-gray-200'}`}
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
                                            className={`relative flex-shrink-0 w-20 h-20 border-4 rounded-2xl cursor-pointer overflow-hidden p-2 transition-all bg-gray-50 ${formData.theme?.frame_id === frm.id ? 'border-primary scale-105 shadow-md' : 'border-transparent hover:bg-gray-100'}`}
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

                    <div className="flex justify-end gap-3 mt-8 pt-4 border-t-2 border-gray-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="crm-btn crm-btn-secondary"
                        >
                            ยกเลิก
                        </button>
                        <button
                            type="submit"
                            className="crm-btn crm-btn-primary"
                        >
                            🚀 สร้างห้องสอบเลย!
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateRoomModal;
