import React, { useState } from 'react';
import { 
  Palmtree, Plus, Search, Calendar, MapPin, 
  Repeat, Edit2, Trash2, CheckCircle2, X, AlertCircle, Building2
} from 'lucide-react';
import { Holiday, CreateHolidayDTO } from '../../types/holiday';
import { HolidayEngine } from '../../lib/holidays/holidayEngine';
import { BRANCH_GEOFENCE_LOCATIONS } from '../../lib/attendance/geoLocationEngine';
import { cn } from '../../lib/utils';

export default function HolidayManagementStudio() {
  const [holidays, setHolidays] = useState<Holiday[]>(HolidayEngine.getHolidays());
  const [search, setSearch] = useState('');
  const [branchFilter, setBranchFilter] = useState('ALL');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form state
  const [holidayName, setHolidayName] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [branch, setBranch] = useState('ALL');
  const [recurring, setRecurring] = useState(true);
  const [type, setType] = useState<'NATIONAL' | 'REGIONAL' | 'COMPANY_OPTIONAL'>('NATIONAL');
  const [formError, setFormError] = useState<string | null>(null);

  const refreshHolidays = () => {
    setHolidays(HolidayEngine.getHolidays({
      search,
      branch: branchFilter,
    }));
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setHolidayName('');
    setDate('');
    setDescription('');
    setBranch('ALL');
    setRecurring(true);
    setType('NATIONAL');
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (h: Holiday) => {
    setEditingId(h.id);
    setHolidayName(h.holidayName);
    setDate(h.date);
    setDescription(h.description);
    setBranch(h.branch);
    setRecurring(h.recurring);
    setType(h.type || 'NATIONAL');
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!holidayName.trim()) {
      setFormError('Please enter a holiday name.');
      return;
    }
    if (!date) {
      setFormError('Please select a holiday date.');
      return;
    }

    if (editingId) {
      const res = HolidayEngine.updateHoliday({
        id: editingId,
        holidayName,
        date,
        description,
        branch,
        recurring,
        type,
      });
      if (!res.success) {
        setFormError(res.error || 'Failed to update holiday.');
        return;
      }
    } else {
      const res = HolidayEngine.createHoliday({
        holidayName,
        date,
        description,
        branch,
        recurring,
        type,
      });
      if (!res.success) {
        setFormError(res.error || 'Failed to create holiday.');
        return;
      }
    }

    setIsModalOpen(false);
    refreshHolidays();
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}" from holiday schedule?`)) {
      HolidayEngine.deleteHoliday(id);
      refreshHolidays();
    }
  };

  const totalCount = holidays.length;
  const nationalCount = holidays.filter(h => h.type === 'NATIONAL').length;
  const regionalCount = holidays.filter(h => h.type === 'REGIONAL').length;
  const recurringCount = holidays.filter(h => h.recurring).length;

  return (
    <div className="space-y-6 font-sans">
      
      {/* Top Banner & Add Button */}
      <div className="bg-[#131315] border border-[#1F1F21] rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <Palmtree className="w-5 h-5 text-[#C5A059]" />
            Holiday Management & Annual Calendar Schedule
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Configure national gazetted holidays, regional festivals, branch-specific leaves, and recurring annual dates.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-[#C5A059] hover:bg-[#b08d4a] text-[#0A0A0B] font-bold text-xs rounded-xl shadow-md shadow-[#C5A059]/20 flex items-center gap-2 transition-all transform hover:scale-105 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add New Holiday
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-[#131315] border border-[#1F1F21] rounded-2xl space-y-1 shadow-sm">
          <span className="text-gray-500 text-[10px] uppercase font-mono block">Total Holidays</span>
          <strong className="text-white text-2xl font-mono">{totalCount}</strong>
          <span className="text-gray-400 text-[10px] block">Configured in Schedule</span>
        </div>

        <div className="p-4 bg-[#131315] border border-[#1F1F21] rounded-2xl space-y-1 shadow-sm">
          <span className="text-gray-500 text-[10px] uppercase font-mono block">National Gazetted</span>
          <strong className="text-[#C5A059] text-2xl font-mono">{nationalCount}</strong>
          <span className="text-gray-400 text-[10px] block">Mandatory Paid Leaves</span>
        </div>

        <div className="p-4 bg-[#131315] border border-[#1F1F21] rounded-2xl space-y-1 shadow-sm">
          <span className="text-gray-500 text-[10px] uppercase font-mono block">Regional Festivals</span>
          <strong className="text-purple-400 text-2xl font-mono">{regionalCount}</strong>
          <span className="text-gray-400 text-[10px] block">State & Cultural</span>
        </div>

        <div className="p-4 bg-[#131315] border border-[#1F1F21] rounded-2xl space-y-1 shadow-sm">
          <span className="text-gray-500 text-[10px] uppercase font-mono block">Recurring Annual</span>
          <strong className="text-emerald-400 text-2xl font-mono">{recurringCount}</strong>
          <span className="text-gray-400 text-[10px] block">Auto-Repeats Every Year</span>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search holiday name, description, branch..."
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              setHolidays(HolidayEngine.getHolidays({ search: e.target.value, branch: branchFilter }));
            }}
            className="w-full bg-[#0A0A0B] border border-[#1F1F21] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:border-[#C5A059] outline-none font-mono"
          />
        </div>

        <div>
          <select
            value={branchFilter}
            onChange={e => {
              setBranchFilter(e.target.value);
              setHolidays(HolidayEngine.getHolidays({ search, branch: e.target.value }));
            }}
            className="w-full bg-[#0A0A0B] border border-[#1F1F21] rounded-xl px-3 py-2 text-xs text-white focus:border-[#C5A059] outline-none font-mono"
          >
            <option value="ALL">All Branches & Locations</option>
            {BRANCH_GEOFENCE_LOCATIONS.map(b => (
              <option key={b.id} value={b.name}>{b.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* HOLIDAYS LIST / GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {holidays.map(h => (
          <div
            key={h.id}
            className="bg-[#131315] border border-[#1F1F21] hover:border-[#C5A059]/40 rounded-2xl p-5 shadow-xl space-y-3 transition-all flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-bold text-white text-sm">{h.holidayName}</h4>
                  <div className="flex items-center gap-1.5 text-xs text-[#C5A059] font-mono mt-0.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <strong>{new Date(h.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</strong>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(h)}
                    className="p-1.5 text-gray-400 hover:text-white hover:bg-[#1F1F21] rounded-lg transition-colors"
                    title="Edit Holiday"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(h.id, h.holidayName)}
                    className="p-1.5 text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                    title="Delete Holiday"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <p className="text-xs text-gray-400 line-clamp-2">
                {h.description || 'No additional description provided.'}
              </p>
            </div>

            {/* Badges Footer */}
            <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-[#1F1F21] text-[10px] font-mono">
              <span className="px-2 py-0.5 rounded bg-[#0A0A0B] border border-[#2D2D30] text-gray-300 flex items-center gap-1 truncate max-w-[170px]">
                <Building2 className="w-3 h-3 text-[#C5A059]" />
                {h.branch === 'ALL' ? 'All Branches' : h.branch}
              </span>

              {h.recurring && (
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <Repeat className="w-3 h-3" /> Recurring
                </span>
              )}

              <span className={cn(
                "px-2 py-0.5 rounded uppercase font-bold",
                h.type === 'NATIONAL' ? "bg-[#C5A059]/10 text-[#C5A059] border border-[#C5A059]/30" :
                h.type === 'REGIONAL' ? "bg-purple-500/10 text-purple-400 border border-purple-500/30" :
                "bg-sky-500/10 text-sky-400 border border-sky-500/30"
              )}>
                {h.type || 'NATIONAL'}
              </span>
            </div>

          </div>
        ))}
      </div>

      {/* ADD / EDIT HOLIDAY MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#131315] border border-[#1F1F21] rounded-3xl max-w-lg w-full shadow-2xl p-6 space-y-4">
            
            <div className="flex items-center justify-between border-b border-[#1F1F21] pb-3">
              <div className="flex items-center gap-2">
                <Palmtree className="w-5 h-5 text-[#C5A059]" />
                <h3 className="font-bold text-white text-base">
                  {editingId ? 'Edit Holiday' : 'Add New Holiday'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-3.5 text-xs">
              
              {/* 1. Holiday Name */}
              <div>
                <label className="block text-gray-400 font-mono text-[10px] uppercase mb-1">
                  1. Holiday Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Independence Day, Diwali, Republic Day"
                  value={holidayName}
                  onChange={e => setHolidayName(e.target.value)}
                  className="w-full bg-[#0A0A0B] border border-[#2D2D30] rounded-xl px-3 py-2 text-white placeholder-gray-500 focus:border-[#C5A059] outline-none"
                />
              </div>

              {/* 2. Date & Type */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 font-mono text-[10px] uppercase mb-1">
                    2. Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full bg-[#0A0A0B] border border-[#2D2D30] rounded-xl px-3 py-2 text-white focus:border-[#C5A059] outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 font-mono text-[10px] uppercase mb-1">
                    Holiday Type
                  </label>
                  <select
                    value={type}
                    onChange={e => setType(e.target.value as any)}
                    className="w-full bg-[#0A0A0B] border border-[#2D2D30] rounded-xl px-3 py-2 text-white focus:border-[#C5A059] outline-none font-mono"
                  >
                    <option value="NATIONAL">National Gazetted</option>
                    <option value="REGIONAL">Regional Festival</option>
                    <option value="COMPANY_OPTIONAL">Company Optional</option>
                  </select>
                </div>
              </div>

              {/* 3. Description */}
              <div>
                <label className="block text-gray-400 font-mono text-[10px] uppercase mb-1">
                  3. Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Brief notes about the celebration or applicability..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full bg-[#0A0A0B] border border-[#2D2D30] rounded-xl px-3 py-2 text-white placeholder-gray-500 focus:border-[#C5A059] outline-none"
                />
              </div>

              {/* 4. Branch */}
              <div>
                <label className="block text-gray-400 font-mono text-[10px] uppercase mb-1">
                  4. Applicable Branch
                </label>
                <select
                  value={branch}
                  onChange={e => setBranch(e.target.value)}
                  className="w-full bg-[#0A0A0B] border border-[#2D2D30] rounded-xl px-3 py-2 text-white focus:border-[#C5A059] outline-none font-mono"
                >
                  <option value="ALL">All Branches & Locations</option>
                  {BRANCH_GEOFENCE_LOCATIONS.map(b => (
                    <option key={b.id} value={b.name}>{b.name}</option>
                  ))}
                </select>
              </div>

              {/* 5. Recurring */}
              <div className="p-3 bg-[#0A0A0B] border border-[#1F1F21] rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-white font-bold block">5. Recurring Annual Holiday</span>
                  <span className="text-gray-400 text-[10px]">Repeats automatically every year on this date.</span>
                </div>
                <input
                  type="checkbox"
                  checked={recurring}
                  onChange={e => setRecurring(e.target.checked)}
                  className="w-4 h-4 accent-[#C5A059] rounded cursor-pointer"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#1F1F21]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-[#0A0A0B] hover:bg-[#161618] border border-[#2D2D30] text-gray-300 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#C5A059] hover:bg-[#b08d4a] text-[#0A0A0B] font-bold rounded-xl shadow-md shadow-[#C5A059]/20"
                >
                  {editingId ? 'Save Changes' : 'Create Holiday'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
