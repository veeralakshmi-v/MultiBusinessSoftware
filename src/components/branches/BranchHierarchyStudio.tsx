import React, { useState } from 'react';
import { 
  Building2, MapPin, Store, Monitor, ArrowRightLeft, 
  Check, Plus, ShieldCheck, ChevronRight, RefreshCw, Box, AlertCircle
} from 'lucide-react';
import { 
  BranchEngine, 
  DEFAULT_BUSINESS, 
  DEFAULT_BRANCHES, 
  DEFAULT_WAREHOUSES, 
  DEFAULT_COUNTERS 
} from '../../lib/branches/branchEngine';
import { Branch, Warehouse, BillingCounter } from '../../types/branch';
import { cn } from '../../lib/utils';

export default function BranchHierarchyStudio() {
  const [selectedBranchId, setSelectedBranchId] = useState<string>(DEFAULT_BRANCHES[0].id);
  const [transferProductId, setTransferProductId] = useState<string>('prod-rice-01');
  const [transferQty, setTransferQty] = useState<number>(10);
  const [transferMessage, setTransferMessage] = useState<{ success: boolean; text: string } | null>(null);

  const branches = BranchEngine.getBranches();
  const selectedBranch = branches.find(b => b.id === selectedBranchId) || branches[0];
  const warehouses = BranchEngine.getWarehouses(selectedBranch.id);
  const counters = BranchEngine.getCounters(selectedBranch.id);

  const handleStockTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (warehouses.length < 2) {
      setTransferMessage({ success: false, text: 'Need at least 2 warehouses in this branch to transfer stock' });
      return;
    }
    const fromWh = warehouses[0].id;
    const toWh = warehouses[1].id;
    const res = BranchEngine.transferStock(transferProductId, fromWh, toWh, Number(transferQty));
    setTransferMessage({ success: res.success, text: res.message });
    setTimeout(() => setTransferMessage(null), 5000);
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Transfer Message Toast */}
      {transferMessage && (
        <div className={cn(
          "p-3 rounded-2xl border flex items-center justify-between text-xs animate-in fade-in duration-200",
          transferMessage.success
            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
            : "bg-red-500/10 border-red-500/30 text-red-400"
        )}>
          <div className="flex items-center gap-2">
            {transferMessage.success ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{transferMessage.text}</span>
          </div>
          <button onClick={() => setTransferMessage(null)} className="text-gray-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Header */}
      <div className="bg-[#131315] border border-[#1F1F21] rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#C5A059]" />
            Multi-Branch Hierarchy & Entity Scoping
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            4-Tier strict data isolation: <strong>Business → Branch → Warehouse → Counter</strong>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl bg-[#1A1A1C] border border-[#2D2D30] text-xs text-gray-300 font-mono">
            Organization: <strong className="text-[#C5A059]">{DEFAULT_BUSINESS.name}</strong>
          </div>
        </div>
      </div>

      {/* Level 1: Business Overview Card */}
      <div className="bg-[#161618] border border-[#C5A059]/30 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-[#0A0A0B] border border-[#C5A059]/40 flex items-center justify-center text-[#C5A059]">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded bg-[#C5A059]/10 text-[#C5A059] border border-[#C5A059]/20">
                LEVEL 1: BUSINESS ROOT
              </span>
              <span className="text-xs text-gray-400 font-mono">GSTIN: {DEFAULT_BUSINESS.gstin}</span>
            </div>
            <h4 className="text-base font-bold text-white mt-0.5">{DEFAULT_BUSINESS.name}</h4>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-gray-400">
          <span>Active Branches: <strong className="text-white">{branches.length}</strong></span>
          <span>•</span>
          <span>Warehouses: <strong className="text-white">{DEFAULT_WAREHOUSES.length}</strong></span>
          <span>•</span>
          <span>Counters: <strong className="text-white">{DEFAULT_COUNTERS.length}</strong></span>
        </div>
      </div>

      {/* Level 2: Branch Selector Tabs */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-[#C5A059]" />
            Level 2: Select Branch / Outlet Location
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {branches.map(branch => {
            const isSelected = branch.id === selectedBranchId;
            return (
              <div
                key={branch.id}
                onClick={() => setSelectedBranchId(branch.id)}
                className={cn(
                  "p-4 rounded-2xl border transition-all cursor-pointer space-y-2 relative shadow-md",
                  isSelected
                    ? "bg-[#1A1A1D] border-[#C5A059] shadow-lg shadow-[#C5A059]/10"
                    : "bg-[#131315] border-[#1F1F21] hover:border-[#2D2D30]"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#0A0A0B] text-[#C5A059] border border-[#2D2D30]">
                    {branch.code}
                  </span>
                  {branch.isMainBranch && (
                    <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      FLAGSHIP
                    </span>
                  )}
                </div>
                <div>
                  <h5 className="font-bold text-white text-sm">{branch.name}</h5>
                  <p className="text-xs text-gray-400 truncate">{branch.city} • {branch.address}</p>
                </div>
                <div className="text-[10px] text-gray-500 font-mono pt-1">
                  📞 {branch.phone}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Level 3 & Level 4 Grid for Selected Branch */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* Level 3: Warehouses in this Branch */}
        <div className="bg-[#131315] border border-[#1F1F21] rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-[#1F1F21] pb-3">
            <div>
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <Box className="w-4 h-4 text-[#C5A059]" />
                Level 3: Warehouses & Stock Depots
              </h4>
              <p className="text-[11px] text-gray-400">Inventory isolated per warehouse in {selectedBranch.city}</p>
            </div>
            <span className="px-2 py-0.5 rounded bg-[#0A0A0B] border border-[#2D2D30] text-[10px] font-mono text-gray-300">
              {warehouses.length} Warehouses
            </span>
          </div>

          <div className="space-y-3">
            {warehouses.map(wh => {
              const currentStock = BranchEngine.getWarehouseStock('prod-rice-01', wh.id);
              return (
                <div key={wh.id} className="p-3.5 bg-[#0A0A0B] border border-[#2D2D30] rounded-xl flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <h5 className="font-bold text-white text-xs">{wh.name}</h5>
                      {wh.isPrimary && (
                        <span className="text-[9px] font-mono text-[#C5A059] bg-[#C5A059]/10 px-1.5 py-0.2 rounded">
                          PRIMARY
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-gray-400 font-mono">Code: {wh.code} • Max Capacity: {wh.capacity.toLocaleString()} units</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-gray-400 block font-mono">Sample Stock:</span>
                    <span className="text-xs font-bold text-emerald-400 font-mono">{currentStock} units</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Inter-Warehouse Stock Transfer Box */}
          {warehouses.length >= 2 && (
            <form onSubmit={handleStockTransfer} className="p-3 bg-[#161618] border border-[#2D2D30] rounded-xl space-y-2 pt-3">
              <label className="text-[11px] font-bold text-white flex items-center gap-1.5">
                <ArrowRightLeft className="w-3.5 h-3.5 text-[#C5A059]" />
                Inter-Warehouse Stock Transfer Simulator
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={transferQty}
                  onChange={e => setTransferQty(Number(e.target.value))}
                  className="w-20 bg-[#0A0A0B] border border-[#2D2D30] rounded-lg px-2 py-1 text-xs text-white text-center outline-none focus:border-[#C5A059]"
                />
                <span className="text-[11px] text-gray-400">units from {warehouses[0].code} ➔ {warehouses[1].code}</span>
                <button
                  type="submit"
                  className="ml-auto px-3 py-1 bg-[#C5A059] hover:bg-[#b08d4a] text-[#0A0A0B] font-bold text-xs rounded-lg transition-colors"
                >
                  Transfer
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Level 4: Billing Counters in this Branch */}
        <div className="bg-[#131315] border border-[#1F1F21] rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-[#1F1F21] pb-3">
            <div>
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <Monitor className="w-4 h-4 text-[#C5A059]" />
                Level 4: POS Billing Terminals & Counters
              </h4>
              <p className="text-[11px] text-gray-400">Isolated cash drawers, orders, and sessions</p>
            </div>
            <span className="px-2 py-0.5 rounded bg-[#0A0A0B] border border-[#2D2D30] text-[10px] font-mono text-gray-300">
              {counters.length} Active Counters
            </span>
          </div>

          <div className="space-y-3">
            {counters.map(counter => (
              <div key={counter.id} className="p-3.5 bg-[#0A0A0B] border border-[#2D2D30] rounded-xl flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#161618] text-[#C5A059] border border-[#2D2D30]">
                      {counter.counterNumber}
                    </span>
                    <h5 className="font-bold text-white text-xs">{counter.name}</h5>
                  </div>
                  <p className="text-[10px] text-gray-400">
                    Type: <strong className="text-gray-300">{counter.type}</strong> • Cashier: <strong className="text-[#C5A059]">{counter.activeCashierName || 'Unassigned'}</strong>
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {counter.status}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
