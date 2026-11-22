import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Building2,
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  FileCheck2,
  ArrowRight,
  ArrowLeft,
  AtSign,
  Hash,
  Loader2,
  Sparkles,
} from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import BrandLogo from '../../components/common/BrandLogo';

const BusinessRegister = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    businessName: '',
    taxId: '',
    businessHandle: '',
    contactName: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreedToTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (!formData.agreedToTerms) {
      toast.error('คุณต้องยอมรับข้อตกลงในการสร้างเนื้อหาเพื่อดำเนินการต่อ');
      return;
    }

    setLoading(true);
    try {
      // Using the standard register endpoint with sponsor role
      await api.post('/auth/register', {
        display_name: formData.contactName,
        email: formData.email,
        password: formData.password,
        role: 'sponsor',
        business_name: formData.businessName,
        tax_id: formData.taxId,
      });
      toast.success('Registration successful! Please login.');
      navigate('/auth/business/login');
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,#4f46e5_0%,#3b0764_50%,#1e1b4b_100%)] px-4 py-10 font-sans text-slate-800 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -left-24 top-12 h-72 w-72 rounded-full bg-fuchsia-500/20 blur-3xl" />
        <div className="absolute -right-24 bottom-12 h-80 w-80 rounded-full bg-indigo-400/20 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-2xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link
            to="/"
            className="inline-flex items-center rounded-full transition-transform duration-200 hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
          >
            <BrandLogo variant="glass" size="sm" badge="BUSINESS" />
          </Link>

          <Link
            to="/"
            className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold text-white backdrop-blur-md transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
          >
            <ArrowLeft size={14} />
            Back to Platform Home
          </Link>
        </div>

        <div className="rounded-[2rem] border border-white/25 bg-white/95 p-6 shadow-[0_24px_80px_rgba(13,6,41,0.45)] backdrop-blur-xl sm:p-9">
          <div className="mb-7 text-center">
            <div className="mx-auto mb-3 inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-3.5 py-1 text-xs font-extrabold uppercase tracking-wider text-indigo-700">
              <Sparkles size={13} />
              Sponsor & Educator Portal
            </div>
            <h1
              className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl"
              style={{ fontFamily: "'Nunito', 'Sarabun', sans-serif" }}
            >
              Sign up for Business
            </h1>
            <p className="mt-1.5 text-sm font-medium text-slate-600">
              Create your sponsor account to publish lessons, manage ads, and reach thousands of learners.
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Business Information Section */}
            <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4 sm:p-5">
              <h2 className="mb-4 flex items-center gap-2 text-sm font-extrabold text-indigo-950">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white">
                  <Building2 size={15} />
                </span>
                Business Information
              </h2>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label htmlFor="businessName" className="mb-1.5 block text-xs font-bold text-slate-700 sm:text-sm">
                    Business / Brand Name
                  </label>
                  <div className="relative">
                    <Building2 size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      id="businessName"
                      type="text"
                      name="businessName"
                      required
                      className="block w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      placeholder="My Awesome Brand"
                      value={formData.businessName}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="businessHandle" className="mb-1.5 block text-xs font-bold text-slate-700 sm:text-sm">
                    Business Handle (ID)
                  </label>
                  <div className="relative">
                    <AtSign size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      id="businessHandle"
                      type="text"
                      name="businessHandle"
                      required
                      className="block w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      placeholder="brand_handle"
                      value={formData.businessHandle}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="taxId" className="mb-1.5 block text-xs font-bold text-slate-700 sm:text-sm">
                    Tax ID (Optional)
                  </label>
                  <div className="relative">
                    <Hash size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      id="taxId"
                      type="text"
                      name="taxId"
                      className="block w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      placeholder="1234567890123"
                      value={formData.taxId}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Person Section */}
            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 sm:p-5">
              <h2 className="mb-4 flex items-center gap-2 text-sm font-extrabold text-slate-900">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-slate-800 text-white">
                  <User size={15} />
                </span>
                Contact Person & Account
              </h2>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="contactName" className="mb-1.5 block text-xs font-bold text-slate-700 sm:text-sm">
                    Contact Name
                  </label>
                  <div className="relative">
                    <User size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      id="contactName"
                      type="text"
                      name="contactName"
                      required
                      className="block w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      placeholder="ชื่อผู้ติดต่อ"
                      value={formData.contactName}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="phone" className="mb-1.5 block text-xs font-bold text-slate-700 sm:text-sm">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      id="phone"
                      type="tel"
                      name="phone"
                      required
                      className="block w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      placeholder="08X-XXX-XXXX"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="email" className="mb-1.5 block text-xs font-bold text-slate-700 sm:text-sm">
                    Email Address (Username)
                  </label>
                  <div className="relative">
                    <Mail size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      id="email"
                      type="email"
                      name="email"
                      required
                      className="block w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      placeholder="you@company.com"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="mb-1.5 block text-xs font-bold text-slate-700 sm:text-sm">
                    Password
                  </label>
                  <div className="relative">
                    <Lock size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      required
                      className="block w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-10 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="mb-1.5 block text-xs font-bold text-slate-700 sm:text-sm">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      id="confirmPassword"
                      type={showPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      required
                      className="block w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Creator Agreement */}
            <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <input
                id="agreedToTerms"
                name="agreedToTerms"
                type="checkbox"
                required
                checked={formData.agreedToTerms}
                onChange={handleChange}
                className="mt-0.5 h-4 w-4 cursor-pointer rounded border-slate-300 text-indigo-600 focus:ring-2 focus:ring-indigo-500"
              />
              <div className="text-sm">
                <label htmlFor="agreedToTerms" className="flex cursor-pointer items-center gap-1.5 font-bold text-slate-800">
                  <FileCheck2 size={15} className="text-indigo-600" />
                  ข้าพเจ้ายอมรับข้อตกลงในการเป็นผู้สร้างเนื้อหา (Creator Agreement)
                </label>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">
                  ข้าพเจ้ายอมรับว่าจะเป็นผู้ดูแลและรับผิดชอบต่อเนื้อหาทั้งหมดที่เกิดขึ้นในเพจแต่เพียงผู้เดียว และจะไม่นำเนื้อหาที่ละเมิดลิขสิทธิ์หรือผิดกฎหมายมาเผยแพร่
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 px-5 py-3.5 text-sm font-extrabold text-white shadow-[0_12px_30px_rgba(79,70,229,0.3)] transition-all duration-200 hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Registering...
                </>
              ) : (
                <>
                  Create Business Account
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-7 border-t border-slate-200 pt-6">
            <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
              <span className="text-sm font-medium text-slate-600">Already have an account?</span>
              <Link
                to="/auth/business/login"
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-5 py-2.5 text-sm font-bold text-slate-800 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 sm:w-auto"
              >
                Sign in
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessRegister;
