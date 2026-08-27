import React, { useState } from 'react';
import { 
  Building2, Plus, Search, Edit2, Trash2, CheckCircle2, 
  XCircle, Users, FileText, UserCheck, ShieldCheck, X
} from 'lucide-react';
import { Department, DepartmentStatus } from '../../types/department';
import { DepartmentEngine } from '../../lib/departments/departmentEngine';
import { cn } from '../../lib/utils';

export default function DepartmentManagementStudio() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [departments, setDepartments] = useState<Department[]>(DepartmentEngine.getDepartments());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    managerName: '',
    description: '',
    status: 'ACTIVE' as DepartmentStatus,
  });

  const refreshList = () => {
    const list = DepartmentEngine.getDepartments({
      search,
      status: statusFilter,
    });
    setDepartments(list);
  };

  const handleOpenAdd = () => {
    setEditingDept(null);
    setFormData({
      name: '',
      code: '',
      managerName: '',
      description: '',
      status: 'ACTIVE',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (dept: Department) => {
    setEditingDept(dept);
    setFormData({
      name: dept.name,
      code: dept.code,
      managerName: dept.managerName,
      description: dept.description,
      status: dept.status,
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.code.trim() || !formData.managerName.trim()) {
      alert('Please fill out Department Name, Code, and Manager.');
      return;
    }

    if (editingDept) {
      DepartmentEngine.updateDepartment(editingDept.id, formData);
    } else {
      DepartmentEngine.addDepartment(formData);
    }

    setIsModalOpen(false);
    refreshList();
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete the department "${name}"?`)) {
      DepartmentEngine.deleteDepartment(id);
      refreshList();
    }
  };

  const handleToggle = (id: string) => {
    DepartmentEngine.toggleStatus(id);
    refreshList();
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Top Banner & Stats */}
      <div className="bg-[#131315] border border-[#1F1F21] rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#C5A059]" />
            Department Management Module
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Configure organizational divisions, department codes, assigned managers, and operational descriptions.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-[#C5A059] hover:bg-[#b08d4a] text-[#0A0A0B] font-bold text-xs uppercase tracking-wider rounded-xl shadow-md shadow-[#C5A059]/20 flex items-center gap-2 transition-all transform hover:scale-[1.02] flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add Department
        </button>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2 relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Department Name, Code, or Manager..."
            value={search}
            onChange={e => { setSearch(e.target.value); }}
            onKeyUp={refreshList}
            className="w-full bg-[#0A0A0B] border border-[#1F1F21] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:border-[#C5A059] outline-none"
          />
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value as any); }}
            className="w-full bg-[#0A0A0B] border border-[#1F1F21] rounded-xl px-3 py-2 text-xs text-white focus:border-[#C5A059] outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active Only</option>
            <option value="INACTIVE">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Department Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {departments.map(dept => (
          <div
            key={dept.id}
            className="p-5 bg-[#131315] border border-[#1F1F21] hover:border-[#C5A059]/40 rounded-2xl transition-all shadow-md flex flex-col justify-between space-y-4 group"
          >
            {/* Card Header */}
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <strong className="text-sm font-bold text-white group-hover:text-[#C5A059] transition-colors">
                    {dept.name}
                  </strong>
                  <span className="px-2 py-0.5 rounded bg-[#0A0A0B] text-[#C5A059] border border-[#2D2D30] font-mono text-[10px] font-bold">
                    {dept.code}
                  </span>
                </div>
                <span className="text-[11px] text-gray-400 block mt-1">
                  Manager: <strong className="text-gray-200">{dept.managerName}</strong>
                </span>
              </div>

              <span className={cn(
                "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider font-mono",
                dept.status === 'ACTIVE'
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : "bg-gray-800 text-gray-400 border border-gray-700"
              )}>
                {dept.status}
              </span>
            </div>

            {/* Description */}
            <p className="text-xs text-gray-400 leading-relaxed line-clamp-2">
              {dept.description}
            </p>

            {/* Footer & Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-[#1F1F21] text-xs">
              <span className="text-gray-500 font-mono text-[11px]">
                {dept.employeeCount || 0} Staff Members
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleOpenEdit(dept)}
                  className="p-1.5 rounded-lg bg-[#0A0A0B] hover:bg-[#1C1C1F] text-gray-400 hover:text-white transition-colors"
                  title="Edit Department"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => handleToggle(dept.id)}
                  className="p-1.5 rounded-lg bg-[#0A0A0B] hover:bg-[#1C1C1F] text-gray-400 hover:text-amber-400 transition-colors"
                  title={dept.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                >
                  {dept.status === 'ACTIVE' ? <XCircle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                </button>

                <button
                  onClick={() => handleDelete(dept.id, dept.name)}
                  className="p-1.5 rounded-lg bg-[#0A0A0B] hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors"
                  title="Delete Department"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* Empty State */}
      {departments.length === 0 && (
        <div className="p-12 text-center bg-[#131315] border border-[#1F1F21] rounded-2xl space-y-3">
          <Building2 className="w-10 h-10 text-gray-600 mx-auto" />
          <strong className="text-white text-sm block">No Departments Found</strong>
          <p className="text-xs text-gray-500">Create your first department to organize staff teams.</p>
        </div>
      )}

      {/* ADD / EDIT DEPARTMENT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#131315] border border-[#1F1F21] rounded-2xl max-w-md w-full shadow-2xl p-6 space-y-5">
            
            <div className="flex items-center justify-between border-b border-[#1F1F21] pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#C5A059]" />
                {editingDept ? `Edit Department: ${editingDept.name}` : 'Add New Department'}
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
                <label className="block text-gray-400 mb-1">Department Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Billing & Accounts"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-[#0A0A0B] border border-[#2D2D30] rounded-xl px-3 py-2 text-white focus:border-[#C5A059] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1">Department Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="DEPT-BILL"
                    value={formData.code}
                    onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full bg-[#0A0A0B] border border-[#2D2D30] rounded-xl px-3 py-2 text-white focus:border-[#C5A059] outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 mb-1">Assigned Manager *</label>
                  <input
                    type="text"
                    required
                    placeholder="Manager Name"
                    value={formData.managerName}
                    onChange={e => setFormData({ ...formData, managerName: e.target.value })}
                    className="w-full bg-[#0A0A0B] border border-[#2D2D30] rounded-xl px-3 py-2 text-white focus:border-[#C5A059] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Operational responsibilities..."
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-[#0A0A0B] border border-[#2D2D30] rounded-xl px-3 py-2 text-white focus:border-[#C5A059] outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value as DepartmentStatus })}
                  className="w-full bg-[#0A0A0B] border border-[#2D2D30] rounded-xl px-3 py-2 text-white focus:border-[#C5A059] outline-none"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
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
                  {editingDept ? 'Save Changes' : 'Create Department'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
