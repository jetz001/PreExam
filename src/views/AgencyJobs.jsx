import React, { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Briefcase, Building2, Users } from 'lucide-react';
import newsService from '../services/newsService';
import PlayfulNewsCard from '../components/news/PlayfulNewsCard';
import '../assets/css/news.css';

const AgencyJobs = () => {
    const { agencyId } = useParams();
    const [searchParams] = useSearchParams();
    const ministry = searchParams.get('ministry');
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    // Kahoot-style Background Shapes
    const [shapes, setShapes] = useState([]);
    useEffect(() => {
        const shapeTypes = ['k-circle', 'k-square', 'k-triangle'];
        const newShapes = Array.from({ length: 12 }, (_, i) => ({
            id: i,
            type: shapeTypes[Math.floor(Math.random() * shapeTypes.length)],
            left: `${Math.random() * 100}vw`,
            size: `${28 + Math.random() * 44}px`,
            delay: `${Math.random() * 10}s`,
            duration: `${16 + Math.random() * 14}s`,
        }));
        setShapes(newShapes);
    }, []);

    useEffect(() => {
        const fetchJobs = async () => {
            setLoading(true);
            try {
                const res = await newsService.getNews('งานราชการ', null, agencyId, ministry);
                if (res.success) {
                    setJobs(res.data || []);
                }
            } catch (err) {
                console.error('Failed to fetch agency jobs', err);
            } finally {
                setLoading(false);
            }
        };
        fetchJobs();
    }, [agencyId, ministry]);

    const totalVacancies = jobs.reduce(
        (sum, job) => sum + (job.metadata?.vacancy_count ? parseInt(job.metadata.vacancy_count, 10) : 1) || 1,
        0
    );

    return (
        <div className="news-page min-h-screen relative">
            {/* Shapes */}
            {shapes.map((s) => (
                <div
                    key={s.id}
                    className={`k-shape ${s.type}`}
                    style={{
                        left: s.left,
                        width: s.type !== 'k-triangle' ? s.size : undefined,
                        height: s.type !== 'k-triangle' ? s.size : undefined,
                        '--s': s.type === 'k-triangle' ? s.size : undefined,
                        animationDelay: s.delay,
                        animationDuration: s.duration,
                    }}
                />
            ))}

            <div className="max-w-7xl mx-auto px-3 sm:px-6 py-8 sm:py-12 relative z-10">
                <Link
                    to="/news"
                    className="inline-flex items-center gap-2 text-white hover:text-[#fde047] mb-6 transition-all bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full backdrop-blur-md border border-white/20 text-sm font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffcc00]"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>กลับหน้ารวมข่าว</span>
                </Link>

                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-5 sm:p-8 mb-8 shadow-2xl">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-amber-300/30 to-orange-500/30 border border-amber-300/45 text-[#fde047] flex items-center justify-center flex-shrink-0 shadow-lg">
                            <Briefcase className="w-7 h-7 sm:w-8 sm:h-8" />
                        </div>
                        <div className="min-w-0 flex-1">
                            {ministry && (
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-bold text-amber-200 mb-2">
                                    <Building2 size={12} />
                                    <span>{ministry}</span>
                                </div>
                            )}
                            <h1 className="text-2xl sm:text-3xl font-black text-white mb-2 break-words leading-tight">
                                {agencyId}
                            </h1>
                            <div className="flex flex-wrap items-center gap-3 text-sm text-white/85 font-semibold">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15">
                                    <Briefcase size={14} className="text-[#fde047]" />
                                    <span>{jobs.length} ตำแหน่งที่เปิดรับ</span>
                                </span>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/35 text-emerald-200">
                                    <Users size={14} />
                                    <span>รวม {totalVacancies} อัตรา</span>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="n-card h-44 animate-pulse space-y-3" aria-hidden="true">
                                <div className="h-5 w-24 bg-white/15 rounded-full" />
                                <div className="h-5 w-4/5 bg-white/15 rounded" />
                                <div className="h-4 w-2/3 bg-white/10 rounded mt-auto" />
                            </div>
                        ))}
                    </div>
                ) : jobs.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                        {jobs.map((job, idx) => (
                            <PlayfulNewsCard key={job.id} news={job} index={idx} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 px-4 bg-white/10 rounded-3xl border border-white/20 backdrop-blur-md">
                        <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 text-[#fde047] flex items-center justify-center mx-auto mb-4">
                            <Briefcase className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">ไม่พบตำแหน่งงาน</h3>
                        <p className="text-white/75 text-sm">ยังไม่มีการประกาศรับสมัครงานสำหรับหน่วยงานนี้ในขณะนี้</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AgencyJobs;
