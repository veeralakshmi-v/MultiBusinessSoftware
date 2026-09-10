import React, { useState, useEffect, useCallback } from 'react';
import {
  Users, ArrowRightLeft, Combine, Plus, RefreshCw, Trash2, X,
  CheckCircle2, Clock, Coffee, Edit3, Save, Utensils
} from 'lucide-react';
import { cn } from '../lib/utils';

interface ActiveOrder {
  id: string;
  orderNumber: string;
  customer?: { name: string } | null;
  createdAt?: string;
}

interface Table {
  id: string;
  name: string;
  status: string; // VACANT | OCCUPIED | RESERVED | CLEANING
  capacity: number;
  orders?: ActiveOrder[];
}

const STATUS_CONFIG: Record<string, { label: string; color: string; dot: string; badge: string }> = {
  VACANT:   { label: 'Available', color: 'bg-white border-gray-200 hover:border-[#2563EB]', dot: 'bg-gray-500', badge: 'text-gray-500' },
  AVAILABLE:{ label: 'Available', color: 'bg-white border-gray-200 hover:border-[#2563EB]', dot: 'bg-gray-500', badge: 'text-gray-500' },
  OCCUPIED: { label: 'Occupied',  color: 'bg-orange-500/10 border-orange-500/50',                dot: 'bg-orange-500 animate-pulse', badge: 'text-orange-400' },
  RESERVED: { label: 'Reserved',  color: 'bg-blue-500/10 border-blue-500/50',                   dot: 'bg-blue-500',   badge: 'text-blue-400' },
  CLEANING: { label: 'Cleaning',  color: 'bg-yellow-500/10 border-yellow-500/50',               dot: 'bg-yellow-400', badge: 'text-yellow-400' },
};

// Normalize DB status — old data may have AVAILABLE; treat same as VACANT
const normalizeStatus = (s: string) => (s === 'AVAILABLE' ? 'VACANT' : s);
const isVacantLike = (s: string) => s === 'VACANT' || s === 'AVAILABLE';

