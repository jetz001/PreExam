import React, { useState, useEffect } from 'react';
import adminService from '../../services/adminService';
import examService from '../../services/examService';
import { Edit, Trash2, Plus, Search, X, Layers } from 'lucide-react';
import BulkQuestionModal from './BulkQuestionModal';

const QuestionManager = () => {
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [formData, setFormData] = useState({
        question_text: '',
        choice_a: '',
        choice_b: '',
        choice_c: '',
        choice_d: '',
        correct_answer: 'A',
        category: 'local_gov',
        subject: 'thai',
        skill: '', // New Skill Field
        explanation: '',
        difficulty: 50
    });

    useEffect(() => {
        fetchQuestions();
    }, []);

    const fetchQuestions = async () => {
        setLoading(true);
        try {
            const data = await examService.getQuestions({ limit: 100, orderBy: 'id' });
            setQuestions(data.data);
        } catch (error) {
            console.error('Error fetching questions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (question = null) => {
        if (question) {
            setCurrentQuestion(question);
            setFormData({
                question_text: question.question_text,
                choice_a: question.choice_a,
                choice_b: question.choice_b,
                choice_c: question.choice_c,
                choice_d: question.choice_d,
                correct_answer: question.correct_answer,
                category: question.category,
                subject: question.subject,
                skill: question.skill || '', // Load existing skill
                explanation: question.explanation || '',
                difficulty: question.difficulty || 50
            });
        } else {
            setCurrentQuestion(null);
            setFormData({
                question_text: '',
                choice_a: '',
                choice_b: '',
                choice_c: '',
                choice_d: '',
                correct_answer: 'A',
                category: 'local_gov',
                subject: 'thai',
                skill: '', // Reset skill
                explanation: '',
                difficulty: 50
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentQuestion(null);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (currentQuestion) {
                await adminService.updateQuestion(currentQuestion.id, formData);
                alert('Question updated successfully');
            } else {
                await adminService.createQuestion(formData);
                alert('Question created successfully');
            }
            handleCloseModal();
            fetchQuestions();
        } catch (error) {
            console.error('Error saving question:', error);
            alert('Failed to save question');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this question?')) {
            try {
                await adminService.deleteQuestion(id);
                fetchQuestions();
            } catch (error) {
                alert('Failed to delete question');
            }
        }
    };

    const filteredQuestions = questions.filter(q =>
        q.question_text.toLowerCase().includes(filter.toLowerCase()) ||
        q.category.toLowerCase().includes(filter.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">จัดการคลังข้อสอบ</h2>
                <div className="flex space-x-2">
                    <button
                        onClick={() => setIsBulkModalOpen(true)}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-green-700"
                    >
                        <Layers className="h-5 w-5 mr-2" />
                        เพิ่มชุดข้อสอบ
                    </button>
                    <button
                        onClick={() => handleOpenModal()}
                        className="bg-primary text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700"
                    >
                        <Plus className="h-5 w-5 mr-2" />
                        เพิ่มข้อสอบใหม่
                    </button>
                </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex items-center space-x-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                        type="text"
                        placeholder="ค้นหาข้อสอบ..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    />
                </div>
                <select className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary">
                    <option value="">ทุกหมวดหมู่</option>
                    <option value="local_gov">ท้องถิ่น</option>
                    <option value="ocsc">ก.พ.</option>
                </select>
            </div>

            <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">โจทย์</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Skill (Radar)</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">หมวดหมู่</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">จัดการ</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            <tr><td colSpan="6" className="text-center py-4">Loading...</td></tr>
                        ) : filteredQuestions.map((q) => (
                            <tr key={q.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{q.id}</td>
                                <td className="px-6 py-4 text-sm text-gray-900 max-w-md truncate">{q.question_text}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">{q.skill || '-'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <div className="flex flex-wrap gap-1">
                                        {q.category.split(',').filter(t => t.trim()).map((tag, idx) => (
                                            <span key={idx} className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${tag.trim() === 'local_gov' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                {tag.trim() === 'local_gov' ? 'ท้องถิ่น' : (tag.trim() === 'ocsc' ? 'ก.พ.' : tag.trim())}
                                            </span>
                                        ))}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {q.rating ? q.rating.toFixed(1) : '-'} ⭐
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button
                                        onClick={() => handleOpenModal(q)}
                                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                                    >
                                        <Edit className="h-5 w-5" />
                                    </button>
                                    <button onClick={() => handleDelete(q.id)} className="text-red-600 hover:text-red-900">
                                        <Trash2 className="h-5 w-5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
                        <h3 className="text-xl font-bold mb-4">{currentQuestion ? 'แก้ไขข้อสอบ' : 'เพิ่มข้อสอบใหม่'}</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">โจทย์</label>
                                <textarea
                                    name="question_text"
                                    value={formData.question_text}
                                    onChange={handleChange}
                                    required
                                    rows="3"
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-primary focus:border-primary"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">หมวดหมู่ (Tags)</label>
                                    <div className="mt-1 flex flex-wrap gap-2 border border-gray-300 rounded-md shadow-sm p-2 min-h-[42px]">
                                        {formData.category.split(',').filter(t => t.trim()).map((tag, index) => (
                                            <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                {tag.trim()}
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const newTags = formData.category.split(',').filter(t => t.trim());
                                                        newTags.splice(index, 1);
                                                        setFormData(prev => ({ ...prev, category: newTags.join(',') }));
                                                    }}
                                                    className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-blue-400 hover:bg-blue-200 hover:text-blue-500 focus:outline-none"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </span>
                                        ))}
                                        <input
                                            type="text"
                                            placeholder={formData.category ? "" : "พิมพ์แล้วกด Enter..."}
                                            className="flex-1 outline-none border-none min-w-[120px] text-sm focus:ring-0 p-0"
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    const val = e.target.value.trim();
                                                    if (val) {
                                                        const currentTags = formData.category.split(',').filter(t => t.trim());
                                                        if (!currentTags.includes(val)) {
                                                            setFormData(prev => ({
                                                                ...prev,
                                                                category: [...currentTags, val].join(',')
                                                            }));
                                                        }
                                                        e.target.value = '';
                                                    }
                                                }
                                            }}
                                        />
                                    </div>
                                    <p className="mt-1 text-xs text-gray-500">พิมพ์ชื่อหมวดหมู่แล้วกด Enter เพื่อเพิ่ม Tag</p>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">วิชา</label>
                                        <input
                                            type="text"
                                            name="subject"
                                            value={formData.subject}
                                            onChange={handleChange}
                                            placeholder="เช่น ภาษาไทย, ภาษาอังกฤษ"
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Skill (Radar Chart)</label>
                                        <input
                                            type="text"
                                            name="skill"
                                            value={formData.skill}
                                            onChange={handleChange}
                                            placeholder="e.g. Finance, Management"
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 border-blue-300 bg-blue-50"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">ใช้สำหรับจัดกลุ่มกราฟ Radar</p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">ตัวเลือก A</label>
                                    <input
                                        type="text"
                                        name="choice_a"
                                        value={formData.choice_a}
                                        onChange={handleChange}
                                        required
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">ตัวเลือก B</label>
                                    <input
                                        type="text"
                                        name="choice_b"
                                        value={formData.choice_b}
                                        onChange={handleChange}
                                        required
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">ตัวเลือก C</label>
                                    <input
                                        type="text"
                                        name="choice_c"
                                        value={formData.choice_c}
                                        onChange={handleChange}
                                        required
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">ตัวเลือก D</label>
                                    <input
                                        type="text"
                                        name="choice_d"
                                        value={formData.choice_d}
                                        onChange={handleChange}
                                        required
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">คำตอบที่ถูกต้อง</label>
                                <select
                                    name="correct_answer"
                                    value={formData.correct_answer}
                                    onChange={handleChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                >
                                    <option value="A">A</option>
                                    <option value="B">B</option>
                                    <option value="C">C</option>
                                    <option value="D">D</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">คำอธิบายเฉลย (Optional)</label>
                                <textarea
                                    name="explanation"
                                    value={formData.explanation}
                                    onChange={handleChange}
                                    rows="2"
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                />
                            </div>

                            <div className="flex justify-end space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
                                >
                                    ยกเลิก
                                </button>
                                <button
                                    type="submit"
                                    className="bg-primary text-white px-4 py-2 rounded-md hover:bg-blue-700"
                                >
                                    บันทึก
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isBulkModalOpen && (
                <BulkQuestionModal
                    onClose={() => setIsBulkModalOpen(false)}
                    onSuccess={fetchQuestions}
                />
            )}
        </div>
    );
};

export default QuestionManager;
