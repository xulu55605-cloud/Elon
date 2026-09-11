import React from "react";
import { Download, FileCode, Send, CheckCircle2, AlertCircle, Clock, Calendar, Sparkles } from "lucide-react";
import { DigestReport } from "../types.js";

interface ReportSummaryBarProps {
  report: DigestReport;
  isSending: boolean;
  onPreviewHtml: () => void;
  onDownloadHtml: () => void;
  onSendEmail: () => void;
}

export const ReportSummaryBar: React.FC<ReportSummaryBarProps> = ({
  report,
  isSending,
  onPreviewHtml,
  onDownloadHtml,
  onSendEmail,
}) => {
  const getDeliveryBadge = () => {
    switch (report.deliveryStatus) {
      case "sent":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
            已成功发送至邮箱
          </span>
        );
      case "simulated":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-100 text-sky-800 border border-sky-300">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-sky-600" />
            HTML已生成就绪 (模拟投递)
          </span>
        );
      case "failed":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-300">
            <AlertCircle className="w-3.5 h-3.5 mr-1 text-rose-600" />
            发送失败
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
            <Clock className="w-3.5 h-3.5 mr-1 text-amber-600" />
            等待发送
          </span>
        );
    }
  };

  const getSourceModeBadge = () => {
    if (report.sourceMode === "grounded_search") {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-purple-50 text-purple-700 border border-purple-200">
          <Sparkles className="w-3 h-3 mr-1 text-purple-600" />
          实时联网检索
        </span>
      );
    }
    if (report.sourceMode === "gemini_synthesis") {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-sky-50 text-sky-700 border border-sky-200">
          <Sparkles className="w-3 h-3 mr-1 text-sky-600" />
          Gemini 智能研判
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
        高保真内参
      </span>
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-5 border-b border-slate-100">
        
        {/* Title & Status */}
        <div>
          <div className="flex items-center space-x-2.5 mb-1.5 flex-wrap gap-y-1">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              {report.title}
            </h2>
            {getDeliveryBadge()}
            {getSourceModeBadge()}
          </div>
          
          <div className="flex items-center space-x-3 text-xs text-slate-500 flex-wrap gap-y-1">
            <span className="flex items-center">
              <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
              简报日期: {report.date}
            </span>
            <span>·</span>
            <span>生成时间: {new Date(report.generatedAt).toLocaleTimeString()}</span>
            <span>·</span>
            <span className="text-slate-700 font-medium inline-flex items-center flex-wrap gap-1">
              <span>目标邮箱:</span>
              {report.recipient
                .split(/[,;\s]+/)
                .map((r) => r.trim())
                .filter(Boolean)
                .map((email, idx) => (
                  <code key={idx} className="bg-slate-100 px-1.5 py-0.5 rounded text-sky-700 font-mono text-[11px]">
                    {email}
                  </code>
                ))}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2.5 flex-wrap gap-y-2">
          {/* Preview HTML */}
          <button
            id="preview-html-btn"
            onClick={onPreviewHtml}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-medium rounded-lg text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors"
          >
            <FileCode className="w-3.5 h-3.5 text-slate-600" />
            <span>预览 HTML 简报</span>
          </button>

          {/* Download HTML */}
          <button
            id="download-html-btn"
            onClick={onDownloadHtml}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-medium rounded-lg text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>下载 .html 文件</span>
          </button>

          {/* Re-send Email */}
          <button
            id="resend-email-btn"
            onClick={onSendEmail}
            disabled={isSending}
            className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold rounded-lg text-white bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-400 transition-all shadow-sm"
          >
            <Send className={`w-3.5 h-3.5 ${isSending ? "animate-pulse" : ""}`} />
            <span>{isSending ? "正在发送..." : "立即发送至邮箱"}</span>
          </button>
        </div>
      </div>

      {/* Delivery Details Note */}
      {report.deliveryDetails && (
        <div className="mt-3.5 py-2 px-3 rounded-lg bg-slate-50 border border-slate-200/60 text-xs text-slate-600 flex items-center justify-between">
          <span className="truncate pr-2">
            <strong>状态反馈:</strong> {report.deliveryDetails}
          </span>
          {report.error && (
            <span className="text-rose-600 font-medium shrink-0">错误: {report.error}</span>
          )}
        </div>
      )}

      {/* Executive Overview Box */}
      <div className="mt-5 p-4 rounded-xl bg-gradient-to-r from-slate-50 to-sky-50/40 border border-slate-200/80">
        <div className="flex items-center space-x-2 text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
          <Sparkles className="w-4 h-4 text-sky-600" />
          <span>今日执行总览 (Executive Summary)</span>
        </div>
        <p className="text-sm text-slate-700 leading-relaxed">
          {report.executiveSummary}
        </p>

        {report.keyInsights && report.keyInsights.length > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-200/60">
            <div className="text-xs font-semibold text-slate-600 mb-2">⚡ 核心要点速递:</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {report.keyInsights.map((insight, idx) => (
                <div key={idx} className="flex items-start text-xs text-slate-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-500 mt-1.5 mr-2 shrink-0" />
                  <span>{insight}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Categories Bar */}
      <div className="mt-4 flex items-center gap-2 flex-wrap text-xs">
        <span className="text-slate-400 font-medium">覆盖领域分布:</span>
        {report.categoriesBreakdown?.map((cat, idx) => (
          <span
            key={idx}
            className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-medium border border-slate-200"
          >
            {cat.category}
            <span className="ml-1.5 text-sky-600 font-bold">{cat.count}</span>
          </span>
        ))}
      </div>
    </div>
  );
};
