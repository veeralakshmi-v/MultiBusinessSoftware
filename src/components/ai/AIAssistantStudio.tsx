import React, { useState } from 'react';
import { 
  Bot, Sparkles, TrendingUp, AlertTriangle, ShoppingCart, 
  Receipt, Lightbulb, ArrowRight, Send, CheckCircle2, 
  Clock, Package, DollarSign, ShieldCheck, Zap
} from 'lucide-react';
import { AIAssistantEngine } from '../../lib/ai/aiAssistantEngine';
import { 
  AIAssistantModule, 
  SalesSummaryInsight, 
  StockPredictionInsight, 
  PurchaseSuggestion, 
  GSTSummaryInsight, 
  BusinessInsightItem,
  AIChatMessage
} from '../../types/ai';
import { cn } from '../../lib/utils';

export default function AIAssistantStudio() {
  const [activeModule, setActiveModule] = useState<AIAssistantModule>('SALES_SUMMARY');
  const [salesTimeframe, setSalesTimeframe] = useState<'TODAY' | 'WEEK' | 'MONTH'>('TODAY');
  
  // Custom Chat State
  const [chatPrompt, setChatPrompt] = useState('');
  const [messages, setMessages] = useState<AIChatMessage[]>([
    {
      id: 'welcome-01',
      sender: 'AI',
      text: 'Hello! I am your AI Business Co-Pilot. I can forecast stock depletion, compute GST liabilities, generate executive sales digests, and recommend margin growth strategies. Ask me anything below!',
      timestamp: new Date().toISOString(),
    }
  ]);

  const salesData: SalesSummaryInsight = AIAssistantEngine.getSalesSummary(salesTimeframe);
  const stockData: StockPredictionInsight = AIAssistantEngine.getStockPredictions();
  const purchaseData: PurchaseSuggestion[] = AIAssistantEngine.getPurchaseSuggestions();
  const gstData: GSTSummaryInsight = AIAssistantEngine.getGSTSummary();
  const insightsData: BusinessInsightItem[] = AIAssistantEngine.getBusinessInsights();

  const handleSendPrompt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatPrompt.trim()) return;

    const userMsg: AIChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'USER',
      text: chatPrompt,
      timestamp: new Date().toISOString(),
    };

    const aiMsg = AIAssistantEngine.queryAssistant(chatPrompt);
    setMessages(prev => [...prev, userMsg, aiMsg]);
    setChatPrompt('');
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header Banner */}
      <div className="bg-[#131315] border border-[#1F1F21] rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <Bot className="w-5 h-5 text-[#C5A059]" />
            Enterprise AI Intelligence & Predictive Co-Pilot
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Future-ready analytics: <strong>Sales Digest, Stock Forecasting, Purchase Suggestions, GST Summary & Growth Insights</strong>.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-[#C5A059]/10 border border-[#C5A059]/30 text-[#C5A059] text-xs font-mono font-bold flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" />
            AI Neural Engine Active
          </span>
        </div>
      </div>

      {/* Module Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {[
          { id: 'SALES_SUMMARY' as const, label: 'Sales Summary', icon: TrendingUp },
          { id: 'STOCK_PREDICTION' as const, label: 'Stock Forecasting', icon: Package },
          { id: 'PURCHASE_SUGGESTIONS' as const, label: 'Purchase Suggestions', icon: ShoppingCart },
          { id: 'GST_SUMMARY' as const, label: 'GST Tax Summary', icon: Receipt },
          { id: 'BUSINESS_INSIGHTS' as const, label: 'Growth Insights', icon: Lightbulb },
        ].map(mod => {
          const Icon = mod.icon;
          return (
            <button
              key={mod.id}
              onClick={() => setActiveModule(mod.id)}
              className={cn(
                "px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border whitespace-nowrap",
                activeModule === mod.id
                  ? "bg-[#C5A059] text-[#0A0A0B] border-[#C5A059] shadow-md shadow-[#C5A059]/20"
                  : "bg-[#131315] text-gray-400 border-[#1F1F21] hover:text-white"
              )}
            >
              <Icon className="w-4 h-4" />
              {mod.label}
            </button>
          );
        })}
      </div>

      {/* MODULE 1: SALES SUMMARY */}
      {activeModule === 'SALES_SUMMARY' && (
        <div className="bg-[#131315] border border-[#1F1F21] rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1F1F21] pb-4">
            <div>
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#C5A059]" />
                AI Executive Sales Digest
              </h4>
              <p className="text-xs text-gray-400 mt-0.5">{salesData.narrative}</p>
            </div>

            {/* Timeframe Switcher */}
            <div className="flex items-center gap-1 bg-[#0A0A0B] p-1 rounded-xl border border-[#1F1F21]">
              {(['TODAY', 'WEEK', 'MONTH'] as const).map(tf => (
                <button
                  key={tf}
                  onClick={() => setSalesTimeframe(tf)}
                  className={cn(
                    "px-3 py-1 rounded-lg text-xs font-mono font-bold transition-colors",
                    salesTimeframe === tf ? "bg-[#C5A059] text-[#0A0A0B]" : "text-gray-400 hover:text-white"
                  )}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>

          {/* Metric KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[#0A0A0B] p-4 rounded-xl border border-[#1F1F21]">
              <span className="text-[10px] text-gray-500 uppercase font-mono">Gross Turnover</span>
              <p className="text-xl font-bold text-white mt-1 font-mono">₹{salesData.totalRevenue.toLocaleString()}</p>
            </div>
            <div className="bg-[#0A0A0B] p-4 rounded-xl border border-[#1F1F21]">
              <span className="text-[10px] text-gray-500 uppercase font-mono">Total Bills / Orders</span>
              <p className="text-xl font-bold text-white mt-1 font-mono">{salesData.orderCount}</p>
            </div>
            <div className="bg-[#0A0A0B] p-4 rounded-xl border border-[#1F1F21]">
              <span className="text-[10px] text-gray-500 uppercase font-mono">Avg Ticket Size (AOV)</span>
              <p className="text-xl font-bold text-emerald-400 mt-1 font-mono">₹{salesData.averageOrderValue.toFixed(2)}</p>
            </div>
            <div className="bg-[#0A0A0B] p-4 rounded-xl border border-[#1F1F21]">
              <span className="text-[10px] text-gray-500 uppercase font-mono">Growth vs Last Period</span>
              <p className="text-xl font-bold text-[#C5A059] mt-1 font-mono">+{salesData.growthRate}%</p>
            </div>
          </div>

          {/* Top Velocity Items */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-gray-300">Top High-Velocity Products:</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {salesData.topItems.map((item, idx) => (
                <div key={idx} className="p-3 bg-[#0A0A0B] border border-[#1F1F21] rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-white block">{item.name}</span>
                    <span className="text-[10px] text-gray-500 font-mono">{item.quantity} units sold</span>
                  </div>
                  <strong className="text-[#C5A059] font-mono">₹{item.revenue.toLocaleString()}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODULE 2: STOCK PREDICTION */}
      {activeModule === 'STOCK_PREDICTION' && (
        <div className="bg-[#131315] border border-[#1F1F21] rounded-2xl p-6 shadow-xl space-y-5">
          <div className="border-b border-[#1F1F21] pb-4">
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <Package className="w-4 h-4 text-[#C5A059]" />
              AI Stock Depletion Forecasting & Run Rate Engine
            </h4>
            <p className="text-xs text-gray-400 mt-0.5">{stockData.narrative}</p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-[#1F1F21]">
            <table className="w-full text-left text-xs border-collapse font-mono">
              <thead>
                <tr className="bg-[#0A0A0B] border-b border-[#1F1F21] text-gray-400 uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Item Name</th>
                  <th className="py-3 px-4">Current Stock</th>
                  <th className="py-3 px-4">Daily Burn Rate</th>
                  <th className="py-3 px-4">Est. Runway Remaining</th>
                  <th className="py-3 px-4 text-right">Risk Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F1F21]">
                {stockData.predictions.map(item => (
                  <tr key={item.productId} className="hover:bg-[#161618] transition-colors">
                    <td className="py-3 px-4 font-sans font-bold text-white">{item.name}</td>
                    <td className="py-3 px-4 text-gray-300">{item.currentStock} units</td>
                    <td className="py-3 px-4 text-gray-400">{item.dailyConsumptionRate} / day</td>
                    <td className="py-3 px-4 font-bold text-white">
                      {item.estimatedDaysRemaining.toFixed(1)} Days
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className={cn(
                        "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                        item.riskLevel === 'CRITICAL' ? "bg-red-500/10 text-red-400 border border-red-500/30" :
                        item.riskLevel === 'WARNING' ? "bg-amber-500/10 text-amber-400 border border-amber-500/30" :
                        "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                      )}>
                        {item.riskLevel}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODULE 3: PURCHASE SUGGESTIONS */}
      {activeModule === 'PURCHASE_SUGGESTIONS' && (
        <div className="bg-[#131315] border border-[#1F1F21] rounded-2xl p-6 shadow-xl space-y-5">
          <div className="border-b border-[#1F1F21] pb-4">
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-[#C5A059]" />
              AI Automated Purchase & Reorder Recommendations
            </h4>
            <p className="text-xs text-gray-400 mt-0.5">
              Calculated using historical demand velocity, supplier lead time, and safety buffer thresholds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {purchaseData.map(po => (
              <div key={po.productId} className="p-4 bg-[#0A0A0B] border border-[#1F1F21] rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className={cn(
                    "px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase",
                    po.priority === 'HIGH' ? "bg-red-500/10 text-red-400 border border-red-500/30" : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                  )}>
                    {po.priority} PRIORITY
                  </span>
                  <span className="text-[10px] text-gray-500 font-mono">Stock: {po.currentStock}</span>
                </div>

                <div>
                  <h5 className="font-bold text-white text-xs">{po.name}</h5>
                  <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">{po.reason}</p>
                </div>

                <div className="p-2.5 bg-[#131315] rounded-lg border border-[#1F1F21] text-xs font-mono space-y-1">
                  <div className="flex justify-between text-gray-400">
                    <span>Suggested Order:</span>
                    <strong className="text-white">{po.suggestedOrderQty} units</strong>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Est. Procurement:</span>
                    <strong className="text-[#C5A059]">₹{po.estimatedTotalCost.toLocaleString()}</strong>
                  </div>
                  <div className="text-[10px] text-gray-500 truncate pt-1 border-t border-[#1F1F21]">
                    Vendor: {po.supplierName}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODULE 4: GST SUMMARY */}
      {activeModule === 'GST_SUMMARY' && (
        <div className="bg-[#131315] border border-[#1F1F21] rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1F1F21] pb-4">
            <div>
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <Receipt className="w-4 h-4 text-[#C5A059]" />
                AI GST Summary & Tax Compliance Digest
              </h4>
              <p className="text-xs text-gray-400 mt-0.5">{gstData.narrative}</p>
            </div>
            <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-bold rounded-xl self-start">
              Filing Due: {gstData.filingDeadline}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
            <div className="p-4 bg-[#0A0A0B] border border-[#1F1F21] rounded-xl">
              <span className="text-[10px] text-gray-500 uppercase">Taxable Turnover</span>
              <p className="text-lg font-bold text-white mt-1">₹{gstData.taxableSales.toLocaleString()}</p>
            </div>
            <div className="p-4 bg-[#0A0A0B] border border-[#1F1F21] rounded-xl">
              <span className="text-[10px] text-gray-500 uppercase">Output Tax (CGST+SGST)</span>
              <p className="text-lg font-bold text-amber-400 mt-1">₹{gstData.totalTaxCollected.toLocaleString()}</p>
            </div>
            <div className="p-4 bg-[#0A0A0B] border border-[#1F1F21] rounded-xl">
              <span className="text-[10px] text-gray-500 uppercase">Estimated ITC Credit</span>
              <p className="text-lg font-bold text-emerald-400 mt-1">₹{gstData.inputTaxCreditEstimated.toLocaleString()}</p>
            </div>
            <div className="p-4 bg-[#0A0A0B] border border-[#1F1F21] rounded-xl">
              <span className="text-[10px] text-gray-500 uppercase">Net Tax Payable (GSTR-3B)</span>
              <p className="text-lg font-bold text-[#C5A059] mt-1">₹{gstData.netTaxPayable.toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}

      {/* MODULE 5: BUSINESS INSIGHTS */}
      {activeModule === 'BUSINESS_INSIGHTS' && (
        <div className="bg-[#131315] border border-[#1F1F21] rounded-2xl p-6 shadow-xl space-y-5">
          <div className="border-b border-[#1F1F21] pb-4">
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-[#C5A059]" />
              AI Strategic Growth & Profitability Insights
            </h4>
            <p className="text-xs text-gray-400 mt-0.5">
              High-impact actionable recommendations generated across revenue, cost reduction, inventory, and customer retention.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {insightsData.map(ins => (
              <div key={ins.id} className="p-4 bg-[#0A0A0B] border border-[#1F1F21] rounded-xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-mono font-bold">
                    {ins.category}
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold">
                    {ins.confidenceScore}% AI CONFIDENCE
                  </span>
                </div>

                <h5 className="font-bold text-white text-xs">{ins.title}</h5>
                <div className="text-xs text-emerald-400 font-mono font-bold">{ins.impact}</div>
                <p className="text-[11px] text-gray-400 leading-relaxed">{ins.actionRecommendation}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Interactive AI Chat Box */}
      <div className="bg-[#131315] border border-[#1F1F21] rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex items-center gap-2 border-b border-[#1F1F21] pb-3">
          <Bot className="w-4 h-4 text-[#C5A059]" />
          <h4 className="font-bold text-white text-xs">Ask AI Co-Pilot Anything About Your Business</h4>
        </div>

        {/* Chat History */}
        <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={cn(
                "p-3 rounded-xl text-xs leading-relaxed max-w-[85%]",
                msg.sender === 'USER'
                  ? "bg-[#C5A059]/10 border border-[#C5A059]/30 text-white ml-auto"
                  : "bg-[#0A0A0B] border border-[#1F1F21] text-gray-300 mr-auto"
              )}
            >
              <div className="text-[9px] font-mono text-gray-500 mb-1">
                {msg.sender === 'USER' ? 'You' : '✨ AI Co-Pilot'}
              </div>
              <p>{msg.text}</p>
            </div>
          ))}
        </div>

        {/* Chat Input */}
        <form onSubmit={handleSendPrompt} className="flex items-center gap-2 pt-2">
          <input
            type="text"
            value={chatPrompt}
            onChange={e => setChatPrompt(e.target.value)}
            placeholder="e.g. 'Show stock predictions', 'What is my GST tax liability?', 'How to increase profits?'"
            className="flex-1 bg-[#0A0A0B] border border-[#2D2D30] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#C5A059]"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-[#C5A059] hover:bg-[#b08d4a] text-[#0A0A0B] font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
            Ask AI
          </button>
        </form>
      </div>

    </div>
  );
}
