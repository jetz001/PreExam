import React from 'react';
import { FolderKanban } from 'lucide-react';
import CustomQuestionBuilder from '../../components/room/CustomQuestionBuilder';

const ProfileQuestionBank = () => {
  return (
    <div id="sec-question-bank">
      <div className="section-title" style={{ marginBottom: '20px', fontSize: '20px' }}>
        <div className="dot" />
        <FolderKanban size={20} className="text-amber-300" />
        <span>คลังข้อสอบส่วนตัว</span>
      </div>
      <div className="activity-card">
        <CustomQuestionBuilder mode="bank" />
      </div>
    </div>
  );
};

export default ProfileQuestionBank;
