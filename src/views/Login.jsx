import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SocialLogin from '../components/SocialLogin';
import AuthShell from '../components/auth/AuthShell';
import { BookOpen, LockKeyhole, Mail, ShieldCheck } from 'lucide-react';

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
            const apiMessage = err.response?.data?.message;
            const mappedMessage = apiMessage === 'Email not found'
                ? 'ไม่พบบัญชีนี้ในระบบ กรุณาตรวจสอบอีเมลหรือสมัครสมาชิกก่อน'
                : apiMessage === 'Incorrect password'
                    ? 'รหัสผ่านไม่ถูกต้อง'
                    : apiMessage === 'Please login with Google'
                        ? 'บัญชีนี้สมัครผ่าน Google กรุณาเข้าสู่ระบบด้วย Google'
                        : 'เข้าสู่ระบบไม่สำเร็จ โปรดตรวจสอบอีเมลและรหัสผ่านของคุณ';
            setError(mappedMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthShell
            mode="login"
            eyebrow="กลับมาแล้วใช่ไหม"
            title="เข้าสู่ระบบก่อนนะ"
            description="ใส่อีเมลกับรหัสผ่านที่สมัครไว้ เดี๋ยวพาไปต่อที่โปรไฟล์และข้อสอบให้เลย"
            panelTitle="เข้าระบบยังไง"
            panelDescription="ใช้อีเมล + รหัสผ่าน ถ้าเคยสมัครด้วย Google ให้กดปุ่ม Google ด้านล่างได้เลย"
            highlights={[
                {
                    icon: <Mail size={18} />,
                    title: 'ล็อกอินด้วยอีเมล',
                    description: 'ใช้อีเมลเดียวกับตอนสมัครสมาชิก'
                },
                {
                    icon: <LockKeyhole size={18} />,
                    title: 'ลืมรหัสผ่านก็ไม่เป็นไร',
                    description: 'กด “ลืมรหัสผ่าน?” เพื่อรีเซ็ตได้'
                },
                {
                    icon: <BookOpen size={18} />,
                    title: 'กลับไปทำข้อสอบต่อ',
                    description: 'เข้าสู่ระบบแล้วกลับไปต่อได้ทันที'
                },
                {
                    icon: <ShieldCheck size={18} />,
                    title: 'ถ้ามีปัญหา เราบอกชัด',
                    description: 'เช่น อีเมลไม่เจอ รหัสผ่านผิด หรือบัญชีสมัครผ่าน Google'
                }
            ]}
            footer={<><span>ยังไม่มีบัญชี?</span><Link to="/register" className="font-black text-[#4c1d95] hover:underline">สมัครสมาชิก</Link></>}
        >
            <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                    <label className="mb-2 block text-sm font-black text-slate-700">อีเมล</label>
                    <input
                        name="email"
                        type="email"
                        required
                        className="w-full rounded-2xl border-2 border-slate-200 bg-slate-50 px-4 py-4 text-base font-semibold text-slate-700 placeholder:text-slate-400 focus:border-[#4c1d95] focus:bg-white focus:outline-none"
                        placeholder="กรอกอีเมลที่ใช้สมัครสมาชิก"
                        value={formData.email}
                        onChange={handleChange}
                    />
                    <p className="mt-2 text-xs font-medium text-slate-400">
                        ใช้อีเมลเดียวกับตอนสมัครสมาชิก
                    </p>
                </div>

                <div>
                    <label className="mb-2 block text-sm font-black text-slate-700">รหัสผ่าน</label>
                    <input
                        name="password"
                        type="password"
                        required
                        className="w-full rounded-2xl border-2 border-slate-200 bg-slate-50 px-4 py-4 text-base font-semibold text-slate-700 placeholder:text-slate-400 focus:border-[#4c1d95] focus:bg-white focus:outline-none"
                        placeholder="กรอกรหัสผ่าน"
                        value={formData.password}
                        onChange={handleChange}
                    />
                </div>

                <div className="flex justify-end">
                    <Link to="/forgot-password" className="text-sm font-black text-[#4c1d95] hover:underline">
                        ลืมรหัสผ่าน?
                    </Link>
                </div>

                {error && (
                    <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-600">
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full rounded-2xl bg-[#4c1d95] px-5 py-4 text-base font-black text-white shadow-[0_10px_30px_rgba(76,29,149,0.25)] transition hover:bg-[#5b21b6] disabled:opacity-50"
                >
                    {isLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
                </button>
            </form>

            <div className="mt-6">
                <SocialLogin />
            </div>
        </AuthShell>
    );
};

export default Login;
