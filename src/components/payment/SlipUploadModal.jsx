import React, { useState, useEffect } from 'react';
import { Upload, X, Check, Loader2, Receipt } from 'lucide-react';
import api from '../../services/api';

const SlipUploadModal = ({ isOpen, onClose, transactionId, onSuccess }) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!isOpen) return undefined;
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const handleUpload = async () => {
    if (!file || !transactionId) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('slip', file);
    formData.append('transaction_id', transactionId);

    try {
      const response = await api.post('/payments/upload-slip', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (response.data.success) {
        onSuccess(response.data.transaction);
        onClose();
      }
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload slip. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="slip-upload-title"
    >
      <div
        className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700/80 rounded-3xl shadow-2xl max-w-sm w-full p-6"
        style={{ fontFamily: "'Sarabun', 'Nunito', sans-serif" }}
      >
        <div className="flex justify-between items-center mb-5">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300">
              <Receipt size={18} />
            </span>
            <h3
              id="slip-upload-title"
              className="text-lg font-black text-slate-900 dark:text-white"
              style={{ fontFamily: "'Nunito', 'Sarabun', sans-serif" }}
            >
              อัปโหลดสลิปโอนเงิน
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="ปิดหน้าต่างอัปโหลดสลิป"
            className="p-1.5 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mb-6">
          <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-4 flex flex-col items-center justify-center min-h-[210px] bg-slate-50/80 dark:bg-slate-800/50 relative hover:border-indigo-400 transition-colors">
            {preview ? (
              <img src={preview} alt="Slip preview" className="max-h-[200px] rounded-xl object-contain" />
            ) : (
              <div className="text-center text-slate-500 dark:text-slate-400">
                <div className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300">
                  <Upload size={22} />
                </div>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                  คลิกเพื่อเลือกไฟล์สลิป
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  รองรับไฟล์รูปภาพ PNG, JPG
                </p>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              aria-label="เลือกไฟล์รูปภาพสลิปโอนเงิน"
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleUpload}
          disabled={!file || uploading}
          className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white py-3 rounded-xl font-black shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          {uploading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              <span>กำลังอัปโหลด...</span>
            </>
          ) : (
            <>
              <Check size={18} strokeWidth={2.5} />
              <span>ยืนยันการชำระเงิน</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default SlipUploadModal;
