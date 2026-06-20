import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Upload, GripVertical, CheckSquare, Square, RefreshCw, Save } from 'lucide-react';
import examService from '../../services/examService';

const CustomQuestionBuilder = ({ customQuestions, setCustomQuestions }) => {
    const [view, setView] = useState('list'); // 'list' | 'import' | 'create'
    const [userBank, setUserBank] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    
    // For single create
    const [newQ, setNewQ] = useState({
        question_text: '',
        correct_answer: 'A',
        explanation: '',
        category: 'custom',
        subject: 'custom',
        difficulty: 50,
        choices: { A: '', B: '', C: '', D: '' }
    });

    useEffect(() => {
        loadUserBank();
    }, []);

    const loadUserBank = async () => {
        setIsLoading(true);
        try {
            const res = await examService.getUserQuestions();
            if (res.success) {
                setUserBank(res.data);
            }
        } catch (e) {
            console.error("Failed to load user questions", e);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemoveFromBank = async (id) => {
        if (!window.confirm("คุณต้องการลบข้อสอบนี้จากคลังของคุณหรือไม่?")) return;
        try {
            await examService.deleteUserQuestion(id);
            setCustomQuestions(customQuestions.filter(q => q.id !== id));
            await loadUserBank();
        } catch (e) {
            console.error(e);
        }
    };

    const toggleSelection = (q) => {
        const isSelected = customQuestions.find(cq => cq.id === q.id);
        if (isSelected) {
            setCustomQuestions(customQuestions.filter(cq => cq.id !== q.id));
        } else {
            setCustomQuestions([...customQuestions, q]);
        }
    };

    const selectAll = () => {
        setCustomQuestions([...userBank]);
    };

    const deselectAll = () => {
        setCustomQuestions([]);
    };

    const handleCsvUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        setIsSaving(true);
        const reader = new FileReader();
        reader.onload = async (evt) => {
            const text = evt.target.result;
            const rows = text.split('\n').filter(row => row.trim().length > 0);
            const parsed = rows.slice(1).map(row => {
                const cols = row.split(',').map(c => c.trim().replace(/^"|"$/g, ''));
                if (cols.length >= 6) {
                    return {
                        question_text: cols[0],
                        choices: { A: cols[1], B: cols[2], C: cols[3], D: cols[4] },
                        correct_answer: cols[5] || 'A',
                        explanation: cols[6] || '',
                        category: 'custom',
                        subject: 'custom',
                        difficulty: 50
                    };
                }
                return null;
            }).filter(Boolean);
            
            try {
                if (parsed.length > 0) {
                    await examService.bulkCreateUserQuestions({ questions: parsed });
                    await loadUserBank();
                }
            } catch (err) {
                console.error(err);
                alert("เกิดข้อผิดพลาดในการนำเข้าข้อสอบ");
            } finally {
                setIsSaving(false);
                setView('list');
            }
        };
        reader.readAsText(file);
    };

    const handleSaveNewQ = async () => {
        if (!newQ.question_text || !newQ.choices.A || !newQ.choices.B) {
            alert("กรุณากรอกโจทย์และตัวเลือกให้ครบ");
            return;
        }
        setIsSaving(true);
        try {
            await examService.bulkCreateUserQuestions({ questions: [newQ] });
            await loadUserBank();
            setNewQ({
                question_text: '', correct_answer: 'A', explanation: '', category: 'custom', subject: 'custom', difficulty: 50, choices: { A: '', B: '', C: '', D: '' }
            });
            setView('list');
        } catch (e) {
            console.error(e);
            alert("เกิดข้อผิดพลาดในการบันทึก");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="w-full bg-white/5 border border-white/20 rounded-2xl p-4 mt-4 text-white">
            <div className="flex gap-4 justify-between items-center mb-4">
                <h4 className="font-bold text-lg flex items-center gap-2">
                    คลังข้อสอบส่วนตัว 
                    <span className="text-xs bg-white/20 px-2 py-0.5 rounded-md">{userBank.length} ข้อ</span>
                </h4>
                {view === 'list' && (
                    <div className="flex gap-2">
                        <button type="button" onClick={() => setView('import')} className="px-3 py-1.5 bg-blue-500/20 text-blue-300 rounded-xl hover:bg-blue-500/30 flex items-center gap-1 text-sm font-bold border border-blue-500/50 transition-all">
                            <Upload size={16} /> นำเข้า
                        </button>
                        <button type="button" onClick={() => setView('create')} className="px-3 py-1.5 bg-green-500/20 text-green-300 rounded-xl hover:bg-green-500/30 flex items-center gap-1 text-sm font-bold border border-green-500/50 transition-all">
                            <Plus size={16} /> เพิ่มข้อ
                        </button>
                    </div>
                )}
            </div>

            {view === 'import' && (
                <div className="p-6 border-2 border-dashed border-white/30 rounded-xl text-center mb-4">
                    {isSaving ? (
                        <div className="flex flex-col items-center justify-center p-4">
                            <RefreshCw className="animate-spin mb-2 text-blue-400" size={32} />
                            <p className="font-bold text-blue-300">กำลังบันทึกข้อสอบ...</p>
                        </div>
                    ) : (
                        <>
                            <Upload className="mx-auto mb-2 text-white/50" size={32} />
                            <p className="text-sm font-bold text-white/70 mb-4">อัปโหลดไฟล์ CSV เพื่อนำเข้าข้อสอบ<br/><span className="text-xs text-white/50">(รูปแบบ: โจทย์, ก, ข, ค, ง, คำตอบ(A/B/C/D), คำอธิบาย)</span></p>
                            <label className="cursor-pointer bg-white/20 hover:bg-white/30 px-6 py-2 rounded-xl text-white font-bold transition-all border border-white/20 inline-block">
                                เลือกไฟล์ CSV
                                <input type="file" accept=".csv" className="hidden" onChange={handleCsvUpload} />
                            </label>
                            <button type="button" onClick={() => setView('list')} className="block mx-auto mt-4 text-sm text-red-400 hover:underline">ยกเลิก</button>
                        </>
                    )}
                </div>
            )}

            {view === 'create' && (
                <div className="bg-black/20 p-4 rounded-xl border border-white/10 mb-4 relative">
                    <h5 className="font-bold mb-3 text-white/90">สร้างข้อสอบใหม่</h5>
                    <textarea 
                        value={newQ.question_text} 
                        onChange={(e) => setNewQ({...newQ, question_text: e.target.value})} 
                        className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-white/50 mb-3" 
                        placeholder="พิมพ์โจทย์คำถาม..."
                        rows={2}
                    />
                    <div className="grid grid-cols-2 gap-3 mb-4">
                        {['A', 'B', 'C', 'D'].map(choice => (
                            <div key={choice} className="flex items-center gap-2">
                                <button 
                                    type="button"
                                    onClick={() => setNewQ({...newQ, correct_answer: choice})}
                                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${newQ.correct_answer === choice ? 'border-green-400 bg-green-400/20 text-green-400 shadow-[0_0_10px_rgba(74,222,128,0.3)]' : 'border-white/30 text-white/50 hover:bg-white/10'}`}
                                >{choice}</button>
                                <input 
                                    type="text" 
                                    value={newQ.choices[choice]} 
                                    onChange={(e) => setNewQ({...newQ, choices: {...newQ.choices, [choice]: e.target.value}})}
                                    className={`w-full bg-black/40 border rounded-lg p-2 text-white text-sm outline-none transition-all ${newQ.correct_answer === choice ? 'border-green-400/50' : 'border-white/10 focus:border-white/50'}`}
                                    placeholder={`ตัวเลือก ${choice}`}
                                />
                            </div>
                        ))}
                    </div>
                    <textarea 
                        value={newQ.explanation} 
                        onChange={(e) => setNewQ({...newQ, explanation: e.target.value})} 
                        className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-white/80 outline-none focus:border-white/50 text-sm mb-4" 
                        placeholder="คำอธิบาย (ถ้ามี)..."
                        rows={1}
                    />
                    <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => setView('list')} className="px-4 py-2 rounded-xl font-bold text-white/60 hover:bg-white/10 transition-colors">ยกเลิก</button>
                        <button type="button" onClick={handleSaveNewQ} disabled={isSaving} className="px-6 py-2 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 transition-colors flex items-center gap-2">
                            {isSaving ? <RefreshCw className="animate-spin" size={16} /> : <Save size={16} />}
                            บันทึกข้อสอบ
                        </button>
                    </div>
                </div>
            )}

            {view === 'list' && (
                <>
                    <div className="flex justify-between items-center mb-2 px-1">
                        <div className="text-sm font-bold text-white/80">
                            เลือกข้อสอบสำหรับห้องนี้: <span className="text-green-400">{customQuestions.length} ข้อ</span>
                        </div>
                        <div className="flex gap-3 text-sm">
                            <button type="button" onClick={selectAll} className="text-blue-300 hover:text-blue-200">เลือกทั้งหมด</button>
                            <button type="button" onClick={deselectAll} className="text-white/50 hover:text-white/80">ยกเลิกทั้งหมด</button>
                        </div>
                    </div>
                    
                    <div className="space-y-2 max-h-[350px] overflow-y-auto custom-scrollbar pr-2">
                        {isLoading ? (
                            <div className="flex justify-center p-8"><RefreshCw className="animate-spin text-white/50" /></div>
                        ) : userBank.length === 0 ? (
                            <div className="text-center p-8 text-white/50 font-bold border-2 border-dashed border-white/10 rounded-xl bg-black/20">
                                ยังไม่มีข้อสอบในคลัง กด "เพิ่มข้อ" หรือ "นำเข้า" เพื่อเริ่มต้น
                            </div>
                        ) : (
                            userBank.map((q) => {
                                const isSelected = !!customQuestions.find(cq => cq.id === q.id);
                                return (
                                    <div 
                                        key={q.id} 
                                        onClick={() => toggleSelection(q)}
                                        className={`p-3 rounded-xl border flex gap-3 cursor-pointer transition-all group ${isSelected ? 'bg-green-500/10 border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.1)]' : 'bg-black/20 border-white/10 hover:border-white/30'}`}
                                    >
                                        <div className="mt-1">
                                            {isSelected ? <CheckSquare className="text-green-400" size={20} /> : <Square className="text-white/30 group-hover:text-white/50" size={20} />}
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-sm font-bold text-white/90 line-clamp-2">{q.question_text}</div>
                                            <div className="text-xs text-white/50 mt-1 flex gap-2">
                                                <span>A: {q.choices?.A}</span>
                                                <span>B: {q.choices?.B}</span>
                                                <span>C: {q.choices?.C}</span>
                                                <span>D: {q.choices?.D}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center">
                                            <button 
                                                type="button" 
                                                onClick={(e) => { e.stopPropagation(); handleRemoveFromBank(q.id); }} 
                                                className="text-white/20 hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-white/10"
                                            >
                                                <Trash2 size={16}/>
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default CustomQuestionBuilder;
