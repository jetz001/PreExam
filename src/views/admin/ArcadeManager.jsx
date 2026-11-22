import React, { useState, useEffect, useMemo } from 'react';
import adminService from '../../services/adminService';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import {
    Gamepad2,
    Plus,
    Wrench,
    Link2,
    AlertTriangle,
    Edit3,
    Trash2,
    Upload,
    X,
    Search,
    RefreshCw,
    CheckCircle2,
    EyeOff,
    Image as ImageIcon,
    Loader2,
    Sparkles
} from 'lucide-react';

export default function ArcadeManager() {
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [modeFilter, setModeFilter] = useState('all');
    const [currentData, setCurrentData] = useState({
        title: '',
        description: '',
        thumbnail_url: '',
        game_url: '',
        internal_component: '',
        mode: 'both',
        is_active: true,
        order_index: 0
    });
    const [isEdit, setIsEdit] = useState(false);
    const [uploadingCover, setUploadingCover] = useState(false);

    const handleUploadCover = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploadingCover(true);
        const formData = new FormData();
        formData.append('file', file);

        const ext = file.name.split('.').pop();
        const filename = `arcade_thumb_${currentData.id || Date.now()}.${ext}`;
        formData.append('exactName', filename);

        try {
            const res = await api.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            // Append timestamp to bust cache if replacing
            setCurrentData((prev) => ({ ...prev, thumbnail_url: `${res.data.url}?t=${Date.now()}` }));
            toast.success('อัปโหลดรูปลง R2 สำเร็จ');
        } catch (err) {
            console.error('Upload Error:', err);
            toast.error(`อัปโหลดล้มเหลว: ${err.response?.data?.error || err.message}`);
        } finally {
            setUploadingCover(false);
            e.target.value = ''; // Reset input
        }
    };

    useEffect(() => {
        fetchGames();
    }, []);

    useEffect(() => {
        if (!isModalOpen) return undefined;
        const handleKeyDown = (event) => {
            if (event.key === 'Escape' && !saving) {
                setIsModalOpen(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isModalOpen, saving]);

    const fetchGames = async () => {
        setLoading(true);
        try {
            const res = await adminService.getArcadeGames();
            if (res.success) {
                setGames(res.data || []);
            }
        } catch (error) {
            toast.error('Failed to load arcade games');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (isEdit) {
                await adminService.updateArcadeGame(currentData.id, currentData);
                toast.success('อัปเดตเกมสำเร็จ');
            } else {
                await adminService.createArcadeGame(currentData);
                toast.success('เพิ่มเกมสำเร็จ');
            }
            setIsModalOpen(false);
            fetchGames();
        } catch (error) {
            toast.error('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('คุณแน่ใจหรือไม่ที่จะลบเกมนี้?')) return;
        try {
            await adminService.deleteArcadeGame(id);
            toast.success('ลบเกมสำเร็จ');
            fetchGames();
        } catch (error) {
            toast.error('ลบเกมไม่สำเร็จ');
        }
    };

    const openCreateModal = () => {
        setIsEdit(false);
        setCurrentData({
            title: '',
            description: '',
            thumbnail_url: '',
            game_url: '',
            internal_component: '',
            mode: 'both',
            is_active: true,
            order_index: 0
        });
        setIsModalOpen(true);
    };

    const openEditModal = (game) => {
        setIsEdit(true);
        setCurrentData(game);
        setIsModalOpen(true);
    };

    const filteredGames = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        return (games || []).filter((g) => {
            const matchesSearch =
                !q ||
                (g.title || '').toLowerCase().includes(q) ||
                (g.description || '').toLowerCase().includes(q) ||
                (g.internal_component || '').toLowerCase().includes(q);
            const matchesMode = modeFilter === 'all' || (g.mode || 'both') === modeFilter;
            return matchesSearch && matchesMode;
        });
    }, [games, searchQuery, modeFilter]);

    const activeCount = useMemo(() => (games || []).filter((g) => g.is_active).length, [games]);

    const getModeBadgeClass = (mode) => {
        if (mode === 'solo') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
        if (mode === 'multi') return 'bg-amber-50 text-amber-700 border-amber-200';
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    };

    return (
        <div className="space-y-6 pb-8">
            {/* Executive Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl bg-white/90 backdrop-blur-sm p-5 sm:p-6 border border-slate-200/80 shadow-sm">
                <div className="flex items-center gap-3.5 min-w-0">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-500/20">
                        <Gamepad2 size={24} />
                    </div>
                    <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight truncate">
                                จัดการอาเขต (Arcade Manager)
                            </h2>
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/70">
                                {activeCount}/{games.length} เปิดใช้งาน
                            </span>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                            จัดการมินิเกม โหมดการเล่น รูปปก R2 และการเชื่อมต่อคอมโพเนนต์ในระบบ
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                    <button
                        type="button"
                        onClick={fetchGames}
                        disabled={loading}
                        aria-label="รีเฟรชรายการมินิเกม"
                        title="รีเฟรชข้อมูล"
                        className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 border border-slate-200/80 text-sm font-semibold transition-all duration-200 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                    >
                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                        <span className="hidden sm:inline">รีเฟรช</span>
                    </button>
                    <button
                        type="button"
                        onClick={openCreateModal}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-sm font-semibold shadow-md shadow-indigo-500/20 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                    >
                        <Plus size={18} />
                        <span>เพิ่มมินิเกมใหม่</span>
                    </button>
                </div>
            </div>

            {/* Search & Mode Filter Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl bg-white/90 backdrop-blur-sm p-4 border border-slate-200/80 shadow-sm">
                <div className="relative flex-1">
                    <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" aria-hidden="true" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="ค้นหาชื่อเกม รายละเอียด หรือชื่อ Component..."
                        aria-label="ค้นหาชื่อมินิเกม"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-sm text-slate-900 placeholder:text-slate-500 focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    />
                </div>

                <div className="inline-flex flex-wrap items-center gap-1 rounded-xl bg-slate-100/90 p-1 border border-slate-200/80" role="group" aria-label="กรองตามโหมดการเล่น">
                    {[
                        { value: 'all', label: 'ทั้งหมด' },
                        { value: 'both', label: 'Both' },
                        { value: 'solo', label: 'Solo' },
                        { value: 'multi', label: 'Multi' },
                    ].map((tab) => (
                        <button
                            key={tab.value}
                            type="button"
                            onClick={() => setModeFilter(tab.value)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                                modeFilter === tab.value
                                    ? 'bg-white text-indigo-700 shadow-sm'
                                    : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table Card */}
            {loading ? (
                <div className="rounded-2xl bg-white/90 border border-slate-200/80 p-6 space-y-4 animate-pulse" role="status" aria-label="กำลังโหลดข้อมูลมินิเกม">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-14 rounded-xl bg-slate-100" />
                    ))}
                </div>
            ) : (
                <div className="rounded-2xl bg-white/90 backdrop-blur-sm border border-slate-200/80 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200/80 text-left">
                            <thead className="bg-slate-50/90">
                                <tr>
                                    <th className="px-5 py-3.5 text-xs font-bold text-slate-600 uppercase tracking-wider">ลำดับ / ชื่อเกม</th>
                                    <th className="px-5 py-3.5 text-xs font-bold text-slate-600 uppercase tracking-wider">โหมด</th>
                                    <th className="px-5 py-3.5 text-xs font-bold text-slate-600 uppercase tracking-wider">ประเภทที่มา</th>
                                    <th className="px-5 py-3.5 text-xs font-bold text-slate-600 uppercase tracking-wider">สถานะ</th>
                                    <th className="px-5 py-3.5 text-right text-xs font-bold text-slate-600 uppercase tracking-wider">จัดการ</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {filteredGames.map((g) => (
                                    <tr key={g.id} className="hover:bg-indigo-50/30 transition-colors">
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3.5">
                                                <span className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-slate-100 border border-slate-200/80 text-xs font-bold text-slate-700">
                                                    {g.order_index ?? 0}
                                                </span>
                                                <div className="h-11 w-14 flex-shrink-0 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center">
                                                    {g.thumbnail_url ? (
                                                        <img src={g.thumbnail_url} alt={g.title} className="h-full w-full object-cover" />
                                                    ) : (
                                                        <Gamepad2 size={18} className="text-slate-500" />
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="text-sm font-bold text-slate-900 truncate">{g.title}</div>
                                                    <div className="text-xs text-slate-500 truncate max-w-xs">{g.description || 'ไม่มีคำอธิบาย'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getModeBadgeClass(g.mode)}`}>
                                                {(g.mode || 'both').toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 whitespace-nowrap text-sm">
                                            {g.internal_component ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200/70 text-xs font-semibold">
                                                    <Wrench size={13} />
                                                    สร้างเอง ({g.internal_component})
                                                </span>
                                            ) : g.game_url ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 text-xs font-medium">
                                                    <Link2 size={13} />
                                                    ฝังลิงก์ (iframe)
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 text-xs font-semibold">
                                                    <AlertTriangle size={13} />
                                                    ไม่มีข้อมูล
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-5 py-4 whitespace-nowrap">
                                            <span
                                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                                                    g.is_active
                                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                        : 'bg-slate-100 text-slate-600 border-slate-200'
                                                }`}
                                            >
                                                {g.is_active ? <CheckCircle2 size={13} /> : <EyeOff size={13} />}
                                                {g.is_active ? 'Active' : 'Hidden'}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="inline-flex items-center justify-end gap-1.5">
                                                <button
                                                    type="button"
                                                    onClick={() => openEditModal(g)}
                                                    aria-label={`แก้ไข ${g.title}`}
                                                    title="แก้ไขมินิเกม"
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/70 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                                                >
                                                    <Edit3 size={14} />
                                                    <span>แก้ไข</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(g.id)}
                                                    aria-label={`ลบ ${g.title}`}
                                                    title="ลบมินิเกม"
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200/70 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                                                >
                                                    <Trash2 size={14} />
                                                    <span>ลบ</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredGames.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-14 text-center">
                                            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                                                <Gamepad2 size={24} />
                                            </div>
                                            <p className="text-sm font-semibold text-slate-700">ไม่พบข้อมูลมินิเกม</p>
                                            <p className="text-xs text-slate-500 mt-1">ลองปรับคำค้นหาหรือเพิ่มมินิเกมใหม่เข้าสู่ระบบ</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Create/Edit Modal */}
            {isModalOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="arcade-modal-title"
                >
                    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xl max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-sm">
                                    <Sparkles size={18} />
                                </div>
                                <div>
                                    <h3 id="arcade-modal-title" className="text-lg font-bold text-slate-900">
                                        {isEdit ? 'แก้ไขมินิเกม' : 'เพิ่มมินิเกมใหม่'}
                                    </h3>
                                    <p className="text-xs text-slate-500">กำหนดข้อมูลเกม รูปปก และวิธีเชื่อมต่อ</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                aria-label="ปิดหน้าต่าง"
                                title="ปิดหน้าต่าง"
                                className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-200/70 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="overflow-y-auto p-6 space-y-5">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">ชื่อเกม</label>
                                    <input
                                        required
                                        type="text"
                                        value={currentData.title}
                                        onChange={(e) => setCurrentData({ ...currentData, title: e.target.value })}
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-500 focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                        placeholder="เช่น Word Match Arena"
                                    />
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">รายละเอียด</label>
                                    <textarea
                                        value={currentData.description}
                                        onChange={(e) => setCurrentData({ ...currentData, description: e.target.value })}
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-500 focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                        rows={2}
                                        placeholder="คำอธิบายวิธีการเล่นและจุดเด่นของมินิเกม..."
                                    />
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                        URL รูปปก (Thumbnail) หรือ อัปโหลดลง R2
                                    </label>
                                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                                        <div className="relative flex-1">
                                            <ImageIcon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                                            <input
                                                type="text"
                                                value={currentData.thumbnail_url}
                                                onChange={(e) => setCurrentData({ ...currentData, thumbnail_url: e.target.value })}
                                                className="w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-10 pr-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-500 focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                                placeholder="https://..."
                                            />
                                        </div>
                                        <label className="inline-flex items-center justify-center gap-2 cursor-pointer bg-indigo-50 text-indigo-700 border border-indigo-200 px-4 py-2.5 rounded-xl hover:bg-indigo-100 transition-colors text-sm font-semibold whitespace-nowrap">
                                            {uploadingCover ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                                            <span>{uploadingCover ? 'กำลังอัปโหลด...' : 'อัปโหลดปก'}</span>
                                            <input
                                                type="file"
                                                accept="image/*,.json,.lottie"
                                                className="hidden"
                                                onChange={handleUploadCover}
                                                disabled={uploadingCover}
                                            />
                                        </label>
                                    </div>
                                </div>

                                <div className="sm:col-span-2 rounded-xl bg-slate-50/90 border border-slate-200/80 p-4 space-y-3">
                                    <p className="text-xs font-bold uppercase tracking-wider text-slate-600">
                                        วิธีเชื่อมต่อตัวเกม (เลือกอย่างใดอย่างหนึ่ง)
                                    </p>

                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1">
                                            1. ลิงก์ไฟล์เกม Open Source (ที่อัปโหลดไว้ในเซิร์ฟเวอร์เรา)
                                        </label>
                                        <input
                                            type="text"
                                            value={currentData.game_url}
                                            onChange={(e) => setCurrentData({ ...currentData, game_url: e.target.value })}
                                            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                            placeholder="เช่น /games/memory-match/index.html"
                                        />
                                        <p className="text-xs text-slate-500 mt-1">
                                            ใช้สำหรับเกม HTML5 Open source ที่นำมาวางในโฟลเดอร์ public/games/
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-3 text-xs font-bold text-slate-500">
                                        <div className="h-px flex-1 bg-slate-200" />
                                        <span>หรือ</span>
                                        <div className="h-px flex-1 bg-slate-200" />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1">
                                            2. ชื่อ React Component (ถ้าสร้างเกมเป็นระบบฝังในเว็บเลย)
                                        </label>
                                        <input
                                            type="text"
                                            value={currentData.internal_component}
                                            onChange={(e) => setCurrentData({ ...currentData, internal_component: e.target.value })}
                                            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                            placeholder="เช่น WordMatchGame"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">โหมดการเล่น</label>
                                    <select
                                        value={currentData.mode}
                                        onChange={(e) => setCurrentData({ ...currentData, mode: e.target.value })}
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                    >
                                        <option value="both">เล่นได้ทั้งหมด (Both)</option>
                                        <option value="solo">เล่นคนเดียว (Solo)</option>
                                        <option value="multi">เล่นหลายคน (Multi)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">ลำดับการแสดงผล</label>
                                    <input
                                        type="number"
                                        value={currentData.order_index}
                                        onChange={(e) => setCurrentData({ ...currentData, order_index: parseInt(e.target.value, 10) || 0 })}
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                    />
                                </div>

                                <div className="sm:col-span-2 flex items-center gap-2.5 pt-1">
                                    <input
                                        type="checkbox"
                                        id="isActive"
                                        checked={currentData.is_active}
                                        onChange={(e) => setCurrentData({ ...currentData, is_active: e.target.checked })}
                                        className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <label htmlFor="isActive" className="text-sm font-semibold text-slate-800 cursor-pointer">
                                        เปิดใช้งาน (Active)
                                    </label>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                                >
                                    ยกเลิก
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 disabled:opacity-60 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                                >
                                    {saving && <Loader2 size={15} className="animate-spin" />}
                                    <span>{saving ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
