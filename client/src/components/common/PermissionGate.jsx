import React from 'react';
import useUserRole from '../../hooks/useUserRole';
import { Lock } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * Wrapper to hide or lock content based on user rights.
 * @param {string} type - 'hide' (remove entirely) or 'lock' (show with opacity + lock icon)
 * @param {string} requiredTier - 'member' or 'premium'
 */
const PermissionGate = ({ children, type = 'hide', requiredTier = 'premium', fallback = null }) => {
    const { isMember, isPremium, isGuest } = useUserRole();

    let hasAccess = false;
    if (requiredTier === 'member') {
        hasAccess = isMember || isPremium; // Member or better
    } else if (requiredTier === 'premium') {
        hasAccess = isPremium;
    }

    if (hasAccess) {
        return <>{children}</>;
    }

    if (type === 'hide') {
        return fallback;
    }

    if (type === 'lock') {
        return (
            <div className="relative group cursor-not-allowed">
                <div className="opacity-40 pointer-events-none select-none filter blur-sm transition-all duration-300">
                    {children}
                </div>
                <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                    <div className="bg-gray-900/80 text-white px-4 py-2 rounded-full flex items-center shadow-xl transform group-hover:scale-105 transition-transform">
                        <Lock className="w-4 h-4 mr-2" />
                        <span className="text-xs font-bold uppercase tracking-wider">
                            {requiredTier === 'premium' ? 'Premium Only' : 'Members Only'}
                        </span>
                    </div>
                    {/* Optional: Add Upgrade Link if locking premium features */}
                    {requiredTier === 'premium' && !isGuest && (
                        <Link to="/pricing" className="mt-2 text-xs text-primary font-bold hover:underline bg-white/90 px-2 py-1 rounded shadow-sm">
                            Upgrade Now
                        </Link>
                    )}
                </div>
            </div>
        );
    }

    return null;
};

export default PermissionGate;
