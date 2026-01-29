import React from 'react';
import { Link } from 'react-router-dom';
import PageLoadTimer from './common/PageLoadTimer';

const Footer = () => {
    return (
        <footer className="bg-white border-t border-gray-200 mt-auto">
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="col-span-1 md:col-span-1">
                        <span className="text-2xl font-bold text-primary">PreExam</span>
                        <p className="mt-4 text-sm text-gray-500">
                            ศูนย์กลางการซ้อมทำข้อสอบสำหรับเตรียมสอบราชการที่ครบวงจรที่สุด
                        </p>
                        <p className="mt-2 text-xs text-gray-400">
                            {/* Display the version number defined in vite.config.js */}
                            PreExam v{__APP_VERSION__}
                        </p>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">เมนูหลัก</h3>
                        <ul className="mt-4 space-y-4">
                            <li><Link to="/" className="text-base text-gray-500 hover:text-gray-900">หน้าแรก</Link></li>
                            <li><Link to="/exam" className="text-base text-gray-500 hover:text-gray-900">คลังข้อสอบ</Link></li>
                            <li><Link to="/community" className="text-base text-gray-500 hover:text-gray-900">ชุมชน</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">ช่วยเหลือ</h3>
                        <ul className="mt-4 space-y-4">
                            <li><Link to="/contact" className="text-base text-gray-500 hover:text-gray-900">ติดต่อเรา</Link></li>
                            <li><Link to="/faq" className="text-base text-gray-500 hover:text-gray-900">คำถามที่พบบ่อย</Link></li>
                            <li><Link to="/policy" className="text-base text-gray-500 hover:text-gray-900">นโยบายความเป็นส่วนตัว</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">ติดตามเรา</h3>
                        <ul className="mt-4 space-y-4">
                            <li><a href="#" className="text-base text-gray-500 hover:text-gray-900">Facebook</a></li>
                            <li><a href="#" className="text-base text-gray-500 hover:text-gray-900">Line OA</a></li>
                        </ul>
                    </div>
                </div>
                <div className="mt-8 border-t border-gray-200 pt-8">
                    <p className="text-base text-gray-400 text-center">
                        &copy; 2024 PreExam. All rights reserved.
                    </p>
                    <PageLoadTimer />
                </div>
            </div>
        </footer>
    );
};

export default Footer;
