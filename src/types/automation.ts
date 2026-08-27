export type AutomationTriggerType = 'SCHEDULED_CRON' | 'EVENT_DRIVEN' | 'THRESHOLD_WATCHER';

export type AutomationFrequency = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'HOURLY' | 'REAL_TIME';

export type AutomationActionType = 
  | 'DAILY_BACKUP'
  | 'WEEKLY_SALES_EMAIL'
  | 'MONTHLY_GST_REPORT'
  | 'AUTO_PURCHASE_ORDER'
  | 'AUTO_STOCK_ALERT';

export interface AutomationJob {
  id: string;
  name: string;
  description: string;
  actionType: AutomationActionType;
  triggerType: AutomationTriggerType;
  frequency: AutomationFrequency;
  scheduleDescription: string;
  enabled: boolean;
  lastRunTime?: string;
  lastRunStatus?: 'SUCCESS' | 'FAILED' | 'PENDING';
  config: Record<string, any>;
  businessType?: string;
}

export interface AutomationExecutionLog {
  id: string;
  jobId: string;
  jobName: string;
  timestamp: string;
  status: 'SUCCESS' | 'FAILED';
  durationMs: number;
  summary: string;
  details?: Record<string, any>;
}
