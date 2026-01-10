import React from 'react';
import SettingsTabs from '../../components/profile/SettingsTabs';

const SettingsPage = () => {
    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Account Settings</h1>
            <SettingsTabs />
        </div>
    );
};

export default SettingsPage;
