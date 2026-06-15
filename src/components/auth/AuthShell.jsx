import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';

const AuthShell = ({
    mode = 'login',
    eyebrow,
    title,
    description,
    panelTitle,
    panelDescription,
    highlights = [],
    children,
    footer,
}) => {
    const isLogin = mode === 'login';

    return (
        <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,#6d28d9_0%,#4c1d95_45%,#2e1065_100%)] font-sans">
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute left-[4%] top-[10%] h-24 w-24 rounded-full bg-pink-500/35 blur-[2px]" />
                <div className="absolute right-[8%] top-[18%] h-28 w-28 rounded-3xl bg-cyan-400/30 rotate-12 blur-[2px]" />
                <div className="absolute left-[10%] bottom-[12%] h-36 w-36 rounded-[2rem] bg-emerald-300/20 rotate-[16deg] blur-[2px]" />
                <div className="absolute bottom-[14%] right-[16%] h-20 w-20 rounded-2xl bg-amber-300/30 rotate-45 blur-[2px]" />
            </div>

            <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl items-center px-4 py-24 sm:px-6 lg:px-8">
                <div className="grid w-full gap-8 lg:grid-cols-[1.05fr_minmax(430px,520px)] lg:items-center">
                    <section className="order-2 lg:order-1">
                        <div className="mx-auto max-w-xl text-white lg:mx-0">
                            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-bold backdrop-blur-md">
                                <Sparkles size={16} className="text-yellow-300" />
                                {eyebrow}
                            </div>

                            <h1 className="mt-6 text-4xl font-black leading-tight drop-shadow-md sm:text-5xl">
                                {title}
                            </h1>

                            <p className="mt-4 max-w-lg text-base font-medium leading-7 text-white/80 sm:text-lg">
                                {description}
                            </p>

                            <div className="mt-8 grid gap-3 sm:grid-cols-2">
                                {highlights.map((item) => (
                                    <div
                                        key={item.title}
                                        className="rounded-3xl border border-white/15 bg-white/10 p-4 backdrop-blur-md"
                                    >
                                        <div className="mb-3 inline-flex rounded-2xl bg-white/15 p-2.5 text-yellow-200">
                                            {item.icon}
                                        </div>
                                        <div className="text-base font-black">{item.title}</div>
                                        <div className="mt-1 text-sm font-medium leading-6 text-white/75">
                                            {item.description}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-8 rounded-[2rem] border border-white/15 bg-white/10 p-5 backdrop-blur-md">
                                <div className="flex items-start gap-3">
                                    <div className="mt-0.5 rounded-full bg-emerald-400/15 p-1 text-emerald-300">
                                        <CheckCircle2 size={18} />
                                    </div>
                                    <div>
                                        <div className="text-sm font-black text-white">{panelTitle}</div>
                                        <div className="mt-1 text-sm font-medium leading-6 text-white/75">
                                            {panelDescription}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="order-1 lg:order-2">
                        <div className="mx-auto w-full max-w-xl rounded-[2rem] border border-white/20 bg-white/95 p-5 shadow-[0_20px_80px_rgba(13,6,41,0.35)] backdrop-blur-xl sm:p-7">
                            <div className="mb-6 flex items-center justify-between gap-4">
                                <Link
                                    to="/"
                                    className="inline-flex items-center gap-2 rounded-full bg-[#5b21b6] px-4 py-2 text-sm font-black text-white shadow-sm"
                                >
                                    <span className="text-base">🎯</span>
                                    PreExam
                                </Link>
                                <div className="text-right">
                                    <div className="text-xs font-bold uppercase tracking-[0.2em] text-violet-400">
                                        Auth
                                    </div>
                                    <div className="text-sm font-semibold text-slate-500">
                                        {isLogin ? 'เข้าสู่ระบบเพื่อกลับไปเรียนต่อ' : 'สร้างบัญชีเพื่อเริ่มใช้งาน'}
                                    </div>
                                </div>
                            </div>

                            <div className="mb-6 grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1.5">
                                <Link
                                    to="/login"
                                    className={`rounded-xl px-4 py-3 text-center text-sm font-black transition-all ${
                                        isLogin
                                            ? 'bg-[#4c1d95] text-white shadow-sm'
                                            : 'text-slate-500 hover:text-[#4c1d95]'
                                    }`}
                                >
                                    เข้าสู่ระบบ
                                </Link>
                                <Link
                                    to="/register"
                                    className={`rounded-xl px-4 py-3 text-center text-sm font-black transition-all ${
                                        !isLogin
                                            ? 'bg-[#15803d] text-white shadow-sm'
                                            : 'text-slate-500 hover:text-[#15803d]'
                                    }`}
                                >
                                    สมัครสมาชิก
                                </Link>
                            </div>

                            <div className="mb-6">
                                <h2 className="text-2xl font-black text-slate-900">
                                    {isLogin ? 'กลับมาเรียนต่อกัน' : 'สร้างบัญชีใหม่'}
                                </h2>
                                <p className="mt-2 text-sm font-medium leading-6 text-slate-500">
                                    {isLogin
                                        ? 'ใช้อีเมลที่สมัครไว้เพื่อเข้าสู่ระบบ และกลับไปยังโปรไฟล์หรือข้อสอบของคุณ'
                                        : 'กรอกข้อมูลให้ครบ แล้วใช้อีเมลนี้เข้าสู่ระบบในครั้งถัดไป'}
                                </p>
                            </div>

                            {children}

                            {footer && (
                                <div className="mt-6 flex items-center justify-center gap-2 border-t border-slate-100 pt-5 text-sm font-medium text-slate-500">
                                    {footer}
                                    <ArrowRight size={15} className="text-slate-400" />
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default AuthShell;
