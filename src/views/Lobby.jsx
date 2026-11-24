import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import roomService from '../services/roomService';
import authService from '../services/authService';
import userService from '../services/userService';
import { getAssetUrl } from '../utils/assets';
import { canCreateRooms } from '../utils/userAccess';
import LottieViewer from '../components/room/LottieViewer';
import {
  Search,
  Play,
  Users,
  Lock,
  ChevronRight,
  Plus,
  Star,
  Sparkles,
  Gem,
  Trophy,
  Ticket,
  Flame,
  GraduationCap,
  Gamepad2,
  Orbit,
  Castle,
  Ghost,
  Rocket,
  Gift,
  PartyPopper,
  KeyRound,
  X,
  Globe,
  Share2
} from 'lucide-react';
import CreateRoomModal from '../components/room/CreateRoomModal';
import LobbyWorldChat from '../components/room/LobbyWorldChat';

let globalLobbyAssetsCache = null;

export default function Lobby() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // User Data for Header & XP
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [xpInfo, setXpInfo] = useState({ level: 1, currentXP: 0, nextLevelXP: 1000, percentage: 0 });

  // Password Modal
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [pendingRoomCode, setPendingRoomCode] = useState(null);
  const [customAssets, setCustomAssets] = useState(globalLobbyAssetsCache || []);
  const [mobileTab, setMobileTab] = useState('rooms');
  const [invitedRoom, setInvitedRoom] = useState(null);
  const [unreadWorldCount, setUnreadWorldCount] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    fetchRooms(1);
    loadUserData();
    // Load custom assets for frame/background resolution
    if (!globalLobbyAssetsCache) {
      fetch('/api/assets')
        .then(res => res.json())
        .then(data => {
          if (data.success && data.data) {
            globalLobbyAssetsCache = data.data;
            setCustomAssets(data.data);
          }
        })
        .catch(err => console.error('Failed to load lobby assets', err));
    }
  }, []);

  useEffect(() => {
    if (!showPasswordModal) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') {
        setShowPasswordModal(false);
        setPasswordInput('');
        setPendingRoomCode(null);
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [showPasswordModal]);

  const loadUserData = async () => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) setUser(currentUser);

    try {
      const resStats = await userService.getStats();
      if (resStats.success && resStats.data) {
        setStats(resStats.data);
        const calculatedXP = (resStats.data.totalExams * 50) + (resStats.data.totalQuestions * 10);
        const level = Math.floor(calculatedXP / 1000) + 1;
        const nextLevelXP = level * 1000;
        const currentLevelXP = calculatedXP % 1000;
        const percentage = (currentLevelXP / 1000) * 100;
        setXpInfo({ level, currentXP: calculatedXP, nextLevelXP, percentage });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRooms = async (page = 1) => {
    setLoading(true);
    try {
      const data = await roomService.getRooms(page, 20);
      setRooms(data.data);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRoom = async (formData) => {
    try {
      const response = await roomService.createRoom(formData);
      if (response.success) {
        setShowCreateModal(false);
        navigate(`/room/${response.data.id}`);
      }
    } catch (error) {
      console.error('Error creating room:', error);
      alert(error.response?.data?.message || 'Failed to create room');
    }
  };

  const handleOpenCreateRoom = () => {
    if (!canCreateRooms(user)) {
      alert('กรุณาสมัครสมาชิกเพื่อสร้างห้อง');
      return;
    }

    setShowCreateModal(true);
  };

  const handleJoinRoom = async (code, password = null) => {
    try {
      const response = await roomService.joinRoom(code, password);
      if (response.success) {
        setShowPasswordModal(false);
        setPasswordInput('');
        setPendingRoomCode(null);
        navigate(`/room/${response.data.id}`);
      }
    } catch (error) {
      console.error('Error joining room:', error);
      if (error.response && error.response.status === 403 && error.response.data.requirePassword) {
        setPendingRoomCode(code);
        setShowPasswordModal(true);
      } else {
        alert(error.response?.data?.message || 'Failed to join room. Check the code.');
      }
    }
  };

  const handleSubmitPassword = (e) => {
    e.preventDefault();
    handleJoinRoom(pendingRoomCode, passwordInput);
  };

  const handleShareRoomToWorld = (room) => {
    setInvitedRoom({ code: room.code, name: room.name });
    setMobileTab('chat');
    setUnreadWorldCount(0);
  };

  const getCardTheme = (index) => {
    const themes = [
      { bg: '#2d0d6b', header: 'linear-gradient(135deg, #5b21b6, #46178f)', accent: '#a78bfa', Icon: Orbit },
      { bg: '#b45309', header: 'linear-gradient(135deg, #f59e0b, #ea580c)', accent: '#fde047', Icon: Trophy },
      { bg: '#15803d', header: 'linear-gradient(135deg, #22c55e, #16a34a)', accent: '#86efac', Icon: Castle },
      { bg: '#1d4ed8', header: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', accent: '#93c5fd', Icon: Gamepad2 },
    ];
    return themes[index % themes.length];
  };

  const filteredRooms = rooms.filter(room =>
    (room.name || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
    (room.subject || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
    (room.Host?.display_name || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
    (room.code || '').toLowerCase().includes((searchTerm || '').toLowerCase())
  );

  return (
    <div className="lb-wrapper">
      <style>{`
        .lb-wrapper {
          min-height: 100vh;
          width: 100%;
          padding-top: 28px;
          padding-bottom: 124px;
          font-family: 'Nunito', 'Sarabun', sans-serif;
          position: relative;
          overflow-x: hidden;
          color: white;
        }
        /* Fixed background to cover entire screen */
        .lb-bg {
          position: fixed; inset: 0; z-index: 0;
          background: radial-gradient(circle at 20% 20%, #6d28d9 0%, #46178f 42%, #240b4c 100%);
          pointer-events: none;
        }
        /* Floating shapes */
        .lb-shape { position: fixed; pointer-events: none; z-index: 0; }
        .lb-circle-1 { width: 42px; height: 42px; background: #e21b3c; border-radius: 50%; top: 15%; left: 10%; opacity: 0.55; filter: blur(2px); animation: float 6s ease-in-out infinite; }
        .lb-circle-2 { width: 28px; height: 28px; background: #00c985; border-radius: 50%; bottom: 25%; left: 5%; opacity: 0.5; filter: blur(1px); animation: float 8s ease-in-out infinite reverse; }
        .lb-rect-1 { width: 28px; height: 28px; background: #ffcc00; top: 12%; right: 16%; transform: rotate(45deg); opacity: 0.65; border-radius: 6px; animation: floatSpin 8s linear infinite alternate; }
        .lb-rect-2 { width: 22px; height: 22px; background: #e21b3c; bottom: 22%; right: 10%; transform: rotate(15deg); opacity: 0.55; border-radius: 6px; animation: floatSpin 10s linear infinite; }
        .lb-confetti-1 { width: 14px; height: 32px; background: #00c985; top: 32%; right: 14%; transform: rotate(-20deg); opacity: 0.55; border-radius: 4px; animation: float 5s ease-in-out infinite; }
        .lb-confetti-2 { width: 12px; height: 12px; background: #38bdf8; top: 26%; left: 45%; opacity: 0.65; border-radius: 3px; animation: float 7s ease-in-out infinite; }
        .lb-confetti-3 { width: 18px; height: 8px; background: #ff8c00; top: 52%; left: 6%; transform: rotate(30deg); opacity: 0.7; border-radius: 4px; animation: float 6s ease-in-out infinite reverse; }
        .lb-confetti-4 { width: 10px; height: 20px; background: #ffcc00; bottom: 38%; right: 24%; transform: rotate(70deg); opacity: 0.65; border-radius: 4px; animation: float 5.5s ease-in-out infinite; }
        .lb-star-1 { color: #fde047; top: 16%; left: 74%; opacity: 0.75; animation: floatPulse 4s ease-in-out infinite; }
        .lb-star-2 { color: #38bdf8; bottom: 18%; left: 22%; opacity: 0.65; animation: floatPulse 5s ease-in-out infinite 1s; }

        @keyframes float {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-22px) rotate(12deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
        @keyframes floatSpin {
          0% { transform: translateY(0px) rotate(0deg); }
          100% { transform: translateY(-28px) rotate(360deg); }
        }
        @keyframes floatPulse {
          0% { transform: scale(1) translateY(0); }
          50% { transform: scale(1.18) translateY(-10px); }
          100% { transform: scale(1) translateY(0); }
        }
        @keyframes bounceGlow {
          0%, 100% { text-shadow: 0 4px 12px rgba(0,0,0,0.3); transform: translateY(0); }
          50% { text-shadow: 0 10px 24px rgba(253,224,71,0.35); transform: translateY(-3px); }
        }

        .lb-container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 16px;
          position: relative;
          z-index: 10;
        }
        @media (min-width: 640px) {
          .lb-container { padding: 0 24px; }
        }

        .lb-header {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;
          margin-bottom: 44px;
        }
        @media (min-width: 640px) {
          .lb-header {
            flex-direction: row;
            align-items: center;
          }
        }

        .lb-welcome-title {
          font-size: 0.95rem;
          font-weight: 700;
          color: rgba(255,255,255,0.82);
          margin-bottom: 4px;
        }
        .lb-username {
          font-size: clamp(1.75rem, 6vw, 2.75rem);
          font-weight: 900;
          margin-bottom: 12px;
          text-shadow: 0 4px 12px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 12px;
          line-height: 1.15;
          word-break: break-word;
          animation: bounceGlow 4s ease-in-out infinite;
        }

        .lb-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .lb-chip {
          background: rgba(255,255,255,0.14);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          padding: 5px 12px;
          border-radius: 999px;
          font-size: 0.8rem;
          font-weight: 800;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          border: 1px solid rgba(255,255,255,0.24);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }

        .btn-create-room {
          background: linear-gradient(135deg, #6d28d9, #4f46e5);
          color: white;
          border: 1px solid rgba(255,255,255,0.28);
          padding: 12px 22px;
          border-radius: 999px;
          font-weight: 900;
          font-size: 0.95rem;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          box-shadow: 0 5px 0 #2e1065, 0 10px 24px rgba(15,23,42,0.35);
          transition: transform 0.15s ease, filter 0.15s ease, box-shadow 0.15s ease;
          flex-shrink: 0;
        }
        .btn-create-room:hover { filter: brightness(1.1); transform: translateY(-2px); }
        .btn-create-room:active { transform: translateY(4px); box-shadow: 0 1px 0 #2e1065; }

        .lb-actions {
          display: grid;
          grid-template-columns: 1fr;
          gap: 32px;
          margin-bottom: 40px;
          width: 100%;
        }
        @media (min-width: 768px) {
          .lb-actions {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 36px;
          }
        }

        .lb-action-card {
          background: rgba(255, 255, 255, 0.14);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          border: 1.5px solid rgba(255, 255, 255, 0.28);
          border-radius: 24px;
          padding: 28px 18px 20px;
          width: 100%;
          box-shadow: 0 18px 42px rgba(15, 5, 36, 0.35);
          position: relative;
          transition: transform 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.25s, border-color 0.25s;
        }
        @media (min-width: 640px) {
          .lb-action-card { padding: 30px 24px 24px; }
        }
        .lb-action-card:hover {
          transform: translateY(-5px);
          border-color: rgba(255, 255, 255, 0.45);
          box-shadow: 0 22px 48px rgba(15, 5, 36, 0.45);
        }
        .lb-action-badge {
          position: absolute;
          top: -18px;
          left: 50%;
          transform: translateX(-50%);
          padding: 7px 18px;
          border-radius: 14px;
          color: white;
          font-weight: 900;
          font-size: 0.95rem;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 8px 20px rgba(0,0,0,0.3);
          white-space: nowrap;
          border: 1px solid rgba(255,255,255,0.25);
        }
        .lb-action-badge.pink { background: linear-gradient(135deg, #f43f5e, #e11d48); border-bottom: 3px solid #9f1239; }
        .lb-action-badge.blue { background: linear-gradient(135deg, #0ea5e9, #2563eb); border-bottom: 3px solid #1e40af; }

        .lb-input-group {
          margin-top: 8px;
          display: flex;
          align-items: stretch;
          gap: 8px;
        }
        .lb-input {
          min-width: 0;
          flex: 1;
          background: rgba(255, 255, 255, 0.94);
          border: 2px solid rgba(255, 255, 255, 0.5);
          border-radius: 14px;
          padding: 11px 14px;
          font-size: 0.95rem;
          font-weight: 800;
          color: #1e293b;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .lb-input::placeholder { color: #64748b; font-weight: 600; }
        .lb-input:focus { border-color: #fde047; box-shadow: 0 0 0 3px rgba(253, 224, 71, 0.35); }

        .btn-join {
          background: linear-gradient(135deg, #f43f5e, #e11d48);
          color: white;
          border: none;
          padding: 0 18px;
          border-radius: 14px;
          font-weight: 900;
          font-size: 0.95rem;
          cursor: pointer;
          box-shadow: 0 4px 0 #9f1239;
          transition: transform 0.12s, filter 0.15s, box-shadow 0.12s;
          flex-shrink: 0;
        }
        .btn-join:hover:not(:disabled) { filter: brightness(1.08); }
        .btn-join:active:not(:disabled) { transform: translateY(3px); box-shadow: 0 1px 0 #9f1239; }

        .lb-rooms-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          margin-bottom: 18px;
        }

        .lb-rooms-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(min(100%, 260px), 1fr));
          gap: 28px;
          padding: 12px 4px;
        }

        .lb-room-card {
          border-radius: 22px;
          position: relative;
          color: white;
          box-shadow: 0 14px 32px rgba(15, 5, 36, 0.38);
          transition: transform 0.22s ease, box-shadow 0.22s ease;
          display: flex;
          flex-direction: column;
        }
        .lb-room-card:hover { transform: translateY(-5px); box-shadow: 0 20px 42px rgba(15, 5, 36, 0.48); }

        .lb-room-header {
          padding: 46px 18px 20px;
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          flex: 1;
        }
        .lb-room-count {
          position: absolute;
          top: 12px;
          left: 12px;
          background: rgba(15, 23, 42, 0.52);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255,255,255,0.2);
          padding: 4px 10px;
          border-radius: 999px;
          font-size: 0.78rem;
          font-weight: 800;
          display: inline-flex;
          align-items: center;
          gap: 5px;
        }

        .lb-room-mode {
          position: absolute;
          top: 12px;
          right: 12px;
          padding: 4px 10px;
          border-radius: 999px;
          font-size: 0.74rem;
          font-weight: 900;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.25);
          border: 1px solid rgba(255,255,255,0.25);
        }
        .lb-room-mode.tutor {
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          color: white;
        }
        .lb-room-mode.exam {
          background: linear-gradient(135deg, #f43f5e, #e11d48);
          color: white;
        }

        .lb-room-body {
          background: rgba(255, 255, 255, 0.96);
          backdrop-filter: blur(10px);
          color: #1e293b;
          padding: 14px 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
        }

        .btn-play-circle {
          width: 42px; height: 42px;
          border-radius: 50%;
          color: white;
          display: flex; align-items: center; justify-content: center;
          border: none; cursor: pointer;
          flex-shrink: 0;
          transition: transform 0.15s ease, filter 0.15s ease;
        }
        .btn-play-circle:hover { filter: brightness(1.1); transform: scale(1.06); }
        .btn-play-circle:active { transform: translateY(3px); }

        /* Bottom XP Bar Fixed */
        .lb-xp-bar-fixed {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: rgba(20, 9, 48, 0.86);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          border-top: 1px solid rgba(255,255,255,0.18);
          box-shadow: 0 -10px 30px rgba(0,0,0,0.35);
          padding: 10px 16px;
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 100;
        }
        .lb-xp-container {
          width: 100%;
          max-width: 820px;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .lb-xp-badge {
          width: 42px; height: 42px;
          background: linear-gradient(135deg, #fde047, #f59e0b);
          color: #2e1065;
          clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
          display: flex; align-items: center; justify-content: center;
          font-weight: 900;
          font-size: 1.1rem;
          flex-shrink: 0;
          box-shadow: 0 4px 12px rgba(250, 204, 21, 0.35);
        }
        .lb-xp-track {
          flex: 1;
          height: 11px;
          background: rgba(255,255,255,0.14);
          border-radius: 999px;
          overflow: hidden;
          position: relative;
          border: 1px solid rgba(255,255,255,0.12);
        }
        .lb-xp-fill {
          height: 100%;
          background: linear-gradient(90deg, #10b981, #2dd4bf, #38bdf8);
          border-radius: 999px;
          transition: width 1s ease;
        }
        .lb-xp-text {
          font-size: 0.78rem;
          font-weight: 800;
          color: rgba(255,255,255,0.88);
        }
      `}</style>

      {/* Fixed Background */}
      <div className="lb-bg" aria-hidden="true"></div>

      {/* Decorative Shapes */}
      <div className="lb-shape lb-circle-1" aria-hidden="true"></div>
      <div className="lb-shape lb-circle-2" aria-hidden="true"></div>
      <div className="lb-shape lb-rect-1" aria-hidden="true"></div>
      <div className="lb-shape lb-rect-2" aria-hidden="true"></div>
      <div className="lb-shape lb-confetti-1" aria-hidden="true"></div>
      <div className="lb-shape lb-confetti-2" aria-hidden="true"></div>
      <div className="lb-shape lb-confetti-3" aria-hidden="true"></div>
      <div className="lb-shape lb-confetti-4" aria-hidden="true"></div>
      <div className="lb-shape lb-star-1" aria-hidden="true">
        <Star className="w-6 h-6 fill-amber-300/80 text-amber-300" />
      </div>
      <div className="lb-shape lb-star-2" aria-hidden="true">
        <Sparkles className="w-7 h-7 text-sky-300" />
      </div>

      <div className="lb-container">
        {/* Header Section */}
        <div className="lb-header">
          <div className="min-w-0">
            <div className="lb-welcome-title">Welcome back,</div>
            <div className="lb-username">
              <span className="min-w-0 break-words">{user?.display_name || user?.username || 'Player'}</span>
              <span className="inline-flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 shadow-lg shrink-0">
                <PartyPopper className="w-5 h-5 sm:w-6 sm:h-6 text-amber-300" />
              </span>
            </div>
            <div className="lb-chips">
              <div className="lb-chip">
                <Star className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                <span>Level {xpInfo.level}</span>
              </div>
              <div className="lb-chip">
                <Gem className="w-3.5 h-3.5 text-emerald-300" />
                <span>{xpInfo.currentXP.toLocaleString()} XP</span>
              </div>
              <div className="lb-chip">
                <Trophy className="w-3.5 h-3.5 text-sky-300" />
                <span>Top 12%</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            className="btn-create-room focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
            onClick={handleOpenCreateRoom}
          >
            <Plus size={18} strokeWidth={3} />
            <span>Create Room</span>
          </button>
        </div>

        {/* Action Cards */}
        <div className="lb-actions">
          {/* Join Code */}
          <form
            className="lb-action-card"
            onSubmit={(e) => {
              e.preventDefault();
              if (joinCode.trim()) handleJoinRoom(joinCode.trim());
            }}
          >
            <div className="lb-action-badge pink">
              <Ticket className="w-4 h-4" strokeWidth={2.5} />
              <span>Join with Code</span>
            </div>
            <div className="lb-input-group">
              <input
                type="text"
                className="lb-input focus-visible:ring-2 focus-visible:ring-amber-300"
                placeholder="Enter code (e.g. ABC123)"
                aria-label="กรอกรหัสห้องสอบ"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              />
              <button
                type="submit"
                className="btn-join disabled:opacity-55 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
                disabled={!joinCode.trim()}
              >
                Join
              </button>
            </div>
          </form>

          {/* Search Rooms */}
          <div className="lb-action-card">
            <div className="lb-action-badge blue">
              <Search size={16} strokeWidth={2.8} />
              <span>Search Rooms</span>
            </div>
            <div className="lb-input-group">
              <input
                type="text"
                className="lb-input focus-visible:ring-2 focus-visible:ring-amber-300"
                placeholder="Search by name, subject, or host..."
                aria-label="ค้นหาห้องสอบด้วยชื่อ วิชา หรือโฮสต์"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Mobile Section Tabs (< lg) */}
        <div className="flex lg:hidden items-center gap-2 p-1.5 mb-5 rounded-2xl bg-white/12 backdrop-blur-md border border-white/20">
          <button
            type="button"
            onClick={() => setMobileTab('rooms')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-sm font-black inline-flex items-center justify-center gap-2 transition-all cursor-pointer ${
              mobileTab === 'rooms'
                ? 'bg-white text-indigo-950 shadow-md'
                : 'text-white/85 hover:text-white'
            }`}
          >
            <Flame className="w-4 h-4 text-orange-500" />
            <span>ห้องสอบกลุ่ม ({filteredRooms.length})</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setMobileTab('chat');
              setUnreadWorldCount(0);
            }}
            className={`flex-1 py-2.5 px-3 rounded-xl text-sm font-black inline-flex items-center justify-center gap-2 transition-all cursor-pointer ${
              mobileTab === 'chat'
                ? 'bg-white text-indigo-950 shadow-md'
                : 'text-white/85 hover:text-white'
            }`}
          >
            <Globe className="w-4 h-4 text-sky-500" />
            <span>แชทเวิลด์</span>
            {unreadWorldCount > 0 && mobileTab !== 'chat' && (
              <span className="px-1.5 py-0.5 text-[11px] font-black rounded-full bg-rose-500 text-white leading-none">
                {unreadWorldCount > 99 ? '99+' : unreadWorldCount}
              </span>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_390px] gap-6 xl:gap-8 items-start">
          <div className={mobileTab === 'rooms' ? 'block' : 'hidden lg:block'}>
        {/* Popular Rooms */}
        <div className="lb-rooms-header">
          <div className="text-lg sm:text-xl font-black flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center shadow-md shrink-0">
              <Flame className="w-4 h-4" strokeWidth={2.5} />
            </span>
            <span>Popular Rooms</span>
          </div>
          <button
            type="button"
            onClick={() => { setSearchTerm(''); fetchRooms(1); }}
            className="text-sm font-bold text-white/85 hover:text-white inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 cursor-pointer"
          >
            <span>See all</span>
            <ChevronRight size={16} />
          </button>
        </div>

        <div className="lb-rooms-grid">
          {filteredRooms.map((room, i) => {
            const theme = getCardTheme(i);
            const ThemeIcon = theme.Icon;
            const bgUrl = room.theme?.background_url
              || (room.theme?.background_id ? getAssetUrl(room.theme.background_id, 'background') : null)
              || customAssets.find(a => a.id === room.theme?.background_id)?.url
              || null;
            const frameUrl = room.theme?.frame_url
              || (room.theme?.frame_id ? getAssetUrl(room.theme.frame_id, 'frame') : null)
              || customAssets.find(a => a.id === room.theme?.frame_id)?.url
              || null;

            return (
              <div key={room.id} className="lb-room-card relative" style={{ borderRadius: '22px' }}>
                {/* Frame behind the card */}
                {frameUrl && (
                  <div
                    className="absolute z-0 pointer-events-none"
                    style={{
                      top: '-10px',
                      left: '-10px',
                      width: 'calc(100% + 20px)',
                      height: 'calc(100% + 20px)',
                      borderRadius: '30px',
                      overflow: 'hidden'
                    }}
                  >
                    {frameUrl.endsWith('.json') ? (
                      <LottieViewer
                        url={frameUrl}
                        className="w-full h-full"
                        preserveAspectRatio="none"
                        style={{ filter: 'drop-shadow(0 0 5px rgba(255,255,255,0.3))' }}
                      />
                    ) : (
                      <div
                        className="w-full h-full"
                        style={{
                          border: '10px solid transparent',
                          borderImage: `url(${frameUrl}) 30% stretch`
                        }}
                      />
                    )}
                  </div>
                )}

                {/* Solid/Glass Base Layer */}
                <div
                  className="absolute inset-0 z-10 pointer-events-none border border-white/25"
                  style={{
                    background: bgUrl ? '#1a1a2e' : theme.bg,
                    borderRadius: '22px',
                    boxShadow: frameUrl ? '0 0 0 2px rgba(0,0,0,0.5)' : 'none'
                  }}
                />

                {/* Background image overlay */}
                <div className="absolute inset-0 z-10 pointer-events-none" style={{ borderRadius: '22px', overflow: 'hidden' }}>
                  {bgUrl && (
                    bgUrl.endsWith('.json') ? (
                      <LottieViewer url={bgUrl} className="w-full h-full object-cover opacity-60" />
                    ) : (
                      <img src={bgUrl} alt="room bg" className="w-full h-full object-cover opacity-60" />
                    )
                  )}
                </div>

                <div
                  className="lb-room-header relative z-20"
                  style={{
                    background: bgUrl ? 'transparent' : theme.header,
                    borderTopLeftRadius: '22px',
                    borderTopRightRadius: '22px'
                  }}
                >
                  <div className="lb-room-count relative z-30">
                    <Users size={13} strokeWidth={2.8} />
                    <span>{room.participant_count}</span>
                  </div>
                  <div className={`lb-room-mode ${room.mode === 'tutor' ? 'tutor' : 'exam'} relative z-30`}>
                    {room.mode === 'tutor' ? (
                      <>
                        <GraduationCap className="w-3.5 h-3.5" strokeWidth={2.5} />
                        <span>ติวเตอร์</span>
                      </>
                    ) : (
                      <>
                        <Gamepad2 className="w-3.5 h-3.5" strokeWidth={2.5} />
                        <span>แข่งขัน</span>
                      </>
                    )}
                  </div>

                  <div className="relative z-30 w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 flex items-center justify-center mb-3 shadow-lg">
                    <ThemeIcon className="w-7 h-7 text-white drop-shadow-sm" strokeWidth={2.2} />
                  </div>

                  <h3
                    className="relative z-30 text-base sm:text-lg font-black leading-snug break-words max-w-full"
                    style={{
                      display: 'inline-block',
                      textShadow: bgUrl ? '0 2px 4px rgba(0,0,0,0.85)' : '0 2px 4px rgba(0,0,0,0.2)',
                      background: bgUrl ? 'rgba(15, 23, 42, 0.58)' : 'none',
                      padding: bgUrl ? '4px 14px' : '0',
                      borderRadius: '12px',
                      backdropFilter: bgUrl ? 'blur(6px)' : 'none'
                    }}
                  >
                    {room.name}
                  </h3>
                </div>

                <div
                  className="lb-room-body relative z-20"
                  style={{ borderBottomLeftRadius: '22px', borderBottomRightRadius: '22px' }}
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-extrabold text-slate-800 truncate">{room.subject || 'ทั่วไป'}</div>
                    <div className="text-xs text-slate-600 font-bold mt-0.5 truncate">
                      By {room.host_name || room.Host?.display_name || 'Unknown'}
                    </div>
                    {room.password && (
                      <div className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full mt-1">
                        <Lock size={11} />
                        <span>มีรหัสผ่าน</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {String(room.status || 'waiting') === 'waiting' && (
                      <button
                        type="button"
                        onClick={() => handleShareRoomToWorld(room)}
                        title="แชร์ห้องนี้ไปแชทเวิลด์"
                        aria-label={`แชร์ห้อง ${room.name} ไปแชทเวิลด์`}
                        className="w-9 h-9 rounded-full bg-slate-100 hover:bg-indigo-100 text-indigo-700 border border-slate-200 flex items-center justify-center transition-all shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                      >
                        <Share2 size={15} strokeWidth={2.5} />
                      </button>
                    )}
                    <button
                      type="button"
                      className="btn-play-circle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                      onClick={() => handleJoinRoom(room.code)}
                      aria-label={`เข้าร่วมห้อง ${room.name}`}
                      style={{ background: theme.header, boxShadow: `0 4px 0 ${theme.bg}` }}
                    >
                      <Play size={18} strokeWidth={3} fill="currentColor" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {filteredRooms.length === 0 && !loading && (
            <div className="col-span-full text-center py-12 px-5 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 shadow-xl">
              <div className="w-20 h-20 rounded-3xl bg-white/15 border border-white/25 flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Ghost className="w-10 h-10 text-amber-200 animate-bounce" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black mb-2 text-white">Oh no! It&apos;s so quiet here.</h3>
              <p className="text-white/80 font-bold text-sm sm:text-base mb-6 max-w-md mx-auto">
                No rooms found matching your search. Be the first to start the fun!
              </p>
              <button
                type="button"
                className="btn-create-room mx-auto text-base px-7 py-3.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
                onClick={handleOpenCreateRoom}
              >
                <Rocket size={20} strokeWidth={2.5} />
                <span>Create a Room Now</span>
              </button>
            </div>
          )}
        </div>
          </div>

          <div className={`${mobileTab === 'chat' ? 'block' : 'hidden lg:block'} lg:sticky lg:top-6`}>
            <LobbyWorldChat
              user={user}
              xpLevel={xpInfo.level}
              rooms={rooms}
              onJoinRoom={(code) => handleJoinRoom(code)}
              invitedRoom={invitedRoom}
              onClearInvitedRoom={() => setInvitedRoom(null)}
              isHiddenOnMobile={mobileTab !== 'chat'}
              onNewIncomingMessage={() => setUnreadWorldCount((c) => c + 1)}
            />
          </div>
        </div>
      </div>

      {/* Bottom XP Bar */}
      <div className="lb-xp-bar-fixed">
        <div className="lb-xp-container">
          <div className="lb-xp-badge" aria-label={`Level ${xpInfo.level}`}>
            {xpInfo.level}
          </div>
          <div className="flex flex-col flex-1 min-w-0 gap-1">
            <div className="flex justify-between items-center gap-2">
              <span className="lb-xp-text truncate">XP to next level</span>
              <span className="lb-xp-text shrink-0">
                {xpInfo.currentXP.toLocaleString()} / {xpInfo.nextLevelXP.toLocaleString()} XP
              </span>
            </div>
            <div className="lb-xp-track">
              <div className="lb-xp-fill" style={{ width: `${xpInfo.percentage}%` }}></div>
            </div>
          </div>
          <div
            className="w-10 h-10 bg-white/12 border border-white/20 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
            aria-label="Level rewards"
            title="ของรางวัลระดับเลเวล"
          >
            <Gift className="w-5 h-5 text-amber-300" />
          </div>
        </div>
      </div>

      {/* Modals */}
      <CreateRoomModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreateRoom}
      />

      {showPasswordModal && (
        <div
          className="fixed inset-0 bg-slate-950/75 flex items-center justify-center z-[250] p-4 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-labelledby="password-modal-title"
        >
          <div className="bg-white/95 backdrop-blur-xl border border-white/60 rounded-3xl shadow-2xl w-full max-w-sm p-6 text-slate-800 relative">
            <button
              type="button"
              onClick={() => { setShowPasswordModal(false); setPasswordInput(''); setPendingRoomCode(null); }}
              aria-label="ปิดหน้าต่างกรอกรหัสผ่าน"
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-3 mb-4 pr-8">
              <div className="w-11 h-11 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h2 id="password-modal-title" className="text-lg font-black text-slate-900 leading-tight">
                  Enter Room Password
                </h2>
                <p className="text-xs font-semibold text-slate-600">กรอกรหัสผ่านเพื่อเข้าสู่ห้อง</p>
              </div>
            </div>
            <form onSubmit={handleSubmitPassword}>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                aria-label="รหัสผ่านห้อง"
                className="w-full bg-slate-100 border-2 border-slate-200 rounded-xl px-4 py-3 text-base font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus-visible:ring-2 focus-visible:ring-indigo-400 mb-5"
                placeholder="Password"
                autoFocus
              />
              <div className="flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => { setShowPasswordModal(false); setPasswordInput(''); setPendingRoomCode(null); }}
                  className="px-4 py-2.5 text-slate-700 font-bold hover:bg-slate-100 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-join px-5 py-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
                >
                  Join Room
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
