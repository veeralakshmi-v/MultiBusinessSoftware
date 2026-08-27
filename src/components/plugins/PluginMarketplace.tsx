import React, { useState, useEffect, useCallback } from 'react';
import { 
  CreditCard, Globe, Smartphone, QrCode, Scan, Printer, Truck, 
  Database, BookOpen, Settings2, Play, CheckCircle2, AlertTriangle, 
  X, Check, Sparkles, ExternalLink, RefreshCw, Key, ShieldCheck, Layers
} from 'lucide-react';
import { PluginEngine } from '../../lib/plugins/pluginEngine';
import { PluginDefinition, PluginCategory, PluginExecutionResult } from '../../types/plugin';
import { cn } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';

const ICON_MAP: Record<string, any> = {
  CreditCard,
  Globe,
  Smartphone,
  QrCode,
  Scan,
  Printer,
  Truck,
  Database,
  BookOpen,
};

export default function PluginMarketplace() {
  const { businessType } = useAuth();
  const [plugins, setPlugins] = useState<PluginDefinition[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [configuringPlugin, setConfiguringPlugin] = useState<PluginDefinition | null>(null);
  const [configValues, setConfigValues] = useState<Record<string, any>>({});
  const [testResult, setTestResult] = useState<PluginExecutionResult | null>(null);

  const loadPlugins = useCallback(() => {
    setPlugins(PluginEngine.getPlugins());
  }, []);

  useEffect(() => {
    loadPlugins();
  }, [loadPlugins]);

  const handleToggle = (pluginId: string, currentStatus: boolean) => {
    PluginEngine.togglePlugin(pluginId, !currentStatus);
    loadPlugins();
  };

  const handleOpenConfig = (plugin: PluginDefinition) => {
    setConfiguringPlugin(plugin);
    setConfigValues(plugin.config || {});
  };

  const handleSaveConfig = () => {
    if (!configuringPlugin) return;
    PluginEngine.updatePluginConfig(configuringPlugin.id, configValues);
    loadPlugins();
    setConfiguringPlugin(null);
  };

  const handleTestIntegration = (plugin: PluginDefinition) => {
    let hook = plugin.supportedHooks[0];
    let context: any = { amount: 1500, orderId: 'ORD-TEST-901', name: 'Product Sample', mrp: 499 };
    
    const results = PluginEngine.executeHook(hook, context, plugin.id);
    if (results.length > 0) {
      setTestResult(results[0]);
      setTimeout(() => setTestResult(null), 7000);
    }
  };

  const filteredPlugins = plugins.filter(p => {
    if (selectedCategory === 'ALL') return true;
    return p.category === selectedCategory;
  });

  const activeCount = plugins.filter(p => p.isEnabled).length;

  return (
    <div className="space-y-6">
      
      {/* Top Test Result Banner */}
      {testResult && (
        <div className={cn(
          "p-3 rounded-2xl border flex items-center justify-between text-xs animate-in fade-in duration-200",
          testResult.success 
            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" 
            : "bg-red-500/10 border-red-500/30 text-red-400"
        )}>
          <div className="flex items-center gap-2">
            {testResult.success ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <AlertTriangle className="w-4 h-4 flex-shrink-0" />}
            <span><strong>[{testResult.pluginId.toUpperCase()}] Result:</strong> {testResult.message || testResult.error}</span>
          </div>
          <button onClick={() => setTestResult(null)} className="text-gray-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Header & Metrics */}
      <div className="bg-[#131315] border border-[#1F1F21] rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#C5A059]" />
            Plugin Architecture & Integrations Hub
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Modular extension ecosystem for Payment Gateways, Hardware Peripherals, Logistics, and Accounting without modifying core codebase.
          </p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="px-3 py-1.5 rounded-xl bg-[#1A1A1C] border border-[#2D2D30] text-xs text-gray-300 font-mono">
            Active Plugins: <strong className="text-[#C5A059]">{activeCount} / {plugins.length}</strong>
          </div>
          <button
            onClick={loadPlugins}
            className="p-2 bg-[#1A1A1C] border border-[#2D2D30] hover:border-[#C5A059] rounded-xl text-gray-400 hover:text-white transition-colors"
            title="Reload Plugins"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Category Navigation Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {[
          { id: 'ALL', label: 'All Plugins' },
          { id: 'PAYMENT_GATEWAY', label: '💳 Payment Gateways' },
          { id: 'HARDWARE', label: '🖨️ Hardware & Peripherals' },
          { id: 'LOGISTICS', label: '🚚 Logistics & Courier' },
          { id: 'ACCOUNTING', label: '📊 Accounting & ERP' },
        ].map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={cn(
              "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border whitespace-nowrap",
              selectedCategory === cat.id
                ? "bg-[#C5A059] text-[#0A0A0B] border-[#C5A059] shadow-md shadow-[#C5A059]/20"
                : "bg-[#131315] text-gray-400 border-[#1F1F21] hover:text-white"
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Plugins Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPlugins.map(plugin => {
          const Icon = ICON_MAP[plugin.iconName] || Layers;
          return (
            <div
              key={plugin.id}
              className={cn(
                "p-5 rounded-2xl border transition-all flex flex-col justify-between relative shadow-lg",
                plugin.isEnabled
                  ? "bg-[#161618] border-[#1F1F21] hover:border-[#C5A059]/50"
                  : "bg-[#0F0F10] border-[#1A1A1C] opacity-70"
              )}
            >
              <div className="space-y-3">
                {/* Plugin Card Top */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#0A0A0B] border border-[#2D2D30] flex items-center justify-center text-[#C5A059]">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm tracking-tight">{plugin.name}</h4>
                      <p className="text-[10px] text-gray-500 font-mono">v{plugin.version} • {plugin.developer}</p>
                    </div>
                  </div>

                  {/* Toggle Switch */}
                  <button
                    type="button"
                    onClick={() => handleToggle(plugin.id, plugin.isEnabled)}
                    className={cn(
                      "relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                      plugin.isEnabled ? "bg-[#C5A059]" : "bg-gray-700"
                    )}
                  >
                    <span
                      className={cn(
                        "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                        plugin.isEnabled ? "translate-x-4 bg-[#0A0A0B]" : "translate-x-0"
                      )}
                    />
                  </button>
                </div>

                {/* Description */}
                <p className="text-xs text-gray-400 leading-relaxed min-h-[36px]">
                  {plugin.description}
                </p>

                {/* Supported Hooks Chips */}
                <div className="flex flex-wrap gap-1 pt-1">
                  {plugin.supportedHooks.map(hook => (
                    <span key={hook} className="px-2 py-0.5 rounded-md bg-[#0A0A0B] border border-[#2D2D30] text-[9px] text-[#C5A059] font-mono">
                      {hook}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="pt-4 mt-4 border-t border-[#1F1F21] flex items-center justify-between">
                <button
                  onClick={() => handleTestIntegration(plugin)}
                  disabled={!plugin.isEnabled}
                  className="px-2.5 py-1 bg-[#1A1A1C] hover:bg-[#252528] border border-[#2D2D30] hover:border-[#C5A059] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors disabled:opacity-30"
                >
                  <Play className="w-3 h-3 text-[#C5A059]" />
                  Test Hook
                </button>

                <button
                  onClick={() => handleOpenConfig(plugin)}
                  className="px-3 py-1 bg-[#1A1A1C] hover:bg-[#252528] border border-[#2D2D30] hover:border-[#C5A059] text-[#C5A059] text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <Settings2 className="w-3.5 h-3.5" />
                  Configure
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Plugin Configuration Modal */}
      {configuringPlugin && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-[#131315] border border-[#1F1F21] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 text-gray-200">
            <div className="flex items-center justify-between border-b border-[#1F1F21] pb-3">
              <div className="flex items-center gap-2.5">
                <Key className="w-5 h-5 text-[#C5A059]" />
                <div>
                  <h3 className="font-bold text-white text-sm">Configure {configuringPlugin.name}</h3>
                  <p className="text-[10px] text-gray-400">Manage credentials & hardware parameters</p>
                </div>
              </div>
              <button onClick={() => setConfiguringPlugin(null)} className="text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5">
              {configuringPlugin.configFields.map(field => (
                <div key={field.key} className="space-y-1">
                  <label className="text-xs font-bold text-gray-300 flex items-center justify-between">
                    <span>{field.label}</span>
                    {field.isRequired && <span className="text-[10px] text-red-400 font-mono">Required</span>}
                  </label>

                  {field.type === 'select' ? (
                    <select
                      value={configValues[field.key] || field.default || ''}
                      onChange={e => setConfigValues({ ...configValues, [field.key]: e.target.value })}
                      className="w-full bg-[#0A0A0B] border border-[#2D2D30] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#C5A059]"
                    >
                      {field.options?.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : field.type === 'boolean' ? (
                    <label className="flex items-center gap-2 cursor-pointer pt-1">
                      <input
                        type="checkbox"
                        checked={Boolean(configValues[field.key])}
                        onChange={e => setConfigValues({ ...configValues, [field.key]: e.target.checked })}
                        className="rounded bg-[#0A0A0B] border-[#2D2D30] text-[#C5A059] focus:ring-0"
                      />
                      <span className="text-xs text-gray-300">Enable feature parameter</span>
                    </label>
                  ) : (
                    <input
                      type={field.type === 'password' ? 'password' : 'text'}
                      value={configValues[field.key] !== undefined ? configValues[field.key] : ''}
                      onChange={e => setConfigValues({ ...configValues, [field.key]: e.target.value })}
                      placeholder={field.placeholder}
                      className="w-full bg-[#0A0A0B] border border-[#2D2D30] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#C5A059]"
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-[#1F1F21] flex items-center justify-end gap-2">
              <button
                onClick={() => setConfiguringPlugin(null)}
                className="px-3.5 py-1.5 bg-[#1A1A1C] border border-[#2D2D30] hover:border-gray-500 text-gray-300 font-bold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveConfig}
                className="px-4 py-1.5 bg-[#C5A059] hover:bg-[#b08d4a] text-[#0A0A0B] font-bold text-xs rounded-xl shadow-lg shadow-[#C5A059]/20"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
