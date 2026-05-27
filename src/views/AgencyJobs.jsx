import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Briefcase } from 'lucide-react';
import newsService from '../services/newsService';
import PlayfulNewsCard from '../components/news/PlayfulNewsCard';
import '../assets/css/news.css';

const AgencyJobs = () => {
    const { agencyId } = useParams();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Kahoot-style Background Shapes
    const [shapes, setShapes] = useState([]);
    useEffect(() => {
        const shapeTypes = ['k-circle', 'k-square', 'k-triangle'];
        const newShapes = Array.from({ length: 15 }, (_, i) => ({
            id: i,
            type: shapeTypes[Math.floor(Math.random() * shapeTypes.length)],
            left: `${Math.random() * 100}vw`,
            size: `${30 + Math.random() * 50}px`,
            delay: `${Math.random() * 10}s`,
            duration: `${15 + Math.random() * 15}s`,
        }));
        setShapes(newShapes);
    }, []);

    useEffect(() => {
        const fetchJobs = async () => {
            setLoading(true);
            try {
                const res = await newsService.getNews('งานราชการ', null, agencyId);
                if (res.success) {
                    setJobs(res.data);
                }
            } catch (err) {
                console.error("Failed to fetch agency jobs", err);
            } finally {
                setLoading(false);
            }
        };
        fetchJobs();
    }, [agencyId]);

    return (
        <div className="news-page min-h-screen relative overflow-hidden" style={{ backgroundColor: '#46178f' }}>
            {/* Shapes */}
            {shapes.map(s => (
                <div 
                    key={s.id} 
                    className={`k-shape ${s.type}`} 
                    style={{ 
                        left: s.left, 
                        width: s.type !== 'k-triangle' ? s.size : undefined, 
                        height: s.type !== 'k-triangle' ? s.size : undefined,
                        '--s': s.type === 'k-triangle' ? s.size : undefined,
                        animationDelay: s.delay,
                        animationDuration: s.duration
                    }} 
                />
            ))}

            <div className="max-w-7xl mx-auto px-4 py-12 relative z-10">
                <Link to="/news" className="inline-flex items-center text-white/80 hover:text-white mb-6 transition-colors">
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back to News
                </Link>

                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                            <Briefcase className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-2">{agencyId}</h1>
                            <p className="text-white/80">พบ {jobs.length} ตำแหน่งที่เปิดรับสมัคร</p>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1,2,3,4,5,6].map(i => (
                            <div key={i} className="animate-pulse bg-white/10 rounded-2xl h-80"></div>
                        ))}
                    </div>
                ) : jobs.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {jobs.map(job => (
                            <PlayfulNewsCard key={job.id} news={job} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white/10 rounded-2xl border border-white/20 backdrop-blur-sm">
                        <Briefcase className="w-16 h-16 text-white/50 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">ไม่พบตำแหน่งงาน</h3>
                        <p className="text-white/70">ยังไม่มีการประกาศรับสมัครงานสำหรับหน่วยงานนี้</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AgencyJobs;
