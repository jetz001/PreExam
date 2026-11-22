import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import BrandLogo from '../../components/common/BrandLogo';

const BusinessLogin = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to unified login
    navigate('/login');
  }, [navigate]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[radial-gradient(circle_at_top,#4f46e5_0%,#3b0764_48%,#1e1b4b_100%)] px-4 text-white">
      <div className="glass-panel flex flex-col items-center gap-4 rounded-3xl border border-white/20 bg-slate-900/45 px-8 py-7 text-center shadow-2xl">
        <BrandLogo variant="dark" size="md" badge="BUSINESS" />
        <div className="inline-flex items-center gap-2 text-sm font-semibold text-slate-200">
          <Loader2 size={16} className="animate-spin text-amber-300" />
          กำลังพาไปยังหน้าเข้าสู่ระบบ...
        </div>
      </div>
    </div>
  );
};

export default BusinessLogin;
