import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, CheckCircle, Clock, Award, Users, FileText, ArrowRight, Eye } from 'lucide-react';
import { motion } from 'framer-motion';


import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';

const Home = () => {
    const { user } = useAuth();
    console.log('[Home] Current User State:', user, 'Is Truthy:', !!user);
    const [stats, setStats] = React.useState({ questions: 0, users: 0, passed: 0 });
    const [onlineUsers, setOnlineUsers] = React.useState(1); // Default to at least 1 (self)
    const socket = useSocket();

    React.useEffect(() => {
        if (!socket) return;

        socket.on('online_users', (count) => {
            setOnlineUsers(count);
        });

        return () => {
            socket.off('online_users');
        };
    }, [socket]);

    React.useEffect(() => {
        const fetchStats = async () => {
            // Dynamic import to avoid top-level import issues if not needed elsewhere
            const publicService = (await import('../services/publicService')).default;
            try {
                const res = await publicService.getStats();
                if (res.success) {
                    setStats(res.data);
                }
            } catch (error) {
                console.error("Failed to fetch stats", error);
            }
        };
        fetchStats();
    }, []);



    // News Carousel Logic
    const [newsItems, setNewsItems] = React.useState([]);
    const [isLoadingNews, setIsLoadingNews] = React.useState(true);

    React.useEffect(() => {
        const fetchNews = async () => {
            const publicService = (await import('../services/publicService')).default;
            try {
                const res = await publicService.getLandingNews();
                if (res.success) {
                    setNewsItems(res.data);
                }
            } catch (error) {
                console.error("Failed to fetch landing news", error);
            } finally {
                setIsLoadingNews(false);
            }
        };
        fetchNews();
    }, []);

    return (
        <div className="flex flex-col">
            {/* Hero Section */}
            <section className="bg-white overflow-hidden">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center py-16 px-4 sm:px-6 lg:px-8">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5 }}
                            className="text-left"
                        >
                            <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                                <span className="block">สอบบรรจุข้าราชการท้องถิ่น</span>
                                <span className="block text-primary">ติดชัวร์!</span>
                            </h1>
                            <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                                คลังข้อสอบออนไลน์ที่แม่นยำที่สุด อัปเดตปีล่าสุด พร้อมระบบจำลองสนามสอบเสมือนจริง เพื่อให้คุณพร้อมที่สุดก่อนลงสนามจริง
                            </p>

                            <div className="mt-6 inline-flex items-center px-4 py-2 rounded-lg bg-green-50 border border-green-200 text-green-800 text-sm font-medium">
                                <CheckCircle className="w-5 h-5 mr-2 text-green-600 flex-shrink-0" />
                                <span>ข้อสอบคุณภาพจากฝีมือมนุษย์ (100% Human-Curated) รวบรวมจากแนวข้อสอบจริงเพื่อความแม่นยำสูงสุด</span>
                            </div>
                            <div className="mt-5 sm:mt-8 sm:flex sm:justify-start">
                                <div className="rounded-md shadow">
                                    <Link to="/exam" className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-secondary hover:bg-yellow-500 md:py-4 md:text-lg text-gray-900">
                                        ทดลองทำข้อสอบฟรี
                                    </Link>
                                </div>
                                <div className="mt-3 sm:mt-0 sm:ml-3">
                                    <Link to="/courses" className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-primary bg-indigo-100 hover:bg-indigo-200 md:py-4 md:text-lg">
                                        ดูคอร์สติว
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="relative"
                        >
                            <img
                                className="w-full rounded-xl shadow-xl"
                                src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
                                alt="Students studying"
                            />
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* News Carousel Section */}
            {!isLoadingNews && newsItems.length > 0 && (
                <section className="bg-slate-50 py-12 border-b border-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                <span className="bg-red-500 w-1.5 h-6 rounded-full inline-block"></span>
                                ข่าวสาร & ประกาศล่าสุด
                            </h2>
                            <Link to="/news" className="text-royal-blue-600 text-sm font-medium hover:underline flex items-center">
                                ดูทั้งหมด <ArrowRight size={16} className="ml-1" />
                            </Link>
                        </div>

                        <div className="relative">
                            <div className="flex overflow-x-auto pb-6 gap-6 scrollbar-hide snap-x snap-mandatory px-4">
                                {newsItems.map((item) => (
                                    <div key={item.id} className="w-[85vw] sm:w-[350px] md:w-[380px] bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden snap-center flex-shrink-0 hover:shadow-md transition-shadow">
                                        <div className="h-48 relative overflow-hidden bg-slate-200">
                                            {item.image_url ? (
                                                <img src={item.image_url} alt={item.title} className="w-full h-full object-cover transition-transform hover:scale-105 duration-500" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-400">
                                                    <FileText size={48} opacity={0.2} />
                                                </div>
                                            )}
                                            <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-semibold text-slate-700 shadow-sm">
                                                {new Date(item.published_at).toLocaleDateString('th-TH')}
                                            </div>
                                        </div>
                                        <div className="p-5">
                                            <h3 className="font-bold text-gray-900 line-clamp-2 mb-2 h-12 leading-6">
                                                <Link to={`/news/${item.id}`} className="hover:text-royal-blue-600 transition-colors">
                                                    {item.title}
                                                </Link>
                                            </h3>
                                            <div className="flex items-center justify-between mt-4">
                                                <span className="text-xs text-slate-500 flex items-center">
                                                    <Eye size={12} className="mr-1" /> {item.views}
                                                </span>
                                                <Link to={`/news/${item.id}`} className="text-sm font-medium text-royal-blue-600 hover:text-royal-blue-800">
                                                    อ่านต่อ
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* Trust Bar */}
            <section className="bg-primary py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center text-white">
                        <div>
                            <div className="text-4xl font-bold">{stats.questions > 0 ? stats.questions.toLocaleString() + '+' : '5,000+'}</div>
                            <div className="mt-2 text-indigo-100">ข้อสอบในคลัง</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold">{stats.users > 0 ? stats.users.toLocaleString() + '+' : '10,000+'}</div>
                            <div className="mt-2 text-indigo-100">ผู้ใช้งาน</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-yellow-300 animate-pulse">{onlineUsers}</div>
                            <div className="mt-2 text-indigo-100">กำลังออนไลน์อยู่</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Flagship Selection */}
            <section className="py-16 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-12">เลือกสนามสอบของคุณ</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-white rounded-xl shadow-lg overflow-hidden transform transition hover:scale-105">
                            <div className="p-8">
                                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                                    <Award className="h-6 w-6 text-primary" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">สอบท้องถิ่น 67</h3>
                                <p className="text-gray-500 mb-4">แนวข้อสอบท้องถิ่นล่าสุด ครบทุกตำแหน่ง อบต. เทศบาล อบจ.</p>
                                <Link to="/exam?category=local_gov" className="text-primary font-medium flex items-center hover:text-blue-700">
                                    เริ่มทำข้อสอบ <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl shadow-lg overflow-hidden transform transition hover:scale-105">
                            <div className="p-8">
                                <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                                    <BookOpen className="h-6 w-6 text-yellow-600" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">ก.พ. ภาค ก.</h3>
                                <p className="text-gray-500 mb-4">เตรียมสอบ ก.พ. ภาค ก. ครบทุกวิชา ไทย อังกฤษ กฎหมาย คณิต</p>
                                <Link to="/exam?category=ocsc" className="text-primary font-medium flex items-center hover:text-blue-700">
                                    เริ่มทำข้อสอบ <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl shadow-lg overflow-hidden transform transition hover:scale-105">
                            <div className="p-8">
                                <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                                    <Users className="h-6 w-6 text-gray-600" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">สอบครูผู้ช่วย</h3>
                                <p className="text-gray-500 mb-4">คลังข้อสอบครูผู้ช่วยชุดใหม่ อัดแน่นด้วยคุณภาพ พร้อมเฉลยละเอียด</p>
                                <Link to="/exam?category=teacher" className="text-primary font-medium flex items-center hover:text-blue-700">
                                    เริ่มทำข้อสอบ <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* How it Works */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-12">3 ขั้นตอนง่ายๆ สู่ความสำเร็จ</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                        <div>
                            <div className="mx-auto h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                                <Users className="h-8 w-8 text-primary" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900">1. สมัครสมาชิกฟรี</h3>
                            <p className="mt-2 text-gray-500">ลงทะเบียนง่ายๆ ด้วยอีเมล หรือ Google Account</p>
                        </div>
                        <div>
                            <div className="mx-auto h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                                <FileText className="h-8 w-8 text-primary" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900">2. เลือกวิชาที่ต้องการฝึก</h3>
                            <p className="mt-2 text-gray-500">เลือกหมวดหมู่และวิชาที่ต้องการทดสอบความรู้</p>
                        </div>
                        <div>
                            <div className="mx-auto h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                                <CheckCircle className="h-8 w-8 text-primary" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900">3. ดูผลวิเคราะห์</h3>
                            <p className="mt-2 text-gray-500">รู้จุดอ่อน พัฒนาจุดแข็ง พร้อมลุยสนามจริง</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Why Us */}
            <section className="py-16 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-12">ทำไมต้อง PreExam?</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="flex flex-col items-center text-center">
                            <Clock className="h-12 w-12 text-primary mb-4" />
                            <h3 className="text-lg font-bold mb-2">จับเวลาจริง</h3>
                            <p className="text-gray-500">ระบบจับเวลาเสมือนจริง ลดความตื่นเต้นเมื่อลงสนามสอบ</p>
                        </div>
                        <div className="flex flex-col items-center text-center">
                            <CheckCircle className="h-12 w-12 text-primary mb-4" />
                            <h3 className="text-lg font-bold mb-2">เฉลยละเอียด</h3>
                            <p className="text-gray-500">เข้าใจแก่นแท้ ไม่ใช่แค่จำคำตอบ ด้วยคำอธิบายที่ชัดเจน</p>
                        </div>
                        <div className="flex flex-col items-center text-center">
                            <Award className="h-12 w-12 text-primary mb-4" />
                            <h3 className="text-lg font-bold mb-2">วิเคราะห์ผล</h3>
                            <p className="text-gray-500">รู้จุดอ่อนก่อนใคร ด้วยระบบวิเคราะห์ผลการสอบรายบุคคล</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Business / Sponsor Promotion - Show if not logged in OR if user is a guest */}
            {(!user || user.role === 'guest') && (
                <>
                    <section className="py-16 bg-white border-t border-gray-100">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl shadow-xl overflow-hidden">
                                <div className="md:flex">
                                    <div className="p-8 md:p-12 md:w-1/2 flex flex-col justify-center">
                                        <div className="uppercase tracking-wide text-sm text-yellow-400 font-semibold mb-2">สำหรับผู้ประกอบการและติวเตอร์</div>
                                        <h2 className="text-3xl font-extrabold text-white mb-4">
                                            โปรโมทธุรกิจของคุณบน PreExam
                                        </h2>
                                        <p className="text-gray-300 mb-6 text-lg">
                                            เข้าถึงกลุ่มเป้าหมายนักเรียนและผู้เตรียมสอบข้าราชการกว่า 10,000+ คนโดยตรง
                                            สร้างแคมเปญโฆษณาของคุณได้ง่ายๆ และวัดผลได้จริง
                                        </p>
                                        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                                            <Link to="/auth/business/login" className="flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-gray-900 bg-white hover:bg-gray-100 transition-colors">
                                                เข้าสู่ระบบธุรกิจ
                                            </Link>
                                            <Link to="/register?role=sponsor" className="flex items-center justify-center px-6 py-3 border border-gray-500 text-base font-medium rounded-md text-white hover:bg-gray-700 transition-colors">
                                                สมัครบัญชีสปอนเซอร์
                                            </Link>
                                        </div>
                                    </div>
                                    <div className="md:w-1/2 bg-gray-700 relative h-64 md:h-auto">
                                        <img
                                            className="absolute inset-0 w-full h-full object-cover opacity-60"
                                            src="https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-1.2.1&auto=format&fit=crop&w=1267&q=80"
                                            alt="Business meeting"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-r from-gray-900 to-transparent opacity-80 md:hidden"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Call to Action */}
                    <section className="bg-primary py-16">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                            <h2 className="text-3xl font-extrabold text-white mb-4">อย่ารอให้ใกล้สอบแล้วค่อยเริ่ม</h2>
                            <p className="text-xl text-indigo-100 mb-8">เริ่มต้นเตรียมตัววันนี้ เพื่ออนาคตที่มั่นคงของคุณ</p>
                            <Link to="/register" className="inline-block bg-secondary text-gray-900 font-bold py-3 px-8 rounded-lg hover:bg-yellow-500 transition duration-300">
                                สมัครสมาชิกเลย
                            </Link>
                        </div>
                    </section>
                </>
            )}
        </div>
    );
};

export default Home;
