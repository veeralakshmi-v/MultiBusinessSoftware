import { 
  AIAssistantModule, 
  SalesSummaryInsight, 
  StockPredictionInsight, 
  PurchaseSuggestion, 
  GSTSummaryInsight, 
  BusinessInsightItem,
  AIChatMessage
} from '../../types/ai';

export class AIAssistantEngine {
  /**
   * 1. AI Sales Summary Generation
   */
  static getSalesSummary(timeframe: 'TODAY' | 'WEEK' | 'MONTH' = 'TODAY'): SalesSummaryInsight {
    if (timeframe === 'TODAY') {
      return {
        timeframe: 'TODAY',
        totalRevenue: 42850.00,
        orderCount: 48,
        averageOrderValue: 892.70,
        peakHour: '1:00 PM - 2:30 PM (Lunch Rush)',
        topItems: [
          { name: 'Paneer Butter Masala', quantity: 34, revenue: 9520.00 },
          { name: 'Chicken Biryani Special', quantity: 28, revenue: 8960.00 },
          { name: 'Butter Garlic Naan', quantity: 62, revenue: 3720.00 },
          { name: 'Cold Pressed Fruit Juice', quantity: 22, revenue: 2640.00 },
        ],
        growthRate: 14.8,
        narrative: 'Today’s revenue is ₹42,850 across 48 orders (+14.8% vs last week). Peak velocity was observed between 1:00 PM and 2:30 PM with Paneer Butter Masala leading sales volume.',
      };
    } else if (timeframe === 'WEEK') {
      return {
        timeframe: 'WEEK',
        totalRevenue: 285400.00,
        orderCount: 312,
        averageOrderValue: 914.74,
        peakHour: 'Friday 7:30 PM - 9:30 PM',
        topItems: [
          { name: 'Paneer Butter Masala', quantity: 210, revenue: 58800.00 },
          { name: 'Chicken Biryani Special', quantity: 185, revenue: 59200.00 },
          { name: 'Cold Brew / Mocktails', quantity: 140, revenue: 21000.00 },
        ],
        growthRate: 11.2,
        narrative: 'Weekly turnover reached ₹2,85,400. Average ticket size grew from ₹840 to ₹914 due to successful combo upselling.',
      };
    } else {
      return {
        timeframe: 'MONTH',
        totalRevenue: 1184000.00,
        orderCount: 1290,
        averageOrderValue: 917.82,
        peakHour: 'Weekend Dinners (7 PM - 10 PM)',
        topItems: [
          { name: 'Chicken Biryani Special', quantity: 720, revenue: 230400.00 },
          { name: 'Paneer Butter Masala', quantity: 680, revenue: 190400.00 },
        ],
        growthRate: 18.5,
        narrative: 'Monthly gross sales crossed ₹11.84 Lakhs (+18.5% YoY). Retention among VIP loyalty members is 68%.',
      };
    }
  }

  /**
   * 2. AI Stock Prediction & Depletion Forecasting
   */
  static getStockPredictions(): StockPredictionInsight {
    const predictions = [
      {
        productId: 'prod-rice-01',
        name: 'Basmati Rice Premium 5kg',
        category: 'Grocery',
        currentStock: 12,
        dailyConsumptionRate: 4.5,
        estimatedDaysRemaining: 2.6,
        riskLevel: 'CRITICAL' as const,
      },
      {
        productId: 'prod-oil-02',
        name: 'Sunflower Cooking Oil 1L',
        category: 'Grocery',
        currentStock: 24,
        dailyConsumptionRate: 5.2,
        estimatedDaysRemaining: 4.6,
        riskLevel: 'WARNING' as const,
      },
      {
        productId: 'prod-paneer-03',
        name: 'Fresh Malai Paneer 1kg',
        category: 'Dairy',
        currentStock: 8,
        dailyConsumptionRate: 3.8,
        estimatedDaysRemaining: 2.1,
        riskLevel: 'CRITICAL' as const,
      },
      {
        productId: 'prod-paracetamol-04',
        name: 'Dolo 650mg Tablets (Strip of 15)',
        category: 'Pharmacy',
        currentStock: 120,
        dailyConsumptionRate: 14.0,
        estimatedDaysRemaining: 8.5,
        riskLevel: 'HEALTHY' as const,
      },
      {
        productId: 'prod-soap-05',
        name: 'Dettol Soap 125g',
        category: 'Personal Care',
        currentStock: 45,
        dailyConsumptionRate: 7.0,
        estimatedDaysRemaining: 6.4,
        riskLevel: 'WARNING' as const,
      },
    ];

    const criticalCount = predictions.filter(p => p.riskLevel === 'CRITICAL').length;
    const warningCount = predictions.filter(p => p.riskLevel === 'WARNING').length;

    return {
      predictions,
      criticalCount,
      warningCount,
      narrative: `AI Forecasting identified ${criticalCount} items with CRITICAL stockout risk (< 3 days runway) and ${warningCount} items in WARNING zone. Automated reorder triggers recommended.`,
    };
  }

