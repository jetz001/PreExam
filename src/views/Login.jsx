import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SocialLogin from '../components/SocialLogin';
import { Sparkles } from 'lucide-react';

const Login = () => {
    const { isAuthenticated, login, user } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const isGuest = user?.email?.startsWith('guest_');
        if (isAuthenticated && !isGuest) {
            navigate('/profile');
        }
    }, [isAuthenticated, navigate, user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await login(formData);
            navigate('/profile');
        } catch (err) {
            setError(err.response?.data?.message || 'เข้าสู่ระบบไม่สำเร็จ โปรดตรวจสอบข้อมูลของคุณ');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#46178f] relative overflow-hidden font-sans">
            
            {/* Playful Floating Shapes Background (Kahoot Style) */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[10%] left-[5%] w-32 h-32 bg-[#ff3355] rounded-full opacity-60 animate-[bounce_8s_infinite] blur-[2px]"></div>
                <div className="absolute top-[60%] right-[10%] w-40 h-40 bg-[#00c8ff] rounded-2xl rotate-45 opacity-60 animate-[spin_15s_linear_infinite] blur-[2px]"></div>
                <div className="absolute bottom-[10%] left-[15%] w-24 h-24 bg-[#ffb020] rounded-lg opacity-60 animate-[ping_10s_infinite] blur-[2px]"></div>
                <div className="absolute top-[20%] right-[25%] w-0 h-0 border-l-[40px] border-l-transparent border-r-[40px] border-r-transparent border-b-[70px] border-b-[#33ffaa] rotate-[30deg] opacity-70 animate-[pulse_6s_infinite] blur-[2px]"></div>
            </div>

            <div className="relative z-10 w-full max-w-md px-6 mt-16">
                
                {/* Logo Area */}
                <div className="flex flex-col items-center justify-center mb-6">
                    <div className="bg-white p-4 rounded-2xl shadow-[0_6px_0_0_rgba(0,0,0,0.2)] rotate-[-5deg] mb-4">
                        <h1 className="text-4xl font-extrabold text-[#46178f] tracking-tight flex items-center gap-2">
                            PreExam <Sparkles className="text-[#ffb020]" size={28} />
                        </h1>
                    </div>
                    <p className="text-white font-bold text-xl drop-shadow-md">
                        พร้อมสนุกและเรียนรู้แล้วหรือยัง? ✨
                    </p>
                </div>

                {/* Login Card */}
                <div className="bg-white rounded-[20px] p-6 shadow-[0_8px_0_0_rgba(0,0,0,0.2)] border-2 border-gray-100">
                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <div>
                            <input
                                name="email"
                                type="email"
                                required
                                className="w-full px-4 py-4 bg-gray-100 border-2 border-gray-200 rounded-xl font-bold text-gray-700 text-lg placeholder-gray-400 focus:outline-none focus:border-[#46178f] focus:bg-white transition-colors text-center"
                                placeholder="อีเมล หรือ ชื่อผู้ใช้"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <input
                                name="password"
                                type="password"
                                required
                                className="w-full px-4 py-4 bg-gray-100 border-2 border-gray-200 rounded-xl font-bold text-gray-700 text-lg placeholder-gray-400 focus:outline-none focus:border-[#46178f] focus:bg-white transition-colors text-center"
                                placeholder="รหัสผ่าน"
                                value={formData.password}
                                onChange={handleChange}
                            />
                        </div>

                        {error && (
                            <div className="bg-red-100 text-red-600 font-bold text-sm p-3 rounded-lg text-center border-2 border-red-200">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full mt-2 py-4 px-4 rounded-xl shadow-[0_6px_0_0_#2b0f54] text-xl font-black text-white bg-[#46178f] hover:bg-[#5b1ea5] hover:-translate-y-1 hover:shadow-[0_8px_0_0_#2b0f54] active:translate-y-2 active:shadow-none transition-all uppercase tracking-widest disabled:opacity-50"
                        >
                            {isLoading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ!"}
                        </button>
                    </form>

                    <div className="mt-6 pt-4 border-t-2 border-dashed border-gray-200">
                        <SocialLogin />
                    </div>

                    <div className="mt-6 text-center">
                        <span className="text-gray-600 font-medium">ยังไม่มีบัญชีใช่ไหม? </span>
                        <Link to="/register" className="text-[#46178f] font-bold hover:underline">
                            สมัครสมาชิกใหม่
                        </Link>
                    </div>

                </div>
            </div>
            
        </div>
    );
};

export default Login;
