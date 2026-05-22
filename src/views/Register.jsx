import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SocialLogin from '../components/SocialLogin';
import { Sparkles } from 'lucide-react';

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
            
            {/* Playful Floating Shapes Background (Kahoot Style) */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[5%] right-[5%] w-32 h-32 bg-[#ffb020] rounded-full opacity-60 animate-[bounce_9s_infinite] blur-[2px]"></div>
                <div className="absolute top-[70%] left-[10%] w-40 h-40 bg-[#33ffaa] rounded-3xl rotate-[20deg] opacity-50 animate-[spin_12s_linear_infinite] blur-[2px]"></div>
                <div className="absolute bottom-[5%] right-[20%] w-20 h-20 bg-[#ff3355] rounded-lg rotate-45 opacity-80 animate-[bounce_7s_infinite] blur-[2px]"></div>
                <div className="absolute top-[30%] left-[25%] w-0 h-0 border-l-[35px] border-l-transparent border-r-[35px] border-r-transparent border-b-[60px] border-b-[#00c8ff] rotate-[-15deg] opacity-70 animate-[pulse_5s_infinite] blur-[2px]"></div>
            </div>

            <div className="relative z-10 w-full max-w-md px-6 mt-8">
                
                {/* Logo Area */}
                <div className="flex flex-col items-center justify-center mb-6">
                    <div className="bg-white p-4 rounded-2xl shadow-[0_6px_0_0_rgba(0,0,0,0.2)] rotate-[5deg] mb-4">
                        <h1 className="text-4xl font-extrabold text-[#e21b3c] tracking-tight flex items-center gap-2">
                            🚀 <Sparkles className="text-[#ffb020]" size={28} />
                        </h1>
                    </div>
                    <p className="text-white font-bold text-2xl drop-shadow-md flex items-center gap-2">
                        สร้างบัญชีใหม่
                    </p>
                </div>

                {/* Register Card */}
                <div className="bg-white rounded-[20px] p-6 shadow-[0_8px_0_0_rgba(0,0,0,0.2)] border-2 border-gray-100">
                    <div className="text-center mb-6">
                        <p className="text-gray-700 font-bold text-lg">เข้าร่วมสนุกกับเรา! ✨</p>
                    </div>

                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <div>
                            <input
                                name="display_name"
                                type="text"
                                required
                                className="w-full px-4 py-3 bg-gray-100 border-2 border-gray-200 rounded-xl font-bold text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#46178f] focus:bg-white transition-colors"
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
                                className="w-full px-4 py-3 bg-gray-100 border-2 border-gray-200 rounded-xl font-bold text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#46178f] focus:bg-white transition-colors"
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
                                className="w-full px-4 py-3 bg-gray-100 border-2 border-gray-200 rounded-xl font-bold text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#46178f] focus:bg-white transition-colors"
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
                                className="w-full px-4 py-3 bg-gray-100 border-2 border-gray-200 rounded-xl font-bold text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#46178f] focus:bg-white transition-colors"
                                placeholder="ยืนยันรหัสผ่าน"
                                value={formData.confirmPassword}
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
                            className="w-full mt-2 py-4 px-4 rounded-xl shadow-[0_6px_0_0_#1e6c09] text-xl font-black text-white bg-[#26890c] hover:bg-[#227a0b] hover:-translate-y-1 hover:shadow-[0_8px_0_0_#1e6c09] active:translate-y-2 active:shadow-none transition-all uppercase tracking-widest"
                        >
                            สมัครสมาชิกเลย!
                        </button>
                    </form>

                    <div className="mt-6 pt-4 border-t-2 border-dashed border-gray-200">
                        <SocialLogin />
                    </div>

                </div>
            </div>
            
        </div>
    );
};

export default Register;
