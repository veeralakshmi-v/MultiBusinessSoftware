export type AIAssistantModule = 
  | 'SALES_SUMMARY' 
  | 'STOCK_PREDICTION' 
  | 'PURCHASE_SUGGESTIONS' 
  | 'GST_SUMMARY' 
  | 'BUSINESS_INSIGHTS';

export interface SalesSummaryInsight {
  timeframe: 'TODAY' | 'WEEK' | 'MONTH';
  totalRevenue: number;
  orderCount: number;
  averageOrderValue: number;
  peakHour: string;
  topItems: { name: string; quantity: number; revenue: number }[];
  growthRate: number;
  narrative: string;
}

export interface StockPredictionItem {
  productId: string;
  name: string;
  category: string;
  currentStock: number;
  dailyConsumptionRate: number;
  estimatedDaysRemaining: number;
  riskLevel: 'CRITICAL' | 'WARNING' | 'HEALTHY';
}

export interface StockPredictionInsight {
  predictions: StockPredictionItem[];
  criticalCount: number;
  warningCount: number;
  narrative: string;
}

export interface PurchaseSuggestion {
  productId: string;
  name: string;
  currentStock: number;
  suggestedOrderQty: number;
  unitCost: number;
  estimatedTotalCost: number;
  supplierName: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  reason: string;
}

export interface GSTSummaryInsight {
  period: string;
  taxableSales: number;
  cgst: number;
  sgst: number;
  igst: number;
  totalTaxCollected: number;
  inputTaxCreditEstimated: number;
  netTaxPayable: number;
  filingDeadline: string;
  narrative: string;
}

export interface BusinessInsightItem {
  id: string;
  category: 'REVENUE' | 'COST_SAVING' | 'INVENTORY' | 'MARKETING';
  title: string;
  impact: string;
  confidenceScore: number;
  actionRecommendation: string;
}

export interface AIChatMessage {
  id: string;
  sender: 'USER' | 'AI';
  text: string;
  module?: AIAssistantModule;
  structuredData?: any;
  timestamp: string;
}
