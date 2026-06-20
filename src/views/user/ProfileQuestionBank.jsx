import React from 'react';
import CustomQuestionBuilder from '../../components/room/CustomQuestionBuilder';

const ProfileQuestionBank = () => {
    return (
        <div className="profile-section fade-in">
            <h2 className="section-title">📁 คลังข้อสอบส่วนตัว</h2>
            <div className="profile-card">
                <CustomQuestionBuilder mode="bank" />
            </div>
        </div>
    );
};

export default ProfileQuestionBank;
