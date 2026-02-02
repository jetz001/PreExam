import React, { useState, useEffect } from 'react';
import { api } from '../../services/api'; // Assuming generic api helper exists
import { toast } from 'react-hot-toast';
import {
    Database,
    Upload,
    Download,
    RotateCcw,
    FileArchive,
    Clock,
    HardDrive,
    AlertTriangle,
    CheckCircle
} from 'lucide-react';

const BackupManager = () => {
    const [backups, setBackups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [uploadFile, setUploadFile] = useState(null);

    useEffect(() => {
        fetchBackups();
    }, []);

    const fetchBackups = async () => {
        try {
            const res = await api.get('/admin/backups'); // Uses adminRoutes
            if (res.data.success) {
                setBackups(res.data.backups);
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to load backups');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateBackup = async () => {
        if (!window.confirm('Create a new system backup? This might affect performance momentarily.')) return;

        setProcessing(true);
        const toastId = toast.loading('Creating backup...');

        try {
            const res = await api.post('/admin/backups');
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
        if (!window.confirm(`⚠️ DANGER: Are you sure you want to restore from ${filename}?\n\nCurrent data (Businesses, Community) will be overwritten/merged.\nServers will restart.`)) return;

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
                setProcessing(false); // Only unset if failed, success implies reload
            }
        } catch (error) {
            toast.error('Restore request failed', { id: toastId });
            setProcessing(false);
        }
    };

    const handleUploadRestore = async () => {
        if (!uploadFile) return;
        if (!window.confirm(`⚠️ DANGER: Restore from uploaded file ${uploadFile.name}?\nServers will restart.`)) return;

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
        <div className="p-6 max-w-6xl mx-auto space-y-6">
            <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2 text-gray-800">
                        <Database className="text-blue-600" />
                        System Backup & Restore
                    </h1>
                    <p className="text-gray-500 mt-1">Manage database backups and restore points</p>
                </div>
                <button
                    onClick={handleCreateBackup}
                    disabled={processing}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg shadow-sm transition-all disabled:opacity-50 font-medium"
                >
                    {processing ? <RotateCcw className="animate-spin" size={20} /> : <CheckCircle size={20} />}
                    Create New Backup
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Upload Section */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 md:col-span-1">
                    <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
                        <Upload size={20} className="text-orange-500" />
                        Manual Restore
                    </h2>
                    <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-blue-400 transition-colors bg-gray-50">
                        <input
                            type="file"
                            accept=".zip"
                            onChange={(e) => setUploadFile(e.target.files[0])}
                            className="hidden"
                            id="file-upload"
                        />
                        <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-2">
                            <FileArchive size={40} className="text-gray-400" />
                            <span className="text-sm font-medium text-gray-600">
                                {uploadFile ? uploadFile.name : "Click to upload backup .zip"}
                            </span>
                        </label>
                    </div>
                    <button
                        onClick={handleUploadRestore}
                        disabled={!uploadFile || processing}
                        className="w-full mt-4 bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                    >
                        Restore From File
                    </button>
                    <div className="mt-4 p-3 bg-red-50 text-red-600 text-xs rounded-lg border border-red-100 flex items-start gap-2">
                        <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                        <p>Warning: Restore will overwrite existing Business/Community tables. User accounts are safe.</p>
                    </div>
                </div>

                {/* Backup List */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 md:col-span-2 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                        <h2 className="font-semibold text-gray-700">Available Backups</h2>
                        <span className="text-xs font-mono bg-white px-2 py-1 rounded border text-gray-500">
                            /backups
                        </span>
                    </div>

                    {loading ? (
                        <div className="p-10 text-center text-gray-400">Loading backups...</div>
                    ) : backups.length === 0 ? (
                        <div className="p-10 text-center text-gray-400">No backups found. Create one now!</div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {backups.map((backup, idx) => (
                                <div key={idx} className="p-4 hover:bg-blue-50 transition-colors flex items-center justify-between group">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                                            <FileArchive size={20} />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-800">{backup.name}</p>
                                            <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                                                <span className="flex items-center gap-1"><HardDrive size={12} /> {backup.size}</span>
                                                <span className="flex items-center gap-1"><Clock size={12} /> {new Date(backup.created_at).toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                        {/* Download via direct link if exposed, or API? Assuming VPS logic blocking direct access, might need download endpoint. 
                                            For now, just Restore button as requested. */}
                                        <button
                                            onClick={() => handleRestore(backup.name)}
                                            disabled={processing}
                                            className="px-3 py-1.5 bg-white border border-red-200 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 shadow-sm"
                                        >
                                            <RotateCcw size={14} /> Restore
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BackupManager;
