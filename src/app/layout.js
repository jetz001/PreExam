import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  applicationName: "PreExam!",
  title: {
    default: "PreExam! — แพลตฟอร์มฝึกทำข้อสอบออนไลน์และเตรียมสอบครบวงจร",
    template: "%s | PreExam!",
  },
  description:
    "PreExam! ระบบนิเวศการเรียนรู้และคลังข้อสอบออนไลน์ครบวงจร ทั้งโหมดสอบเดี่ยว ห้องสอบกลุ่มเรียลไทม์ เกมอาเขตฝึกทักษะ และศูนย์การเรียนรู้สำหรับผู้เรียนและติวเตอร์ยุคใหม่",
  icons: {
    icon: [
      { url: "/logo-mark.svg", type: "image/svg+xml" },
      {
        url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0%25' stop-color='%234f46e5'/%3E%3Cstop offset='52%25' stop-color='%237c3aed'/%3E%3Cstop offset='100%25' stop-color='%23d946ef'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect x='3' y='3' width='58' height='58' rx='16' fill='url(%23g)'/%3E%3Cpath d='M35.9 16.9A17.5 17.5 0 1 0 47.1 28.1' fill='none' stroke='%23fff' stroke-width='3.5' stroke-linecap='round'/%3E%3Cpath d='M30.5 23.5L42 29.5L30.5 35.5L19 29.5Z' fill='%23fff'/%3E%3Cpath d='M46.5 9.7Q48.2 15.8 54.3 17.5Q48.2 19.2 46.5 25.3Q44.8 19.2 38.7 17.5Q44.8 15.8 46.5 9.7Z' fill='%23fde047'/%3E%3C/svg%3E",
        type: "image/svg+xml",
      },
    ],
    shortcut: "/logo-mark.svg",
    apple: "/logo-mark.svg",
  },
  openGraph: {
    title: "PreExam! — แพลตฟอร์มฝึกทำข้อสอบออนไลน์และเตรียมสอบครบวงจร",
    description:
      "ซ้อมทำข้อสอบ แข่งขันห้องสอบกลุ่ม สะสม XP และพัฒนาทักษะการสอบอย่างมั่นใจกับ PreExam!",
    type: "website",
    locale: "th_TH",
    siteName: "PreExam!",
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
