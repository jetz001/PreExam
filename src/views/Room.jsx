import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import roomService from '../services/roomService';
import authService from '../services/authService';
import ChatBox from '../components/ChatBox';
import MultiplayerExam from '../components/MultiplayerExam';
import Leaderboard from '../components/Leaderboard';
import TutorView from '../components/TutorView';
import TutorPlayerView from '../components/TutorPlayerView';
import TutorDashboard from '../components/TutorDashboard';
import {
    Users,
    Play,
    LogOut,
    Flame,
    BookOpen,
    Rocket,
    Trophy,
    ClipboardList,
    CheckCircle2,
    XCircle,
    Lightbulb,
    Crown,
    Hourglass,
    MessageCircle,
    Gamepad2,
    Sparkles,
    Star,
    Target,
    Hash,
    Copy,
    Check,
    Loader2,
    ArrowLeft
} from 'lucide-react';
import AdSlot from '../components/ads/AdSlot';
import DOMPurify from 'dompurify';
import { getAssetUrl } from '../utils/assets';
import LottieViewer from '../components/room/LottieViewer';

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

let globalAssetsCache = null;

const emptyAnswerCounts = { A: 0, B: 0, C: 0, D: 0 };

const parseRoomSettings = (room) => {
    if (!room?.settings) return {};
    if (typeof room.settings === 'string') {
        try {
            return JSON.parse(room.settings);
        } catch {
            return {};
        }
    }
    return room.settings;
};

