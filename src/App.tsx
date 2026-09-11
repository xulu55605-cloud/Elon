import React, { useState, useEffect } from "react";
import { Header } from "./components/Header.js";
import { ReportSummaryBar } from "./components/ReportSummaryBar.js";
import { FeedList } from "./components/FeedList.js";
import { HtmlPreviewModal } from "./components/HtmlPreviewModal.js";
import { SettingsModal } from "./components/SettingsModal.js";
import { DeliveryHistoryModal } from "./components/DeliveryHistoryModal.js";
import { DigestReport, SystemStatus, ScheduleConfig } from "./types.js";
import { Sparkles, CheckCircle2, AlertCircle, RefreshCw, Send, Download } from "lucide-react";

export default function App() {
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [config, setConfig] = useState<ScheduleConfig | null>(null);
  const [reportsList, setReportsList] = useState<Omit<DigestReport, "htmlContent">[]>([]);
  const [currentReport, setCurrentReport] = useState<DigestReport | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [notification, setNotification] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);

  // Modals state
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const showNotification = (message: string, type: "success" | "error" | "info" = "success") => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 6000);
  };

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [statusRes, configRes, reportsRes] = await Promise.all([
        fetch("/api/status").then((r) => r.json()),
        fetch("/api/config").then((r) => r.json()),
        fetch("/api/reports").then((r) => r.json()),
      ]);

      setStatus(statusRes);
      setConfig(configRes);
      setReportsList(reportsRes || []);

      if (reportsRes && reportsRes.length > 0) {
        // Load latest report full content
        const latestId = reportsRes[0].id;
        const fullRes = await fetch(`/api/reports/${latestId}`).then((r) => r.json());
        setCurrentReport(fullRes);
      }
    } catch (err: any) {
      console.error("Failed to load initial applet data:", err);
      showNotification("加载系统数据失败: " + err?.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const handleSelectReport = async (reportId: string) => {
    try {
      const res = await fetch(`/api/reports/${reportId}`).then((r) => r.json());
      if (res && res.id) {
        setCurrentReport(res);
      }
    } catch (err: any) {
      showNotification("切换简报失败: " + err?.message, "error");
    }
  };

  const handleFetchNow = async () => {
    if (isFetching) return;
    setIsFetching(true);
    showNotification("已启动抓取引擎：正在检索 Elon Musk 最新推文与动态...", "info");

    try {
      const res = await fetch("/api/fetch-and-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipient: config?.recipientEmail || "xu.lu@cn.bosch.com, lxsury@163.com" }),
      }).then((r) => r.json());

      if (res.success && res.report) {
        setCurrentReport(res.report);
        // Refresh reports list & status
        const [statusRes, reportsRes] = await Promise.all([
          fetch("/api/status").then((r) => r.json()),
          fetch("/api/reports").then((r) => r.json()),
        ]);
        setStatus(statusRes);
        setReportsList(reportsRes || []);

        showNotification(
          `动态抓取成功！已汇总生成 HTML 简报并发送至 ${res.report.recipient}`,
          "success"
        );
      } else {
        throw new Error(res.error || "生成失败");
      }
    } catch (err: any) {
      showNotification("抓取与生成失败: " + err?.message, "error");
    } finally {
      setIsFetching(false);
    }
  };

  const handleSendEmail = async (reportId?: string) => {
    const targetId = reportId || currentReport?.id;
    if (!targetId) return;

    setIsSending(true);
    const targetRecipient = config?.recipientEmail || "xu.lu@cn.bosch.com, lxsury@163.com";
    showNotification(`正在推送 HTML 简报至 ${targetRecipient}...`, "info");

    try {
      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportId: targetId,
          recipient: targetRecipient,
        }),
      }).then((r) => r.json());

      if (res.success) {
        showNotification(res.details || `邮件已成功发送至 ${targetRecipient}`, "success");
        // Update local report status
        if (currentReport && currentReport.id === targetId) {
          setCurrentReport({
            ...currentReport,
            deliveryStatus: res.status,
            deliveryDetails: res.details,
            recipient: targetRecipient,
            sentAt: new Date().toISOString(),
          });
        }
      } else {
        showNotification(res.details || res.error || "邮件发送遇到问题", "error");
      }
    } catch (err: any) {
      showNotification("邮件推送接口异常: " + err?.message, "error");
    } finally {
      setIsSending(false);
    }
  };

  const handleDownloadHtml = (reportId?: string) => {
    const targetId = reportId || currentReport?.id;
    if (!targetId) return;
    const downloadUrl = `/api/reports/${targetId}/download`;
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.setAttribute("download", `Elon_Musk_Daily_Digest_${currentReport?.date || "today"}.html`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveConfig = async (updated: Partial<ScheduleConfig>) => {
    try {
      const res = await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      }).then((r) => r.json());

      if (res.success) {
        setConfig(res.config);
        const statusRes = await fetch("/api/status").then((r) => r.json());
        setStatus(statusRes);
        showNotification("定时调度与邮件配置已成功更新！", "success");
      }
    } catch (err: any) {
      showNotification("保存配置失败: " + err?.message, "error");
      throw err;
    }
  };

  const handleTestSmtp = async (smtpPayload: any) => {
    const res = await fetch("/api/test-smtp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(smtpPayload),
    }).then((r) => r.json());
    return res;
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-sky-100 selection:text-sky-900">
      
      {/* App Header */}
      <Header
        status={status}
        isFetching={isFetching}
        onFetchNow={handleFetchNow}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
      />

      {/* Floating Notification Toast */}
      {notification && (
        <div className="fixed top-5 right-5 z-50 max-w-md animate-in slide-in-from-top-2 duration-200">
          <div
            className={`p-4 rounded-xl shadow-xl border flex items-start space-x-3 ${
              notification.type === "success"
                ? "bg-emerald-50 text-emerald-900 border-emerald-300"
                : notification.type === "error"
                ? "bg-rose-50 text-rose-900 border-rose-300"
                : "bg-sky-50 text-sky-900 border-sky-300"
            }`}
          >
            {notification.type === "success" && (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            )}
            {notification.type === "error" && (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            )}
            {notification.type === "info" && (
              <RefreshCw className="w-5 h-5 text-sky-600 shrink-0 mt-0.5 animate-spin" />
            )}
            <div className="text-xs leading-relaxed font-medium">
              {notification.message}
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-28 text-center">
            <RefreshCw className="w-8 h-8 text-sky-600 animate-spin mb-3" />
            <div className="text-sm font-semibold text-slate-700">
              正在初始化简报系统...
            </div>
            <div className="text-xs text-slate-400 mt-1">
              检查定时调度状态与抓取引擎
            </div>
          </div>
        ) : currentReport ? (
          <div>
            {/* Top Summary & Actions */}
            <ReportSummaryBar
              report={currentReport}
              isSending={isSending}
              onPreviewHtml={() => setIsPreviewOpen(true)}
              onDownloadHtml={() => handleDownloadHtml()}
              onSendEmail={() => handleSendEmail()}
            />

            {/* Feed Section */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <h3 className="text-base font-bold text-slate-900">
                    最新社交动态聚合明细
                  </h3>
                  <span className="text-xs text-slate-400">
                    ({currentReport.posts?.length || 0} 条抓取记录)
                  </span>
                </div>
                <button
                  onClick={() => setIsPreviewOpen(true)}
                  className="text-xs text-sky-600 hover:text-sky-700 font-medium"
                >
                  查看完整排版 HTML &rarr;
                </button>
              </div>

              <FeedList posts={currentReport.posts || []} />
            </div>
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 p-8 shadow-xs">
            <Sparkles className="w-12 h-12 text-sky-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              暂无已生成的简报
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mb-5">
              点击下方按钮即可立即抓取 Elon Musk 过去 24-48 小时的最新社交动态并自动生成 HTML 简报文件。
            </p>
            <button
              onClick={handleFetchNow}
              disabled={isFetching}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-sky-600 hover:bg-sky-500 shadow-md transition-all"
            >
              <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
              <span>{isFetching ? "抓取中..." : "立即抓取最新动态"}</span>
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200/80 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-slate-700">Elon Musk 每日社交动态聚合与推送系统</span>
            <span>·</span>
            <span>目标专送: <code className="text-sky-700">{config?.recipientEmail || "xu.lu@cn.bosch.com"}</code></span>
          </div>
          <div className="text-slate-400">
            支持标准 HTML 格式邮件分发 · 内嵌完整样式与独立附件
          </div>
        </div>
      </footer>

      {/* Modals */}
      <HtmlPreviewModal
        report={currentReport}
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        onDownloadHtml={() => handleDownloadHtml()}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={config}
        onSaveConfig={handleSaveConfig}
        onTestSmtp={handleTestSmtp}
      />

      <DeliveryHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        reports={reportsList}
        onSelectReport={handleSelectReport}
        onDownloadHtml={handleDownloadHtml}
        onResendReport={handleSendEmail}
      />

    </div>
  );
}
