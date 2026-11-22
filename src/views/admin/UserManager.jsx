import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    User,
    Users,
    Shield,
    Ban,
    CheckCircle,
    Briefcase,
    GraduationCap,
    Lock,
    X,
    Smartphone,
    Globe,
    Activity,
    Mail,
    ArrowUp,
    ArrowDown,
    RefreshCw,
    Search,
    Send,
    Loader2,
    Crown
} from 'lucide-react';
import toast from 'react-hot-toast';
import adminApi from '../../services/adminApi';
import { isPremiumUser } from '../../utils/userAccess';

const isGuest = (user) => {
    return (
        (user.email && user.email.startsWith('guest_') && user.email.includes('@preexam.com')) ||
        (user.display_name && user.display_name.startsWith('Guest-'))
    );
};

const isForeignGuest = (user) => {
    return isGuest(user) && user.country && user.country !== 'TH';
};

const PERMISSIONS_LIST = [
    { id: 'view_dashboard', label: 'View Dashboard' },
    { id: 'manage_exams', label: 'Manage Questions' },
    { id: 'manage_users', label: 'Manage Users' },
    { id: 'manage_news', label: 'Manage News' },
    { id: 'manage_community', label: 'Manage Community' },
    { id: 'manage_inbox', label: 'Inbox & Reports' },
    { id: 'manage_payments', label: 'Payment Verification' },
    { id: 'manage_assets', label: 'Manage Themes/Assets' },
    { id: 'manage_legal', label: 'Manage Legal/PDPA' }
];

const PermissionsModal = ({ user, onClose, onSave }) => {
    const [selectedPermissions, setSelectedPermissions] = useState(user.admin_permissions || []);

    const togglePermission = (id) => {
        if (selectedPermissions.includes(id)) {
            setSelectedPermissions(selectedPermissions.filter((p) => p !== id));
        } else {
            setSelectedPermissions([...selectedPermissions, id]);
        }
    };

    return (
        <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl shadow-2xl border border-slate-200/80 w-full max-w-md overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-5 border-b border-slate-200/80 flex justify-between items-center bg-slate-50/80">
                    <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-indigo-600" />
                        <span>Admin Permissions: {user.display_name}</span>
                    </h3>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="ปิดหน้าต่างสิทธิ์ผู้ดูแล"
                        className="p-1.5 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                    >
                        <X size={20} />
                    </button>
                </div>
                <div className="p-5 max-h-96 overflow-y-auto">
                    <p className="text-sm text-slate-600 mb-4">Select the modules this admin can access.</p>
                    <div className="space-y-2">
                        {PERMISSIONS_LIST.map((perm) => (
                            <label
                                key={perm.id}
                                className="flex items-center p-3 hover:bg-indigo-50/50 rounded-xl border border-slate-200/80 cursor-pointer transition-colors"
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedPermissions.includes(perm.id)}
                                    onChange={() => togglePermission(perm.id)}
                                    className="rounded text-indigo-600 border-slate-300 focus:ring-indigo-500 mr-3 h-4 w-4"
                                />
                                <span className="text-sm text-slate-700 font-semibold">{perm.label}</span>
                            </label>
                        ))}
                    </div>
                </div>
                <div className="p-4 bg-slate-50/80 border-t border-slate-200/80 flex justify-end gap-2.5">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-200/70 rounded-xl font-semibold transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={() => onSave(user.id, selectedPermissions)}
                        className="px-4 py-2 text-sm bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-xl font-semibold shadow-sm transition-all"
                    >
                        Save Permissions
                    </button>
                </div>
            </div>
        </div>
    );
};

const AddAdminModal = ({ users, onClose, onPromote }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUserId, setSelectedUserId] = useState(null);

    const nonAdminUsers = (users || []).filter((u) => u.role !== 'admin' && u.role !== 'sponsor');
    const displayUsers = nonAdminUsers.filter(
        (u) =>
            (u.email && u.email.toLowerCase().includes((searchTerm || '').toLowerCase())) ||
            (u.display_name && u.display_name.toLowerCase().includes((searchTerm || '').toLowerCase()))
    );

    return (
        <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl shadow-2xl border border-slate-200/80 w-full max-w-md overflow-hidden flex flex-col max-h-[80vh]"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-5 border-b border-slate-200/80 flex justify-between items-center bg-slate-50/80">
                    <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-indigo-600" />
                        <span>เพิ่มผู้ดูแลใหม่</span>
                    </h3>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="ปิดหน้าต่างเพิ่มผู้ดูแล"
                        className="p-1.5 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                    >
                        <X size={20} />
                    </button>
                </div>
                <div className="p-4 border-b border-slate-200/80">
                    <div className="relative">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
                        <input
                            type="text"
                            placeholder="ค้นหาชื่อ หรือ อีเมล..."
                            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50/70 focus:bg-white focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 focus:outline-none text-sm text-slate-900 placeholder:text-slate-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
                    {displayUsers.length === 0 ? (
                        <p className="text-center text-slate-500 py-6 text-sm font-medium">No users found.</p>
                    ) : (
                        displayUsers.map((user) => (
                            <button
                                key={user.id}
                                type="button"
                                onClick={() => setSelectedUserId(user.id)}
                                className={`w-full text-left flex items-center p-3 rounded-xl cursor-pointer transition-all ${
                                    selectedUserId === user.id
                                        ? 'bg-indigo-50 border border-indigo-200 shadow-sm'
                                        : 'hover:bg-slate-50 border border-transparent'
                                }`}
                            >
                                <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 mr-3 flex-shrink-0">
                                    <User size={16} />
                                </div>
                                <div className="overflow-hidden flex-1">
                                    <p className="font-semibold text-slate-800 truncate text-sm">
                                        {user.display_name || user.email}
                                    </p>
                                    <p className="text-xs text-slate-500 truncate">{user.email}</p>
                                </div>
                                {selectedUserId === user.id && (
                                    <CheckCircle size={18} className="ml-2 text-indigo-600 flex-shrink-0" />
                                )}
                            </button>
                        ))
                    )}
                </div>
                <div className="p-4 bg-slate-50/80 border-t border-slate-200/80 flex justify-end gap-2.5">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-200/70 rounded-xl font-semibold transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        disabled={!selectedUserId}
                        onClick={() => onPromote(selectedUserId)}
                        className={`px-4 py-2 text-sm rounded-xl font-semibold shadow-sm transition-all ${
                            selectedUserId
                                ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:from-indigo-700 hover:to-violet-700'
                                : 'bg-slate-200 text-slate-500 cursor-not-allowed'
                        }`}
                    >
                        ยืนยันการตั้งค่า
                    </button>
                </div>
            </div>
        </div>
    );
};