  /**
   * 3. AI Purchase & Reorder Suggestions
   */
  static getPurchaseSuggestions(): PurchaseSuggestion[] {
    return [
      {
        productId: 'prod-rice-01',
        name: 'Basmati Rice Premium 5kg',
        currentStock: 12,
        suggestedOrderQty: 60,
        unitCost: 390.00,
        estimatedTotalCost: 23400.00,
        supplierName: 'South India Agro Millers',
        priority: 'HIGH',
        reason: 'Current stock lasts only 2.6 days. Order 60 bags to cover 15-day safety buffer.',
      },
      {
        productId: 'prod-paneer-03',
        name: 'Fresh Malai Paneer 1kg',
        currentStock: 8,
        suggestedOrderQty: 30,
        unitCost: 280.00,
        estimatedTotalCost: 8400.00,
        supplierName: 'Heritage Dairy Farms',
        priority: 'HIGH',
        reason: 'High consumption item running out in 2.1 days. Daily replenishment required.',
      },
      {
        productId: 'prod-oil-02',
        name: 'Sunflower Cooking Oil 1L',
        currentStock: 24,
        suggestedOrderQty: 50,
        unitCost: 142.00,
        estimatedTotalCost: 7100.00,
        supplierName: 'Fortune Agro Direct',
        priority: 'MEDIUM',
        reason: 'Reaching minimum threshold within 4.6 days.',
      },
    ];
  }

  /**
   * 4. AI GST Summary & Tax Compliance Analysis
   */
  static getGSTSummary(period = 'August 2026'): GSTSummaryInsight {
    const taxableSales = 485000.00;
    const cgst = 21825.00; // ~4.5% avg
    const sgst = 21825.00; // ~4.5% avg
    const igst = 5400.00;
    const totalTaxCollected = cgst + sgst + igst; // 49050.00
    const inputTaxCreditEstimated = 23600.00;
    const netTaxPayable = totalTaxCollected - inputTaxCreditEstimated; // 25450.00

    return {
      period,
      taxableSales,
      cgst,
      sgst,
      igst,
      totalTaxCollected,
      inputTaxCreditEstimated,
      netTaxPayable,
      filingDeadline: '20th September 2026 (GSTR-3B)',
      narrative: `For ${period}, total Output GST liability is ₹49,050 against estimated Input Tax Credit (ITC) of ₹23,600. Net tax remittance due is ₹25,450. GSTR-1 & 3B ready.`,
    };
  }

  /**
   * 5. AI Business Growth Insights & Profit Optimizations
   */
  static getBusinessInsights(): BusinessInsightItem[] {
    return [
      {
        id: 'ins-01',
        category: 'REVENUE',
        title: 'Smart Upsell Bundle: Main Course + Specialty Drink',
        impact: '+₹42,000 / month Revenue (+12% AOV)',
        confidenceScore: 94,
        actionRecommendation: 'Introduce a "Meal of the Day" prompt on POS counter offering a ₹40 combo savings when paired with Mocktails.',
      },
      {
        id: 'ins-02',
        category: 'COST_SAVING',
        title: 'Supplier Price Variance Detected on Dairy Supplies',
        impact: 'Save ~₹14,500 / month',
        confidenceScore: 88,
        actionRecommendation: 'Heritage Dairy unit cost is 5.4% above wholesale regional benchmark. Renegotiate or procure through direct distributor.',
      },
      {
        id: 'ins-03',
        category: 'MARKETING',
        title: 'VIP Customer Re-engagement Opportunity',
        impact: 'Recover ~35 Lapsed Customers (~₹65,000 Sales)',
        confidenceScore: 91,
        actionRecommendation: 'Trigger automated WhatsApp 10% loyalty discount to VIP customers who haven’t transacted in 21 days.',
      },
      {
        id: 'ins-04',
        category: 'INVENTORY',
        title: 'Slow-Moving Stock Depletion Strategy',
        impact: 'Liquidate ₹18,000 Tied Capital',
        confidenceScore: 85,
        actionRecommendation: 'Apply 15% clearance discount on slow-moving packaged items nearing 45-day shelf duration.',
      },
    ];
  }

  /**
   * NLP AI Query Dispatcher
   */
  static queryAssistant(prompt: string): AIChatMessage {
    const q = prompt.toLowerCase();
    const timestamp = new Date().toISOString();

    if (q.includes('sale') || q.includes('revenue') || q.includes('today') || q.includes('turnover')) {
      const data = this.getSalesSummary('TODAY');
      return {
        id: `ai-msg-${Date.now()}`,
        sender: 'AI',
        text: data.narrative,
        module: 'SALES_SUMMARY',
        structuredData: data,
        timestamp,
      };
    }

    if (q.includes('stock') || q.includes('depletion') || q.includes('predict') || q.includes('risk') || q.includes('run out')) {
      const data = this.getStockPredictions();
      return {
        id: `ai-msg-${Date.now()}`,
        sender: 'AI',
        text: data.narrative,
        module: 'STOCK_PREDICTION',
        structuredData: data,
        timestamp,
      };
    }

    if (q.includes('purchase') || q.includes('order') || q.includes('buy') || q.includes('suggest') || q.includes('reorder')) {
      const data = this.getPurchaseSuggestions();
      return {
        id: `ai-msg-${Date.now()}`,
        sender: 'AI',
        text: `AI generated ${data.length} priority purchase recommendations totalling ₹${data.reduce((s, i) => s + i.estimatedTotalCost, 0).toLocaleString()} to prevent supply bottlenecks.`,
        module: 'PURCHASE_SUGGESTIONS',
        structuredData: data,
        timestamp,
      };
    }

    if (q.includes('gst') || q.includes('tax') || q.includes('gstr') || q.includes('itc') || q.includes('filing')) {
      const data = this.getGSTSummary();
      return {
        id: `ai-msg-${Date.now()}`,
        sender: 'AI',
        text: data.narrative,
        module: 'GST_SUMMARY',
        structuredData: data,
        timestamp,
      };
    }

    // Default to Business Insights
    const data = this.getBusinessInsights();
    return {
      id: `ai-msg-${Date.now()}`,
      sender: 'AI',
      text: `AI Business Engine detected ${data.length} high-impact strategic growth & cost-saving opportunities with average confidence of 89.5%.`,
      module: 'BUSINESS_INSIGHTS',
      structuredData: data,
      timestamp,
    };
  }
}
