import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import roomService from '../services/roomService';
import authService from '../services/authService';
import ChatBox from '../components/ChatBox';
import MultiplayerExam from '../components/MultiplayerExam';
import Leaderboard from '../components/Leaderboard';
import TutorView from '../components/TutorView';
import TutorPlayerView from '../components/TutorPlayerView';
import TutorDashboard from '../components/TutorDashboard';
import { Users, Play, LogOut } from 'lucide-react';
import AdSlot from '../components/ads/AdSlot';
import DOMPurify from 'dompurify';

const decodeHtml = (html) => {
    const txt = document.createElement("textarea");
    let decoded = html;
    let limit = 5;
    while (limit > 0 && decoded) {
        txt.innerHTML = decoded;
        const next = txt.value;
        if (next === decoded) break;
        decoded = next;
        limit--;
    }
    return decoded;
};

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
    const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
    const [currentAnswerCounts, setCurrentAnswerCounts] = useState({ A: 0, B: 0, C: 0, D: 0 });
    const [activeTab, setActiveTab] = useState('participants');
    const [userAnswers, setUserAnswers] = useState({});
    const [showNicknameModal, setShowNicknameModal] = useState(false);
    const [nicknameInput, setNicknameInput] = useState('');
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
                const myParticipant = data.data.RoomParticipants?.find(p => p.user_id == user.id);
                const isUserHost = data.data.host_user_id == user.id;

                if (!isUserHost && (!myParticipant || !myParticipant.nickname)) {
                    setShowNicknameModal(true);
                }

                if (myParticipant) {
                    if (myParticipant.status === 'finished') {
                        setExamFinished(true);
                        setFinalScore(myParticipant.score);
                        if (myParticipant.answers) {
                            setUserAnswers(typeof myParticipant.answers === 'string' ? JSON.parse(myParticipant.answers) : myParticipant.answers);
                        }
                    }
                }

                // Connect Socket
                const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
                const socketUrl = isLocal ? 'http://127.0.0.1:3000' : '/';
                const newSocket = io(socketUrl, {
                    path: isLocal ? '/socket.io' : '/api/ws',
                    transports: ['websocket']
                });
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
                        p.user_id == userId ? { ...p, score } : p
                    ));
                });

                newSocket.on('navigate_question', ({ questionIndex }) => {
                    setTutorQuestionIndex(questionIndex);
                    setIsAnswerRevealed(false);
                    setCurrentAnswerCounts({ A: 0, B: 0, C: 0, D: 0 });
                });

                newSocket.on('tutor_show_answer', ({ questionIndex }) => {
                    setIsAnswerRevealed(true);
                });

                newSocket.on('tutor_player_answered', ({ choice }) => {
                    setCurrentAnswerCounts(prev => ({ ...prev, [choice]: (prev[choice] || 0) + 1 }));
                });

                newSocket.on('tutor_navigate', ({ questionIndex }) => {
                    setTutorQuestionIndex(questionIndex);
                    setIsAnswerRevealed(false);
                    setCurrentAnswerCounts({ A: 0, B: 0, C: 0, D: 0 });
                });

                newSocket.on('progress_updated', ({ userId, questionIndex }) => {
                    setParticipants(prev => prev.map(p =>
                        p.user_id == userId ? { ...p, current_question_index: questionIndex } : p
                    ));
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

                newSocket.on('nickname_updated', ({ userId, nickname }) => {
                    setParticipants(prev => prev.map(p =>
                        p.user_id == userId ? { ...p, nickname } : p
                    ));
                });

                // Check if room is already finished when joining
                if (data.data.status === 'finished') {
                    setExamFinished(true);
                    // If I am a participant, show my score
                    const myParticipant = data.data.RoomParticipants?.find(p => p.user_id == user.id);
                    if (myParticipant && myParticipant.status === 'finished') {
                        setFinalScore(myParticipant.score);
                        if (myParticipant.answers) {
                            setUserAnswers(typeof myParticipant.answers === 'string' ? JSON.parse(myParticipant.answers) : myParticipant.answers);
                        }
                    }
                    // No redirect, just show the finished view (Leaderboard)
                } else if (data.data.status === 'in_progress' || data.data.status === 'playing') {
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

    const handleSetNickname = (e) => {
        e.preventDefault();
        if (!nicknameInput.trim()) return;
        if (socket) {
            socket.emit('set_nickname', { roomId: id, userId: currentUser.id, nickname: nicknameInput.trim() });
            setShowNicknameModal(false);
            
            // Optimistically update local participant list
            setParticipants(prev => prev.map(p =>
                p.user_id == currentUser?.id ? { ...p, nickname: nicknameInput.trim() } : p
            ));
        }
    };

    const handleExamFinish = (score, answers) => {
        setExamFinished(true);
        setFinalScore(score);
        setUserAnswers(answers || {});
        // Also update local participant status to finished so "Your Score" shows up immediately
        setParticipants(prev => prev.map(p =>
            p.user_id == currentUser?.id ? { ...p, status: 'finished', score } : p
        ));
    };

    const handleTutorAnswer = (questionId, choice, isCorrect) => {
        const newAnswers = { ...userAnswers, [questionId]: choice };
        setUserAnswers(newAnswers);

        let newScore = finalScore;
        if (isCorrect) {
            newScore += 1;
            setFinalScore(newScore);
        }

        // Update local participant array
        setParticipants(prev => prev.map(p =>
            p.user_id == currentUser?.id ? { ...p, score: newScore } : p
        ));

        if (socket) {
            socket.emit('submit_score', { roomId: id, userId: currentUser.id, score: newScore });
            socket.emit('tutor_player_answer', { roomId: id, choice });
        }
    };

    if (loading || !room) return <div className="p-8 text-center">Loading Room...</div>;

    const isHost = currentUser?.id == room.host_user_id;

    return (
        <div className="h-screen-minus-navbar flex flex-col relative text-white overflow-hidden font-sans">
            <style>{`
                @keyframes gradientBG {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                @keyframes float {
                    0% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-20px) rotate(5deg); }
                    100% { transform: translateY(0px) rotate(0deg); }
                }
                .room-wrapper { 
                    position: fixed; inset: 0; z-index: 0; overflow: hidden; pointer-events: none;
                    background: linear-gradient(-45deg, #7e22ce, #c026d3, #2563eb, #0ea5e9);
                    background-size: 400% 400%;
                    animation: gradientBG 15s ease infinite;
                }
                .room-btn { 
                    padding: 12px 24px; border-radius: 20px; font-weight: 900; font-size: 1.1rem;
                    transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275); 
                    display: flex; align-items: center; border: 3px solid rgba(255,255,255,0.8); cursor: pointer; 
                }
                .btn-start { 
                    background: #facc15; color: #713f12; 
                    box-shadow: 0 6px 0 #ca8a04; 
                    border-color: #fef08a;
                }
                .btn-start:hover { background: #fde047; transform: translateY(-2px); box-shadow: 0 8px 0 #ca8a04; }
                .btn-start:active { transform: translateY(6px); box-shadow: 0 0 0 #ca8a04; }
                
                .btn-leave { 
                    background: #ef4444; color: white; 
                    box-shadow: 0 6px 0 #b91c1c; 
                    border-color: #fca5a5;
                }
                .btn-leave:hover { background: #f87171; transform: translateY(-2px); box-shadow: 0 8px 0 #b91c1c; }
                .btn-leave:active { transform: translateY(6px); box-shadow: 0 0 0 #b91c1c; }
                
                .playful-panel-header {
                    background: #46178f;
                    border: 4px solid #fff;
                    border-radius: 32px;
                    box-shadow: 0 8px 0 #2d0d6b, 0 15px 30px rgba(0,0,0,0.3);
                }
                .playful-panel-main {
                    background: #0ea5e9;
                    border: 4px solid #fff;
                    border-radius: 32px;
                    box-shadow: 0 8px 0 #0284c7, 0 15px 30px rgba(0,0,0,0.3);
                }
                .playful-panel-sidebar {
                    background: #e21b3c;
                    border: 4px solid #fff;
                    border-radius: 32px;
                    box-shadow: 0 8px 0 #b3142e, 0 15px 30px rgba(0,0,0,0.3);
                }
                .tab-btn { padding: 14px; font-weight: 900; font-size: 1.1rem; transition: 0.2s; color: rgba(255,255,255,0.7); }
                .tab-btn.active { color: white; background: rgba(255,255,255,0.25); border-bottom: 4px solid #facc15; }
                .pulse-icon { animation: pulse 1.5s infinite; }
                .float-anim { animation: float 6s ease-in-out infinite; }
            `}</style>
            
            {/* Playful Floating Shapes behind */}
            <div className="room-wrapper">
                <div className="absolute top-10 right-20 text-8xl opacity-50 float-anim" style={{ animationDelay: '0s' }}>☁️</div>
                <div className="absolute bottom-10 left-10 text-8xl opacity-50 float-anim" style={{ animationDelay: '1s' }}>🚀</div>
                <div className="absolute top-1/2 right-10 text-6xl opacity-40 float-anim" style={{ animationDelay: '2s' }}>🎮</div>
                <div className="absolute top-32 left-32 text-6xl opacity-50 float-anim" style={{ animationDelay: '3s' }}>⭐</div>
                <div className="absolute bottom-32 right-1/3 text-7xl opacity-40 float-anim" style={{ animationDelay: '1.5s' }}>🎯</div>
            </div>

            <div className="container mx-auto px-4 py-8 flex flex-col h-full relative z-10">
                {/* Room Header */}
                <div className="playful-panel-header p-6 mb-8 flex flex-col md:flex-row justify-between items-center gap-4 relative overflow-hidden">
                    <div className="relative z-10 flex-1">
                        <h1 className="text-4xl font-black text-white flex items-center drop-shadow-lg tracking-wide">
                            {room.name}
                            <span className="ml-4 text-base font-black bg-white text-purple-700 px-4 py-2 rounded-2xl shadow-[0_4px_0_rgba(0,0,0,0.2)]">
                                Code: <span className="text-pink-600 tracking-widest">{room.code}</span>
                            </span>
                        </h1>
                        <p className="text-white mt-3 font-bold flex items-center gap-3 text-lg">
                            <span className="bg-pink-500/80 px-3 py-1 rounded-xl shadow-sm">🔥 โหมด: <span className="capitalize text-pink-100">{room.mode}</span></span>
                            <span className="bg-blue-500/80 px-3 py-1 rounded-xl shadow-sm">📚 วิชา: <span className="text-blue-100">{room.subject}</span></span>
                        </p>
                    </div>
                <div className="flex space-x-3 relative z-10">
                    {isHost && !isExamStarted && !examFinished && (
                        <button
                            onClick={handleStartExam}
                            className="room-btn btn-start"
                        >
                            <Play className="w-6 h-6 mr-2" /> 
                            <span className="drop-shadow-sm">Start {room.mode === 'tutor' ? 'Session' : 'Exam'} 🚀</span>
                        </button>
                    )}
                    {isHost && room.mode === 'tutor' && !examFinished && (
                        <button
                            onClick={() => {
                                if (window.confirm('Are you sure you want to close this room?')) {
                                    socket.emit('close_room', { roomId: id, userId: currentUser.id });
                                }
                            }}
                            className="room-btn btn-leave bg-orange-500/20 text-orange-300 border-orange-500/40"
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
                        className="room-btn btn-leave"
                    >
                        <LogOut className="w-5 h-5 mr-2" /> Leave
                    </button>
                </div>
                </div>

                <div className={`grid grid-cols-1 ${examFinished ? '' : 'lg:grid-cols-3'} gap-8 flex-1 overflow-hidden relative z-10`}>
                    {/* Main Content Area (Waiting / Exam) */}
                    <div className={`${examFinished ? 'w-full' : 'lg:col-span-2'} playful-panel-main p-2 md:p-6 flex flex-col overflow-hidden`}>
                    {examFinished ? (
                        <div className="flex flex-col h-full">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-3xl font-black text-white flex items-center gap-2">🏆 Final Leaderboard</h2>
                                <button onClick={() => navigate('/lobby')} className="room-btn bg-white/20 text-white hover:bg-white/30">
                                    Back to Lobby
                                </button>
                            </div>

                            {/* Only show "Your Score" if the user actually participated and finished */}
                            {participants.find(p => p.user_id == currentUser?.id && p.status === 'finished') && (
                                <div className="bg-white/10 p-6 rounded-2xl mb-6 text-center flex flex-col justify-center items-center border-2 border-white/20 shadow-lg backdrop-blur-sm">
                                    <span className="text-lg text-white/80 font-bold mb-1">Your Score</span>
                                    <span className="font-black text-5xl text-yellow-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">{finalScore}</span>
                                </div>
                            )}

                            <div className="flex-1 overflow-y-auto">
                                {/* Ad Injection for Exam Result */}
                                <div className="mb-6">
                                    <AdSlot placement="result" />
                                </div>

                                <Leaderboard participants={participants} />

                                {Object.keys(userAnswers).length > 0 && (
                                    <div className="mt-8 border-t-2 border-white/20 pt-6">
                                        <h3 className="text-2xl font-black mb-4 text-white">📝 Review Answers</h3>
                                        <div className="space-y-6">
                                            {room.questions.map((q, index) => {
                                                const userAnswerRaw = userAnswers[q.id];
                                                const correctRaw = q.correct_answer;

                                                const userNorm = userAnswerRaw ? String(userAnswerRaw).trim().toLowerCase() : '';
                                                const correctNorm = correctRaw ? String(correctRaw).trim().toLowerCase() : '';

                                                const isQuestionCorrect = userNorm === correctNorm;

                                                return (
                                                    <div key={q.id} className={`p-5 rounded-2xl border-2 backdrop-blur-sm ${isQuestionCorrect ? 'border-green-400/50 bg-green-900/30' : 'border-red-400/50 bg-red-900/30'}`}>
                                                        <div className="font-bold mb-4 text-white text-lg">
                                                            <span className="mr-2 px-2 py-1 bg-white/20 rounded-lg">{index + 1}</span>
                                                            <div className="inline" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(decodeHtml(q.question_text)) }} />
                                                        </div>
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                                                            {['a', 'b', 'c', 'd'].map((opt) => {
                                                                const choiceText = q[`choice_${opt}`];
                                                                const isThisCorrect = correctNorm === opt;
                                                                const isThisUser = userNorm === opt;

                                                                let itemClass = "p-3 rounded-xl border-2 transition-all ";
                                                                if (isThisCorrect) {
                                                                    itemClass += "bg-green-500/20 border-green-400 text-green-100 font-bold shadow-[0_0_15px_rgba(74,222,128,0.2)]";
                                                                } else if (isThisUser && !isQuestionCorrect) {
                                                                    itemClass += "bg-red-500/20 border-red-400 text-red-100 font-semibold";
                                                                } else {
                                                                    itemClass += "bg-white/10 border-white/20 text-white/80";
                                                                }

                                                                return (
                                                                    <div key={opt} className={itemClass}>
                                                                        <span className="uppercase mr-2 font-black bg-black/20 px-2 py-1 rounded-md">{opt}</span>
                                                                        {choiceText}
                                                                        {isThisCorrect && <span className="ml-2 text-green-300">✅</span>}
                                                                        {isThisUser && !isQuestionCorrect && <span className="ml-2 text-red-300">❌</span>}
                                                                        {isThisUser && <span className="float-right text-xs bg-white/20 text-white px-2 py-1 rounded-full ml-2 font-bold shadow-sm">You</span>}
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                        {q.explanation && (
                                                            <div className="mt-4 text-sm text-white/90 bg-white/10 p-4 rounded-xl border border-white/20 backdrop-blur-sm">
                                                                <strong className="text-yellow-300 text-base block mb-1">💡 Explanation:</strong> {q.explanation}
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
                        <div className="flex flex-col justify-center items-center text-center h-full relative p-8">
                            
                            <div className="w-40 h-40 bg-white rounded-[3rem] flex items-center justify-center mx-auto mb-8 text-blue-500 shadow-[0_15px_35px_rgba(0,0,0,0.2)] rotate-3 hover:rotate-12 transition-transform duration-300 float-anim border-8 border-yellow-300">
                                <Users className="w-20 h-20 pulse-icon" />
                            </div>
                            <h2 className="text-5xl font-black text-white mb-6 drop-shadow-xl tracking-wide uppercase">Waiting for Players<span className="animate-pulse">...</span></h2>
                            
                            <div className="bg-white px-8 py-4 rounded-full border-4 border-white/80 shadow-xl mb-8 transform hover:scale-105 transition-transform">
                                <p className="text-blue-600 font-black text-2xl flex items-center gap-3">
                                    <span className="text-4xl text-blue-500">{participants.length}</span> <span className="text-gray-400">/</span> {room.max_participants} joined
                                </p>
                            </div>
                            
                            {isHost ? (
                                <button 
                                    onClick={handleStartExam}
                                    className="bg-yellow-400 text-yellow-900 font-black px-8 py-4 rounded-3xl border-4 border-yellow-500 shadow-[0_8px_0_#ca8a04] text-xl animate-bounce hover:bg-yellow-300 hover:translate-y-[-4px] hover:shadow-[0_12px_0_#ca8a04] active:translate-y-[8px] active:shadow-none transition-all cursor-pointer"
                                >
                                    👑 You are the host. Click here to START! 🚀
                                </button>
                            ) : (
                                <div className="bg-blue-500 text-white font-black px-6 py-3 rounded-2xl border-4 border-blue-600 shadow-[0_6px_0_#2563eb] text-lg animate-pulse">
                                    ⏳ Waiting for host to start the game...
                                </div>
                            )}
                        </div>
                    ) : room.mode === 'tutor' ? (
                        room.tutor_submode === 'independent' ? (
                            isHost ? (
                                <TutorDashboard 
                                    participants={participants}
                                    totalQuestions={room.questions?.length || room.question_count || 0}
                                    onEndExam={() => {
                                        if(window.confirm('ต้องการจบเกมและเฉลยหรือไม่?')) {
                                            socket.emit('close_room', { roomId: id, userId: currentUser.id });
                                        }
                                    }}
                                />
                            ) : (
                                <MultiplayerExam
                                    ref={examRef}
                                    questions={room.questions}
                                    socket={socket}
                                    roomId={id}
                                    userId={currentUser.id}
                                    onFinish={(finalScore, finalAnswers) => {
                                        setFinalScore(finalScore);
                                        setUserAnswers(finalAnswers);
                                        // Emit that user is finished to server so dashboard shows 100%
                                        socket.emit('submit_progress', { roomId: id, userId: currentUser.id, questionIndex: room.questions.length });
                                    }}
                                    timeLimit={room.settings?.time_limit || 60}
                                />
                            )
                        ) : (
                            isHost ? (
                                <TutorView
                                    questions={room.questions}
                                    socket={socket}
                                    roomId={id}
                                    isHost={isHost}
                                    currentQuestionIndex={tutorQuestionIndex}
                                    participantCount={participants.length}
                                    answerCounts={currentAnswerCounts}
                                />
                            ) : (
                                <TutorPlayerView
                                    questions={room.questions}
                                    currentQuestionIndex={tutorQuestionIndex}
                                    isAnswerRevealed={isAnswerRevealed}
                                    onAnswer={handleTutorAnswer}
                                    score={finalScore}
                                />
                            )
                        )
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
                    <div className="flex flex-col h-full overflow-hidden playful-panel-sidebar">
                        {/* Tab Navigation */}
                        <div className="flex border-b border-white/20 bg-black/10">
                            <button
                                onClick={() => setActiveTab('participants')}
                                className={`flex-1 tab-btn ${activeTab === 'participants' ? 'active' : ''}`}
                            >
                                👥 Participants ({participants.length})
                            </button>
                            <button
                                onClick={() => setActiveTab('chat')}
                                className={`flex-1 tab-btn ${activeTab === 'chat' ? 'active' : ''}`}
                            >
                                💬 Chat Room
                            </button>
                        </div>

                        {/* Tab Content */}
                        <div className="flex-1 overflow-hidden flex flex-col bg-white/20">
                            {activeTab === 'participants' ? (
                                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                                    {isExamStarted && room.mode === 'exam' && !examFinished ? (
                                        <Leaderboard participants={participants} />
                                    ) : (
                                        <ul className="space-y-3">
                                            {participants.map((p, index) => {
                                                const colors = [
                                                    'from-pink-500 to-rose-500', 
                                                    'from-purple-500 to-indigo-500', 
                                                    'from-blue-500 to-cyan-500', 
                                                    'from-green-400 to-emerald-500',
                                                    'from-orange-400 to-amber-500'
                                                ];
                                                const bgGrad = colors[index % colors.length];

                                                return (
                                                    <li key={p.user_id || `participant-${index}`} className="flex items-center justify-between p-3 bg-white rounded-2xl transition-all border-4 border-white/50 shadow-md hover:scale-105 hover:shadow-lg">
                                                        <div className="flex items-center">
                                                            <div className={`w-12 h-12 bg-gradient-to-br ${bgGrad} rounded-xl flex items-center justify-center mr-4 text-lg font-black text-white shadow-inner border-2 border-white/30 overflow-hidden`}>
                                                                {p.User?.avatar ? (
                                                                    <img src={p.User.avatar} alt="avatar" className="w-full h-full object-cover" />
                                                                ) : (
                                                                    p.User?.display_name?.charAt(0).toUpperCase()
                                                                )}
                                                            </div>
                                                            <span className="font-black text-gray-800 text-xl drop-shadow-sm">{p.nickname || p.User?.display_name}</span>
                                                        </div>
                                                        {p.user_id === room.host_user_id && (
                                                            <span className="text-sm font-black bg-yellow-400 text-yellow-900 px-4 py-2 rounded-xl shadow-[0_3px_0_#ca8a04]">👑 HOST</span>
                                                        )}
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    )}
                                </div>
                            ) : (
                                <div className="flex-1 flex flex-col h-full bg-white rounded-b-3xl">
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

            {/* Nickname Modal */}
            {showNicknameModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl border-4 border-yellow-400 transform transition-all text-center">
                        <div className="text-5xl mb-4 animate-bounce">👾</div>
                        <h2 className="text-3xl font-black text-gray-800 mb-2">ตั้งชื่อเล่นสำหรับห้องนี้</h2>
                        <p className="text-gray-500 mb-6 font-bold">ชื่อนี้จะแสดงให้โฮสต์และเพื่อนๆ เห็น</p>
                        <form onSubmit={handleSetNickname}>
                            <input
                                type="text"
                                value={nicknameInput}
                                onChange={(e) => setNicknameInput(e.target.value)}
                                placeholder="พิมพ์ชื่อเล่นของคุณ..."
                                className="w-full bg-gray-100 border-2 border-gray-300 rounded-xl px-4 py-3 text-xl font-bold text-gray-800 focus:outline-none focus:border-blue-500 mb-6 text-center"
                                autoFocus
                                required
                            />
                            <button
                                type="submit"
                                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-black text-xl py-3 px-4 rounded-xl shadow-[0_6px_0_#1d4ed8] active:translate-y-[6px] active:shadow-none transition-all"
                            >
                                ลุยเลย! 🚀
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Room;
