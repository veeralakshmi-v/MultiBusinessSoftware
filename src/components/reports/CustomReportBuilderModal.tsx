import React, { useState } from 'react';
import { 
  X, Check, Plus, BarChart3, LineChart, PieChart, Table, 
  Layers, Filter, Sparkles, SlidersHorizontal, Save, Calendar, CheckSquare, Square
} from 'lucide-react';
import { 
  CustomReportDefinition, 
  ReportGroupBy, 
  ReportChartType 
} from '../../types/reports';
import { AVAILABLE_REPORT_FIELDS, ReportEngine } from '../../lib/reports/reportEngine';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../lib/utils';

interface CustomReportBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveReport: (report: CustomReportDefinition) => void;
  initialReport?: CustomReportDefinition | null;
}

export default function CustomReportBuilderModal({
  isOpen,
  onClose,
  onSaveReport,
  initialReport,
}: CustomReportBuilderModalProps) {
  const { activeTemplate, businessType } = useAuth();

  const [name, setName] = useState(initialReport?.name || 'Custom Business Sales Report');
  const [category, setCategory] = useState(initialReport?.category || 'Custom Analytics');
  const [selectedColumns, setSelectedColumns] = useState<string[]>(
    initialReport?.columns || ['orderNumber', 'createdAt', 'customerName', 'subtotal', 'tax', 'total']
  );
  
  // Filters
  const [datePreset, setDatePreset] = useState<string>(initialReport?.filters?.datePreset || 'THIS_MONTH');
  const [orderType, setOrderType] = useState<string>(initialReport?.filters?.orderType || 'ALL');
  const [paymentMethod, setPaymentMethod] = useState<string>(initialReport?.filters?.paymentMethod || 'ALL');
  const [status, setStatus] = useState<string>(initialReport?.filters?.status || 'ALL');
  const [minAmount, setMinAmount] = useState<string>(initialReport?.filters?.minAmount ? String(initialReport.filters.minAmount) : '');

  // Group By & Charts
  const [groupBy, setGroupBy] = useState<ReportGroupBy>(initialReport?.groupBy || 'NONE');
  const [chartType, setChartType] = useState<ReportChartType>(initialReport?.chartType || 'BAR');

  if (!isOpen) return null;

  const toggleColumn = (colId: string) => {
    setSelectedColumns(prev => 
      prev.includes(colId) ? prev.filter(id => id !== colId) : [...prev, colId]
    );
  };

  const selectAllColumns = () => {
    setSelectedColumns(AVAILABLE_REPORT_FIELDS.map(f => f.id));
  };

  const clearAllColumns = () => {
    setSelectedColumns(['orderNumber', 'total']);
  };

  const handleSave = () => {
    if (!name.trim()) {
      alert('Please enter a report name.');
      return;
    }
    if (selectedColumns.length === 0) {
      alert('Please select at least one column.');
      return;
    }

    const reportDef: CustomReportDefinition = {
      id: initialReport?.id || `report-${Date.now()}`,
      name: name.trim(),
      category: category.trim() || 'Custom Analytics',
      columns: selectedColumns,
      filters: {
        datePreset: datePreset as any,
        orderType: orderType !== 'ALL' ? orderType : undefined,
        paymentMethod: paymentMethod !== 'ALL' ? paymentMethod : undefined,
        status: status !== 'ALL' ? status : undefined,
        minAmount: minAmount ? Number(minAmount) : undefined,
      },
      groupBy,
      chartType,
      isSystemTemplate: false,
      businessType,
      createdAt: new Date().toISOString(),
    };

    ReportEngine.saveReport(reportDef);
    onSaveReport(reportDef);
    onClose();
  };

  const groupedFields = {
    'Order Info': AVAILABLE_REPORT_FIELDS.filter(f => f.category === 'Order Info'),
    'Financials': AVAILABLE_REPORT_FIELDS.filter(f => f.category === 'Financials'),
    'Customer & Staff': AVAILABLE_REPORT_FIELDS.filter(f => f.category === 'Customer & Staff'),
    'Industry Metadata': AVAILABLE_REPORT_FIELDS.filter(f => f.category === 'Industry Metadata'),
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-[#131315] border border-[#1F1F21] rounded-2xl max-w-4xl w-full flex flex-col max-h-[90vh] shadow-2xl overflow-hidden text-gray-200">
        
        {/* Header */}
        <div className="p-4 border-b border-[#1F1F21] flex items-center justify-between bg-[#161618]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#C5A059]/10 border border-[#C5A059]/30 flex items-center justify-center text-[#C5A059]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base tracking-tight flex items-center gap-2">
                Universal Report Builder
                <span className="px-2 py-0.5 rounded-full bg-[#1A1A1C] border border-[#C5A059]/30 text-[10px] text-[#C5A059] font-mono">
                  {businessType}
                </span>
              </h3>
              <p className="text-xs text-gray-400">Design custom reports with columns, filters, grouping, and visual charts</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white rounded-xl hover:bg-[#252528]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Builder Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Section 1: Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-300">Report Title</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Monthly High-Value Sales Audit"
                className="w-full bg-[#0A0A0B] border border-[#2D2D30] rounded-xl px-3.5 py-2 text-sm text-white outline-none focus:border-[#C5A059]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-300">Report Category Folder</label>
              <input
                type="text"
                value={category}
                onChange={e => setCategory(e.target.value)}
                placeholder="e.g. Sales & Revenue / Audits"
                className="w-full bg-[#0A0A0B] border border-[#2D2D30] rounded-xl px-3.5 py-2 text-sm text-white outline-none focus:border-[#C5A059]"
              />
            </div>
          </div>

          {/* Section 2: Choose Columns */}
          <div className="space-y-3 border-t border-[#1F1F21] pt-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-white flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-[#C5A059]" />
                  1. Choose Columns ({selectedColumns.length} Selected)
                </h4>
                <p className="text-[11px] text-gray-500">Pick which fields will be displayed in the report table & exports</p>
              </div>
              <div className="flex gap-2 text-xs">
                <button
                  type="button"
                  onClick={selectAllColumns}
                  className="px-2.5 py-1 bg-[#1A1A1C] border border-[#2D2D30] hover:border-[#C5A059] rounded-lg text-gray-300 hover:text-white"
                >
                  Select All
                </button>
                <button
                  type="button"
                  onClick={clearAllColumns}
                  className="px-2.5 py-1 bg-[#1A1A1C] border border-[#2D2D30] hover:border-red-500/50 rounded-lg text-gray-400 hover:text-red-400"
                >
                  Reset
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(groupedFields).map(([groupTitle, fields]) => (
                <div key={groupTitle} className="bg-[#0A0A0B] border border-[#1F1F21] rounded-xl p-3 space-y-2">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#C5A059]">{groupTitle}</div>
                  <div className="flex flex-wrap gap-1.5">
                    {fields.map(f => {
                      const isSelected = selectedColumns.includes(f.id);
                      return (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => toggleColumn(f.id)}
                          className={cn(
                            "px-2.5 py-1 rounded-lg text-xs font-medium transition-all border flex items-center gap-1.5",
                            isSelected
                              ? "bg-[#C5A059]/15 text-[#C5A059] border-[#C5A059]/40 font-semibold"
                              : "bg-[#131315] text-gray-400 border-[#2D2D30] hover:text-white"
                          )}
                        >
                          {isSelected ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5 text-gray-600" />}
                          {f.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Choose Filters */}
          <div className="space-y-3 border-t border-[#1F1F21] pt-4">
            <h4 className="font-bold text-sm text-white flex items-center gap-2">
              <Filter className="w-4 h-4 text-[#C5A059]" />
              2. Choose Filters
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="space-y-1">
                <label className="text-gray-400 font-medium">Date Range Preset</label>
                <select
                  value={datePreset}
                  onChange={e => setDatePreset(e.target.value)}
                  className="w-full bg-[#0A0A0B] border border-[#2D2D30] rounded-xl px-2.5 py-2 text-white outline-none focus:border-[#C5A059]"
                >
                  <option value="TODAY">Today</option>
                  <option value="YESTERDAY">Yesterday</option>
                  <option value="LAST_7">Last 7 Days</option>
                  <option value="THIS_MONTH">This Month</option>
                  <option value="LAST_MONTH">Last Month</option>
                  <option value="THIS_YEAR">This Year</option>
                  <option value="CUSTOM">Custom Range</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-gray-400 font-medium">Order / Invoice Type</label>
                <select
                  value={orderType}
                  onChange={e => setOrderType(e.target.value)}
                  className="w-full bg-[#0A0A0B] border border-[#2D2D30] rounded-xl px-2.5 py-2 text-white outline-none focus:border-[#C5A059]"
                >
                  <option value="ALL">All Types</option>
                  {activeTemplate.invoiceTypes?.map(it => (
                    <option key={it.code} value={it.code}>{it.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-gray-400 font-medium">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value)}
                  className="w-full bg-[#0A0A0B] border border-[#2D2D30] rounded-xl px-2.5 py-2 text-white outline-none focus:border-[#C5A059]"
                >
                  <option value="ALL">All Payment Methods</option>
                  <option value="CASH">Cash</option>
                  <option value="UPI">UPI</option>
                  <option value="CARD">Card</option>
                  <option value="SPLIT">Split</option>
                  <option value="CREDIT">Credit</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-gray-400 font-medium">Min Order Amount (₹)</label>
                <input
                  type="number"
                  value={minAmount}
                  onChange={e => setMinAmount(e.target.value)}
                  placeholder="e.g. 1000"
                  className="w-full bg-[#0A0A0B] border border-[#2D2D30] rounded-xl px-2.5 py-2 text-white outline-none focus:border-[#C5A059]"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Grouping & Visual Chart View */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-[#1F1F21] pt-4">
            
            {/* Choose Grouping */}
            <div className="space-y-2">
              <h4 className="font-bold text-sm text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#C5A059]" />
                3. Choose Grouping
              </h4>
              <p className="text-[11px] text-gray-500">Aggregate rows and calculate summaries by selected dimension</p>
              
              <div className="grid grid-cols-3 gap-1.5 pt-1">
                {[
                  { id: 'NONE', label: 'None (Raw)' },
                  { id: 'DATE', label: 'By Date' },
                  { id: 'PAYMENT_METHOD', label: 'By Payment' },
                  { id: 'ORDER_TYPE', label: 'By Type' },
                  { id: 'STATUS', label: 'By Status' },
                  { id: 'CUSTOMER', label: 'By Customer' },
                ].map(g => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setGroupBy(g.id as ReportGroupBy)}
                    className={cn(
                      "py-2 px-2 rounded-xl text-xs font-bold transition-all border text-center",
                      groupBy === g.id
                        ? "bg-[#C5A059] text-[#0A0A0B] border-[#C5A059]"
                        : "bg-[#0A0A0B] text-gray-400 border-[#2D2D30] hover:text-white"
                    )}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Choose Charts */}
            <div className="space-y-2">
              <h4 className="font-bold text-sm text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#C5A059]" />
                4. Choose Visual Chart
              </h4>
              <p className="text-[11px] text-gray-500">Enable interactive visualization on top of report dataset</p>

              <div className="grid grid-cols-4 gap-1.5 pt-1">
                {[
                  { id: 'NONE', label: 'Table Only', icon: Table },
                  { id: 'BAR', label: 'Bar Chart', icon: BarChart3 },
                  { id: 'LINE', label: 'Line Chart', icon: LineChart },
                  { id: 'PIE', label: 'Pie Chart', icon: PieChart },
                ].map(c => {
                  const Icon = c.icon;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setChartType(c.id as ReportChartType)}
                      className={cn(
                        "py-2 px-1 rounded-xl text-[11px] font-bold transition-all border flex flex-col items-center gap-1",
                        chartType === c.id
                          ? "bg-[#C5A059] text-[#0A0A0B] border-[#C5A059]"
                          : "bg-[#0A0A0B] text-gray-400 border-[#2D2D30] hover:text-white"
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      {c.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-[#1F1F21] bg-[#161618] flex items-center justify-between">
          <div className="text-xs text-gray-400 font-mono">
            {selectedColumns.length} Columns • Group: {groupBy} • Chart: {chartType}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-[#1A1A1C] border border-[#2D2D30] hover:border-gray-500 text-gray-300 font-bold text-xs rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 bg-[#C5A059] hover:bg-[#b08d4a] text-[#0A0A0B] font-bold text-xs rounded-xl uppercase tracking-wider shadow-lg shadow-[#C5A059]/20 flex items-center gap-1.5 transition-all"
            >
              <Save className="w-4 h-4" />
              Save & Run Report
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
