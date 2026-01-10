import React, { useState } from 'react';

const ExamConfig = ({ onStart }) => {
    const [config, setConfig] = useState({
        category: 'local_gov',
        subject: '',
        limit: 10,
        mode: 'practice',
    });

    const [subjects, setSubjects] = useState([]);
    const [categories, setCategories] = useState([]);

    React.useEffect(() => {
        const fetchData = async () => {
            try {
                const examService = (await import('../services/examService')).default;

                const [subjectsRes, categoriesRes] = await Promise.all([
                    examService.getSubjects(),
                    examService.getCategories()
                ]);

                if (subjectsRes.success) setSubjects(subjectsRes.data);
                if (categoriesRes.success) {
                    setCategories(categoriesRes.data);
                    // Set default category if available and current is hardcoded
                    if (categoriesRes.data.length > 0 && (config.category === 'local_gov' || !config.category)) {
                        setConfig(prev => ({ ...prev, category: categoriesRes.data[0] }));
                    }
                }
            } catch (error) {
                console.error('Error fetching exam config data:', error);
            }
        };
        fetchData();
    }, []);

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
                    <label className="block text-sm font-medium text-gray-900">Catalog</label>
                    <select
                        name="category"
                        value={config.category}
                        onChange={handleChange}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md text-gray-900 bg-white"
                    >
                        {categories.map((cat, index) => (
                            <option key={index} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-900">Subject</label>
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
