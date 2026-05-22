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
        <div className="container mx-auto px-4 py-8 h-screen-minus-navbar flex flex-col relative text-white">
            <style>{`
                .room-wrapper { position: absolute; inset: 0; z-index: -1; overflow: hidden; pointer-events: none; }
                .room-btn { padding: 10px 20px; border-radius: 16px; font-weight: 800; transition: all 0.2s; display: flex; align-items: center; border: none; cursor: pointer; }
                .btn-start { background: linear-gradient(135deg, #34d399 0%, #10b981 100%); color: white; box-shadow: 0 4px 0 #059669; }
                .btn-start:active { transform: translateY(4px); box-shadow: 0 0 0 #059669; }
                .btn-leave { background: rgba(239, 68, 68, 0.2); color: #fca5a5; border: 2px solid rgba(239, 68, 68, 0.4); box-shadow: 0 4px 0 rgba(239, 68, 68, 0.2); }
                .btn-leave:active { transform: translateY(4px); box-shadow: 0 0 0 transparent; }
                .glass-panel { background: rgba(255, 255, 255, 0.1); backdrop-filter: blur(12px); border: 2px solid rgba(255, 255, 255, 0.2); border-radius: 24px; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2); }
                .tab-btn { padding: 12px; font-weight: 800; transition: 0.2s; color: rgba(255,255,255,0.6); }
                .tab-btn.active { color: white; background: rgba(255,255,255,0.15); border-bottom: 3px solid #a855f7; }
                .pulse-icon { animation: pulse 2s infinite; }
            `}</style>
            
            {/* Playful Floating Shapes behind */}
            <div className="room-wrapper">
                <div className="absolute top-20 right-20 text-6xl opacity-20 animate-bounce">🎈</div>
                <div className="absolute bottom-20 left-20 text-7xl opacity-20 animate-pulse">✨</div>
                <div className="absolute top-40 left-10 text-4xl opacity-10 animate-spin" style={{ animationDuration: '10s' }}>⭐</div>
            </div>
            {/* Room Header */}
            <div className="glass-panel p-6 mb-6 flex flex-col md:flex-row justify-between items-center gap-4 relative overflow-hidden">
                <div className="relative z-10">
                    <h1 className="text-3xl font-black text-white flex items-center drop-shadow-md">
                        {room.name}
                        <span className="ml-4 text-sm font-bold bg-white/20 px-3 py-1.5 rounded-xl text-white border border-white/30 backdrop-blur-sm shadow-sm">
                            Code: <span className="text-yellow-300 tracking-wider">{room.code}</span>
                        </span>
                    </h1>
                    <p className="text-white/70 mt-2 font-bold flex items-center gap-2">
                        <span>🔥 โหมด: <span className="text-pink-300 capitalize">{room.mode}</span></span> •
                        <span>📚 วิชา: <span className="text-blue-300">{room.subject}</span></span>
                    </p>
                </div>
                <div className="flex space-x-3 relative z-10">
                    {isHost && !isExamStarted && !examFinished && (
                        <button
                            onClick={handleStartExam}
                            className="room-btn btn-start"
                        >
                            <Play className="w-5 h-5 mr-2" /> Start {room.mode === 'tutor' ? 'Session' : 'Exam'} 🚀
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

            <div className={`grid grid-cols-1 ${examFinished ? '' : 'lg:grid-cols-3'} gap-6 flex-1 overflow-hidden relative z-10`}>
                {/* Main Content Area (Waiting / Exam) */}
                <div className={`${examFinished ? 'w-full' : 'lg:col-span-2'} glass-panel p-6 flex flex-col overflow-hidden`}>
                    {examFinished ? (
                        <div className="flex flex-col h-full">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-3xl font-black text-white flex items-center gap-2">🏆 Final Leaderboard</h2>
                                <button onClick={() => navigate('/lobby')} className="room-btn bg-white/20 text-white hover:bg-white/30">
                                    Back to Lobby
                                </button>
                            </div>

                            {/* Only show "Your Score" if the user actually participated and finished */}
                            {participants.find(p => p.user_id === currentUser?.id && p.status === 'finished') && (
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
                        <div className="flex flex-col justify-center items-center text-center h-full relative">
                            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent pointer-events-none rounded-2xl"></div>
                            
                            <div className="w-32 h-32 bg-white/20 rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-white backdrop-blur-md border-4 border-white/30 shadow-[0_0_30px_rgba(255,255,255,0.2)] rotate-3 hover:rotate-6 transition-transform">
                                <Users className="w-16 h-16 pulse-icon" />
                            </div>
                            <h2 className="text-4xl font-black text-white mb-3 drop-shadow-lg tracking-wide">Waiting for Players<span className="animate-pulse">...</span></h2>
                            
                            <div className="bg-white/20 px-6 py-2 rounded-full border border-white/30 backdrop-blur-sm mb-6">
                                <p className="text-white font-bold text-lg">
                                    <span className="text-yellow-300">{participants.length}</span> / {room.max_participants} joined
                                </p>
                            </div>
                            
                            {isHost ? (
                                <p className="text-white/70 font-bold bg-white/10 px-4 py-2 rounded-xl border border-white/10">👑 You are the host. Click "Start Exam" when ready.</p>
                            ) : (
                                <p className="text-white/70 font-bold bg-white/10 px-4 py-2 rounded-xl border border-white/10 animate-pulse">⏳ Waiting for host to start the game...</p>
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
                    <div className="flex flex-col h-full overflow-hidden glass-panel">
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
                        <div className="flex-1 overflow-hidden flex flex-col">
                            {activeTab === 'participants' ? (
                                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                                    {isExamStarted && room.mode === 'exam' && !examFinished ? (
                                        <Leaderboard participants={participants} />
                                    ) : (
                                        <ul className="space-y-3">
                                            {participants.map((p) => (
                                                <li key={p.id} className="flex items-center justify-between p-3 hover:bg-white/10 rounded-xl transition-all border border-transparent hover:border-white/20">
                                                    <div className="flex items-center">
                                                        <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center mr-3 text-sm font-black text-white shadow-sm">
                                                            {p.User?.display_name?.charAt(0).toUpperCase()}
                                                        </div>
                                                        <span className="font-bold text-white text-lg drop-shadow-sm">{p.User?.display_name}</span>
                                                    </div>
                                                    {p.user_id === room.host_user_id && (
                                                        <span className="text-xs font-black bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full shadow-sm">👑 HOST</span>
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
