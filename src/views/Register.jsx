import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SocialLogin from '../components/SocialLogin';
import AuthShell from '../components/auth/AuthShell';
import { BadgeCheck, Mail, Sparkles, UserRound } from 'lucide-react';

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
            setError('รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน');
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
            const apiMessage = err.response?.data?.message || '';
            let mappedMessage = 'สมัครสมาชิกไม่สำเร็จ กรุณาตรวจสอบข้อมูลแล้วลองใหม่อีกครั้ง';
            
            if (apiMessage === 'Email already in use' || apiMessage === 'Email already registered') {
                mappedMessage = 'อีเมลนี้ถูกใช้งานแล้ว กรุณาเข้าสู่ระบบหรือใช้อีเมลอื่น';
            } else if (apiMessage === 'invalid_params') {
                mappedMessage = 'ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบรูปแบบอีเมลและความยาวรหัสผ่าน (อย่างน้อย 6 ตัวอักษร)';
            }
            
            setError(mappedMessage);
        }
    };

    return (
        <AuthShell
            mode="register"
            eyebrow="สมัครแป๊บเดียว"
            title="สมัครสมาชิกใหม่"
            description="กรอกชื่อ อีเมล และรหัสผ่าน แล้วเริ่มทำข้อสอบได้เลย"
            panelTitle="หลังสมัครเสร็จ"
            panelDescription="ระบบจะพาเข้าหน้าโปรไฟล์ทันที และใช้อีเมลนี้สำหรับเข้าสู่ระบบครั้งหน้า"
            highlights={[
                {
                    icon: <UserRound size={18} />,
                    title: 'ชื่อที่ใช้แสดง',
                    description: 'ไว้โชว์ในระบบ เปลี่ยนทีหลังได้'
                },
                {
                    icon: <Mail size={18} />,
                    title: 'อีเมลใช้เข้าสู่ระบบ',
                    description: 'ใช้เมลนี้ล็อกอินครั้งหน้า'
                },
                {
                    icon: <BadgeCheck size={18} />,
                    title: 'ถ้าอีเมลซ้ำ เราจะแจ้ง',
                    description: 'แล้วบอกให้ไปหน้าเข้าสู่ระบบ หรือใช้อีเมลอื่น'
                },
                {
                    icon: <Sparkles size={18} />,
                    title: 'ไม่สับสนกับหน้าล็อกอิน',
                    description: 'โทนสีและคำอธิบายแยกชัด'
                }
            ]}
            footer={<><span>มีบัญชีอยู่แล้ว?</span><Link to="/login" className="font-black text-[#15803d] hover:underline">เข้าสู่ระบบ</Link></>}
        >
            <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                    <label className="mb-2 block text-sm font-black text-slate-700">ชื่อที่ใช้แสดง</label>
                    <input
                        name="display_name"
                        type="text"
                        required
                        className="w-full rounded-2xl border-2 border-slate-200 bg-slate-50 px-4 py-4 text-base font-semibold text-slate-700 placeholder:text-slate-400 focus:border-[#15803d] focus:bg-white focus:outline-none"
                        placeholder="ชื่อเล่น/ชื่อที่อยากให้แสดง"
                        value={formData.display_name}
                        onChange={handleChange}
                    />
                </div>

                <div>
                    <label className="mb-2 block text-sm font-black text-slate-700">อีเมล</label>
                    <input
                        name="email"
                        type="email"
                        required
                        className="w-full rounded-2xl border-2 border-slate-200 bg-slate-50 px-4 py-4 text-base font-semibold text-slate-700 placeholder:text-slate-400 focus:border-[#15803d] focus:bg-white focus:outline-none"
                        placeholder="กรอกอีเมลสำหรับใช้เข้าสู่ระบบ"
                        value={formData.email}
                        onChange={handleChange}
                    />
                    <p className="mt-2 text-xs font-medium text-slate-400">
                        ใช้อีเมลนี้สำหรับเข้าสู่ระบบภายหลัง
                    </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <label className="mb-2 block text-sm font-black text-slate-700">รหัสผ่าน</label>
                        <input
                            name="password"
                            type="password"
                            required
                            className="w-full rounded-2xl border-2 border-slate-200 bg-slate-50 px-4 py-4 text-base font-semibold text-slate-700 placeholder:text-slate-400 focus:border-[#15803d] focus:bg-white focus:outline-none"
                            placeholder="อย่างน้อย 8 ตัวอักษร"
                            value={formData.password}
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-black text-slate-700">ยืนยันรหัสผ่าน</label>
                        <input
                            name="confirmPassword"
                            type="password"
                            required
                            className="w-full rounded-2xl border-2 border-slate-200 bg-slate-50 px-4 py-4 text-base font-semibold text-slate-700 placeholder:text-slate-400 focus:border-[#15803d] focus:bg-white focus:outline-none"
                            placeholder="กรอกรหัสผ่านซ้ำอีกครั้ง"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                {error && (
                    <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-600">
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    className="w-full rounded-2xl bg-[#15803d] px-5 py-4 text-base font-black text-white shadow-[0_10px_30px_rgba(21,128,61,0.22)] transition hover:bg-[#166534]"
                >
                    สร้างบัญชีผู้ใช้
                </button>
            </form>

            <div className="mt-6">
                <SocialLogin />
            </div>
        </AuthShell>
    );
};

export default Register;
