import React, { useState, useEffect } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import { Globe, PenSquare, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// New Components
import '../../src/assets/css/community.css';
import CommunityLeftBar from '../components/Community/CommunityLeftBar';
import CommunityFeed from '../components/Community/CommunityFeed';
import CommunityRightBar from '../components/Community/CommunityRightBar';

// Modals
import CreatePostModal from '../components/Community/CreatePostModal';
import PostDetailModal from '../components/Community/PostDetailModal';

// Burst Canvas Hook (to replace the inline script)
const useBurstEffect = () => {
    const burst = () => {
        const cv = document.getElementById('cv');
        if (!cv) return;
        const ctx = cv.getContext('2d');
        cv.width = window.innerWidth;
        cv.height = window.innerHeight;
        const c = ['#ffcc00', '#f72585', '#4361ee', '#06d6a0', '#fb8500', '#fff', '#a855f7'];
        const p = Array.from({ length: 90 }, () => ({
            x: Math.random() * cv.width,
            y: -8 - Math.random() * 120,
            r: 4 + Math.random() * 6,
            d: 3 + Math.random() * 3.5,
            color: c[Math.floor(Math.random() * c.length)],
            t: Math.random() * 10 - 5,
            a: Math.random() * Math.PI * 2,
            s: (Math.random() - .5) * .18,
            sq: Math.random() > .5
        }));
        let f = 0;
        function draw() {
            ctx.clearRect(0, 0, cv.width, cv.height);
            p.forEach(q => {
                ctx.fillStyle = q.color;
                ctx.beginPath();
                if (q.sq) {
                    ctx.save();
                    ctx.translate(q.x, q.y);
                    ctx.rotate(q.a);
                    ctx.fillRect(-q.r, -q.r / 2, q.r * 2, q.r);
                    ctx.restore();
                } else {
                    ctx.arc(q.x, q.y, q.r, 0, Math.PI * 2);
                }
                ctx.fill();
                q.y += q.d;
                q.x += Math.sin(f * .018 + q.t) * 1.4;
                q.a += q.s;
            });
            f++;
            if (f < 150) requestAnimationFrame(draw);
            else ctx.clearRect(0, 0, cv.width, cv.height);
        }
        draw();
    };
    return burst;
};

const Community = () => {
    const { user } = useAuth();
    const burst = useBurstEffect();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedThread, setSelectedThread] = useState(null);
    const [searchParams, setSearchParams] = useSearchParams();
    const location = useLocation();
    const [sharedImage, setSharedImage] = useState(null);

    // Initial load logic for modals
    useEffect(() => {
        const threadId = searchParams.get('threadId');
        if (threadId) {
            setSelectedThread({ id: threadId });
        }

        if (location.state?.sharedImage) {
            setSharedImage(location.state.sharedImage);
            setIsModalOpen(true);
            window.history.replaceState({}, document.title);
        }

        if (location.state?.sharedTitle || location.state?.sharedContent) {
            if (location.state?.sharedImageUrl) {
                const processImage = async () => {
                    try {
                        const response = await fetch(location.state.sharedImageUrl);
                        const blob = await response.blob();
                        const file = new File([blob], "shared_question.jpg", { type: blob.type });
                        setSharedImage(file);
                        setIsModalOpen(true);
                        window.history.replaceState({}, document.title);
                    } catch (error) {
                        setIsModalOpen(true);
                        window.history.replaceState({}, document.title);
                    }
                };
                processImage();
            } else {
                setIsModalOpen(true);
                window.history.replaceState({}, document.title);
            }
        }
    }, [searchParams, location]);

    const handleCreatePost = () => {
        burst();
        setIsModalOpen(true);
    };

    return (
        <div className="community-page">
            <canvas id="cv"></canvas>

            {/* PAGE HEADER */}
            <div className="page-header-wrap">
                <header className="page-header">
                    <div className="page-title-group">
                        <div className="page-title-icon" aria-hidden="true">
                            <Globe size={24} strokeWidth={2.2} />
                        </div>
                        <div className="min-w-0">
                            <h1 className="page-title">
                                <span>Community</span>
                                <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-300/20 text-amber-200 border border-amber-300/35">
                                    <Sparkles size={11} />
                                    ชุมชนติวสอบ
                                </span>
                            </h1>
                            <p className="page-subtitle truncate">
                                แลกเปลี่ยนแนวข้อสอบ ถาม-ตอบ และแบ่งปันประสบการณ์กับเพื่อนติวสอบ
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        className="new-post-btn"
                        onClick={handleCreatePost}
                    >
                        <PenSquare size={17} strokeWidth={2.3} />
                        <span>โพสต์ใหม่</span>
                    </button>
                </header>
            </div>

            {/* 3-COL GRID */}
            <div className="cols">
                {/* LEFT */}
                <CommunityLeftBar user={user} />

                {/* MIDDLE FEED */}
                <CommunityFeed
                    onThreadSelect={(thread) => setSelectedThread(thread)}
                    onBurst={burst}
                />

                {/* RIGHT */}
                <CommunityRightBar onBurst={burst} user={user} />
            </div>

            {/* FAB */}
            <button
                type="button"
                className="fab lg:hidden"
                onClick={handleCreatePost}
                aria-label="สร้างโพสต์ใหม่"
                title="สร้างโพสต์ใหม่"
            >
                <PenSquare size={22} strokeWidth={2.4} />
            </button>

            {/* MODALS */}
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
