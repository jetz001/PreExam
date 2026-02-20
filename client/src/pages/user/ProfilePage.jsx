import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import userService from '../../services/userService';
import UserInfoCard from '../../components/profile/UserInfoCard';
import AnalyticsDashboard from '../../components/profile/AnalyticsDashboard';
import { BookMarked, History, MessageSquare, Users, Settings } from 'lucide-react';
import ExamHistoryList from '../../components/profile/ExamHistoryList';
import BookmarkList from '../../components/profile/BookmarkList';
import FriendList from '../../components/profile/FriendList';
import ThreadList from '../../components/profile/ThreadList';
import InboxTab from '../../components/profile/InboxTab';
// Placeholder for Threads
const Placeholder = ({ title }) => <div className="p-8 text-center text-gray-500 bg-white dark:bg-slate-800 rounded-xl shadow">{title} Coming Soon</div>;

const ProfilePage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user: authUser, loading: authLoading } = useAuth();
    const [profileUser, setProfileUser] = useState(null);
    const [stats, setStats] = useState({ radar: [], heatmap: [] });
    const [loading, setLoading] = useState(true);

    const isOwnProfile = !id || (authUser && authUser.id === parseInt(id));

    // Initialize tab from URL query params
    const getInitialTab = () => {
        const params = new URLSearchParams(window.location.search);
        const tabParam = params.get('tab');
        if (tabParam === 'inbox' && isOwnProfile) return 'inbox';
        return 'overview';
    };

    const [activeTab, setActiveTab] = useState(getInitialTab());

    // Update active tab if URL changes
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const tabParam = params.get('tab');
        if (tabParam === 'inbox' && isOwnProfile) {
            setActiveTab('inbox');
        }
    }, [window.location.search, isOwnProfile]);

    useEffect(() => {
        // Wait for auth check to complete
        console.log('[ProfilePage] Auth Check:', { authLoading, authUser, isOwnProfile });
        if (authLoading) return;

        // If trying to view own profile but not logged in, redirect to login
        if (isOwnProfile && !authUser) {
            console.warn('[ProfilePage] Redirecting to login. User not found.');
            navigate('/login');
            return;
        }

        const fetchProfileData = async () => {
            setLoading(true);
            try {
                let data;
                if (isOwnProfile) {
                    // Fetch own profile to get latest data
                    data = await userService.getProfile();
                } else {
                    data = await userService.getUserProfile(id);
                }
                // Fix: Unwrap API response { success: true, data: user }
                if (data.success && data.data) {
                    data = data.data;
                }
                setProfileUser(data);

                // Fetch Stats
                // If own profile or public stats allowed
                if (isOwnProfile || data.is_public_stats) {
                    // Stats fetching logic needs to support by ID if not self, but current API relies on token (req.user.id).
                    // Wait, my backend implementation for getHeatmapStats uses req.user.id !
                    // I need to update backend to support /users/stats/:id if public.
                    // For now, if it's own profile, we fetch. If not, we might miss stats unless I update backend.
                    // Let's assume currently only self stats work or I update backend quickly.
                    if (isOwnProfile) {
                        const [heatmapRes, radarRes] = await Promise.all([
                            userService.getHeatmapStats(),
                            userService.getRadarStats()
                        ]);
                        setStats({
                            heatmap: heatmapRes.data || [],
                            radar: radarRes.data || []
                        });
                    }
                }
            } catch (error) {
                console.error("Failed to load profile", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfileData();
    }, [id, authUser?.id, isOwnProfile, authLoading, navigate]);

    if (loading) return <div className="p-10 text-center">Loading Profile...</div>;
    if (!profileUser) return <div className="p-10 text-center">User not found.</div>;

    const tabs = [
        { id: 'overview', label: 'Overview', icon: null },
        { id: 'history', label: 'History', icon: History },
        { id: 'bookmarks', label: 'Bookmarks', icon: BookMarked },
        { id: 'posts', label: 'My Threads', icon: MessageSquare },
        { id: 'friends', label: 'Friends', icon: Users },
    ];

    if (isOwnProfile) {
        tabs.splice(4, 0, { id: 'inbox', label: 'กล่องข้อความ', icon: MessageSquare });
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Left Sidebar (User Info) */}
                <div className="md:col-span-4 lg:col-span-3 space-y-6">
                    <div className="sticky top-24">
                        <UserInfoCard
                            user={profileUser}
                            isOwnProfile={isOwnProfile}
                            onEditProfile={() => navigate('/settings?tab=profile')}
                            onUserUpdate={(updatedUser) => setProfileUser(updatedUser)}
                        />
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="md:col-span-8 lg:col-span-9 space-y-6">
                    {/* Horizontal Tabs */}
                    <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-full whitespace-nowrap text-sm font-medium transition-all shadow-sm border ${activeTab === tab.id
                                    ? 'bg-blue-600 text-white border-blue-600 shadow-blue-200 dark:shadow-none'
                                    : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700'
                                    }`}
                            >
                                {tab.icon && <tab.icon size={16} />}
                                {tab.label}
                            </button>
                        ))}
                        {isOwnProfile && (
                            <button
                                onClick={() => navigate('/settings')}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-full whitespace-nowrap text-sm font-medium bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 transition-all shadow-sm"
                            >
                                <Settings size={16} /> Settings
                            </button>
                        )}
                    </div>

                    {activeTab === 'overview' && (
                        <AnalyticsDashboard
                            heatmapData={stats.heatmap}
                            radarData={stats.radar}
                            user={profileUser}
                        />
                    )}
                    {activeTab === 'history' && <ExamHistoryList userId={profileUser.id} />}
                    {activeTab === 'bookmarks' && <BookmarkList />}
                    {activeTab === 'posts' && <ThreadList userId={isOwnProfile ? authUser.id : profileUser.id} />}
                    {activeTab === 'inbox' && isOwnProfile && <InboxTab />}
                    {activeTab === 'friends' && <FriendList />}
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
