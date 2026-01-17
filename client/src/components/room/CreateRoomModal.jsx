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

            if (isPremium) {
                const [yearsRes, setsRes] = await Promise.all([
                    api.get('/questions/years').then(r => r.data),
                    api.get('/questions/sets').then(r => r.data)
                ]);
                if (yearsRes.success) setYears(yearsRes.data);
                if (setsRes.success) setSets(setsRes.data);
            }
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto custom-scrollbar">
                <h2 className="text-2xl font-bold mb-4 text-gray-900">สร้างห้องสอบใหม่</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">ชื่อห้อง</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="mt-1 w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900 placeholder-gray-400"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">โหมด</label>
                        <select
                            value={formData.mode}
                            onChange={(e) => setFormData({ ...formData, mode: e.target.value })}
                            className="mt-1 w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900"
                        >
                            <option value="exam">โหมดสอบ (แข่งขัน)</option>
                            <option value="tutor">โหมดติว (เน้นเรียนรู้)</option>
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">วิชา</label>
                            <select
                                value={formData.subject}
                                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                className="mt-1 w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900"
                            >
                                <option value="">เลือกวิชา</option>
                                {subjects.map(s => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">หมวดหมู่</label>
                            <select
                                value={formData.category || ''}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="mt-1 w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900"
                            >
                                <option value="">เลือกหมวดหมู่</option>
                                {categories.map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {isPremium && (
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <label className="block text-sm font-medium text-gray-700">ปีข้อสอบ</label>
                                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-600">PREMIUM</span>
                                </div>
                                <select
                                    value={formData.exam_year}
                                    onChange={(e) => setFormData({ ...formData, exam_year: e.target.value })}
                                    className="block w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900"
                                >
                                    <option value="">ทั้งหมด</option>
                                    {years.map(y => (
                                        <option key={y} value={y}>{y}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <label className="block text-sm font-medium text-gray-700">ชุดข้อสอบ</label>
                                </div>
                                <select
                                    value={formData.exam_set}
                                    onChange={(e) => setFormData({ ...formData, exam_set: e.target.value })}
                                    className="block w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900"
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
                    )}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">จำนวนข้อ</label>
                        <input
                            type="number"
                            value={formData.question_count}
                            onChange={(e) => setFormData({ ...formData, question_count: e.target.value === '' ? '' : parseInt(e.target.value) })}
                            className="mt-1 w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900"
                            min="5"
                            max="100"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">จำนวนผู้เข้าสอบสูงสุด (สูงสุด 20)</label>
                            <input
                                type="number"
                                value={formData.max_participants}
                                onChange={(e) => setFormData({ ...formData, max_participants: e.target.value === '' ? '' : parseInt(e.target.value) })}
                                className="mt-1 w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900"
                                min="1"
                                max="20"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">เวลาที่ใช้สอบ (นาที)</label>
                            <input
                                type="number"
                                value={formData.time_limit}
                                onChange={(e) => setFormData({ ...formData, time_limit: e.target.value === '' ? '' : parseInt(e.target.value) })}
                                className="mt-1 w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900"
                                min="5"
                                max="60"
                            />
                        </div>
                    </div>

                    {/* Theme Selection */}
                    <div className="border-t pt-4">
                        <h3 className="text-md font-semibold mb-2 text-gray-900">ปรับแต่งห้อง (Premium)</h3>
                        <div className="space-y-4">
                            {/* Backgrounds */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">พื้นหลัง</label>
                                <div className="flex space-x-2 overflow-x-auto p-1 custom-scrollbar">
                                    <div
                                        onClick={() => setFormData(prev => ({ ...prev, theme: { ...prev.theme, background_id: null } }))}
                                        className={`flex-shrink-0 w-16 h-16 border-2 rounded cursor-pointer flex items-center justify-center bg-gray-100 ${!formData.theme?.background_id ? 'border-primary' : 'border-transparent'}`}
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
                                            className={`relative flex-shrink-0 w-16 h-16 border-2 rounded cursor-pointer overflow-hidden group ${formData.theme?.background_id === bg.id ? 'border-primary' : 'border-transparent'}`}
                                        >
                                            <img src={bg.url.startsWith('http') ? bg.url : bg.url} alt={bg.name} className="w-full h-full object-cover" />
                                            {!isPremium && (
                                                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                                    <Lock className="text-white w-4 h-4" />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Frames */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">กรอบรูป</label>
                                <div className="flex space-x-2 overflow-x-auto p-1 custom-scrollbar">
                                    <div
                                        onClick={() => setFormData(prev => ({ ...prev, theme: { ...prev.theme, frame_id: null } }))}
                                        className={`flex-shrink-0 w-16 h-16 border-2 rounded cursor-pointer flex items-center justify-center bg-gray-100 ${!formData.theme?.frame_id ? 'border-primary' : 'border-transparent'}`}
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
                                            className={`relative flex-shrink-0 w-16 h-16 border-2 rounded cursor-pointer overflow-hidden p-2 ${formData.theme?.frame_id === frm.id ? 'border-primary' : 'border-transparent'}`}
                                        >
                                            <div className="absolute inset-0 border-4" style={{ borderImage: `url(${frm.url.startsWith('http') ? frm.url : frm.url}) 30 round` }}></div>
                                            {!isPremium && (
                                                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
                                                    <Lock className="text-white w-4 h-4" />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
                        >
                            ยกเลิก
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-700"
                        >
                            สร้างห้องสอบ
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateRoomModal;
