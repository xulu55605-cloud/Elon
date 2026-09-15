import dns from "dns";
import net from "net";
import nodemailer from "nodemailer";
import { DigestReport, SmtpConfig } from "../src/types.js";

// Ensure Node.js resolves IPv4 addresses first to avoid ENETUNREACH on cloud platforms like Render / Docker
if (typeof dns.setDefaultResultOrder === "function") {
  dns.setDefaultResultOrder("ipv4first");
}

// Helper to create a robust nodemailer transporter with IPv4 pre-resolution
// This prevents Nodemailer's internal random IPv4/IPv6 selector from hitting IPv6 on Render
async function createSafeTransporter(effective: SmtpConfig) {
  let connectHost = effective.host;
  const servername = effective.host;

  if (effective.host && !net.isIP(effective.host)) {
    try {
      const addresses = await dns.promises.resolve4(effective.host);
      if (addresses && addresses.length > 0) {
        connectHost = addresses[0];
      }
    } catch (dnsErr) {
      console.warn(`DNS resolve4 for ${effective.host} failed, falling back to hostname:`, dnsErr);
    }
  }

  return nodemailer.createTransport({
    host: connectHost,
    port: effective.port,
    secure: effective.secure,
    auth: effective.user ? { user: effective.user, pass: effective.pass } : undefined,
    family: 4,
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 20000,
    servername: servername,
    tls: {
      servername: servername,
      rejectUnauthorized: false
    }
  } as any);
}

// Helper to resolve effective SMTP/Email configuration
export function getEffectiveSmtp(customConfig?: Partial<SmtpConfig>): SmtpConfig {
  const mode = customConfig?.mode || (process.env.EMAIL_MODE as any) || (process.env.BREVO_API_KEY ? "brevo" : process.env.RESEND_API_KEY ? "resend" : "smtp");
  const resendApiKey = (customConfig?.resendApiKey || process.env.RESEND_API_KEY || "").trim();
  const brevoApiKey = (customConfig?.brevoApiKey || process.env.BREVO_API_KEY || "").trim();
  const brevoSenderEmail = (customConfig?.brevoSenderEmail || process.env.BREVO_SENDER_EMAIL || customConfig?.user || "xulu55605@gmail.com").trim();
  const defaultSenderName = "Elon Musk & 雷军 每日动态内参";
  const brevoSenderName = (customConfig?.brevoSenderName || process.env.BREVO_SENDER_NAME || defaultSenderName).trim();

  const user = (customConfig?.user || process.env.SMTP_USER || "").trim();
  const pass = (customConfig?.pass || process.env.SMTP_PASS || "").trim();
  let from = (customConfig?.from || process.env.SMTP_FROM || "").trim();

  if (mode === "resend") {
    // Resend requires verified domain. If user still has @gmail.com or unverified default,
    // we must fall back to the built-in free onboarding domain 'onboarding@resend.dev'
    if (!from || from.includes("@gmail.com") || from.includes("noreply@digest.local")) {
      from = `${defaultSenderName} <onboarding@resend.dev>`;
    }
  } else if (mode === "brevo") {
    from = `${brevoSenderName} <${brevoSenderEmail}>`;
  } else {
    if (!from || from.includes("noreply@digest.local") || from.includes("onboarding@resend.dev")) {
      from = user ? `${defaultSenderName} <${user}>` : `${defaultSenderName} <noreply@digest.local>`;
    }
  }

  return {
    mode,
    resendApiKey,
    brevoApiKey,
    brevoSenderEmail,
    brevoSenderName,
    host: (customConfig?.host || process.env.SMTP_HOST || "").trim(),
    port: Number(customConfig?.port || process.env.SMTP_PORT || 587),
    secure: customConfig?.secure ?? (process.env.SMTP_SECURE === "true"),
    user,
    pass,
    from
  };
}

