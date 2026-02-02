import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Exam from './pages/Exam';
// import Admin from './pages/Admin'; // Replaced by detailed admin routes
import AdminLayout from './layouts/AdminLayout';
import DashboardOverview from './pages/admin/DashboardOverview';
import BusinessManager from './pages/admin/BusinessManager';
import QuestionManager from './pages/admin/QuestionManager';
import PaymentManager from './pages/admin/PaymentManager';
import UserManager from './pages/admin/UserManager';
import NewsManager from './pages/admin/NewsManager';
import CommunityManager from './pages/admin/CommunityManager';
import InboxManager from './pages/admin/InboxManager';
import SettingsManager from './pages/admin/SettingsManager';
import LegalManager from './pages/admin/LegalManager';
import RoomManager from './pages/admin/RoomManager';
import PaymentVerifier from './pages/admin/PaymentVerifier';
import PricingPage from './pages/PricingPage';
import ContactPage from './pages/support/ContactPage';
import TicketDetail from './pages/support/TicketDetail';
import SupportTicketManager from './pages/admin/SupportTicketManager';
import BackupManager from './pages/admin/BackupManager'; // New Import
import PolicyPage from './pages/PolicyPage';
import FAQPage from './pages/support/FAQPage';



import MainLayout from './layouts/MainLayout';

import Community from './pages/Community';
import News from './pages/News';

import NewsDetail from './pages/NewsDetail';

import PremiumUpgrade from './pages/PremiumUpgrade';
import Lobby from './pages/Lobby';
import Room from './pages/Room';
import ProfilePage from './pages/user/ProfilePage';
import SettingsPage from './pages/user/SettingsPage';
import ExamResult from './pages/ExamResult';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentCancel from './pages/PaymentCancel';
// Business & Ads
import BusinessLayout from './layouts/BusinessLayout';
import BusinessRegister from './pages/auth/BusinessRegister';
import BusinessLogin from './pages/auth/BusinessLogin';
import BusinessDashboard from './pages/business/BusinessDashboard';
import BusinessContentManager from './pages/business/BusinessContentManager';
import BusinessInbox from './pages/business/BusinessInbox';
import BusinessWelcome from './pages/business/BusinessWelcome';
import LearningCenter from './pages/LearningCenter/LearningCenter';
import BusinessProfile from './pages/LearningCenter/BusinessProfile';
import AdCreator from './pages/business/AdCreator';
import MyAds from './pages/business/MyAds';
import BusinessSettings from './pages/business/BusinessSettings';
import BusinessWallet from './pages/business/BusinessWallet';
import AdsManager from './pages/admin/AdsManager';
import SafetyInterstitial from './pages/SafetyInterstitial';
import FloatingHelpWidget from './components/support/FloatingHelpWidget';
import CookieConsent from './components/common/CookieConsent';


import { useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';

import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

function App() {
  const { user } = useAuth();

  useEffect(() => {
    const applyTheme = () => {
      const theme = user?.theme_preference || 'system';
      const root = document.documentElement;

      if (theme === 'dark') {
        root.classList.add('dark');
      } else if (theme === 'light') {
        root.classList.remove('dark');
      } else {
        // System
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
      }
    };
    applyTheme();
  }, [user?.theme_preference]);

  return (
    <>
      <Routes>
        {/* Business Routes */}
        <Route path="/auth/business/register" element={<BusinessRegister />} />
        <Route path="/auth/business/login" element={<BusinessLogin />} />
        <Route path="/business/welcome" element={<BusinessWelcome />} />

        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />


        <Route path="/business" element={<BusinessLayout />}>
          <Route index element={<BusinessDashboard />} />
          <Route path="dashboard" element={<BusinessDashboard />} />
          <Route path="content" element={<BusinessContentManager />} />
          <Route path="inbox" element={<BusinessInbox />} />
          <Route path="create-ad" element={<AdCreator />} />
          <Route path="my-ads" element={<MyAds />} />
          <Route path="wallet" element={<BusinessWallet />} />
          <Route path="settings" element={<BusinessSettings />} />
        </Route>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/profile/:id" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/exam" element={<Exam />} />
          <Route path="/exam/result/:id" element={<ExamResult />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<DashboardOverview />} />
            <Route path="businesses" element={<BusinessManager />} />
            <Route path="questions" element={<QuestionManager />} />
            <Route path="payments" element={<PaymentManager />} />
            <Route path="users" element={<UserManager />} />
            <Route path="news" element={<NewsManager />} />
            <Route path="community" element={<CommunityManager />} />
            <Route path="inbox" element={<InboxManager />} />
            <Route path="settings" element={<SettingsManager />} />
            <Route path="legal" element={<LegalManager />} />
            <Route path="rooms" element={<RoomManager />} />
            <Route path="verify-payments" element={<PaymentVerifier />} />
            <Route path="ads" element={<AdsManager />} />
            <Route path="support" element={<SupportTicketManager />} />
            <Route path="backups" element={<BackupManager />} />
          </Route>
          <Route path="/premium-upgrade" element={<PremiumUpgrade />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/community" element={<Community />} />

          {/* Public Learning Center */}
          <Route path="/learning-center" element={<LearningCenter />} />
          <Route path="/learning-center/profile/:id" element={<BusinessProfile />} />

          <Route path="/news" element={<News />} />
          <Route path="/news/:id" element={<NewsDetail />} />
          <Route path="/lobby" element={<Lobby />} />
          <Route path="/room/:id" element={<Room />} />
          <Route path="/safety" element={<SafetyInterstitial />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/policy" element={<PolicyPage />} />
          <Route path="/support/tickets/:id" element={<TicketDetail />} />
          <Route path="/payment/success" element={<PaymentSuccess />} />
          <Route path="/payment/cancel" element={<PaymentCancel />} />
        </Route>

      </Routes>
      <Toaster />
      <FloatingHelpWidget />
      <CookieConsent />
    </>

  );
}

export default App;
