import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SocialLogin from '../components/SocialLogin';
import { Sparkles } from 'lucide-react';
import HomeNavbar from '../components/HomeNavbar';

const Register = () => {
    const [formData, setFormData] = useState({
        display_name: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { register } = useAuth();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        try {
            await register({
                display_name: formData.display_name,
                email: formData.email,
                password: formData.password,
            });
            navigate('/profile');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#46178f] relative overflow-hidden font-sans py-12">
            <HomeNavbar />
            
            {/* Playful Floating Shapes Background (Kahoot Style) */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[5%] right-[5%] w-32 h-32 bg-[#ffb020] rounded-full opacity-60 animate-[bounce_9s_infinite] blur-[2px]"></div>
                <div className="absolute top-[70%] left-[10%] w-40 h-40 bg-[#33ffaa] rounded-3xl rotate-[20deg] opacity-50 animate-[spin_12s_linear_infinite] blur-[2px]"></div>
                <div className="absolute bottom-[5%] right-[20%] w-20 h-20 bg-[#ff3355] rounded-lg rotate-45 opacity-80 animate-[bounce_7s_infinite_reverse] blur-[2px]"></div>
                <div className="absolute top-[30%] left-[25%] w-0 h-0 border-l-[35px] border-l-transparent border-r-[35px] border-r-transparent border-b-[60px] border-b-[#00c8ff] rotate-[-15deg] opacity-70 animate-[pulse_5s_infinite] blur-[2px]"></div>
            </div>

            <div className="relative z-10 w-full max-w-md px-6 mt-8">
                
                {/* Logo Area */}
                <div className="flex flex-col items-center justify-center mb-6">
                    <div className="w-20 h-20 bg-white rounded-3xl shadow-[0_8px_0_#2b0761] flex items-center justify-center mb-4 transform rotate-3 hover:-rotate-3 transition-transform duration-300">
                        <span className="text-4xl">🚀</span>
                    </div>
                    <h1 className="text-4xl font-black text-white drop-shadow-[0_4px_4px_rgba(0,0,0,0.3)] tracking-wide">
                        สร้างบัญชี<span className="text-[#33ffaa]">ใหม่</span>
                    </h1>
                </div>

                {/* Register Card */}
                <div className="bg-white rounded-[2rem] shadow-[0_12px_0_rgba(0,0,0,0.2)] p-8">
                    <h2 className="text-xl font-bold text-gray-800 text-center mb-6 flex justify-center items-center gap-2">
                        เข้าร่วมสนุกกับเรา! <Sparkles className="text-[#ff3355]" size={24} fill="#ff3355" />
                    </h2>
                    
                    {error && (
                        <div className="bg-red-100 text-red-700 font-bold p-4 rounded-xl mb-6 text-center border-2 border-red-200 animate-shake">
                            {error}
                        </div>
                    )}

                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <div>
                            <input
                                name="display_name"
                                type="text"
                                required
                                className="w-full px-5 py-4 bg-gray-100 border-2 border-gray-200 rounded-xl text-lg font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#46178f] focus:bg-white transition-all shadow-inner"
                                placeholder="ชื่อที่ใช้แสดง (Display Name)"
                                value={formData.display_name}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <input
                                name="email"
                                type="email"
                                required
                                className="w-full px-5 py-4 bg-gray-100 border-2 border-gray-200 rounded-xl text-lg font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#46178f] focus:bg-white transition-all shadow-inner"
                                placeholder="อีเมล (Email)"
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
                                placeholder="รหัสผ่าน (Password)"
                                value={formData.password}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <input
                                name="confirmPassword"
                                type="password"
                                required
                                className="w-full px-5 py-4 bg-gray-100 border-2 border-gray-200 rounded-xl text-lg font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#46178f] focus:bg-white transition-all shadow-inner"
                                placeholder="ยืนยันรหัสผ่าน"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full mt-6 flex justify-center items-center py-4 px-4 bg-[#28a745] text-white rounded-xl text-xl font-bold shadow-[0_6px_0_#1e7e34] hover:shadow-[0_4px_0_#1e7e34] hover:translate-y-[2px] active:shadow-none active:translate-y-[6px] transition-all"
                        >
                            สมัครสมาชิกเลย!
                        </button>
                    </form>

                    <div className="my-8 flex items-center justify-center space-x-4">
                        <div className="h-0.5 bg-gray-200 w-full rounded"></div>
                        <span className="text-gray-400 font-bold px-2 whitespace-nowrap">หรือสมัครผ่าน</span>
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

export default Register;
