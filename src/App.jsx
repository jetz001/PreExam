import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './views/Home';
import Login from './views/Login';
import Register from './views/Register';
import Dashboard from './views/Dashboard';
import Exam from './views/Exam';
// import Admin from './views/Admin'; // Replaced by detailed admin routes
import AdminLayout from './layouts/AdminLayout';
import DashboardOverview from './views/admin/DashboardOverview';
import BusinessManager from './views/admin/BusinessManager';
import QuestionManager from './views/admin/QuestionManager';
import PaymentManager from './views/admin/PaymentManager';
import UserManager from './views/admin/UserManager';
import NewsManager from './views/admin/NewsManager';
import CommunityManager from './views/admin/CommunityManager';
import InboxManager from './views/admin/InboxManager';
import SettingsManager from './views/admin/SettingsManager';
import LegalManager from './views/admin/LegalManager';
import RoomManager from './views/admin/RoomManager';
import PaymentVerifier from './views/admin/PaymentVerifier';
import PricingPage from './views/PricingPage';
import ContactPage from './views/support/ContactPage';
import TicketDetail from './views/support/TicketDetail';
import SupportTicketManager from './views/admin/SupportTicketManager';
import BackupManager from './views/admin/BackupManager'; // New Import
import ScraperManager from './views/admin/ScraperManager';
import GeneratorManager from './views/admin/GeneratorManager';
import PolicyPage from './views/PolicyPage';
import FAQPage from './views/support/FAQPage';



import MainLayout from './layouts/MainLayout';

import Community from './views/Community';
import News from './views/News';

import NewsDetail from './views/NewsDetail';

import PremiumUpgrade from './views/PremiumUpgrade';
import Lobby from './views/Lobby';
import Room from './views/Room';
import ProfilePage from './views/user/ProfilePage';
import SettingsPage from './views/user/SettingsPage';
import ExamResult from './views/ExamResult';
import PaymentSuccess from './views/PaymentSuccess';
import PaymentCancel from './views/PaymentCancel';
// Business & Ads
import BusinessLayout from './layouts/BusinessLayout';
import BusinessRegister from './views/auth/BusinessRegister';
import BusinessLogin from './views/auth/BusinessLogin';
import BusinessDashboard from './views/business/BusinessDashboard';
import BusinessContentManager from './views/business/BusinessContentManager';
import BusinessInbox from './views/business/BusinessInbox';
import BusinessWelcome from './views/business/BusinessWelcome';
import LearningCenter from './views/LearningCenter/LearningCenter';
import BusinessProfile from './views/LearningCenter/BusinessProfile';
import AdCreator from './views/business/AdCreator';
import MyAds from './views/business/MyAds';
import BusinessSettings from './views/business/BusinessSettings';
import BusinessWallet from './views/business/BusinessWallet';
import AdsManager from './views/admin/AdsManager';
import SafetyInterstitial from './views/SafetyInterstitial';
import FloatingHelpWidget from './components/support/FloatingHelpWidget';
import PrivacyBanner from './components/common/PrivacyBanner';


import { useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';

import ForgotPassword from './views/auth/ForgotPassword';
import ResetPassword from './views/auth/ResetPassword';

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
        {/* ── Standalone (no old Navbar/Footer) ── */}
        <Route path="/" element={<Home />} />
        <Route path="/exam" element={<Exam />} />
        <Route path="/exam/result/:id" element={<ExamResult />} />

        <Route element={<MainLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/profile/:id" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
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
            <Route path="scraper" element={<ScraperManager />} />
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
      {/* <PrivacyBanner /> - Temporarily disabled per user request (Clarity Feedback) */}
    </>

  );
}

export default App;
