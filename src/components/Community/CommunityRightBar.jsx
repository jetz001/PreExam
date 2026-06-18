import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import communityService from '../../services/communityService';
import userService from '../../services/userService';
import friendService from '../../services/friendService';

const CommunityRightBar = ({ onBurst, user }) => {
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [friends, setFriends] = useState([]);
    const [loadingStats, setLoadingStats] = useState(true);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const fetchedStats = await userService.getStats();
                setStats(fetchedStats);
            } catch (err) {
                console.error('Error fetching stats:', err);
                setStats({ streak: 0, wins: 0, accuracy: 0, badges: 0 }); // Fallback
            } finally {
                setLoadingStats(false);
            }

            try {
                const fetchedFriends = await friendService.getFriends();
                setFriends(fetchedFriends || []);
            } catch (err) {
                console.error('Error fetching friends:', err);
            }
        };

        fetchUserData();
    }, []);


    return null;
};

export default CommunityRightBar;
