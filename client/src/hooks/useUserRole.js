import { useAuth } from '../context/AuthContext';

const useUserRole = () => {
    const { user } = useAuth();

    if (!user) {
        return {
            isGuest: true,
            isMember: false,
            isPremium: false,
            role: 'guest'
        };
    }

    const isPremium = user.plan_type === 'premium' &&
        (!user.premium_expiry || new Date(user.premium_expiry) > new Date());

    return {
        isGuest: false,
        isMember: true,
        isPremium,
        role: isPremium ? 'premium' : 'member',
        user
    };
};

export default useUserRole;
