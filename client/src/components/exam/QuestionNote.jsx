import React, { useState, useEffect } from 'react';
import { NotebookPen, Save } from 'lucide-react';

const QuestionNote = ({ questionId }) => {
    const [note, setNote] = useState('');
    const [isOpen, setIsOpen] = useState(false);

    // Load saved note from localStorage (or API in future)
    useEffect(() => {
        const savedNote = localStorage.getItem(`note_${questionId}`);
        if (savedNote) setNote(savedNote);
        else setNote('');
    }, [questionId]);

    const handleSave = () => {
        localStorage.setItem(`note_${questionId}`, note);
        // Optional: Show toast
    };

    return (
        <div className="mt-4">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center text-sm text-gray-500 hover:text-primary transition-colors"
                title="Add personal note"
            >
                <NotebookPen size={16} className="mr-2" />
                {isOpen ? 'Close Note' : 'Add Note'}
            </button>

            {isOpen && (
                <div className="mt-2 relative animate-fadeIn">
                    <textarea
                        className="w-full p-3 border border-yellow-200 bg-yellow-50 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:outline-none text-sm text-gray-700 resize-y min-h-[80px]"
                        placeholder="Type your notes here... (Only visible to you)"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                    />
                    <button
                        onClick={handleSave}
                        className="absolute bottom-2 right-2 p-1 text-gray-400 hover:text-primary bg-white/50 rounded"
                        title="Save Note"
                    >
                        <Save size={14} />
                    </button>
                </div>
            )}
        </div>
    );
};

export default QuestionNote;
