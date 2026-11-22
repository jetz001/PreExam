import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    X,
    Filter,
    HelpCircle,
    FileQuestion,
    Bot,
    User,
    Upload,
    ArrowUp,
    ArrowDown,
    Loader2,
    Users,
    Layers,
    ImagePlus
} from 'lucide-react';
import toast from 'react-hot-toast';
import adminApi from '../../services/adminApi';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import GeneratorManager from './GeneratorManager';
import BulkQuestionModal from '../../components/admin/BulkQuestionModal';

const QuestionManager = () => {
    const queryClient = useQueryClient();
    const [filters, setFilters] = useState({ subject: '', category: '', exam_set: '', search: '' });
    const [localSearch, setLocalSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
    const [isGuideOpen, setIsGuideOpen] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState(null);
    const [uploadingTarget, setUploadingTarget] = useState(null);
    const [activeTab, setActiveTab] = useState('questions');
    const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'desc' });
    const [examSetsMeta, setExamSetsMeta] = useState([]);

    useEffect(() => {
        if (!isModalOpen && !isGuideOpen) return undefined;
        const onKeyDown = (e) => {
            if (e.key === 'Escape') {
                if (isGuideOpen) setIsGuideOpen(false);
                else if (isModalOpen) handleCloseModal();
            }
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isModalOpen, isGuideOpen]);

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const handleSearchCheck = () => {
        setFilters((prev) => ({ ...prev, search: localSearch }));
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSearchCheck();
        }
    };

    const [page, setPage] = useState(1);
    const limit = 50;

    // Initial Form State
    const initialFormState = {
        question_text: '',
        options: { a: '', b: '', c: '', d: '' },
        correct_answer: 'A',
        explanation: '',
        subject: 'General',
        skill: '',
        catalogs: '',
        category: '',
        exam_year: '',
        exam_set: ''
    };
    const [formData, setFormData] = useState(initialFormState);

    // Fetch Questions
    const { data: queryData, isLoading } = useQuery({
        queryKey: ['questions', filters, page, sortConfig.direction],
        queryFn: () => adminApi.getQuestions({ ...filters, page, limit, orderDir: sortConfig.direction })
    });

    const { data: userQuestionsData, isLoading: isLoadingUserQuestions } = useQuery({
        queryKey: ['user-questions'],
        queryFn: () => adminApi.getAllUserQuestions()
    });

    const systemQuestions = queryData?.rows || [];
    const systemTotalPages = queryData?.totalPages || 1;
    const systemTotalQuestions = queryData?.total || 0;

    const userQuestions = userQuestionsData?.data || [];

    const filteredAndSortedQuestions = React.useMemo(() => {
        let currentQuestions = activeTab === 'user_questions' ? userQuestions : systemQuestions;
        if (!currentQuestions) return [];
        let sortableItems = [...currentQuestions];

        if (activeTab === 'user_questions') {
            if (filters.search) {
                sortableItems = sortableItems.filter((q) =>
                    (q.question_text || '').toLowerCase().includes(filters.search.toLowerCase())
                );
            }
            if (filters.subject) {
                sortableItems = sortableItems.filter((q) => q.subject === filters.subject);
            }
            if (filters.category) {
                sortableItems = sortableItems.filter(
                    (q) => q.category === filters.category || (q.catalogs && q.catalogs.includes(filters.category))
                );
            }
            if (filters.exam_set) {
                sortableItems = sortableItems.filter((q) => q.exam_set === filters.exam_set);
            }
        }

        sortableItems.sort((a, b) => {
            let valA = a[sortConfig.key];
            let valB = b[sortConfig.key];

            if (sortConfig.key === 'id') {
                valA = Number(valA.toString().replace('uq_', ''));
                valB = Number(valB.toString().replace('uq_', ''));
            }

            if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
            if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });

        return sortableItems;
    }, [systemQuestions, userQuestions, sortConfig, activeTab, filters]);

    const userTotalQuestions = activeTab === 'user_questions' ? filteredAndSortedQuestions.length : 0;
    const userTotalPages = Math.max(1, Math.ceil(userTotalQuestions / limit));

    const totalPages = activeTab === 'user_questions' ? userTotalPages : systemTotalPages;
    const totalQuestions = activeTab === 'user_questions' ? userTotalQuestions : systemTotalQuestions;

    const sortedQuestions = React.useMemo(() => {
        if (activeTab === 'user_questions') {
            const startIndex = (page - 1) * limit;
            return filteredAndSortedQuestions.slice(startIndex, startIndex + limit);
        }
        return filteredAndSortedQuestions;
    }, [filteredAndSortedQuestions, activeTab, page, limit]);

    React.useEffect(() => {
        setPage(1);
    }, [filters]);

    // Fetch Filter Options
    const { data: subjects = [] } = useQuery({
        queryKey: ['subjects'],
        queryFn: adminApi.getSubjects
    });

    const { data: metaSetsRes } = useQuery({
        queryKey: ['examSetsMeta'],
        queryFn: () => adminApi.getExamSets()
    });
    React.useEffect(() => {
        if (metaSetsRes?.data) setExamSetsMeta(metaSetsRes.data);
    }, [metaSetsRes]);

    const { data: categories = [] } = useQuery({
        queryKey: ['categories'],
        queryFn: adminApi.getCategories
    });

    const invalidateQuestionQueries = () => {
        queryClient.invalidateQueries({ queryKey: ['questions'] });
        queryClient.invalidateQueries({ queryKey: ['user-questions'] });
        queryClient.invalidateQueries({ queryKey: ['subjects'] });
        queryClient.invalidateQueries({ queryKey: ['categories'] });
        queryClient.invalidateQueries({ queryKey: ['examSetsMeta'] });
    };

    // Mutations
    const createMutation = useMutation({
        mutationFn: adminApi.createQuestion,
        onSuccess: () => {
            invalidateQuestionQueries();
            toast.success('Question created successfully!');
            handleCloseModal();
        },
        onError: () => toast.error('Failed to create question')
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) =>
            String(id).startsWith('uq_') ? adminApi.updateUserQuestion(id, data) : adminApi.updateQuestion(id, data),
        onSuccess: () => {
            invalidateQuestionQueries();
            toast.success('Question updated successfully!');
            handleCloseModal();
        },
        onError: () => toast.error('Failed to update question')
    });

    const deleteMutation = useMutation({
        mutationFn: (id) =>
            String(id).startsWith('uq_') ? adminApi.deleteUserQuestion(id) : adminApi.deleteQuestion(id),
        onSuccess: () => {
            invalidateQuestionQueries();
            toast.success('Question deleted successfully!');
        },
        onError: () => toast.error('Failed to delete question')
    });

    const importMutation = useMutation({
        mutationFn: adminApi.importQuestions,
        onSuccess: (data) => {
            invalidateQuestionQueries();
            toast.success(data.message || 'Import successful!');
        },
        onError: () => toast.error('Failed to import questions')
    });

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.name.match(/\.(xlsx|xls|csv)$/i)) {
            toast.error('Please upload an Excel (.xlsx, .xls) or CSV file');
            return;
        }

        const uploadForm = new FormData();
        uploadForm.append('file', file);
        importMutation.mutate(uploadForm);
        e.target.value = null;
    };

    const handleR2ImageUpload = async (e, field) => {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('กรุณาเลือกไฟล์รูปภาพเท่านั้น');
            return;
        }

        setUploadingTarget(field);
        try {
            const res = await adminApi.uploadFileToR2(file);
            if (!res?.success || !res?.url) {
                throw new Error(res?.error || 'Upload failed');
            }
            const imgHtml = `<p><img src="${res.url}" alt="question-image" /></p>`;
            setFormData((prev) => ({
                ...prev,
                [field]: `${prev[field] || ''}${imgHtml}`
            }));
            toast.success('อัปโหลดรูปภาพลง R2 สำเร็จ');
        } catch (error) {
            toast.error('อัปโหลดรูปภาพไม่สำเร็จ: ' + (error.response?.data?.error || error.message));
        } finally {
            setUploadingTarget(null);
        }
    };

    const handleOpenModal = (question = null) => {
        if (question) {
            setEditingQuestion(question);
            let catalogsStr = '';
            if (question.catalogs && Array.isArray(question.catalogs)) {
                catalogsStr = question.catalogs.join(', ');
            } else if (question.category) {
                catalogsStr = question.category;
            }

            setFormData({
                ...question,
                catalogs: catalogsStr,
                skill: question.skill || '',
                exam_year: question.exam_year || '',
                exam_set: question.exam_set || '',
                correct_answer: String(question.correct_answer || 'A').toUpperCase(),
                options: {
                    a: question.choice_a || question.choices?.A || question.choices?.a || '',
                    b: question.choice_b || question.choices?.B || question.choices?.b || '',
                    c: question.choice_c || question.choices?.C || question.choices?.c || '',
                    d: question.choice_d || question.choices?.D || question.choices?.d || ''
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

        const catalogsArray = formData.catalogs
            ? formData.catalogs.split(',').map((s) => s.trim()).filter(Boolean)
            : [];

        const normalizedAnswer = String(formData.correct_answer || 'A').toUpperCase();
        const choicesObj = {
            A: formData.options?.a ?? '',
            B: formData.options?.b ?? '',
            C: formData.options?.c ?? '',
            D: formData.options?.d ?? ''
        };

        const payload = {
            ...formData,
            choices: choicesObj,
            choice_a: choicesObj.A,
            choice_b: choicesObj.B,
            choice_c: choicesObj.C,
            choice_d: choicesObj.D,
            correct_answer: normalizedAnswer,
            catalogs: catalogsArray,
            category: catalogsArray.length > 0 ? catalogsArray[0] : ''
        };
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

    const isSaving = createMutation.isPending || createMutation.isLoading || updateMutation.isPending || updateMutation.isLoading;
    const isImporting = importMutation.isPending || importMutation.isLoading;
    const isTableLoading = activeTab === 'user_questions' ? isLoadingUserQuestions : isLoading;
    const dynamicExamSetNames = Array.from(
        new Set(
            (examSetsMeta || [])
                .map((s) => s?.name)
                .filter((name) => name && name !== 'Mock Exam' && name !== 'Past Exam')
        )
    );

    const renderSortArrow = (key) => {
        if (sortConfig.key !== key) return null;
        return sortConfig.direction === 'asc' ? (
            <ArrowUp size={13} className="inline ml-1 text-indigo-600" />
        ) : (
            <ArrowDown size={13} className="inline ml-1 text-indigo-600" />
        );
    };

    return (
        <div className="space-y-6">
            {/* Executive Page Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 rounded-2xl bg-white/90 backdrop-blur-sm p-6 border border-slate-200/80 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/25">
                        <FileQuestion size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                            จัดการคลังข้อสอบ (Question Bank)
                        </h2>
                        <p className="text-sm text-slate-500 mt-0.5">
                            Manage system questions, user-contributed bank, Excel imports, and AI generator
                        </p>
                    </div>
                </div>

                {/* Segmented Pill Tabs */}
                <div className="bg-slate-100/90 rounded-2xl p-1.5 flex flex-wrap gap-1 border border-slate-200/70">
                    <button
                        type="button"
                        onClick={() => setActiveTab('questions')}
                        className={`px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                            activeTab === 'questions'
                                ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-sm'
                                : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
                        }`}
                    >
                        <FileQuestion size={16} />
                        <span>คลังข้อสอบหลัก (System)</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('user_questions')}
                        className={`px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                            activeTab === 'user_questions'
                                ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-sm'
                                : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
                        }`}
                    >
                        <Users size={16} />
                        <span>ข้อสอบจากผู้ใช้ ({userQuestions.length})</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('generator')}
                        className={`px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                            activeTab === 'generator'
                                ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-sm'
                                : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
                        }`}
                    >
                        <Bot size={16} />
                        <span>AI Generator</span>
                    </button>
                </div>
            </div>

            <div className={activeTab === 'generator' ? 'block' : 'hidden'}>
                <GeneratorManager />
            </div>

            <div className={activeTab === 'questions' || activeTab === 'user_questions' ? 'space-y-5 block' : 'hidden'}>
                {/* Action Toolbar */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-2.5">
                        <h3 className="text-lg font-bold text-slate-800">
                            {activeTab === 'user_questions' ? 'คลังข้อสอบผู้ใช้ (User Questions)' : 'รายการข้อสอบทั้งหมด'}
                        </h3>
                        <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200/70 text-indigo-700 text-xs font-bold">
                            {totalQuestions.toLocaleString()} ข้อ
                        </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <button
                            type="button"
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-white text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors text-sm font-semibold shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                            onClick={() => setIsGuideOpen(true)}
                        >
                            <HelpCircle size={16} className="text-indigo-600" />
                            <span>วิธีเพิ่มข้อสอบ</span>
                        </button>
                        <label className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl hover:bg-emerald-100 transition-colors cursor-pointer text-sm font-semibold border border-emerald-200 shadow-sm">
                            <input type="file" accept=".xlsx, .xls, .csv" className="hidden" onChange={handleFileUpload} disabled={isImporting} />
                            {isImporting ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                            <span>{isImporting ? 'Importing...' : 'Import Excel'}</span>
                        </label>
                        <button
                            type="button"
                            onClick={() => setIsBulkModalOpen(true)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-violet-50 text-violet-700 border border-violet-200 rounded-xl hover:bg-violet-100 transition-colors shadow-sm text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
                        >
                            <Layers size={16} />
                            <span>เพิ่มชุดข้อสอบ (Bulk Add)</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => handleOpenModal()}
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-xl transition-all shadow-md shadow-indigo-500/20 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                        >
                            <Plus size={16} />
                            <span>Add New Question</span>
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white/90 backdrop-blur-sm p-4 rounded-2xl shadow-sm border border-slate-200/80 flex flex-wrap gap-3 items-center">
                    <div className="flex items-center text-slate-600 mr-1">
                        <Filter size={18} className="mr-1.5 text-indigo-600" />
                        <span className="text-sm font-bold">Filters:</span>
                    </div>

                    <div className="relative flex items-center gap-2 flex-1 min-w-[240px] max-w-md">
                        <div className="relative flex-1">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={16} />
                            <input
                                type="text"
                                placeholder="Search questions..."
                                aria-label="Search questions"
                                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm bg-slate-50/70 focus:bg-white focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 outline-none text-slate-900 placeholder:text-slate-500 transition-all"
                                value={localSearch}
                                onChange={(e) => setLocalSearch(e.target.value)}
                                onKeyDown={handleKeyDown}
                            />
                        </div>
                        <button
                            type="button"
                            onClick={handleSearchCheck}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                        >
                            Search
                        </button>
                    </div>

                    <select
                        aria-label="Filter by subject"
                        className="border border-slate-200 rounded-xl px-3.5 py-2 text-sm bg-slate-50/70 focus:bg-white focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 outline-none text-slate-800"
                        value={filters.subject}
                        onChange={(e) => setFilters({ ...filters, subject: e.target.value })}
                    >
                        <option value="">All Subjects</option>
                        {subjects.map((sub, idx) => (
                            <option key={idx} value={sub}>
                                {sub}
                            </option>
                        ))}
                    </select>
                    <select
                        aria-label="Filter by category"
                        className="border border-slate-200 rounded-xl px-3.5 py-2 text-sm bg-slate-50/70 focus:bg-white focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 outline-none text-slate-800"
                        value={filters.category}
                        onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                    >
                        <option value="">All Categories</option>
                        {categories.map((cat, idx) => (
                            <option key={idx} value={cat}>
                                {cat}
                            </option>
                        ))}
                    </select>
                    <select
                        aria-label="Filter by exam set"
                        className="border border-slate-200 rounded-xl px-3.5 py-2 text-sm bg-slate-50/70 focus:bg-white focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 outline-none text-slate-800"
                        value={filters.exam_set}
                        onChange={(e) => setFilters({ ...filters, exam_set: e.target.value })}
                    >
                        <option value="">All Exam Sets</option>
                        <option value="Mock Exam">แนวข้อสอบ (Mock Exam)</option>
                        <option value="Past Exam">ข้อสอบจริง (Past Exam)</option>
                        {dynamicExamSetNames.map((name) => (
                            <option key={name} value={name}>
                                {name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Questions Table */}
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-600">
                            <thead className="bg-slate-50/90 text-slate-700 border-b border-slate-200/80 text-xs uppercase tracking-wider">
                                <tr>
                                    <th
                                        className="px-6 py-4 font-bold cursor-pointer hover:bg-slate-100 transition-colors whitespace-nowrap"
                                        onClick={() => handleSort('id')}
                                    >
                                        No. {renderSortArrow('id')}
                                    </th>
                                    <th
                                        className="px-6 py-4 font-bold cursor-pointer hover:bg-slate-100 transition-colors"
                                        onClick={() => handleSort('question_text')}
                                    >
                                        Question {renderSortArrow('question_text')}
                                    </th>
                                    <th
                                        className="px-6 py-4 font-bold cursor-pointer hover:bg-slate-100 transition-colors whitespace-nowrap"
                                        onClick={() => handleSort('skill')}
                                    >
                                        Skill (Radar) {renderSortArrow('skill')}
                                    </th>
                                    <th
                                        className="px-6 py-4 font-bold cursor-pointer hover:bg-slate-100 transition-colors whitespace-nowrap"
                                        onClick={() => handleSort('subject')}
                                    >
                                        Subject {renderSortArrow('subject')}
                                    </th>
                                    <th
                                        className="px-6 py-4 font-bold cursor-pointer hover:bg-slate-100 transition-colors whitespace-nowrap"
                                        onClick={() => handleSort('category')}
                                    >
                                        Category {renderSortArrow('category')}
                                    </th>
                                    <th
                                        className="px-6 py-4 font-bold cursor-pointer hover:bg-slate-100 transition-colors whitespace-nowrap"
                                        onClick={() => handleSort('difficulty')}
                                    >
                                        Difficulty {renderSortArrow('difficulty')}
                                    </th>
                                    <th className="px-6 py-4 font-bold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {isTableLoading ? (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-12 text-center text-slate-500">
                                            <div className="inline-flex items-center gap-2 font-medium">
                                                <Loader2 size={18} className="animate-spin text-indigo-600" />
                                                Loading questions...
                                            </div>
                                        </td>
                                    </tr>
                                ) : sortedQuestions.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-12 text-center text-slate-500 font-medium">
                                            No questions found.
                                        </td>
                                    </tr>
                                ) : (
                                    sortedQuestions.map((q) => (
                                        <tr key={q.id} className="hover:bg-indigo-50/30 transition-colors">
                                            <td className="px-6 py-4 font-semibold text-slate-600 whitespace-nowrap">
                                                #{q.id}
                                            </td>
                                            <td className="px-6 py-4 max-w-md">
                                                <div
                                                    className="font-medium text-slate-800 truncate"
                                                    dangerouslySetInnerHTML={{
                                                        __html: q.question_text ? q.question_text.replace(/<[^>]+>/g, '') : ''
                                                    }}
                                                />
                                                {activeTab === 'user_questions' && (
                                                    <div className="text-xs text-slate-500 mt-1 font-normal flex items-center gap-1">
                                                        <User size={12} className="text-indigo-500" />
                                                        <span>By: {q.user_display_name || q.user_email || q.user_id}</span>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-xs text-slate-600">{q.skill || '-'}</td>
                                            <td className="px-6 py-4 font-medium text-slate-700">{q.subject}</td>
                                            <td className="px-6 py-4">
                                                {Array.isArray(q.catalogs) && q.catalogs.length > 0 ? (
                                                    <div className="flex flex-wrap gap-1 items-center">
                                                        {q.catalogs.slice(0, 2).map((cat, idx) => (
                                                            <span
                                                                key={idx}
                                                                className="px-2.5 py-0.5 bg-slate-100 border border-slate-200/80 rounded-full text-xs font-medium text-slate-700"
                                                            >
                                                                {cat}
                                                            </span>
                                                        ))}
                                                        {q.catalogs.length > 2 && (
                                                            <span className="text-xs font-semibold text-slate-500">
                                                                +{q.catalogs.length - 2}
                                                            </span>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="px-2.5 py-0.5 bg-slate-100 border border-slate-200/80 rounded-full text-xs font-medium text-slate-700">
                                                        {typeof q.catalogs === 'string' ? q.catalogs : q.category || '-'}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span
                                                    className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                                                        q.difficulty === 'Hard'
                                                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                                                            : q.difficulty === 'Medium'
                                                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                                                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                    }`}
                                                >
                                                    {q.difficulty || 'Normal'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                                                <button
                                                    type="button"
                                                    onClick={() => handleOpenModal(q)}
                                                    aria-label={`แก้ไขข้อสอบ #${q.id}`}
                                                    title="Edit Question"
                                                    className="p-2 hover:bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-200/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                                                >
                                                    <Edit2 size={15} />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(q.id)}
                                                    aria-label={`ลบข้อสอบ #${q.id}`}
                                                    title="Delete Question"
                                                    className="p-2 hover:bg-rose-50 text-rose-600 rounded-xl border border-rose-200/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Controls */}
                    <div className="px-6 py-4 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/70">
                        <span className="text-sm text-slate-600">
                            Page <span className="font-bold text-slate-900">{page}</span> of{' '}
                            <span className="font-bold text-slate-900">{totalPages}</span> ({totalQuestions.toLocaleString()} items)
                        </span>
                        <div className="flex space-x-2">
                            <button
                                type="button"
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className={`px-3.5 py-1.5 text-sm font-semibold rounded-xl border transition-colors ${
                                    page === 1
                                        ? 'border-slate-200 text-slate-500 bg-slate-100 opacity-50 cursor-not-allowed'
                                        : 'border-slate-300 bg-white text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 shadow-sm'
                                }`}
                            >
                                Previous
                            </button>
                            <button
                                type="button"
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className={`px-3.5 py-1.5 text-sm font-semibold rounded-xl border transition-colors ${
                                    page === totalPages
                                        ? 'border-slate-200 text-slate-500 bg-slate-100 opacity-50 cursor-not-allowed'
                                        : 'border-slate-300 bg-white text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 shadow-sm'
                                }`}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Import Guide Modal */}
            {isGuideOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
                    onClick={() => setIsGuideOpen(false)}
                >
                    <div
                        className="bg-white rounded-2xl shadow-2xl border border-slate-200/80 w-full max-w-3xl max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between p-6 border-b border-slate-200/80 bg-slate-50/80 sticky top-0 z-10">
                            <h3 className="text-xl font-bold text-slate-900">Excel Import Guide</h3>
                            <button
                                type="button"
                                onClick={() => setIsGuideOpen(false)}
                                aria-label="ปิดคู่มือการนำเข้า"
                                className="p-1.5 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                            >
                                <X size={22} />
                            </button>
                        </div>
                        <div className="p-6 space-y-4 text-slate-600 text-sm">
                            <p>To import questions, upload an Excel file (.xlsx) with the following headers:</p>

                            <h4 className="font-bold text-slate-900 mt-4">Required Columns</h4>
                            <div className="overflow-x-auto rounded-xl border border-slate-200">
                                <table className="w-full text-sm border-collapse">
                                    <thead className="bg-slate-50 text-slate-700">
                                        <tr>
                                            <th className="border-b border-slate-200 p-2.5 text-left font-bold">Header</th>
                                            <th className="border-b border-slate-200 p-2.5 text-left font-bold">Description</th>
                                            <th className="border-b border-slate-200 p-2.5 text-left font-bold">Example</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        <tr><td className="p-2.5 font-mono text-indigo-700">Question Text</td><td className="p-2.5">The question content</td><td className="p-2.5">What is 2+2?</td></tr>
                                        <tr><td className="p-2.5 font-mono text-indigo-700">Option A</td><td className="p-2.5">Choice A</td><td className="p-2.5">3</td></tr>
                                        <tr><td className="p-2.5 font-mono text-indigo-700">Option B</td><td className="p-2.5">Choice B</td><td className="p-2.5">4</td></tr>
                                        <tr><td className="p-2.5 font-mono text-indigo-700">Option C</td><td className="p-2.5">Choice C</td><td className="p-2.5">5</td></tr>
                                        <tr><td className="p-2.5 font-mono text-indigo-700">Option D</td><td className="p-2.5">Choice D</td><td className="p-2.5">6</td></tr>
                                        <tr><td className="p-2.5 font-mono text-indigo-700">Correct Answer</td><td className="p-2.5">Correct choice (a,b,c,d)</td><td className="p-2.5">b</td></tr>
                                        <tr><td className="p-2.5 font-mono text-indigo-700">Subject</td><td className="p-2.5">Subject tag</td><td className="p-2.5">Math</td></tr>
                                        <tr><td className="p-2.5 font-mono text-indigo-700">Skill</td><td className="p-2.5">Skill for Radar Chart</td><td className="p-2.5">Critical Thinking</td></tr>
                                    </tbody>
                                </table>
                            </div>

                            <h4 className="font-bold text-slate-900 mt-4">Optional Columns</h4>
                            <ul className="list-disc pl-5 space-y-1 text-slate-600">
                                <li><strong>Catalogs:</strong> Comma-separated tags (e.g., &ldquo;Exam A, Local&rdquo;).</li>
                                <li><strong>Explanation:</strong> Explanation for the answer.</li>
                                <li><strong>Exam Year:</strong> Buddhist Year (e.g., 2567).</li>
                                <li><strong>Exam Set:</strong> &apos;Mock Exam&apos; or &apos;Past Exam&apos;.</li>
                            </ul>

                            <div className="bg-indigo-50 border border-indigo-200/70 p-4 rounded-xl text-sm text-indigo-800 mt-4">
                                <strong>Tip:</strong> The system tries to match headers flexibly (e.g., &ldquo;Question&rdquo;, &ldquo;Question Text&rdquo;, &ldquo;q&rdquo; all work).
                            </div>
                        </div>
                        <div className="p-5 border-t border-slate-100 flex justify-end bg-slate-50/70">
                            <button
                                type="button"
                                onClick={() => setIsGuideOpen(false)}
                                className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-violet-700 transition-all"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
                    onClick={handleCloseModal}
                >
                    <div
                        className="bg-white rounded-2xl shadow-2xl border border-slate-200/80 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between p-6 border-b border-slate-200/80 bg-slate-50/80 sticky top-0 z-20">
                            <h3 className="text-xl font-bold text-slate-900">
                                {editingQuestion ? 'Edit Question' : 'Add New Question'}
                            </h3>
                            <button
                                type="button"
                                onClick={handleCloseModal}
                                aria-label="ปิดหน้าต่างข้อสอบ"
                                className="p-1.5 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                            >
                                <X size={22} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            <div>
                                <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                                    <label className="block text-sm font-semibold text-slate-700">
                                        Question Text
                                    </label>
                                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/80 text-xs font-semibold cursor-pointer transition-colors">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            disabled={uploadingTarget === 'question_text'}
                                            onChange={(e) => handleR2ImageUpload(e, 'question_text')}
                                        />
                                        {uploadingTarget === 'question_text' ? (
                                            <Loader2 size={14} className="animate-spin" />
                                        ) : (
                                            <ImagePlus size={14} />
                                        )}
                                        <span>
                                            {uploadingTarget === 'question_text'
                                                ? 'กำลังอัปโหลด...'
                                                : 'อัปโหลดรูปภาพลง R2'}
                                        </span>
                                    </label>
                                </div>
                                <div className="bg-white text-slate-900 rounded-xl">
                                    <ReactQuill
                                        theme="snow"
                                        value={formData.question_text}
                                        onChange={(content) =>
                                            setFormData((prev) => ({ ...prev, question_text: content }))
                                        }
                                        modules={{
                                            toolbar: [
                                                [{ header: [1, 2, false] }],
                                                ['bold', 'italic', 'underline', 'strike'],
                                                [{ list: 'ordered' }, { list: 'bullet' }],
                                                ['link', 'image'],
                                                ['clean']
                                            ]
                                        }}
                                        className="mb-12"
                                        style={{ height: '250px', marginBottom: '60px' }}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {['a', 'b', 'c', 'd'].map((opt) => (
                                    <div key={opt}>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1">
                                            Option {opt.toUpperCase()}
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm bg-slate-50/60 focus:bg-white focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 outline-none text-slate-900"
                                            value={formData.options ? formData.options[opt] : ''}
                                            onChange={(e) =>
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    options: { ...(prev.options || {}), [opt]: e.target.value }
                                                }))
                                            }
                                        />
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                                        Correct Answer
                                    </label>
                                    <select
                                        className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm bg-slate-50/60 focus:bg-white focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 outline-none text-slate-900"
                                        value={String(formData.correct_answer || 'A').toUpperCase()}
                                        onChange={(e) =>
                                            setFormData((prev) => ({ ...prev, correct_answer: e.target.value }))
                                        }
                                    >
                                        <option value="A">Option A (ก)</option>
                                        <option value="B">Option B (ข)</option>
                                        <option value="C">Option C (ค)</option>
                                        <option value="D">Option D (ง)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                                        Subject
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm bg-slate-50/60 focus:bg-white focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 outline-none text-slate-900"
                                        value={formData.subject}
                                        onChange={(e) => setFormData((prev) => ({ ...prev, subject: e.target.value }))}
                                        placeholder="e.g. Math, English"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                                        Skill (Radar Chart)
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm bg-slate-50/60 focus:bg-white focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 outline-none text-slate-900"
                                        value={formData.skill}
                                        onChange={(e) => setFormData((prev) => ({ ...prev, skill: e.target.value }))}
                                        placeholder="e.g. Analysis, Critical Thinking"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                                        Exam Year (ปี)
                                    </label>
                                    <input
                                        type="number"
                                        className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm bg-slate-50/60 focus:bg-white focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 outline-none text-slate-900"
                                        value={formData.exam_year}
                                        onChange={(e) => setFormData((prev) => ({ ...prev, exam_year: e.target.value }))}
                                        placeholder="e.g. 2567"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                                        Exam Set (ชุดข้อสอบ)
                                    </label>
                                    <select
                                        className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm bg-slate-50/60 focus:bg-white focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 outline-none text-slate-900"
                                        value={formData.exam_set}
                                        onChange={(e) => setFormData((prev) => ({ ...prev, exam_set: e.target.value }))}
                                    >
                                        <option value="">Select Set...</option>
                                        <option value="Mock Exam">แนวข้อสอบ (Mock Exam)</option>
                                        <option value="Past Exam">ข้อสอบจริง (Past Exam)</option>
                                        {dynamicExamSetNames.map((name) => (
                                            <option key={name} value={name}>
                                                {name}
                                            </option>
                                        ))}
                                        {formData.exam_set &&
                                            formData.exam_set !== 'Mock Exam' &&
                                            formData.exam_set !== 'Past Exam' &&
                                            !dynamicExamSetNames.includes(formData.exam_set) && (
                                                <option value={formData.exam_set}>{formData.exam_set}</option>
                                            )}
                                    </select>
                                </div>
                                <div className="col-span-1 sm:col-span-2">
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                                        Catalogs (Tags)
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm bg-slate-50/60 focus:bg-white focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 outline-none text-slate-900"
                                        value={formData.catalogs}
                                        onChange={(e) => setFormData((prev) => ({ ...prev, catalogs: e.target.value }))}
                                        placeholder="e.g. Exam A, Local Gov (Separate with comma)"
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                                    <label className="block text-sm font-semibold text-slate-700">
                                        Explanation
                                    </label>
                                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/80 text-xs font-semibold cursor-pointer transition-colors">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            disabled={uploadingTarget === 'explanation'}
                                            onChange={(e) => handleR2ImageUpload(e, 'explanation')}
                                        />
                                        {uploadingTarget === 'explanation' ? (
                                            <Loader2 size={14} className="animate-spin" />
                                        ) : (
                                            <ImagePlus size={14} />
                                        )}
                                        <span>
                                            {uploadingTarget === 'explanation'
                                                ? 'กำลังอัปโหลด...'
                                                : 'อัปโหลดรูปภาพลง R2'}
                                        </span>
                                    </label>
                                </div>
                                <div className="bg-white">
                                    <ReactQuill
                                        theme="snow"
                                        value={formData.explanation}
                                        onChange={(content) =>
                                            setFormData((prev) => ({ ...prev, explanation: content }))
                                        }
                                        className="mb-12"
                                        style={{ height: '150px', marginBottom: '50px' }}
                                    />
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end space-x-3 relative z-10 bg-white border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="inline-flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-xl transition-all shadow-sm font-semibold text-sm disabled:opacity-60"
                                >
                                    {isSaving && <Loader2 size={15} className="animate-spin" />}
                                    <span>{editingQuestion ? 'Update Question' : 'Create Question'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isBulkModalOpen && (
                <BulkQuestionModal
                    onClose={() => setIsBulkModalOpen(false)}
                    onSuccess={invalidateQuestionQueries}
                />
            )}
        </div>
    );
};

export default QuestionManager;
