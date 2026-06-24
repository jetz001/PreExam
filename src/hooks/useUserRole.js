import { useAuth } from '../context/AuthContext';
import { canCreateRooms, isGuestUser, isPremiumUser } from '../utils/userAccess';

const useUserRole = () => {
    const { user } = useAuth();

    const isGuest = isGuestUser(user);
    const isPremium = isPremiumUser(user);

    return {
        isGuest,
        isMember: !!user && !isGuest,
        isPremium,
        canCreateRooms: canCreateRooms(user),
        role: !user ? 'guest' : isPremium ? 'premium' : isGuest ? 'guest' : 'member',
        user
    };
};

export default useUserRole;
