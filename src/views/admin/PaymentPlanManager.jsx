import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit2, Trash2, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';
import adminApi from '../../services/adminApi';

const PaymentPlanManager = () => {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState(null);
    const [formData, setFormData] = useState({ name: '', price: 0, duration_days: 30, features: '' });

    const { data: plans = [], isLoading } = useQuery({
        queryKey: ['paymentPlans'],
        queryFn: adminApi.getPaymentPlans
    });

    const createMutation = useMutation({
        mutationFn: adminApi.createPaymentPlan,
        onSuccess: () => {
            queryClient.invalidateQueries(['paymentPlans']);
            toast.success('Plan created successfully');
            closeModal();
        },
        onError: () => toast.error('Failed to create plan')
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => adminApi.updatePaymentPlan(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['paymentPlans']);
            toast.success('Plan updated successfully');
            closeModal();
        },
        onError: () => toast.error('Failed to update plan')
    });

    const deleteMutation = useMutation({
        mutationFn: adminApi.deletePaymentPlan,
        onSuccess: () => {
            queryClient.invalidateQueries(['paymentPlans']);
            toast.success('Plan deleted successfully');
        },
        onError: () => toast.error('Failed to delete plan')
    });

const PREDEFINED_FEATURES = {
    no_ads: "ปลอดโฆษณา (No Ads)",
    custom_lobby_bg: "เปลี่ยนพื้นหลังล๊อบบี้ (Custom Lobby Background)",
    custom_card_bg: "เปลี่ยนพื้นหลังการ์ดห้อง (Custom Room Card Background)",
    create_rooms: "สร้างห้องได้ (Create Rooms)",
    unlock_exam_filters: "ปลดล๊อคฟิลเตอร์ปีและชุดข้อสอบ (Unlock Exam Filters)"
};

    const openModal = (plan = null) => {
        if (plan) {
            setEditingPlan(plan);
            setFormData({
                name: plan.name || '',
                price: plan.price || 0,
                duration_days: plan.duration_days || 30,
                features: Array.isArray(plan.features) ? plan.features : []
            });
        } else {
            setEditingPlan(null);
            setFormData({ name: '', price: 0, duration_days: 30, features: [] });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingPlan(null);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const payload = {
            ...formData,
            price: Number(formData.price),
            duration_days: Number(formData.duration_days)
        };

        if (editingPlan) {
            updateMutation.mutate({ id: editingPlan.id, data: payload });
        } else {
            createMutation.mutate(payload);
        }
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this plan?')) {
            deleteMutation.mutate(id);
        }
    };

    if (isLoading) return <div className="text-center py-8">Loading plans...</div>;

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold text-slate-800">จัดการแพ็กเกจ (Payment Plans)</h3>
                <button
                    onClick={() => openModal()}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                >
                    <Plus size={18} />
                    เพิ่มแพ็กเกจใหม่
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4 font-semibold">ชื่อแพ็กเกจ</th>
                            <th className="px-6 py-4 font-semibold">ราคา (THB)</th>
                            <th className="px-6 py-4 font-semibold">ระยะเวลา (วัน)</th>
                            <th className="px-6 py-4 font-semibold">ฟีเจอร์</th>
                            <th className="px-6 py-4 font-semibold text-right">ดำเนินการ</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {plans.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-8 text-center text-slate-500">ไม่มีแพ็กเกจในระบบ</td>
                            </tr>
                        ) : (
                            plans.map(plan => (
                                <tr key={plan.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 font-medium text-slate-900">{plan.name}</td>
                                    <td className="px-6 py-4 text-indigo-600 font-bold">{plan.price}</td>
                                    <td className="px-6 py-4">{plan.duration_days} วัน</td>
                                    <td className="px-6 py-4 text-xs">
                                        <ul className="list-disc pl-4 space-y-1">
                                            {(plan.features || []).map((f, i) => (
                                                <li key={i}>{PREDEFINED_FEATURES[f] || f}</li>
                                            ))}
                                        </ul>
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        <button onClick={() => openModal(plan)} className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                                            <Edit2 size={16} />
                                        </button>
                                        <button onClick={() => handleDelete(plan.id)} className="p-2 text-red-600 hover:bg-red-50 rounded">
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h3 className="font-bold text-lg text-slate-800">{editingPlan ? 'แก้ไขแพ็กเกจ' : 'เพิ่มแพ็กเกจใหม่'}</h3>
                            <button onClick={closeModal} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">ชื่อแพ็กเกจ (Name)</label>
                                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500" placeholder="e.g. Pro Pass" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">ราคา (THB)</label>
                                    <input required type="number" min="0" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">ระยะเวลา (วัน)</label>
                                    <input required type="number" min="1" value={formData.duration_days} onChange={e => setFormData({...formData, duration_days: e.target.value})} className="w-full border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">ฟีเจอร์ (Features)</label>
                                <div className="space-y-2 border border-slate-200 rounded-lg p-4 bg-slate-50">
                                    {Object.entries(PREDEFINED_FEATURES).map(([key, label]) => (
                                        <label key={key} className="flex items-center gap-3 cursor-pointer">
                                            <input 
                                                type="checkbox" 
                                                className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                                                checked={(formData.features || []).includes(key)}
                                                onChange={(e) => {
                                                    const checked = e.target.checked;
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        features: checked 
                                                            ? [...(prev.features || []), key] 
                                                            : (prev.features || []).filter(f => f !== key)
                                                    }));
                                                }}
                                            />
                                            <span className="text-sm text-slate-700">{label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
                                <button type="button" onClick={closeModal} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">ยกเลิก</button>
                                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">{editingPlan ? 'บันทึกการแก้ไข' : 'สร้างแพ็กเกจ'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PaymentPlanManager;
