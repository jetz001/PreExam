import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit2, Trash2, Check, X, Layers, Crown, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import adminApi from '../../services/adminApi';

const PREDEFINED_FEATURES = {
    no_ads: 'ปลอดโฆษณา (No Ads)',
    custom_lobby_bg: 'เปลี่ยนพื้นหลังล๊อบบี้ (Custom Lobby Background)',
    custom_card_bg: 'เปลี่ยนพื้นหลังการ์ดห้อง (Custom Room Card Background)',
    create_rooms: 'สร้างห้องได้ (Create Rooms)',
    unlock_exam_filters: 'ปลดล๊อคฟิลเตอร์ปีและชุดข้อสอบ (Unlock Exam Filters)'
};

const PaymentPlanManager = () => {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState(null);
    const [formData, setFormData] = useState({ name: '', price: 0, duration_days: 30, features: [] });

    useEffect(() => {
        if (!isModalOpen) return undefined;
        const onKeyDown = (e) => {
            if (e.key === 'Escape') closeModal();
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [isModalOpen]);

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

    const isSaving = createMutation.isPending || createMutation.isLoading || updateMutation.isPending || updateMutation.isLoading;

    if (isLoading) {
        return (
            <div className="rounded-2xl bg-white/90 backdrop-blur-sm border border-slate-200/80 p-10 text-center text-slate-500 flex flex-col items-center gap-3">
                <Loader2 size={28} className="animate-spin text-indigo-600" />
                <span className="text-sm font-medium">กำลังโหลดข้อมูลแพ็กเกจ...</span>
            </div>
        );
    }

    return (
        <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white/90 backdrop-blur-sm p-5 rounded-2xl shadow-sm border border-slate-200/80">
                <div className="flex items-center gap-3.5">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-500/20">
                        <Layers size={20} />
                    </div>
                    <div>
                        <h3 className="text-lg font-extrabold text-slate-900">
                            จัดการแพ็กเกจสมาชิก (Payment Plans)
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                            กำหนดราคา ระยะเวลา และสิทธิประโยชน์สำหรับสมาชิกพรีเมียม
                        </p>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={() => openModal()}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-indigo-500/20 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                >
                    <Plus size={18} />
                    <span>เพิ่มแพ็กเกจใหม่</span>
                </button>
            </div>

            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50/90 text-slate-700 border-b border-slate-200/80 text-xs uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4 font-bold">ชื่อแพ็กเกจ</th>
                                <th className="px-6 py-4 font-bold">ราคา (THB)</th>
                                <th className="px-6 py-4 font-bold">ระยะเวลา (วัน)</th>
                                <th className="px-6 py-4 font-bold">ฟีเจอร์</th>
                                <th className="px-6 py-4 font-bold text-right">ดำเนินการ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {plans.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-slate-500 font-medium">
                                        ไม่มีแพ็กเกจในระบบ
                                    </td>
                                </tr>
                            ) : (
                                plans.map((plan) => (
                                    <tr key={plan.id} className="hover:bg-indigo-50/30 transition-colors">
                                        <td className="px-6 py-4 font-bold text-slate-900 whitespace-nowrap">
                                            <span className="inline-flex items-center gap-2">
                                                <Crown size={16} className="text-amber-500" />
                                                {plan.name}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-indigo-600 font-extrabold whitespace-nowrap">
                                            ฿{Number(plan.price ?? 0).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-700">
                                            {plan.duration_days} วัน
                                        </td>
                                        <td className="px-6 py-4 text-xs">
                                            <ul className="space-y-1">
                                                {(plan.features || []).map((f, i) => (
                                                    <li key={i} className="flex items-center gap-1.5 text-slate-600">
                                                        <Check size={13} className="text-emerald-600 flex-shrink-0" />
                                                        <span>{PREDEFINED_FEATURES[f] || f}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                                            <button
                                                type="button"
                                                onClick={() => openModal(plan)}
                                                aria-label={`แก้ไขแพ็กเกจ ${plan.name}`}
                                                title="แก้ไขแพ็กเกจ"
                                                className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl border border-indigo-200/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleDelete(plan.id)}
                                                aria-label={`ลบแพ็กเกจ ${plan.name}`}
                                                title="ลบแพ็กเกจ"
                                                className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl border border-rose-200/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
                    onClick={closeModal}
                >
                    <div
                        className="bg-white rounded-2xl shadow-2xl border border-slate-200/80 max-w-md w-full overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="px-6 py-4 border-b border-slate-200/80 flex justify-between items-center bg-slate-50/80">
                            <h3 className="font-bold text-lg text-slate-900">
                                {editingPlan ? 'แก้ไขแพ็กเกจ' : 'เพิ่มแพ็กเกจใหม่'}
                            </h3>
                            <button
                                type="button"
                                onClick={closeModal}
                                aria-label="ปิดหน้าต่าง"
                                className="p-1.5 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">
                                    ชื่อแพ็กเกจ (Name)
                                </label>
                                <input
                                    required
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 bg-slate-50/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
                                    placeholder="e.g. Pro Pass"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                                        ราคา (THB)
                                    </label>
                                    <input
                                        required
                                        type="number"
                                        min="0"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 bg-slate-50/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                                        ระยะเวลา (วัน)
                                    </label>
                                    <input
                                        required
                                        type="number"
                                        min="1"
                                        value={formData.duration_days}
                                        onChange={(e) => setFormData({ ...formData, duration_days: e.target.value })}
                                        className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 bg-slate-50/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    ฟีเจอร์ (Features)
                                </label>
                                <div className="space-y-2 border border-slate-200 rounded-xl p-4 bg-slate-50/70">
                                    {Object.entries(PREDEFINED_FEATURES).map(([key, label]) => (
                                        <label key={key} className="flex items-center gap-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                                                checked={(formData.features || []).includes(key)}
                                                onChange={(e) => {
                                                    const checked = e.target.checked;
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        features: checked
                                                            ? [...(prev.features || []), key]
                                                            : (prev.features || []).filter((f) => f !== key)
                                                    }));
                                                }}
                                            />
                                            <span className="text-sm text-slate-700">{label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div className="pt-4 flex justify-end gap-2.5 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                                >
                                    ยกเลิก
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl hover:from-indigo-700 hover:to-violet-700 shadow-sm disabled:opacity-60 transition-all"
                                >
                                    {isSaving && <Loader2 size={15} className="animate-spin" />}
                                    <span>{editingPlan ? 'บันทึกการแก้ไข' : 'สร้างแพ็กเกจ'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PaymentPlanManager;
