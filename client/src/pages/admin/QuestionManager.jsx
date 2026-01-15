import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Edit2, Trash2, X, Check, Filter, HelpCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import adminApi from '../../services/adminApi';

const QuestionManager = () => {
    const queryClient = useQueryClient();
    const [filters, setFilters] = useState({ subject: '', category: '' });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isGuideOpen, setIsGuideOpen] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState(null);

    // Initial Form State
    const initialFormState = {
        question_text: '',
        options: { a: '', b: '', c: '', d: '' },
        correct_answer: 'a',
        explanation: '',
        subject: 'General',
        skill: '', // New Skill field
        catalogs: '', // Comma separated string for UI
        category: '', // Legacy
        exam_year: '',
        exam_set: ''
    };
    const [formData, setFormData] = useState(initialFormState);

    // Fetch Questions
    const { data: questions = [], isLoading } = useQuery({
        queryKey: ['questions', filters],
        queryFn: () => adminApi.getQuestions({ ...filters, orderBy: 'id' })
    });

    // Fetch Filter Options
    const { data: subjects = [] } = useQuery({
        queryKey: ['subjects'],
        queryFn: adminApi.getSubjects
    });

    const { data: categories = [] } = useQuery({
        queryKey: ['categories'],
        queryFn: adminApi.getCategories
    });

    // Mutations
    const createMutation = useMutation({
        mutationFn: adminApi.createQuestion,
        onSuccess: () => {
            queryClient.invalidateQueries(['questions']);
            toast.success('Question created successfully!');
            handleCloseModal();
        },
        onError: () => toast.error('Failed to create question')
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => adminApi.updateQuestion(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['questions']);
            toast.success('Question updated successfully!');
            handleCloseModal();
        },
        onError: () => toast.error('Failed to update question')
    });

    const deleteMutation = useMutation({
        mutationFn: adminApi.deleteQuestion,
        onSuccess: () => {
            queryClient.invalidateQueries(['questions']);
            toast.success('Question deleted successfully!');
        },
        onError: () => toast.error('Failed to delete question')
    });

    const importMutation = useMutation({
        mutationFn: adminApi.importQuestions,
        onSuccess: (data) => {
            queryClient.invalidateQueries(['questions']);
            toast.success(data.message || 'Import successful!');
        },
        onError: () => toast.error('Failed to import questions')
    });

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.name.match(/\.(xlsx|xls)$/)) {
            toast.error('Please upload an Excel file');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        importMutation.mutate(formData);
        e.target.value = null; // Reset input
    };

    const handleOpenModal = (question = null) => {
        if (question) {
            setEditingQuestion(question);
            // Convert catalogs array to comma-separated string for input
            let catalogsStr = '';
            if (question.catalogs && Array.isArray(question.catalogs)) {
                catalogsStr = question.catalogs.join(', ');
            } else if (question.category) {
                catalogsStr = question.category; // Fallback
            }

            setFormData({
                ...question,
                catalogs: catalogsStr,
                skill: question.skill || '',
                exam_year: question.exam_year || '',
                exam_set: question.exam_set || '',
                options: {
                    a: question.choice_a || '',
                    b: question.choice_b || '',
                    c: question.choice_c || '',
                    d: question.choice_d || ''
                }
            });
        } else {
            setEditingQuestion(null);
            setFormData(initialFormState);
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingQuestion(null);
        setFormData(initialFormState);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Process catalogs
        const catalogsArray = formData.catalogs
            ? formData.catalogs.split(',').map(s => s.trim()).filter(Boolean)
            : [];

        const payload = {
            ...formData,
            choice_a: formData.options.a,
            choice_b: formData.options.b,
            choice_c: formData.options.c,
            choice_d: formData.options.d,
            catalogs: catalogsArray,
            category: catalogsArray.length > 0 ? catalogsArray[0] : '' // Sync legacy
        };
        // Remove options object from payload to be clean
        delete payload.options;

        if (editingQuestion) {
            updateMutation.mutate({ id: editingQuestion.id, data: payload });
        } else {
            createMutation.mutate(payload);
        }
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this question?')) {
            deleteMutation.mutate(id);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-2xl font-bold text-slate-800">Question Bank</h2>
                <div className="flex gap-2">
                    <button
                        onClick={() => setIsGuideOpen(true)}
                        className="flex items-center px-3 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                        title="Import Guide"
                    >
                        <HelpCircle size={20} />
                    </button>
                    <label className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm cursor-pointer" style={{ backgroundColor: '#16a34a' }}>
                        <span className="mr-2">Import Excel</span>
                        <input type="file" accept=".xlsx, .xls" className="hidden" onChange={(e) => handleFileUpload(e)} />
                    </label>
                    <button
                        onClick={() => handleOpenModal()}
                        className="flex items-center px-4 py-2 bg-royal-blue-600 text-white rounded-lg hover:bg-royal-blue-700 transition-colors shadow-sm"
                        style={{ backgroundColor: '#2563eb' }}
                    >
                        <Plus size={20} className="mr-2" />
                        Add New Question
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-wrap gap-4 items-center">
                <div className="flex items-center text-slate-500">
                    <Filter size={20} className="mr-2" />
                    <span className="font-medium">Filters:</span>
                </div>
                <select
                    className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-royal-blue-500 outline-none text-slate-900"
                    value={filters.subject}
                    onChange={(e) => setFilters({ ...filters, subject: e.target.value })}
                >
                    <option value="">All Subjects</option>
                    {subjects.map((sub, idx) => (
                        <option key={idx} value={sub}>{sub}</option>
                    ))}
                </select>
                <select
                    className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-royal-blue-500 outline-none text-slate-900"
                    value={filters.category}
                    onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                >
                    <option value="">All Categories</option>
                    {categories.map((cat, idx) => (
                        <option key={idx} value={cat}>{cat}</option>
                    ))}
                </select>
            </div>

            {/* Questions Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 font-semibold">No.</th>
                                <th className="px-6 py-4 font-semibold">Question</th>
                                <th className="px-6 py-4 font-semibold">Skill (Radar)</th>
                                <th className="px-6 py-4 font-semibold">Subject</th>
                                <th className="px-6 py-4 font-semibold">Category</th>
                                <th className="px-6 py-4 font-semibold">Difficulty</th>
                                <th className="px-6 py-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-slate-500">Loading questions...</td>
                                </tr>
                            ) : questions.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-slate-500">No questions found.</td>
                                </tr>
                            ) : (
                                questions.map((q, index) => (
                                    <tr key={q.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-slate-500">#{q.id}</td>
                                        <td className="px-6 py-4 max-w-md truncate font-medium text-slate-800">{q.question_text}</td>
                                        <td className="px-6 py-4 text-xs text-slate-500">{q.skill || '-'}</td>
                                        <td className="px-6 py-4">{q.subject}</td>
                                        <td className="px-6 py-4">
                                            {(q.catalogs && q.catalogs.length > 0) ? (
                                                <div className="flex flex-wrap gap-1">
                                                    {q.catalogs.map((cat, idx) => (
                                                        <span key={idx} className="px-2 py-1 bg-slate-100 rounded text-xs text-slate-600">{cat}</span>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span className="px-2 py-1 bg-slate-100 rounded text-xs text-slate-600">{q.category}</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-xs font-medium 
                                                ${q.difficulty === 'Hard' ? 'bg-red-100 text-red-600' :
                                                    q.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-600' :
                                                        'bg-green-100 text-green-600'}`}>
                                                {q.difficulty || 'Normal'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            <button
                                                onClick={() => handleOpenModal(q)}
                                                className="p-1.5 hover:bg-royal-blue-100 text-royal-blue-600 rounded transition-colors"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(q.id)}
                                                className="p-1.5 hover:bg-red-100 text-red-500 rounded transition-colors"
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

            {/* Import Guide Modal */}
            {isGuideOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b border-slate-100">
                            <h3 className="text-xl font-bold text-slate-800">Excel Import Guide</h3>
                            <button onClick={() => setIsGuideOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="p-6 space-y-4 text-slate-600">
                            <p>To import questions, upload an Excel file (.xlsx) with the following headers:</p>

                            <h4 className="font-semibold text-slate-800 mt-4">Required Columns</h4>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm border-collapse border border-slate-200">
                                    <thead className="bg-slate-50">
                                        <tr>
                                            <th className="border p-2 text-left">Header</th>
                                            <th className="border p-2 text-left">Description</th>
                                            <th className="border p-2 text-left">Example</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr><td className="border p-2 font-mono">Question Text</td><td className="border p-2">The question content</td><td className="border p-2">What is 2+2?</td></tr>
                                        <tr><td className="border p-2 font-mono">Option A</td><td className="border p-2">Choice A</td><td className="border p-2">3</td></tr>
                                        <tr><td className="border p-2 font-mono">Option B</td><td className="border p-2">Choice B</td><td className="border p-2">4</td></tr>
                                        <tr><td className="border p-2 font-mono">Option C</td><td className="border p-2">Choice C</td><td className="border p-2">5</td></tr>
                                        <tr><td className="border p-2 font-mono">Option D</td><td className="border p-2">Choice D</td><td className="border p-2">6</td></tr>
                                        <tr><td className="border p-2 font-mono">Correct Answer</td><td className="border p-2">Correct choice (a,b,c,d)</td><td className="border p-2">b</td></tr>
                                        <tr><td className="border p-2 font-mono">Subject</td><td className="border p-2">Subject tag</td><td className="border p-2">Math</td></tr>
                                        <tr><td className="border p-2 font-mono">Skill</td><td className="border p-2">Skill for Radar Chart</td><td className="border p-2">Critical Thinking</td></tr>
                                    </tbody>
                                </table>
                            </div>

                            <h4 className="font-semibold text-slate-800 mt-4">Optional Columns</h4>
                            <ul className="list-disc pl-5 space-y-1">
                                <li><strong>Catalogs:</strong> Comma-separated tags (e.g., "Exam A, Local").</li>
                                <li><strong>Explanation:</strong> Explanation for the answer.</li>
                                <li><strong>Exam Year:</strong> Buddhist Year (e.g., 2567).</li>
                                <li><strong>Exam Set:</strong> 'Mock Exam' or 'Past Exam'.</li>
                            </ul>

                            <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-700 mt-4">
                                <strong>Tip:</strong> The system tries to match headers flexibly (e.g., "Question", "Question Text", "q" all work).
                            </div>
                        </div>
                        <div className="p-6 border-t border-slate-100 flex justify-end">
                            <button onClick={() => setIsGuideOpen(false)} className="px-4 py-2 bg-royal-blue-600 text-white rounded-lg hover:bg-royal-blue-700">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b border-slate-100">
                            <h3 className="text-xl font-bold text-slate-800">{editingQuestion ? 'Edit Question' : 'Add New Question'}</h3>
                            <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Question Text</label>
                                <textarea
                                    required
                                    className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-royal-blue-500 outline-none min-h-[100px] text-gray-900"
                                    placeholder="Enter the question here..."
                                    value={formData.question_text}
                                    onChange={(e) => setFormData({ ...formData, question_text: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {['a', 'b', 'c', 'd'].map((opt) => (
                                    <div key={opt}>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Option {opt.toUpperCase()}</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-royal-blue-500 outline-none text-gray-900"
                                            value={formData.options ? formData.options[opt] : ''}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                options: { ...(formData.options || {}), [opt]: e.target.value }
                                            })}
                                        />
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Correct Answer</label>
                                    <select
                                        className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-royal-blue-500 outline-none text-gray-900"
                                        value={formData.correct_answer}
                                        onChange={(e) => setFormData({ ...formData, correct_answer: e.target.value })}
                                    >
                                        <option value="a">Option A</option>
                                        <option value="b">Option B</option>
                                        <option value="c">Option C</option>
                                        <option value="d">Option D</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
                                    <input
                                        type="text"
                                        className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-royal-blue-500 outline-none text-gray-900"
                                        value={formData.subject}
                                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                        placeholder="e.g. Math, English"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Skill (Radar Chart)</label>
                                    <input
                                        type="text"
                                        className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-royal-blue-500 outline-none text-gray-900"
                                        value={formData.skill}
                                        onChange={(e) => setFormData({ ...formData, skill: e.target.value })}
                                        placeholder="e.g. Analysis, Critical Thinking"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Exam Year (ปี)</label>
                                    <input
                                        type="number"
                                        className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-royal-blue-500 outline-none text-gray-900"
                                        value={formData.exam_year}
                                        onChange={(e) => setFormData({ ...formData, exam_year: e.target.value })}
                                        placeholder="e.g. 2567"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Exam Set (ชุดข้อสอบ)</label>
                                    <select
                                        className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-royal-blue-500 outline-none text-gray-900"
                                        value={formData.exam_set}
                                        onChange={(e) => setFormData({ ...formData, exam_set: e.target.value })}
                                    >
                                        <option value="">Select Set...</option>
                                        <option value="Mock Exam">แนวข้อสอบ (Mock Exam)</option>
                                        <option value="Past Exam">ข้อสอบจริง (Past Exam)</option>
                                    </select>
                                </div>
                                <div className="col-span-1 sm:col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Catalogs (Tags)</label>
                                    <input
                                        type="text"
                                        className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-royal-blue-500 outline-none text-gray-900"
                                        value={formData.catalogs}
                                        onChange={(e) => setFormData({ ...formData, catalogs: e.target.value })}
                                        placeholder="e.g. Exam A, Local Gov (Separate with comma)"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Explanation</label>
                                <textarea
                                    className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-royal-blue-500 outline-none min-h-[80px] text-gray-900"
                                    placeholder="Explain why the answer is correct..."
                                    value={formData.explanation}
                                    onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                                />
                            </div>

                            <div className="pt-4 flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-royal-blue-600 text-white rounded-lg hover:bg-royal-blue-700 transition-colors shadow-sm font-medium"
                                    style={{ backgroundColor: '#2563eb' }}
                                >
                                    {editingQuestion ? 'Update Question' : 'Create Question'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default QuestionManager;
