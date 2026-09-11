import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import {
  getSystemStatus,
  getConfig,
  updateConfig,
  getReports,
  getReportById,
  executeDailyDigest,
  startScheduler,
  ensureInitialReport
} from "./server/scheduler.js";
import { verifySmtpConnection, sendDigestEmail } from "./server/mailService.js";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// 1. API Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// System status
app.get("/api/status", (req, res) => {
  try {
    const status = getSystemStatus();
    res.json(status);
  } catch (err: any) {
    res.status(500).json({ error: err?.message });
  }
});

// Get configuration
app.get("/api/config", (req, res) => {
  try {
    const config = getConfig();
    // Mask password slightly for safety
    const safeConfig = {
      ...config,
      smtp: {
        ...config.smtp,
        pass: config.smtp.pass ? "••••••••" : ""
      }
    };
    res.json(safeConfig);
  } catch (err: any) {
    res.status(500).json({ error: err?.message });
  }
});

// Update configuration
app.post("/api/config", (req, res) => {
  try {
    const payload = req.body;
    // Don't overwrite password with masked dots
    if (payload.smtp && payload.smtp.pass === "••••••••") {
      const current = getConfig();
      payload.smtp.pass = current.smtp.pass;
    }
    const updated = updateConfig(payload);
    res.json({ success: true, config: updated });
  } catch (err: any) {
    res.status(500).json({ error: err?.message });
  }
});

// Test SMTP connection
app.post("/api/test-smtp", async (req, res) => {
  try {
    const smtpPayload = req.body;
    if (smtpPayload.pass === "••••••••") {
      smtpPayload.pass = getConfig().smtp.pass;
    }
    const result = await verifySmtpConnection(smtpPayload);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err?.message || String(err) });
  }
});

// List all reports
app.get("/api/reports", (req, res) => {
  try {
    const reports = getReports();
    // Return summaries without huge htmlContent string to keep payload fast
    const summaries = reports.map((r) => {
      const { htmlContent, ...rest } = r;
      return rest;
    });
    res.json(summaries);
  } catch (err: any) {
    res.status(500).json({ error: err?.message });
  }
});

// Get single report with full content
app.get("/api/reports/:id", (req, res) => {
  try {
    const report = getReportById(req.params.id);
    if (!report) {
      return res.status(404).json({ error: "Report not found" });
    }
    res.json(report);
  } catch (err: any) {
    res.status(500).json({ error: err?.message });
  }
});

// Render Raw HTML for iframe preview
app.get("/api/reports/:id/html", (req, res) => {
  try {
    const report = getReportById(req.params.id);
    if (!report) {
      return res.status(404).send("<h3>Report not found</h3>");
    }
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.send(report.htmlContent);
  } catch (err: any) {
    res.status(500).send("Error loading HTML: " + err?.message);
  }
});

// Download standalone .html file
app.get("/api/reports/:id/download", (req, res) => {
  try {
    const report = getReportById(req.params.id);
    if (!report) {
      return res.status(404).send("Report not found");
    }
    const filename = `Elon_Musk_Daily_Digest_${report.date}.html`;
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.send(report.htmlContent);
  } catch (err: any) {
    res.status(500).send("Error downloading file");
  }
});

// Trigger fetch & generate now
app.post("/api/fetch-and-generate", async (req, res) => {
  try {
    const { recipient } = req.body || {};
    const report = await executeDailyDigest({
      recipient,
      triggerType: "manual"
    });
    res.json({ success: true, report });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || String(err) });
  }
});

// Re-send or send a report to email
app.post("/api/send-email", async (req, res) => {
  try {
    const { reportId, recipient } = req.body;
    const report = getReportById(reportId);
    if (!report) {
      return res.status(404).json({ success: false, error: "Report not found" });
    }

    const targetRecipient = recipient || report.recipient || getConfig().recipientEmail || "xu.lu@cn.bosch.com, lxsury@163.com";
    const reportToSend = { ...report, recipient: targetRecipient };

    const result = await sendDigestEmail(reportToSend, getConfig().smtp);

    // Update report status in archive
    report.deliveryStatus = result.status;
    report.deliveryDetails = result.details;
    report.recipient = targetRecipient;
    report.sentAt = new Date().toISOString();

    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || String(err) });
  }
});

// 2. Vite Middleware or Static Servings
async function initServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] Listening on http://0.0.0.0:${PORT}`);
    // Start scheduler and initialize first report
    startScheduler();
    ensureInitialReport();
  });
}

initServer().catch((err) => {
  console.error("[Server] Startup failed:", err);
});
