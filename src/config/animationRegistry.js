import runningAnimation from '../assets/boy-running.json';
import jumpingAnimation from '../assets/jumping.json';
import resultAnimation from '../assets/guy-jumping.json';
import boxingAnimation from '../assets/boxing.json';
import mainSceneAAnimation from '../assets/main-scene-a.json';
import mainSceneBAnimation from '../assets/main-scene-b.json';
import mainSceneCAnimation from '../assets/main-scene-c.json';
import mainSceneDAnimation from '../assets/main-scene-d.json';
import sourceAnimation from '../assets/source-animation.json';
import untitledAnimation from '../assets/untitled-file.json';
import animation40128078 from '../assets/animation-40128078-2.json';
import guyJumpingAltAnimation from '../assets/guy-jumping-alt.json';

export const animationAssetLibrary = {
    'boy-running.json': runningAnimation,
    'jumping.json': jumpingAnimation,
    'guy-jumping.json': resultAnimation,
    'boxing.json': boxingAnimation,
    'main-scene-a.json': mainSceneAAnimation,
    'main-scene-b.json': mainSceneBAnimation,
    'main-scene-c.json': mainSceneCAnimation,
    'main-scene-d.json': mainSceneDAnimation,
    'source-animation.json': sourceAnimation,
    'untitled-file.json': untitledAnimation,
    'animation-40128078-2.json': animation40128078,
    'guy-jumping-alt.json': guyJumpingAltAnimation
};

export const animationAssetOptions = Object.keys(animationAssetLibrary).map((fileName) => ({
    value: fileName,
    label: fileName
}));

export const animationRegistry = {
    examSkipFirstAnswer: {
        key: 'examSkipFirstAnswer',
        name: 'ข้ามข้อหลังตอบครั้งแรก',
        sourceFile: 'boy-running.json',
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
        sourceFile: 'jumping.json',
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
        sourceFile: 'guy-jumping.json',
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
        sourceFile: 'boy-running.json',
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
        sourceFile: 'jumping.json',
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

export const getAnimationAsset = (key) => {
    if (!key) return null;

    if (animationAssetLibrary[key]) {
        return {
            key,
            sourceFile: key,
            animationData: animationAssetLibrary[key]
        };
    }

    const preset = animationRegistry[key];
    if (preset?.sourceFile && animationAssetLibrary[preset.sourceFile]) {
        return {
            key: preset.sourceFile,
            sourceFile: preset.sourceFile,
            animationData: animationAssetLibrary[preset.sourceFile]
        };
    }

    return null;
};

export const getAnimationSourceFile = (key) => {
    if (!key) return '';
    const asset = getAnimationAsset(key);
    return asset?.sourceFile || '';
};