export default function FloorPlan() {
  const [tables, setTables] = useState<Table[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [actionMode, setActionMode] = useState<'SHIFT' | 'MERGE' | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState<Table | null>(null);
  const [newTableName, setNewTableName] = useState('');
  const [newTableCapacity, setNewTableCapacity] = useState('4');
  const [isSaving, setIsSaving] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const fetchTables = useCallback(() => {
    fetch('/api/tables')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          // Normalize each table's orders array (ensure it's always an array)
          const safe = data.map((t: any) => ({
            ...t,
            orders: Array.isArray(t.orders) ? t.orders : []
          }));
          setTables(safe);
        }
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    fetchTables();
    const interval = setInterval(fetchTables, 15000);
    return () => clearInterval(interval);
  }, [fetchTables]);

  // Table click handling for shift/merge modes
  const handleTableClick = (table: Table) => {
    // If in SHIFT mode and a source is selected, perform shift
    if (actionMode === 'SHIFT' && selectedTable && selectedTable.id !== table.id) {
      if (!isVacantLike(table.status)) {
        alert(`"${table.name}" is not vacant. Choose a vacant table to shift to.`);
        return;
      }
      setIsSaving(true);
      Promise.all([
        fetch(`/api/tables/${selectedTable.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'VACANT' })
        }),
        fetch(`/api/tables/${table.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: selectedTable.status })
        })
      ]).then(() => {
        setActionMode(null); setSelectedTable(null);
        fetchTables();
      }).finally(() => setIsSaving(false));
      return;
    }

    // If in MERGE mode and a source is selected, perform merge
    if (actionMode === 'MERGE' && selectedTable && selectedTable.id !== table.id) {
      // Extract base table numbers for clean merged name
      const baseName = (t: Table) => t.name.replace(/^Table\s*/i, '').split('+').map(s => s.trim())[0];
      const mergedName = `Table ${baseName(selectedTable)} + ${baseName(table)}`;
      setIsSaving(true);
      Promise.all([
        fetch(`/api/tables/${selectedTable.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'OCCUPIED', name: mergedName, capacity: selectedTable.capacity + table.capacity })
        }),
        fetch(`/api/tables/${table.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'VACANT', name: table.name })
        })
      ]).then(() => {
        setActionMode(null); setSelectedTable(null);
        fetchTables();
      }).finally(() => setIsSaving(false));
      return;
    }

    // Normal click — select table and show status modal
    setSelectedTable(table);
    setActionMode(null);
    setShowStatusModal(table);
  };

  const handleStatusChange = (table: Table, newStatus: string) => {
    fetch(`/api/tables/${table.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    }).then(() => {
      setShowStatusModal(null);
      setSelectedTable(null);
      fetchTables();
    });
  };

  const handleAddTable = () => {
    if (!newTableName.trim()) return;
    setIsSaving(true);
    fetch('/api/tables', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newTableName.trim(), capacity: Number(newTableCapacity) || 4 })
    }).then(() => {
      setShowAddModal(false);
      setNewTableName('');
      setNewTableCapacity('4');
      fetchTables();
    }).finally(() => setIsSaving(false));
  };

  const handleDeleteTable = (table: Table) => {
    if (table.status === 'OCCUPIED') {
      alert('Cannot delete an occupied table. Please clear the order first.');
      return;
    }
    if (!confirm(`Delete "${table.name}"? This cannot be undone.`)) return;
    fetch(`/api/tables/${table.id}`, { method: 'DELETE' }).then(() => {
      setShowStatusModal(null);
      fetchTables();
    });
  };

  const clearAction = () => {
    setActionMode(null);
    setSelectedTable(null);
  };

  const startAction = (mode: 'SHIFT' | 'MERGE', table: Table) => {
    setSelectedTable(table);
    setActionMode(mode);
    setShowStatusModal(null);
  };

  const filteredTablesAll = filterStatus === 'ALL'
    ? tables
    : filterStatus === 'VACANT'
    ? tables.filter(t => isVacantLike(t.status))
    : tables.filter(t => t.status === filterStatus);

  const filteredTables = filteredTablesAll ?? [];

  const counts = {
    VACANT: tables.filter(t => isVacantLike(t.status)).length,
    OCCUPIED: tables.filter(t => t.status === 'OCCUPIED').length,
    RESERVED: tables.filter(t => t.status === 'RESERVED').length,
    CLEANING: tables.filter(t => t.status === 'CLEANING').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/80 backdrop-blur-md border border-white/60 p-5 rounded-3xl shadow-lg shadow-gray-200/50">
        <div>
          <h1 className="text-2xl font-serif font-bold text-gray-900 flex items-center gap-2">
            <Utensils className="w-6 h-6 text-[#2563EB]" />
            Floor Plan & Tables
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            {tables.length} tables — {counts.OCCUPIED} occupied, {counts.VACANT} available
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchTables}
            className="p-2 bg-gray-50 border border-gray-200 rounded-xl hover:border-[#2563EB] text-gray-400 hover:text-[#2563EB] transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#2563EB] text-white font-bold text-sm tracking-wider rounded-xl hover:bg-[#b08d4a] transition-all shadow-lg shadow-blue-500/20"
          >
            <Plus className="w-4 h-4" /> Add Table
          </button>
        </div>
      </div>

      {/* Summary Stat Chips */}
      <div className="flex flex-wrap gap-2">
        {(['ALL', 'VACANT', 'OCCUPIED', 'RESERVED', 'CLEANING'] as const).map(s => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={cn(
              'px-3 py-1.5 rounded-xl text-xs font-bold border transition-all',
              filterStatus === s
                ? 'bg-[#2563EB] text-white border-[#2563EB]'
                : 'bg-white text-gray-400 border-gray-200 hover:border-[#2563EB]/50 hover:text-gray-900'
            )}
          >
            {s === 'ALL' ? `All (${tables.length})` : `${STATUS_CONFIG[s]?.label} (${counts[s as keyof typeof counts]})`}
          </button>
        ))}
      </div>

      {/* Shift/Merge Mode Banner */}
      {actionMode && selectedTable && (
        <div className="flex items-center justify-between bg-[#C5A059]/10 border border-[#2563EB]/40 text-[#2563EB] px-4 py-3 rounded-xl">
          <div className="font-bold text-sm flex items-center gap-2">
            {actionMode === 'SHIFT' ? <ArrowRightLeft className="w-4 h-4" /> : <Combine className="w-4 h-4" />}
            {actionMode === 'SHIFT'
              ? `Select a VACANT table to shift "${selectedTable.name}" to`
              : `Select another table to merge with "${selectedTable.name}"`
            }
          </div>
          <button onClick={clearAction} className="hover:text-red-400 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Table Grid */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-500">
          <RefreshCw className="w-8 h-8 text-[#2563EB] animate-spin" />
          <span className="text-sm">Loading tables...</span>
        </div>
      ) : filteredTables.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-500 border-2 border-dashed border-gray-200 rounded-2xl">
          <Utensils className="w-10 h-10 opacity-20 text-[#2563EB]" />
          <p className="text-sm text-gray-400">No tables found</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="mt-2 px-4 py-2 bg-[#2563EB] text-white rounded-xl text-xs font-bold uppercase tracking-widest"
          >
            Add First Table
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredTables.map(table => {
            const cfg = STATUS_CONFIG[table.status] || STATUS_CONFIG.VACANT;
            const isSelected = selectedTable?.id === table.id && actionMode;
            const activeOrder = table.orders?.[0];

            return (
              <button
                key={table.id}
                onClick={() => handleTableClick(table)}
                className={cn(
                  'p-5 rounded-2xl border-2 transition-all duration-200 flex flex-col items-center justify-center gap-2 relative overflow-hidden text-center group',
                  (STATUS_CONFIG[table.status] || STATUS_CONFIG.VACANT).color,
                  isSelected ? 'ring-2 ring-[#C5A059] ring-offset-2 ring-offset-[#0A0A0B] scale-[1.03]' : 'hover:scale-[1.02]'
                )}
              >
                {/* Status dot */}
                <div className="absolute top-3 right-3 flex items-center gap-1">
                  <div className={cn('w-2.5 h-2.5 rounded-full', cfg.dot)} />
                </div>

                {/* Table name */}
                <div className={cn('font-bold text-base leading-tight', isVacantLike(table.status) ? 'text-white' : cfg.badge)}>
                  {table.name}
                </div>

                {/* Capacity */}
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Users className="w-3 h-3" /> {table.capacity} Seats
                </div>

                {/* Status label */}
                <div className={cn('text-[10px] uppercase font-bold tracking-wider', cfg.badge)}>
                  {cfg.label}
                </div>

                {/* Active order info */}
                {activeOrder && (
                  <div className="text-[10px] text-orange-300 font-mono leading-tight mt-1">
                    #{activeOrder.orderNumber.slice(-6)}
                    {activeOrder.customer?.name ? ` · ${activeOrder.customer.name}` : ''}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Status Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowStatusModal(null)}>
          <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div>
                <h3 className="font-bold text-gray-900 text-lg">{showStatusModal.name}</h3>
                <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                  <Users className="w-3 h-3" /> {showStatusModal.capacity} Seats
                  <span className={cn('ml-2 text-[10px] font-bold uppercase', STATUS_CONFIG[showStatusModal.status]?.badge)}>
                    · {STATUS_CONFIG[showStatusModal.status]?.label}
                  </span>
                </p>
              </div>
              <button onClick={() => setShowStatusModal(null)} className="text-gray-500 hover:text-gray-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Status change buttons */}
            <div className="p-4 space-y-2">
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-3">Change Status</p>
              {(['VACANT', 'OCCUPIED', 'RESERVED', 'CLEANING'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => handleStatusChange(showStatusModal, s)}
                  disabled={showStatusModal.status === s}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-semibold transition-all',
                    showStatusModal.status === s
                      ? 'bg-[#C5A059]/10 border-[#2563EB]/40 text-[#2563EB] cursor-default'
                      : 'bg-[#F8FAFC] border-gray-200 text-gray-600 hover:border-[#2563EB]/40 hover:text-gray-900'
                  )}
                >
                  <div className={cn('w-2.5 h-2.5 rounded-full flex-shrink-0', STATUS_CONFIG[s].dot)} />
                  {STATUS_CONFIG[s].label}
                  {showStatusModal.status === s && <span className="ml-auto text-[10px] text-[#2563EB]">Current</span>}
                </button>
              ))}
            </div>

            {/* Table actions */}
            {!isVacantLike(showStatusModal.status) && showStatusModal.status !== 'CLEANING' && (
              <div className="px-4 pb-2 space-y-2">
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Actions</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => startAction('SHIFT', showStatusModal)}
                    className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold bg-gray-50 border border-gray-200 text-gray-600 hover:border-blue-500/50 hover:text-blue-400 transition-all"
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5" /> Shift Table
                  </button>
                  <button
                    onClick={() => startAction('MERGE', showStatusModal)}
                    className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold bg-gray-50 border border-gray-200 text-gray-600 hover:border-purple-500/50 hover:text-purple-400 transition-all"
                  >
                    <Combine className="w-3.5 h-3.5" /> Merge Table
                  </button>
                </div>
              </div>
            )}

            {/* Delete */}
            <div className="px-4 pb-4 pt-2 border-t border-gray-200 mt-2">
              <button
                onClick={() => handleDeleteTable(showStatusModal)}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/30 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete Table
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Table Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowAddModal(false)}>
          <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#2563EB]" /> Add New Table
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-500 hover:text-gray-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Table Name</label>
                <input
                  type="text"
                  value={newTableName}
                  onChange={e => setNewTableName(e.target.value)}
                  placeholder="e.g. Table 16"
                  className="w-full bg-[#F8FAFC] border border-gray-200 focus:border-[#2563EB] text-white rounded-xl px-3 py-2.5 text-sm outline-none transition-colors"
                  autoFocus
                  onKeyDown={e => e.key === 'Enter' && handleAddTable()}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Seating Capacity</label>
                <div className="grid grid-cols-4 gap-2">
                  {[2, 4, 6, 8].map(n => (
                    <button
                      key={n}
                      onClick={() => setNewTableCapacity(String(n))}
                      className={cn(
                        'py-2 rounded-xl text-sm font-bold border transition-all',
                        newTableCapacity === String(n)
                          ? 'bg-[#2563EB] text-white border-[#2563EB]'
                          : 'bg-[#F8FAFC] text-gray-400 border-gray-200 hover:border-[#2563EB]/50'
                      )}
                    >
                      {n}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={newTableCapacity}
                  onChange={e => setNewTableCapacity(e.target.value)}
                  placeholder="Or enter custom capacity"
                  className="w-full bg-[#F8FAFC] border border-gray-200 focus:border-[#2563EB] text-white rounded-xl px-3 py-2 text-sm outline-none transition-colors"
                />
              </div>
              <button
                onClick={handleAddTable}
                disabled={!newTableName.trim() || isSaving}
                className="w-full py-2.5 bg-[#2563EB] text-white font-bold rounded-xl hover:bg-[#b08d4a] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Add Table
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
