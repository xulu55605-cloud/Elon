import React, { useState, useEffect } from "react";
import { X, Save, Clock, Mail, Server, Shield, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import { ScheduleConfig } from "../types.js";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: ScheduleConfig | null;
  onSaveConfig: (updated: Partial<ScheduleConfig>) => Promise<void>;
  onTestSmtp: (smtp: any) => Promise<{ success: boolean; message: string }>;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  onTestSmtp,
}) => {
  const [formData, setFormData] = useState<ScheduleConfig | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    if (config) {
      setFormData(JSON.parse(JSON.stringify(config)));
    }
  }, [config, isOpen]);

  if (!isOpen || !formData) return null;

  const handlePresetChange = (preset: string) => {
    if (!formData) return;
    if (preset === "bosch") {
      setFormData({
        ...formData,
        smtp: {
          ...formData.smtp,
          host: "mail.cn.bosch.com",
          port: 25,
          secure: false,
          from: "Elon Musk Daily Digest <noreply@cn.bosch.com>"
        }
      });
    } else if (preset === "office365") {
      setFormData({
        ...formData,
        smtp: {
          ...formData.smtp,
          host: "smtp.office365.com",
          port: 587,
          secure: false,
          from: "Elon Musk Daily Digest <your-account@domain.com>"
        }
      });
    } else if (preset === "gmail") {
      setFormData({
        ...formData,
        smtp: {
          ...formData.smtp,
          host: "smtp.gmail.com",
          port: 465,
          secure: true,
          from: "Elon Musk Daily Digest <your-gmail@gmail.com>"
        }
      });
    } else if (preset === "qq") {
      setFormData({
        ...formData,
        smtp: {
          ...formData.smtp,
          host: "smtp.qq.com",
          port: 465,
          secure: true,
          from: "Elon Musk Daily Digest <your-qq@qq.com>"
        }
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;
    setIsSaving(true);
    try {
      await onSaveConfig(formData);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestSmtpConnection = async () => {
    if (!formData) return;
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await onTestSmtp(formData.smtp);
      setTestResult(res);
    } catch (err: any) {
      setTestResult({ success: false, message: err?.message || "测试请求失败" });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl my-8 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-sky-100 text-sky-700">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                推送与自动化设置
              </h3>
              <p className="text-xs text-slate-500">
                配置每日定时任务与邮件投递参数
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* Section 1: Schedule */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center">
              <Clock className="w-3.5 h-3.5 mr-1.5 text-sky-600" />
              定时调度设置
            </h4>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-slate-800">
                    启用每日自动抓取与推送
                  </div>
                  <div className="text-xs text-slate-500">
                    开启后，系统将在设定时间自动抓取 Musk 最新动态并发送
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.enabled}
                    onChange={(e) =>
                      setFormData({ ...formData, enabled: e.target.checked })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600"></div>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    每日触发时间 (HH:mm)
                  </label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) =>
                      setFormData({ ...formData, time: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    运行所在时区
                  </label>
                  <select
                    value={formData.timezone}
                    onChange={(e) =>
                      setFormData({ ...formData, timezone: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                  >
                    <option value="Asia/Shanghai">北京时间 (Asia/Shanghai, UTC+8)</option>
                    <option value="Europe/Berlin">欧洲/柏林 (Europe/Berlin, CET/CEST)</option>
                    <option value="America/New_York">美国东部 (America/New_York, EST)</option>
                    <option value="America/Los_Angeles">美国太平洋 (America/Los_Angeles, PST)</option>
                    <option value="UTC">世界协调时 (UTC)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Recipient Target */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center">
              <Mail className="w-3.5 h-3.5 mr-1.5 text-sky-600" />
              收件目标邮箱 (Recipient)
            </h4>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-slate-700">
                  接收邮箱地址（支持输入多个，以逗号或分号分隔）
                </label>
                <div className="flex items-center space-x-1.5 text-[11px]">
                  {!formData.recipientEmail?.includes("lxsury@163.com") && (
                    <button
                      type="button"
                      onClick={() => {
                        const current = formData.recipientEmail ? formData.recipientEmail.trim() : "";
                        const updated = current ? `${current}, lxsury@163.com` : "lxsury@163.com";
                        setFormData({ ...formData, recipientEmail: updated });
                      }}
                      className="text-sky-600 hover:text-sky-700 font-medium hover:underline"
                    >
                      + 加入 lxsury@163.com
                    </button>
                  )}
                  {!formData.recipientEmail?.includes("xu.lu@cn.bosch.com") && (
                    <button
                      type="button"
                      onClick={() => {
                        const current = formData.recipientEmail ? formData.recipientEmail.trim() : "";
                        const updated = current ? `xu.lu@cn.bosch.com, ${current}` : "xu.lu@cn.bosch.com";
                        setFormData({ ...formData, recipientEmail: updated });
                      }}
                      className="text-sky-600 hover:text-sky-700 font-medium hover:underline"
                    >
                      + 加入 xu.lu@cn.bosch.com
                    </button>
                  )}
                </div>
              </div>
              <input
                type="text"
                required
                value={formData.recipientEmail}
                onChange={(e) =>
                  setFormData({ ...formData, recipientEmail: e.target.value })
                }
                placeholder="xu.lu@cn.bosch.com, lxsury@163.com"
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 font-mono"
              />
              
              {/* Active Recipient Tags */}
              <div className="mt-2 flex flex-wrap gap-1.5 items-center">
                <span className="text-[11px] text-slate-500 mr-1">当前有效收件人:</span>
                {formData.recipientEmail
                  ?.split(/[,;\s]+/)
                  .map((e) => e.trim())
                  .filter((e) => e.includes("@"))
                  .map((email, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-medium bg-sky-50 text-sky-700 border border-sky-200"
                    >
                      <Mail className="w-3 h-3 mr-1 text-sky-500" />
                      {email}
                    </span>
                  ))}
              </div>

              <p className="text-[11px] text-slate-500 mt-1.5">
                每日简报将自动作为正文排版和附件同时推送到上述所有指定邮箱。
              </p>
            </div>
          </div>

          {/* Section 3: SMTP Configuration */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center">
                <Server className="w-3.5 h-3.5 mr-1.5 text-sky-600" />
                SMTP 发信服务设置
              </h4>
              
              {/* Presets */}
              <div className="flex items-center space-x-1 text-xs">
                <span className="text-slate-400 mr-1">快捷预设:</span>
                <button
                  type="button"
                  onClick={() => handlePresetChange("bosch")}
                  className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
                >
                  Bosch企业邮
                </button>
                <button
                  type="button"
                  onClick={() => handlePresetChange("office365")}
                  className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
                >
                  Office 365
                </button>
                <button
                  type="button"
                  onClick={() => handlePresetChange("gmail")}
                  className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
                >
                  Gmail
                </button>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    SMTP 服务器地址 (Host)
                  </label>
                  <input
                    type="text"
                    value={formData.smtp.host}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        smtp: { ...formData.smtp, host: e.target.value }
                      })
                    }
                    placeholder="例如: smtp.office365.com 或 mail.cn.bosch.com"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    端口 (Port)
                  </label>
                  <input
                    type="number"
                    value={formData.smtp.port}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        smtp: { ...formData.smtp, port: Number(e.target.value) }
                      })
                    }
                    placeholder="587 或 465 或 25"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    用户名 / 邮箱账号 (User)
                  </label>
                  <input
                    type="text"
                    value={formData.smtp.user}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        smtp: { ...formData.smtp, user: e.target.value }
                      })
                    }
                    placeholder="发信邮箱账号"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    密码 / 授权应用码 (Password / App Token)
                  </label>
                  <input
                    type="password"
                    value={formData.smtp.pass}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        smtp: { ...formData.smtp, pass: e.target.value }
                      })
                    }
                    placeholder="••••••••"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  发件人名称与地址 (From)
                </label>
                <input
                  type="text"
                  value={formData.smtp.from}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      smtp: { ...formData.smtp, from: e.target.value }
                    })
                  }
                  placeholder="Elon Musk Daily Digest <noreply@digest.local>"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 font-mono"
                />
              </div>

              {/* Secure Checkbox */}
              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="smtp-secure"
                  checked={formData.smtp.secure}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      smtp: { ...formData.smtp, secure: e.target.checked }
                    })
                  }
                  className="rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                />
                <label htmlFor="smtp-secure" className="text-xs text-slate-600">
                  启用 SSL/TLS 直接加密 (通常 465 端口勾选；587 端口使用 STARTTLS 请取消勾选)
                </label>
              </div>

              {/* Test Button & Result */}
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={handleTestSmtpConnection}
                  disabled={isTesting || !formData.smtp.host}
                  className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 disabled:opacity-50 transition-colors shadow-xs"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? "animate-spin" : ""}`} />
                  <span>{isTesting ? "测试连接中..." : "测试 SMTP 连接"}</span>
                </button>

                {testResult && (
                  <div
                    className={`text-xs flex items-center ${
                      testResult.success ? "text-emerald-700 font-medium" : "text-rose-600"
                    }`}
                  >
                    {testResult.success ? (
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertCircle className="w-3.5 h-3.5 mr-1 text-rose-600 shrink-0" />
                    )}
                    <span>{testResult.message}</span>
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center space-x-1.5 px-5 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-lg shadow-sm transition-all"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? "正在保存..." : "保存所有配置"}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
