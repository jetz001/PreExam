import React, { useEffect } from 'react';
import useUserRole from '../../hooks/useUserRole';
import { Timer } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const PacingAlert = ({ timeUsed, totalTime }) => {
    const { isPremium } = useUserRole();

    useEffect(() => {
        if (!isPremium) return;

        // Logic: Alert every 30 minutes (1800 seconds)
        // Also alert at 50% time used and 90% time used

        if (timeUsed > 0) {
            if (timeUsed % 1800 === 0) {
                notify(`⏱ Checkpoint: You have spent ${timeUsed / 60} minutes.`);
            }

            // prevent division by zero
            if (totalTime > 0) {
                const percentUsed = (timeUsed / totalTime) * 100;
                // Use a small range because interval is 1s, exact match might be missed if using floats roughly
                // But here we check integer seconds updates.

                // Trigger once when passing threshold (needs state to avoid span spam)
                // Simply relying on exact second match assuming update interval is 1s

                const halfTime = Math.floor(totalTime / 2);
                const ninetyTime = Math.floor(totalTime * 0.9);

                if (timeUsed === halfTime) {
                    notify('⚠️ Halfway point! Check your pace.');
                }
                if (timeUsed === ninetyTime) {
                    notify('🚨 10% time remaining! Speed up.');
                }
            }
        }

    }, [timeUsed, totalTime, isPremium]);

    const notify = (msg) => toast(msg, {
        icon: '⏳',
        duration: 4000,
        position: 'top-right',
        style: {
            background: '#333',
            color: '#fff',
        }
    });

    if (!isPremium) return null;

    return <Toaster />;
};

export default PacingAlert;
