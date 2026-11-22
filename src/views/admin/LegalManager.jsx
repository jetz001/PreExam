import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { Save, Shield, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import adminApi from '../../services/adminApi';

const LegalManager = () => {
    const queryClient = useQueryClient();
    const [content, setContent] = useState('');

    const { data: policyData, isLoading } = useQuery({
        queryKey: ['privacyPolicy'],
        queryFn: adminApi.getPrivacyPolicy
    });

    useEffect(() => {
        if (policyData && policyData.content) {
            setContent(policyData.content);
        }
    }, [policyData]);

    const updateMutation = useMutation({
        mutationFn: adminApi.updatePrivacyPolicy,
        onSuccess: () => {
            queryClient.invalidateQueries(['privacyPolicy']);
            toast.success('Privacy Policy updated successfully');
        },
        onError: () => toast.error('Failed to update Privacy Policy')
    });

    const handleSave = () => {
        updateMutation.mutate(content);
    };

    const formats = [
        'header',
        'bold', 'italic', 'underline', 'strike', 'blockquote',
        'list', 'indent',
        'link', 'image'
    ];

    const THAI_PDPA_TEMPLATE = `<h2>นโยบายการคุ้มครองข้อมูลส่วนบุคคล (Privacy Policy)</h2>
<p>เว็บไซต์ PreExam (https://preexam.online/) ให้ความสำคัญกับการคุ้มครองข้อมูลส่วนบุคคลของคุณ นโยบายนี้จัดทำขึ้นเพื่อให้สอดคล้องกับพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 (PDPA) ของประเทศไทย</p>
<br>
<h3>1. ข้อมูลที่เราเก็บรวบรวม</h3>
<ul>
<li><strong>ข้อมูลทั่วไปและข้อมูลติดต่อ:</strong> ชื่อผู้ใช้, ชื่อ-นามสกุล, อีเมล (Email)</li>
<li><strong>ข้อมูลการใช้งานเว็บไซต์:</strong> ประวัติการทำข้อสอบ, คะแนนสอบ, ข้อมูลทางสถิติ, ข้อมูลอุปกรณ์และ IP Address</li>
<li><strong>ข้อมูลการทำธุรกรรม:</strong> ประวัติการเติมเงินและการอัปเกรด (หมายเหตุ: เราไม่เก็บข้อมูลบัตรเครดิตโดยตรง แต่ประมวลผลผ่านผู้ให้บริการรับชำระเงินที่ได้มาตรฐาน)</li>
</ul>
<br>
<h3>2. วัตถุประสงค์ในการประมวลผลข้อมูล</h3>
<ul>
<li>เพื่อให้บริการระบบฝึกทำข้อสอบออนไลน์ แจ้งผลสอบ และจัดอันดับคะแนน</li>
<li>เพื่อยืนยันตัวตน ป้องกันการทุจริต และรักษาความปลอดภัยของบัญชีผู้ใช้</li>
<li>เพื่อปรับปรุงพัฒนาเว็บไซต์และวิเคราะห์ข้อมูลการใช้งาน</li>
<li>เพื่อตอบกลับข้อซักถาม ให้ความช่วยเหลือ (Support) หรือแจ้งเตือนข่าวสาร</li>
</ul>
<br>
<h3>3. การเปิดเผยข้อมูลส่วนบุคคล</h3>
<p>เราจะไม่ขายหรือเปิดเผยข้อมูลส่วนบุคคลของคุณต่อบุคคลภายนอก ยกเว้นในกรณี:</p>
<ul>
<li>เป็นการปฏิบัติตามกฎหมาย คำสั่งศาล หรือหน่วยงานรัฐที่มีอำนาจ</li>
<li>เป็นการเปิดเผยให้แก่ผู้ให้บริการภายนอก (Third-party) ที่เกี่ยวข้องกับการทำงานของเว็บ เช่น ผู้ให้บริการเซิร์ฟเวอร์ หรือผู้ให้บริการรับชำระเงิน โดยมีมาตรการรักษาความลับที่เข้มงวด</li>
</ul>
<br>
<h3>4. สิทธิของเจ้าของข้อมูลส่วนบุคคล</h3>
<p>ตามกฎหมาย PDPA คุณมีสิทธิดังนี้:</p>
<ul>
<li>สิทธิขอเข้าถึงและรับสำเนาข้อมูลส่วนบุคคลของคุณ</li>
<li>สิทธิขอให้แก้ไขข้อมูลให้ถูกต้อง เป็นปัจจุบัน</li>
<li>สิทธิขอให้ลบหรือทำลายข้อมูล (Right to be forgotten) เมื่อไม่มีความจำเป็น</li>
<li>สิทธิขอถอนความยินยอมในการประมวลผลข้อมูล</li>
</ul>
<br>
<h3>5. การรักษาความมั่นคงปลอดภัย</h3>
<p>เราใช้มาตรการรักษาความปลอดภัยทางเทคนิคและการบริหารจัดการที่เหมาะสมตามมาตรฐาน เพื่อป้องกันมิให้ข้อมูลสูญหาย หรือมีการเข้าถึง เปลี่ยนแปลง และเปิดเผยข้อมูลโดยมิชอบ</p>
<br>
<h3>6. การติดต่อเรา</h3>
<p>หากมีข้อสงสัยเกี่ยวกับการคุ้มครองข้อมูลส่วนบุคคล สามารถติดต่อผู้ดูแลระบบได้ผ่านระบบ Support Ticket ภายในเว็บไซต์</p>`;

    const loadTemplate = () => {
        if (window.confirm('คุณต้องการโหลดเทมเพลต PDPA ภาษาไทยหรือไม่? ข้อมูลเดิมในช่องข้อความจะถูกทับ')) {
            setContent(THAI_PDPA_TEMPLATE);
        }
    };

    const modules = {
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
            ['link', 'image'],
            ['clean']
        ],
    };

    if (isLoading) {
        return (
            <div className="space-y-6 animate-pulse" role="status" aria-label="กำลังโหลดนโยบายความเป็นส่วนตัว">
                <div className="h-24 rounded-2xl bg-slate-200/80" />
                <div className="h-96 rounded-2xl bg-slate-200/80" />
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-8">
            {/* Executive Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl bg-white/90 backdrop-blur-sm p-5 sm:p-6 border border-slate-200/80 shadow-sm">
                <div className="flex items-center gap-3.5 min-w-0">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-500/20">
                        <Shield size={24} />
                    </div>
                    <div className="min-w-0">
                        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight truncate">
                            นโยบายความเป็นส่วนตัว (Legal &amp; PDPA)
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                            จัดการเนื้อหานโยบายคุ้มครองข้อมูลส่วนบุคคล (PDPA) และข้อกำหนดการใช้งานแพลตฟอร์ม
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                    <button
                        type="button"
                        onClick={loadTemplate}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-700 border border-slate-200/80 rounded-xl hover:bg-slate-200/80 transition-colors text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                    >
                        <FileText size={16} className="text-indigo-600" />
                        <span>Load Thai PDPA Template</span>
                    </button>
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={updateMutation.isPending}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl transition-all shadow-md shadow-indigo-500/20 disabled:opacity-50 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                    >
                        <Save size={17} />
                        <span>{updateMutation.isPending ? 'Saving...' : 'Save Changes'}</span>
                    </button>
                </div>
            </div>

            {/* Editor Card */}
            <div className="rounded-2xl bg-white/90 backdrop-blur-sm p-5 sm:p-6 border border-slate-200/80 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-bold text-slate-800">Policy Content (Rich Text Editor)</label>
                    <span className="text-xs font-medium text-slate-500">รองรับ HTML มาตรฐานสำหรับแสดงผลบนหน้า /policy</span>
                </div>
                <div className="rounded-xl overflow-hidden [&_.ql-toolbar]:border-slate-200 [&_.ql-container]:border-slate-200 [&_.ql-container]:min-h-[420px] [&_.ql-editor]:min-h-[420px] [&_.ql-editor]:text-slate-900">
                    <ReactQuill
                        theme="snow"
                        value={content}
                        onChange={setContent}
                        modules={modules}
                        formats={formats}
                    />
                </div>
            </div>
        </div>
    );
};

export default LegalManager;
