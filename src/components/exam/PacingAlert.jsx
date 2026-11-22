import React, { useEffect } from 'react';
import useUserRole from '../../hooks/useUserRole';
import { Timer, AlertTriangle, Zap, Hourglass } from 'lucide-react';
import toast from 'react-hot-toast';

const PacingAlert = ({ timeUsed, totalTime }) => {
    const { isPremium } = useUserRole();

    const notify = (msg, IconComp = Hourglass, accentClass = 'text-amber-400') => {
        toast(msg, {
            icon: (
                <span className="w-7 h-7 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
                    <IconComp size={16} className={accentClass} aria-hidden="true" />
                </span>
            ),
            duration: 4000,
            position: 'top-right',
            style: {
                background: 'rgba(15, 23, 42, 0.92)',
                backdropFilter: 'blur(14px)',
                color: '#f8fafc',
                border: '1px solid rgba(255, 255, 255, 0.18)',
                borderRadius: '16px',
                fontFamily: "'Sarabun', 'Nunito', sans-serif",
                fontWeight: 700,
                boxShadow: '0 12px 30px rgba(0, 0, 0, 0.35)',
            },
        });
    };

    useEffect(() => {
        if (!isPremium) return;

        // Logic: Alert every 30 minutes (1800 seconds)
        // Also alert at 50% time used and 90% time used
        if (timeUsed > 0) {
            if (timeUsed % 1800 === 0) {
                notify(`Checkpoint: คุณใช้เวลาไปแล้ว ${timeUsed / 60} นาที`, Timer, 'text-sky-400');
            }

            if (totalTime > 0) {
                const halfTime = Math.floor(totalTime / 2);
                const ninetyTime = Math.floor(totalTime * 0.9);

                if (timeUsed === halfTime) {
                    notify('ผ่านไปครึ่งทางแล้ว! เช็กจังหวะเวลาของคุณด้วยนะ', AlertTriangle, 'text-amber-400');
                }
                if (timeUsed === ninetyTime) {
                    notify('เหลือเวลาอีก 10%! เร่งมือทำข้อที่เหลือเลย', Zap, 'text-rose-400');
                }
            }
        }
    }, [timeUsed, totalTime, isPremium]);

    if (!isPremium) return null;

    return null;
};

export default PacingAlert;
