import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import authService from '../../services/authService';
import { Mail, ArrowLeft, CheckCircle2, Send, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import BrandLogo from '../../components/common/BrandLogo';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await authService.forgotPassword(email);
      setIsSubmitted(true);
      toast.success('Reset link sent to your email');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send reset link');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top,#6d28d9_0%,#4c1d95_45%,#2e1065_100%)] px-4 py-12 font-sans">
        <div className="w-full max-w-md rounded-[2rem] border border-white/25 bg-white/95 p-8 text-center shadow-[0_24px_80px_rgba(13,6,41,0.45)] backdrop-blur-xl">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 shadow-sm">
            <CheckCircle2 size={32} />
          </div>
          <h1
            className="text-2xl font-black text-slate-900"
            style={{ fontFamily: "'Nunito', 'Sarabun', sans-serif" }}
          >
            Check your email
          </h1>
          <p className="mt-2.5 text-sm font-medium leading-relaxed text-slate-600">
            We have sent a password reset link to{' '}
            <span className="font-bold text-slate-900">{email}</span>. Please check your inbox (and spam folder).
          </p>
          <Link
            to="/login"
            className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#4c1d95] px-4 py-3.5 text-sm font-extrabold text-white shadow-[0_10px_28px_rgba(76,29,149,0.28)] transition hover:bg-[#5b21b6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
          >
            <ArrowLeft size={16} />
            Return to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top,#6d28d9_0%,#4c1d95_45%,#2e1065_100%)] px-4 py-12 font-sans">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -left-20 top-16 h-64 w-64 rounded-full bg-fuchsia-500/20 blur-3xl" />
        <div className="absolute -right-20 bottom-16 h-72 w-72 rounded-full bg-indigo-400/20 blur-3xl" />
      </div>

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
          <div className="mb-6">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm font-bold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
            >
              <ArrowLeft size={16} />
              Back to Login
            </Link>
          </div>

          <div className="mb-7 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-indigo-100 bg-indigo-50 text-indigo-600 shadow-xs">
              <Mail size={30} />
            </div>
            <h1
              className="text-2xl font-black text-slate-900"
              style={{ fontFamily: "'Nunito', 'Sarabun', sans-serif" }}
            >
              Forgot Password?
            </h1>
            <p className="mt-2 text-sm font-medium text-slate-600">
              No worries! Enter your email and we&apos;ll send you reset instructions.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="forgot-email" className="mb-1.5 block text-sm font-bold text-slate-700">
                Email Address
              </label>
              <div className="relative">
                <Mail size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  id="forgot-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-2xl border-2 border-slate-200 bg-slate-50 py-3.5 pl-10 pr-4 text-sm font-semibold text-slate-900 placeholder:text-slate-400 transition focus:border-[#4c1d95] focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                  placeholder="name@example.com"
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
                  Sending...
                </>
              ) : (
                <>
                  <Send size={16} />
                  Send Reset Link
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
