import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SocialLogin from '../components/SocialLogin';
import AuthShell from '../components/auth/AuthShell';
import {
  AlertCircle,
  BadgeCheck,
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  Mail,
  Sparkles,
  UserRound,
} from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    display_name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (formData.password !== formData.confirmPassword) {
      setError('รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน');
      return;
    }
    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
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
          description: 'ไว้โชว์ในระบบ เปลี่ยนทีหลังได้',
        },
        {
          icon: <Mail size={18} />,
          title: 'อีเมลใช้เข้าสู่ระบบ',
          description: 'ใช้เมลนี้ล็อกอินครั้งหน้า',
        },
        {
          icon: <BadgeCheck size={18} />,
          title: 'ถ้าอีเมลซ้ำ เราจะแจ้ง',
          description: 'แล้วบอกให้ไปหน้าเข้าสู่ระบบ หรือใช้อีเมลอื่น',
        },
        {
          icon: <Sparkles size={18} />,
          title: 'ไม่สับสนกับหน้าล็อกอิน',
          description: 'โทนสีและคำอธิบายแยกชัด',
        },
      ]}
      footer={
        <>
          <span>มีบัญชีอยู่แล้ว?</span>
          <Link
            to="/login"
            className="rounded-md font-black text-[#15803d] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#15803d]"
          >
            เข้าสู่ระบบ
          </Link>
        </>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="register-display-name" className="mb-2 block text-sm font-black text-slate-700">
            ชื่อที่ใช้แสดง
          </label>
          <div className="relative">
            <UserRound
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
            />
            <input
              id="register-display-name"
              name="display_name"
              type="text"
              required
              className="w-full rounded-2xl border-2 border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-base font-semibold text-slate-800 placeholder:text-slate-400 transition focus:border-[#15803d] focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
              placeholder="ชื่อเล่น/ชื่อที่อยากให้แสดง"
              value={formData.display_name}
              onChange={handleChange}
            />
          </div>
        </div>

        <div>
          <label htmlFor="register-email" className="mb-2 block text-sm font-black text-slate-700">
            อีเมล
          </label>
          <div className="relative">
            <Mail
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
            />
            <input
              id="register-email"
              name="email"
              type="email"
              required
              className="w-full rounded-2xl border-2 border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-base font-semibold text-slate-800 placeholder:text-slate-400 transition focus:border-[#15803d] focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
              placeholder="กรอกอีเมลสำหรับใช้เข้าสู่ระบบ"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
          <p className="mt-1.5 text-xs font-semibold text-slate-500">
            ใช้อีเมลนี้สำหรับเข้าสู่ระบบภายหลัง
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="register-password" className="mb-2 block text-sm font-black text-slate-700">
              รหัสผ่าน
            </label>
            <div className="relative">
              <LockKeyhole
                size={17}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
              />
              <input
                id="register-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                className="w-full rounded-2xl border-2 border-slate-200 bg-slate-50 py-3.5 pl-10 pr-11 text-base font-semibold text-slate-800 placeholder:text-slate-400 transition focus:border-[#15803d] focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
                placeholder="อย่างน้อย 6 ตัวอักษร"
                value={formData.password}
                onChange={handleChange}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-xl p-1.5 text-slate-500 transition hover:bg-slate-200/70 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#15803d]"
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="register-confirm-password" className="mb-2 block text-sm font-black text-slate-700">
              ยืนยันรหัสผ่าน
            </label>
            <div className="relative">
              <LockKeyhole
                size={17}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
              />
              <input
                id="register-confirm-password"
                name="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                required
                className="w-full rounded-2xl border-2 border-slate-200 bg-slate-50 py-3.5 pl-10 pr-4 text-base font-semibold text-slate-800 placeholder:text-slate-400 transition focus:border-[#15803d] focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
                placeholder="กรอกรหัสผ่านซ้ำอีกครั้ง"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="flex items-start gap-2.5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700"
          >
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#15803d] px-5 py-4 text-base font-black text-white shadow-[0_10px_30px_rgba(21,128,61,0.22)] transition hover:bg-[#166534] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#15803d] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              กำลังสร้างบัญชี...
            </>
          ) : (
            'สร้างบัญชีผู้ใช้'
          )}
        </button>
      </form>

      <div className="mt-6">
        <SocialLogin />
      </div>
    </AuthShell>
  );
};

export default Register;
