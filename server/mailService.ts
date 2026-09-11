import dns from "dns";
import nodemailer from "nodemailer";
import { DigestReport, SmtpConfig } from "../src/types.js";

// Ensure Node.js resolves IPv4 addresses first to avoid ENETUNREACH on cloud platforms like Render / Docker
if (typeof dns.setDefaultResultOrder === "function") {
  dns.setDefaultResultOrder("ipv4first");
}

// Helper to resolve effective SMTP configuration
export function getEffectiveSmtp(customConfig?: Partial<SmtpConfig>): SmtpConfig {
  const user = (customConfig?.user || process.env.SMTP_USER || "").trim();
  const pass = (customConfig?.pass || process.env.SMTP_PASS || "").trim();
  let from = (customConfig?.from || process.env.SMTP_FROM || "").trim();
  if (!from || from.includes("noreply@digest.local")) {
    from = user ? `Elon Musk Daily Digest <${user}>` : "Elon Musk Daily Digest <noreply@digest.local>";
  }

  return {
    host: (customConfig?.host || process.env.SMTP_HOST || "").trim(),
    port: Number(customConfig?.port || process.env.SMTP_PORT || 587),
    secure: customConfig?.secure ?? (process.env.SMTP_SECURE === "true"),
    user,
    pass,
    from
  };
}

export async function verifySmtpConnection(config: SmtpConfig): Promise<{ success: boolean; message: string }> {
  if (!config.host) {
    return { success: false, message: "未填写 SMTP 服务器地址 (Host)" };
  }

  try {
    const effective = getEffectiveSmtp(config);
    const transporter = nodemailer.createTransport({
      host: effective.host,
      port: effective.port,
      secure: effective.secure,
      auth: effective.user ? { user: effective.user, pass: effective.pass } : undefined,
      family: 4, // Force IPv4 connection to prevent ENETUNREACH errors on cloud hosts
      connectionTimeout: 15000,
      greetingTimeout: 15000,
      socketTimeout: 20000,
      tls: {
        rejectUnauthorized: false
      }
    } as any);

    await transporter.verify();
    return { success: true, message: "SMTP 服务器连接测试成功！" };
  } catch (err: any) {
    return { success: false, message: `SMTP 连接失败: ${err?.message || err}` };
  }
}

export async function sendDigestEmail(
  report: DigestReport,
  customConfig?: Partial<SmtpConfig>
): Promise<{ success: boolean; status: 'sent' | 'simulated' | 'failed'; details: string; error?: string }> {
  const smtp = getEffectiveSmtp(customConfig);
  const rawRecipient = report.recipient || process.env.DEFAULT_RECIPIENT || "xu.lu@cn.bosch.com, lxsury@163.com";
  
  // Parse multiple recipients (supports comma, semicolon, newline separated)
  const recipientList = rawRecipient
    .split(/[,;\n]+/)
    .map((r) => r.trim())
    .filter((r) => r.length > 0 && r.includes("@"));

  const targetDisplay = recipientList.length > 0 ? recipientList.join(", ") : rawRecipient;
  const toParam = recipientList.length > 0 ? recipientList : rawRecipient;
  const subject = `【Elon Musk 每日动态内参】${report.date} 汇总简报`;

  const attachmentFilename = `Elon_Musk_Daily_Digest_${report.date}.html`;

  // If SMTP host is configured, try sending real email
  if (smtp.host && (smtp.user || smtp.port === 25)) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtp.host,
        port: smtp.port,
        secure: smtp.secure,
        auth: smtp.user ? { user: smtp.user, pass: smtp.pass } : undefined,
        family: 4, // Force IPv4 connection to prevent ENETUNREACH errors on cloud hosts
        connectionTimeout: 15000,
        greetingTimeout: 15000,
        socketTimeout: 20000,
        tls: {
          rejectUnauthorized: false
        }
      } as any);

      const info = await transporter.sendMail({
        from: smtp.from,
        to: toParam,
        subject: subject,
        text: `Elon Musk 每日动态内参 (${report.date})\n\n今日摘要:\n${report.executiveSummary}\n\n请在支持 HTML 的邮件客户端中查看完整图文排版，或打开附件中的 ${attachmentFilename}。`,
        html: report.htmlContent,
        attachments: [
          {
            filename: attachmentFilename,
            content: report.htmlContent,
            contentType: "text/html; charset=utf-8"
          }
        ]
      });

      return {
        success: true,
        status: "sent",
        details: `邮件已成功通过 ${smtp.host} 发送至 ${targetDisplay} (Message ID: ${info.messageId})，附件已包含 ${attachmentFilename}。`
      };
    } catch (err: any) {
      console.error("Failed to send real email via SMTP:", err);
      return {
        success: false,
        status: "failed",
        details: `尝试通过 ${smtp.host} 发送至 ${targetDisplay} 失败: ${err?.message || err}。`,
        error: err?.message || String(err)
      };
    }
  }

  // If SMTP is not yet configured, record simulated delivery with full details
  return {
    success: true,
    status: "simulated",
    details: `已生成独立 HTML 报告并成功就绪（目标邮箱: ${targetDisplay}）。目前未配置外部 SMTP 凭据，可在右上方“设置”中填入企业邮箱或公网 SMTP 即可自动进行公网发信。您也可以直接在线预览或一键下载该 ${attachmentFilename} 文件。`
  };
}
