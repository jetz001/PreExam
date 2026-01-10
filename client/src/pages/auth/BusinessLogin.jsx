import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const BusinessLogin = () => {
    const navigate = useNavigate();

    useEffect(() => {
        // Redirect to unified login
        navigate('/login');
    }, [navigate]);

    return null;
};

export default BusinessLogin;
