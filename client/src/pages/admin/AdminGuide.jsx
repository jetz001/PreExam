import React from 'react';
import { BookOpen, Shield, Users, FileQuestion, AlertTriangle, MonitorPlay } from 'lucide-react';

const AdminGuide = () => {
    const guides = [
        {
            title: 'การจัดการผู้ใช้ (User Management)',
            icon: Users,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
            content: [
                'ตรวจสอบผู้ใช้ใหม่: ไปที่เมนู "จัดการสมาชิก" เพื่อดูรายชื่อสมาชิกทั้งหมด',
                'การแบน/ระงับบัญชี: หากพบผู้ใช้ทำผิดกฎ สามารถกดปุ่ม "ระงับการใช้งาน" ได้ทันที',
                'การยืนยันตัวตน: ตรวจสอบเอกสารที่มีการอัปโหลดเข้ามาในระบบ'
            ]
        },
        {
            title: 'การจัดการคลังข้อสอบ (Exam Bank)',
            icon: FileQuestion,
            color: 'text-purple-600',
            bg: 'bg-purple-50',
            content: [
                'เพิ่มข้อสอบใหม่: ใช้ไฟล์ Excel template ในการอัปโหลดข้อสอบจำนวนมาก',
                'ตรวจสอบความถูกต้อง: ตรวจทานเฉลยและคำอธิบายก่อนอนุมัติให้ใช้งาน',
                'การแก้ไข: สามารถแก้ไขโจทย์หรือตัวเลือกได้ตลอดเวลาผ่านเมนู "แก้ไข"'
            ]
        },
        {
            title: 'การดูแลชุมชน (Community Moderation)',
            icon: Shield,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
            content: [
                'ตรวจสอบโพสต์: ดูแลความเรียบร้อยของโพสต์ใน Community',
                'การจัดการ Comment: ลบความคิดเห็นที่ไม่เหมาะสมหรือสร้างความขัดแย้ง',
                'รับเรื่องร้องเรียน: ตรวจสอบ Report ที่ผู้ใช้แจ้งเข้ามา'
            ]
        },
        {
            title: 'การโฆษณาและการเงิน (Ads & Payments)',
            icon: AlertTriangle,
            color: 'text-orange-600',
            bg: 'bg-orange-50',
            content: [
                'อนุมัติโฆษณา: ตรวจสอบรูปภาพและเนื้อหาโฆษณาก่อนอนุมัติให้แสดงผล',
                'ตรวจสอบยอดเงิน: ดูแลรายการแจ้งโอนเงินและอนุมัติ Slip',
                'การคืนเงิน: ดำเนินการตามนโยบายเมื่อมีคำร้องขอคืนเงิน'
            ]
        },
        {
            title: 'การจัดการห้องสอบ (Room Management)',
            icon: MonitorPlay,
            color: 'text-pink-600',
            bg: 'bg-pink-50',
            content: [
                'ตรวจสอบห้องสอบ: ดูแลห้องสอบกลุ่มที่สร้างโดยสมาชิก',
                'ลบห้องสอบ: ลบห้องที่มีชื่อหรือเนื้อหาไม่เหมาะสม',
                'การรีเซ็ตห้อง: รีเซ็ตสถานะห้องหากเกิดปัญหาทางเทคนิค'
            ]
        },
        {
            title: 'การสำรองและกู้คืนข้อมูล (Backup & Restore)',
            icon: Shield,
            color: 'text-cyan-600',
            bg: 'bg-cyan-50',
            content: [
                'Auto Backup: ระบบจะสำรองข้อมูลอัตโนมัติทุกวันเวลา 03:00 น.',
                'ไฟล์ Backup: เก็บไฟล์ไว้ที่ Is /backups/ บนเซิร์ฟเวอร์และ Google Drive',
                'การกู้คืน (Restore): ใช้คำสั่ง ssh root@150.95.27.156 "/root/scripts/restore.sh <backup_file.zip>"'
            ]
        }
    ];

    return (
        <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
                <div className="flex items-center space-x-3 mb-4">
                    <div className="p-3 bg-yellow-100 rounded-full">
                        <BookOpen className="h-8 w-8 text-yellow-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">คู่มือสำหรับผู้ดูแลระบบ (Admin Guide)</h1>
                        <p className="text-gray-500">รวมแนวทางการปฏิบัติงานและวิธีใช้งานระบบสำหรับแอดมิน</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {guides.map((guide, index) => (
                    <div key={index} className="bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow duration-200">
                        <div className="flex items-center mb-4">
                            <div className={`p-2 rounded-lg ${guide.bg} mr-3`}>
                                <guide.icon className={`h-6 w-6 ${guide.color}`} />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">{guide.title}</h3>
                        </div>
                        <ul className="space-y-3">
                            {guide.content.map((item, idx) => (
                                <li key={idx} className="flex items-start text-gray-600 text-sm">
                                    <span className="mr-2 mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gray-300"></span>
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>

            <div className="bg-white shadow rounded-lg p-6 mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">📞 ช่องทางติดต่อทีม Developer</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                        <span className="font-medium block text-gray-900 mb-1">System Issue (แจ้งปัญหาระบบ)</span>
                        dev-team@preexam.online
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                        <span className="font-medium block text-gray-900 mb-1">Critical Bug (แจ้งบักด่วน)</span>
                        Tel: 02-xxx-xxxx (24/7 Support)
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                        <span className="font-medium block text-gray-900 mb-1">Feature Request (ขอฟีเจอร์เพิ่ม)</span>
                        ผ่านระบบ Ticket ภายใน
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminGuide;
