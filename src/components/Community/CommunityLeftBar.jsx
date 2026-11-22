import React from 'react';
import { Link } from 'react-router-dom';
import {
    User,
    Crown,
    FileCheck2,
    Trophy,
    Gamepad2,
    Newspaper,
    BookOpen,
    Bookmark,
    MessageSquare,
    ShieldCheck,
    Sparkles,
    Compass,
    LogIn,
    ChevronRight,
} from 'lucide-react';
import { isPremiumUser } from '../../utils/userAccess';

const EXPLORE_LINKS = [
    {
        to: '/exam',
        label: 'คลังข้อสอบ',
        sub: 'ฝึกทำข้อสอบเสมือนจริง',
        Icon: FileCheck2,
        badgeClass: 'bg-rose-500/20 border-rose-400/35 text-rose-200',
    },
    {
        to: '/lobby',
        label: 'ห้องสอบกลุ่ม',
        sub: 'ประลองความเร็วเรียลไทม์',
        Icon: Trophy,
        badgeClass: 'bg-cyan-500/20 border-cyan-400/35 text-cyan-200',
    },
    {
        to: '/arcade',
        label: 'เกมอาเขต',
        sub: 'ทบทวนคำศัพท์และสูตร',
        Icon: Gamepad2,
        badgeClass: 'bg-emerald-500/20 border-emerald-400/35 text-emerald-200',
    },
    {
        to: '/news',
        label: 'ข่าวสอบราชการ',
        sub: 'อัปเดตประกาศรับสมัคร',
        Icon: Newspaper,
        badgeClass: 'bg-amber-400/20 border-amber-300/35 text-amber-200',
    },
    {
        to: '/learning-center',
        label: 'ศูนย์เรียนรู้',
        sub: 'สถาบันและคอร์สแนะนำ',
        Icon: BookOpen,
        badgeClass: 'bg-violet-500/20 border-violet-400/35 text-violet-200',
    },
];

const CommunityLeftBar = ({ user }) => {
    const avatarUrl = user?.avatar || user?.avatar_url;
    const displayName = user?.display_name || user?.username || 'ผู้เรียน PreExam';
    const premium = isPremiumUser(user);

    return (
        <aside className="hidden lg:block space-y-4" aria-label="เมนูสำรวจชุมชน">
            {/* User Quick Profile Card */}
            <div className="pcard">
                {user ? (
                    <div>
                        <div className="flex items-center gap-3 mb-3.5">
                            <div className="relative flex-shrink-0">
                                {avatarUrl ? (
                                    <img
                                        src={avatarUrl.startsWith('http') || avatarUrl.startsWith('/') ? avatarUrl : `/${avatarUrl}`}
                                        alt={displayName}
                                        className="w-11 h-11 rounded-2xl object-cover border border-white/25 shadow-md"
                                    />
                                ) : (
                                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500/40 to-fuchsia-500/40 border border-white/25 flex items-center justify-center text-white font-bold">
                                        <User size={20} />
                                    </div>
                                )}
                                {premium && (
                                    <span
                                        className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-br from-amber-300 to-amber-500 text-[#1a0533] flex items-center justify-center border border-[#2d0d6b] shadow"
                                        title="สมาชิกพรีเมียม"
                                    >
                                        <Crown size={11} />
                                    </span>
                                )}
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="font-bold text-sm text-white truncate">{displayName}</p>
                                <p className="text-xs text-white/70 truncate">
                                    {premium ? 'สมาชิก PreExam Pro' : 'สมาชิกชุมชนติวสอบ'}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <Link
                                to="/profile/threads"
                                className="flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-bold text-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffcc00]"
                            >
                                <MessageSquare size={14} className="text-amber-300" />
                                <span>กระทู้ของฉัน</span>
                            </Link>
                            <Link
                                to="/profile/bookmarks"
                                className="flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-bold text-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffcc00]"
                            >
                                <Bookmark size={14} className="text-emerald-300" />
                                <span>ที่บันทึกไว้</span>
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div>
                        <div className="flex items-center gap-2.5 mb-2.5">
                            <div className="w-9 h-9 rounded-xl bg-amber-400/20 border border-amber-300/40 text-amber-200 flex items-center justify-center">
                                <Sparkles size={18} />
                            </div>
                            <div>
                                <p className="text-sm font-extrabold text-white">เข้าร่วมชุมชน</p>
                                <p className="text-xs text-white/70">แชร์โน้ตสรุปและโหวตโพล</p>
                            </div>
                        </div>
                        <Link
                            to="/login"
                            className="mt-2 w-full inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-gradient-to-r from-[#fde047] to-[#f59e0b] text-[#1a0533] text-xs font-black shadow-md hover:brightness-105 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                        >
                            <LogIn size={15} />
                            <span>เข้าสู่ระบบเพื่อร่วมพูดคุย</span>
                        </Link>
                    </div>
                )}
            </div>

            {/* Explore PreExam Shortcuts */}
            <div className="pcard">
                <div className="pc-head">
                    <span className="w-6 h-6 rounded-lg bg-indigo-400/20 border border-indigo-300/35 text-indigo-200 inline-flex items-center justify-center">
                        <Compass size={14} />
                    </span>
                    <span>เมนูลัดการเรียนรู้</span>
                </div>

                <nav className="space-y-1.5">
                    {EXPLORE_LINKS.map(({ to, label, sub, Icon, badgeClass }) => (
                        <Link
                            key={to}
                            to={to}
                            className="group flex items-center gap-2.5 p-2 rounded-xl hover:bg-white/10 border border-transparent hover:border-white/15 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffcc00]"
                        >
                            <span className={`w-9 h-9 rounded-xl border flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105 ${badgeClass}`}>
                                <Icon size={17} />
                            </span>
                            <div className="min-w-0 flex-1">
                                <div className="text-xs font-bold text-white group-hover:text-[#fde047] transition-colors truncate">
                                    {label}
                                </div>
                                <div className="text-[11px] text-white/70 truncate">{sub}</div>
                            </div>
                            <ChevronRight size={14} className="text-white/50 group-hover:text-white group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                        </Link>
                    ))}
                </nav>
            </div>

            {/* Community Guidelines Card */}
            <div className="pcard">
                <div className="pc-head">
                    <span className="w-6 h-6 rounded-lg bg-emerald-400/20 border border-emerald-300/35 text-emerald-200 inline-flex items-center justify-center">
                        <ShieldCheck size={14} />
                    </span>
                    <span>มารยาทชุมชน</span>
                </div>
                <ul className="space-y-2 text-xs text-white/80 leading-relaxed">
                    <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#06d6a0] mt-1.5 flex-shrink-0" />
                        <span>แบ่งปันแนวข้อสอบและเทคนิคอย่างสร้างสรรค์</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#ffcc00] mt-1.5 flex-shrink-0" />
                        <span>สุภาพและให้เกียรติเพื่อนร่วมสอบทุกคน</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#f472b6] mt-1.5 flex-shrink-0" />
                        <span>งดสแปมหรือโฆษณาที่ไม่เกี่ยวข้อง</span>
                    </li>
                </ul>
            </div>
        </aside>
    );
};

export default CommunityLeftBar;