const HistoryModal = ({ user, history, onClose }) => {
    return (
        <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl shadow-2xl border border-slate-200/80 w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-5 border-b border-slate-200/80 flex justify-between items-center bg-slate-50/80">
                    <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                        <Briefcase className="w-5 h-5 text-indigo-600" />
                        <span>History: {user.display_name}</span>
                    </h3>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="ปิดหน้าต่างประวัติการใช้งาน"
                        className="p-1.5 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Exam History Section */}
                    <div>
                        <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2 text-sm">
                            <GraduationCap size={18} className="text-indigo-600" />
                            <span>Recent Exams</span>
                        </h4>
                        {history.examHistory && history.examHistory.length > 0 ? (
                            <div className="overflow-hidden rounded-xl border border-slate-200">
                                <table className="min-w-full divide-y divide-slate-200">
                                    <thead className="bg-slate-50">
                                        <tr>
                                            <th className="px-4 py-2.5 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                                                Date
                                            </th>
                                            <th className="px-4 py-2.5 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                                                Mode
                                            </th>
                                            <th className="px-4 py-2.5 text-right text-xs font-bold text-slate-600 uppercase tracking-wider">
                                                Score
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-slate-100">
                                        {history.examHistory.map((exam) => (
                                            <tr key={exam.id} className="hover:bg-slate-50/70">
                                                <td className="px-4 py-2.5 text-sm text-slate-600">
                                                    {new Date(exam.taken_at || exam.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="px-4 py-2.5 text-sm text-slate-700 capitalize font-medium">
                                                    {exam.mode}
                                                </td>
                                                <td className="px-4 py-2.5 text-sm text-slate-900 text-right font-bold">
                                                    {exam.score} / {exam.total_score}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-sm text-slate-500 italic bg-slate-50 p-3.5 rounded-xl border border-slate-200/70">
                                No exam history found.
                            </p>
                        )}
                    </div>

                    {/* Payment History Section */}
                    <div>
                        <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2 text-sm">
                            <Briefcase size={18} className="text-emerald-600" />
                            <span>Recent Transactions</span>
                        </h4>
                        {history.paymentHistory && history.paymentHistory.length > 0 ? (
                            <div className="overflow-hidden rounded-xl border border-slate-200">
                                <table className="min-w-full divide-y divide-slate-200">
                                    <thead className="bg-slate-50">
                                        <tr>
                                            <th className="px-4 py-2.5 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                                                Date
                                            </th>
                                            <th className="px-4 py-2.5 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                                                Type
                                            </th>
                                            <th className="px-4 py-2.5 text-right text-xs font-bold text-slate-600 uppercase tracking-wider">
                                                Amount
                                            </th>
                                            <th className="px-4 py-2.5 text-center text-xs font-bold text-slate-600 uppercase tracking-wider">
                                                Status
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-slate-100">
                                        {history.paymentHistory.map((payment) => (
                                            <tr key={payment.id} className="hover:bg-slate-50/70">
                                                <td className="px-4 py-2.5 text-sm text-slate-600">
                                                    {new Date(payment.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="px-4 py-2.5 text-sm text-slate-700 font-medium">
                                                    {payment.slip_image ? 'Bank Transfer' : payment.type || 'Payment'}
                                                </td>
                                                <td className="px-4 py-2.5 text-sm text-slate-900 text-right font-bold">
                                                    ฿{parseFloat(payment.amount || 0).toLocaleString()}
                                                </td>
                                                <td className="px-4 py-2.5 text-center">
                                                    <span
                                                        className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                                            payment.status === 'approved' ||
                                                            payment.status === 'SUCCESS' ||
                                                            payment.status === 'completed'
                                                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                                : payment.status === 'pending' ||
                                                                  payment.status === 'PENDING'
                                                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                                                        }`}
                                                    >
                                                        {payment.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-sm text-slate-500 italic bg-slate-50 p-3.5 rounded-xl border border-slate-200/70">
                                No transaction history found.
                            </p>
                        )}
                    </div>
                </div>

                <div className="p-4 bg-slate-50/80 border-t border-slate-200/80 flex justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 bg-white border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-100 font-semibold text-sm shadow-sm transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

const LogModal = ({ user, logs, onClose, onRefresh, isRefreshing }) => {
    return (
        <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl shadow-2xl border border-slate-200/80 w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh]"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-5 border-b border-slate-200/80 flex justify-between items-center bg-slate-50/80">
                    <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-indigo-600" />
                        <span>System Log: {user.display_name}</span>
                    </h3>
                    <div className="flex items-center gap-2">
                        {onRefresh && (
                            <button
                                type="button"
                                onClick={onRefresh}
                                disabled={isRefreshing}
                                aria-label="รีเฟรชล็อกระบบ"
                                className="text-slate-600 hover:bg-slate-200/60 p-2 rounded-xl transition-colors border border-slate-200 disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                                title="Refresh"
                            >
                                <RefreshCw size={15} className={isRefreshing ? 'animate-spin' : ''} />
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={onClose}
                            aria-label="ปิดหน้าต่างล็อกระบบ"
                            className="p-1.5 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                    {logs && logs.length > 0 ? (
                        <div className="space-y-3">
                            {logs.map((log) => (
                                <div key={log.id} className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80">
                                    <div className="flex justify-between items-start gap-2 mb-1.5">
                                        <span className="font-bold text-slate-800 text-sm">{log.action}</span>
                                        <span className="text-xs text-slate-500 whitespace-nowrap">
                                            {new Date(
                                                typeof log.created_at === 'object' &&
                                                    log.created_at !== null &&
                                                    log.created_at._seconds
                                                    ? log.created_at._seconds * 1000
                                                    : log.created_at
                                            ).toLocaleString('en-GB')}
                                        </span>
                                    </div>
                                    <pre className="text-xs text-slate-600 overflow-x-auto whitespace-pre-wrap font-mono bg-white p-2.5 rounded-lg border border-slate-200/70">
                                        {typeof log.details === 'string'
                                            ? log.details
                                            : JSON.stringify(log.details, null, 2)}
                                    </pre>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-slate-500 py-8 text-sm font-medium">No system log found.</p>
                    )}
                </div>
                <div className="p-4 bg-slate-50/80 border-t border-slate-200/80 flex justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 bg-white border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-100 font-semibold text-sm shadow-sm"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

const ProfileModal = ({ user, onClose }) => {
    if (!user) return null;
    return (
        <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl shadow-2xl border border-slate-200/80 w-full max-w-md overflow-hidden flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-5 border-b border-slate-200/80 flex justify-between items-center bg-slate-50/80">
                    <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                        <User className="w-5 h-5 text-indigo-600" />
                        <span>User Profile</span>
                    </h3>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="ปิดหน้าต่างโปรไฟล์"
                        className="p-1.5 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                    >
                        <X size={20} />
                    </button>
                </div>
                <div className="p-5 space-y-4">
                    <div className="flex flex-col items-center justify-center">
                        <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-violet-600 text-white rounded-full flex items-center justify-center text-2xl font-extrabold mb-3 shadow-md">
                            {user.display_name?.charAt(0)?.toUpperCase() ||
                                user.email?.charAt(0)?.toUpperCase() ||
                                '?'}
                        </div>
                        <h4 className="font-bold text-xl text-slate-900">
                            {user.display_name || user.name || 'Unknown User'}
                        </h4>
                        <p className="text-sm text-slate-500">{user.email || 'No email'}</p>
                        <span
                            className={`mt-2 px-3 py-1 rounded-full text-xs font-bold border ${
                                user.status === 'banned'
                                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            }`}
                        >
                            {user.status || 'Active'}
                        </span>
                    </div>

                    <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200/80 text-sm">
                        <div className="grid grid-cols-3 gap-2 py-2 border-b border-slate-200/70">
                            <span className="text-slate-500 col-span-1 font-medium">Public ID</span>
                            <span className="text-slate-800 font-mono col-span-2 text-right break-all">
                                {user.public_id || '-'}
                            </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 py-2 border-b border-slate-200/70">
                            <span className="text-slate-500 col-span-1 font-medium">Role</span>
                            <span className="text-slate-800 col-span-2 text-right capitalize font-semibold">
                                {user.role || 'user'}
                            </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 py-2 border-b border-slate-200/70">
                            <span className="text-slate-500 col-span-1 font-medium">Location</span>
                            <span className="text-slate-800 col-span-2 text-right">
                                {user.city ? `${user.city}, ${user.country}` : user.country || '-'}
                            </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 py-2">
                            <span className="text-slate-500 col-span-1 font-medium">Joined</span>
                            <span className="text-slate-800 col-span-2 text-right">
                                {user.created_at ? new Date(user.created_at).toLocaleDateString('en-GB') : '-'}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="p-4 border-t border-slate-200/80 bg-slate-50/80 flex justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 bg-slate-200/70 text-slate-700 hover:bg-slate-200 rounded-xl font-semibold text-sm transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

const BroadcastModal = ({ isOpen, onClose, targetUser, onSend }) => {
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);

    if (!isOpen) return null;

    const handleSend = async () => {
        if (!message.trim()) return;
        setSending(true);
        try {
            await onSend({
                message,
                userIds: targetUser ? [targetUser.id] : [],
                sendToAll: !targetUser
            });
            setMessage('');
            onClose();
        } finally {
            setSending(false);
        }
    };

    return (
        <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl shadow-2xl border border-slate-200/80 w-full max-w-lg overflow-hidden flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-5 border-b border-slate-200/80 flex justify-between items-center bg-slate-50/80">
                    <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                        <Mail className="w-5 h-5 text-indigo-600" />
                        <span>
                            {targetUser
                                ? `Message to: ${targetUser.display_name}`
                                : 'Broadcast Message (All Users)'}
                        </span>
                    </h3>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="ปิดหน้าต่างส่งข้อความ"
                        className="p-1.5 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                    >
                        <X size={20} />
                    </button>
                </div>
                <div className="p-5">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Message</label>
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type your message here..."
                        rows="5"
                        className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-50/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 text-sm text-slate-900 placeholder:text-slate-500"
                    />
                </div>
                <div className="p-4 bg-slate-50/80 border-t border-slate-200/80 flex justify-end gap-2.5">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 border border-slate-300 bg-white rounded-xl text-slate-700 hover:bg-slate-100 font-semibold text-sm"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleSend}
                        disabled={sending || !message.trim()}
                        className={`px-5 py-2 rounded-xl font-semibold text-sm text-white inline-flex items-center gap-2 transition-all ${
                            sending || !message.trim()
                                ? 'bg-indigo-400 cursor-not-allowed'
                                : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 shadow-sm'
                        }`}
                    >
                        {sending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                        <span>{sending ? 'Sending...' : 'Send'}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

const UserManager = () => {
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState('users');
    const [editingPermissionsUser, setEditingPermissionsUser] = useState(null);
    const [viewingHistoryUser, setViewingHistoryUser] = useState(null);
    const [historyData, setHistoryData] = useState(null);
    const [viewingLogsUser, setViewingLogsUser] = useState(null);
    const [logsData, setLogsData] = useState(null);
    const [isLogsLoading, setIsLogsLoading] = useState(false);
    const [viewingProfileUser, setViewingProfileUser] = useState(null);
    const [isAddAdminModalOpen, setIsAddAdminModalOpen] = useState(false);

    // Broadcast Modal States
    const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
    const [broadcastTargetUser, setBroadcastTargetUser] = useState(null);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 50;

    const [sortConfig, setSortConfig] = useState({ key: 'last_active_at', direction: 'desc' });

    useEffect(() => {
        const hasModal =
            isAddAdminModalOpen ||
            editingPermissionsUser ||
            viewingHistoryUser ||
            viewingLogsUser ||
            viewingProfileUser ||
            isBroadcastModalOpen;
        if (!hasModal) return undefined;

        const onKeyDown = (e) => {
            if (e.key === 'Escape') {
                setIsAddAdminModalOpen(false);
                setEditingPermissionsUser(null);
                setViewingHistoryUser(null);
                setHistoryData(null);
                setViewingLogsUser(null);
                setLogsData(null);
                setViewingProfileUser(null);
                setIsBroadcastModalOpen(false);
            }
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [
        isAddAdminModalOpen,
        editingPermissionsUser,
        viewingHistoryUser,
        viewingLogsUser,
        viewingProfileUser,
        isBroadcastModalOpen
    ]);

    const handleSort = (key) => {
        let direction = 'desc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'desc') {
            direction = 'asc';
        }
        setSortConfig({ key, direction });
    };

    const { data: users = [], isLoading, isFetching, refetch } = useQuery({
        queryKey: ['users'],
        queryFn: adminApi.getUsers,
        staleTime: 1000 * 60 * 10,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        refetchOnMount: false,
        retry: 1
    });

    const broadcastMutation = useMutation({
        mutationFn: adminApi.broadcastMessage,
        onSuccess: () => {
            toast.success('Message sent successfully');
        },
        onError: (err) => toast.error(`Failed to send message: ${err.response?.data?.message || err.message}`)
    });

    const handleSendBroadcast = async (data) => {
        await broadcastMutation.mutateAsync(data);
    };

    const updateUserMutation = useMutation({
        mutationFn: ({ id, data }) => adminApi.updateUser(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['users']);
            toast.success('User updated successfully');
        },
        onError: () => toast.error('Failed to update user')
    });

    const updatePermissionsMutation = useMutation({
        mutationFn: ({ id, permissions }) => adminApi.updateUserPermissions(id, permissions),
        onSuccess: () => {
            queryClient.invalidateQueries(['users']);
            setEditingPermissionsUser(null);
            toast.success('Permissions updated');
        },
        onError: () => toast.error('Failed to update permissions')
    });

    const statusMutation = useMutation({
        mutationFn: ({ id, status }) => adminApi.updateUserStatus(id, status),
        onMutate: async ({ id, status }) => {
            await queryClient.cancelQueries(['users']);
            const previousUsers = queryClient.getQueryData(['users']);
            queryClient.setQueryData(['users'], (old) =>
                old ? old.map((u) => (u.id === id ? { ...u, status } : u)) : []
            );
            return { previousUsers };
        },
        onError: (err, variables, context) => {
            queryClient.setQueryData(['users'], context.previousUsers);
            toast.error(`Failed to update status: ${err.response?.data?.message || err.message}`);
        },
        onSettled: () => {
            queryClient.invalidateQueries(['users']);
        },
        onSuccess: (data, variables) => {
            toast.success(`User ${variables.status === 'banned' ? 'banned' : 'activated'} successfully`);
        }
    });

    const handleUpgrade = (id) => {
        if (window.confirm('Manually upgrade this user to Premium?')) {
            const oneMonthFromNow = new Date();
            oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);

            updateUserMutation.mutate({
                id,
                data: {
                    plan_type: 'premium',
                    premium_start_date: new Date().toISOString(),
                    premium_expiry: oneMonthFromNow.toISOString()
                }
            });
        }
    };

    const handleRevokePremium = (id) => {
        if (window.confirm('Are you sure you want to remove Premium status from this user?')) {
            updateUserMutation.mutate({
                id,
                data: {
                    plan_type: 'free',
                    premium_start_date: null,
                    premium_expiry: null
                }
            });
        }
    };

    const handleStatusChange = (id, currentStatus) => {
        const newStatus = currentStatus === 'banned' ? 'active' : 'banned';
        const action = newStatus === 'banned' ? 'Ban' : 'Activate';

        if (window.confirm(`Are you sure you want to ${action} this user?`)) {
            statusMutation.mutate({ id, status: newStatus });
        }
    };

    const handleDemote = (id) => {
        if (window.confirm('Are you sure you want to remove Admin privileges from this user?')) {
            updateUserMutation.mutate({ id, data: { role: 'user' } });
        }
    };

    const handlePromoteAdmin = (id) => {
        if (window.confirm('Promote this user to Admin?')) {
            updateUserMutation.mutate({ id, data: { role: 'admin' } });
            setIsAddAdminModalOpen(false);
        }
    };

    const handleSavePermissions = (id, permissions) => {
        updatePermissionsMutation.mutate({ id, permissions });
    };

    const handleViewLogs = async (user) => {
        try {
            setIsLogsLoading(true);
            const response = await adminApi.getUserLogs(user.id);
            if (response.success) {
                setLogsData(response.logs);
                setViewingLogsUser(user);
            }
        } catch (error) {
            toast.error('Failed to load logs');
        } finally {
            setIsLogsLoading(false);
        }
    };

    const handleViewHistory = async (user) => {
        try {
            const data = await adminApi.getUserHistory(user.id);
            setHistoryData(data);
            setViewingHistoryUser(user);
        } catch (error) {
            toast.error('Failed to load history');
        }
    };

    const handleViewProfile = (user) => {
        setViewingProfileUser(user);
    };

    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    // Category Counts
    const counts = {
        users: (users || []).filter((u) => u.role !== 'admin' && u.role !== 'sponsor' && !isGuest(u)).length,
        guests: (users || []).filter((u) => isGuest(u) && !isForeignGuest(u)).length,
        foreignGuests: (users || []).filter((u) => isForeignGuest(u)).length,
        sponsors: (users || []).filter((u) => u.role === 'sponsor').length,
        admins: (users || []).filter((u) => u.role === 'admin').length
    };

    const filteredUsers = (users || []).filter((user) => {
        if (activeTab === 'sponsors' && user.role !== 'sponsor') return false;
        if (activeTab === 'admins' && user.role !== 'admin') return false;

        if (activeTab === 'guests') {
            if (!isGuest(user) || isForeignGuest(user)) return false;
        }
        if (activeTab === 'foreign_guests') {
            if (!isForeignGuest(user)) return false;
        }

        if (activeTab === 'users' && (user.role === 'sponsor' || user.role === 'admin' || isGuest(user))) {
            return false;
        }

        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            const matchesName = (user.name || user.display_name || '').toLowerCase().includes(searchLower);
            const matchesEmail = (user.email || '').toLowerCase().includes(searchLower);
            const matchesBusiness = (user.business_name || '').toLowerCase().includes(searchLower);
            const matchesPublicId = (user.public_id || '').toLowerCase().includes(searchLower);

            if (!matchesName && !matchesEmail && !matchesBusiness && !matchesPublicId) return false;
        }

        if (filterStatus !== 'all') {
            if (filterStatus === 'banned' && user.status !== 'banned') return false;
            if (filterStatus === 'active' && user.status === 'banned') return false;
        }

        return true;
    });

    // Sorting Logic
    const sortedUsers = [...filteredUsers].sort((a, b) => {
        if (!sortConfig) return 0;
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        if (sortConfig.key === 'last_active_at') {
            aValue = aValue || a.updated_at || a.created_at || '';
            bValue = bValue || b.updated_at || b.created_at || '';
        }

        if (aValue < bValue) {
            return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
            return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
    });

    // Pagination Logic
    const totalPages = Math.ceil(sortedUsers.length / itemsPerPage);
    const paginatedUsers = sortedUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    React.useEffect(() => {
        setCurrentPage(1);
    }, [activeTab, searchTerm, filterStatus]);

    const categoryTabs = [
        { id: 'users', label: `ผู้ใช้งาน (${counts.users})`, icon: GraduationCap },
        { id: 'guests', label: `Guest (${counts.guests})`, icon: Smartphone },
        { id: 'foreign_guests', label: `Guest Inter (${counts.foreignGuests})`, icon: Globe },
        { id: 'sponsors', label: `ผู้สนับสนุน (${counts.sponsors})`, icon: Briefcase },
        { id: 'admins', label: `ผู้ดูแลระบบ (${counts.admins})`, icon: Shield }
    ];

    return (
        <div className="space-y-6">
            {/* Executive Page Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 rounded-2xl bg-white/90 backdrop-blur-sm p-6 border border-slate-200/80 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 text-white shadow-lg shadow-violet-500/25">
                        <Users size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                            จัดการสมาชิกและสิทธิ์การใช้งาน (User Management)
                        </h2>
                        <p className="text-sm text-slate-500 mt-0.5">
                            Manage members, guests, business sponsors, premium access, and admin permissions
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <button
                        type="button"
                        onClick={() => refetch()}
                        disabled={isFetching}
                        aria-label="รีเฟรชรายชื่อสมาชิก"
                        className="bg-white hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-xl text-sm font-semibold inline-flex items-center gap-2 shadow-sm transition-colors whitespace-nowrap border border-slate-200 disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                        title="Refresh users"
                    >
                        <RefreshCw size={15} className={isFetching ? 'animate-spin' : ''} />
                        <span>รีเฟรช</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setBroadcastTargetUser(null);
                            setIsBroadcastModalOpen(true);
                        }}
                        className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-4 py-2 rounded-xl text-sm font-semibold inline-flex items-center gap-2 shadow-sm transition-colors whitespace-nowrap border border-indigo-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                    >
                        <Mail size={15} />
                        <span>ประกาศ (Broadcast)</span>
                    </button>
                    {activeTab === 'admins' && (
                        <button
                            type="button"
                            onClick={() => setIsAddAdminModalOpen(true)}
                            className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white px-4 py-2 rounded-xl text-sm font-semibold inline-flex items-center gap-2 shadow-md shadow-indigo-500/20 transition-all whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                        >
                            <Shield size={15} />
                            <span>เพิ่มผู้ดูแล</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Search and Filter Toolbar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/90 backdrop-blur-sm p-4 rounded-2xl border border-slate-200/80 shadow-sm">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
                    <input
                        type="text"
                        placeholder="Search by Name, Email, or Public ID..."
                        aria-label="Search users"
                        className="block w-full pl-10 pr-9 py-2.5 border border-slate-200 rounded-xl bg-slate-50/70 placeholder:text-slate-500 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 text-sm transition-all text-slate-900"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                        <button
                            type="button"
                            onClick={() => setSearchTerm('')}
                            aria-label="ล้างคำค้นหา"
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <select
                            aria-label="Filter by account status"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="appearance-none pl-3.5 pr-9 py-2.5 border border-slate-200 rounded-xl bg-slate-50/70 focus:bg-white text-slate-700 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 cursor-pointer"
                        >
                            <option value="all">สถานะทั้งหมด</option>
                            <option value="active">ปกติ (Active)</option>
                            <option value="banned">ถูกระงับ (Banned)</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-2.5 pointer-events-none">
                            <Shield className="h-4 w-4 text-slate-500" />
                        </div>
                    </div>
                    <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">
                        พบ {sortedUsers.length.toLocaleString()} บัญชี
                    </span>
                </div>
            </div>

            {/* Segmented Pill Tabs */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm border border-slate-200/80 p-1.5 flex gap-1.5 overflow-x-auto">
                {categoryTabs.map((tab) => {
                    const Icon = tab.icon;
                    const active = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-semibold transition-all whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                                active
                                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-sm'
                                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                            }`}
                        >
                            <Icon size={17} />
                            <span>{tab.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* Users Table */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50/90 text-slate-700 border-b border-slate-200/80 text-xs uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4 font-bold w-16">ID</th>
                                <th className="px-6 py-4 font-bold">
                                    {activeTab === 'sponsors' ? 'ข้อมูลธุรกิจ' : 'ข้อมูลผู้ใช้'}
                                </th>
                                <th className="px-6 py-4 font-bold">สถานะ/บทบาท</th>
                                <th
                                    className="px-6 py-4 font-bold cursor-pointer hover:bg-slate-100 transition-colors group select-none"
                                    onClick={() => handleSort('last_active_at')}
                                >
                                    <div className="flex items-center">
                                        Last Active
                                        <span className="ml-1 text-slate-500 group-hover:text-slate-800">
                                            {sortConfig.key === 'last_active_at' ? (
                                                sortConfig.direction === 'asc' ? (
                                                    <ArrowUp size={14} className="text-indigo-600" />
                                                ) : (
                                                    <ArrowDown size={14} className="text-indigo-600" />
                                                )
                                            ) : (
                                                <ArrowDown size={14} className="opacity-0 group-hover:opacity-100" />
                                            )}
                                        </span>
                                    </div>
                                </th>
                                <th className="px-6 py-4 font-bold">Location</th>
                                <th className="px-6 py-4 font-bold">สถานะบัญชี</th>
                                <th className="px-6 py-4 font-bold text-right">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center text-slate-500">
                                        <div className="inline-flex items-center gap-2 font-medium">
                                            <Loader2 size={18} className="animate-spin text-indigo-600" />
                                            Loading users...
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center text-slate-500 font-medium">
                                        No {activeTab.replace('_', ' ')} found.
                                    </td>
                                </tr>
                            ) : (
                                paginatedUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-indigo-50/30 transition-colors">
                                        <td className="px-6 py-4 text-xs font-mono font-semibold text-slate-500">
                                            {user.id}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                {user.avatar ? (
                                                    <img
                                                        src={user.avatar}
                                                        alt={user.display_name || user.email || 'User Avatar'}
                                                        className="w-9 h-9 rounded-full object-cover mr-3 shadow-sm border border-slate-200 flex-shrink-0"
                                                    />
                                                ) : (
                                                    <div
                                                        className={`w-9 h-9 rounded-full flex items-center justify-center mr-3 flex-shrink-0 ${
                                                            activeTab === 'sponsors'
                                                                ? 'bg-indigo-100 text-indigo-600'
                                                                : activeTab === 'admins'
                                                                ? 'bg-violet-100 text-violet-700'
                                                                : activeTab === 'guests' ||
                                                                  activeTab === 'foreign_guests'
                                                                ? 'bg-slate-100 text-slate-600'
                                                                : 'bg-slate-200 text-slate-600'
                                                        }`}
                                                    >
                                                        {activeTab === 'sponsors' ? (
                                                            <Briefcase size={16} />
                                                        ) : activeTab === 'admins' ? (
                                                            <Shield size={16} />
                                                        ) : activeTab === 'guests' ||
                                                          activeTab === 'foreign_guests' ? (
                                                            <Smartphone size={16} />
                                                        ) : (
                                                            <User size={16} />
                                                        )}
                                                    </div>
                                                )}
                                                <div className="min-w-0">
                                                    <p className="font-bold text-slate-900 truncate">
                                                        {activeTab === 'sponsors'
                                                            ? user.business_name ||
                                                              user.display_name ||
                                                              'Unknown Business'
                                                            : user.name || user.display_name || 'Unknown'}
                                                    </p>
                                                    {activeTab === 'sponsors' && user.display_name && (
                                                        <p className="text-xs text-indigo-600 font-semibold truncate">
                                                            Owner: {user.display_name}
                                                        </p>
                                                    )}
                                                    <p className="text-xs text-slate-500 truncate">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col items-start gap-1.5">
                                                <div className="flex flex-wrap items-center gap-1.5">
                                                    {user.role === 'admin' && (
                                                        <span className="px-2.5 py-0.5 bg-violet-50 text-violet-700 border border-violet-200 rounded-full text-xs font-bold inline-flex items-center gap-1">
                                                            <Shield size={12} /> Admin
                                                        </span>
                                                    )}
                                                    {user.role === 'sponsor' && (
                                                        <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full text-xs font-bold inline-flex items-center gap-1">
                                                            <Briefcase size={12} /> Sponsor
                                                        </span>
                                                    )}
                                                    {(!user.role || user.role === 'user') && !isPremiumUser(user) && (
                                                        <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded-full text-xs font-semibold inline-flex items-center gap-1 border border-slate-200">
                                                            <User size={12} /> สมาชิกทั่วไป
                                                        </span>
                                                    )}

                                                    {(user.role === 'admin' || isPremiumUser(user)) && (
                                                        <span className="px-2.5 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-full text-xs font-bold inline-flex items-center gap-1">
                                                            <Crown size={12} className="text-amber-600" /> Premium
                                                        </span>
                                                    )}
                                                </div>

                                                {user.role === 'admin' &&
                                                    user.admin_permissions &&
                                                    user.admin_permissions.length > 0 && (
                                                        <span className="text-[11px] font-medium text-slate-500">
                                                            {user.admin_permissions.length} Permissions
                                                        </span>
                                                    )}

                                                {user.plan_type === 'premium' &&
                                                    (user.premium_start_date || user.premium_expiry) && (
                                                        <div className="text-[11px] text-slate-500 space-y-0.5">
                                                            {user.premium_start_date && (
                                                                <div>
                                                                    เริ่ม:{' '}
                                                                    {new Date(
                                                                        user.premium_start_date
                                                                    ).toLocaleDateString()}
                                                                </div>
                                                            )}
                                                            {user.premium_expiry &&
                                                                (new Date(user.premium_expiry) > new Date() ? (
                                                                    <div className="text-slate-600">
                                                                        วันหมดอายุ:{' '}
                                                                        {new Date(
                                                                            user.premium_expiry
                                                                        ).toLocaleDateString()}
                                                                    </div>
                                                                ) : (
                                                                    <div className="text-rose-600 font-semibold">
                                                                        หมดอายุแล้ว:{' '}
                                                                        {new Date(
                                                                            user.premium_expiry
                                                                        ).toLocaleDateString()}
                                                                    </div>
                                                                ))}
                                                        </div>
                                                    )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">
                                            <button
                                                type="button"
                                                onClick={() => handleViewLogs(user)}
                                                className="hover:text-indigo-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded px-1 transition-colors text-left font-medium"
                                                title="View System Log"
                                            >
                                                {user.last_active_at
                                                    ? new Date(user.last_active_at).toLocaleString('en-GB')
                                                    : user.updated_at
                                                    ? new Date(user.updated_at).toLocaleString('en-GB')
                                                    : user.created_at
                                                    ? new Date(user.created_at).toLocaleString('en-GB')
                                                    : '-'}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-slate-800 font-medium">
                                                {user.city ? `${user.city}, ${user.country}` : user.country || '-'}
                                            </div>
                                            {user.ip_address && (
                                                <div className="text-xs text-slate-500 font-mono">
                                                    {user.ip_address}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                                                    user.status === 'banned'
                                                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                                                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                }`}
                                            >
                                                {user.status || 'Active'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-1.5 whitespace-nowrap">
                                            <button
                                                type="button"
                                                onClick={() => handleViewHistory(user)}
                                                aria-label={`ดูประวัติของ ${user.display_name || user.email}`}
                                                className="text-slate-600 hover:bg-slate-100 p-2 rounded-xl transition-colors text-xs font-medium border border-slate-200 inline-flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                                                title="View History"
                                            >
                                                <GraduationCap size={14} />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleViewProfile(user)}
                                                aria-label={`ดูโปรไฟล์ของ ${user.display_name || user.email}`}
                                                className="text-sky-700 hover:bg-sky-50 p-2 rounded-xl transition-colors text-xs font-medium border border-sky-200 inline-flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
                                                title="View Profile"
                                            >
                                                <User size={14} />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setBroadcastTargetUser(user);
                                                    setIsBroadcastModalOpen(true);
                                                }}
                                                aria-label={`ส่งข้อความถึง ${user.display_name || user.email}`}
                                                className="text-indigo-700 hover:bg-indigo-50 p-2 rounded-xl transition-colors text-xs font-medium border border-indigo-200 inline-flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                                                title="Send Message"
                                            >
                                                <Mail size={14} />
                                            </button>
                                            {user.role === 'admin' && (
                                                <>
                                                    <button
                                                        type="button"
                                                        onClick={() => setEditingPermissionsUser(user)}
                                                        className="text-slate-700 hover:bg-slate-100 px-3 py-1.5 rounded-xl transition-colors text-xs font-semibold border border-slate-200 inline-flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                                                    >
                                                        <Lock size={12} /> กำหนดสิทธิ์
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDemote(user.id)}
                                                        className="text-amber-700 hover:bg-amber-50 px-3 py-1.5 rounded-xl transition-colors text-xs font-semibold border border-amber-200 inline-flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                                                    >
                                                        <User size={12} /> ลดระดับ
                                                    </button>
                                                </>
                                            )}
                                            {user.role !== 'admin' &&
                                                user.role !== 'sponsor' &&
                                                (!isPremiumUser(user) ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleUpgrade(user.id)}
                                                        className="text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl transition-colors text-xs font-semibold border border-indigo-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                                                    >
                                                        มอบพรีเมียม
                                                    </button>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRevokePremium(user.id)}
                                                        className="text-amber-700 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-xl transition-colors text-xs font-semibold border border-amber-200 inline-flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                                                    >
                                                        <CheckCircle size={12} /> ปลดพรีเมียม
                                                    </button>
                                                ))}

                                            <button
                                                type="button"
                                                onClick={() => handleStatusChange(user.id, user.status)}
                                                className={`${
                                                    user.status === 'banned'
                                                        ? 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-200'
                                                        : 'text-rose-700 bg-rose-50 hover:bg-rose-100 border-rose-200'
                                                } px-3 py-1.5 rounded-xl transition-colors text-xs font-semibold border inline-flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500`}
                                            >
                                                {user.status === 'banned' ? (
                                                    <>
                                                        <CheckCircle size={12} /> ปลดแบน
                                                    </>
                                                ) : (
                                                    <>
                                                        <Ban size={12} /> ระงับใช้งาน
                                                    </>
                                                )}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/70">
                        <span className="text-sm text-slate-600">
                            Showing page <span className="font-bold text-slate-900">{currentPage}</span> of{' '}
                            <span className="font-bold text-slate-900">{totalPages}</span>
                        </span>
                        <div className="flex space-x-2">
                            <button
                                type="button"
                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className={`px-3.5 py-1.5 text-sm font-semibold rounded-xl border transition-colors ${
                                    currentPage === 1
                                        ? 'bg-slate-100 text-slate-500 border-slate-200 opacity-50 cursor-not-allowed'
                                        : 'bg-white text-slate-700 border-slate-300 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 shadow-sm'
                                }`}
                            >
                                Previous
                            </button>
                            <button
                                type="button"
                                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className={`px-3.5 py-1.5 text-sm font-semibold rounded-xl border transition-colors ${
                                    currentPage === totalPages
                                        ? 'bg-slate-100 text-slate-500 border-slate-200 opacity-50 cursor-not-allowed'
                                        : 'bg-white text-slate-700 border-slate-300 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 shadow-sm'
                                }`}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {isAddAdminModalOpen && (
                <AddAdminModal
                    users={users}
                    onClose={() => setIsAddAdminModalOpen(false)}
                    onPromote={handlePromoteAdmin}
                />
            )}

            {editingPermissionsUser && (
                <PermissionsModal
                    user={editingPermissionsUser}
                    onClose={() => setEditingPermissionsUser(null)}
                    onSave={handleSavePermissions}
                />
            )}

            {viewingHistoryUser && historyData && (
                <HistoryModal
                    user={viewingHistoryUser}
                    history={historyData}
                    onClose={() => {
                        setViewingHistoryUser(null);
                        setHistoryData(null);
                    }}
                />
            )}

            {viewingLogsUser && logsData && (
                <LogModal
                    user={viewingLogsUser}
                    logs={logsData}
                    onRefresh={() => handleViewLogs(viewingLogsUser)}
                    isRefreshing={isLogsLoading}
                    onClose={() => {
                        setViewingLogsUser(null);
                        setLogsData(null);
                        setIsLogsLoading(false);
                    }}
                />
            )}

            {viewingProfileUser && (
                <ProfileModal user={viewingProfileUser} onClose={() => setViewingProfileUser(null)} />
            )}

            <BroadcastModal
                isOpen={isBroadcastModalOpen}
                onClose={() => setIsBroadcastModalOpen(false)}
                targetUser={broadcastTargetUser}
                onSend={handleSendBroadcast}
            />
        </div>
    );
};

export default UserManager;
