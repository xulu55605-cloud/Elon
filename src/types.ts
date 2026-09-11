export interface MuskPost {
  id: string;
  timestamp: string;
  category: 'SpaceX / Starship' | 'Tesla / Robotaxi' | 'xAI / Grok' | 'X (Twitter)' | 'Tech & AI' | 'Politics & Economy' | 'Other';
  topic: string;
  originalText: string;
  translation: string;
  summary: string;
  sentiment: 'positive' | 'neutral' | 'urgent' | 'controversial';
  impactLevel: 'High' | 'Medium' | 'Low';
  engagement?: {
    likes?: string;
    retweets?: string;
    views?: string;
  };
  sourceUrl?: string;
  tags: string[];
}

export interface DigestReport {
  id: string;
  generatedAt: string;
  date: string;
  title: string;
  totalPosts: number;
  executiveSummary: string;
  keyInsights: string[];
  posts: MuskPost[];
  categoriesBreakdown: { category: string; count: number }[];
  htmlContent: string;
  deliveryStatus: 'sent' | 'pending' | 'simulated' | 'failed';
  recipient: string;
  sentAt?: string;
  deliveryDetails?: string;
  error?: string;
}

export interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from: string;
}

export interface ScheduleConfig {
  enabled: boolean;
  time: string; // e.g. "08:00"
  timezone: string; // e.g. "Asia/Shanghai"
  recipientEmail: string; // "xu.lu@cn.bosch.com"
  smtp: SmtpConfig;
  lastRunAt?: string;
  nextRunAt?: string;
  lastStatus?: string;
}

export interface SystemStatus {
  isConfigured: boolean;
  scheduleEnabled: boolean;
  nextRunTime: string;
  recipientEmail: string;
  totalReportsCount: number;
  lastReportDate?: string;
  isFetching: boolean;
  geminiAvailable: boolean;
}
