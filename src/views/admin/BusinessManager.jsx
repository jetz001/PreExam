import React, { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import {
    Search,
    Eye,
    MoreHorizontal,
    CheckCircle2,
    XCircle,
    Store,
    ShieldCheck,
    Clock,
    Trash2,
    RefreshCw,
    X,
    Users,
    Package
} from 'lucide-react';
import toast from 'react-hot-toast';

const BusinessManager = () => {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'verified' | 'unverified'
    const [openMenuId, setOpenMenuId] = useState(null);
    const [detailBusiness, setDetailBusiness] = useState(null);

    const { data: businesses, isLoading, isFetching, refetch } = useQuery({
        queryKey: ['adminBusinesses'],
        queryFn: async () => {
            const token = localStorage.getItem('token');
            const res = await axios.get('/api/admin/businesses', {
                headers: { Authorization: `Bearer ${token}` }
            });
            return res.data;
        }
    });

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                setOpenMenuId(null);
                setDetailBusiness(null);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const handleVerify = async (id, status) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`/api/admin/businesses/${id}/verify`, { is_verified: status }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success(status ? 'Business verified!' : 'Verification revoked');
            refetch();
            setOpenMenuId(null);
            if (detailBusiness?.id === id) {
                setDetailBusiness((prev) => (prev ? { ...prev, is_verified: status } : null));
            }
        } catch (error) {
            toast.error('Action failed');
        }
    };

    const handleDelete = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`/api/admin/businesses/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Business deleted');
            refetch();
            setOpenMenuId(null);
            if (detailBusiness?.id === id) {
                setDetailBusiness(null);
            }
        } catch (error) {
            toast.error('Delete failed');
        }
    };

    const getImageUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        return `${path.startsWith('/') ? '' : '/'}${path}`;
    };

    const allBusinesses = useMemo(() => (Array.isArray(businesses) ? businesses : []), [businesses]);

    const filteredBusinesses = useMemo(() => {
        const q = (search || '').trim().toLowerCase();
        return allBusinesses.filter((b) => {
            const matchesSearch =
                !q ||
                (b.name || '').toLowerCase().includes(q) ||
                (b.Owner?.display_name || '').toLowerCase().includes(q) ||
                (b.Owner?.email || '').toLowerCase().includes(q) ||
                (b.category || '').toLowerCase().includes(q);
            const matchesStatus =
                statusFilter === 'all' ||
                (statusFilter === 'verified' && b.is_verified) ||
                (statusFilter === 'unverified' && !b.is_verified);
            return matchesSearch && matchesStatus;
        });
    }, [allBusinesses, search, statusFilter]);

    const verifiedCount = useMemo(() => allBusinesses.filter((b) => b.is_verified).length, [allBusinesses]);

    if (isLoading) {
        return (
            <div className="space-y-6 animate-pulse" role="status" aria-label="กำลังโหลดข้อมูลเพจธุรกิจ">
                <div className="h-24 rounded-2xl bg-slate-200/80" />
                <div className="h-16 rounded-2xl bg-slate-200/80" />
                <div className="h-72 rounded-2xl bg-slate-200/80" />
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-8">
            {/* Executive Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl bg-white/90 backdrop-blur-sm p-5 sm:p-6 border border-slate-200/80 shadow-sm">
                <div className="flex items-center gap-3.5 min-w-0">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-500/20">
                        <Store size={24} />
                    </div>
                    <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight truncate">
                                จัดการเพจธุรกิจ (Business Manager)
                            </h2>
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/70">
                                <ShieldCheck size={13} />
                                {verifiedCount}/{allBusinesses.length} Verified
                            </span>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                            Manage all registered business pages, verification status, and store owners
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={() => refetch()}
                    disabled={isFetching}
                    aria-label="รีเฟรชรายการเพจธุรกิจ"
                    className="inline-flex items-center justify-center gap-2 self-start sm:self-auto px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 border border-slate-200/80 text-sm font-semibold transition-all duration-200 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                >
                    <RefreshCw size={16} className={isFetching ? 'animate-spin' : ''} />
                    <span>รีเฟรช</span>
                </button>
            </div>

            {/* Search & Status Filter Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl bg-white/90 backdrop-blur-sm p-4 border border-slate-200/80 shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={18} aria-hidden="true" />
                    <input
                        type="text"
                        placeholder="Search business name, owner, email, or category..."
                        aria-label="Search business name or owner"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-sm text-slate-900 placeholder:text-slate-500 focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="inline-flex flex-wrap items-center gap-1 rounded-xl bg-slate-100/90 p-1 border border-slate-200/80" role="group" aria-label="Filter by verification status">
                    {[
                        { value: 'all', label: `ทั้งหมด (${allBusinesses.length})` },
                        { value: 'verified', label: `Verified (${verifiedCount})` },
                        { value: 'unverified', label: `Pending (${allBusinesses.length - verifiedCount})` },
                    ].map((tab) => (
                        <button
                            key={tab.value}
                            type="button"
                            onClick={() => setStatusFilter(tab.value)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                                statusFilter === tab.value
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
            <div className="rounded-2xl bg-white/90 backdrop-blur-sm border border-slate-200/80 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-left divide-y divide-slate-200/80">
                        <thead className="bg-slate-50/90">
                            <tr>
                                <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-600">Business</th>
                                <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-600">Owner</th>
                                <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-600">Category</th>
                                <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-600">Stats</th>
                                <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-600">Status</th>
                                <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-600 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                            {filteredBusinesses.map((business) => (
                                <tr key={business.id} className="hover:bg-indigo-50/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-11 h-11 flex-shrink-0 bg-slate-100 rounded-xl border border-slate-200/80 overflow-hidden flex items-center justify-center">
                                                {business.logo_image ? (
                                                    <img
                                                        src={getImageUrl(business.logo_image)}
                                                        alt={business.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <Store className="text-slate-500" size={20} />
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-bold text-sm text-slate-900 truncate">{business.name}</p>
                                                <p className="text-xs text-slate-500 truncate max-w-[220px]">{business.tagline || 'ไม่มีคำโปรย'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm">
                                            <p className="font-semibold text-slate-900">{business.Owner?.display_name || 'Unknown'}</p>
                                            <p className="text-xs text-slate-500">{business.Owner?.email || '-'}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="inline-flex items-center px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-semibold border border-indigo-200/70">
                                            {business.category || 'General'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-xs font-medium text-slate-600 whitespace-nowrap">
                                        <div className="flex flex-col gap-1">
                                            <span className="inline-flex items-center gap-1.5">
                                                <Package size={12} className="text-slate-500" />
                                                Items: <strong className="text-slate-800">{business.item_count || 0}</strong>
                                            </span>
                                            <span className="inline-flex items-center gap-1.5">
                                                <Users size={12} className="text-slate-500" />
                                                Followers: <strong className="text-slate-800">{business.stats?.followers || 0}</strong>
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {business.is_verified ? (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
                                                <CheckCircle2 size={14} /> Verified
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200 text-xs font-semibold">
                                                <Clock size={14} /> Not Verified
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right relative whitespace-nowrap">
                                        <div className="relative inline-block">
                                            <button
                                                type="button"
                                                onClick={() => setOpenMenuId(openMenuId === business.id ? null : business.id)}
                                                aria-label={`จัดการเพจ ${business.name}`}
                                                aria-expanded={openMenuId === business.id}
                                                title="ตัวเลือกจัดการ"
                                                className="p-2 hover:bg-slate-100 rounded-xl text-slate-600 hover:text-slate-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                                            >
                                                <MoreHorizontal size={20} />
                                            </button>

                                            {openMenuId === business.id && (
                                                <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-200/90 z-20 py-1.5 text-left">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleVerify(business.id, !business.is_verified)}
                                                        className="w-full px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors"
                                                    >
                                                        {business.is_verified ? (
                                                            <>
                                                                <XCircle size={16} className="text-amber-600" />
                                                                <span>Revoke Verify</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <CheckCircle2 size={16} className="text-emerald-600" />
                                                                <span>Verify Page</span>
                                                            </>
                                                        )}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setDetailBusiness(business);
                                                            setOpenMenuId(null);
                                                        }}
                                                        className="w-full px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors"
                                                    >
                                                        <Eye size={16} className="text-indigo-600" />
                                                        <span>View Details</span>
                                                    </button>
                                                    <div className="border-t border-slate-100 my-1" />
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            if (window.confirm('Are you sure you want to delete this business page?')) {
                                                                handleDelete(business.id);
                                                            }
                                                        }}
                                                        className="w-full px-4 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 transition-colors"
                                                    >
                                                        <Trash2 size={16} />
                                                        <span>Delete Page</span>
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredBusinesses.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-14 text-center">
                                        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                                            <Store size={24} />
                                        </div>
                                        <p className="text-sm font-semibold text-slate-700">No businesses found matching your search.</p>
                                        <p className="text-xs text-slate-500 mt-1">ลองปรับคำค้นหาหรือตัวกรองสถานะ</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Business Details Modal */}
            {detailBusiness && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="business-detail-title"
                >
                    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xl max-w-lg w-full overflow-hidden">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center flex-shrink-0">
                                    <Store size={19} />
                                </div>
                                <div className="min-w-0">
                                    <h3 id="business-detail-title" className="text-base font-bold text-slate-900 truncate">
                                        {detailBusiness.name}
                                    </h3>
                                    <p className="text-xs text-slate-500">รายละเอียดเพจธุรกิจ #{detailBusiness.id}</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setDetailBusiness(null)}
                                aria-label="ปิดหน้าต่างรายละเอียด"
                                className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-200/70 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="p-6 space-y-4 text-sm">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center flex-shrink-0">
                                    {detailBusiness.logo_image ? (
                                        <img src={getImageUrl(detailBusiness.logo_image)} alt={detailBusiness.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <Store size={26} className="text-slate-500" />
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/70">
                                            {detailBusiness.category || 'General'}
                                        </span>
                                        <span
                                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                                                detailBusiness.is_verified
                                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                    : 'bg-slate-100 text-slate-600 border-slate-200'
                                            }`}
                                        >
                                            {detailBusiness.is_verified ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                                            {detailBusiness.is_verified ? 'Verified' : 'Not Verified'}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-600 mt-1.5">{detailBusiness.tagline || 'ไม่มีคำอธิบาย'}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-4 border border-slate-200/80">
                                <div>
                                    <div className="text-xs font-semibold text-slate-500">เจ้าของเพจ (Owner)</div>
                                    <div className="font-bold text-slate-900 mt-0.5">{detailBusiness.Owner?.display_name || 'Unknown'}</div>
                                    <div className="text-xs text-slate-500 truncate">{detailBusiness.Owner?.email || '-'}</div>
                                </div>
                                <div>
                                    <div className="text-xs font-semibold text-slate-500">สถิติ (Stats)</div>
                                    <div className="font-bold text-slate-900 mt-0.5">Items: {detailBusiness.item_count || 0}</div>
                                    <div className="text-xs text-slate-600">Followers: {detailBusiness.stats?.followers || 0}</div>
                                </div>
                            </div>

                            {detailBusiness.description && (
                                <div>
                                    <div className="text-xs font-semibold text-slate-500 mb-1">รายละเอียดเพิ่มเติม</div>
                                    <p className="text-xs text-slate-700 leading-relaxed bg-slate-50/70 rounded-xl p-3 border border-slate-200/70">
                                        {detailBusiness.description}
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/70 flex items-center justify-end gap-2.5">
                            <button
                                type="button"
                                onClick={() => handleVerify(detailBusiness.id, !detailBusiness.is_verified)}
                                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                                    detailBusiness.is_verified
                                        ? 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
                                        : 'bg-emerald-600 text-white hover:bg-emerald-700'
                                }`}
                            >
                                {detailBusiness.is_verified ? <XCircle size={14} /> : <CheckCircle2 size={14} />}
                                <span>{detailBusiness.is_verified ? 'ยกเลิกการยืนยัน' : 'ยืนยันเพจนี้ (Verify)'}</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setDetailBusiness(null)}
                                className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                            >
                                ปิด
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BusinessManager;
