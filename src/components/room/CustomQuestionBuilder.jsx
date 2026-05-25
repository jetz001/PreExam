import React, { useState } from 'react';
import { Plus, Trash2, Upload, GripVertical } from 'lucide-react';

const CustomQuestionBuilder = ({ customQuestions, setCustomQuestions }) => {
    const [view, setView] = useState('list'); // 'list' | 'import'

    const handleAddQuestion = () => {
        setCustomQuestions([...customQuestions, {
            question_text: '',
            correct_answer: 'A',
            explanation: '',
            category: 'custom',
            subject: 'custom',
            difficulty: 50,
            choices: { A: '', B: '', C: '', D: '' }
        }]);
    };

    const handleRemoveQuestion = (index) => {
        const updated = [...customQuestions];
        updated.splice(index, 1);
        setCustomQuestions(updated);
    };

    const handleQuestionChange = (index, field, value) => {
        const updated = [...customQuestions];
        updated[index][field] = value;
        setCustomQuestions(updated);
    };

    const handleChoiceChange = (index, choiceKey, value) => {
        const updated = [...customQuestions];
        updated[index].choices[choiceKey] = value;
        setCustomQuestions(updated);
    };

    const handleCsvUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            const text = evt.target.result;
            // Simple CSV parser
            const rows = text.split('\n').filter(row => row.trim().length > 0);
            const parsed = rows.slice(1).map(row => {
                const cols = row.split(',').map(c => c.trim().replace(/^"|"$/g, ''));
                if (cols.length >= 6) {
                    return {
                        question_text: cols[0],
                        choices: { A: cols[1], B: cols[2], C: cols[3], D: cols[4] },
                        correct_answer: cols[5],
                        explanation: cols[6] || '',
                        category: 'custom',
                        subject: 'custom',
                        difficulty: 50
                    };
                }
                return null;
            }).filter(Boolean);
            
            setCustomQuestions([...customQuestions, ...parsed]);
            setView('list');
        };
        reader.readAsText(file);
    };

    return (
        <div className="w-full bg-white/5 border border-white/20 rounded-2xl p-4 mt-4 text-white">
            <div className="flex gap-4 justify-between items-center mb-4">
                <h4 className="font-bold text-lg">รายการข้อสอบของคุณ</h4>
                <div className="flex gap-2">
                    <button type="button" onClick={() => setView('import')} className="px-3 py-1.5 bg-blue-500/20 text-blue-300 rounded-xl hover:bg-blue-500/30 flex items-center gap-1 text-sm font-bold border border-blue-500/50">
                        <Upload size={16} /> นำเข้า (CSV)
                    </button>
                    <button type="button" onClick={handleAddQuestion} className="px-3 py-1.5 bg-green-500/20 text-green-300 rounded-xl hover:bg-green-500/30 flex items-center gap-1 text-sm font-bold border border-green-500/50">
                        <Plus size={16} /> เพิ่มข้อ
                    </button>
                </div>
            </div>

            {view === 'import' && (
                <div className="p-6 border-2 border-dashed border-white/30 rounded-xl text-center mb-4">
                    <Upload className="mx-auto mb-2 text-white/50" size={32} />
                    <p className="text-sm font-bold text-white/70 mb-4">อัปโหลดไฟล์ CSV เพื่อนำเข้าข้อสอบ<br/><span className="text-xs text-white/50">(รูปแบบ: โจทย์, ก, ข, ค, ง, คำตอบ(A/B/C/D), คำอธิบาย)</span></p>
                    <label className="cursor-pointer bg-white/20 hover:bg-white/30 px-6 py-2 rounded-xl text-white font-bold transition-all border border-white/20 inline-block">
                        เลือกไฟล์ CSV
                        <input type="file" accept=".csv" className="hidden" onChange={handleCsvUpload} />
                    </label>
                    <button type="button" onClick={() => setView('list')} className="block mx-auto mt-4 text-sm text-red-400 hover:underline">ยกเลิก</button>
                </div>
            )}

            {view === 'list' && (
                <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                    {customQuestions.length === 0 ? (
                        <div className="text-center p-8 text-white/50 font-bold border-2 border-dashed border-white/10 rounded-xl">
                            ยังไม่มีข้อสอบ กด "เพิ่มข้อ" หรือ "นำเข้า" เพื่อเริ่มต้น
                        </div>
                    ) : (
                        customQuestions.map((q, idx) => (
                            <div key={idx} className="bg-white/10 p-4 rounded-xl border border-white/20 relative group">
                                <div className="absolute top-2 right-2 flex gap-2">
                                    <button type="button" onClick={() => handleRemoveQuestion(idx)} className="text-white/30 hover:text-red-400 transition-colors p-1"><Trash2 size={16}/></button>
                                </div>
                                
                                <div className="flex gap-2 items-start mb-3">
                                    <div className="bg-white/20 text-white w-6 h-6 flex items-center justify-center rounded-full font-bold text-xs shrink-0 mt-2">{idx + 1}</div>
                                    <textarea 
                                        value={q.question_text} 
                                        onChange={(e) => handleQuestionChange(idx, 'question_text', e.target.value)} 
                                        className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white outline-none focus:border-white/50" 
                                        placeholder="พิมพ์โจทย์คำถาม..."
                                        rows={2}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-2 pl-8">
                                    {['A', 'B', 'C', 'D'].map(choice => (
                                        <div key={choice} className="flex items-center gap-2">
                                            <button 
                                                type="button"
                                                onClick={() => handleQuestionChange(idx, 'correct_answer', choice)}
                                                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${q.correct_answer === choice ? 'border-green-400 bg-green-400/20 text-green-400' : 'border-white/30 text-transparent'}`}
                                            >✓</button>
                                            <input 
                                                type="text" 
                                                value={q.choices?.[choice] || ''} 
                                                onChange={(e) => handleChoiceChange(idx, choice, e.target.value)}
                                                className={`w-full bg-black/20 border rounded-lg p-2 text-white text-sm outline-none ${q.correct_answer === choice ? 'border-green-400/50' : 'border-white/10 focus:border-white/50'}`}
                                                placeholder={`ตัวเลือก ${choice}`}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default CustomQuestionBuilder;
