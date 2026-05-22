import React, { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import adminService from '../../services/adminService';

const BulkQuestionModal = ({ onClose, onSuccess }) => {
    const [category, setCategory] = useState('local_gov');
    const [subject, setSubject] = useState('thai');
    const [questions, setQuestions] = useState([
        { question_text: '', choice_a: '', choice_b: '', choice_c: '', choice_d: '', correct_answer: 'A', explanation: '' }
    ]);
    const [loading, setLoading] = useState(false);

    const handleQuestionChange = (index, field, value) => {
        const newQuestions = [...questions];
        newQuestions[index][field] = value;
        setQuestions(newQuestions);
    };

    const addQuestion = () => {
        setQuestions([...questions, { question_text: '', choice_a: '', choice_b: '', choice_c: '', choice_d: '', correct_answer: 'A', explanation: '' }]);
    };

    const removeQuestion = (index) => {
        if (questions.length > 1) {
            const newQuestions = questions.filter((_, i) => i !== index);
            setQuestions(newQuestions);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Prepare data: add category and subject to each question
            const dataToSubmit = questions.map(q => ({
                ...q,
                category,
                subject
            }));

            await adminService.bulkCreateQuestions(dataToSubmit);
            alert('เพิ่มชุดข้อสอบเรียบร้อยแล้ว');
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Error bulk creating questions:', error);
            alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl p-6 max-h-[90vh] overflow-y-auto flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold">เพิ่มชุดข้อสอบ (Bulk Add)</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
                    {/* Global Settings */}
                    <div className="bg-gray-50 p-4 rounded-lg mb-4 grid grid-cols-2 gap-4 border border-gray-200">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">หมวดหมู่ (Tags)</label>
                            <div className="mt-1 flex flex-wrap gap-2 border border-gray-300 rounded-md shadow-sm p-2 min-h-[42px] bg-white">
                                {category.split(',').filter(t => t.trim()).map((tag, index) => (
                                    <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                        {tag.trim()}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const newTags = category.split(',').filter(t => t.trim());
                                                newTags.splice(index, 1);
                                                setCategory(newTags.join(','));
                                            }}
                                            className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-blue-400 hover:bg-blue-200 hover:text-blue-500 focus:outline-none"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </span>
                                ))}
                                <input
                                    type="text"
                                    placeholder={category ? "" : "พิมพ์แล้วกด Enter..."}
                                    className="flex-1 outline-none border-none min-w-[120px] text-sm focus:ring-0 p-0"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            const val = e.target.value.trim();
                                            if (val) {
                                                const currentTags = category.split(',').filter(t => t.trim());
                                                if (!currentTags.includes(val)) {
                                                    setCategory([...currentTags, val].join(','));
                                                }
                                                e.target.value = '';
                                            }
                                        }
                                    }}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">วิชา</label>
                            <input
                                type="text"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                required
                            />
                        </div>
                    </div>

                    {/* Questions List */}
                    <div className="space-y-6 flex-1 overflow-y-auto pr-2">
                        {questions.map((q, index) => (
                            <div key={index} className="border border-gray-200 rounded-lg p-4 relative hover:shadow-md transition-shadow">
                                <div className="absolute top-4 right-4">
                                    {questions.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeQuestion(index)}
                                            className="text-red-400 hover:text-red-600"
                                            title="ลบข้อนี้"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    )}
                                </div>
                                <h4 className="font-medium text-gray-700 mb-3">ข้อที่ {index + 1}</h4>

                                <div className="space-y-3">
                                    <div>
                                        <textarea
                                            placeholder="โจทย์คำถาม..."
                                            value={q.question_text}
                                            onChange={(e) => handleQuestionChange(index, 'question_text', e.target.value)}
                                            className="w-full border border-gray-300 rounded-md p-2 focus:ring-primary focus:border-primary"
                                            rows="2"
                                            required
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <input
                                            type="text"
                                            placeholder="ตัวเลือก A"
                                            value={q.choice_a}
                                            onChange={(e) => handleQuestionChange(index, 'choice_a', e.target.value)}
                                            className="border border-gray-300 rounded-md p-2"
                                            required
                                        />
                                        <input
                                            type="text"
                                            placeholder="ตัวเลือก B"
                                            value={q.choice_b}
                                            onChange={(e) => handleQuestionChange(index, 'choice_b', e.target.value)}
                                            className="border border-gray-300 rounded-md p-2"
                                            required
                                        />
                                        <input
                                            type="text"
                                            placeholder="ตัวเลือก C"
                                            value={q.choice_c}
                                            onChange={(e) => handleQuestionChange(index, 'choice_c', e.target.value)}
                                            className="border border-gray-300 rounded-md p-2"
                                            required
                                        />
                                        <input
                                            type="text"
                                            placeholder="ตัวเลือก D"
                                            value={q.choice_d}
                                            onChange={(e) => handleQuestionChange(index, 'choice_d', e.target.value)}
                                            className="border border-gray-300 rounded-md p-2"
                                            required
                                        />
                                    </div>
                                    <div className="flex space-x-4">
                                        <div className="w-1/4">
                                            <label className="block text-xs font-medium text-gray-500 mb-1">คำตอบ</label>
                                            <select
                                                value={q.correct_answer}
                                                onChange={(e) => handleQuestionChange(index, 'correct_answer', e.target.value)}
                                                className="w-full border border-gray-300 rounded-md p-2"
                                            >
                                                <option value="A">A</option>
                                                <option value="B">B</option>
                                                <option value="C">C</option>
                                                <option value="D">D</option>
                                            </select>
                                        </div>
                                        <div className="flex-1">
                                            <label className="block text-xs font-medium text-gray-500 mb-1">คำอธิบาย (Optional)</label>
                                            <input
                                                type="text"
                                                value={q.explanation}
                                                onChange={(e) => handleQuestionChange(index, 'explanation', e.target.value)}
                                                className="w-full border border-gray-300 rounded-md p-2"
                                                placeholder="อธิบายเฉลย..."
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
                        <button
                            type="button"
                            onClick={addQuestion}
                            className="flex items-center text-primary hover:text-blue-700 font-medium"
                        >
                            <Plus className="w-5 h-5 mr-1" /> เพิ่มข้ออีก
                        </button>
                        <div className="space-x-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
                            >
                                ยกเลิก
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-primary text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                            >
                                {loading ? 'กำลังบันทึก...' : 'บันทึกทั้งหมด'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BulkQuestionModal;
