import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import authService from '../../services/authService';
import {
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  ShieldCheck,
  Loader2,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import BrandLogo from '../../components/common/BrandLogo';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    try {
      await authService.resetPassword(token, password);
      setIsSuccess(true);
      toast.success('Password reset successfully');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="relative flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,#6d28d9_0%,#4c1d95_45%,#2e1065_100%)] px-4 py-12 font-sans">
        <div className="w-full max-w-md rounded-[2rem] border border-white/25 bg-white/95 p-8 text-center shadow-[0_24px_80px_rgba(13,6,41,0.45)] backdrop-blur-xl">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
            <AlertTriangle size={30} />
          </div>
          <h1
            className="text-xl font-black text-slate-900"
            style={{ fontFamily: "'Nunito', 'Sarabun', sans-serif" }}
          >
            Invalid Request
          </h1>
          <p className="mt-2 text-sm font-medium text-slate-600">
            Missing or expired password reset token.
          </p>
          <Link
            to="/login"
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-2xl bg-[#4c1d95] px-5 py-3 text-sm font-extrabold text-white transition hover:bg-[#5b21b6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
          >
            <ArrowLeft size={16} />
            Return to Login
          </Link>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="relative flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,#6d28d9_0%,#4c1d95_45%,#2e1065_100%)] px-4 py-12 font-sans">
        <div className="w-full max-w-md rounded-[2rem] border border-white/25 bg-white/95 p-8 text-center shadow-[0_24px_80px_rgba(13,6,41,0.45)] backdrop-blur-xl">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
            <CheckCircle2 size={32} />
          </div>
          <h1
            className="text-2xl font-black text-slate-900"
            style={{ fontFamily: "'Nunito', 'Sarabun', sans-serif" }}
          >
            Password Reset!
          </h1>
          <p className="mt-2 text-sm font-medium text-slate-600">
            Your password has been updated successfully. Redirecting you to login...
          </p>
          <Link
            to="/login"
            className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#4c1d95] px-4 py-3.5 text-sm font-extrabold text-white shadow-[0_10px_28px_rgba(76,29,149,0.28)] transition hover:bg-[#5b21b6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
          >
            Login Now
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top,#6d28d9_0%,#4c1d95_45%,#2e1065_100%)] px-4 py-12 font-sans">
      <div className="relative z-10 w-full max-w-md">
        <div className="mb-5 flex justify-center">
          <Link
            to="/"
            className="inline-flex rounded-full transition-transform duration-200 hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
          >
            <BrandLogo variant="glass" size="sm" />
          </Link>
        </div>

        <div className="rounded-[2rem] border border-white/25 bg-white/95 p-7 shadow-[0_24px_80px_rgba(13,6,41,0.45)] backdrop-blur-xl sm:p-8">
          <div className="mb-7 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-indigo-100 bg-indigo-50 text-indigo-600 shadow-xs">
              <Lock size={30} />
            </div>
            <h1
              className="text-2xl font-black text-slate-900"
              style={{ fontFamily: "'Nunito', 'Sarabun', sans-serif" }}
            >
              Set New Password
            </h1>
            <p className="mt-2 text-sm font-medium text-slate-600">
              Enter your new password below.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="reset-password" className="mb-1.5 block text-sm font-bold text-slate-700">
                New Password
              </label>
              <div className="relative">
                <Lock size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  id="reset-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-2xl border-2 border-slate-200 bg-slate-50 py-3.5 pl-10 pr-11 text-sm font-semibold text-slate-900 placeholder:text-slate-400 transition focus:border-[#4c1d95] focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-500 hover:bg-slate-200/70 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="reset-confirm-password" className="mb-1.5 block text-sm font-bold text-slate-700">
                Confirm New Password
              </label>
              <div className="relative">
                <ShieldCheck size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  id="reset-confirm-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="block w-full rounded-2xl border-2 border-slate-200 bg-slate-50 py-3.5 pl-10 pr-4 text-sm font-semibold text-slate-900 placeholder:text-slate-400 transition focus:border-[#4c1d95] focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#4c1d95] px-4 py-3.5 text-sm font-black text-white shadow-[0_10px_28px_rgba(76,29,149,0.28)] transition hover:bg-[#5b21b6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <Loader2 size={17} className="animate-spin" />
                  Resetting...
                </>
              ) : (
                'Reset Password'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
