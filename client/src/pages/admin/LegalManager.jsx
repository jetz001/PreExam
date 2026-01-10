import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ReactQuill from 'react-quill-new';
import 'react-quill/dist/quill.snow.css';
import { Save, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import adminApi from '../../services/adminApi';

const LegalManager = () => {
    const queryClient = useQueryClient();
    const [content, setContent] = useState('');

    const { data: policyData, isLoading } = useQuery({
        queryKey: ['privacyPolicy'],
        queryFn: adminApi.getPrivacyPolicy
    });

    useEffect(() => {
        if (policyData && policyData.content) {
            setContent(policyData.content);
        }
    }, [policyData]);

    const updateMutation = useMutation({
        mutationFn: adminApi.updatePrivacyPolicy,
        onSuccess: () => {
            queryClient.invalidateQueries(['privacyPolicy']);
            toast.success('Privacy Policy updated successfully');
        },
        onError: () => toast.error('Failed to update Privacy Policy')
    });

    const handleSave = () => {
        updateMutation.mutate(content);
    };

    const modules = {
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
            ['link', 'image'],
            ['clean']
        ],
    };



    if (isLoading) return <div className="p-8 text-center text-gray-500">Loading policy content...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <Shield className="text-royal-blue-600" />
                    Legal & Privacy Policy
                </h2>
                <button
                    onClick={handleSave}
                    disabled={updateMutation.isPending}
                    className="flex items-center px-6 py-2 bg-royal-blue-600 text-white rounded-lg hover:bg-royal-blue-700 transition-colors shadow-sm disabled:opacity-50"
                    style={{ backgroundColor: '#2563eb' }}
                >
                    <Save size={20} className="mr-2" />
                    {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                </button>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Policy Content</label>
                    <div className="h-[600px] mb-12">
                        <ReactQuill
                            theme="snow"
                            value={content}
                            onChange={setContent}
                            modules={modules}

                            className="h-full [&_.ql-editor]:text-slate-900"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LegalManager;
