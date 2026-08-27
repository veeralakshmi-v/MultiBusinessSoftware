import React, { useState } from 'react';
import { 
  Upload, FileSpreadsheet, FileText, Code2, Database, 
  Sparkles, Check, AlertTriangle, ArrowRight, CheckCircle2, 
  RefreshCw, Play, Layers, X
} from 'lucide-react';
import { ImportEngine, STANDARD_PRODUCT_FIELDS } from '../../lib/importer/importEngine';
import { ImportFileType, ImportTargetEntity, ImportPreviewResult, ColumnMapping, ImportExecutionResult } from '../../types/import';
import { cn } from '../../lib/utils';

const DEMO_PRESETS: Record<string, { format: ImportFileType; name: string; content: string }> = {
  RESTAURANT: {
    format: 'CSV',
    name: 'Restaurant Menu CSV (Legacy POS)',
    content: `Particulars,Item_Code,Group,Sale_Rate,Purchase_Rate,Balance_Qty,GST%
Paneer Butter Masala,PBM-01,Main Course,280.00,140.00,50,5
Chicken Biryani,CB-02,Main Course,320.00,160.00,40,5
Garlic Naan,GN-03,Breads,60.00,20.00,100,5
Gulab Jamun,GJ-04,Dessert,80.00,30.00,60,5
Cold Coffee,CC-05,Beverages,120.00,45.00,35,12`,
  },
  RETAIL: {
    format: 'CSV',
    name: 'Retail Supermarket Inventory (Marg/Vyapar)',
    content: `Item Description,Barcode,Category,Retail Price,Buy Price,Stock Qty,HSN Code
Fortune Sunflower Oil 1L,890103001,Grocery,165.00,142.00,120,1512
India Gate Basmati Rice 5kg,890103002,Grocery,480.00,390.00,45,1006
Dettol Antiseptic Soap 125g,890103003,Personal Care,58.00,46.00,200,3401
Ariel Matic Liquid Detergent 1L,890103004,Household,230.00,185.00,60,3402`,
  },
  MEDICAL: {
    format: 'CSV',
    name: 'Pharmacy Medicine Catalog (Excel Format)',
    content: `Product Name,Item Code,Group,MRP,Cost Price,Available Stock,Tax Rate
Dolo 650mg Tablet,MED-001,Tablets,32.00,22.00,500,12
Azithromycin 500mg,MED-002,Antibiotics,125.00,85.00,150,12
Benadryl Cough Syrup 100ml,MED-003,Syrups,115.00,78.00,80,12
Volini Pain Relief Gel 30g,MED-004,Ointments,140.00,98.00,60,18`,
  },
  JSON_SAMPLE: {
    format: 'JSON',
    name: 'Generic Cloud JSON Export',
    content: `[
  { "title": "Wireless Bluetooth Earbuds", "sku": "EAR-BLU-01", "category": "Electronics", "unit_price": 1499.00, "cost": 850.00, "qty": 30, "gst": 18 },
  { "title": "Fast USB-C Charging Cable 2m", "sku": "CABLE-C-02", "category": "Accessories", "unit_price": 399.00, "cost": 150.00, "qty": 85, "gst": 18 },
  { "title": "Smart Fitness Watch V2", "sku": "WATCH-SM-03", "category": "Wearables", "unit_price": 2499.00, "cost": 1400.00, "qty": 20, "gst": 18 }
]`,
  }
};

