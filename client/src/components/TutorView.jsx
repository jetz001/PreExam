import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const TutorView = ({ questions, socket, roomId, isHost, currentQuestionIndex }) => {
    const [localIndex, setLocalIndex] = useState(currentQuestionIndex || 0);

    useEffect(() => {
        setLocalIndex(currentQuestionIndex);
    }, [currentQuestionIndex]);

    const handleNavigate = (newIndex) => {
        if (isHost) {
            setLocalIndex(newIndex);
            socket.emit('tutor_navigate', { roomId, questionIndex: newIndex });
        }
    };

    if (!questions || questions.length === 0) return <div>Loading questions...</div>;

    const currentQuestion = questions[localIndex];

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="bg-white shadow px-4 py-3 flex justify-between items-center mb-4 rounded-lg">
                <div className="text-lg font-bold">
                    Question {localIndex + 1} / {questions.length}
                </div>
                {isHost && (
                    <div className="text-sm text-blue-600 font-medium">
                        You are controlling the screen
                    </div>
                )}
            </div>

            {/* Question Area */}
            <div className="bg-white p-6 rounded-lg shadow flex-1 overflow-y-auto">
                <h3 className="text-xl text-gray-900 font-medium mb-6">
                    {currentQuestion.question_text}
                </h3>

                {currentQuestion.question_image && (
                    <img src={currentQuestion.question_image} alt="Question" className="mb-4 max-w-full h-auto rounded" />
                )}

                <div className="space-y-3">
                    {['A', 'B', 'C', 'D'].map((choice) => (
                        <div
                            key={choice}
                            className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${currentQuestion.correct_answer === choice
                                    ? 'border-green-500 bg-green-50 text-green-800'
                                    : 'border-gray-200'
                                }`}
                        >
                            <span className="font-bold mr-2">{choice}.</span>
                            {currentQuestion[`choice_${choice.toLowerCase()}`]}
                        </div>
                    ))}
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <h4 className="font-bold text-blue-800 mb-2">Explanation:</h4>
                    <p className="text-gray-700">{currentQuestion.explanation}</p>
                </div>
            </div>

            {/* Navigation (Host Only) */}
            {isHost && (
                <div className="flex justify-between mt-4">
                    <button
                        onClick={() => handleNavigate(Math.max(0, localIndex - 1))}
                        disabled={localIndex === 0}
                        className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                    >
                        <ChevronLeft className="mr-2 h-4 w-4" /> Previous
                    </button>
                    <button
                        onClick={() => handleNavigate(Math.min(questions.length - 1, localIndex + 1))}
                        disabled={localIndex === questions.length - 1}
                        className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                    >
                        Next <ChevronRight className="ml-2 h-4 w-4" />
                    </button>
                </div>
            )}
        </div>
    );
};

export default TutorView;
