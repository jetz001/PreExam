import React, { useState } from 'react';
import { Upload, X, Check } from 'lucide-react';
import api from '../../services/api';

const SlipUploadModal = ({ isOpen, onClose, transactionId, onSuccess }) => {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [uploading, setUploading] = useState(false);

    if (!isOpen) return null;

    const handleFileChange = (e) => {
        const selected = e.target.files[0];
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
                headers: { 'Content-Type': 'multipart/form-data' }
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 animate-fadeIn">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-gray-900">Upload Payment Slip</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={20} />
                    </button>
                </div>

                <div className="mb-6">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center min-h-[200px] bg-gray-50 relative">
                        {preview ? (
                            <img src={preview} alt="Slip" className="max-h-[200px] object-contain" />
                        ) : (
                            <div className="text-center text-gray-400">
                                <Upload size={32} className="mx-auto mb-2" />
                                <p className="text-sm">Click to select image</p>
                            </div>
                        )}
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                    </div>
                </div>

                <button
                    onClick={handleUpload}
                    disabled={!file || uploading}
                    className="w-full bg-primary text-white py-2 rounded-lg font-bold shadow hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
                >
                    {uploading ? 'Uploading...' : <><Check size={18} className="mr-2" /> Confirm Payment</>}
                </button>
            </div>
        </div>
    );
};

export default SlipUploadModal;
