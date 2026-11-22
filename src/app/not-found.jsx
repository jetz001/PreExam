import Link from 'next/link';
import {
  Compass,
  Home,
  BookOpenCheck,
  Trophy,
  Sparkles,
  SearchX,
  ArrowRight,
} from 'lucide-react';
import BrandLogo from '../components/common/BrandLogo';

export const metadata = {
  title: 'ไม่พบหน้าที่ต้องการ (404)',
};

const QUICK_ROUTES = [
  {
    href: '/exam',
    label: 'คลังข้อสอบเดี่ยว',
    desc: 'ซ้อมทำข้อสอบพร้อมเฉลยละเอียด',
    icon: BookOpenCheck,
    accent: 'from-rose-500/25 to-pink-500/20 text-rose-200 border-rose-400/25',
  },
  {
    href: '/lobby',
    label: 'ห้องสอบกลุ่ม',
    desc: 'แข่งทำข้อสอบแบบเรียลไทม์',
    icon: Trophy,
    accent: 'from-cyan-500/25 to-sky-500/20 text-cyan-200 border-cyan-400/25',
  },
  {
    href: '/learning-center',
    label: 'ศูนย์การเรียนรู้',
    desc: 'คลังบทเรียนและเพจติวเตอร์',
    icon: Compass,
    accent: 'from-amber-400/25 to-orange-500/20 text-amber-200 border-amber-400/25',
  },
];

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top,#4f46e5_0%,#2e1065_48%,#0f172a_100%)] px-4 py-12 text-white">
      {/* Ambient gradient orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-fuchsia-500/20 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-indigo-500/25 blur-3xl" />
        <div className="absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full bg-violet-500/15 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-2xl">
        <div className="mb-6 flex justify-center">
          <Link
            href="/"
            className="inline-flex rounded-full px-2 py-1 transition-transform duration-200 hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
          >
            <BrandLogo variant="glass" size="md" badge="404" />
          </Link>
        </div>

        <section className="glass-panel rounded-[2rem] border border-white/20 bg-slate-900/45 p-6 text-center shadow-[0_28px_80px_rgba(15,23,42,0.55)] sm:p-10">
          <div className="mx-auto mb-5 inline-flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-300/35 bg-gradient-to-br from-indigo-500/30 via-violet-500/30 to-fuchsia-500/30 text-amber-300 shadow-[0_12px_32px_rgba(124,58,237,0.35)]">
            <SearchX size={32} />
          </div>

          <div className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3.5 py-1 text-xs font-extrabold uppercase tracking-wider text-amber-300">
            <Sparkles size={13} />
            Error 404 • Route Not Found
          </div>

          <h1
            className="mt-4 text-3xl font-black tracking-tight text-white sm:text-5xl"
            style={{ fontFamily: "'Nunito', 'Sarabun', sans-serif" }}
          >
            อุ๊ย! ไม่พบหน้าที่คุณกำลังค้นหา
          </h1>

          <p className="mx-auto mt-3 max-w-lg text-sm font-medium leading-relaxed text-slate-200 sm:text-base">
            ลิงก์นี้อาจถูกย้าย เปลี่ยนชื่อ หรือไม่มีอยู่ในระบบแล้ว ลองกลับไปที่หน้าแรกหรือเลือกโหมดยอดนิยมด้านล่างได้เลย
          </p>

          <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/"
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-300 px-6 py-3.5 text-sm font-black text-slate-950 shadow-[0_12px_30px_rgba(251,191,36,0.35)] transition-all duration-200 hover:-translate-y-0.5 hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:w-auto"
            >
              <Home size={18} />
              กลับหน้าแรก PreExam!
            </Link>
            <Link
              href="/exam"
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/25 bg-white/10 px-6 py-3.5 text-sm font-bold text-white backdrop-blur-md transition-all duration-200 hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 sm:w-auto"
            >
              <Compass size={18} />
              ไปหน้าคลังข้อสอบ
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-3 text-left sm:grid-cols-3">
            {QUICK_ROUTES.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:border-white/30 hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`inline-flex h-9 w-9 items-center justify-center rounded-xl border bg-gradient-to-br ${item.accent}`}
                    >
                      <Icon size={18} />
                    </span>
                    <ArrowRight
                      size={16}
                      className="text-slate-300 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-white"
                    />
                  </div>
                  <div className="mt-3 text-sm font-extrabold text-white">{item.label}</div>
                  <div className="mt-0.5 text-xs font-medium text-slate-300">{item.desc}</div>
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
