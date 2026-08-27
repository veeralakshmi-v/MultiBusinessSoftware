import React, { useState } from 'react';
import { 
  Building, MapPin, Plus, Search, Edit2, Trash2, 
  CheckCircle2, XCircle, ExternalLink, Radio, Navigation, 
  X, Layers, Compass, ShieldCheck
} from 'lucide-react';
import { OfficeLocation, OfficeLocationStatus } from '../../types/officeLocation';
import { OfficeLocationEngine } from '../../lib/locations/officeLocationEngine';
import { GeoLocationEngine } from '../../lib/attendance/geoLocationEngine';
import { cn } from '../../lib/utils';

export default function OfficeLocationStudio() {
  const [locations, setLocations] = useState<OfficeLocation[]>(OfficeLocationEngine.getOfficeLocations());
  const [search, setSearch] = useState('');
  const [branchFilter, setBranchFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLoc, setEditingLoc] = useState<OfficeLocation | null>(null);
  const [isAcquiringGPS, setIsAcquiringGPS] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    latitude: 13.0827,
    longitude: 80.2707,
    allowedRadiusMeters: 200,
    branchId: 'branch-001',
    branchName: 'Apex Central Flagship (Anna Salai)',
    status: 'ACTIVE' as OfficeLocationStatus,
    address: '',
  });

  const refreshList = () => {
    const list = OfficeLocationEngine.getOfficeLocations({
      search,
      branchId: branchFilter,
      status: statusFilter as any,
    });
    setLocations(list);
  };

  const handleOpenAdd = () => {
    setEditingLoc(null);
    setFormData({
      name: '',
      latitude: 13.0827,
      longitude: 80.2707,
      allowedRadiusMeters: 200,
      branchId: 'branch-001',
      branchName: 'Apex Central Flagship (Anna Salai)',
      status: 'ACTIVE',
      address: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (loc: OfficeLocation) => {
    setEditingLoc(loc);
    setFormData({
      name: loc.name,
      latitude: loc.latitude,
      longitude: loc.longitude,
      allowedRadiusMeters: loc.allowedRadiusMeters,
      branchId: loc.branchId,
      branchName: loc.branchName,
      status: loc.status,
      address: loc.address || '',
    });
    setIsModalOpen(true);
  };

  const handleAutoGPS = async () => {
    setIsAcquiringGPS(true);
    try {
      const geo = await GeoLocationEngine.acquireLiveGeoLocation();
      setFormData(prev => ({
        ...prev,
        latitude: Number(geo.latitude.toFixed(6)),
        longitude: Number(geo.longitude.toFixed(6)),
      }));
    } finally {
      setIsAcquiringGPS(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Please fill out the Office Location Name.');
      return;
    }

    if (editingLoc) {
      OfficeLocationEngine.updateOfficeLocation(editingLoc.id, formData);
    } else {
      OfficeLocationEngine.addOfficeLocation(formData);
    }

    setIsModalOpen(false);
    refreshList();
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete office location "${name}"?`)) {
      OfficeLocationEngine.deleteOfficeLocation(id);
      refreshList();
    }
  };

  const handleToggleStatus = (id: string) => {
    OfficeLocationEngine.toggleStatus(id);
    refreshList();
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Top Banner */}
      <div className="bg-[#131315] border border-[#1F1F21] rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <Building className="w-5 h-5 text-[#C5A059]" />
            Office Locations & Geofence Configurations
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Administer multiple office locations, GPS coordinates (Lat/Long), allowed attendance radius boundaries, and branch assignments.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-[#C5A059] hover:bg-[#b08d4a] text-[#0A0A0B] font-bold text-xs uppercase tracking-wider rounded-xl shadow-md shadow-[#C5A059]/20 flex items-center gap-2 transition-all transform hover:scale-[1.02] flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add Office Location
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search office name, branch, address..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyUp={refreshList}
            className="w-full bg-[#0A0A0B] border border-[#1F1F21] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:border-[#C5A059] outline-none"
          />
        </div>

        <div>
          <select
            value={branchFilter}
            onChange={e => { setBranchFilter(e.target.value); }}
            className="w-full bg-[#0A0A0B] border border-[#1F1F21] rounded-xl px-3 py-2 text-xs text-white focus:border-[#C5A059] outline-none"
          >
            <option value="ALL">All Branches</option>
            <option value="branch-001">Apex Central Flagship (Anna Salai)</option>
            <option value="branch-002">Apex Express Station (T. Nagar)</option>
            <option value="branch-003">Apex OMR Tech Park Lounge (OMR)</option>
          </select>
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); }}
            className="w-full bg-[#0A0A0B] border border-[#1F1F21] rounded-xl px-3 py-2 text-xs text-white focus:border-[#C5A059] outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active Geofences</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>
      </div>

      {/* Office Locations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {locations.map(loc => (
          <div
            key={loc.id}
            className="p-5 bg-[#131315] border border-[#1F1F21] hover:border-[#C5A059]/40 rounded-2xl transition-all shadow-md flex flex-col justify-between space-y-4 group"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#C5A059]/10 border border-[#C5A059]/20 flex items-center justify-center text-[#C5A059] flex-shrink-0">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <strong className="text-sm font-bold text-white group-hover:text-[#C5A059] transition-colors block">
                    {loc.name}
                  </strong>
                  <span className="text-xs text-gray-400">{loc.branchName}</span>
                </div>
              </div>

              <button
                onClick={() => handleToggleStatus(loc.id)}
                className={cn(
                  "px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase transition-all",
                  loc.status === 'ACTIVE'
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                    : "bg-gray-800 text-gray-400 border border-gray-700"
                )}
              >
                {loc.status}
              </button>
            </div>

            {/* Coordinates & Allowed Radius */}
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-3 bg-[#0A0A0B] border border-[#1F1F21] rounded-xl space-y-1">
                <span className="text-gray-500 text-[10px] block">GPS COORDINATES</span>
                <div className="flex items-center justify-between">
                  <strong className="text-white text-xs">
                    {loc.latitude.toFixed(4)}°, {loc.longitude.toFixed(4)}°
                  </strong>
                  <a
                    href={`https://www.google.com/maps?q=${loc.latitude},${loc.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#C5A059] hover:underline"
                    title="View on Google Maps"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              <div className="p-3 bg-[#0A0A0B] border border-[#1F1F21] rounded-xl space-y-1">
                <span className="text-gray-500 text-[10px] block">ALLOWED RADIUS</span>
                <strong className="text-[#C5A059] text-xs block">
                  ⭕ {loc.allowedRadiusMeters} Meters Geofence
                </strong>
              </div>
            </div>

            {/* Address */}
            {loc.address && (
              <p className="text-xs text-gray-400 flex items-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-gray-500 flex-shrink-0 mt-0.5" />
                <span className="line-clamp-2">{loc.address}</span>
              </p>
            )}

            {/* Footer & Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-[#1F1F21] text-xs font-mono">
              <span className="text-gray-500 text-[11px]">
                {loc.assignedStaffCount || 0} Staff Assigned
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleOpenEdit(loc)}
                  className="p-1.5 rounded-lg bg-[#0A0A0B] hover:bg-[#1C1C1F] text-gray-400 hover:text-white transition-colors"
                  title="Edit Location"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => handleDelete(loc.id, loc.name)}
                  className="p-1.5 rounded-lg bg-[#0A0A0B] hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors"
                  title="Delete Location"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* ADD / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#131315] border border-[#1F1F21] rounded-2xl max-w-lg w-full shadow-2xl p-6 space-y-5">
            
            <div className="flex items-center justify-between border-b border-[#1F1F21] pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Building className="w-5 h-5 text-[#C5A059]" />
                {editingLoc ? `Edit Office: ${editingLoc.name}` : 'Configure New Office Location'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-400 mb-1">Office Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Central Flagship HQ"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-[#0A0A0B] border border-[#2D2D30] rounded-xl px-3 py-2 text-white focus:border-[#C5A059] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1">Branch *</label>
                  <select
                    value={formData.branchId}
                    onChange={e => {
                      const id = e.target.value;
                      const name = e.target.options[e.target.selectedIndex].text;
                      setFormData({ ...formData, branchId: id, branchName: name });
                    }}
                    className="w-full bg-[#0A0A0B] border border-[#2D2D30] rounded-xl px-3 py-2 text-white focus:border-[#C5A059] outline-none"
                  >
                    <option value="branch-001">Apex Central Flagship (Anna Salai)</option>
                    <option value="branch-002">Apex Express Station (T. Nagar)</option>
                    <option value="branch-003">Apex OMR Tech Park Lounge (OMR)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-400 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value as OfficeLocationStatus })}
                    className="w-full bg-[#0A0A0B] border border-[#2D2D30] rounded-xl px-3 py-2 text-white focus:border-[#C5A059] outline-none"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </div>
              </div>

              {/* Coordinates Section with GPS button */}
              <div className="p-3 bg-[#0A0A0B] border border-[#1F1F21] rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 font-bold block text-[11px]">GPS Coordinates</span>
                  <button
                    type="button"
                    onClick={handleAutoGPS}
                    disabled={isAcquiringGPS}
                    className="px-2.5 py-1 rounded-lg bg-[#C5A059]/10 hover:bg-[#C5A059]/20 text-[#C5A059] border border-[#C5A059]/30 text-[10px] font-bold font-mono transition-colors flex items-center gap-1"
                  >
                    <Navigation className="w-3 h-3" />
                    {isAcquiringGPS ? 'Acquiring...' : 'Use Current Device GPS'}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-500 text-[10px] mb-1 font-mono">Latitude *</label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={formData.latitude}
                      onChange={e => setFormData({ ...formData, latitude: Number(e.target.value) })}
                      className="w-full bg-[#131315] border border-[#2D2D30] rounded-lg px-2.5 py-1.5 text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-500 text-[10px] mb-1 font-mono">Longitude *</label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={formData.longitude}
                      onChange={e => setFormData({ ...formData, longitude: Number(e.target.value) })}
                      className="w-full bg-[#131315] border border-[#2D2D30] rounded-lg px-2.5 py-1.5 text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Allowed Radius (Meters) *</label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="50"
                    max="1000"
                    step="25"
                    value={formData.allowedRadiusMeters}
                    onChange={e => setFormData({ ...formData, allowedRadiusMeters: Number(e.target.value) })}
                    className="w-full accent-[#C5A059]"
                  />
                  <span className="px-3 py-1 rounded-lg bg-[#0A0A0B] border border-[#2D2D30] text-[#C5A059] font-mono font-bold whitespace-nowrap text-xs">
                    {formData.allowedRadiusMeters} m
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Physical Address</label>
                <textarea
                  rows={2}
                  placeholder="Street, City, Postal Code..."
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  className="w-full bg-[#0A0A0B] border border-[#2D2D30] rounded-xl px-3 py-2 text-white focus:border-[#C5A059] outline-none"
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
                  {editingLoc ? 'Save Changes' : 'Create Location'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
