import React, { useState, useEffect } from 'react';
import publicService from '../../services/publicService';

const SystemBroadcast = () => {
    const [settings, setSettings] = useState(null);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await publicService.getSystemSettings();
                if (res.success && res.settings) {
                    setSettings(res.settings);
                }
            } catch (error) {
                console.error("Failed to load system settings", error);
            }
        };
        fetchSettings();
    }, []);

    if (!settings || !settings.announcement_active || !settings.announcement_text) return null;

    const typeStyles = {
        warning: 'bg-amber-100 text-amber-800 border-b border-amber-200',
        success: 'bg-green-100 text-green-800 border-b border-green-200',
        info: 'bg-blue-600 text-white shadow-md'
    };

    const style = typeStyles[settings.announcement_type] || typeStyles.info;

    return (
        <div className={`w-full py-2 px-6 text-sm font-medium flex items-center justify-center gap-2 transition-all duration-300 ${style}`}>
            <span className="flex items-center gap-2">
                📣 {settings.announcement_text}
            </span>
        </div>
    );
};

export default SystemBroadcast;