export default function DataImportStudio() {
  const [selectedFormat, setSelectedFormat] = useState<ImportFileType>('CSV');
  const [rawText, setRawText] = useState<string>(DEMO_PRESETS.RESTAURANT.content);
  const [previewResult, setPreviewResult] = useState<ImportPreviewResult | null>(() => {
    return ImportEngine.generateImportPreview({
      format: 'CSV',
      targetEntity: 'PRODUCTS',
      rawContent: DEMO_PRESETS.RESTAURANT.content,
    });
  });
  const [executionResult, setExecutionResult] = useState<ImportExecutionResult | null>(null);

  const handleGeneratePreview = (content: string, format: ImportFileType) => {
    const preview = ImportEngine.generateImportPreview({
      format,
      targetEntity: 'PRODUCTS',
      rawContent: content,
    });
    setPreviewResult(preview);
    setExecutionResult(null);
  };

  const handleLoadPreset = (key: string) => {
    const preset = DEMO_PRESETS[key];
    setSelectedFormat(preset.format);
    setRawText(preset.content);
    handleGeneratePreview(preset.content, preset.format);
  };

  const handleMappingChange = (sourceColumn: string, newTargetField: string) => {
    if (!previewResult) return;
    const updatedMappings: ColumnMapping[] = previewResult.mappings.map(m => {
      if (m.sourceColumn === sourceColumn) {
        return { ...m, targetField: newTargetField, confidence: newTargetField === 'IGNORE' ? 0 : 100, isAutoMatched: false };
      }
      return m;
    });

    const updatedPreview = ImportEngine.generateImportPreview({
      format: selectedFormat,
      targetEntity: 'PRODUCTS',
      rawContent: rawText,
      customMappings: updatedMappings,
    });
    setPreviewResult(updatedPreview);
  };

  const handleCommitImport = () => {
    if (!previewResult) return;
    const result = ImportEngine.executeImport(previewResult);
    setExecutionResult(result);
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Top Success Banner */}
      {executionResult && (
        <div className={cn(
          "p-4 rounded-2xl border flex items-center justify-between text-xs animate-in fade-in duration-200 shadow-xl",
          executionResult.success ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-red-500/10 border-red-500/30 text-red-400"
        )}>
          <div className="flex items-center gap-2.5">
            {executionResult.success ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <AlertTriangle className="w-5 h-5 flex-shrink-0" />}
            <div>
              <strong className="block text-sm">{executionResult.message}</strong>
              <span className="text-[11px] text-gray-400">
                {executionResult.importedCount} records successfully merged into system catalog.
              </span>
            </div>
          </div>
          <button onClick={() => setExecutionResult(null)} className="text-gray-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Header */}
      <div className="bg-[#131315] border border-[#1F1F21] rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <Upload className="w-5 h-5 text-[#C5A059]" />
            Universal Data Import Engine
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Seamlessly migrate catalog & inventory from <strong>Excel, CSV, JSON, and Legacy Billing Software</strong> with automated column mapping.
          </p>
        </div>

        {/* Preset Buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] text-gray-500 uppercase font-mono mr-1">Load Demo Datasets:</span>
          <button
            type="button"
            onClick={() => handleLoadPreset('RESTAURANT')}
            className="px-2.5 py-1 bg-[#1A1A1C] hover:bg-[#252528] border border-[#2D2D30] hover:border-[#C5A059] text-gray-300 hover:text-white text-[11px] font-bold rounded-lg transition-colors"
          >
            🍛 Restaurant CSV
          </button>
          <button
            type="button"
            onClick={() => handleLoadPreset('RETAIL')}
            className="px-2.5 py-1 bg-[#1A1A1C] hover:bg-[#252528] border border-[#2D2D30] hover:border-[#C5A059] text-gray-300 hover:text-white text-[11px] font-bold rounded-lg transition-colors"
          >
            🛒 Retail Excel
          </button>
          <button
            type="button"
            onClick={() => handleLoadPreset('MEDICAL')}
            className="px-2.5 py-1 bg-[#1A1A1C] hover:bg-[#252528] border border-[#2D2D30] hover:border-[#C5A059] text-gray-300 hover:text-white text-[11px] font-bold rounded-lg transition-colors"
          >
            💊 Medical Pharma
          </button>
          <button
            type="button"
            onClick={() => handleLoadPreset('JSON_SAMPLE')}
            className="px-2.5 py-1 bg-[#1A1A1C] hover:bg-[#252528] border border-[#2D2D30] hover:border-[#C5A059] text-gray-300 hover:text-white text-[11px] font-bold rounded-lg transition-colors"
          >
            ⚡ JSON Array
          </button>
        </div>
      </div>

      {/* Input Data Box */}
      <div className="bg-[#131315] border border-[#1F1F21] rounded-2xl p-5 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-gray-300 flex items-center gap-2">
            <Database className="w-4 h-4 text-[#C5A059]" />
            Source Raw Data Payload (Excel / CSV / JSON / Legacy Software Export)
          </label>
          <span className="text-[10px] font-mono text-gray-500">
            Detected: <strong>{selectedFormat}</strong>
          </span>
        </div>

        <textarea
          rows={6}
          value={rawText}
          onChange={e => {
            setRawText(e.target.value);
            handleGeneratePreview(e.target.value, selectedFormat);
          }}
          className="w-full bg-[#0A0A0B] border border-[#2D2D30] rounded-xl p-3 text-xs font-mono text-gray-200 outline-none focus:border-[#C5A059] leading-relaxed"
          placeholder="Paste CSV, TSV, or JSON data here..."
        />
      </div>

      {/* STEP 1: Automatic Column Mapping Matrix */}
      {previewResult && (
        <div className="bg-[#131315] border border-[#1F1F21] rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-[#1F1F21] pb-3">
            <div>
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#C5A059]" />
                Step 1: Automated Column Mapping Matrix
              </h4>
              <p className="text-xs text-gray-400 mt-0.5">
                Headers automatically mapped using alias pattern recognition. You can manually adjust mappings below.
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-bold">
              {previewResult.mappings.filter(m => m.isAutoMatched).length} / {previewResult.mappings.length} Auto-Matched
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {previewResult.mappings.map(mapping => (
              <div key={mapping.sourceColumn} className="p-3.5 bg-[#0A0A0B] border border-[#2D2D30] rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-white truncate" title={mapping.sourceColumn}>
                    {mapping.sourceColumn}
                  </span>
                  {mapping.isAutoMatched ? (
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5" />
                      {mapping.confidence}% MATCH
                    </span>
                  ) : (
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-gray-800 text-gray-400">
                      MANUAL
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <ArrowRight className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
                  <select
                    value={mapping.targetField}
                    onChange={e => handleMappingChange(mapping.sourceColumn, e.target.value)}
                    className="w-full bg-[#161618] border border-[#2D2D30] rounded-lg px-2 py-1 text-xs text-white outline-none focus:border-[#C5A059] font-mono"
                  >
                    <option value="IGNORE">-- Ignore Column --</option>
                    {STANDARD_PRODUCT_FIELDS.map(field => (
                      <option key={field.key} value={field.key}>
                        {field.label} {field.isRequired ? '(*Required)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STEP 2: Live Data Validation & Preview Table */}
      {previewResult && (
        <div className="bg-[#131315] border border-[#1F1F21] rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1F1F21] pb-3">
            <div>
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <Check className="w-4 h-4 text-[#C5A059]" />
                Step 2: Transformed Data Validation & Live Preview
              </h4>
              <p className="text-xs text-gray-400 mt-0.5">
                Total Rows: <strong>{previewResult.totalRows}</strong> • Valid Records: <strong className="text-emerald-400">{previewResult.validRowCount}</strong> • Validation Issues: <strong className={previewResult.invalidRowCount > 0 ? "text-red-400" : "text-gray-400"}>{previewResult.invalidRowCount}</strong>
              </p>
            </div>

            <button
              onClick={handleCommitImport}
              disabled={previewResult.validRowCount === 0}
              className="px-5 py-2.5 bg-[#C5A059] hover:bg-[#b08d4a] text-[#0A0A0B] font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-[#C5A059]/20 flex items-center gap-2 transition-all disabled:opacity-30 self-start sm:self-auto"
            >
              <Play className="w-4 h-4" />
              Commit & Import ({previewResult.validRowCount} Items)
            </button>
          </div>

          {/* Table Preview */}
          <div className="overflow-x-auto rounded-xl border border-[#1F1F21]">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#0A0A0B] border-b border-[#1F1F21] text-gray-400 uppercase tracking-wider text-[10px] font-mono">
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">Product Name</th>
                  <th className="py-2.5 px-3">SKU / Code</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Selling Price</th>
                  <th className="py-2.5 px-3">Cost Price</th>
                  <th className="py-2.5 px-3">Stock Qty</th>
                  <th className="py-2.5 px-3">GST%</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F1F21] font-mono">
                {previewResult.previewRows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-[#161618] transition-colors">
                    <td className="py-2 px-3 text-gray-500">{idx + 1}</td>
                    <td className="py-2 px-3 font-sans font-bold text-white">{row.name || <span className="text-red-400 font-mono">Missing Required Name</span>}</td>
                    <td className="py-2 px-3 text-[#C5A059]">{row.sku || '-'}</td>
                    <td className="py-2 px-3 text-gray-400 font-sans">{row.category || '-'}</td>
                    <td className="py-2 px-3 text-emerald-400 font-bold">₹{row.sellingPrice !== undefined ? row.sellingPrice : '-'}</td>
                    <td className="py-2 px-3 text-gray-300">{row.costPrice !== undefined ? `₹${row.costPrice}` : '-'}</td>
                    <td className="py-2 px-3 text-white">{row.stock !== undefined ? `${row.stock} units` : '-'}</td>
                    <td className="py-2 px-3 text-gray-400">{row.gstRate !== undefined ? `${row.gstRate}%` : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
