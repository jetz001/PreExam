import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const ExamConfig = ({ onStart }) => {
    const { user } = useAuth(); // Assuming useAuth hook exists
    const [config, setConfig] = useState({
        category: 'local_gov',
        subject: '',
        exam_year: '',
        exam_set: '',
        limit: 10,
        mode: 'practice',
    });

    const [subjects, setSubjects] = useState([]);
    const [categories, setCategories] = useState([]);
    const [years, setYears] = useState([]);
    const [sets, setSets] = useState([]);

    const isPremium = user?.plan_type === 'subscription' || user?.role === 'admin';

    // Initial Load - Subjects
    React.useEffect(() => {
        const fetchSubjects = async () => {
            try {
                const examService = (await import('../services/examService')).default;
                const subjectsRes = await examService.getSubjects();
                if (subjectsRes.success) setSubjects(subjectsRes.data);

                const [yearsRes, setsRes] = await Promise.all([
                    examService.getExamYears(),
                    examService.getExamSets()
                ]);
                if (yearsRes.success) setYears(yearsRes.data);
                if (setsRes.success) setSets(setsRes.data);
            } catch (error) {
                console.error('Error fetching initial data:', error);
            }
        };
        fetchSubjects();
    }, [isPremium]);

    // Dependent Dropdown: Fetch Categories when Subject changes
    React.useEffect(() => {
        const fetchCategories = async () => {
            try {
                const examService = (await import('../services/examService')).default;
                // Fetch categories filtered by selected subject
                const categoriesRes = await examService.getCategories({ subject: config.subject });

                if (categoriesRes.success) {
                    setCategories(categoriesRes.data);

                    // Auto-select first category if current selection is invalid for new list
                    // or if it's empty.
                    if (categoriesRes.data.length > 0) {
                        const isCurrentValid = categoriesRes.data.includes(config.category);
                        if (!config.category || !isCurrentValid) {
                            // Don't auto-set if "All" concept is desired, but here we enforce selection usually.
                            // Let's set default to first one to ensure valid state.
                            setConfig(prev => ({ ...prev, category: categoriesRes.data[0] }));
                        }
                    } else {
                        // No categories for this subject
                        setConfig(prev => ({ ...prev, category: '' }));
                    }
                }
            } catch (error) {
                console.error('Error fetching dependent categories:', error);
            }
        };
        fetchCategories();
    }, [config.subject]);

    const handleChange = (e) => {
        setConfig({ ...config, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onStart(config);
    };

    return (
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">ตั้งค่าการสอบ</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-900">หมวดหมู่</label>
                    <select
                        name="category"
                        value={config.category}
                        onChange={handleChange}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md text-gray-900 bg-white"
                    >
                        {categories.map((cat, index) => (
                            <option key={index} value={cat}>
                                {cat === 'local_gov' ? 'ความรู้พื้นฐานในการปฏิบัติราชการ' : cat}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-900">วิชา</label>
                    <select
                        name="subject"
                        value={config.subject}
                        onChange={handleChange}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md text-gray-900 bg-white"
                    >
                        <option value="">ทั้งหมด</option>
                        {subjects.map((subj, index) => (
                            <option key={index} value={subj}>{subj}</option>
                        ))}
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <label className="block text-sm font-medium text-gray-900">ปีข้อสอบ</label>
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-600">PREMIUM</span>
                        </div>
                        <select
                            name="exam_year"
                            value={config.exam_year}
                            onChange={handleChange}
                            disabled={!isPremium}
                            className={`block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md text-gray-900 bg-white ${!isPremium ? 'opacity-60 cursor-not-allowed bg-gray-100' : ''}`}
                        >
                            <option value="">ทั้งหมด</option>
                            {years.map((y, index) => (
                                <option key={index} value={y}>{y}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <label className="block text-sm font-medium text-gray-900">ชุดข้อสอบ</label>
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-600">PREMIUM</span>
                        </div>
                        <select
                            name="exam_set"
                            value={config.exam_set}
                            onChange={handleChange}
                            disabled={!isPremium}
                            className={`block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md text-gray-900 bg-white ${!isPremium ? 'opacity-60 cursor-not-allowed bg-gray-100' : ''}`}
                        >
                            <option value="">ทั้งหมด</option>
                            {sets.map((s, index) => (
                                <option key={index} value={s}>
                                    {s.trim() === 'Mock Exam' ? 'แนวข้อสอบ' : (s.trim() === 'Real Exam' || s.trim() === 'Past Exam') ? 'ข้อสอบจริง' : s}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-900">จำนวนข้อ</label>
                    <input
                        type="number"
                        name="limit"
                        value={config.limit}
                        onChange={handleChange}
                        min="1"
                        max="100"
                        className="mt-1 block w-full pl-3 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md text-gray-900 bg-white"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-900">โหมดการสอบ</label>
                    <div className="mt-2 space-y-2">
                        <div className="flex items-center">
                            <input
                                id="practice"
                                name="mode"
                                type="radio"
                                value="practice"
                                checked={config.mode === 'practice'}
                                onChange={handleChange}
                                className="focus:ring-primary h-4 w-4 text-primary border-gray-300"
                            />
                            <label htmlFor="practice" className="ml-3 block text-sm font-medium text-gray-900">
                                ฝึกฝน (เฉลยทันที)
                            </label>
                        </div>
                        <div className="flex items-center">
                            <input
                                id="simulation"
                                name="mode"
                                type="radio"
                                value="simulation"
                                checked={config.mode === 'simulation'}
                                onChange={handleChange}
                                className="focus:ring-primary h-4 w-4 text-primary border-gray-300"
                            />
                            <label htmlFor="simulation" className="ml-3 block text-sm font-medium text-gray-900">
                                จำลองสนามสอบ (จับเวลา/ไม่เฉลย)
                            </label>
                        </div>
                    </div>
                </div>
                <button
                    type="submit"
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                    เริ่มทำข้อสอบ
                </button>
            </form>
        </div>
    );
};

export default ExamConfig;
