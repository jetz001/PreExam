import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import {
    Database,
    Upload,
    RotateCcw,
    FileArchive,
    Clock,
    HardDrive,
    AlertTriangle,
    CheckCircle,
    History,
    XCircle,
    Plus
} from 'lucide-react';
import { getCurrentVersion } from '../../config/versionHistory';

const BackupManager = () => {
    const [activeTab, setActiveTab] = useState('manage'); // 'manage' | 'history'
    const [backups, setBackups] = useState([]);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [logsLoading, setLogsLoading] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [uploadFile, setUploadFile] = useState(null);

    useEffect(() => {
        if (activeTab === 'manage') {
            fetchBackups();
        } else {
            fetchLogs();
        }
    }, [activeTab]);

    const fetchBackups = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/backups');
            if (res.data.success) {
                setBackups(res.data.backups || []);
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to load backups');
        } finally {
            setLoading(false);
        }
    };

    const fetchLogs = async () => {
        setLogsLoading(true);
        try {
            const res = await api.get('/admin/backups/logs');
            if (res.data.success) {
                setLogs(res.data.logs || []);
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to load logs');
        } finally {
            setLogsLoading(false);
        }
    };

    const handleCreateBackup = async () => {
        if (!window.confirm('Create a new system backup? This might affect performance momentarily.')) return;

        setProcessing(true);
        const toastId = toast.loading('Creating backup...');
        try {
            const res = await api.post('/admin/backups', { version: getCurrentVersion() });
            if (res.data.success) {
                toast.success('Backup created successfully', { id: toastId });
                fetchBackups();
            } else {
                toast.error('Backup failed', { id: toastId });
            }
        } catch (error) {
            toast.error('Backup request failed', { id: toastId });
        } finally {
            setProcessing(false);
        }
    };

    const handleRestore = async (filename) => {
        if (!window.confirm(`DANGER: Are you sure you want to restore from ${filename}?\n\nCurrent data (Businesses, Community) will be overwritten/merged.\nServers will restart.`)) return;

        const userInput = window.prompt("Type 'RESTORE' to confirm:");
        if (userInput !== 'RESTORE') return;

        setProcessing(true);
        const toastId = toast.loading('Restoring data... Server will restart...');

        try {
            const res = await api.post('/admin/restore', { filename });
            if (res.data.success) {
                toast.success('Restore success! Reloading page in 5s...', { id: toastId });
                setTimeout(() => window.location.reload(), 5000);
            } else {
                toast.error('Restore failed', { id: toastId });
                setProcessing(false);
            }
        } catch (error) {
            toast.error('Restore request failed', { id: toastId });
            setProcessing(false);
        }
    };

    const handleUploadRestore = async () => {
        if (!uploadFile) return;
        if (!window.confirm(`DANGER: Restore from uploaded file ${uploadFile.name}?\nServers will restart.`)) return;

        setProcessing(true);
        const toastId = toast.loading('Uploading & Restoring...');
        const formData = new FormData();
        formData.append('backup_file', uploadFile);

        try {
            const res = await api.post('/admin/restore', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (res.data.success) {
                toast.success('Restore success! Reloading page in 5s...', { id: toastId });
                setTimeout(() => window.location.reload(), 5000);
            } else {
                toast.error(res.data.message || 'Restore failed', { id: toastId });
                setProcessing(false);
            }
        } catch (error) {
            toast.error('Upload failed', { id: toastId });
            setProcessing(false);
        }
    };

    return (
        <div className="space-y-6 pb-8">
            {/* Executive Page Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 rounded-2xl bg-white/90 backdrop-blur-sm p-5 sm:p-6 border border-slate-200/80 shadow-sm">
                <div className="flex items-center gap-3.5 min-w-0">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-500/20">
                        <Database size={24} />
                    </div>
                    <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight truncate">
                                ระบบสำรองข้อมูล (System Backup &amp; Restore)
                            </h2>
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/70">
                                v{getCurrentVersion()}
                            </span>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                            Manage database backups, manual restore archives, and view operation logs
                        </p>
                    </div>
                </div>

                {/* Segmented Pill Tabs + Primary Action */}
                <div className="flex flex-wrap items-center gap-3">
                    <div className="inline-flex items-center gap-1 rounded-xl bg-slate-100/90 p-1 border border-slate-200/80" role="tablist">
                        <button
                            type="button"
                            role="tab"
                            aria-selected={activeTab === 'manage'}
                            onClick={() => setActiveTab('manage')}
                            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                                activeTab === 'manage'
                                    ? 'bg-white text-indigo-700 shadow-sm'
                                    : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            <Database size={15} />
                            <span>Manage Backups</span>
                        </button>
                        <button
                            type="button"
                            role="tab"
                            aria-selected={activeTab === 'history'}
                            onClick={() => setActiveTab('history')}
                            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                                activeTab === 'history'
                                    ? 'bg-white text-indigo-700 shadow-sm'
                                    : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            <History size={15} />
                            <span>History Logs</span>
                        </button>
                    </div>

                    {activeTab === 'manage' && (
                        <button
                            type="button"
                            onClick={handleCreateBackup}
                            disabled={processing}
                            className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white px-5 py-2.5 rounded-xl shadow-md shadow-indigo-500/20 transition-all disabled:opacity-50 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                        >
                            {processing ? <RotateCcw className="animate-spin" size={17} /> : <Plus size={17} />}
                            <span>Create New Backup</span>
                        </button>
                    )}
                </div>
            </div>

            {activeTab === 'manage' ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Upload Section */}
                    <div className="rounded-2xl bg-white/90 backdrop-blur-sm p-6 border border-slate-200/80 shadow-sm md:col-span-1 flex flex-col">
                        <h3 className="font-bold text-base sm:text-lg text-slate-900 mb-4 flex items-center gap-2">
                            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-600 border border-amber-200/70">
                                <Upload size={17} />
                            </span>
                            <span>Manual Restore</span>
                        </h3>

                        <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:border-indigo-400 transition-colors bg-slate-50/70">
                            <input
                                type="file"
                                accept=".zip"
                                onChange={(e) => setUploadFile(e.target.files[0])}
                                className="hidden"
                                id="file-upload"
                            />
                            <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-2.5">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white border border-slate-200 text-indigo-600 shadow-sm">
                                    <FileArchive size={24} />
                                </div>
                                <span className="text-sm font-semibold text-slate-700 break-all">
                                    {uploadFile ? uploadFile.name : 'Click to upload backup .zip'}
                                </span>
                                <span className="text-xs text-slate-500">รองรับไฟล์ .zip สำรองข้อมูลระบบ</span>
                            </label>
                        </div>

                        <button
                            type="button"
                            onClick={handleUploadRestore}
                            disabled={!uploadFile || processing}
                            className="w-full mt-4 bg-amber-600 hover:bg-amber-700 text-white py-2.5 px-4 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                        >
                            Restore From File
                        </button>

                        <div className="mt-4 p-3.5 bg-rose-50/90 text-rose-800 text-xs rounded-xl border border-rose-200/80 flex items-start gap-2.5 leading-relaxed">
                            <AlertTriangle size={16} className="shrink-0 mt-0.5 text-rose-600" />
                            <p>Warning: Restore will overwrite existing Business/Community tables. User accounts are safe.</p>
                        </div>
                    </div>

                    {/* Backup List */}
                    <div className="rounded-2xl bg-white/90 backdrop-blur-sm border border-slate-200/80 shadow-sm md:col-span-2 overflow-hidden">
                        <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/80 flex justify-between items-center">
                            <h3 className="font-bold text-slate-900">Available Backups</h3>
                            <span className="text-xs font-mono font-semibold bg-white px-2.5 py-1 rounded-lg border border-slate-200 text-slate-600">
                                /backups
                            </span>
                        </div>

                        {loading ? (
                            <div className="p-10 text-center text-sm font-medium text-slate-500">Loading backups...</div>
                        ) : backups.length === 0 ? (
                            <div className="p-14 text-center">
                                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                                    <FileArchive size={24} />
                                </div>
                                <p className="text-sm font-semibold text-slate-700">No backups found. Create one now!</p>
                                <p className="text-xs text-slate-500 mt-1">ยังไม่มีไฟล์สำรองข้อมูลในระบบ</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {backups.map((backup, idx) => (
                                    <div
                                        key={idx}
                                        className="p-4 sm:p-5 hover:bg-indigo-50/30 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                                    >
                                        <div className="flex items-center gap-3.5 min-w-0">
                                            <div className="p-2.5 bg-indigo-50 text-indigo-600 border border-indigo-200/70 rounded-xl flex-shrink-0">
                                                <FileArchive size={20} />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-bold text-sm text-slate-900 truncate">{backup.name}</p>
                                                <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-slate-500 mt-1">
                                                    <span className="inline-flex items-center gap-1">
                                                        <HardDrive size={12} /> {backup.size}
                                                    </span>
                                                    <span className="inline-flex items-center gap-1">
                                                        <Clock size={12} /> {new Date(backup.created_at).toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            <button
                                                type="button"
                                                onClick={() => handleRestore(backup.name)}
                                                disabled={processing}
                                                aria-label={`Restore from ${backup.name}`}
                                                className="px-3.5 py-2 bg-white border border-rose-200 text-rose-700 hover:bg-rose-50 rounded-xl text-xs font-semibold transition-colors inline-flex items-center gap-1.5 shadow-sm disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                                            >
                                                <RotateCcw size={14} />
                                                <span>Restore</span>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="rounded-2xl bg-white/90 backdrop-blur-sm border border-slate-200/80 shadow-sm overflow-hidden">
                    <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/80">
                        <h3 className="font-bold text-slate-900 flex items-center gap-2">
                            <History size={18} className="text-indigo-600" />
                            <span>Activity Logs</span>
                        </h3>
                    </div>

                    {logsLoading ? (
                        <div className="p-10 text-center text-sm font-medium text-slate-500">Loading logs...</div>
                    ) : logs.length === 0 ? (
                        <div className="p-14 text-center">
                            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                                <History size={24} />
                            </div>
                            <p className="text-sm font-semibold text-slate-700">No logs found.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-left text-sm text-slate-700 divide-y divide-slate-200/80">
                                <thead className="bg-slate-50/90">
                                    <tr>
                                        <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-600">Time</th>
                                        <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-600">Action</th>
                                        <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-600">Status</th>
                                        <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-600">Details</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 bg-white">
                                    {logs.map((log) => (
                                        <tr key={log.id} className="hover:bg-indigo-50/30 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-xs font-medium text-slate-600">
                                                {new Date(log.created_at).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span
                                                    className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                                                        log.action === 'BACKUP_CREATE'
                                                            ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                                                            : 'bg-amber-50 text-amber-700 border-amber-200'
                                                    }`}
                                                >
                                                    {(log.action || '').replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {log.status === 'SUCCESS' ? (
                                                    <span className="inline-flex items-center gap-1.5 text-emerald-700 text-xs font-semibold">
                                                        <CheckCircle size={14} /> Success
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 text-rose-700 text-xs font-semibold">
                                                        <XCircle size={14} /> Failed
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <code
                                                    className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg text-xs block truncate max-w-xs border border-slate-200/70"
                                                    title={JSON.stringify(log.details, null, 2)}
                                                >
                                                    {JSON.stringify(log.details)}
                                                </code>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default BackupManager;
