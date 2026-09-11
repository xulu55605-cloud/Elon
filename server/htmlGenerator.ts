import { DigestReport, MuskPost } from "../src/types.js";

export function generateDigestHtml(report: Omit<DigestReport, "htmlContent">): string {
  const { date, generatedAt, executiveSummary, keyInsights, posts, recipient } = report;

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "SpaceX / Starship":
        return { bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE" };
      case "Tesla / Robotaxi":
        return { bg: "#FEF2F2", text: "#B91C1C", border: "#FECACA" };
      case "xAI / Grok":
        return { bg: "#F5F3FF", text: "#6D28D9", border: "#DDD6FE" };
      case "X (Twitter)":
        return { bg: "#F0FDF4", text: "#15803D", border: "#BBF7D0" };
      case "Tech & AI":
        return { bg: "#FFFBEB", text: "#B45309", border: "#FDE68A" };
      case "Politics & Economy":
        return { bg: "#F8FAFC", text: "#334155", border: "#E2E8F0" };
      default:
        return { bg: "#F1F5F9", text: "#475569", border: "#CBD5E1" };
    }
  };

  const getImpactBadge = (level: string) => {
    if (level === "High") {
      return `<span style="display:inline-block;padding:2px 8px;font-size:11px;font-weight:700;color:#FFFFFF;background-color:#DC2626;border-radius:9999px;letter-spacing:0.5px;">高影响力 (HIGH)</span>`;
    }
    if (level === "Medium") {
      return `<span style="display:inline-block;padding:2px 8px;font-size:11px;font-weight:600;color:#92400E;background-color:#FEF3C7;border:1px solid #FCD34D;border-radius:9999px;">中等关注 (MED)</span>`;
    }
    return `<span style="display:inline-block;padding:2px 8px;font-size:11px;font-weight:500;color:#475569;background-color:#F1F5F9;border:1px solid #E2E8F0;border-radius:9999px;">一般观察</span>`;
  };

  const postsHtml = posts
    .map((post, index) => {
      const catStyle = getCategoryColor(post.category);
      const impactHtml = getImpactBadge(post.impactLevel);
      const tagsHtml = (post.tags || [])
        .map(
          (t) =>
            `<span style="display:inline-block;padding:2px 6px;margin-right:4px;font-size:11px;color:#64748B;background:#F1F5F9;border-radius:4px;">#${t}</span>`
        )
        .join("");

      return `
      <!-- Post Card ${index + 1} -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;background:#FFFFFF;border:1px solid #E2E8F0;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.05);">
        <tr>
          <td style="padding:18px 24px;border-bottom:1px solid #F1F5F9;background:#FAFAFA;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="vertical-align:middle;">
                  <span style="display:inline-block;padding:3px 10px;font-size:12px;font-weight:600;color:${catStyle.text};background:${catStyle.bg};border:1px solid ${catStyle.border};border-radius:6px;margin-right:8px;">
                    ${post.category}
                  </span>
                  ${impactHtml}
                </td>
                <td style="text-align:right;vertical-align:middle;font-size:12px;color:#94A3B8;">
                  ${post.timestamp}
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <tr>
          <td style="padding:20px 24px;">
            <h3 style="margin:0 0 12px 0;font-size:17px;font-weight:700;color:#0F172A;line-height:1.4;">
              ${index + 1}. ${post.topic}
            </h3>

            <!-- Chinese translation -->
            <div style="margin-bottom:14px;padding:12px 14px;background:#F8FAFC;border-left:4px solid #0284C7;border-radius:0 6px 6px 0;font-size:14px;line-height:1.6;color:#1E293B;">
              <div style="font-size:11px;font-weight:700;color:#0284C7;text-transform:uppercase;margin-bottom:4px;letter-spacing:0.5px;">核心内容译文</div>
              ${post.translation}
            </div>

            <!-- Original Quote -->
            <div style="margin-bottom:14px;padding:10px 14px;background:#FFF;border:1px dashed #CBD5E1;border-radius:6px;font-size:13px;line-height:1.5;color:#475569;font-style:italic;">
              <span style="color:#94A3B8;font-weight:600;font-style:normal;margin-right:4px;">Elon Musk原话引用:</span>
              "${post.originalText}"
            </div>

            <!-- Takeaway/Analysis -->
            ${
              post.summary
                ? `
            <div style="margin-bottom:16px;font-size:13px;line-height:1.6;color:#334155;">
              <strong style="color:#0F172A;">💡 产业与市场解读:</strong> ${post.summary}
            </div>
            `
                : ""
            }

            <!-- Bottom Row: Engagement & Link -->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:12px;padding-top:12px;border-top:1px solid #F1F5F9;">
              <tr>
                <td style="vertical-align:middle;">
                  <span style="font-size:11px;color:#64748B;margin-right:12px;">❤️ ${post.engagement?.likes || "热度极高"}</span>
                  <span style="font-size:11px;color:#64748B;margin-right:12px;">🔁 ${post.engagement?.retweets || "高频转发"}</span>
                  <span style="font-size:11px;color:#64748B;">👁️ ${post.engagement?.views || "千万级曝光"}</span>
                </td>
                <td style="text-align:right;vertical-align:middle;">
                  ${tagsHtml}
                  <a href="${post.sourceUrl || "https://x.com/elonmusk"}" target="_blank" style="display:inline-block;margin-left:8px;font-size:12px;font-weight:600;color:#0284C7;text-decoration:none;">查看原帖 &rarr;</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
      `;
    })
    .join("");

  const keyInsightsHtml = (keyInsights || [])
    .map(
      (insight) => `
      <li style="margin-bottom:8px;font-size:14px;line-height:1.5;color:#1E293B;">
        ${insight}
      </li>
    `
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Elon Musk 每日最新动态内参简报 - ${date}</title>
  <style>
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background-color: #F8FAFC; color: #0F172A; }
    @media screen and (max-width: 600px) {
      .container { width: 100% !important; }
      .mobile-padding { padding-left: 14px !important; padding-right: 14px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:24px 0;background-color:#F8FAFC;font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;">
  <center>
    <table class="container" role="presentation" cellpadding="0" cellspacing="0" width="640" style="width:640px;max-width:640px;margin:0 auto;background:#FFFFFF;border:1px solid #E2E8F0;border-radius:16px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.04);">
      
      <!-- Top Header Banner -->
      <tr>
        <td style="padding:32px 32px 28px 32px;background:linear-gradient(135deg, #0F172A 0%, #1E293B 100%);color:#FFFFFF;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td>
                <div style="display:inline-block;padding:4px 10px;background:rgba(255,255,255,0.12);border:1px solid rgba(255,255,255,0.2);border-radius:20px;font-size:11px;font-weight:600;letter-spacing:1px;color:#38BDF8;text-transform:uppercase;margin-bottom:12px;">
                  DAILY INTELLIGENCE BRIEFING
                </div>
                <h1 style="margin:0 0 6px 0;font-size:24px;font-weight:800;letter-spacing:-0.5px;line-height:1.2;color:#FFFFFF;">
                  Elon Musk 最新动态每日内参
                </h1>
                <p style="margin:0;font-size:13px;color:#94A3B8;line-height:1.4;">
                  每日自动追踪 · 社交动态与战略前瞻 · 汇总报告
                </p>
              </td>
              <td style="text-align:right;vertical-align:top;">
                <div style="display:inline-block;text-align:right;">
                  <div style="font-size:13px;font-weight:700;color:#F1F5F9;">${date}</div>
                  <div style="font-size:11px;color:#64748B;margin-top:2px;">生成于: ${generatedAt.split("T")[1]?.substring(0, 5) || "08:00"}</div>
                </div>
              </td>
            </tr>
          </table>

          <!-- Recipient Badge -->
          <div style="margin-top:20px;padding:8px 14px;background:rgba(15,23,42,0.6);border:1px solid rgba(255,255,255,0.1);border-radius:8px;font-size:12px;color:#E2E8F0;">
            <strong style="color:#38BDF8;">专送邮箱:</strong> ${recipient}
            <span style="margin:0 8px;color:#475569;">|</span>
            <span style="color:#94A3B8;">共收录 ${posts.length} 条重点动态</span>
          </div>
        </td>
      </tr>

      <!-- Executive Summary Box -->
      <tr>
        <td class="mobile-padding" style="padding:28px 32px 20px 32px;background:#F8FAFC;border-bottom:1px solid #E2E8F0;">
          <div style="margin-bottom:8px;font-size:12px;font-weight:700;color:#0F172A;text-transform:uppercase;letter-spacing:0.8px;">
            📌 今日执行摘要 (Executive Overview)
          </div>
          <div style="font-size:14px;line-height:1.7;color:#334155;background:#FFFFFF;padding:16px 20px;border-radius:10px;border:1px solid #E2E8F0;">
            ${executiveSummary}
          </div>

          ${
            keyInsights.length > 0
              ? `
          <div style="margin-top:16px;">
            <div style="font-size:12px;font-weight:700;color:#0F172A;margin-bottom:8px;letter-spacing:0.5px;">⚡ 今日核心看点</div>
            <ul style="margin:0;padding-left:20px;">
              ${keyInsightsHtml}
            </ul>
          </div>
          `
              : ""
          }
        </td>
      </tr>

      <!-- Posts List Section -->
      <tr>
        <td class="mobile-padding" style="padding:28px 32px 16px 32px;">
          <div style="margin-bottom:18px;">
            <h2 style="margin:0;font-size:16px;font-weight:700;color:#0F172A;display:inline-block;">
              📋 详细动态清单与解读 (${posts.length})
            </h2>
            <span style="font-size:12px;color:#64748B;margin-left:8px;">涵盖 SpaceX, Tesla, xAI, X 与科技前沿</span>
          </div>

          ${postsHtml}
        </td>
      </tr>

      <!-- Footer Section -->
      <tr>
        <td style="padding:24px 32px;background:#F1F5F9;border-top:1px solid #E2E8F0;text-align:center;">
          <div style="font-size:12px;font-weight:600;color:#475569;margin-bottom:6px;">
            Elon Musk 社交媒体动态智能聚合机器人
          </div>
          <div style="font-size:11px;color:#64748B;line-height:1.6;">
            本文件由系统每日自动抓取、翻译、提炼并汇总生成，直接推送到指定邮箱 ${
              (recipient || "xu.lu@cn.bosch.com, lxsury@163.com")
                .split(/[,;\s]+/)
                .map((r) => r.trim())
                .filter(Boolean)
                .map((email) => `<a href="mailto:${email}" style="color:#0284C7;text-decoration:none;font-weight:600;">${email}</a>`)
                .join("、")
            }。<br />
            数据来源覆盖 X (@elonmusk)、Tesla、SpaceX、xAI 官方发布与全球科技财经资讯。
          </div>
          <div style="margin-top:12px;padding-top:12px;border-top:1px solid #E2E8F0;font-size:10px;color:#94A3B8;">
            Report ID: ${report.id} · Confidential & Internal Reference
          </div>
        </td>
      </tr>

    </table>
  </center>
</body>
</html>`;
}
