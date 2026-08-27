import React, { useState } from 'react';
import { 
  Clock, Plus, Search, Edit2, Trash2, Calendar, 
  AlertTriangle, CheckCircle2, ShieldCheck, Sun, Moon, 
  Sunset, Coffee, Sliders, X, Users
} from 'lucide-react';
import { Shift, ShiftType, LateRule, HalfDayRule } from '../../types/shift';
import { ShiftEngine } from '../../lib/shifts/shiftEngine';
import { cn } from '../../lib/utils';

export default function ShiftManagementStudio() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<ShiftType | 'ALL'>('ALL');
  const [shifts, setShifts] = useState<Shift[]>(ShiftEngine.getShifts());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingShift, setEditingShift] = useState<Shift | null>(null);

  const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    type: 'MORNING' as ShiftType,
    punchInTime: '08:00',
    graceTimeMinutes: 15,
    punchOutTime: '16:00',
    weeklyOffDays: ['Sunday'],
    lateRule: {
      graceTimeMinutes: 15,
      maxAllowedLateMinutes: 60,
      consecutiveLateTolerance: 3,
      penaltyDescription: '15 mins grace period. 3 late marks = 0.5 day deduction.',
    },
    halfDayRule: {
      minWorkHoursForHalfDay: 4.5,
      minWorkHoursForFullDay: 8.0,
      halfDayCutoffTime: '12:30',
      description: 'Work < 4.5 hrs = Absent, 4.5 to 7.9 hrs = Half Day, >= 8.0 hrs = Full Day.',
    },
  });

  const refreshList = () => {
    const list = ShiftEngine.getShifts({
      search,
      type: typeFilter,
    });
    setShifts(list);
  };

  const handleOpenAdd = () => {
    setEditingShift(null);
    setFormData({
      name: '',
      code: '',
      type: 'MORNING',
      punchInTime: '08:00',
      graceTimeMinutes: 15,
      punchOutTime: '16:00',
      weeklyOffDays: ['Sunday'],
      lateRule: {
        graceTimeMinutes: 15,
        maxAllowedLateMinutes: 60,
        consecutiveLateTolerance: 3,
        penaltyDescription: '15 mins grace period. 3 late marks = 0.5 day deduction.',
      },
      halfDayRule: {
        minWorkHoursForHalfDay: 4.5,
        minWorkHoursForFullDay: 8.0,
        halfDayCutoffTime: '12:30',
        description: 'Work < 4.5 hrs = Absent, 4.5 to 7.9 hrs = Half Day, >= 8.0 hrs = Full Day.',
      },
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (shift: Shift) => {
    setEditingShift(shift);
    setFormData({
      name: shift.name,
      code: shift.code,
      type: shift.type,
      punchInTime: shift.punchInTime,
      graceTimeMinutes: shift.graceTimeMinutes,
      punchOutTime: shift.punchOutTime,
      weeklyOffDays: [...shift.weeklyOffDays],
      lateRule: { ...shift.lateRule },
      halfDayRule: { ...shift.halfDayRule },
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.code.trim()) {
      alert('Please fill out Shift Name and Code.');
      return;
    }

    if (editingShift) {
      ShiftEngine.updateShift(editingShift.id, formData);
    } else {
      ShiftEngine.addShift(formData);
    }

    setIsModalOpen(false);
    refreshList();
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete shift schedule "${name}"?`)) {
      ShiftEngine.deleteShift(id);
      refreshList();
    }
  };

  const toggleDay = (day: string) => {
    const current = formData.weeklyOffDays;
    if (current.includes(day)) {
      setFormData({ ...formData, weeklyOffDays: current.filter(d => d !== day) });
    } else {
      setFormData({ ...formData, weeklyOffDays: [...current, day] });
    }
  };

  const getShiftIcon = (type: ShiftType) => {
    switch (type) {
      case 'MORNING': return Sun;
      case 'GENERAL': return Coffee;
      case 'EVENING': return Sunset;
      case 'NIGHT': return Moon;
      default: return Sliders;
    }
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Top Banner */}
      <div className="bg-[#131315] border border-[#1F1F21] rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#C5A059]" />
            Shift Management & Attendance Rules Engine
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Configure multiple shifts (Morning, General, Evening, Night, Custom), Punch In/Out timings, Grace windows, Weekly Offs, Late Rules, and Half-Day thresholds.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-[#C5A059] hover:bg-[#b08d4a] text-[#0A0A0B] font-bold text-xs uppercase tracking-wider rounded-xl shadow-md shadow-[#C5A059]/20 flex items-center gap-2 transition-all transform hover:scale-[1.02] flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add Shift
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2 relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Shift Name, Code, or Type..."
            value={search}
            onChange={e => { setSearch(e.target.value); }}
            onKeyUp={refreshList}
            className="w-full bg-[#0A0A0B] border border-[#1F1F21] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:border-[#C5A059] outline-none"
          />
        </div>

        <div>
          <select
            value={typeFilter}
            onChange={e => { setTypeFilter(e.target.value as any); }}
            className="w-full bg-[#0A0A0B] border border-[#1F1F21] rounded-xl px-3 py-2 text-xs text-white focus:border-[#C5A059] outline-none"
          >
            <option value="ALL">All Shift Types</option>
            <option value="MORNING">Morning Shift</option>
            <option value="GENERAL">General Shift</option>
            <option value="EVENING">Evening Shift</option>
            <option value="NIGHT">Night Shift</option>
            <option value="CUSTOM">Custom Shift</option>
          </select>
        </div>
      </div>

      {/* Shift Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {shifts.map(shift => {
          const ShiftIcon = getShiftIcon(shift.type);
          return (
            <div
              key={shift.id}
              className="p-5 bg-[#131315] border border-[#1F1F21] hover:border-[#C5A059]/40 rounded-2xl transition-all shadow-md flex flex-col justify-between space-y-4 group"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#C5A059]/10 border border-[#C5A059]/20 flex items-center justify-center text-[#C5A059] flex-shrink-0">
                    <ShiftIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <strong className="text-sm font-bold text-white group-hover:text-[#C5A059] transition-colors block">
                      {shift.name}
                    </strong>
                    <span className="text-[10px] font-mono text-gray-400">{shift.code} • {shift.totalShiftHours} Hrs</span>
                  </div>
                </div>

                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono text-[10px] font-bold">
                  {shift.type}
                </span>
              </div>

              {/* Punch In / Out & Grace Time */}
              <div className="p-3 bg-[#0A0A0B] border border-[#1F1F21] rounded-xl space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between text-gray-300">
                  <span>🟢 Punch In: <strong className="text-white">{shift.punchInTime}</strong></span>
                  <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px]">
                    +{shift.graceTimeMinutes}m Grace
                  </span>
                </div>
                <div className="flex items-center justify-between text-gray-300">
                  <span>🔴 Punch Out: <strong className="text-white">{shift.punchOutTime}</strong></span>
                  <span className="text-gray-500 text-[10px]">Duration: {shift.totalShiftHours}h</span>
                </div>
                <div className="flex items-center justify-between text-gray-400 pt-1 border-t border-[#1F1F21]">
                  <span>📅 Weekly Off:</span>
                  <strong className="text-[#C5A059]">{shift.weeklyOffDays.join(', ') || 'None'}</strong>
                </div>
              </div>

              {/* Late & Half Day Rules */}
              <div className="space-y-2 text-[11px]">
                <div className="p-2.5 bg-[#0A0A0B] border border-[#1F1F21] rounded-lg text-gray-400 space-y-0.5">
                  <span className="text-amber-400 font-bold block">⚠️ Late Rule:</span>
                  <p className="line-clamp-2 leading-relaxed">{shift.lateRule.penaltyDescription}</p>
                </div>

                <div className="p-2.5 bg-[#0A0A0B] border border-[#1F1F21] rounded-lg text-gray-400 space-y-0.5">
                  <span className="text-purple-400 font-bold block">⏱️ Half Day Rule:</span>
                  <p className="line-clamp-2 leading-relaxed">{shift.halfDayRule.description}</p>
                </div>
              </div>

              {/* Footer & Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-[#1F1F21] text-xs">
                <span className="text-gray-500 font-mono text-[11px]">
                  {shift.assignedStaffCount || 0} Staff Assigned
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEdit(shift)}
                    className="p-1.5 rounded-lg bg-[#0A0A0B] hover:bg-[#1C1C1F] text-gray-400 hover:text-white transition-colors"
                    title="Edit Shift"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleDelete(shift.id, shift.name)}
                    className="p-1.5 rounded-lg bg-[#0A0A0B] hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors"
                    title="Delete Shift"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* ADD / EDIT SHIFT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#131315] border border-[#1F1F21] rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-5">
            
            <div className="flex items-center justify-between border-b border-[#1F1F21] pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#C5A059]" />
                {editingShift ? `Edit Shift: ${editingShift.name}` : 'Add New Shift Schedule'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-gray-400 mb-1">Shift Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Morning Shift"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-[#0A0A0B] border border-[#2D2D30] rounded-xl px-3 py-2 text-white focus:border-[#C5A059] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 mb-1">Shift Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="SHIFT-MRN"
                    value={formData.code}
                    onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full bg-[#0A0A0B] border border-[#2D2D30] rounded-xl px-3 py-2 text-white focus:border-[#C5A059] outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1">Shift Type</label>
                  <select
                    value={formData.type}
                    onChange={e => setFormData({ ...formData, type: e.target.value as ShiftType })}
                    className="w-full bg-[#0A0A0B] border border-[#2D2D30] rounded-xl px-3 py-2 text-white focus:border-[#C5A059] outline-none"
                  >
                    <option value="MORNING">Morning</option>
                    <option value="GENERAL">General</option>
                    <option value="EVENING">Evening</option>
                    <option value="NIGHT">Night</option>
                    <option value="CUSTOM">Custom</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-400 mb-1">Punch In Time *</label>
                  <input
                    type="time"
                    required
                    value={formData.punchInTime}
                    onChange={e => setFormData({ ...formData, punchInTime: e.target.value })}
                    className="w-full bg-[#0A0A0B] border border-[#2D2D30] rounded-xl px-3 py-2 text-white focus:border-[#C5A059] outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 mb-1">Punch Out Time *</label>
                  <input
                    type="time"
                    required
                    value={formData.punchOutTime}
                    onChange={e => setFormData({ ...formData, punchOutTime: e.target.value })}
                    className="w-full bg-[#0A0A0B] border border-[#2D2D30] rounded-xl px-3 py-2 text-white focus:border-[#C5A059] outline-none font-mono"
                  />
                </div>
              </div>

              {/* Grace & Weekly Off */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1">Grace Time (Minutes)</label>
                  <input
                    type="number"
                    value={formData.graceTimeMinutes}
                    onChange={e => setFormData({ 
                      ...formData, 
                      graceTimeMinutes: Number(e.target.value),
                      lateRule: { ...formData.lateRule, graceTimeMinutes: Number(e.target.value) }
                    })}
                    className="w-full bg-[#0A0A0B] border border-[#2D2D30] rounded-xl px-3 py-2 text-white focus:border-[#C5A059] outline-none font-mono"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-gray-400 mb-1">Weekly Off Days</label>
                  <div className="flex flex-wrap gap-1.5">
                    {DAYS_OF_WEEK.map(day => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleDay(day)}
                        className={cn(
                          "px-2 py-1 rounded-lg text-[10px] font-bold font-mono transition-all",
                          formData.weeklyOffDays.includes(day)
                            ? "bg-[#C5A059] text-[#0A0A0B]"
                            : "bg-[#0A0A0B] text-gray-400 border border-[#2D2D30]"
                        )}
                      >
                        {day.slice(0, 3)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Late Rule Details */}
              <div className="p-3 bg-[#0A0A0B] border border-[#1F1F21] rounded-xl space-y-2">
                <span className="text-[10px] text-amber-400 font-mono uppercase font-bold block">Late Rule Configuration</span>
                <input
                  type="text"
                  placeholder="Late Rule Description"
                  value={formData.lateRule.penaltyDescription}
                  onChange={e => setFormData({
                    ...formData,
                    lateRule: { ...formData.lateRule, penaltyDescription: e.target.value }
                  })}
                  className="w-full bg-[#131315] border border-[#2D2D30] rounded-lg px-2.5 py-1.5 text-white"
                />
              </div>

              {/* Half Day Rule Details */}
              <div className="p-3 bg-[#0A0A0B] border border-[#1F1F21] rounded-xl space-y-2">
                <span className="text-[10px] text-purple-400 font-mono uppercase font-bold block">Half Day Rule Configuration</span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-gray-500 text-[10px] mb-0.5">Min Half-Day Hrs</label>
                    <input
                      type="number"
                      step="0.5"
                      value={formData.halfDayRule.minWorkHoursForHalfDay}
                      onChange={e => setFormData({
                        ...formData,
                        halfDayRule: { ...formData.halfDayRule, minWorkHoursForHalfDay: Number(e.target.value) }
                      })}
                      className="w-full bg-[#131315] border border-[#2D2D30] rounded-lg px-2.5 py-1.5 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-500 text-[10px] mb-0.5">Min Full-Day Hrs</label>
                    <input
                      type="number"
                      step="0.5"
                      value={formData.halfDayRule.minWorkHoursForFullDay}
                      onChange={e => setFormData({
                        ...formData,
                        halfDayRule: { ...formData.halfDayRule, minWorkHoursForFullDay: Number(e.target.value) }
                      })}
                      className="w-full bg-[#131315] border border-[#2D2D30] rounded-lg px-2.5 py-1.5 text-white font-mono"
                    />
                  </div>
                </div>
                <input
                  type="text"
                  placeholder="Half Day Rule Description"
                  value={formData.halfDayRule.description}
                  onChange={e => setFormData({
                    ...formData,
                    halfDayRule: { ...formData.halfDayRule, description: e.target.value }
                  })}
                  className="w-full bg-[#131315] border border-[#2D2D30] rounded-lg px-2.5 py-1.5 text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1F1F21]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#0A0A0B] text-gray-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#C5A059] hover:bg-[#b08d4a] text-[#0A0A0B] font-bold rounded-xl shadow-md shadow-[#C5A059]/20"
                >
                  {editingShift ? 'Save Changes' : 'Create Shift'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
