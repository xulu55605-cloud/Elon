import fs from "fs";
import path from "path";
import { DigestReport, ScheduleConfig, SystemStatus, MuskPost } from "../src/types.js";
import { fetchElonMuskLiveUpdates } from "./geminiService.js";
import { generateDigestHtml } from "./htmlGenerator.js";
import { sendDigestEmail } from "./mailService.js";

const DATA_DIR = path.resolve(process.cwd(), "data");
const REPORTS_FILE = path.join(DATA_DIR, "reports.json");
const CONFIG_FILE = path.join(DATA_DIR, "config.json");

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (e) {
    console.error("Could not create data dir:", e);
  }
}

// Default Configuration with the requested recipients and Brevo API
let currentConfig: ScheduleConfig = {
  enabled: true,
  time: "15:30",
  timezone: "Asia/Shanghai",
  recipientEmail: "xulu55605@gmail.com, lxsury@163.com",
  smtp: {
    mode: (process.env.EMAIL_MODE as any) || "brevo",
    resendApiKey: process.env.RESEND_API_KEY || "",
    brevoApiKey: process.env.BREVO_API_KEY || "",
    brevoSenderEmail: process.env.BREVO_SENDER_EMAIL || "xulu55605@gmail.com",
    brevoSenderName: process.env.BREVO_SENDER_NAME || "Elon Musk & 雷军 每日动态内参",
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT || 465),
    secure: process.env.SMTP_SECURE !== "false",
    user: process.env.SMTP_USER || "xulu55605@gmail.com",
    pass: process.env.SMTP_PASS || "",
    from: process.env.SMTP_FROM || "Elon Musk & 雷军 每日动态内参 <xulu55605@gmail.com>"
  },
  lastRunAt: undefined,
  nextRunAt: undefined,
  lastStatus: undefined
};

let reports: DigestReport[] = [];
let isFetchingInProgress = false;

// Load persisted state
function loadState() {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const data = fs.readFileSync(CONFIG_FILE, "utf-8");
      currentConfig = { ...currentConfig, ...JSON.parse(data) };
      if (!currentConfig.recipientEmail) {
        currentConfig.recipientEmail = "xulu55605@gmail.com, lxsury@163.com";
      }
    } else {
      currentConfig.recipientEmail = "xulu55605@gmail.com, lxsury@163.com";
    }
  } catch (e) {
    console.error("Error reading config file:", e);
  }

  try {
    if (fs.existsSync(REPORTS_FILE)) {
      const data = fs.readFileSync(REPORTS_FILE, "utf-8");
      reports = JSON.parse(data);
    }
  } catch (e) {
    console.error("Error reading reports file:", e);
  }
}

function saveState() {
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(currentConfig, null, 2), "utf-8");
    fs.writeFileSync(REPORTS_FILE, JSON.stringify(reports, null, 2), "utf-8");
  } catch (e) {
    console.error("Error saving state to disk:", e);
  }
}

loadState();

// Helper to compute category breakdown
function computeBreakdown(posts: MuskPost[]) {
  const map: Record<string, number> = {};
  posts.forEach((p) => {
    map[p.category] = (map[p.category] || 0) + 1;
  });
  return Object.entries(map).map(([category, count]) => ({ category, count }));
}

