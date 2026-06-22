import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Layers, Plus, Edit2, Trash2, HelpCircle, X } from 'lucide-react';
import toast from 'react-hot-toast';
import adminApi from '../../services/adminApi';

const ExamSetManager = () => {
    const queryClient = useQueryClient();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isNoteOpen, setIsNoteOpen] = useState(false);
    const [editingSet, setEditingSet] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        is_korpor_format: false,
        education_level: 'bachelor',
        time_limit_minutes: 0,
        total_questions: 100
    });

    const { data: setsResponse, isLoading } = useQuery({
        queryKey: ['adminExamSets'],
        queryFn: adminApi.getExamSets
    });

    const { data: uniqueCatalogsResponse } = useQuery({
        queryKey: ['adminUniqueCatalogs'],
        queryFn: adminApi.getUniqueCatalogs
    });
    const uniqueCatalogs = uniqueCatalogsResponse?.data || [];

    const { data: catalogCountsResponse } = useQuery({
        queryKey: ['adminCatalogCounts'],
        queryFn: adminApi.getCatalogCounts
    });
    const catalogCounts = catalogCountsResponse?.data || {};

    const createMutation = useMutation({
        mutationFn: adminApi.createExamSet,
        onSuccess: () => {
            toast.success('Exam Set created successfully!');
            setIsCreateModalOpen(false);
            setFormData({ name: '', description: '', is_korpor_format: false, education_level: 'bachelor', time_limit_minutes: 0 });
            queryClient.invalidateQueries(['adminExamSets']);
        },
        onError: (error) => toast.error(error.response?.data?.message || 'Failed to create exam set')
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => adminApi.updateExamSet(id, data),
        onSuccess: () => {
            toast.success('Exam Set updated successfully!');
            setIsEditModalOpen(false);
            queryClient.invalidateQueries(['adminExamSets']);
        },
        onError: (error) => toast.error(error.response?.data?.message || 'Failed to update exam set')
    });

    const deleteMutation = useMutation({
        mutationFn: adminApi.deleteExamSet,
        onSuccess: () => {
            toast.success('Exam Set deleted successfully!');
            queryClient.invalidateQueries(['adminExamSets']);
        },
        onError: (error) => toast.error(error.response?.data?.message || 'Failed to delete exam set')
    });

    const sets = setsResponse?.data || [];

    const totalSelectedQuestions = (formData.rules?.catalogs || []).reduce((sum, catalog) => {
        return sum + (parseInt(formData.rules?.catalog_counts?.[catalog]) || 0);
    }, 0);
    const difference = formData.total_questions - totalSelectedQuestions;

    const getKorPorSummary = () => {
        let mathThai = 0;
        let law = 0;
        let eng = 0;
        const counts = formData.rules?.catalog_counts || {};
        const catalogs = formData.rules?.catalogs || [];
        catalogs.forEach(catalog => {
            const c = parseInt(counts[catalog]) || 0;
            const lower = catalog.toLowerCase();
            if (/[a-z]/.test(lower) || lower.includes('english') || lower.includes('อังกฤษ')) {
                eng += c;
            } else if (/พ\.ร\.บ|พ\.ร\.ฎ|ป\.อาญา|รัฐธรรมนูญ|กฎหมาย|จริยธรรม|ละเมิด|ราชการ/.test(lower)) {
                law += c;
            } else {
                mathThai += c;
            }
        });
        return { mathThai, law, eng };
    };
    const korPorSummary = getKorPorSummary();

    const handleAutoFillKorPor63 = () => {
        const template = {
            "อนุกรม": 5, "เลขทั่วไป": 5, "ตาราง": 5, "เงื่อนไขสัญลักษณ์": 10, "เงื่อนไขภาษา": 5,
            "เรียงประโยค": 5, "สรุปความ": 10, "อุปมาอุปไมย": 5, "พ.ร.บ.บริหารราชการแผ่นดิน": 6,
            "พ.ร.ฎ.กิจการบ้านเมืองที่ดี": 6, "พ.ร.บ.วิธีปฏิบัติราชการทางปกครอง": 6, "พ.ร.บ.มาตรฐานทางจริยธรรม": 3,
            "พ.ร.บ.ความรับผิดทางละเมิดฯ": 2, "ป.อาญา ความผิดต่อตำแหน่งหน้าที่": 2,
            "CONVERSATION": 5, "VOCABULARY": 5, "STRUCTURE": 5, "READING": 10
        };

        const newCounts = {};
        let actualTotal = 0;
        let newCatalogs = [];

        Object.entries(template).forEach(([cat, targetCount]) => {
            const available = catalogCounts[cat] || 0;
            const actualCount = Math.min(targetCount, available);
            if (actualCount > 0) {
                newCounts[cat] = actualCount;
                actualTotal += actualCount;
                newCatalogs.push(cat);
            }
        });

        setFormData(prev => ({
            ...prev,
            time_limit_minutes: 180,
            total_questions: 100,
            is_korpor_format: true,
            rules: {
                catalogs: newCatalogs,
                catalog_counts: newCounts
            }
        }));
        toast.success("ดึงรูปแบบอัตโนมัติ เรียบร้อยแล้ว (เฉพาะข้อที่มี)");
    };

    const handleCatalogToggle = (catalog) => {
        setFormData(prev => {
            const newCatalogs = prev.rules?.catalogs?.includes(catalog)
                ? prev.rules.catalogs.filter(c => c !== catalog)
                : [...(prev.rules?.catalogs || []), catalog];
            return { ...prev, rules: { ...(prev.rules || {}), catalogs: newCatalogs } };
        });
    };

    const handleCatalogCountChange = (catalog, count) => {
        const numCount = parseInt(count) || 0;
        const available = catalogCounts[catalog] || 0;
        const safeCount = Math.max(0, Math.min(numCount, available));
        setFormData(prev => ({
            ...prev,
            rules: {
                ...(prev.rules || {}),
                catalog_counts: { ...(prev.rules?.catalog_counts || {}), [catalog]: safeCount }
            }
        }));
    };

    const handleCreate = (e) => {
        e.preventDefault();
        createMutation.mutate(formData);
    };

    const handleUpdate = (e) => {
        e.preventDefault();
        updateMutation.mutate({ id: editingSet.id, data: formData });
    };

    const openEditModal = (set) => {
        setEditingSet(set);
        setFormData({
            name: set.name,
            description: set.description || '',
            is_korpor_format: Boolean(set.is_korpor_format),
            education_level: set.education_level || 'bachelor',
            time_limit_minutes: set.time_limit_minutes || 0,
            total_questions: set.total_questions || 100,
            rules: set.rules || { catalogs: [], catalog_counts: {} }
        });
        setIsEditModalOpen(true);
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this exam set?')) {
            deleteMutation.mutate(id);
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center">
                        <Layers className="w-8 h-8 mr-3 text-blue-600" />
                        Exam Set Manager
                    </h1>
                    <p className="text-slate-500 mt-2">Manage exam sets, Kor Por formatting, and grouped questions.</p>
                </div>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm text-sm font-medium flex items-center"
                >
                    <Plus size={16} className="mr-2" />
                    Create Set
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                            <th className="p-4 text-sm font-semibold text-slate-600">Name</th>
                            <th className="p-4 text-sm font-semibold text-slate-600">Description</th>
                            <th className="p-4 text-sm font-semibold text-slate-600">Kor Por Format</th>
                            <th className="p-4 text-sm font-semibold text-slate-600">Level</th>
                            <th className="p-4 text-sm font-semibold text-slate-600 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {isLoading ? (
                            <tr><td colSpan="5" className="p-8 text-center text-slate-500">Loading...</td></tr>
                        ) : sets.length === 0 ? (
                            <tr><td colSpan="5" className="p-8 text-center text-slate-500">No exam sets found.</td></tr>
                        ) : (
                            sets.map((set) => (
                                <tr key={set.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="p-4 font-medium text-slate-900">{set.name}</td>
                                    <td className="p-4 text-slate-500 text-sm">{set.description || '-'}</td>
                                    <td className="p-4">
                                        {set.is_korpor_format ? (
                                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">Yes</span>
                                        ) : (
                                            <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-full">No</span>
                                        )}
                                    </td>
                                    <td className="p-4 text-slate-500 text-sm">{set.education_level || '-'}</td>
                                    <td className="p-4 text-right">
                                        <button onClick={() => openEditModal(set)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg mr-2">
                                            <Edit2 size={16} />
                                        </button>
                                        <button onClick={() => handleDelete(set.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modals */}
            {(isCreateModalOpen || isEditModalOpen) && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="p-6 border-b border-slate-200">
                            <h2 className="text-xl font-bold text-slate-900">{isEditModalOpen ? 'Edit Exam Set' : 'Create Exam Set'}</h2>
                        </div>
                        <form onSubmit={isEditModalOpen ? handleUpdate : handleCreate} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Set Name (e.g. ก.พ. 67)</label>
                                <input
                                    required
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="is_korpor"
                                    checked={formData.is_korpor_format}
                                    onChange={(e) => setFormData({ ...formData, is_korpor_format: e.target.checked })}
                                    className="rounded text-blue-600 focus:ring-blue-500"
                                />
                                <label htmlFor="is_korpor" className="text-sm font-medium text-slate-700">Enable Kor Por Result Format</label>
                            </div>
                            {formData.is_korpor_format && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Education Level (For passing criteria)</label>
                                    <select
                                        value={formData.education_level}
                                        onChange={(e) => setFormData({ ...formData, education_level: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    >
                                        <option value="bachelor">ปวช./ปวส./ปริญญาตรี (60%)</option>
                                        <option value="master">ปริญญาโท (65%)</option>
                                    </select>
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Total Questions Goal (เป้าหมายจำนวนข้อรวม)</label>
                                <input
                                    type="number"
                                    value={formData.total_questions || ''}
                                    onChange={(e) => setFormData({ ...formData, total_questions: parseInt(e.target.value) || 0 })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    min="1"
                                />
                            </div>
                            <div className="border-t border-slate-200 pt-4 mt-4">
                                <div className="flex justify-between items-center mb-2">
                                    <div className="flex items-center space-x-2">
                                        <label className="block text-sm font-medium text-slate-700">หมวดหมู่ข้อสอบ (Catalogs)</label>
                                        <button 
                                            type="button"
                                            onClick={() => setIsNoteOpen(true)}
                                            className="flex items-center px-2 py-1 bg-slate-100 text-slate-600 rounded-md hover:bg-slate-200 transition-colors text-xs font-medium"
                                        >
                                            <HelpCircle size={14} className="mr-1" />
                                            สัดส่วนข้อสอบ ก.พ.
                                        </button>
                                    </div>
                                    <button 
                                        type="button" 
                                        onClick={handleAutoFillKorPor63}
                                        className="text-xs bg-purple-100 text-purple-700 px-3 py-1.5 rounded-lg hover:bg-purple-200 font-medium transition-colors"
                                    >
                                        ✨ เลือกข้ออัตโนมัติ
                                    </button>
                                </div>
                                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 max-h-60 overflow-y-auto space-y-2">
                                    {Array.from(new Set([...uniqueCatalogs, ...(formData.rules?.catalogs || [])])).map(catalog => (
                                        <div key={catalog} className="flex items-center space-x-3">
                                            <input
                                                type="checkbox"
                                                id={`catalog-${catalog}`}
                                                checked={formData.rules?.catalogs?.includes(catalog)}
                                                onChange={() => handleCatalogToggle(catalog)}
                                                className="rounded text-blue-600 focus:ring-blue-500"
                                            />
                                            <label htmlFor={`catalog-${catalog}`} className="text-sm font-medium text-slate-700 flex-1">
                                                {catalog}{' '}
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        const count = catalogCounts[catalog] || 0;
                                                        if (count > 0) {
                                                            if (!formData.rules?.catalogs?.includes(catalog)) {
                                                                handleCatalogToggle(catalog);
                                                            }
                                                            handleCatalogCountChange(catalog, count);
                                                        }
                                                    }}
                                                    className="text-blue-500 hover:text-blue-700 font-medium hover:underline px-1 rounded transition-colors cursor-pointer"
                                                    title={`เลือกทั้งหมด ${catalogCounts[catalog] || 0} ข้อ`}
                                                >
                                                    ({catalogCounts[catalog] || 0})
                                                </button>
                                            </label>
                                            {formData.rules?.catalogs?.includes(catalog) && (
                                                <input
                                                    type="number"
                                                    placeholder="จำนวนข้อ"
                                                    value={formData.rules?.catalog_counts?.[catalog] || ''}
                                                    onChange={(e) => handleCatalogCountChange(catalog, e.target.value)}
                                                    className="w-24 px-2 py-1 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                                                    min="1"
                                                    max={catalogCounts[catalog] || 0}
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-2 text-sm font-medium">
                                    {difference > 0 ? (
                                        <span className="text-amber-600 flex items-center">จำนวนข้อที่เลือกยังขาดอีก {difference} ข้อ (รวม {totalSelectedQuestions}/{formData.total_questions})</span>
                                    ) : difference < 0 ? (
                                        <span className="text-red-600 flex items-center">จำนวนข้อที่เลือกเกินมา {Math.abs(difference)} ข้อ (รวม {totalSelectedQuestions}/{formData.total_questions})</span>
                                    ) : formData.total_questions > 0 ? (
                                        <span className="text-green-600 flex items-center">จำนวนข้อที่เลือกครบถ้วนพอดี (รวม {totalSelectedQuestions}/{formData.total_questions})</span>
                                    ) : null}
                                </div>
                                {formData.is_korpor_format && (
                                    <div className="mt-4 p-3 bg-blue-50/50 border border-blue-100 rounded-lg text-sm">
                                        <div className="font-semibold text-blue-800 mb-2">สรุปตามหมวด ก.พ. (เป้าหมาย 100 ข้อ)</div>
                                        <div className="grid grid-cols-3 gap-2">
                                            <div>
                                                <div className="text-slate-500 text-xs">คณิตฯ + ภาษาไทย</div>
                                                <div className={`font-medium ${korPorSummary.mathThai === 50 ? 'text-green-600' : 'text-slate-700'}`}>{korPorSummary.mathThai}/50 ข้อ</div>
                                            </div>
                                            <div>
                                                <div className="text-slate-500 text-xs">กฎหมาย</div>
                                                <div className={`font-medium ${korPorSummary.law === 25 ? 'text-green-600' : 'text-slate-700'}`}>{korPorSummary.law}/25 ข้อ</div>
                                            </div>
                                            <div>
                                                <div className="text-slate-500 text-xs">ภาษาอังกฤษ</div>
                                                <div className={`font-medium ${korPorSummary.eng === 25 ? 'text-green-600' : 'text-slate-700'}`}>{korPorSummary.eng}/25 ข้อ</div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="pt-4 flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsCreateModalOpen(false);
                                        setIsEditModalOpen(false);
                                    }}
                                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    {isEditModalOpen ? 'Save Changes' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Note Modal */}
            {isNoteOpen && (
                <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b border-slate-100 sticky top-0 bg-white z-10">
                            <h3 className="text-xl font-bold text-slate-800 flex items-center">
                                <HelpCircle size={20} className="mr-2 text-blue-600" />
                                สัดส่วนข้อสอบ ก.พ.
                            </h3>
                            <button onClick={() => setIsNoteOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Column 1: Math + Thai */}
                                <div className="space-y-4">
                                    <div className="border-b-2 border-slate-800 pb-2">
                                        <h4 className="font-semibold text-slate-800">คณิตศาสตร์ + ภาษาไทย</h4>
                                        <p className="text-sm text-slate-500">50 ข้อ</p>
                                    </div>
                                    <ul className="space-y-2 text-sm text-slate-600">
                                        <li className="flex justify-between"><span>อนุกรม</span> <span className="font-medium text-slate-900">5</span></li>
                                        <li className="flex justify-between"><span>เลขทั่วไป</span> <span className="font-medium text-slate-900">5</span></li>
                                        <li className="flex justify-between"><span>ตาราง</span> <span className="font-medium text-slate-900">5</span></li>
                                        <li className="flex justify-between"><span>เงื่อนไขสัญลักษณ์</span> <span className="font-medium text-slate-900">10</span></li>
                                        <li className="flex justify-between"><span>เงื่อนไขภาษา</span> <span className="font-medium text-slate-900">5</span></li>
                                        <li className="flex justify-between"><span>เรียงประโยค</span> <span className="font-medium text-slate-900">5</span></li>
                                        <li className="flex justify-between"><span>สรุปความ</span> <span className="font-medium text-slate-900">10</span></li>
                                        <li className="flex justify-between"><span>อุปมาอุปไมย</span> <span className="font-medium text-slate-900">5</span></li>
                                    </ul>
                                </div>

                                {/* Column 2: Law */}
                                <div className="space-y-4">
                                    <div className="border-b-2 border-slate-800 pb-2">
                                        <h4 className="font-semibold text-slate-800">กฎหมาย</h4>
                                        <p className="text-sm text-slate-500">25 ข้อ</p>
                                    </div>
                                    <ul className="space-y-2 text-sm text-slate-600">
                                        <li className="flex justify-between gap-2"><span className="truncate">พ.ร.บ.บริหารราชการแผ่นดิน</span> <span className="font-medium text-slate-900 shrink-0">6</span></li>
                                        <li className="flex justify-between gap-2"><span className="truncate">พ.ร.ฎ.กิจการบ้านเมืองที่ดี</span> <span className="font-medium text-slate-900 shrink-0">6</span></li>
                                        <li className="flex justify-between gap-2"><span className="truncate">พ.ร.บ.วิธีปฏิบัติราชการทางปกครอง</span> <span className="font-medium text-slate-900 shrink-0">6</span></li>
                                        <li className="flex justify-between gap-2"><span className="truncate">พ.ร.บ.มาตรฐานทางจริยธรรม</span> <span className="font-medium text-slate-900 shrink-0">3</span></li>
                                        <li className="flex justify-between gap-2"><span className="truncate" title="พ.ร.บ.ความรับผิดทางละเมิดของเจ้าหน้าที่">พ.ร.บ.ความรับผิดทางละเมิดฯ</span> <span className="font-medium text-slate-900 shrink-0">2</span></li>
                                        <li className="flex justify-between gap-2"><span className="truncate" title="ประมวลกฎหมายอาญาความผิดต่อตำแหน่งหน้าที่ราชการ">ป.อาญา ความผิดต่อตำแหน่งหน้าที่</span> <span className="font-medium text-slate-900 shrink-0">2</span></li>
                                    </ul>
                                </div>

                                {/* Column 3: English */}
                                <div className="space-y-4">
                                    <div className="border-b-2 border-slate-800 pb-2">
                                        <h4 className="font-semibold text-slate-800">ภาษาอังกฤษ</h4>
                                        <p className="text-sm text-slate-500">25 ข้อ</p>
                                    </div>
                                    <ul className="space-y-2 text-sm text-slate-600">
                                        <li className="flex justify-between"><span>CONVERSATION</span> <span className="font-medium text-slate-900">5</span></li>
                                        <li className="flex justify-between"><span>VOCABULARY</span> <span className="font-medium text-slate-900">5</span></li>
                                        <li className="flex justify-between"><span>STRUCTURE</span> <span className="font-medium text-slate-900">5</span></li>
                                        <li className="flex justify-between"><span>READING</span> <span className="font-medium text-slate-900">10</span></li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 border-t border-slate-100 flex justify-end">
                            <button onClick={() => setIsNoteOpen(false)} className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
                                ปิด
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExamSetManager;
