
const { sequelize, SystemSetting } = require('../models');

const pdpaContent = `
<div class="space-y-6">
    <h2 class="text-2xl font-bold text-gray-900 dark:text-white">1. นิยามข้อมูลส่วนบุคคล</h2>
    <p class="text-gray-600 dark:text-gray-300">
        "ข้อมูลส่วนบุคคล" หมายถึง ข้อมูลเกี่ยวกับบุคคลซึ่งทำให้สามารถระบุตัวบุคคลนั้นได้ ไม่ว่าทางตรงหรือทางอ้อม แต่ไม่รวมถึงข้อมูลของผู้ถึงแก่กรรมโดยเฉพาะ
    </p>

    <h2 class="text-2xl font-bold text-gray-900 dark:text-white">2. การเก็บรวบรวมข้อมูลส่วนบุคคล</h2>
    <p class="text-gray-600 dark:text-gray-300">
        เราจะเก็บรวบรวมข้อมูลส่วนบุคคลของท่านเท่าที่จำเป็นในการให้บริการ โดยวิธีที่ชอบด้วยกฎหมายและเป็นธรรม ข้อมูลที่เราจัดเก็บอาจรวมถึง:
    </p>
    <ul class="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2 ml-4">
        <li>ชื่อ-นามสกุล</li>
        <li>ที่อยู่อีเมล</li>
        <li>ข้อมูลการเข้าสู่ระบบ (เช่น Google ID, Facebook ID)</li>
        <li>ข้อมูลการใช้งานและการทำแบบทดสอบ</li>
    </ul>

    <h2 class="text-2xl font-bold text-gray-900 dark:text-white">3. วัตถุประสงค์ในการเก็บรวบรวมและใช้ข้อมูล</h2>
    <p class="text-gray-600 dark:text-gray-300">
        เราเก็บรวบรวมข้อมูลของท่านเพื่อ:
    </p>
    <ul class="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2 ml-4">
        <li>ให้บริการและจัดการบัญชีผู้ใช้งานของท่าน</li>
        <li>วิเคราะห์และปรับปรุงประสิทธิภาพของระบบ</li>
        <li>ติดต่อสื่อสารและแจ้งข้อมูลข่าวสารที่เกี่ยวข้อง</li>
        <li>รักษาความปลอดภัยของระบบและบัญชีผู้ใช้งาน</li>
    </ul>

    <h2 class="text-2xl font-bold text-gray-900 dark:text-white">4. การเปิดเผยข้อมูลส่วนบุคคล</h2>
    <p class="text-gray-600 dark:text-gray-300">
        เราจะไม่เปิดเผยข้อมูลส่วนบุคคลของท่านให้แก่บุคคลภายนอก เว้นแต่ได้รับความยินยอมจากท่าน หรือเป็นการปฏิบัติตามกฎหมาย หรือเพื่อปกป้องสิทธิและทรัพย์สินของเรา
    </p>

    <h2 class="text-2xl font-bold text-gray-900 dark:text-white">5. ระยะเวลาในการเก็บรักษาข้อมูล</h2>
    <p class="text-gray-600 dark:text-gray-300">
        เราจะเก็บรักษาข้อมูลของท่านไว้ตราบเท่าที่จำเป็นเพื่อให้บรรลุวัตถุประสงค์ที่ระบุไว้ในนโยบายนี้ หรือตามระยะเวลาที่กฎหมายกำหนด
    </p>

    <h2 class="text-2xl font-bold text-gray-900 dark:text-white">6. สิทธิของเจ้าของข้อมูลส่วนบุคคล</h2>
    <p class="text-gray-600 dark:text-gray-300">
        ท่านมีสิทธิในการขอเข้าถึง แก้ไข ลบ หรือระงับการใช้ข้อมูลส่วนบุคคลของท่าน รวมถึงสิทธิในการขอถอนความยินยอมได้ตลอดเวลา โดยติดต่อเราผ่านช่องทางที่ระบุไว้
    </p>

    <h2 class="text-2xl font-bold text-gray-900 dark:text-white">7. การรักษาความมั่นคงปลอดภัย</h2>
    <p class="text-gray-600 dark:text-gray-300">
        เรามีมาตรการรักษาความปลอดภัยที่เหมาะสมเพื่อป้องกันการเข้าถึง การใช้ หรือการเปิดเผยข้อมูลส่วนบุคคลโดยมิชอบ
    </p>

    <h2 class="text-2xl font-bold text-gray-900 dark:text-white">8. การติดต่อเรา</h2>
    <p class="text-gray-600 dark:text-gray-300">
        หากท่านมีข้อสงสัยเกี่ยวกับนโยบายความเป็นส่วนตัวนี้ โปรดติดต่อเราที่: <a href="mailto:support@preexam.com" class="text-indigo-600 hover:text-indigo-800">support@preexam.com</a>
    </p>
</div>
`;

const seedPolicy = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        // Key defined in legalController.js
        const SETTING_KEY_PRIVACY_POLICY = 'privacy_policy_content';

        const [setting, created] = await SystemSetting.findOrCreate({
            where: { key: SETTING_KEY_PRIVACY_POLICY },
            defaults: { value: pdpaContent }
        });

        if (!created) {
            console.log('Policy already exists. Updating...');
            setting.value = pdpaContent;
            await setting.save();
        }

        console.log('Privacy Policy seeded successfully!');
    } catch (error) {
        console.error('Error seeding policy:', error);
    } finally {
        await sequelize.close();
    }
};

seedPolicy();
