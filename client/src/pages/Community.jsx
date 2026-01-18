import React, { useState, useEffect, useRef } from 'react';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import communityService from '../services/communityService';
import { Plus, Search, TrendingUp } from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import FeedPost from '../components/Community/FeedPost';
import CreatePostModal from '../components/Community/CreatePostModal';
import PostDetailModal from '../components/Community/PostDetailModal';
import FriendSidebar from '../components/Community/FriendSidebar';
import StudyGroupList from '../components/profile/StudyGroupList';

import AdSlot from '../components/ads/AdSlot';

const CATEGORY_MAP = {
    all: 'ทั้งหมด',
    general: 'พูดคุยทั่วไป',
    exam_news: 'ข่าวการสอบ',
    qa_help: 'ถาม-ตอบ',
    relax: 'พักผ่อน/รีวิว'
};

const Community = () => {
    const { ref, inView } = useInView();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedThread, setSelectedThread] = useState(null);
    const [searchParams, setSearchParams] = useSearchParams();
    const location = useLocation();
    const [sharedImage, setSharedImage] = useState(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [trendingTags, setTrendingTags] = useState([]);
    const socket = useSocket();
    const queryClient = useQueryClient();

    // Check URL for threadId on mount
    useEffect(() => {
        const threadId = searchParams.get('threadId');
        if (threadId) {
            setSelectedThread({ id: threadId });
        }

        // Handle Shared Image from other pages
        if (location.state?.sharedImage) {
            setSharedImage(location.state.sharedImage);
            setIsModalOpen(true);
            // Clear state
            window.history.replaceState({}, document.title);
        }

        // Handle Shared Question (Text)
        if (location.state?.sharedTitle || location.state?.sharedContent) {
            setIsModalOpen(true);
            // Clear state
            window.history.replaceState({}, document.title);
        }
    }, [searchParams, location]);

    // Fetch Trending Tags
    useEffect(() => {
        const loadTags = async () => {
            try {
                const tags = await communityService.getTrendingTags();
                setTrendingTags(tags);
            } catch (error) {
                console.error("Failed to load trending tags", error);
            }
        };
        loadTags();
    }, []);

    // Fetch Threads
    const fetchThreads = async ({ pageParam = null }) => {
        return await communityService.getThreads({
            pageParam,
            category: categoryFilter,
            search: searchTerm
        });
    };

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        status,
        refetch
    } = useInfiniteQuery({
        queryKey: ['threads', categoryFilter, searchTerm],
        queryFn: fetchThreads,
        getNextPageParam: (lastPage) => lastPage.nextCursor || undefined,
    });

    useEffect(() => {
        if (inView && hasNextPage) {
            fetchNextPage();
        }
    }, [inView, hasNextPage, fetchNextPage]);

    // Real-time listener
    useEffect(() => {
        if (!socket) return;

        socket.on('new_thread', (newThread) => {
            console.log("New thread received:", newThread);
            queryClient.invalidateQueries(['threads']); // Refetches to show new post
        });

        return () => {
            socket.off('new_thread');
        };
    }, [socket, queryClient]);

    // Search Debounce
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            refetch();
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, refetch]);


    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900 pb-20 transition-colors">
            {/* Top Bar for Mobile/Tablet */}
            <div className="bg-white dark:bg-slate-800 sticky top-0 z-40 border-b dark:border-slate-700 shadow-sm px-4 py-3 flex items-center justify-between">
                <h1 className="text-2xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Community</h1>
                <div className="flex space-x-2">
                    <button onClick={() => setIsModalOpen(true)} className="bg-indigo-600 text-white p-2 rounded-full shadow-lg hover:bg-indigo-700 transition-transform hover:scale-105 active:scale-95">
                        <Plus size={24} />
                    </button>
                </div>
            </div>



            {/* Main Content Grid */}
            <div className="max-w-7xl mx-auto px-4 pb-10 grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Left Column: Friends Sidebar (3 cols) */}
                <div className="hidden lg:block lg:col-span-3 space-y-6 pt-6">
                    <FriendSidebar />
                </div>

                {/* Center Column: Feed (6 cols) */}
                <div className="lg:col-span-6 space-y-6 pt-6">
                    {/* Filters & Search */}
                    <div className="space-y-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="ค้นหาหัวข้อที่น่าสนใจ..."
                                className="w-full pl-10 pr-4 py-3 rounded-xl border-none shadow-sm focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {/* Categories */}
                        <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
                            {Object.keys(CATEGORY_MAP).map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setCategoryFilter(cat)}
                                    className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${categoryFilter === cat ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'}`}
                                >
                                    {CATEGORY_MAP[cat]}
                                </button>
                            ))}
                        </div>

                        {/* Trending Tags */}
                        {trendingTags.length > 0 && (
                            <div className="flex flex-wrap gap-2 items-center">
                                <div className="flex items-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mr-1">
                                    <TrendingUp size={14} className="mr-1" />
                                    ยอดนิยม:
                                </div>
                                {trendingTags.map((tag, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setSearchTerm(tag.keyword)}
                                        className="px-3 py-1 bg-white/50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-full text-xs text-gray-600 dark:text-gray-300 hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                                    >
                                        #{tag.keyword}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {status === 'pending' ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="bg-white dark:bg-slate-800 h-48 rounded-xl shadow-sm animate-pulse" />
                            ))}
                        </div>
                    ) : status === 'error' ? (
                        <div className="text-center py-10 text-red-500">Error loading threads.</div>
                    ) : (
                        <>
                            {data.pages.map((page, i) => (
                                <React.Fragment key={i}>
                                    {page.threads.map((thread, index) => (
                                        <React.Fragment key={thread.id}>
                                            <div onClick={() => setSelectedThread(thread)} className="cursor-pointer">
                                                <FeedPost post={thread} />
                                            </div>
                                            {(index + 1) % 5 === 0 && (
                                                <div className="py-2">
                                                    <AdSlot placement="in-feed" />
                                                </div>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </React.Fragment>
                            ))}

                            {!hasNextPage && data.pages[0].threads.length > 0 && (
                                <div className="text-center py-8 text-gray-400 text-sm">
                                    ไม่มีโพสต์เพิ่มเติมแล้ว
                                </div>
                            )}

                            {data.pages[0].threads.length === 0 && (
                                <div className="text-center py-20 text-gray-500">
                                    ยังไม่มีการพูดคุยในหัวข้อนี้ เริ่มต้นสร้างโพสต์ใหม่ได้เลย!
                                </div>
                            )}

                            <div ref={ref} className="h-10 flex items-center justify-center mt-4">
                                {isFetchingNextPage && <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>}
                            </div>
                        </>
                    )}
                </div>

                {/* Right Column: Groups Sidebar (3 cols) */}
                <div className="hidden lg:block lg:col-span-3 space-y-6 pt-6">
                    <div className="sticky top-24">
                        <StudyGroupList compact={true} />
                    </div>
                </div>
            </div>

            {selectedThread && (
                <PostDetailModal
                    thread={selectedThread}
                    onClose={() => {
                        setSelectedThread(null);
                        setSearchParams(params => {
                            params.delete('threadId');
                            return params;
                        });
                    }}
                />
            )}

            {isModalOpen && (
                <CreatePostModal
                    onClose={() => { setIsModalOpen(false); setSharedImage(null); }}
                    initialImage={sharedImage}
                    initialTitle={location.state?.sharedTitle}
                    initialContent={location.state?.sharedContent}
                    initialCategory={location.state?.initialCategory}
                />
            )}
        </div>
    );
};

export default Community;