export async function verifySmtpConnection(config: SmtpConfig): Promise<{ success: boolean; message: string }> {
  const effective = getEffectiveSmtp(config);

  // If using Brevo HTTP API mode
  if (effective.mode === "brevo") {
    if (!effective.brevoApiKey) {
      return { success: false, message: "请填写 Brevo API Key (通常以 xkeysib- 开头)" };
    }
    try {
      const res = await fetch("https://api.brevo.com/v3/account", {
        headers: {
          "api-key": effective.brevoApiKey
        }
      });
      const data: any = await res.json().catch(() => ({}));
      if (res.ok) {
        return { success: true, message: `Brevo 认证成功！账户: ${data.email || '有效'}，每天赠送 300 封免费发信额度，支持发送给任何人。` };
      }
      return { success: false, message: `Brevo API 校验失败 (${res.status}): ${data.message || data.error || "Key无效"}` };
    } catch (e: any) {
      return { success: false, message: `无法连接 Brevo API: ${e.message}` };
    }
  }

  // If using Resend HTTP API mode
  if (effective.mode === "resend") {
    if (!effective.resendApiKey) {
      return { success: false, message: "请填写 Resend API Key (以 re_ 开头)" };
    }
    if (!effective.resendApiKey.startsWith("re_")) {
      return { success: false, message: "Resend API Key 格式不正确，通常以 re_ 开头" };
    }
    try {
      const res = await fetch("https://api.resend.com/api-keys", {
        headers: {
          Authorization: `Bearer ${effective.resendApiKey}`
        }
      });
      if (res.ok || res.status === 200) {
        return { success: true, message: "Resend HTTPS API 认证成功 (Full Access)！已就绪。" };
      }
      const data: any = await res.json().catch(() => ({}));
      if (
        res.status === 401 &&
        (data.message?.includes("restricted to only send emails") ||
         data.error?.includes("restricted to only send emails") ||
         JSON.stringify(data).includes("restricted"))
      ) {
        return { success: true, message: "Resend 发信 API Key 校验成功 (Sending Access)！已就绪。" };
      }
      return { success: false, message: `Resend API 校验失败 (${res.status}): ${data.message || data.error || "Key无效"}` };
    } catch (e: any) {
      return { success: false, message: `无法连接 Resend API: ${e.message}` };
    }
  }

  // Standard SMTP mode
  if (!config.host) {
    return { success: false, message: "未填写 SMTP 服务器地址 (Host)" };
  }

  try {
    const transporter = await createSafeTransporter(effective);
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
  const emailConfig = getEffectiveSmtp(customConfig);
  const rawRecipient = report.recipient || process.env.DEFAULT_RECIPIENT || "xulu55605@gmail.com, lxsury@163.com";
  
  // Parse multiple recipients (supports comma, semicolon, newline separated)
  const recipientList = rawRecipient
    .split(/[,;\n]+/)
    .map((r) => r.trim())
    .filter((r) => r.length > 0 && r.includes("@"));

  const targetDisplay = recipientList.length > 0 ? recipientList.join(", ") : rawRecipient;
  const toParam = recipientList.length > 0 ? recipientList : [rawRecipient];
  const subject = `【Elon Musk & 雷军 每日动态内参】${report.date} 双雄科技简报`;

  const attachmentFilename = `Elon_Musk_Lei_Jun_Daily_Digest_${report.date}.html`;

  // 1. Brevo HTTPS REST API Mode (Bypasses all cloud port blocks + sends to any email recipient without domain verification!)
  if (emailConfig.mode === "brevo" && emailConfig.brevoApiKey) {
    try {
      const payload: any = {
        sender: {
          name: emailConfig.brevoSenderName || "Elon Musk & 雷军 每日动态内参",
          email: emailConfig.brevoSenderEmail || "xulu55605@gmail.com"
        },
        to: recipientList.map((email) => ({ email })),
        subject: subject,
        htmlContent: report.htmlContent,
        textContent: `Elon Musk & 雷军 每日动态内参 (${report.date})\n\n今日摘要:\n${report.executiveSummary}\n\n请在支持 HTML 的邮件客户端中查看完整图文排版，或打开附件中的 ${attachmentFilename}。`,
        attachment: [
          {
            name: attachmentFilename,
            content: Buffer.from(report.htmlContent).toString("base64")
          }
        ]
      };

      const res = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "api-key": emailConfig.brevoApiKey,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data: any = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || data.error || `HTTP ${res.status}`);
      }

      return {
        success: true,
        status: "sent",
        details: `邮件已成功通过 Brevo HTTPS API 发送至 ${targetDisplay} (Message ID: ${data.messageId || data.id || 'ok'})，附件已包含 ${attachmentFilename}。`
      };
    } catch (err: any) {
      console.error("Failed to send real email via Brevo API:", err);
      return {
        success: false,
        status: "failed",
        details: `尝试通过 Brevo API 发送至 ${targetDisplay} 失败: ${err?.message || err}。`,
        error: err?.message || String(err)
      };
    }
  }

  // 2. Resend HTTP API Mode (Bypasses all cloud provider port blocks like Render / AWS)
  if (emailConfig.mode === "resend" && emailConfig.resendApiKey) {
    try {
      const payload: any = {
        from: emailConfig.from || "Elon Musk & 雷军 每日动态内参 <onboarding@resend.dev>",
        to: toParam,
        subject: subject,
        html: report.htmlContent,
        text: `Elon Musk & 雷军 每日动态内参 (${report.date})\n\n今日摘要:\n${report.executiveSummary}\n\n请在支持 HTML 的邮件客户端中查看完整图文排版，或打开附件中的 ${attachmentFilename}。`,
        attachments: [
          {
            filename: attachmentFilename,
            content: Buffer.from(report.htmlContent).toString("base64")
          }
        ]
      };

      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${emailConfig.resendApiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data: any = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || data.error || `HTTP ${res.status}`);
      }

      return {
        success: true,
        status: "sent",
        details: `邮件已成功通过 Resend HTTPS API 发送至 ${targetDisplay} (Email ID: ${data.id})，附件已包含 ${attachmentFilename}。`
      };
    } catch (err: any) {
      console.error("Failed to send real email via Resend API:", err);
      return {
        success: false,
        status: "failed",
        details: `尝试通过 Resend API 发送至 ${targetDisplay} 失败: ${err?.message || err}。`,
        error: err?.message || String(err)
      };
    }
  }

  // 3. Standard SMTP Mode
  if (emailConfig.host && (emailConfig.user || emailConfig.port === 25)) {
    try {
      const transporter = await createSafeTransporter(emailConfig);

      const info = await transporter.sendMail({
        from: emailConfig.from,
        to: toParam,
        subject: subject,
        text: `Elon Musk & 雷军 每日动态内参 (${report.date})\n\n今日摘要:\n${report.executiveSummary}\n\n请在支持 HTML 的邮件客户端中查看完整图文排版，或打开附件中的 ${attachmentFilename}。`,
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
        details: `邮件已成功通过 ${emailConfig.host} 发送至 ${targetDisplay} (Message ID: ${info.messageId})，附件已包含 ${attachmentFilename}。`
      };
    } catch (err: any) {
      console.error("Failed to send real email via SMTP:", err);
      return {
        success: false,
        status: "failed",
        details: `尝试通过 ${emailConfig.host} 发送至 ${targetDisplay} 失败: ${err?.message || err}。`,
        error: err?.message || String(err)
      };
    }
  }

  // 3. If neither is configured, record simulated delivery
  return {
    success: true,
    status: "simulated",
    details: `已生成独立 HTML 报告并成功就绪（目标邮箱: ${targetDisplay}）。目前未配置外部发信凭据，可在右上方“设置”中选择 Resend API 或 SMTP 即可自动进行公网发信。您也可以直接在线预览或一键下载该 ${attachmentFilename} 文件。`
  };
}
