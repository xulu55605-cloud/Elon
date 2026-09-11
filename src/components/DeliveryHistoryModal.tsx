import React from "react";
import { X, Download, Send, CheckCircle2, AlertCircle, Clock, Calendar, Mail, FileCode } from "lucide-react";
import { DigestReport } from "../types.js";

interface DeliveryHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  reports: Omit<DigestReport, "htmlContent">[];
  onSelectReport: (reportId: string) => void;
  onDownloadHtml: (reportId: string) => void;
  onResendReport: (reportId: string) => void;
}

export const DeliveryHistoryModal: React.FC<DeliveryHistoryModalProps> = ({
  isOpen,
  onClose,
  reports,
  onSelectReport,
  onDownloadHtml,
  onResendReport,
}) => {
  if (!isOpen) return null;

  const getStatusPill = (status: string) => {
    switch (status) {
      case "sent":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" />
            已发送至邮箱
          </span>
        );
      case "simulated":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-sky-100 text-sky-800">
            <CheckCircle2 className="w-3 h-3 mr-1 text-sky-600" />
            HTML已生成就绪
          </span>
        );
      case "failed":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-100 text-rose-800">
            <AlertCircle className="w-3 h-3 mr-1 text-rose-600" />
            发送失败
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700">
            <Clock className="w-3 h-3 mr-1 text-slate-500" />
            待处理
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl my-8 overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-indigo-100 text-indigo-700">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                历史简报归档与发送记录
              </h3>
              <p className="text-xs text-slate-500">
                已收录 {reports.length} 期自动/手动抓取的 Elon Musk 动态简报
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Table */}
        <div className="flex-1 overflow-y-auto p-6">
          {reports.length === 0 ? (
            <div className="text-center py-16 text-slate-400 text-sm">
              暂无历史报告，可点击主页面的“立即抓取与推送”生成第一期简报。
            </div>
          ) : (
            <div className="space-y-3">
              {reports.map((item) => (
                <div
                  key={item.id}
                  className="bg-white border border-slate-200 rounded-xl p-4 hover:border-slate-300 hover:shadow-xs transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                      <h4 className="text-sm font-bold text-slate-900">
                        {item.title}
                      </h4>
                      {getStatusPill(item.deliveryStatus)}
                    </div>
                    
                    <div className="flex items-center space-x-3 text-xs text-slate-500 flex-wrap gap-y-1">
                      <span className="flex items-center">
                        <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
                        {item.date}
                      </span>
                      <span>·</span>
                      <span>动态数量: {item.totalPosts} 条</span>
                      <span>·</span>
                      <span>收件人: <code className="text-sky-700 bg-slate-100 px-1 py-0.5 rounded">{item.recipient}</code></span>
                    </div>

                    {item.deliveryDetails && (
                      <p className="text-[11px] text-slate-500 line-clamp-1 pt-0.5">
                        {item.deliveryDetails}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <button
                      onClick={() => {
                        onSelectReport(item.id);
                        onClose();
                      }}
                      className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center space-x-1"
                    >
                      <FileCode className="w-3.5 h-3.5" />
                      <span>查看/预览</span>
                    </button>

                    <button
                      onClick={() => onDownloadHtml(item.id)}
                      className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center space-x-1"
                      title="下载HTML文件"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>下载</span>
                    </button>

                    <button
                      onClick={() => onResendReport(item.id)}
                      className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors flex items-center space-x-1 shadow-xs"
                      title="重发至邮箱"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>重发邮件</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>所有简报均以标准 HTML 格式固化存储并生成离线附件</span>
          <button
            onClick={onClose}
            className="text-slate-600 hover:text-slate-900 font-medium"
          >
            关闭窗口
          </button>
        </div>

      </div>
    </div>
  );
};
