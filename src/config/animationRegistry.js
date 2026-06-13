import runningAnimation from '../assets/0440d3b2-5273-11f0-b93e-e315c27baf59.json';
import jumpingAnimation from '../assets/1ae6a4ce-ab48-4d73-bf3c-1822291d84c4.json';
import resultAnimation from '../assets/d27e2c9a-5640-11f0-9df0-f3b04a7467c6.json';

export const animationRegistry = {
    examSkipFirstAnswer: {
        key: 'examSkipFirstAnswer',
        name: 'ข้ามข้อหลังตอบครั้งแรก',
        description: 'แสดงหลังผู้ใช้ตอบคำถามครั้งแรกในโหมดสอบ แล้วระบบพาไปข้อถัดไปอัตโนมัติ',
        animationData: runningAnimation,
        scale: 'half',
        direction: 'right',
        speed: 1.15,
        loop: false,
        accent: 'check',
        recommendedView: 'overlay',
        usage: 'exam-taking'
    },
    examFinish: {
        key: 'examFinish',
        name: 'จบการสอบ',
        description: 'ใช้เป็นเอฟเฟกต์สั้น ๆ ตอนส่งคำตอบหรือเปลี่ยนเข้าสู่หน้าผลสอบ',
        animationData: jumpingAnimation,
        scale: 'full',
        direction: 'up',
        speed: 1,
        loop: false,
        accent: 'check',
        recommendedView: 'overlay',
        usage: 'exam-finish'
    },
    examResultPass: {
        key: 'examResultPass',
        name: 'ผลสอบผ่าน',
        description: 'ใช้ในหน้าคะแนนสอบเมื่อสอบผ่าน เน้นภาพใหญ่ระดับครึ่งจอ',
        animationData: resultAnimation,
        scale: 'half',
        direction: 'up',
        speed: 1,
        loop: false,
        accent: 'check',
        recommendedView: 'inline',
        usage: 'exam-result'
    },
    examResultFail: {
        key: 'examResultFail',
        name: 'ผลสอบยังไม่ผ่าน',
        description: 'ใช้ในหน้าผลสอบเมื่อยังไม่ผ่าน โดยคงจังหวะการเคลื่อนไหวไว้แต่เปลี่ยนข้อความและไอคอน',
        animationData: runningAnimation,
        scale: 'half',
        direction: 'left',
        speed: 0.95,
        loop: false,
        accent: 'close',
        recommendedView: 'inline',
        usage: 'exam-result'
    },
    adminPreview: {
        key: 'adminPreview',
        name: 'พรีวิวในหน้าแอดมิน',
        description: 'ใช้ทดสอบว่า asset ที่นำเข้าใหม่มีขนาดและทิศทางเข้ากับธีมของโปรเจคหรือไม่',
        animationData: jumpingAnimation,
        scale: 'card',
        direction: 'center',
        speed: 1,
        loop: true,
        accent: 'check',
        recommendedView: 'inline',
        usage: 'admin'
    }
};

export const animationCatalog = Object.values(animationRegistry);

export const getAnimationPreset = (key) => animationRegistry[key] || animationRegistry.adminPreview;
