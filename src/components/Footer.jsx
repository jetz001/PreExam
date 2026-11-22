import React from 'react';
import { Link } from 'react-router-dom';
import {
  Home,
  FileCheck2,
  MessageSquare,
  BookOpen,
  Mail,
  HelpCircle,
  ShieldCheck,
  Share2,
  MessageCircle,
  Sparkles,
} from 'lucide-react';
import { getCurrentVersion } from '../config/versionHistory';
import BrandLogo from './common/BrandLogo';

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer
      className="mt-auto border-t border-slate-200/80 bg-white/90 backdrop-blur-md transition-colors duration-200 dark:border-slate-800 dark:bg-slate-950/90"
      style={{ fontFamily: "'Sarabun', 'Nunito', sans-serif" }}
    >
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="col-span-1">
            <Link
              to="/"
              aria-label="PreExam หน้าแรก"
              className="inline-flex items-center gap-2.5 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              <BrandLogo showText={false} size="sm" variant="light" aria-hidden="true" />
              <span
                className="text-2xl font-black tracking-tight text-slate-900 dark:text-white"
                style={{ fontFamily: "'Nunito', 'Sarabun', sans-serif" }}
              >
                PreExam<span className="text-rose-500 dark:text-amber-400">!</span>
              </span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              ศูนย์กลางการซ้อมทำข้อสอบสำหรับเตรียมสอบราชการที่ครบวงจรที่สุด
            </p>
            <div className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-indigo-200/80 bg-indigo-50/80 px-3 py-1 text-xs font-bold text-indigo-700 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-300">
              <Sparkles size={13} />
              <span>PreExam {getCurrentVersion()}</span>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              เมนูหลัก
            </h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 rounded-md text-sm font-semibold text-slate-600 transition-colors hover:text-indigo-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-slate-300 dark:hover:text-indigo-400"
                >
                  <Home size={15} />
                  <span>หน้าแรก</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/exam"
                  className="inline-flex items-center gap-2 rounded-md text-sm font-semibold text-slate-600 transition-colors hover:text-indigo-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-slate-300 dark:hover:text-indigo-400"
                >
                  <FileCheck2 size={15} />
                  <span>คลังข้อสอบ</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/community"
                  className="inline-flex items-center gap-2 rounded-md text-sm font-semibold text-slate-600 transition-colors hover:text-indigo-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-slate-300 dark:hover:text-indigo-400"
                >
                  <MessageSquare size={15} />
                  <span>ชุมชน</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/learning-center"
                  className="inline-flex items-center gap-2 rounded-md text-sm font-semibold text-slate-600 transition-colors hover:text-indigo-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-slate-300 dark:hover:text-indigo-400"
                >
                  <BookOpen size={15} />
                  <span>ศูนย์การเรียนรู้</span>
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              ช่วยเหลือ
            </h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 rounded-md text-sm font-semibold text-slate-600 transition-colors hover:text-indigo-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-slate-300 dark:hover:text-indigo-400"
                >
                  <Mail size={15} />
                  <span>ติดต่อเรา</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/faq"
                  className="inline-flex items-center gap-2 rounded-md text-sm font-semibold text-slate-600 transition-colors hover:text-indigo-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-slate-300 dark:hover:text-indigo-400"
                >
                  <HelpCircle size={15} />
                  <span>คำถามที่พบบ่อย</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/policy"
                  className="inline-flex items-center gap-2 rounded-md text-sm font-semibold text-slate-600 transition-colors hover:text-indigo-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-slate-300 dark:hover:text-indigo-400"
                >
                  <ShieldCheck size={15} />
                  <span>นโยบายความเป็นส่วนตัว</span>
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              ติดตามเรา
            </h3>
            <ul className="mt-4 space-y-3">
              <li>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-md text-sm font-semibold text-slate-600 transition-colors hover:text-indigo-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-slate-300 dark:hover:text-indigo-400"
                >
                  <Share2 size={15} />
                  <span>Facebook</span>
                </a>
              </li>
              <li>
                <a
                  href="https://line.me"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-md text-sm font-semibold text-slate-600 transition-colors hover:text-emerald-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-slate-300 dark:hover:text-emerald-400"
                >
                  <MessageCircle size={15} />
                  <span>Line OA</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-slate-200/80 pt-6 text-xs text-slate-500 sm:flex-row dark:border-slate-800 dark:text-slate-400">
          <p>&copy; {year} PreExam. All rights reserved.</p>
          <p className="font-medium">ออกแบบเพื่อการเตรียมสอบยุคใหม่</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
