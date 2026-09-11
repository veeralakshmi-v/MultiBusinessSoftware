import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, ArrowLeft, Building2, Zap } from 'lucide-react';

export default function SuperAdminImpersonationBanner() {
  const navigate = useNavigate();
  const { impersonatingTenant, exitImpersonation } = useAuth();

  if (!impersonatingTenant) return null;

  const handleReturnToSuperAdmin = () => {
    exitImpersonation();
    navigate('/super-admin');
  };

  return (
    <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-orange-700 text-white px-4 py-2 text-xs font-bold shadow-lg flex items-center justify-between sticky top-0 z-50 border-b border-amber-500/50">
      <div className="flex items-center gap-2.5">
        <div className="w-6 h-6 rounded-lg bg-black/20 flex items-center justify-center flex-shrink-0">
          <Shield className="w-3.5 h-3.5 text-amber-200" />
        </div>
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <span className="bg-black/30 px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-extrabold text-amber-200">
            Super Admin Mode
          </span>
          <span className="hidden sm:inline">Viewing Client:</span>
          <span className="underline decoration-amber-300 underline-offset-2 text-white font-extrabold">
            {impersonatingTenant.businessName}
          </span>
          <span className="text-[10px] font-mono text-amber-200 hidden md:inline">
            ({impersonatingTenant.id} • {impersonatingTenant.subscription.plan} Plan)
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={handleReturnToSuperAdmin}
          className="px-3 py-1 rounded-xl bg-black/30 hover:bg-black/50 text-white border border-amber-300/40 text-[11px] font-extrabold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs hover:scale-105 active:scale-95"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Exit to Super Admin Portal</span>
        </button>
      </div>
    </div>
  );
}
