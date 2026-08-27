import React, { useState } from 'react';
import { 
  Shield, Check, X, Lock, Eye, EyeOff, Edit3, 
  Building2, MapPin, Sliders, Monitor, Zap, KeyRound, Sparkles
} from 'lucide-react';
import { DEFAULT_ROLE_POLICIES, PermissionEngine } from '../../lib/permissions/permissionEngine';
import { RolePermissionPolicy, FieldAccessLevel } from '../../types/permissions';
import { cn } from '../../lib/utils';

export default function PermissionMatrixViewer() {
  const [selectedRole, setSelectedRole] = useState<string>('CASHIER');
  const policy: RolePermissionPolicy = DEFAULT_ROLE_POLICIES[selectedRole] || DEFAULT_ROLE_POLICIES.CASHIER;

  const testUser = {
    userId: `user-test-${selectedRole.toLowerCase()}`,
    role: selectedRole,
  };

  const sampleFields = [
    { key: 'costPrice', label: 'Cost Price (Purchase Rate)', sensitive: true },
    { key: 'sellingPrice', label: 'Selling Price (POS Retail Rate)', sensitive: false },
    { key: 'profitMargin', label: 'Profit Margin & Markup %', sensitive: true },
    { key: 'mrp', label: 'Maximum Retail Price (MRP)', sensitive: false },
    { key: 'discount', label: 'Custom Item Discount %', sensitive: false },
    { key: 'tax', label: 'GST Tax Percentage', sensitive: false },
    { key: 'batchNumber', label: 'Drug / Product Batch No', sensitive: false },
    { key: 'expiryDate', label: 'Expiry Date', sensitive: false },
  ];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-[#131315] border border-[#1F1F21] rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#C5A059]" />
            6-Tier Granular Permission Matrix (RBAC & Attribute Access)
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Configurable 6-level security scoping across Business, Branch, Module, Screen, Action, and Field levels.
          </p>
        </div>
        <div className="px-3 py-1.5 rounded-xl bg-[#1A1A1C] border border-[#2D2D30] text-xs text-gray-300 font-mono">
          Security Tiers: <strong className="text-[#C5A059]">6 Active Levels</strong>
        </div>
      </div>

      {/* Role Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {Object.values(DEFAULT_ROLE_POLICIES).map(p => (
          <button
            key={p.role}
            onClick={() => setSelectedRole(p.role)}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-bold transition-all border whitespace-nowrap",
              selectedRole === p.role
                ? "bg-[#C5A059] text-[#0A0A0B] border-[#C5A059] shadow-md shadow-[#C5A059]/20"
                : "bg-[#131315] text-gray-400 border-[#1F1F21] hover:text-white"
            )}
          >
            {p.name} ({p.role})
          </button>
        ))}
      </div>

      {/* Role Overview Banner */}
      <div className="p-4 bg-[#161618] border border-[#1F1F21] rounded-2xl flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-[#C5A059]" />
            {policy.name} Policy Definition
          </h4>
          <p className="text-xs text-gray-400 mt-0.5">{policy.description}</p>
        </div>
        <span className="px-2.5 py-1 rounded-lg bg-[#0A0A0B] border border-[#2D2D30] text-[11px] font-mono text-[#C5A059] font-bold">
          ROLE: {policy.role}
        </span>
      </div>

      {/* 6-Tier Matrix Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        
        {/* Tier 1: Business Level */}
        <div className="bg-[#131315] border border-[#1F1F21] rounded-2xl p-5 shadow-lg space-y-3">
          <div className="flex items-center gap-2 text-white font-bold text-xs border-b border-[#1F1F21] pb-2.5">
            <Building2 className="w-4 h-4 text-[#C5A059]" />
            1. Business Level Scope
          </div>
          <div className="space-y-2">
            <div className="p-2.5 bg-[#0A0A0B] border border-[#2D2D30] rounded-xl text-xs">
              <span className="text-gray-400">Allowed Scope: </span>
              <strong className="text-white font-mono">{policy.businessScope.join(', ')}</strong>
            </div>
            <p className="text-[11px] text-gray-400">
              {policy.businessScope.includes('*') ? 'Unrestricted access to all corporate organizations.' : 'Scoped strictly to assigned business entity.'}
            </p>
          </div>
        </div>

        {/* Tier 2: Branch Level */}
        <div className="bg-[#131315] border border-[#1F1F21] rounded-2xl p-5 shadow-lg space-y-3">
          <div className="flex items-center gap-2 text-white font-bold text-xs border-b border-[#1F1F21] pb-2.5">
            <MapPin className="w-4 h-4 text-[#C5A059]" />
            2. Branch Level Scope
          </div>
          <div className="space-y-2">
            <div className="p-2.5 bg-[#0A0A0B] border border-[#2D2D30] rounded-xl text-xs">
              <span className="text-gray-400">Allowed Outlets: </span>
              <strong className="text-white font-mono">{policy.branchScope.join(', ')}</strong>
            </div>
            <p className="text-[11px] text-gray-400">
              {policy.branchScope.includes('*') ? 'Multi-outlet roaming enabled.' : 'Restricted to home branch location.'}
            </p>
          </div>
        </div>

        {/* Tier 3: Module Level */}
        <div className="bg-[#131315] border border-[#1F1F21] rounded-2xl p-5 shadow-lg space-y-3">
          <div className="flex items-center gap-2 text-white font-bold text-xs border-b border-[#1F1F21] pb-2.5">
            <Sliders className="w-4 h-4 text-[#C5A059]" />
            3. Module Level Access
          </div>
          <div className="flex flex-wrap gap-1.5">
            {policy.allowedModules.includes('*') ? (
              <span className="px-2 py-1 rounded bg-[#0A0A0B] border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-bold">
                ALL MODULES ENABLED (*)
              </span>
            ) : (
              policy.allowedModules.map(m => (
                <span key={m} className="px-2 py-0.5 rounded bg-[#0A0A0B] border border-[#2D2D30] text-[#C5A059] text-[10px] font-mono">
                  {m}
                </span>
              ))
            )}
          </div>
        </div>

        {/* Tier 4: Screen Level */}
        <div className="bg-[#131315] border border-[#1F1F21] rounded-2xl p-5 shadow-lg space-y-3">
          <div className="flex items-center gap-2 text-white font-bold text-xs border-b border-[#1F1F21] pb-2.5">
            <Monitor className="w-4 h-4 text-[#C5A059]" />
            4. Screen Level Access
          </div>
          <div className="flex flex-wrap gap-1.5">
            {policy.allowedScreens.map(s => (
              <span key={s} className="px-2 py-0.5 rounded bg-[#0A0A0B] border border-[#2D2D30] text-gray-300 text-[10px] font-mono">
                {s.replace('SCREEN_', '')}
              </span>
            ))}
          </div>
        </div>

        {/* Tier 5: Action Level */}
        <div className="bg-[#131315] border border-[#1F1F21] rounded-2xl p-5 shadow-lg space-y-3 md:col-span-2">
          <div className="flex items-center gap-2 text-white font-bold text-xs border-b border-[#1F1F21] pb-2.5">
            <Zap className="w-4 h-4 text-[#C5A059]" />
            5. Action Level Permissions (Operations)
          </div>
          <div className="flex flex-wrap gap-1.5">
            {policy.allowedActions.map(a => (
              <span key={a} className="px-2 py-0.5 rounded bg-[#0A0A0B] border border-emerald-500/30 text-emerald-400 text-[10px] font-mono flex items-center gap-1">
                <Check className="w-3 h-3" />
                {a}
              </span>
            ))}
          </div>
        </div>

      </div>

      {/* Tier 6: Field Level Data Security & Visibility */}
      <div className="bg-[#131315] border border-[#1F1F21] rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-[#1F1F21] pb-3">
          <div>
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Lock className="w-5 h-5 text-[#C5A059]" />
              6. Field Level Access & Visibility Rules
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Granular data security for financial and sensitive attributes (e.g. <strong>Cashier can View Cost, but Cannot Edit Cost</strong>).
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#1F1F21] text-gray-400 uppercase tracking-wider text-[10px] font-mono">
                <th className="pb-3 px-3">Field Attribute</th>
                <th className="pb-3 px-3">Sensitivity</th>
                <th className="pb-3 px-3">Access Mode</th>
                <th className="pb-3 px-3">Can View?</th>
                <th className="pb-3 px-3">Can Edit?</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F1F21]">
              {sampleFields.map(field => {
                const accessMode: FieldAccessLevel = PermissionEngine.getFieldAccess(testUser, field.key);
                const canView = PermissionEngine.canViewField(testUser, field.key);
                const canEdit = PermissionEngine.canEditField(testUser, field.key);

                return (
                  <tr key={field.key} className="hover:bg-[#161618] transition-colors">
                    <td className="py-3 px-3 font-semibold text-white">
                      <div className="font-mono text-xs text-[#C5A059]">{field.key}</div>
                      <div className="text-[11px] text-gray-400">{field.label}</div>
                    </td>
                    <td className="py-3 px-3">
                      {field.sensitive ? (
                        <span className="px-2 py-0.5 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-mono">
                          CONFIDENTIAL
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-gray-800 text-gray-400 text-[10px] font-mono">
                          STANDARD
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <span className={cn(
                        "px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold border",
                        accessMode === 'READ_WRITE' ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" :
                        accessMode === 'READ_ONLY' ? "bg-amber-500/10 border-amber-500/30 text-amber-400" :
                        "bg-red-500/10 border-red-500/30 text-red-400"
                      )}>
                        {accessMode === 'READ_WRITE' && '✏️ READ_WRITE (Full Access)'}
                        {accessMode === 'READ_ONLY' && '👁️ READ_ONLY (View Only, Edit Blocked)'}
                        {accessMode === 'HIDDEN' && '🚫 HIDDEN (Access Denied)'}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      {canView ? (
                        <span className="text-emerald-400 flex items-center gap-1 font-bold">
                          <Eye className="w-3.5 h-3.5" /> YES
                        </span>
                      ) : (
                        <span className="text-red-400 flex items-center gap-1 font-bold">
                          <EyeOff className="w-3.5 h-3.5" /> NO
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      {canEdit ? (
                        <span className="text-emerald-400 flex items-center gap-1 font-bold">
                          <Check className="w-3.5 h-3.5" /> YES
                        </span>
                      ) : (
                        <span className="text-red-400 flex items-center gap-1 font-bold">
                          <Lock className="w-3.5 h-3.5" /> LOCKED
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
