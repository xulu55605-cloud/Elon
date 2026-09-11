import React from "react";
import { Sparkles, RefreshCw, Settings, Mail, Clock, ShieldCheck } from "lucide-react";
import { SystemStatus } from "../types.js";

interface HeaderProps {
  status: SystemStatus | null;
  isFetching: boolean;
  onFetchNow: () => void;
  onOpenSettings: () => void;
  onOpenHistory: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  status,
  isFetching,
  onFetchNow,
  onOpenSettings,
  onOpenHistory,
}) => {
  return (
    <header id="app-header" className="bg-slate-900 text-white border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Brand Info */}
          <div className="flex items-start sm:items-center space-x-3.5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/20 text-white flex-shrink-0">
              <span className="font-mono text-xl font-black tracking-tighter">𝕏</span>
            </div>
            <div>
              <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                <h1 className="text-xl font-bold tracking-tight text-white">
                  Elon Musk 社交动态每日简报系统
                </h1>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-sky-500/15 text-sky-400 border border-sky-500/30">
                  <ShieldCheck className="w-3 h-3 mr-1" />
                  自动化引擎
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 flex items-center flex-wrap gap-x-2">
                <span>每日抓取 𝕏 最新消息</span>
                <span className="text-slate-600">·</span>
                <span>智能汇总生成 HTML 报告</span>
                <span className="text-slate-600">·</span>
                <span className="text-sky-300 font-mono">专送: {status?.recipientEmail || "xu.lu@cn.bosch.com, lxsury@163.com"}</span>
              </p>
            </div>
          </div>

          {/* Right Action Bar */}
          <div className="flex items-center space-x-2.5 self-end md:self-auto">
            {/* Schedule Status Badge */}
            <div className="hidden lg:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs text-slate-300">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              <span>定时任务:</span>
              <span className="text-emerald-400 font-medium">
                {status?.scheduleEnabled ? "每日 08:00" : "已暂停"}
              </span>
            </div>

            {/* History Reports Button */}
            <button
              id="history-btn"
              onClick={onOpenHistory}
              className="inline-flex items-center space-x-1.5 px-3 py-2 text-xs font-medium rounded-lg text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
              title="查看历史归档简报"
            >
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>历史归档 ({status?.totalReportsCount || 0})</span>
            </button>

            {/* Settings Button */}
            <button
              id="settings-btn"
              onClick={onOpenSettings}
              className="inline-flex items-center space-x-1.5 px-3 py-2 text-xs font-medium rounded-lg text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
              title="配置定时与SMTP邮件"
            >
              <Settings className="w-3.5 h-3.5 text-slate-400" />
              <span>推送设置</span>
            </button>

            {/* Fetch Now Button */}
            <button
              id="fetch-now-btn"
              onClick={onFetchNow}
              disabled={isFetching}
              className={`inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold rounded-lg text-white shadow-md transition-all ${
                isFetching
                  ? "bg-sky-600/70 cursor-not-allowed"
                  : "bg-sky-600 hover:bg-sky-500 active:scale-95 shadow-sky-600/20"
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""}`} />
              <span>{isFetching ? "正在抓取与生成..." : "立即抓取与推送"}</span>
            </button>

          </div>
        </div>
      </div>
    </header>
  );
};
