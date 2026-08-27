import React, { useState } from 'react';
import { 
  Award, Plus, Search, Edit2, Trash2, Building2, 
  Layers, DollarSign, X, CheckCircle2, Shield
} from 'lucide-react';
import { Designation, DesignationStatus } from '../../types/designation';
import { DesignationEngine, HIERARCHY_LEVELS } from '../../lib/designations/designationEngine';
import { cn } from '../../lib/utils';

export default function DesignationManagementStudio() {
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [hierarchyFilter, setHierarchyFilter] = useState<string>('ALL');
  const [designations, setDesignations] = useState<Designation[]>(DesignationEngine.getDesignations());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDesig, setEditingDesig] = useState<Designation | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    departmentName: 'Billing & Accounts',
    hierarchyLevel: 3,
    description: '',
    minSalary: 25000,
    maxSalary: 40000,
  });

  const refreshList = () => {
    const list = DesignationEngine.getDesignations({
      search,
      departmentName: departmentFilter,
      hierarchyLevel: hierarchyFilter === 'ALL' ? 'ALL' : Number(hierarchyFilter),
    });
    setDesignations(list);
  };

  const handleOpenAdd = () => {
    setEditingDesig(null);
    setFormData({
      title: '',
      departmentName: 'Billing & Accounts',
      hierarchyLevel: 3,
      description: '',
      minSalary: 25000,
      maxSalary: 40000,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (desig: Designation) => {
    setEditingDesig(desig);
    setFormData({
      title: desig.title,
      departmentName: desig.departmentName,
      hierarchyLevel: desig.hierarchyLevel,
      description: desig.description,
      minSalary: desig.salaryBand?.min || 20000,
      maxSalary: desig.salaryBand?.max || 35000,
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) {
      alert('Please fill out Designation Title and Description.');
      return;
    }

    if (editingDesig) {
      DesignationEngine.updateDesignation(editingDesig.id, {
        title: formData.title,
        departmentName: formData.departmentName,
        hierarchyLevel: Number(formData.hierarchyLevel),
        description: formData.description,
        salaryBand: { min: formData.minSalary, max: formData.maxSalary },
      });
    } else {
      DesignationEngine.addDesignation({
        title: formData.title,
        departmentName: formData.departmentName,
        hierarchyLevel: Number(formData.hierarchyLevel),
        description: formData.description,
        salaryBand: { min: formData.minSalary, max: formData.maxSalary },
      });
    }

    setIsModalOpen(false);
    refreshList();
  };

  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete designation "${title}"?`)) {
      DesignationEngine.deleteDesignation(id);
      refreshList();
    }
  };

  const getHierarchyBadge = (level: number) => {
    switch (level) {
      case 1:
        return 'bg-purple-500/10 text-purple-400 border border-purple-500/30';
      case 2:
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/30';
      case 3:
        return 'bg-blue-500/10 text-blue-400 border border-blue-500/30';
      case 4:
        return 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30';
      default:
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30';
    }
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Top Banner */}
      <div className="bg-[#131315] border border-[#1F1F21] rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <Award className="w-5 h-5 text-[#C5A059]" />
            Designation & Role Hierarchy Studio
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Configure job designations, department assignments, hierarchy rank (Levels 1 to 5), and role descriptions.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-[#C5A059] hover:bg-[#b08d4a] text-[#0A0A0B] font-bold text-xs uppercase tracking-wider rounded-xl shadow-md shadow-[#C5A059]/20 flex items-center gap-2 transition-all transform hover:scale-[1.02] flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add Designation
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Title, Department..."
            value={search}
            onChange={e => { setSearch(e.target.value); }}
            onKeyUp={refreshList}
            className="w-full bg-[#0A0A0B] border border-[#1F1F21] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:border-[#C5A059] outline-none"
          />
        </div>

        <div>
          <select
            value={departmentFilter}
            onChange={e => { setDepartmentFilter(e.target.value); }}
            className="w-full bg-[#0A0A0B] border border-[#1F1F21] rounded-xl px-3 py-2 text-xs text-white focus:border-[#C5A059] outline-none"
          >
            <option value="ALL">All Departments</option>
            <option value="Billing & Accounts">Billing & Accounts</option>
            <option value="Kitchen & Culinary">Kitchen & Culinary</option>
            <option value="Management & Operations">Management & Operations</option>
            <option value="Pharmacy & Healthcare">Pharmacy & Healthcare</option>
            <option value="Customer Service & Floor">Customer Service & Floor</option>
          </select>
        </div>

        <div>
          <select
            value={hierarchyFilter}
            onChange={e => { setHierarchyFilter(e.target.value); }}
            className="w-full bg-[#0A0A0B] border border-[#1F1F21] rounded-xl px-3 py-2 text-xs text-white focus:border-[#C5A059] outline-none"
          >
            <option value="ALL">All Hierarchy Levels</option>
            <option value="1">Level 1 - Executive / GM</option>
            <option value="2">Level 2 - Department Head</option>
            <option value="3">Level 3 - Senior Specialist</option>
            <option value="4">Level 4 - Associate Staff</option>
            <option value="5">Level 5 - Entry Level</option>
          </select>
        </div>
      </div>

      {/* Designation Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {designations.map(desig => (
          <div
            key={desig.id}
            className="p-5 bg-[#131315] border border-[#1F1F21] hover:border-[#C5A059]/40 rounded-2xl transition-all shadow-md flex flex-col justify-between space-y-4 group"
          >
            {/* Header & Hierarchy Badge */}
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <strong className="text-sm font-bold text-white group-hover:text-[#C5A059] transition-colors block">
                  {desig.title}
                </strong>
                <span className={cn(
                  "px-2 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase whitespace-nowrap",
                  getHierarchyBadge(desig.hierarchyLevel)
                )}>
                  Level {desig.hierarchyLevel}
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <Building2 className="w-3.5 h-3.5 text-[#C5A059]" />
                <span>{desig.departmentName}</span>
              </div>
            </div>

            {/* Description */}
            <p className="text-xs text-gray-400 leading-relaxed line-clamp-3">
              {desig.description}
            </p>

            {/* Salary Band & Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-[#1F1F21] text-xs font-mono">
              <div className="text-[11px] text-gray-400">
                <span>Band: </span>
                <strong className="text-emerald-400">
                  ₹{desig.salaryBand?.min.toLocaleString()} - ₹{desig.salaryBand?.max.toLocaleString()}
                </strong>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleOpenEdit(desig)}
                  className="p-1.5 rounded-lg bg-[#0A0A0B] hover:bg-[#1C1C1F] text-gray-400 hover:text-white transition-colors"
                  title="Edit Designation"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => handleDelete(desig.id, desig.title)}
                  className="p-1.5 rounded-lg bg-[#0A0A0B] hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors"
                  title="Delete Designation"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* Empty State */}
      {designations.length === 0 && (
        <div className="p-12 text-center bg-[#131315] border border-[#1F1F21] rounded-2xl space-y-3">
          <Award className="w-10 h-10 text-gray-600 mx-auto" />
          <strong className="text-white text-sm block">No Designations Found</strong>
          <p className="text-xs text-gray-500">Add a new designation to build your organizational ladder.</p>
        </div>
      )}

      {/* ADD / EDIT DESIGNATION MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#131315] border border-[#1F1F21] rounded-2xl max-w-md w-full shadow-2xl p-6 space-y-5">
            
            <div className="flex items-center justify-between border-b border-[#1F1F21] pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-[#C5A059]" />
                {editingDesig ? `Edit Designation: ${editingDesig.title}` : 'Add New Designation'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-400 mb-1">Designation Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Senior POS Cashier"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-[#0A0A0B] border border-[#2D2D30] rounded-xl px-3 py-2 text-white focus:border-[#C5A059] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1">Department *</label>
                  <select
                    value={formData.departmentName}
                    onChange={e => setFormData({ ...formData, departmentName: e.target.value })}
                    className="w-full bg-[#0A0A0B] border border-[#2D2D30] rounded-xl px-3 py-2 text-white focus:border-[#C5A059] outline-none"
                  >
                    <option value="Billing & Accounts">Billing & Accounts</option>
                    <option value="Kitchen & Culinary">Kitchen & Culinary</option>
                    <option value="Management & Operations">Management & Operations</option>
                    <option value="Pharmacy & Healthcare">Pharmacy & Healthcare</option>
                    <option value="Customer Service & Floor">Customer Service & Floor</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-400 mb-1">Hierarchy Level *</label>
                  <select
                    value={formData.hierarchyLevel}
                    onChange={e => setFormData({ ...formData, hierarchyLevel: Number(e.target.value) })}
                    className="w-full bg-[#0A0A0B] border border-[#2D2D30] rounded-xl px-3 py-2 text-white focus:border-[#C5A059] outline-none font-mono"
                  >
                    <option value={1}>Level 1 - Executive / GM</option>
                    <option value={2}>Level 2 - Dept Head</option>
                    <option value={3}>Level 3 - Senior Specialist</option>
                    <option value={4}>Level 4 - Associate Staff</option>
                    <option value={5}>Level 5 - Entry Level</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Role Description *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Responsibilities, daily duties, and scope..."
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-[#0A0A0B] border border-[#2D2D30] rounded-xl px-3 py-2 text-white focus:border-[#C5A059] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1">Min Salary (₹)</label>
                  <input
                    type="number"
                    value={formData.minSalary}
                    onChange={e => setFormData({ ...formData, minSalary: Number(e.target.value) })}
                    className="w-full bg-[#0A0A0B] border border-[#2D2D30] rounded-xl px-3 py-2 text-white focus:border-[#C5A059] outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Max Salary (₹)</label>
                  <input
                    type="number"
                    value={formData.maxSalary}
                    onChange={e => setFormData({ ...formData, maxSalary: Number(e.target.value) })}
                    className="w-full bg-[#0A0A0B] border border-[#2D2D30] rounded-xl px-3 py-2 text-white focus:border-[#C5A059] outline-none font-mono"
                  />
                </div>
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
                  {editingDesig ? 'Save Changes' : 'Create Designation'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
