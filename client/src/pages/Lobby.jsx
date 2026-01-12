import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import roomService from '../services/roomService';
import authService from '../services/authService';
import { Plus, Users, Play, Search, Lock } from 'lucide-react';
import ShinyText from '../components/ui/ShinyText';
import StarBorder from '../components/ui/StarBorder';


import api from '../services/api';
import CreateRoomModal from '../components/room/CreateRoomModal';

const Lobby = () => {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [joinCode, setJoinCode] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        mode: 'exam',
        subject: 'thai',
        max_participants: 20,
        question_count: 20,
        time_limit: 60,
        theme: { background_id: null, frame_id: null }
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [assets, setAssets] = useState({ backgrounds: [], frames: [] });

    // Password Modal State
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordInput, setPasswordInput] = useState('');
    const [pendingRoomCode, setPendingRoomCode] = useState(null);

    const navigate = useNavigate();

    const [subjects, setSubjects] = useState([]);
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        fetchRooms(1);
        fetchOptions();
        fetchAssets();
    }, []);

    const fetchAssets = async () => {
        try {
            const response = await api.get('/assets');
            const data = response.data;
            if (data.success) {
                const bgs = data.data.filter(a => a.type === 'background');
                const frms = data.data.filter(a => a.type === 'frame');
                setAssets({ backgrounds: bgs, frames: frms });
            }
        } catch (error) {
            console.error('Error fetching assets:', error);
        }
    };

    const fetchOptions = async () => {
        try {
            const [subjRes, catRes] = await Promise.all([
                api.get('/questions/subjects').then(r => r.data),
                api.get('/questions/categories').then(r => r.data)
            ]);

            if (subjRes.success) setSubjects(subjRes.data);
            if (catRes.success) setCategories(catRes.data);
        } catch (error) {
            console.error('Error fetching options:', error);
        }
    };

    const fetchRooms = async (page = 1) => {
        setLoading(true);
        try {
            const data = await roomService.getRooms(page, 20); // Limit 20
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
            alert('Failed to create room');
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

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Exam Lobby</h1>
                <button
                    onClick={() => {
                        if (authService.getCurrentUser()?.email?.startsWith('guest_')) {
                            alert('Guests cannot create rooms. Please register to create a room.');
                            return;
                        }
                        setShowCreateModal(true);
                    }}
                    className="bg-primary text-white px-6 py-2 rounded-lg flex items-center hover:bg-blue-700 transition-colors shadow-md"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Create Room
                </button>
            </div>

            {/* Action Bar: Join & Search */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Join by Code */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Join with Code</h2>
                    <div className="flex space-x-3">
                        <input
                            type="text"
                            placeholder="Enter Code (e.g. ABC123)"
                            value={joinCode}
                            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:outline-none"
                        />
                        <button
                            onClick={() => handleJoinRoom(joinCode)}
                            disabled={!joinCode}
                            className="bg-gray-800 text-white px-6 py-2 rounded-lg hover:bg-gray-900 disabled:opacity-50"
                        >
                            Join
                        </button>
                    </div>
                </div>

                {/* Search Rooms */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Search Rooms</h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search by name, subject, or host..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-primary focus:outline-none"
                        />
                    </div>
                </div>
            </div>

            {/* Room List */}
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {rooms.filter(room =>
                    room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    room.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    room.Host?.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    room.code.toLowerCase().includes(searchTerm.toLowerCase())
                ).map((room) => {
                    const isPremium = room.Host?.plan_type === 'premium';

                    // Helper to resolve asset URL (handles relative paths)
                    const getFullUrl = (url) => {
                        if (!url) return '';
                        // Strip localhost:3000 to force relative path resolution (fixes mobile view for legacy assets)
                        const relativeUrl = url.replace(/^http:\/\/localhost:3000/, '');
                        if (relativeUrl.startsWith('http')) return relativeUrl; // External URLs
                        // Construct full URL dynamically
                        return `${window.location.origin}${relativeUrl.startsWith('/') ? '' : '/'}${relativeUrl}`;
                    };

                    // Resolve Theme Assets
                    let roomStyle = {};
                    let frameStyle = {};

                    let themeData = room.theme;
                    if (typeof themeData === 'string') {
                        try {
                            themeData = JSON.parse(themeData);
                        } catch (e) {
                            console.error('Error parsing theme JSON:', e);
                            themeData = null;
                        }
                    }

                    if (themeData && assets.backgrounds.length > 0) {
                        const bg = assets.backgrounds.find(a => a.id == themeData.background_id); // Loose comparison for string/int IDs
                        if (bg) {
                            roomStyle = {
                                backgroundImage: `url(${getFullUrl(bg.url)})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                // color: 'white' // Optional: if BG is dark
                            };
                        }
                    }
                    if (themeData && assets.frames.length > 0) {
                        const frm = assets.frames.find(a => a.id == themeData.frame_id); // Loose comparison
                        if (frm) {
                            frameStyle = {
                                borderImage: `url(${getFullUrl(frm.url)}) 30 round`,
                                borderWidth: '8px',
                                borderStyle: 'solid',
                                borderColor: 'transparent'
                            };
                        }
                    }

                    const RoomCard = (
                        <div key={room.id} style={{ ...roomStyle, ...frameStyle }} className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-4 ${isPremium && !room.theme ? 'h-full bg-gradient-to-r from-violet-50 to-fuchsia-50 border-violet-200' : ''}`}>
                            {/* Added wrapper for content readability if BG exists */}
                            <div className={`flex-1 ${roomStyle.backgroundImage ? 'bg-white/50 p-3 rounded backdrop-blur-sm' : ''}`}>
                                <div className="flex items-center space-x-3 mb-1">
                                    <h3 className="text-lg font-bold text-gray-900">
                                        {isPremium ? (
                                            <ShinyText text={room.name} disabled={false} speed={3} className="font-bold" />
                                        ) : (
                                            room.name
                                        )}
                                    </h3>
                                    <span className={`inline-block px-2 py-0.5 text-xs rounded-full font-medium ${room.status === 'finished' ? 'bg-gray-100 text-gray-800' :
                                        room.mode === 'exam' ? 'bg-red-100 text-red-800' :
                                            room.mode === 'tutor' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                                        }`}>
                                        {room.status === 'finished' ? 'CLOSED' : room.mode.toUpperCase()}
                                    </span>
                                    <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                                        {room.code}
                                    </span>
                                    {room.password && <Lock className="w-3 h-3 text-gray-400" />}
                                </div>
                                <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm text-gray-600">
                                    <div className="flex items-center">
                                        <span className="font-medium mr-1">Subject:</span>
                                        {room.subject}
                                    </div>
                                    <div className="flex items-center">
                                        <span className="font-medium mr-1">Host:</span>
                                        {room.Host?.display_name || 'Unknown'}
                                    </div>
                                </div>
                            </div>

                            <div className={`flex items-center justify-between md:justify-end gap-6 ${roomStyle.backgroundImage ? 'bg-white/50 p-3 rounded backdrop-blur-sm' : ''}`}>
                                <div className="flex items-center text-gray-600 text-sm">
                                    <Users className="w-4 h-4 mr-2" />
                                    {room.participant_count} / {room.max_participants}
                                </div>

                                <button
                                    onClick={() => handleJoinRoom(room.code)}
                                    className={`px-6 py-2 rounded-lg transition-colors flex items-center whitespace-nowrap ${room.status === 'finished'
                                        ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        : 'bg-primary text-white hover:bg-blue-700'
                                        }`}
                                >
                                    {room.status === 'finished' ? (
                                        <>
                                            <Search className="w-4 h-4 mr-2" />
                                            View Results
                                        </>
                                    ) : (
                                        <>
                                            <Play className="w-4 h-4 mr-2" />
                                            Join Now
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    );

                    // Only use StarBorder if NO custom theme is applied, to avoid clutter
                    return isPremium && !room.theme ? (
                        <div key={room.id} className="mb-4">
                            <StarBorder as="div" color="#8b5cf6" speed="4s" thickness={0.2}>
                                {RoomCard}
                            </StarBorder>
                        </div>
                    ) : (
                        <div key={room.id} className="mb-4">
                            {RoomCard}
                        </div>
                    );
                })}
            </div>

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
                <div className="flex justify-center items-center space-x-4 mt-6">
                    <button
                        onClick={() => fetchRooms(pagination.page - 1)}
                        disabled={pagination.page === 1}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-300"
                    >
                        Previous
                    </button>
                    <span className="text-gray-600">
                        Page {pagination.page} of {pagination.totalPages}
                    </span>
                    <button
                        onClick={() => fetchRooms(pagination.page + 1)}
                        disabled={pagination.page === pagination.totalPages}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-300"
                    >
                        Next
                    </button>
                </div>
            )}

            {/* Create Room Modal */}
            <CreateRoomModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onCreate={handleCreateRoom}
            />

            {/* Password Modal */}
            {showPasswordModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-6">
                        <h2 className="text-xl font-bold mb-4">Enter Room Password</h2>
                        <form onSubmit={handleSubmitPassword}>
                            <input
                                type="password"
                                value={passwordInput}
                                onChange={(e) => setPasswordInput(e.target.value)}
                                className="w-full border border-gray-300 rounded-md p-2 mb-4"
                                placeholder="Password"
                                autoFocus
                            />
                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowPasswordModal(false);
                                        setPasswordInput('');
                                        setPendingRoomCode(null);
                                    }}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-700"
                                >
                                    Join
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Lobby;
