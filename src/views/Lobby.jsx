import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import roomService from '../services/roomService';
import authService from '../services/authService';
import userService from '../services/userService';
import api from '../services/api';
import { getAssetUrl } from '../utils/assets';
import LottieViewer from '../components/room/LottieViewer';
import { Search, Play, Users, Lock, ChevronRight, Plus } from 'lucide-react';
import CreateRoomModal from '../components/room/CreateRoomModal';

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

  const getCardTheme = (index) => {
    const themes = [
      { bg: '#2d0d6b', header: '#46178f', icon: '🪐' }, // Purple
      { bg: '#e67300', header: '#ff8c00', icon: '🏆' }, // Orange
      { bg: '#1c7a1c', header: '#26890c', icon: '🏰' }, // Green
      { bg: '#0e55a3', header: '#1368ce', icon: '⚽' }, // Blue
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
          padding-top: 80px;
          padding-bottom: 80px;
          font-family: 'Nunito', 'Sarabun', sans-serif;
          position: relative;
          overflow: hidden;
          color: white;
        }
        /* Fixed background to cover entire screen */
        .lb-bg {
          position: fixed; inset: 0; z-index: 0;
          background: radial-gradient(circle at 50% 50%, #581cba 0%, #371172 100%);
          pointer-events: none;
        }
        /* Floating shapes */
        .lb-shape { position: fixed; pointer-events: none; z-index: 0; }
        .lb-circle-1 { width: 40px; height: 40px; background: #e21b3c; border-radius: 50%; top: 15%; left: 15%; opacity: 0.8; filter: blur(2px); animation: float 6s ease-in-out infinite; }
        .lb-circle-2 { width: 25px; height: 25px; background: #00c985; border-radius: 50%; bottom: 25%; left: 5%; opacity: 0.6; filter: blur(1px); animation: float 8s ease-in-out infinite reverse; }
        .lb-rect-1 { width: 30px; height: 30px; background: #ffcc00; top: 10%; right: 20%; transform: rotate(45deg); opacity: 0.9; animation: floatSpin 8s linear infinite alternate; }
        .lb-rect-2 { width: 20px; height: 20px; background: #e21b3c; bottom: 20%; right: 10%; transform: rotate(15deg); opacity: 0.7; animation: floatSpin 10s linear infinite; }
        .lb-confetti-1 { width: 15px; height: 35px; background: #00c985; top: 30%; right: 15%; transform: rotate(-20deg); opacity: 0.7; animation: float 5s ease-in-out infinite; }
        .lb-confetti-2 { width: 12px; height: 12px; background: #1368ce; top: 25%; left: 45%; opacity: 0.8; animation: float 7s ease-in-out infinite; }
        .lb-confetti-3 { width: 18px; height: 8px; background: #ff8c00; top: 50%; left: 8%; transform: rotate(30deg); opacity: 0.9; animation: float 6s ease-in-out infinite reverse; }
        .lb-confetti-4 { width: 10px; height: 20px; background: #ffcc00; bottom: 40%; right: 25%; transform: rotate(70deg); opacity: 0.8; animation: float 5.5s ease-in-out infinite; }
        .lb-star-1 { color: #ffcc00; font-size: 24px; top: 15%; left: 75%; opacity: 0.9; animation: floatPulse 4s ease-in-out infinite; }
        .lb-star-2 { color: #1368ce; font-size: 30px; bottom: 15%; left: 25%; opacity: 0.7; animation: floatPulse 5s ease-in-out infinite 1s; }

        @keyframes float {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-25px) rotate(15deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
        @keyframes floatSpin {
          0% { transform: translateY(0px) rotate(0deg); }
          100% { transform: translateY(-30px) rotate(360deg); }
        }
        @keyframes floatPulse {
          0% { transform: scale(1) translateY(0); }
          50% { transform: scale(1.2) translateY(-10px); }
          100% { transform: scale(1) translateY(0); }
        }
        @keyframes bounceGlow {
          0%, 100% { text-shadow: 0 4px 10px rgba(0,0,0,0.3); transform: translateY(0); }
          50% { text-shadow: 0 10px 20px rgba(255,204,0,0.4); transform: translateY(-5px); }
        }

        .lb-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
          position: relative;
          z-index: 10;
        }

        .lb-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 40px;
        }

        .lb-welcome-title {
          font-size: 1.1rem;
          color: rgba(255,255,255,0.7);
          margin-bottom: 4px;
        }
        .lb-username {
          font-size: 2.8rem;
          font-weight: 900;
          margin-bottom: 12px;
          text-shadow: 0 4px 10px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          gap: 12px;
          animation: bounceGlow 4s ease-in-out infinite;
        }
        
        .lb-chips {
          display: flex;
          gap: 10px;
        }
        .lb-chip {
          background: rgba(255,255,255,0.15);
          backdrop-filter: blur(5px);
          padding: 4px 12px;
          border-radius: 999px;
          font-size: 0.8rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 6px;
          border: 1px solid rgba(255,255,255,0.2);
        }

        .btn-create-room {
          background: #46178f;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 999px;
          font-weight: 800;
          font-size: 1rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 4px 0 #2d0d6b;
          transition: all 0.1s;
        }
        .btn-create-room:active { transform: translateY(4px); box-shadow: 0 0 0 #2d0d6b; }

        .lb-actions {
          display: flex;
          gap: 40px;
          justify-content: center;
          margin-bottom: 60px;
          flex-wrap: wrap;
        }

        .lb-action-card {
          background: #fff;
          border-radius: 24px;
          padding: 24px;
          width: 100%;
          max-width: 450px;
          box-shadow: 0 12px 30px rgba(0,0,0,0.3);
          position: relative;
          transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.3s;
        }
        .lb-action-card:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 20px 40px rgba(0,0,0,0.4);
        }
        .lb-action-badge {
          position: absolute;
          top: -20px;
          left: 50%;
          transform: translateX(-50%);
          padding: 8px 24px;
          border-radius: 12px;
          color: white;
          font-weight: 900;
          font-size: 1.1rem;
          display: flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 6px 15px rgba(0,0,0,0.3);
          white-space: nowrap;
        }
        .lb-action-badge.pink { background: #e21b3c; border-bottom: 4px solid #b3142e; }
        .lb-action-badge.blue { background: #1368ce; border-bottom: 4px solid #0e55a3; }
        
        .lb-input-group {
          margin-top: 16px;
          display: flex;
          gap: 12px;
        }
        .lb-input {
          flex: 1;
          background: rgba(0,0,0,0.05);
          border: 2px solid rgba(0,0,0,0.1);
          border-radius: 12px;
          padding: 14px 16px;
          font-size: 1rem;
          font-weight: 700;
          color: #333;
          outline: none;
          transition: border-color 0.2s;
        }
        .lb-input:focus { border-color: #46178f; }
        
        .btn-join {
          background: #e21b3c;
          color: white;
          border: none;
          padding: 0 24px;
          border-radius: 12px;
          font-weight: 900;
          cursor: pointer;
          box-shadow: 0 4px 0 #b3142e;
          transition: all 0.1s;
        }
        .btn-join:active { transform: translateY(4px); box-shadow: 0 0 0 #b3142e; }

        .lb-rooms-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        
        .lb-rooms-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 20px;
        }

        .lb-room-card {
          border-radius: 20px;
          position: relative;
          color: white;
          box-shadow: 0 8px 20px rgba(0,0,0,0.3);
          transition: transform 0.2s;
          display: flex;
          flex-direction: column;
        }
        .lb-room-card:hover { transform: translateY(-5px); }
        
        .lb-room-header {
          padding: 40px 20px 20px;
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          flex: 1;
        }
        .lb-room-icon {
          font-size: 3rem;
          margin-bottom: 10px;
          filter: drop-shadow(0 4px 8px rgba(0,0,0,0.4));
        }
        .lb-room-count {
          position: absolute;
          top: 12px;
          left: 12px;
          background: rgba(0,0,0,0.3);
          padding: 4px 10px;
          border-radius: 999px;
          font-size: 0.8rem;
          font-weight: 800;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .lb-room-mode {
          position: absolute;
          top: 12px;
          right: 12px;
          padding: 4px 10px;
          border-radius: 999px;
          font-size: 0.75rem;
          font-weight: 900;
          display: flex;
          align-items: center;
          gap: 4px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          text-shadow: none;
        }
        .lb-room-mode.tutor {
          background: #1368ce;
          color: white;
        }
        .lb-room-mode.exam {
          background: #e21b3c;
          color: white;
        }


        .lb-room-body {
          background: white;
          color: #333;
          padding: 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .btn-play-circle {
          width: 40px; height: 40px;
          border-radius: 50%;
          background: #46178f;
          color: white;
          display: flex; align-items: center; justify-content: center;
          border: none; cursor: pointer;
          box-shadow: 0 4px 0 #2d0d6b;
        }
        .btn-play-circle:active { transform: translateY(4px); box-shadow: 0 0 0 #2d0d6b; }

        /* Bottom XP Bar Fixed */
        .lb-xp-bar-fixed {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: rgba(55, 17, 114, 0.95);
          backdrop-filter: blur(10px);
          border-top: 1px solid rgba(255,255,255,0.1);
          padding: 12px 20px;
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 100;
        }
        .lb-xp-container {
          width: 100%;
          max-width: 800px;
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .lb-xp-badge {
          width: 46px; height: 46px;
          background: #ffcc00;
          color: #2d0d6b;
          clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
          display: flex; align-items: center; justify-content: center;
          font-weight: 900;
          font-size: 1.2rem;
        }
        .lb-xp-track {
          flex: 1;
          height: 12px;
          background: rgba(255,255,255,0.1);
          border-radius: 999px;
          overflow: hidden;
          position: relative;
        }
        .lb-xp-fill {
          height: 100%;
          background: #00c985;
          border-radius: 999px;
          transition: width 1s;
        }
        .lb-xp-text {
          font-size: 0.8rem;
          font-weight: 800;
          color: rgba(255,255,255,0.7);
        }
      `}</style>

      {/* Fixed Background */}
      <div className="lb-bg"></div>

      {/* Decorative Shapes */}
      <div className="lb-shape lb-circle-1"></div>
      <div className="lb-shape lb-circle-2"></div>
      <div className="lb-shape lb-rect-1"></div>
      <div className="lb-shape lb-rect-2"></div>
      <div className="lb-shape lb-confetti-1"></div>
      <div className="lb-shape lb-confetti-2"></div>
      <div className="lb-shape lb-confetti-3"></div>
      <div className="lb-shape lb-confetti-4"></div>
      <div className="lb-shape lb-star-1">⭐</div>
      <div className="lb-shape lb-star-2">✨</div>

      <div className="lb-container">
        
        {/* Header Section */}
        <div className="lb-header">
          <div>
            <div className="lb-welcome-title">Welcome back,</div>
            <div className="lb-username">
              {user?.display_name || user?.username || 'Player'} 
              <span style={{ fontSize: '1.8rem' }}>🎉</span>
            </div>
            <div className="lb-chips">
              <div className="lb-chip"><span style={{ color: '#ffcc00' }}>⭐</span> Level {xpInfo.level}</div>
              <div className="lb-chip"><span style={{ color: '#00c985' }}>💎</span> {xpInfo.currentXP.toLocaleString()} XP</div>
              <div className="lb-chip"><span style={{ color: '#1368ce' }}>🏆</span> Top 12%</div>
            </div>
          </div>
          
          <button 
            className="btn-create-room"
            onClick={() => {
              if (user?.email?.startsWith('guest_')) {
                alert('Guests cannot create rooms. Please register to create a room.');
                return;
              }
              setShowCreateModal(true);
            }}
          >
            <Plus size={20} strokeWidth={3}/> Create Room
          </button>
        </div>

        {/* Action Cards */}
        <div className="lb-actions">
          {/* Join Code */}
          <div className="lb-action-card">
            <div className="lb-action-badge pink">
              Join with Code 🎟️
            </div>
            <div className="lb-input-group">
              <input 
                type="text" 
                className="lb-input" 
                placeholder="Enter code (e.g. ABC123)"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              />
              <button 
                className="btn-join"
                onClick={() => handleJoinRoom(joinCode)}
                disabled={!joinCode}
                style={{ opacity: joinCode ? 1 : 0.6 }}
              >
                Join
              </button>
            </div>
          </div>

          {/* Search Rooms */}
          <div className="lb-action-card">
            <div className="lb-action-badge blue">
              <Search size={18} strokeWidth={3}/> Search Rooms
            </div>
            <div className="lb-input-group">
              <input 
                type="text" 
                className="lb-input" 
                placeholder="Search by name, subject, or host..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Popular Rooms */}
        <div className="lb-rooms-header">
          <div style={{ fontSize: '1.2rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '8px' }}>
            🔥 Popular Rooms
          </div>
          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'rgba(255,255,255,0.7)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            See all <ChevronRight size={16}/>
          </div>
        </div>

        <div className="lb-rooms-grid">
          {filteredRooms.map((room, i) => {
            const theme = getCardTheme(i);
            const bgUrl = room.theme?.background_url 
              || (room.theme?.background_id ? getAssetUrl(room.theme.background_id, 'background') : null)
              || customAssets.find(a => a.id === room.theme?.background_id)?.url
              || null;
            const frameUrl = room.theme?.frame_url 
              || (room.theme?.frame_id ? getAssetUrl(room.theme.frame_id, 'frame') : null)
              || customAssets.find(a => a.id === room.theme?.frame_id)?.url
              || null;
            
            return (
              <div key={room.id} className="lb-room-card relative" style={{ borderRadius: '20px' }}>
                {/* Frame behind the card, scaled up to overflow */}
                {frameUrl && (
                  <div className="absolute z-0 pointer-events-none" style={{ top: '-15px', left: '-15px', width: 'calc(100% + 30px)', height: 'calc(100% + 30px)', borderRadius: '35px', overflow: 'hidden' }}>
                    {frameUrl.endsWith('.json') ? (
                      <LottieViewer 
                        url={frameUrl} 
                        className="w-full h-full" 
                        preserveAspectRatio="none" 
                        style={{ filter: 'drop-shadow(0 0 5px rgba(255,255,255,0.3))' }}
                      />
                    ) : (
                      <div className="w-full h-full" style={{
                        border: '10px solid transparent',
                        borderImage: `url(${frameUrl}) 30% stretch`
                      }} />
                    )}
                  </div>
                )}

                {/* Solid Background to hide the inner part of the frame */}
                <div className="absolute inset-0 z-10 pointer-events-none" style={{ background: bgUrl ? '#1a1a2e' : theme.bg, borderRadius: '20px', boxShadow: frameUrl ? '0 0 0 2px rgba(0,0,0,0.5)' : 'none' }}></div>

                {/* Background image overlay */}
                <div className="absolute inset-0 z-10 pointer-events-none" style={{ borderRadius: '20px', overflow: 'hidden' }}>
                  {bgUrl && (
                    bgUrl.endsWith('.json') ? (
                        <LottieViewer url={bgUrl} className="w-full h-full object-cover opacity-60" />
                    ) : (
                        <img src={bgUrl} alt="room bg" className="w-full h-full object-cover opacity-60" />
                    )
                  )}
                </div>

                <div className="lb-room-header relative z-20" style={{ background: bgUrl ? 'rgba(0,0,0,0.5)' : theme.header, backdropFilter: bgUrl ? 'blur(4px)' : 'none', borderTopLeftRadius: '20px', borderTopRightRadius: '20px' }}>
                  <div className="lb-room-count relative z-30">
                    <Users size={14} strokeWidth={3}/> {room.participant_count}
                  </div>
                  <div className={`lb-room-mode ${room.mode === 'tutor' ? 'tutor' : 'exam'} relative z-30`}>
                    {room.mode === 'tutor' ? '🎓 ติวเตอร์' : '🎮 แข่งขัน'}
                  </div>
                  <div className="lb-room-icon relative z-30">{theme.icon}</div>
                  <h3 className="relative z-30" style={{ fontSize: '1.1rem', fontWeight: 900, marginBottom: '4px', textShadow: bgUrl ? '0 2px 4px rgba(0,0,0,0.8)' : 'none' }}>{room.name}</h3>
                </div>
                
                <div className="lb-room-body relative z-20" style={{ borderBottomLeftRadius: '20px', borderBottomRightRadius: '20px' }}>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 800, textShadow: bgUrl ? '0 1px 3px rgba(0,0,0,0.8)' : 'none' }}>{room.subject}</div>
                    <div style={{ fontSize: '0.75rem', color: bgUrl ? '#ccc' : '#666', fontWeight: 700, marginTop: '2px', position: 'relative', zIndex: 10 }}>
                      By {room.host_name || room.Host?.display_name || 'Unknown'}
                    </div>
                    {room.password && <Lock size={12} className="text-gray-400 mt-1" />}
                  </div>
                  
                  <button 
                    className="btn-play-circle" 
                    onClick={() => handleJoinRoom(room.code)}
                    style={{ background: theme.header, boxShadow: `0 4px 0 ${theme.bg}` }}
                  >
                    <Play size={18} strokeWidth={3} fill="currentColor"/>
                  </button>
                </div>
              </div>
            );
          })}
          
          {filteredRooms.length === 0 && !loading && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 20px', background: 'rgba(255,255,255,0.05)', borderRadius: '24px', border: '2px dashed rgba(255,255,255,0.2)' }}>
              <div style={{ fontSize: '4rem', marginBottom: '16px', animation: 'float 3s ease-in-out infinite' }}>🙈</div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '8px', color: 'white' }}>Oh no! It's so quiet here.</h3>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 700, marginBottom: '20px' }}>No rooms found matching your search. Be the first to start the fun!</p>
              <button 
                className="btn-create-room"
                style={{ margin: '0 auto', fontSize: '1.1rem', padding: '14px 32px' }}
                onClick={() => {
                  if (user?.email?.startsWith('guest_')) {
                    alert('Guests cannot create rooms. Please register to create a room.');
                    return;
                  }
                  setShowCreateModal(true);
                }}
              >
                <Plus size={24} strokeWidth={3}/> Create a Room Now 🚀
              </button>
            </div>
          )}
        </div>

      </div>

      {/* Bottom XP Bar */}
      <div className="lb-xp-bar-fixed">
        <div className="lb-xp-container">
          <div className="lb-xp-badge">{xpInfo.level}</div>
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span className="lb-xp-text">XP to next level</span>
              <span className="lb-xp-text">{xpInfo.currentXP.toLocaleString()} / {xpInfo.nextLevelXP.toLocaleString()} XP</span>
            </div>
            <div className="lb-xp-track">
              <div className="lb-xp-fill" style={{ width: `${xpInfo.percentage}%` }}></div>
            </div>
          </div>
          <div style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
            🎁
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
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-sm p-6" style={{ color: '#333' }}>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Lock size={20}/> Enter Room Password</h2>
            <form onSubmit={handleSubmitPassword}>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="lb-input w-full mb-4"
                placeholder="Password"
                autoFocus
              />
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => { setShowPasswordModal(false); setPasswordInput(''); setPendingRoomCode(null); }}
                  className="px-4 py-2 text-gray-600 font-bold hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-join"
                  style={{ padding: '10px 24px' }}
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
