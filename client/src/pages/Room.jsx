import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import roomService from '../services/roomService';
import authService from '../services/authService';
import ChatBox from '../components/ChatBox';
import MultiplayerExam from '../components/MultiplayerExam';
import Leaderboard from '../components/Leaderboard';
import TutorView from '../components/TutorView';
import { Users, Play, LogOut } from 'lucide-react';
import AdSlot from '../components/ads/AdSlot';

const Room = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [room, setRoom] = useState(null);
    const [socket, setSocket] = useState(null);
    const [participants, setParticipants] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isExamStarted, setIsExamStarted] = useState(false);
    const [examFinished, setExamFinished] = useState(false);
    const [finalScore, setFinalScore] = useState(0);
    const [tutorQuestionIndex, setTutorQuestionIndex] = useState(0);
    const [activeTab, setActiveTab] = useState('participants');
    const [userAnswers, setUserAnswers] = useState({});
    const examRef = useRef(null);

    useEffect(() => {
        const user = authService.getCurrentUser();
        if (!user) {
            navigate('/login');
            return;
        }
        setCurrentUser(user);

        const fetchRoom = async () => {
            try {
                const data = await roomService.getRoom(id);
                setRoom(data.data);
                setParticipants(data.data.RoomParticipants || []);

                // Check if I am already a participant and restore state
                const myParticipant = data.data.RoomParticipants?.find(p => p.user_id === user.id);
                if (myParticipant) {
                    if (myParticipant.status === 'finished') {
                        setExamFinished(true);
                        setFinalScore(myParticipant.score);
                    }
                }

                // Connect Socket
                const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
                const socketUrl = isLocal ? 'http://127.0.0.1:3000' : '/';
                const newSocket = io(socketUrl);
                setSocket(newSocket);

                newSocket.emit('join_room', { roomId: id, userId: user.id });

                newSocket.on('user_joined', ({ userId }) => {
                    // Refresh room data to get updated participant list
                    // Ideally we'd just append, but fetching is safer for now
                    fetchRoomData();
                });

                newSocket.on('exam_started', () => {
                    setIsExamStarted(true);
                });

                newSocket.on('score_updated', ({ userId, score }) => {
                    setParticipants(prev => prev.map(p =>
                        p.user_id === userId ? { ...p, score } : p
                    ));
                });

                newSocket.on('navigate_question', ({ questionIndex }) => {
                    setTutorQuestionIndex(questionIndex);
                });

                newSocket.on('exam_reset', () => {
                    setIsExamStarted(false);
                    setExamFinished(false);
                    setFinalScore(0);
                    setParticipants(prev => prev.map(p => ({ ...p, score: 0, status: 'joined' })));
                    setUserAnswers({});
                });

                newSocket.on('room_closed_by_host', () => {
                    setExamFinished(true);
                    alert('The host has closed the room.');
                });

                // Check if room is already finished when joining
                if (data.data.status === 'finished') {
                    setExamFinished(true);
                    // If I am a participant, show my score
                    const myParticipant = data.data.RoomParticipants?.find(p => p.user_id === user.id);
                    if (myParticipant && myParticipant.status === 'finished') {
                        setFinalScore(myParticipant.score);
                    }
                    // No redirect, just show the finished view (Leaderboard)
                } else if (data.data.status === 'playing') {
                    // If room is in progress, start the exam for the user immediately
                    setIsExamStarted(true);
                }

                return () => newSocket.disconnect();
            } catch (error) {
                console.error('Error fetching room:', error);
                alert('Room not found');
                navigate('/lobby');
            } finally {
                setLoading(false);
            }
        };

        fetchRoom();
    }, [id, navigate]);

    const fetchRoomData = async () => {
        try {
            const data = await roomService.getRoom(id);
            setRoom(data.data);
            setParticipants(data.data.RoomParticipants || []);
        } catch (error) {
            console.error('Error refreshing room:', error);
        }
    };

    const handleStartExam = () => {
        if (socket) {
            socket.emit('start_exam', { roomId: id, userId: currentUser.id });
        }
    };

    const handleExamFinish = (score, answers) => {
        setExamFinished(true);
        setFinalScore(score);
        setUserAnswers(answers || {});
    };

    if (loading || !room) return <div className="p-8 text-center">Loading Room...</div>;

    const isHost = currentUser?.id == room.host_user_id;

    return (
        <div className="container mx-auto px-4 py-8 h-screen-minus-navbar flex flex-col">
            {/* Room Header */}
            <div className="bg-white p-6 rounded-lg shadow-sm mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                        {room.name}
                        <span className="ml-3 text-sm font-mono bg-gray-100 px-2 py-1 rounded text-gray-500">
                            Code: {room.code}
                        </span>
                    </h1>
                    <p className="text-gray-500 mt-1">
                        Mode: <span className="font-medium text-primary capitalize">{room.mode}</span> •
                        Subject: {room.subject}
                    </p>
                </div>
                <div className="flex space-x-3">
                    {isHost && !isExamStarted && !examFinished && (
                        <button
                            onClick={handleStartExam}
                            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 flex items-center"
                        >
                            <Play className="w-5 h-5 mr-2" /> Start {room.mode === 'tutor' ? 'Session' : 'Exam'}
                        </button>
                    )}
                    {isHost && room.mode === 'tutor' && !examFinished && (
                        <button
                            onClick={() => {
                                if (window.confirm('Are you sure you want to close this room?')) {
                                    socket.emit('close_room', { roomId: id, userId: currentUser.id });
                                }
                            }}
                            className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 flex items-center"
                        >
                            <LogOut className="w-5 h-5 mr-2" /> Close Room
                        </button>
                    )}
                    <button
                        onClick={() => {
                            if (isExamStarted && !examFinished && room.mode === 'exam' && examRef.current) {
                                examRef.current.submitExam();
                            }
                            navigate('/lobby');
                        }}
                        className="bg-red-100 text-red-600 px-4 py-2 rounded-lg hover:bg-red-200 flex items-center"
                    >
                        <LogOut className="w-5 h-5 mr-2" /> Leave
                    </button>
                </div>
            </div>

            <div className={`grid grid-cols-1 ${examFinished ? '' : 'lg:grid-cols-3'} gap-6 flex-1 overflow-hidden`}>
                {/* Main Content Area (Waiting / Exam) */}
                <div className={`${examFinished ? 'w-full' : 'lg:col-span-2'} bg-white rounded-lg shadow-sm p-6 flex flex-col border border-gray-200 overflow-hidden`}>
                    {examFinished ? (
                        <div className="flex flex-col h-full">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-2xl font-bold text-gray-900">Final Leaderboard</h2>
                                <button onClick={() => navigate('/lobby')} className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600">
                                    Back to Lobby
                                </button>
                            </div>

                            {/* Only show "Your Score" if the user actually participated and finished */}
                            {participants.find(p => p.user_id === currentUser?.id && p.status === 'finished') && (
                                <div className="bg-blue-50 p-4 rounded-lg mb-6 text-center flex justify-center items-center">
                                    <span className="text-lg text-gray-700 mr-2">Your Score:</span>
                                    <span className="font-bold text-3xl text-primary">{finalScore}</span>
                                </div>
                            )}

                            <div className="flex-1 overflow-y-auto">
                                {/* Ad Injection for Exam Result */}
                                <div className="mb-6">
                                    <AdSlot placement="result" />
                                </div>

                                <Leaderboard participants={participants} />

                                {Object.keys(userAnswers).length > 0 && (
                                    <div className="mt-8 border-t pt-6">
                                        <h3 className="text-xl font-bold mb-4">Review Answers</h3>
                                        <div className="space-y-6">
                                            {room.questions.map((q, index) => {
                                                const userAnswerRaw = userAnswers[q.id];
                                                const correctRaw = q.correct_answer;

                                                const userNorm = userAnswerRaw ? String(userAnswerRaw).trim().toLowerCase() : '';
                                                const correctNorm = correctRaw ? String(correctRaw).trim().toLowerCase() : '';

                                                const isQuestionCorrect = userNorm === correctNorm;

                                                return (
                                                    <div key={q.id} className={`p-4 rounded-lg border ${isQuestionCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                                                        <p className="font-medium mb-2 text-gray-900">{index + 1}. {q.question_text}</p>
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                                                            {['a', 'b', 'c', 'd'].map((opt) => {
                                                                const choiceText = q[`choice_${opt}`];
                                                                const isThisCorrect = correctNorm === opt;
                                                                const isThisUser = userNorm === opt;

                                                                let itemClass = "p-2 rounded border ";
                                                                if (isThisCorrect) {
                                                                    itemClass += "bg-green-100 border-green-200 text-green-900 font-bold ring-2 ring-green-500/50";
                                                                } else if (isThisUser && !isQuestionCorrect) {
                                                                    itemClass += "bg-red-100 border-red-200 text-red-900 font-semibold";
                                                                } else {
                                                                    itemClass += "bg-white border-gray-100 text-gray-700";
                                                                }

                                                                return (
                                                                    <div key={opt} className={itemClass}>
                                                                        <span className="uppercase mr-1 font-bold">{opt}.</span>
                                                                        {choiceText}
                                                                        {isThisCorrect && <span className="ml-2">✅</span>}
                                                                        {isThisUser && !isQuestionCorrect && <span className="ml-2">❌</span>}
                                                                        {isThisUser && <span className="float-right text-xs bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded ml-2">You</span>}
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                        {q.explanation && (
                                                            <div className="mt-3 text-sm text-gray-800 bg-white/80 p-3 rounded border border-gray-200">
                                                                <strong className="text-gray-900">Explanation:</strong> {q.explanation}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : !isExamStarted ? (
                        <div className="flex flex-col justify-center items-center text-center h-full">
                            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
                                <Users className="w-12 h-12" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Waiting for Players...</h2>
                            <p className="text-gray-500">
                                {participants.length} / {room.max_participants} joined
                            </p>
                            {isHost ? (
                                <p className="text-sm text-gray-400 mt-4">You are the host. Click "Start Exam" when ready.</p>
                            ) : (
                                <p className="text-sm text-gray-400 mt-4">Waiting for host to start the game...</p>
                            )}
                        </div>
                    ) : room.mode === 'tutor' ? (
                        <TutorView
                            questions={room.questions}
                            socket={socket}
                            roomId={id}
                            isHost={isHost}
                            currentQuestionIndex={tutorQuestionIndex}
                        />
                    ) : (
                        <MultiplayerExam
                            ref={examRef}
                            questions={room.questions}
                            socket={socket}
                            roomId={id}
                            userId={currentUser.id}
                            onFinish={handleExamFinish}
                            timeLimit={room.settings?.time_limit}
                        />
                    )}
                </div>

                {/* Sidebar: Participants & Chat */}
                {!examFinished && (
                    <div className="flex flex-col h-full overflow-hidden bg-white rounded-lg shadow-sm border border-gray-200">
                        {/* Tab Navigation */}
                        <div className="flex border-b border-gray-200">
                            <button
                                onClick={() => setActiveTab('participants')}
                                className={`flex-1 py-3 text-sm font-medium text-center transition-colors ${activeTab === 'participants'
                                    ? 'text-primary border-b-2 border-primary bg-blue-50'
                                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                Participants ({participants.length})
                            </button>
                            <button
                                onClick={() => setActiveTab('chat')}
                                className={`flex-1 py-3 text-sm font-medium text-center transition-colors ${activeTab === 'chat'
                                    ? 'text-primary border-b-2 border-primary bg-blue-50'
                                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                Chat Room
                            </button>
                        </div>

                        {/* Tab Content */}
                        <div className="flex-1 overflow-hidden flex flex-col">
                            {activeTab === 'participants' ? (
                                <div className="flex-1 overflow-y-auto p-4">
                                    {isExamStarted && room.mode === 'exam' && !examFinished ? (
                                        <Leaderboard participants={participants} />
                                    ) : (
                                        <ul className="space-y-2">
                                            {participants.map((p) => (
                                                <li key={p.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                                                    <div className="flex items-center">
                                                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3 text-xs font-bold text-gray-600">
                                                            {p.User?.display_name?.charAt(0).toUpperCase()}
                                                        </div>
                                                        <span className="font-medium text-gray-700">{p.User?.display_name}</span>
                                                    </div>
                                                    {p.user_id === room.host_user_id && (
                                                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">Host</span>
                                                    )}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            ) : (
                                <div className="flex-1 flex flex-col h-full">
                                    <ChatBox
                                        socket={socket}
                                        roomId={id}
                                        userId={currentUser?.id}
                                        displayName={currentUser?.display_name}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Room;
