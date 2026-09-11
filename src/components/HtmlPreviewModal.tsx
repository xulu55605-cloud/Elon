import React, { useState } from "react";
import { X, Download, Copy, Check, Monitor, Smartphone, Code, Eye } from "lucide-react";
import { DigestReport } from "../types.js";

interface HtmlPreviewModalProps {
  report: DigestReport | null;
  isOpen: boolean;
  onClose: () => void;
  onDownloadHtml: () => void;
}

export const HtmlPreviewModal: React.FC<HtmlPreviewModalProps> = ({
  report,
  isOpen,
  onClose,
  onDownloadHtml,
}) => {
  const [viewMode, setViewMode] = useState<"preview" | "code">("preview");
  const [deviceMode, setDeviceMode] = useState<"desktop" | "mobile">("desktop");
  const [copied, setCopied] = useState(false);

  if (!isOpen || !report) return null;

  const handleCopyCode = () => {
    if (report.htmlContent) {
      navigator.clipboard.writeText(report.htmlContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const filename = `Elon_Musk_Daily_Digest_${report.date}.html`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 sm:p-6 overflow-hidden animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden">
        
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-bold text-slate-900">
                HTML 简报文件预览
              </h3>
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                {filename}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              可直接在浏览器运行或作为邮件附件/正文发送 · 专送: <span className="font-mono text-sky-600">{report.recipient}</span>
            </p>
          </div>

          <div className="flex items-center space-x-2">
            {/* View Mode Switcher */}
            <div className="bg-slate-200/80 p-0.5 rounded-lg flex items-center text-xs">
              <button
                onClick={() => setViewMode("preview")}
                className={`flex items-center space-x-1 px-3 py-1 rounded-md transition-colors ${
                  viewMode === "preview" ? "bg-white font-medium text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>渲染预览</span>
              </button>
              <button
                onClick={() => setViewMode("code")}
                className={`flex items-center space-x-1 px-3 py-1 rounded-md transition-colors ${
                  viewMode === "code" ? "bg-white font-medium text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Code className="w-3.5 h-3.5" />
                <span>HTML 源码</span>
              </button>
            </div>

            {/* Device Switcher (only for preview mode) */}
            {viewMode === "preview" && (
              <div className="hidden sm:flex bg-slate-200/80 p-0.5 rounded-lg items-center text-xs">
                <button
                  onClick={() => setDeviceMode("desktop")}
                  className={`p-1.5 rounded-md transition-colors ${
                    deviceMode === "desktop" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
                  }`}
                  title="桌面视图 (640px)"
                >
                  <Monitor className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeviceMode("mobile")}
                  className={`p-1.5 rounded-md transition-colors ${
                    deviceMode === "mobile" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
                  }`}
                  title="移动端视图 (380px)"
                >
                  <Smartphone className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Copy Button */}
            {viewMode === "code" && (
              <button
                onClick={handleCopyCode}
                className="inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 shadow-xs"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>已复制</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                    <span>复制代码</span>
                  </>
                )}
              </button>
            )}

            {/* Download Button */}
            <button
              onClick={onDownloadHtml}
              className="inline-flex items-center space-x-1 px-3.5 py-1.5 text-xs font-semibold rounded-lg text-white bg-sky-600 hover:bg-sky-500 shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>下载文件</span>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 bg-slate-100 overflow-auto flex justify-center p-4">
          {viewMode === "preview" ? (
            <div
              className={`h-full bg-white shadow-lg transition-all duration-300 rounded-xl overflow-hidden ${
                deviceMode === "mobile" ? "w-[390px]" : "w-full max-w-[700px]"
              }`}
            >
              <iframe
                title="HTML Report Preview"
                srcDoc={report.htmlContent}
                className="w-full h-full border-0 bg-white"
                sandbox="allow-same-origin allow-popups"
              />
            </div>
          ) : (
            <div className="w-full h-full bg-slate-900 rounded-xl p-4 overflow-auto font-mono text-xs text-slate-200 leading-relaxed shadow-inner">
              <pre className="whitespace-pre-wrap">{report.htmlContent}</pre>
            </div>
          )}
        </div>

        {/* Modal Bottom Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <div>
            <span>文件大小: ~{(report.htmlContent?.length / 1024).toFixed(1)} KB</span>
            <span className="mx-2">·</span>
            <span>包含完整内联样式，兼容各类邮件客户端与浏览器离线浏览</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-600 hover:text-slate-900 font-medium"
          >
            关闭预览
          </button>
        </div>

      </div>
    </div>
  );
};
