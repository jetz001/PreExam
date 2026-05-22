import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SocialLogin from '../components/SocialLogin';
import { Sparkles } from 'lucide-react';
import HomeNavbar from '../components/HomeNavbar';

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
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#46178f] relative overflow-hidden font-sans">
            <HomeNavbar />
            
            {/* Playful Floating Shapes Background (Kahoot Style) */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[10%] left-[5%] w-32 h-32 bg-[#ff3355] rounded-full opacity-60 animate-[bounce_8s_infinite] blur-[2px]"></div>
                <div className="absolute top-[60%] right-[10%] w-40 h-40 bg-[#00c8ff] rounded-2xl rotate-45 opacity-60 animate-[spin_15s_linear_infinite] blur-[2px]"></div>
                <div className="absolute bottom-[10%] left-[15%] w-24 h-24 bg-[#ffb020] rounded-lg rotate-12 opacity-80 animate-[bounce_10s_infinite_reverse] blur-[2px]"></div>
                <div className="absolute top-[20%] right-[25%] w-0 h-0 border-l-[40px] border-l-transparent border-r-[40px] border-r-transparent border-b-[70px] border-b-[#33ffaa] rotate-[30deg] opacity-70 animate-[pulse_6s_infinite] blur-[2px]"></div>
            </div>

            <div className="relative z-10 w-full max-w-md px-6 mt-16">
                
                {/* Logo Area */}
                <div className="flex flex-col items-center justify-center mb-6">
                    <div className="w-20 h-20 bg-white rounded-3xl shadow-[0_8px_0_#2b0761] flex items-center justify-center mb-4 transform -rotate-3 hover:rotate-3 transition-transform duration-300">
                        <span className="text-4xl">🎯</span>
                    </div>
                    <h1 className="text-4xl font-black text-white drop-shadow-[0_4px_4px_rgba(0,0,0,0.3)] tracking-wide">
                        PreExam<span className="text-[#ffb020]">!</span>
                    </h1>
                </div>

                {/* Login Card */}
                <div className="bg-white rounded-[2rem] shadow-[0_12px_0_rgba(0,0,0,0.2)] p-8">
                    <h2 className="text-2xl font-bold text-gray-800 text-center mb-6 flex justify-center items-center gap-2">
                        เข้าสู่ระบบ <Sparkles className="text-[#ffb020]" size={24} fill="#ffb020" />
                    </h2>
                    
                    {error && (
                        <div className="bg-red-100 text-red-700 font-bold p-4 rounded-xl mb-6 text-center border-2 border-red-200 animate-shake">
                            {error}
                        </div>
                    )}

                    <form className="space-y-5" onSubmit={handleSubmit}>
                        <div>
                            <input
                                name="email"
                                type="email"
                                required
                                className="w-full px-5 py-4 bg-gray-100 border-2 border-gray-200 rounded-xl text-lg font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#46178f] focus:bg-white transition-all shadow-inner"
                                placeholder="อีเมลหรือยูสเซอร์เนม"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <input
                                name="password"
                                type="password"
                                required
                                className="w-full px-5 py-4 bg-gray-100 border-2 border-gray-200 rounded-xl text-lg font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#46178f] focus:bg-white transition-all shadow-inner"
                                placeholder="รหัสผ่าน"
                                value={formData.password}
                                onChange={handleChange}
                            />
                            <div className="flex justify-end mt-2">
                                <Link to="/forgot-password" className="text-sm font-bold text-[#46178f] hover:text-[#320d6b] hover:underline">
                                    ลืมรหัสผ่าน?
                                </Link>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex justify-center items-center py-4 px-4 bg-[#3369ff] text-white rounded-xl text-xl font-bold shadow-[0_6px_0_#1e40af] hover:shadow-[0_4px_0_#1e40af] hover:translate-y-[2px] active:shadow-none active:translate-y-[6px] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'กำลังตรวจสอบ...' : 'เข้าสู่ระบบ'}
                        </button>
                    </form>

                    <div className="my-8 flex items-center justify-center space-x-4">
                        <div className="h-0.5 bg-gray-200 w-full rounded"></div>
                        <span className="text-gray-400 font-bold px-2 whitespace-nowrap">หรือ</span>
                        <div className="h-0.5 bg-gray-200 w-full rounded"></div>
                    </div>

                    <SocialLogin />

                </div>
            </div>
            
            <style>{`
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-5px); }
                    75% { transform: translateX(5px); }
                }
                .animate-shake {
                    animation: shake 0.4s ease-in-out;
                }
            `}</style>
        </div>
    );
};

export default Login;
