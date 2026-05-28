import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { Save, Shield } from 'lucide-react';
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
        'list', 'bullet', 'indent',
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



    if (isLoading) return <div className="p-8 text-center text-gray-500">Loading policy content...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <Shield className="text-royal-blue-600" />
                    Legal & Privacy Policy
                </h2>
                <div className="space-x-3">
                    <button
                        onClick={loadTemplate}
                        className="inline-flex items-center px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors shadow-sm font-medium"
                    >
                        📝 Load Thai PDPA Template
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={updateMutation.isPending}
                        className="inline-flex items-center px-6 py-2 bg-royal-blue-600 text-white rounded-lg hover:bg-royal-blue-700 transition-colors shadow-sm disabled:opacity-50"
                        style={{ backgroundColor: '#2563eb' }}
                    >
                        <Save size={20} className="mr-2" />
                        {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Policy Content</label>
                    <div className="h-[600px] mb-12">
                        <ReactQuill
                            theme="snow"
                            value={content}
                            onChange={setContent}
                            modules={modules}
                            formats={formats}
                            className="h-full [&_.ql-editor]:text-slate-900"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LegalManager;
