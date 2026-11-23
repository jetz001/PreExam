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
      { url: "/favicon.ico", sizes: "any" },
      { url: "/logo-mark.png", sizes: "512x512", type: "image/png" },
      { url: "/logo-mark.svg", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.ico",
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
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
