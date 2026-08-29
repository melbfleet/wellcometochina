import nodemailer from "nodemailer";

export interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  destination: string;
  month: string;
  year: string;
  duration: string;
  groupSize: string;
  budget: string;
  hearAboutUs: string;
  message: string;
}

function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    throw new Error("SMTP configuration is incomplete. Please set SMTP_HOST, SMTP_USER, and SMTP_PASS.");
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

function formatDate(d: Date): string {
  return new Date(d).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function row(label: string, value: string, even: boolean): string {
  const bg = even ? "#f2f2f2" : "#e8e8e8";
  return `<tr style="background:${bg}"><td style="padding:12px 20px;font-size:16px;color:#888;width:150px;white-space:nowrap;vertical-align:middle">${label}</td><td style="padding:12px 20px;font-size:16px;color:#2d2d2d;vertical-align:middle">${value}</td></tr>`;
}

function sectionHeader(title: string): string {
  return `<tr><td colspan="2" style="background:#c8c8c8;padding:10px 20px;font-size:16px;font-weight:600;letter-spacing:0.15em;text-transform:uppercase;color:#1a1a1a;border-bottom:1px solid #b8b8b8">${title}</td></tr>`;
}

function buildEmailHtml(data: ContactFormData & { createdAt: Date }): string {
  const logoUrl = ""; // Logo will be uploaded via Admin panel

  const contactRows =
    row("Name", `${data.firstName} ${data.lastName}`, true) +
    row("Email", `<a href="mailto:${data.email}" style="color:#1a6fb5">${data.email}</a>`, false) +
    row("Phone", data.phone, true);

  const tripRows =
    row("Destination", data.destination || "—", true) +
    row("Travel Date", [data.month, data.year].filter(Boolean).join(" ") || "—", false) +
    row("Duration", data.duration || "—", true) +
    row("Group Size", data.groupSize || "—", false) +
    row("Budget", data.budget || "—", true) +
    row("Heard About Us", data.hearAboutUs || "—", false);

  const messageSection = data.message
    ? sectionHeader("Message") +
      `<tr><td colspan="2" style="background:#f2f2f2;padding:16px 20px"><div style="font-size:16px;color:#2d2d2d;line-height:1.7;border-left:3px solid #F5569B;padding:12px 16px;background:#ebebeb">${data.message.replace(/\n/g, "<br>")}</div></td></tr>`
    : "";

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
</head>
<body style="margin:0;padding:0;background:#ffffff;font-family:sans-serif">

  <!-- Outer wrapper -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#ffffff">
    <tr><td align="center" style="padding:32px 24px 32px">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:640px">

        <!-- Header -->
        <tr><td style="background:rgba(20,20,20,0.92);height:65px">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="height:65px">
            <tr>
              <td style="width:130px;padding-left:20px;vertical-align:middle">
                <img src="${logoUrl}" alt="Wayseek" style="height:44px;width:auto;display:block">
              </td>
              <td style="text-align:center;vertical-align:middle">
                <span style="color:#ffffff;font-size:18px;letter-spacing:0.15em;text-transform:uppercase">NEW ENQUIRY</span>
              </td>
              <td style="width:130px;padding-right:20px;vertical-align:middle;text-align:right">
                <span style="color:#aaa;font-size:11px;letter-spacing:0.05em">${formatDate(data.createdAt)}</span>
              </td>
            </tr>
          </table>
        </td></tr>

        <!-- All sections seamless -->
        <tr><td>
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse">
            ${sectionHeader("Contact Details")}
            ${contactRows}
            ${sectionHeader("Trip Details")}
            ${tripRows}
            ${messageSection}
          </table>
        </td></tr>

      </table>
    </td></tr>
  </table>

</body>
</html>`;
}

export async function sendContactEmail(data: ContactFormData): Promise<void> {
  const transporter = getTransporter();
  const toEmail = process.env.SMTP_TO || process.env.SMTP_USER!;
  const fromEmail = process.env.SMTP_USER!;
  const fromName = process.env.SMTP_FROM_NAME || "China Luxury Travel";

  const html = buildEmailHtml({ ...data, createdAt: new Date() });

  await transporter.sendMail({
    from: `"${fromName}" <${fromEmail}>`,
    to: toEmail,
    subject: `New Enquiry — ${data.firstName} ${data.lastName} — ${data.destination || "China"}`,
    html,
    replyTo: data.email,
  });
}