// Execution routine for generating a daily digest
export async function executeDailyDigest(options?: {
  recipient?: string;
  triggerType?: "manual" | "scheduled";
}): Promise<DigestReport> {
  if (isFetchingInProgress) {
    throw new Error("抓取与生成任务正在进行中，请稍候...");
  }

  isFetchingInProgress = true;
  const targetRecipient = options?.recipient || currentConfig.recipientEmail || "xulu55605@gmail.com";
  const now = new Date();
  const dateStr = now.toLocaleDateString("zh-CN", {
    timeZone: currentConfig.timezone || "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).replace(/\//g, "-");

  const reportId = `report-${dateStr}-${Date.now()}`;

  try {
    console.log(`[Scheduler] Fetching Elon Musk & Lei Jun latest updates for ${targetRecipient}...`);
    const { executiveSummary, keyInsights, posts, sourceMode } = await fetchElonMuskLiveUpdates();

    const partialReport: Omit<DigestReport, "htmlContent"> = {
      id: reportId,
      generatedAt: now.toISOString(),
      date: dateStr,
      title: `Elon Musk & 雷军 每日动态内参 - ${dateStr}`,
      totalPosts: posts.length,
      executiveSummary,
      keyInsights,
      posts,
      categoriesBreakdown: computeBreakdown(posts),
      deliveryStatus: "pending",
      recipient: targetRecipient,
      sourceMode
    };

    // Generate standalone HTML document
    const htmlContent = generateDigestHtml(partialReport);

    const fullReport: DigestReport = {
      ...partialReport,
      htmlContent
    };

    // Attempt email delivery
    console.log(`[Scheduler] Sending digest to ${targetRecipient}...`);
    const emailResult = await sendDigestEmail(fullReport, currentConfig.smtp);

    fullReport.deliveryStatus = emailResult.status;
    fullReport.deliveryDetails = emailResult.details;
    fullReport.sentAt = new Date().toISOString();
    if (emailResult.error) {
      fullReport.error = emailResult.error;
    }

    // Save report to archive (most recent first)
    reports.unshift(fullReport);
    if (reports.length > 50) {
      reports = reports.slice(0, 50);
    }

    currentConfig.lastRunAt = fullReport.sentAt;
    currentConfig.lastStatus = emailResult.status;
    saveState();

    return fullReport;
  } finally {
    isFetchingInProgress = false;
  }
}

// Bootstrap initial report if empty so the UI is immediately functional
export async function ensureInitialReport(): Promise<void> {
  if (reports.length === 0) {
    try {
      console.log("[Scheduler] Bootstrapping initial digest report...");
      await executeDailyDigest({ triggerType: "scheduled" });
    } catch (err) {
      console.error("[Scheduler] Initial bootstrap failed:", err);
    }
  }
}

// Scheduler loop (checks every 60 seconds)
let scheduleInterval: NodeJS.Timeout | null = null;

export function startScheduler(): void {
  if (scheduleInterval) {
    clearInterval(scheduleInterval);
  }

  // Calculate and store initial next run time
  updateNextRunTime();

  scheduleInterval = setInterval(async () => {
    if (!currentConfig.enabled) return;

    try {
      const now = new Date();
      // Format current HH:mm in configured timezone
      const timeInZone = now.toLocaleTimeString("en-GB", {
        timeZone: currentConfig.timezone || "Asia/Shanghai",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
      });

      const todayInZone = now.toLocaleDateString("zh-CN", {
        timeZone: currentConfig.timezone || "Asia/Shanghai",
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
      }).replace(/\//g, "-");

      if (timeInZone === currentConfig.time) {
        // Check if we haven't already run today
        const lastRunDate = currentConfig.lastRunAt
          ? new Date(currentConfig.lastRunAt).toLocaleDateString("zh-CN", {
              timeZone: currentConfig.timezone || "Asia/Shanghai",
              year: "numeric",
              month: "2-digit",
              day: "2-digit"
            }).replace(/\//g, "-")
          : "";

        if (lastRunDate !== todayInZone && !isFetchingInProgress) {
          console.log(`[Scheduler] Daily trigger activated at ${timeInZone} (${currentConfig.timezone})!`);
          await executeDailyDigest({ triggerType: "scheduled" });
          updateNextRunTime();
        }
      }
    } catch (err) {
      console.error("[Scheduler] Error in interval check:", err);
    }
  }, 60000);
}

function updateNextRunTime(): void {
  const [targetHour, targetMinute] = currentConfig.time.split(":").map(Number);
  const now = new Date();
  const next = new Date(now);
  next.setHours(targetHour, targetMinute, 0, 0);
  if (next <= now) {
    next.setDate(next.getDate() + 1);
  }
  currentConfig.nextRunAt = next.toISOString();
}

export function getReports(): DigestReport[] {
  return reports;
}

export function getReportById(id: string): DigestReport | undefined {
  return reports.find((r) => r.id === id);
}

export function getConfig(): ScheduleConfig {
  return currentConfig;
}

export function updateConfig(newConfig: Partial<ScheduleConfig>): ScheduleConfig {
  currentConfig = {
    ...currentConfig,
    ...newConfig,
    smtp: {
      ...currentConfig.smtp,
      ...(newConfig.smtp || {})
    }
  };
  updateNextRunTime();
  saveState();
  return currentConfig;
}

export function getSystemStatus(): SystemStatus {
  const isConfigured = Boolean(
    (currentConfig.smtp.mode === "brevo" && currentConfig.smtp.brevoApiKey) ||
    (currentConfig.smtp.mode === "resend" && currentConfig.smtp.resendApiKey) ||
    (currentConfig.smtp.host && currentConfig.smtp.user)
  );
  return {
    isConfigured,
    scheduleEnabled: currentConfig.enabled,
    nextRunTime: currentConfig.nextRunAt || "每日 " + currentConfig.time,
    recipientEmail: currentConfig.recipientEmail || "xulu55605@gmail.com, lxsury@163.com",
    totalReportsCount: reports.length,
    lastReportDate: reports[0]?.date,
    isFetching: isFetchingInProgress,
    geminiAvailable: Boolean(process.env.GEMINI_API_KEY)
  };
}
