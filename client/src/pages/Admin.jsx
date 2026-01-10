import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import Sidebar from '../components/admin/Sidebar';
import Analytics from '../components/admin/Analytics';

import QuestionManager from '../components/admin/QuestionManager';
import MemberManager from '../components/admin/MemberManager';

import NewsManager from '../components/admin/NewsManager';
import CommunityManager from '../components/admin/CommunityManager';

import Inbox from '../components/admin/Inbox';
import PaymentManager from '../components/admin/PaymentManager';
import AssetManager from '../components/admin/AssetManager';
import LegalManager from '../pages/admin/LegalManager';

const Admin = () => {
    const [activeTab, setActiveTab] = useState('analytics');
    const [isAuthorized, setIsAuthorized] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const user = authService.getCurrentUser();
        if (!user || user.role !== 'admin') {
            navigate('/login');
        } else {
            setIsAuthorized(true);
        }
    }, [navigate]);

    const renderContent = () => {
        switch (activeTab) {
            case 'analytics': return <Analytics />;
            case 'questions': return <QuestionManager />;
            case 'members': return <MemberManager />;
            case 'news': return <NewsManager />;
            case 'community': return <CommunityManager />;
            case 'inbox': return <Inbox />;
            case 'payments': return <PaymentManager />;
            case 'assets': return <AssetManager />;
            case 'legal': return <LegalManager />;
            default: return <Analytics />;
        }
    };

    if (!isAuthorized) {
        return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
    }

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
            <div className="flex-1 p-8 overflow-y-auto h-screen-minus-navbar">
                {renderContent()}
            </div>
        </div>
    );
};

export default Admin;
