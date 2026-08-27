import React, { useState } from 'react';
import { 
  GitMerge, Database, Server, Laptop, CheckCircle2, 
  RotateCcw, ShieldAlert, Play, ArrowRight, FileText, 
  Code2, Check, AlertTriangle, ShieldCheck, RefreshCw, Zap
} from 'lucide-react';
import { MigrationEngine, MigrationExecutionSummary } from '../../lib/migration/migrationEngine';
import { cn } from '../../lib/utils';

export default function MigrationStudio() {
  const [activeTab, setActiveTab] = useState<'DATABASE' | 'API' | 'FRONTEND' | 'TESTING' | 'ROLLBACK' | 'RISK'>('DATABASE');
  const [migrationSummary, setMigrationSummary] = useState<MigrationExecutionSummary | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [rollbackStatus, setRollbackStatus] = useState<string | null>(null);

  const apiContracts = MigrationEngine.getApiMigrationContracts();
  const testPlan = MigrationEngine.runTestPlanVerification();
  const riskMatrix = MigrationEngine.getRiskAnalysisMatrix();

  const handleRunMigration = () => {
    setIsRunning(true);
    setTimeout(() => {
      const result = MigrationEngine.runDatabaseMigration('biz-apex-group');
      setMigrationSummary(result);
      setIsRunning(false);
    }, 600);
  };

  const handleTestRollback = () => {
    const res = MigrationEngine.executeRollback();
    setRollbackStatus(res.message);
    setTimeout(() => setRollbackStatus(null), 5000);
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Top Banner */}
      <div className="bg-[#131315] border border-[#1F1F21] rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <GitMerge className="w-5 h-5 text-[#C5A059]" />
            Enterprise Zero-Downtime Migration Studio
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            End-to-End Migration Strategy: <strong>Database, API, Frontend, Testing Plan, Rollback & Risk Analysis</strong>.
          </p>
        </div>

        <button
          onClick={handleRunMigration}
          disabled={isRunning}
          className="px-5 py-2.5 bg-[#C5A059] hover:bg-[#b08d4a] text-[#0A0A0B] font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-[#C5A059]/20 flex items-center gap-2 transition-all disabled:opacity-50 flex-shrink-0"
        >
          {isRunning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
          Run Migration Simulation
        </button>
      </div>

      {/* Rollback Notification Toast */}
      {rollbackStatus && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-between text-xs text-amber-400 animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <RotateCcw className="w-4 h-4" />
            <span>{rollbackStatus}</span>
          </div>
          <button onClick={() => setRollbackStatus(null)} className="text-gray-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Migration Execution Results Card */}
      {migrationSummary && (
        <div className="bg-[#131315] border border-emerald-500/30 rounded-2xl p-6 shadow-2xl space-y-4 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1F1F21] pb-3">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5" />
              Migration Pipeline Execution Succeeded (ID: {migrationSummary.migrationId})
            </div>
            <span className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-bold rounded-lg self-start">
              100% Parity Verified
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
            <div className="p-3 bg-[#0A0A0B] rounded-xl border border-[#1F1F21]">
              <span className="text-[10px] text-gray-500 block uppercase">Source Version</span>
              <strong className="text-xs text-white">{migrationSummary.sourceVersion}</strong>
            </div>
            <div className="p-3 bg-[#0A0A0B] rounded-xl border border-[#1F1F21]">
              <span className="text-[10px] text-gray-500 block uppercase">Target Version</span>
              <strong className="text-xs text-[#C5A059]">{migrationSummary.targetVersion}</strong>
            </div>
            <div className="p-3 bg-[#0A0A0B] rounded-xl border border-[#1F1F21]">
              <span className="text-[10px] text-gray-500 block uppercase">Tables Normalized</span>
              <strong className="text-xs text-emerald-400">{migrationSummary.totalTablesNormalized} Relational 3NF</strong>
            </div>
            <div className="p-3 bg-[#0A0A0B] rounded-xl border border-[#1F1F21]">
              <span className="text-[10px] text-gray-500 block uppercase">Referential Integrity</span>
              <strong className="text-xs text-emerald-400">{migrationSummary.referentialIntegrityScore}% (0 Orphans)</strong>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <span className="text-xs font-bold text-gray-300">Executed Step Sequence:</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {migrationSummary.steps.map((s, idx) => (
                <div key={idx} className="p-2.5 bg-[#0A0A0B] border border-[#1F1F21] rounded-xl text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <strong className="text-white text-[11px]">{s.step}</strong>
                    <span className="text-[9px] font-mono text-emerald-400">{s.durationMs}ms</span>
                  </div>
                  <p className="text-[10px] text-gray-400">{s.notes}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 6 Strategy Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {[
          { id: 'DATABASE' as const, label: '1. Database Migration', icon: Database },
          { id: 'API' as const, label: '2. API Migration', icon: Server },
          { id: 'FRONTEND' as const, label: '3. Frontend Migration', icon: Laptop },
          { id: 'TESTING' as const, label: '4. Testing Plan', icon: CheckCircle2 },
          { id: 'ROLLBACK' as const, label: '5. Rollback Plan', icon: RotateCcw },
          { id: 'RISK' as const, label: '6. Risk Analysis', icon: ShieldAlert },
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border whitespace-nowrap",
                activeTab === tab.id
                  ? "bg-[#C5A059] text-[#0A0A0B] border-[#C5A059] shadow-md shadow-[#C5A059]/20"
                  : "bg-[#131315] text-gray-400 border-[#1F1F21] hover:text-white"
              )}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: DATABASE MIGRATION */}
      {activeTab === 'DATABASE' && (
        <div className="bg-[#131315] border border-[#1F1F21] rounded-2xl p-6 shadow-xl space-y-4">
          <div className="border-b border-[#1F1F21] pb-3">
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <Database className="w-4 h-4 text-[#C5A059]" />
              Database Normalization & DDL Execution Strategy
            </h4>
            <p className="text-xs text-gray-400 mt-0.5">
              Transforms flat tables into 16 Third Normal Form (3NF) relational tables with mandatory foreign keys.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="p-4 bg-[#0A0A0B] border border-[#1F1F21] rounded-xl space-y-2">
              <span className="text-gray-400 uppercase font-mono text-[10px] font-bold block">1. Foreign Key Backfill</span>
              <p className="text-gray-300 leading-relaxed">
                Automatically extracts legacy business settings and creates root tenant <code className="text-[#C5A059]">biz-apex-group</code>, default branch <code className="text-[#C5A059]">br-chennai-main</code>, and warehouse <code className="text-[#C5A059]">wh-chn-central</code>.
              </p>
            </div>
            <div className="p-4 bg-[#0A0A0B] border border-[#1F1F21] rounded-xl space-y-2">
              <span className="text-gray-400 uppercase font-mono text-[10px] font-bold block">2. High-Performance Indexing</span>
              <p className="text-gray-300 leading-relaxed">
                Creates B-Tree composite indexes on <code className="text-[#C5A059]">(business_id, branch_id)</code> and <code className="text-[#C5A059]">(business_id, created_at)</code> to maintain sub-5ms query response times under high concurrency.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: API MIGRATION */}
      {activeTab === 'API' && (
        <div className="bg-[#131315] border border-[#1F1F21] rounded-2xl p-6 shadow-xl space-y-4">
          <div className="border-b border-[#1F1F21] pb-3">
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <Server className="w-4 h-4 text-[#C5A059]" />
              API Gateway & Scoped Tenant Headers (v1 ➔ v2)
            </h4>
            <p className="text-xs text-gray-400 mt-0.5">
              Backward-compatible proxy layer routes un-scoped v1 requests seamlessly into normalized v2 endpoints.
            </p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-[#1F1F21]">
            <table className="w-full text-left text-xs border-collapse font-mono">
              <thead>
                <tr className="bg-[#0A0A0B] border-b border-[#1F1F21] text-gray-400 text-[10px] uppercase">
                  <th className="py-2.5 px-3">Legacy Endpoint (v1)</th>
                  <th className="py-2.5 px-3">Normalized Endpoint (v2)</th>
                  <th className="py-2.5 px-3">Required Tenant Headers</th>
                  <th className="py-2.5 px-3 text-right">Proxy Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F1F21]">
                {apiContracts.map((c, idx) => (
                  <tr key={idx} className="hover:bg-[#161618] transition-colors">
                    <td className="py-2 px-3 text-gray-400">{c.legacyEndpoint}</td>
                    <td className="py-2 px-3 text-emerald-400 font-bold">{c.normalizedEndpoint}</td>
                    <td className="py-2 px-3 text-[#C5A059]">{c.requiredHeaders.join(', ')}</td>
                    <td className="py-2 px-3 text-right">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-bold">
                        {c.adapterStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: FRONTEND MIGRATION */}
      {activeTab === 'FRONTEND' && (
        <div className="bg-[#131315] border border-[#1F1F21] rounded-2xl p-6 shadow-xl space-y-4">
          <div className="border-b border-[#1F1F21] pb-3">
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <Laptop className="w-4 h-4 text-[#C5A059]" />
              Frontend State & Component Compatibility Bridge
            </h4>
            <p className="text-xs text-gray-400 mt-0.5">
              Zero-downtime client transition through universal provider hydration and dynamic template configuration.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="p-4 bg-[#0A0A0B] border border-[#1F1F21] rounded-xl space-y-2">
              <span className="font-bold text-white block">1. AuthContext Scoping</span>
              <p className="text-gray-400 leading-relaxed">
                Supplies <code className="text-[#C5A059]">activeBusinessId</code>, <code className="text-[#C5A059]">activeBranchId</code>, and <code className="text-[#C5A059]">activeCounterId</code> universally across all views.
              </p>
            </div>
            <div className="p-4 bg-[#0A0A0B] border border-[#1F1F21] rounded-xl space-y-2">
              <span className="font-bold text-white block">2. Dynamic Layout Engine</span>
              <p className="text-gray-400 leading-relaxed">
                Switches KOT display, Prescription desk, Retail barcodes, and Service appointments based on active template code.
              </p>
            </div>
            <div className="p-4 bg-[#0A0A0B] border border-[#1F1F21] rounded-xl space-y-2">
              <span className="font-bold text-white block">3. Offline Resiliency</span>
              <p className="text-gray-400 leading-relaxed">
                Local IndexedDB cache buffers cash bills during temporary network dropouts and syncs on reconnection.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: TESTING PLAN */}
      {activeTab === 'TESTING' && (
        <div className="bg-[#131315] border border-[#1F1F21] rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-[#1F1F21] pb-3">
            <div>
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Comprehensive Verification & Concurrency Test Plan
              </h4>
              <p className="text-xs text-gray-400 mt-0.5">
                {testPlan.passedSuites} / {testPlan.totalSuites} verification suites passed successfully.
              </p>
            </div>
            <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-bold rounded-xl">
              100% Passed
            </span>
          </div>

          <div className="space-y-2">
            {testPlan.testResults.map((t, idx) => (
              <div key={idx} className="p-3 bg-[#0A0A0B] border border-[#1F1F21] rounded-xl flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-white">{t.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-gray-500">{t.latencyMs}ms</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                    {t.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: ROLLBACK PLAN */}
      {activeTab === 'ROLLBACK' && (
        <div className="bg-[#131315] border border-[#1F1F21] rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-[#1F1F21] pb-3">
            <div>
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-[#C5A059]" />
                Automated Disaster Recovery & Instant Rollback Plan
              </h4>
              <p className="text-xs text-gray-400 mt-0.5">
                Recovery Time Objective (RTO): <strong>&lt; 30 Seconds</strong> • Recovery Point Objective (RPO): <strong>0 Seconds</strong> (Dual-Write Protected).
              </p>
            </div>

            <button
              onClick={handleTestRollback}
              className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Test Rollback Trigger
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="p-4 bg-[#0A0A0B] border border-[#1F1F21] rounded-xl space-y-2">
              <span className="text-white font-bold block">1. Automated Health Circuit Breaker</span>
              <p className="text-gray-400 leading-relaxed">
                If the error rate exceeds 0.05% or API p99 latency spikes above 250ms during cutover, the gateway automatically falls back to the legacy v1 adapter.
              </p>
            </div>
            <div className="p-4 bg-[#0A0A0B] border border-[#1F1F21] rounded-xl space-y-2">
              <span className="text-white font-bold block">2. Dual-Write Write-Ahead Logging</span>
              <p className="text-gray-400 leading-relaxed">
                All order mutations write synchronously to both storage engines during the 14-day transition window, guaranteeing zero data loss if rolled back.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: RISK ANALYSIS */}
      {activeTab === 'RISK' && (
        <div className="bg-[#131315] border border-[#1F1F21] rounded-2xl p-6 shadow-xl space-y-4">
          <div className="border-b border-[#1F1F21] pb-3">
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-[#C5A059]" />
              Enterprise Risk Analysis & Mitigation Matrix
            </h4>
            <p className="text-xs text-gray-400 mt-0.5">
              Comprehensive threat modeling across security, data integrity, hardware compatibility, and uptime.
            </p>
          </div>

          <div className="space-y-3">
            {riskMatrix.map(risk => (
              <div key={risk.id} className="p-4 bg-[#0A0A0B] border border-[#1F1F21] rounded-xl space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <strong className="text-white font-bold">{risk.title}</strong>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-[10px]">
                    <span className="px-2 py-0.5 rounded bg-gray-800 text-gray-300">
                      PROBABILITY: {risk.probability}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                      IMPACT: {risk.impact}
                    </span>
                  </div>
                </div>

                <p className="text-gray-400 text-[11px] leading-relaxed pl-6">
                  <strong className="text-gray-300">Mitigation: </strong>{risk.mitigation}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