const Room = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [room, setRoom] = useState(null);
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
    const [chatMessages, setChatMessages] = useState([]);
    const [customAssets, setCustomAssets] = useState(globalAssetsCache || []);
    const [showNicknameModal, setShowNicknameModal] = useState(false);
    const [nicknameInput, setNicknameInput] = useState('');
    const [copiedCode, setCopiedCode] = useState(false);
    const examRef = useRef(null);

    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (!globalAssetsCache) {
            fetch('/api/assets')
                .then(res => res.json())
                .then(data => {
                    if (data.success && data.data) {
                        globalAssetsCache = data.data;
                        setCustomAssets(data.data);
                    }
                })
                .catch(err => console.error('Failed to load custom assets', err));
        }
    }, []);

    const applyRoomState = (roomData, user) => {
        if (!roomData || !user) return;

        const roomParticipants = roomData.RoomParticipants || [];
        const settings = parseRoomSettings(roomData);
        const tutorState = settings.tutor_state || {};
        const myParticipant = roomParticipants.find(p => p.user_id == user.id);
        const isUserHost = roomData.host_user_id == user.id;

        setRoom(roomData);
        setParticipants(roomParticipants);
        setChatMessages(Array.isArray(settings.chat_messages) ? settings.chat_messages : []);
        setTutorQuestionIndex(Number(tutorState.current_question_index || 0));
        setIsAnswerRevealed(Boolean(tutorState.is_answer_revealed));
        setCurrentAnswerCounts({ ...emptyAnswerCounts, ...(tutorState.answer_counts || {}) });

        if (!isUserHost && (!myParticipant || !myParticipant.nickname)) {
            setShowNicknameModal(true);
        }

        if (myParticipant?.status === 'finished') {
            setExamFinished(true);
            setFinalScore(myParticipant.score || 0);
            if (myParticipant.answers) {
                setUserAnswers(typeof myParticipant.answers === 'string' ? JSON.parse(myParticipant.answers) : myParticipant.answers);
            }
        } else if (roomData.status === 'finished') {
            setExamFinished(true);
        } else {
            setExamFinished(false);
        }

        if (roomData.status === 'in_progress' || roomData.status === 'playing' || myParticipant?.status === 'finished') {
            setIsExamStarted(true);
        } else {
            setIsExamStarted(false);
            if (roomData.status === 'waiting') {
                setFinalScore(0);
                setUserAnswers({});
            }
        }
    };

    const fetchRoomData = async (userOverride) => {
        const activeUser = userOverride || currentUser;
        if (!activeUser) return;
        try {
            const data = await roomService.getRoom(id);
            applyRoomState(data.data, activeUser);
        } catch (error) {
            console.error('Error refreshing room:', error);
            throw error;
        }
    };

    useEffect(() => {
        const user = authService.getCurrentUser();
        if (!user) {
            navigate('/login');
            return;
        }

        setCurrentUser(user);
        let isMounted = true;
        let pollTimer = null;

        const loadRoom = async () => {
            try {
                await fetchRoomData(user);
                if (!isMounted) return;
                pollTimer = setInterval(() => {
                    fetchRoomData(user).catch(() => {});
                }, 1500);
            } catch (error) {
                console.error('Error fetching room:', error);
                alert('Room not found');
                navigate('/lobby');
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        loadRoom();

        return () => {
            isMounted = false;
            if (pollTimer) clearInterval(pollTimer);
        };
    }, [id, navigate]);

    const handleStartExam = async () => {
        try {
            await roomService.startRoomExam(id);
            await fetchRoomData();
        } catch (error) {
            console.error('Error starting room exam:', error);
            alert('ไม่สามารถเริ่มสอบได้');
        }
    };

    const handleSetNickname = async (e) => {
        e.preventDefault();
        if (!nicknameInput.trim()) return;
        try {
            await roomService.setRoomNickname(id, { nickname: nicknameInput.trim() });
            setShowNicknameModal(false);
            setParticipants(prev => prev.map(p =>
                p.user_id == currentUser?.id ? { ...p, nickname: nicknameInput.trim() } : p
            ));
        } catch (error) {
            console.error('Error setting nickname:', error);
        }
    };

    const handleCopyCode = () => {
        if (!room?.code || !navigator?.clipboard) return;
        navigator.clipboard.writeText(room.code).then(() => {
            setCopiedCode(true);
            setTimeout(() => setCopiedCode(false), 1800);
        }).catch(() => {});
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

    const handleScoreChange = (score) => {
        setParticipants(prev => prev.map(p =>
            p.user_id == currentUser?.id ? { ...p, score } : p
        ));
        roomService.submitRoomScore(id, { score }).catch((error) => {
            console.error('Error saving score:', error);
        });
    };

    const handlePersistFinish = async ({ score, timeTaken, answers }) => {
        await roomService.finishRoomExam(id, {
            score,
            timeTaken,
            answers,
        });
        await fetchRoomData();
    };

    const handleProgressChange = (questionIndex) => {
        roomService.submitRoomProgress(id, { questionIndex }).catch((error) => {
            console.error('Error saving progress:', error);
        });
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
        roomService.submitRoomScore(id, { score: newScore }).catch((error) => {
            console.error('Error saving tutor score:', error);
        });
        roomService.tutorAnswer(id, { choice }).catch((error) => {
            console.error('Error saving tutor answer:', error);
        });
    };

    if (loading || !room) {
        return (
            <div className="min-h-[calc(100vh-5rem)] flex flex-col items-center justify-center p-6 text-white bg-gradient-to-br from-[#46178f] via-[#581cba] to-[#1e1b4b]">
                <div className="bg-white/10 backdrop-blur-xl border border-white/25 rounded-3xl p-8 flex flex-col items-center shadow-2xl">
                    <Loader2 className="w-10 h-10 text-amber-300 animate-spin mb-3" />
                    <p className="text-lg font-extrabold">กำลังเข้าสู่ห้องสอบ...</p>
                </div>
            </div>
        );
    }

    const isHost = currentUser?.id == room.host_user_id;

    return (
        <div
            className="min-h-[calc(100vh-5rem)] lg:h-[calc(100vh-5rem)] flex flex-col relative text-white overflow-x-hidden lg:overflow-hidden"
            style={{ fontFamily: "'Nunito', 'Sarabun', sans-serif" }}
        >
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
                    background: linear-gradient(-45deg, #581cba, #7e22ce, #2563eb, #0284c7);
                    background-size: 400% 400%;
                    animation: gradientBG 15s ease infinite;
                }
                .room-btn {
                    padding: 10px 18px; border-radius: 16px; font-weight: 900; font-size: 0.95rem;
                    transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    display: inline-flex; align-items: center; justify-content: center; gap: 8px;
                    border: 1.5px solid rgba(255,255,255,0.45); cursor: pointer;
                }
                .btn-start {
                    background: linear-gradient(135deg, #fde047, #f59e0b); color: #451a03;
                    box-shadow: 0 5px 0 #b45309;
                    border-color: #fef08a;
                }
                .btn-start:hover { filter: brightness(1.06); transform: translateY(-2px); box-shadow: 0 7px 0 #b45309; }
                .btn-start:active { transform: translateY(4px); box-shadow: 0 1px 0 #b45309; }

                .btn-leave {
                    background: linear-gradient(135deg, #ef4444, #dc2626); color: white;
                    box-shadow: 0 5px 0 #991b1b;
                    border-color: rgba(254, 202, 202, 0.65);
                }
                .btn-leave:hover { filter: brightness(1.08); transform: translateY(-2px); box-shadow: 0 7px 0 #991b1b; }
                .btn-leave:active { transform: translateY(4px); box-shadow: 0 1px 0 #991b1b; }

                .playful-panel-header {
                    background: rgba(30, 12, 72, 0.68);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    border: 1.5px solid rgba(255,255,255,0.28);
                    border-radius: 26px;
                    box-shadow: 0 14px 36px rgba(15, 5, 36, 0.36);
                }
                .playful-panel-main {
                    background: rgba(15, 23, 42, 0.42);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    border: 1.5px solid rgba(255,255,255,0.24);
                    border-radius: 26px;
                    box-shadow: 0 16px 40px rgba(15, 5, 36, 0.36);
                }
                .playful-panel-sidebar {
                    background: rgba(30, 12, 72, 0.56);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    border: 1.5px solid rgba(255,255,255,0.24);
                    border-radius: 26px;
                    box-shadow: 0 16px 40px rgba(15, 5, 36, 0.36);
                }
                .tab-btn {
                    padding: 12px 10px; font-weight: 800; font-size: 0.92rem; transition: 0.2s;
                    color: rgba(255,255,255,0.78); display: flex; align-items: center; justify-content: center; gap: 6px;
                    border-bottom: 3px solid transparent; cursor: pointer;
                }
                .tab-btn:hover { color: white; background: rgba(255,255,255,0.08); }
                .tab-btn.active { color: white; background: rgba(255,255,255,0.16); border-bottom-color: #fde047; }
                .pulse-icon { animation: pulse 1.5s infinite; }
                .float-anim { animation: float 6s ease-in-out infinite; }
            `}</style>

            {/* Floating Shapes or Custom Background */}
            <div className="room-wrapper" style={room.theme?.background_id ? { background: '#1a1a2e' } : {}} aria-hidden="true">
                {room.theme?.background_id ? (
                    (() => {
                        const bgUrl = room.theme.background_url || getAssetUrl(room.theme.background_id, 'background') || customAssets.find(a => a.id === room.theme.background_id)?.url;
                        if (!bgUrl) return null;
                        if (bgUrl.endsWith('.json')) {
                            return <LottieViewer url={bgUrl} className="absolute inset-0 w-full h-full opacity-60 z-0 object-cover" />;
                        }
                        return <img src={bgUrl} alt="room bg" className="absolute inset-0 w-full h-full object-cover opacity-60 z-0" />;
                    })()
                ) : (
                    <>
                        <div className="absolute top-12 right-16 opacity-20 float-anim text-white" style={{ animationDelay: '0s' }}>
                            <Sparkles className="w-24 h-24" />
                        </div>
                        <div className="absolute bottom-12 left-10 opacity-20 float-anim text-amber-300" style={{ animationDelay: '1s' }}>
                            <Rocket className="w-24 h-24" />
                        </div>
                        <div className="absolute top-1/2 right-10 opacity-15 float-anim text-sky-200" style={{ animationDelay: '2s' }}>
                            <Gamepad2 className="w-20 h-20" />
                        </div>
                        <div className="absolute top-32 left-28 opacity-20 float-anim text-yellow-200" style={{ animationDelay: '3s' }}>
                            <Star className="w-16 h-16" />
                        </div>
                        <div className="absolute bottom-28 right-1/3 opacity-15 float-anim text-pink-200" style={{ animationDelay: '1.5s' }}>
                            <Target className="w-20 h-20" />
                        </div>
                    </>
                )}
            </div>

            <div className="container mx-auto px-3.5 sm:px-6 py-4 sm:py-6 flex flex-col flex-1 lg:min-h-0 relative z-10">
                {/* Room Header */}
                <div className="playful-panel-header p-4 sm:p-5 mb-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
                    <div className="relative z-10 flex-1 min-w-0 w-full">
                        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
                            <h1 className="text-2xl sm:text-3xl font-black text-white drop-shadow-md tracking-tight break-words">
                                {room.name}
                            </h1>
                            <button
                                type="button"
                                onClick={handleCopyCode}
                                aria-label="คัดลอกรหัสห้อง"
                                title="คลิกเพื่อคัดลอกรหัสห้อง"
                                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-black bg-white text-indigo-950 px-3 py-1.5 rounded-xl shadow-md hover:bg-amber-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 cursor-pointer shrink-0"
                            >
                                <Hash className="w-3.5 h-3.5 text-indigo-600" />
                                <span>Code:</span>
                                <span className="text-rose-600 tracking-widest">{room.code}</span>
                                {copiedCode ? (
                                    <Check className="w-3.5 h-3.5 text-emerald-600 ml-0.5" />
                                ) : (
                                    <Copy className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
                                )}
                            </button>
                        </div>
                        <div className="text-white mt-2.5 font-bold flex flex-wrap items-center gap-2 text-xs sm:text-sm">
                            <span className="inline-flex items-center gap-1.5 bg-rose-500/35 border border-rose-300/35 px-3 py-1 rounded-xl shadow-xs">
                                <Flame className="w-3.5 h-3.5 text-amber-300" />
                                <span>โหมด:</span>
                                <span className="capitalize text-rose-100 font-black">{room.mode}</span>
                            </span>
                            <span className="inline-flex items-center gap-1.5 bg-sky-500/35 border border-sky-300/35 px-3 py-1 rounded-xl shadow-xs">
                                <BookOpen className="w-3.5 h-3.5 text-sky-200" />
                                <span>วิชา:</span>
                                <span className="text-sky-100 font-black">{room.subject || 'ทั่วไป'}</span>
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2.5 relative z-10 w-full md:w-auto justify-start md:justify-end">
                        {isHost && !isExamStarted && !examFinished && (
                            <button
                                type="button"
                                onClick={handleStartExam}
                                className="room-btn btn-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                            >
                                <Play className="w-4 h-4 fill-current" />
                                <span>Start {room.mode === 'tutor' ? 'Session' : 'Exam'}</span>
                                <Rocket className="w-4 h-4" />
                            </button>
                        )}
                        {isHost && room.mode === 'tutor' && !examFinished && (
                            <button
                                type="button"
                                onClick={async () => {
                                    if (window.confirm('Are you sure you want to close this room?')) {
                                        await roomService.closeRoom(id);
                                        await fetchRoomData();
                                    }
                                }}
                                className="room-btn bg-amber-500/25 hover:bg-amber-500/40 text-amber-100 border-amber-300/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
                            >
                                <LogOut className="w-4 h-4" />
                                <span>Close Room</span>
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={() => {
                                if (isExamStarted && !examFinished && room.mode === 'exam' && examRef.current) {
                                    examRef.current.submitExam();
                                }
                                navigate('/lobby');
                            }}
                            className="room-btn btn-leave focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
                        >
                            <LogOut className="w-4 h-4" />
                            <span>Leave</span>
                        </button>
                    </div>
                </div>

                <div className={`grid grid-cols-1 ${examFinished ? '' : 'lg:grid-cols-3'} gap-5 sm:gap-6 flex-1 lg:min-h-0 relative z-10`}>
                    {/* Main Content Area (Waiting / Exam) */}
                    <div className={`${examFinished ? 'w-full' : 'lg:col-span-2'} playful-panel-main p-3.5 sm:p-6 flex flex-col lg:min-h-0 overflow-hidden`}>
                        {examFinished ? (
                            <div className="flex flex-col h-full min-h-0">
                                <div className="flex flex-wrap justify-between items-center gap-3 mb-5">
                                    <h2 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3">
                                        <span className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center shadow-lg shrink-0">
                                            <Trophy className="w-5 h-5" />
                                        </span>
                                        <span>Final Leaderboard</span>
                                    </h2>
                                    <button
                                        type="button"
                                        onClick={() => navigate('/lobby')}
                                        className="room-btn bg-white/15 hover:bg-white/25 text-white border-white/30 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
                                    >
                                        <ArrowLeft className="w-4 h-4" />
                                        <span>Back to Lobby</span>
                                    </button>
                                </div>

                                {/* Only show "Your Score" if the user actually participated and finished */}
                                {participants.find(p => p.user_id == currentUser?.id && p.status === 'finished') && (
                                    <div className="bg-white/12 p-5 sm:p-6 rounded-2xl mb-5 text-center flex flex-col justify-center items-center border border-white/25 shadow-lg backdrop-blur-md">
                                        <span className="text-sm sm:text-base text-white/85 font-bold mb-1">Your Score</span>
                                        <span className="font-black text-4xl sm:text-5xl text-amber-300 drop-shadow-[0_2px_6px_rgba(0,0,0,0.4)]">
                                            {finalScore}
                                        </span>
                                    </div>
                                )}

                                <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
                                    {/* Ad Injection for Exam Result */}
                                    <div className="mb-5">
                                        <AdSlot placement="result" />
                                    </div>

                                    <Leaderboard participants={participants} />

                                    {Object.keys(userAnswers).length > 0 && (
                                        <div className="mt-7 border-t border-white/20 pt-6">
                                            <h3 className="text-xl sm:text-2xl font-black mb-4 text-white flex items-center gap-2.5">
                                                <span className="w-9 h-9 rounded-xl bg-sky-500/30 border border-sky-300/35 text-sky-200 flex items-center justify-center shrink-0">
                                                    <ClipboardList className="w-5 h-5" />
                                                </span>
                                                <span>Review Answers</span>
                                            </h3>
                                            <div className="space-y-5">
                                                {room.questions.map((q, index) => {
                                                    const userAnswerRaw = userAnswers[q.id];
                                                    const correctRaw = q.correct_answer;

                                                    const userNorm = userAnswerRaw ? String(userAnswerRaw).trim().toLowerCase() : '';
                                                    const correctNorm = correctRaw ? String(correctRaw).trim().toLowerCase() : '';

                                                    const isQuestionCorrect = userNorm === correctNorm;

                                                    return (
                                                        <div
                                                            key={q.id}
                                                            className={`p-4 sm:p-5 rounded-2xl border backdrop-blur-md text-left ${
                                                                isQuestionCorrect
                                                                    ? 'border-emerald-400/50 bg-emerald-950/45'
                                                                    : 'border-rose-400/50 bg-rose-950/45'
                                                            }`}
                                                        >
                                                            <div className="font-bold mb-4 text-white text-base sm:text-lg leading-relaxed break-words">
                                                                <span className="inline-block mr-2 px-2.5 py-0.5 bg-white/20 rounded-lg text-sm font-black">
                                                                    ข้อ {index + 1}
                                                                </span>
                                                                <div className="whitespace-pre-line mt-2" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(decodeHtml(q.question_text)) }} />
                                                            </div>
                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-sm">
                                                                {['a', 'b', 'c', 'd'].map((opt) => {
                                                                    const choiceText = q[`choice_${opt}`];
                                                                    const isThisCorrect = correctNorm === opt;
                                                                    const isThisUser = userNorm === opt;

                                                                    let itemClass = "p-3 rounded-xl border transition-all flex items-center justify-between gap-2 ";
                                                                    if (isThisCorrect) {
                                                                        itemClass += "bg-emerald-500/25 border-emerald-400 text-emerald-50 font-bold shadow-[0_0_15px_rgba(52,211,153,0.2)]";
                                                                    } else if (isThisUser && !isQuestionCorrect) {
                                                                        itemClass += "bg-rose-500/25 border-rose-400 text-rose-50 font-semibold";
                                                                    } else {
                                                                        itemClass += "bg-white/10 border-white/20 text-white/85";
                                                                    }

                                                                    return (
                                                                        <div key={opt} className={itemClass}>
                                                                            <div className="flex items-center gap-2 min-w-0">
                                                                                <span className="uppercase font-black bg-black/25 px-2 py-0.5 rounded-md shrink-0">
                                                                                    {opt}
                                                                                </span>
                                                                                <span className="break-words">{choiceText}</span>
                                                                            </div>
                                                                            <div className="flex items-center gap-1.5 shrink-0">
                                                                                {isThisCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-300" />}
                                                                                {isThisUser && !isQuestionCorrect && <XCircle className="w-4 h-4 text-rose-300" />}
                                                                                {isThisUser && (
                                                                                    <span className="text-[11px] bg-white/20 text-white px-2 py-0.5 rounded-full font-bold">
                                                                                        You
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                            {q.explanation && (
                                                                <div className="mt-4 text-sm text-white/95 bg-white/10 p-4 rounded-xl border border-white/20 backdrop-blur-sm whitespace-pre-line leading-relaxed">
                                                                    <strong className="text-amber-300 text-sm sm:text-base flex items-center gap-1.5 mb-1">
                                                                        <Lightbulb className="w-4 h-4 shrink-0" />
                                                                        <span>Explanation:</span>
                                                                    </strong>
                                                                    <span>{q.explanation}</span>
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
                            <div className="flex flex-col justify-center items-center text-center h-full min-h-[340px] relative p-4 sm:p-8">
                                <div className="w-28 h-28 sm:w-36 sm:h-36 bg-white/95 rounded-[2.25rem] flex items-center justify-center mx-auto mb-6 text-indigo-600 shadow-[0_16px_38px_rgba(0,0,0,0.25)] rotate-3 hover:rotate-6 transition-transform duration-300 float-anim border-4 border-amber-300">
                                    <Users className="w-14 h-14 sm:w-18 sm:h-18 pulse-icon" />
                                </div>
                                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-5 drop-shadow-xl tracking-tight uppercase">
                                    Waiting for Players<span className="animate-pulse">...</span>
                                </h2>

                                <div className="bg-white/95 backdrop-blur-md px-6 sm:px-8 py-3 sm:py-4 rounded-full border-2 border-white shadow-xl mb-7 transform hover:scale-105 transition-transform">
                                    <p className="text-indigo-700 font-black text-lg sm:text-2xl flex items-center gap-2.5">
                                        <span className="text-2xl sm:text-4xl text-indigo-600">{participants.length}</span>
                                        <span className="text-slate-400">/</span>
                                        <span>{room.max_participants} joined</span>
                                    </p>
                                </div>

                                {isHost ? (
                                    <button
                                        type="button"
                                        onClick={handleStartExam}
                                        className="bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-400 text-amber-950 font-black px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl border-2 border-amber-200 shadow-[0_6px_0_#b45309] text-base sm:text-xl hover:brightness-105 hover:-translate-y-0.5 active:translate-y-[4px] active:shadow-none transition-all cursor-pointer inline-flex items-center justify-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                                    >
                                        <Crown className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" />
                                        <span>You are the host. Click to START!</span>
                                        <Rocket className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" />
                                    </button>
                                ) : (
                                    <div className="bg-white/15 backdrop-blur-md text-white font-extrabold px-5 py-3 rounded-2xl border border-white/30 shadow-lg text-sm sm:text-lg inline-flex items-center gap-2.5">
                                        <Hourglass className="w-5 h-5 text-amber-300 animate-pulse shrink-0" />
                                        <span>Waiting for host to start the game...</span>
                                    </div>
                                )}
                            </div>
                        ) : room.mode === 'tutor' ? (
                            room.tutor_submode === 'independent' ? (
                                isHost ? (
                                    <TutorDashboard
                                        participants={participants}
                                        totalQuestions={room.questions?.length || room.question_count || 0}
                                        onEndExam={async () => {
                                            if (window.confirm('ต้องการจบเกมและเฉลยหรือไม่?')) {
                                                await roomService.closeRoom(id);
                                                await fetchRoomData();
                                            }
                                        }}
                                    />
                                ) : (
                                    <MultiplayerExam
                                        ref={examRef}
                                        questions={room.questions}
                                        socket={null}
                                        roomId={id}
                                        userId={currentUser.id}
                                        onFinish={(finalScore, finalAnswers) => {
                                            setFinalScore(finalScore);
                                            setUserAnswers(finalAnswers);
                                        }}
                                        onPersistFinish={handlePersistFinish}
                                        onScoreChange={handleScoreChange}
                                        onProgressChange={handleProgressChange}
                                        timeLimit={typeof room.settings === 'string' ? JSON.parse(room.settings).time_limit : room.settings?.time_limit || 60}
                                    />
                                )
                            ) : (
                                isHost ? (
                                    <TutorView
                                        questions={room.questions}
                                        socket={null}
                                        roomId={id}
                                        isHost={isHost}
                                        currentQuestionIndex={tutorQuestionIndex}
                                        participantCount={participants.length}
                                        answerCounts={currentAnswerCounts}
                                        onNavigateQuestion={async (questionIndex) => {
                                            await roomService.tutorNavigate(id, { questionIndex });
                                            await fetchRoomData();
                                        }}
                                        onRevealAnswer={async (questionIndex) => {
                                            await roomService.tutorReveal(id, { questionIndex });
                                            await fetchRoomData();
                                        }}
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
                                socket={null}
                                roomId={id}
                                userId={currentUser.id}
                                onFinish={handleExamFinish}
                                onPersistFinish={handlePersistFinish}
                                onScoreChange={handleScoreChange}
                                onProgressChange={handleProgressChange}
                                timeLimit={typeof room.settings === 'string' ? JSON.parse(room.settings).time_limit : room.settings?.time_limit}
                            />
                        )}
                    </div>

                    {/* Sidebar: Participants & Chat */}
                    {!examFinished && (
                        <div className="flex flex-col min-h-[380px] lg:min-h-0 lg:h-full overflow-hidden playful-panel-sidebar">
                            {/* Tab Navigation */}
                            <div className="flex border-b border-white/20 bg-black/15">
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('participants')}
                                    className={`flex-1 tab-btn focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-amber-300 ${activeTab === 'participants' ? 'active' : ''}`}
                                >
                                    <Users className="w-4 h-4 shrink-0" />
                                    <span>Participants ({participants.length})</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('chat')}
                                    className={`flex-1 tab-btn focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-amber-300 ${activeTab === 'chat' ? 'active' : ''}`}
                                >
                                    <MessageCircle className="w-4 h-4 shrink-0" />
                                    <span>Chat Room</span>
                                </button>
                            </div>

                            {/* Tab Content */}
                            <div className="flex-1 min-h-0 overflow-hidden flex flex-col bg-white/10">
                                {activeTab === 'participants' ? (
                                    <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 custom-scrollbar">
                                        {isExamStarted && room.mode === 'exam' && !examFinished ? (
                                            <Leaderboard participants={participants} />
                                        ) : (
                                            <ul className="space-y-2.5">
                                                {participants.map((p, index) => {
                                                    const colors = [
                                                        'from-pink-500 to-rose-500',
                                                        'from-purple-500 to-indigo-500',
                                                        'from-blue-500 to-cyan-500',
                                                        'from-emerald-400 to-teal-500',
                                                        'from-orange-400 to-amber-500'
                                                    ];
                                                    const bgGrad = colors[index % colors.length];
                                                    const pName = p.nickname || p.User?.display_name || 'ผู้เล่น';

                                                    return (
                                                        <li
                                                            key={p.user_id || `participant-${index}`}
                                                            className="flex items-center justify-between gap-2.5 p-3 bg-white/95 backdrop-blur-md rounded-2xl transition-all border border-white shadow-md hover:scale-[1.01]"
                                                        >
                                                            <div className="flex items-center gap-3 min-w-0">
                                                                <div className={`w-10 h-10 bg-gradient-to-br ${bgGrad} rounded-xl flex items-center justify-center text-base font-black text-white shadow-inner border border-white/40 overflow-hidden shrink-0`}>
                                                                    {p.User?.avatar ? (
                                                                        <img src={p.User.avatar} alt={pName} className="w-full h-full object-cover" />
                                                                    ) : (
                                                                        pName.charAt(0).toUpperCase()
                                                                    )}
                                                                </div>
                                                                <span className="font-extrabold text-slate-800 text-base sm:text-lg truncate">
                                                                    {pName}
                                                                </span>
                                                            </div>
                                                            {p.user_id === room.host_user_id && (
                                                                <span className="inline-flex items-center gap-1 text-xs font-black bg-amber-300 text-amber-950 px-2.5 py-1.5 rounded-xl shadow-[0_2px_0_#b45309] shrink-0">
                                                                    <Crown className="w-3.5 h-3.5" />
                                                                    <span>HOST</span>
                                                                </span>
                                                            )}
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex-1 flex flex-col h-full min-h-0">
                                        <ChatBox
                                            socket={null}
                                            roomId={id}
                                            userId={currentUser?.id}
                                            displayName={currentUser?.display_name}
                                            messages={chatMessages}
                                            onSendMessage={async (message) => {
                                                await roomService.sendRoomMessage(id, {
                                                    message,
                                                    displayName: currentUser?.display_name || currentUser?.username || 'ผู้ใช้',
                                                });
                                                await fetchRoomData();
                                            }}
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
                <div
                    className="fixed inset-0 bg-slate-950/75 flex items-center justify-center z-[250] backdrop-blur-md p-4"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="nickname-modal-title"
                >
                    <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl border-2 border-amber-300 transform transition-all text-center">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center mx-auto mb-4 shadow-lg animate-bounce">
                            <Gamepad2 className="w-9 h-9" />
                        </div>
                        <h2 id="nickname-modal-title" className="text-2xl sm:text-3xl font-black text-slate-900 mb-1.5">
                            ตั้งชื่อเล่นสำหรับห้องนี้
                        </h2>
                        <p className="text-slate-600 mb-6 font-bold text-sm sm:text-base">
                            ชื่อนี้จะแสดงให้โฮสต์และเพื่อนๆ เห็น
                        </p>
                        <form onSubmit={handleSetNickname}>
                            <input
                                type="text"
                                value={nicknameInput}
                                onChange={(e) => setNicknameInput(e.target.value)}
                                placeholder="พิมพ์ชื่อเล่นของคุณ..."
                                aria-label="ชื่อเล่นสำหรับห้องนี้"
                                className="w-full bg-slate-100 border-2 border-slate-300 rounded-xl px-4 py-3 text-lg font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus-visible:ring-2 focus-visible:ring-indigo-400 mb-5 text-center"
                                autoFocus
                                required
                            />
                            <button
                                type="submit"
                                className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:brightness-110 text-white font-black text-lg py-3.5 px-5 rounded-xl shadow-[0_5px_0_#3730a3] active:translate-y-[4px] active:shadow-none transition-all flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 cursor-pointer"
                            >
                                <span>ลุยเลย!</span>
                                <Rocket className="w-5 h-5" />
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Room;
