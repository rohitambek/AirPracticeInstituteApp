import nodemailer, { Transporter } from 'nodemailer';
import { SentEmailLog } from './types.ts';

class EmailService {
  private sentLogs: SentEmailLog[] = [];
  private transporter: Transporter | null = null;
  private emailHost = process.env.EMAIL_HOST || 'smtp.gmail.com';
  private emailPort = parseInt(process.env.EMAIL_PORT || '465', 10);
  private emailUser = (process.env.EMAIL_USERNAME && process.env.EMAIL_USERNAME.includes('airpracticeinstitute')) ? process.env.EMAIL_USERNAME : 'airpracticeinstitute@gmail.com';
  private emailPass = (process.env.EMAIL_PASSWORD || 'vyvpqqwofxcnmyds').replace(/\s+/g, '');
  private emailFrom = 'AIR Practice Institute <airpracticeinstitute@gmail.com>';
  private appUrl = process.env.APP_URL || 'https://ais-pre-wwcuzr5nclfklfautq6msx-901441151472.asia-east1.run.app';

  constructor() {
    if (this.emailUser && this.emailPass) {
      try {
        if (this.emailUser.endsWith('@gmail.com') || this.emailHost.includes('gmail')) {
          this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: this.emailUser,
              pass: this.emailPass,
            },
          });
          console.log(`[EmailService] Live Gmail SMTP transporter configured for ${this.emailUser}`);
        } else {
          this.transporter = nodemailer.createTransport({
            host: this.emailHost,
            port: this.emailPort,
            secure: this.emailPort === 465,
            auth: {
              user: this.emailUser,
              pass: this.emailPass,
            },
          });
          console.log(`[EmailService] Custom SMTP transporter configured for ${this.emailHost}:${this.emailPort}`);
        }
      } catch (err) {
        console.error('[EmailService] Failed to initialize SMTP transporter:', err);
        this.transporter = null;
      }
    } else {
      console.log('[EmailService] Running in Verified Transactional Simulator mode (logs + in-app viewer).');
    }
  }

  /**
   * Helper to validate email format strictly
   */
  public isValidEmail(email: string): boolean {
    if (!email || typeof email !== 'string') return false;
    const trimmed = email.trim();
    // Standard RFC-5322 compliant regex for practical email validation
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
    if (!emailRegex.test(trimmed)) return false;
    // Check reasonable length and domain parts
    const parts = trimmed.split('@');
    if (parts.length !== 2) return false;
    const domain = parts[1];
    if (!domain.includes('.') || domain.startsWith('.') || domain.endsWith('.')) return false;
    const tld = domain.split('.').pop();
    if (!tld || tld.length < 2) return false;
    return true;
  }

  /**
   * Send beautiful welcome onboarding email to new student
   */
  public async sendWelcomeEmail(
    to: string,
    studentName: string,
    studentId: string,
    targetExam: string = '12th Maharashtra State Board & MHT-CET',
    portalUrl?: string
  ): Promise<{ success: boolean; status: 'DELIVERED' | 'SIMULATED'; messageId?: string }> {
    const subject = `Welcome to AIR Practice Institute 🇮🇳 - Your Student Account (${studentId}) is Ready!`;
    const actionUrl = portalUrl || this.appUrl;

    // Rich Responsive HTML Template
    const bodyHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body { margin: 0; padding: 0; background-color: #f4f7fb; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; line-height: 1.6; }
    .email-container { max-width: 600px; margin: 24px auto; background: #ffffff; border-radius: 18px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
    .header-banner { background: linear-gradient(135deg, #082f73 0%, #104fb0 50%, #1467d5 100%); color: #ffffff; padding: 36px 28px; text-align: center; }
    .header-banner h1 { margin: 0; font-size: 26px; font-weight: 900; letter-spacing: 0.5px; text-transform: uppercase; }
    .header-banner p { margin: 6px 0 0; font-size: 14px; opacity: 0.92; color: #bae6fd; font-weight: 500; }
    .content-body { padding: 32px 28px; }
    .greeting { font-size: 19px; font-weight: 800; color: #082f73; margin-top: 0; margin-bottom: 12px; }
    .lead-text { font-size: 14px; color: #475569; margin-bottom: 24px; line-height: 1.6; }
    .credentials-card { background: #f0f7ff; border: 1.5px solid #bfdbfe; border-radius: 14px; padding: 20px; margin-bottom: 28px; }
    .credentials-title { font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; color: #1e40af; margin-bottom: 12px; display: flex; align-items: center; }
    .cred-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .cred-item { background: #ffffff; padding: 12px 14px; border-radius: 10px; border: 1px solid #dbeafe; }
    .cred-label { font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700; margin-bottom: 3px; }
    .cred-value { font-size: 15px; font-weight: 800; color: #082f73; word-break: break-all; }
    .steps-section { margin-bottom: 28px; }
    .section-title { font-size: 15px; font-weight: 800; color: #0f172a; margin-bottom: 14px; border-bottom: 2px solid #f1f5f9; padding-bottom: 8px; }
    .step-item { display: flex; margin-bottom: 14px; align-items: flex-start; }
    .step-num { width: 28px; height: 28px; background: #082f73; color: #ffffff; border-radius: 50%; font-size: 12px; font-weight: 800; display: flex; align-items: center; justify-content: center; margin-right: 14px; flex-shrink: 0; margin-top: 2px; }
    .step-content h4 { margin: 0 0 2px; font-size: 14px; font-weight: 700; color: #1e293b; }
    .step-content p { margin: 0; font-size: 12.5px; color: #64748b; }
    .cta-container { text-align: center; margin: 32px 0 24px; }
    .cta-btn { display: inline-block; background: #1261c9; color: #ffffff !important; text-decoration: none; padding: 15px 34px; font-size: 14px; font-weight: 800; border-radius: 12px; box-shadow: 0 4px 12px rgba(18,97,201,0.35); }
    .tips-box { background: #fffbeb; border: 1px solid #fef3c7; border-left: 4px solid #f59e0b; padding: 14px 16px; border-radius: 10px; font-size: 12.5px; color: #78350f; margin-bottom: 24px; }
    .footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 24px; text-align: center; font-size: 12px; color: #94a3b8; }
    .footer p { margin: 4px 0; }
    .footer a { color: #1467d5; text-decoration: none; font-weight: 600; }
  </style>
</head>
<body>
  <div class="email-container">
    <!-- Header Banner -->
    <div class="header-banner">
      <h1>AIR PRACTICE INSTITUTE 🇮🇳</h1>
      <p>12th Maharashtra State Board &amp; MHT-CET Online Academic Portal</p>
    </div>

    <!-- Content Body -->
    <div class="content-body">
      <h2 class="greeting">Namaste ${studentName}, Welcome to the Institute! 🎓</h2>
      <p class="lead-text">
        Your student registration is complete. You now have full access to official Maharashtra State Board PCMB textbooks, high-yield formula sheets, past year question papers, and authentic timed MHT-CET exam simulations.
      </p>

      <!-- Account Credentials Card -->
      <div class="credentials-card">
        <div class="credentials-title">🔐 Your Student Login Credentials</div>
        <div class="cred-grid">
          <div class="cred-item">
            <div class="cred-label">Student ID</div>
            <div class="cred-value">${studentId}</div>
          </div>
          <div class="cred-item">
            <div class="cred-label">Registered Email</div>
            <div class="cred-value" style="font-size: 13px;">${to}</div>
          </div>
        </div>
        <div style="margin-top: 12px; background: #ffffff; padding: 10px 14px; border-radius: 10px; border: 1px solid #dbeafe; font-size: 12px; color: #1e3a8a;">
          🎯 <b>Target Exam:</b> ${targetExam} &bull; <b>Status:</b> <span style="color: #15803d; font-weight: bold;">Verified &amp; Active</span>
        </div>
      </div>

      <!-- 4-Step Onboarding Roadmap -->
      <div class="steps-section">
        <div class="section-title">🚀 4-Step Academic Roadmap to Score 95%+ &amp; 99+ Percentile</div>
        
        <div class="step-item">
          <div class="step-num">1</div>
          <div class="step-content">
            <h4>Digital State Board Textbooks</h4>
            <p>Access full syllabus chapters for Physics, Chemistry, Mathematics, and Biology with in-chapter explanations and exercise question banks.</p>
          </div>
        </div>

        <div class="step-item">
          <div class="step-num">2</div>
          <div class="step-content">
            <h4>High-Yield Short Notes &amp; Formulas</h4>
            <p>Revise key derivations, thermodynamic equations, calculus shortcuts, and reaction mechanisms before every test.</p>
          </div>
        </div>

        <div class="step-item">
          <div class="step-num">3</div>
          <div class="step-content">
            <h4>Past Year Board Papers &amp; Topic Drills</h4>
            <p>Practice past 4 years official Maharashtra Board papers with model solutions, mark allocations, and 20-question timed CET sets.</p>
          </div>
        </div>

        <div class="step-item">
          <div class="step-num">4</div>
          <div class="step-content">
            <h4>Personal Performance Analytics</h4>
            <p>Receive detailed score reports, question breakdowns, and speed analytics to turn your weak topics into strengths.</p>
          </div>
        </div>
      </div>

      <!-- Quick Exam Tip -->
      <div class="tips-box">
        💡 <b>Pro Tip from AIR Faculty:</b> Attempt at least one 20-minute chapter practice test every evening. Continuous revision of short notes increases retention by over 60%!
      </div>

      <!-- Primary Action CTA -->
      <div class="cta-container">
        <a href="${actionUrl}" class="cta-btn">🚀 LOG IN &amp; START PRACTICING NOW</a>
      </div>

      <p style="font-size: 12px; color: #64748b; text-align: center; margin-top: 18px;">
        Use your Student ID <b>${studentId}</b> to log in directly on any device (Desktop, Tablet, or Mobile).
      </p>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p><b>AIR Practice Institute</b> &bull; Maharashtra Board &amp; CET Academic Cell</p>
      <p>Need academic support? Contact us at <a href="mailto:support@airpractice.edu">support@airpractice.edu</a> or helpline <b>+91 98765 43210</b></p>
      <p style="margin-top: 10px; font-size: 11px; color: #cbd5e1;">&copy; ${new Date().getFullYear()} AIR Practice Institute 🇮🇳. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

    // Plain Text Version for email clients without HTML support
    const bodyText = `Welcome to AIR Practice Institute 🇮🇳
======================================================
12th Maharashtra State Board & MHT-CET Academic Portal

Namaste ${studentName},

Welcome to the AIR Practice Institute family! Your student registration has been completed and verified successfully.

YOUR ACCOUNT CREDENTIALS:
• Student Login ID: ${studentId}
• Registered Email: ${to}
• Target Exam: ${targetExam}
• Account Status: Verified Active

YOUR 4-STEP ONBOARDING ROADMAP:
1. Digital State Board Textbooks: Complete Physics, Chemistry, Maths, and Biology chapters with exercise banks.
2. High-Yield Short Notes: Formulas, laws, derivations, and rapid revision sheets.
3. Past Year Papers & Drills: Official 2021-2024 Maharashtra Board papers with step-by-step marking schemes.
4. Timed CET Drills & Score Analysis: Instant accuracy rates and model solutions.

LOG IN TO YOUR DASHBOARD:
${actionUrl}

EXAM TIP:
Attempt at least one chapter test daily under timed conditions to build speed and accuracy.

Need help? Contact our academic desk at support@airpractice.edu or call +91 98765 43210.

Best regards,
Academic Directorate,
AIR Practice Institute 🇮🇳`;

    return this.deliverEmail(to, subject, bodyText, bodyHtml);
  }

  /**
   * Send test practice report email
   */
  public async sendPracticeReportEmail(
    to: string,
    studentName: string,
    report: {
      section: string;
      subject: string;
      score: number;
      total: number;
      accuracy: number;
      timeSpent: string;
    }
  ): Promise<{ success: boolean; status: 'DELIVERED' | 'SIMULATED' }> {
    const subject = `Practice Report: ${report.subject} (${report.section}) — ${report.accuracy}% Accuracy`;
    const bodyText = `Dear ${studentName},

Here is your latest practice test summary from AIR Practice Institute:

• Subject: ${report.subject}
• Section: ${report.section}
• Score: ${report.score} / ${report.total}
• Accuracy: ${report.accuracy}%
• Time Spent: ${report.timeSpent}

Keep up the regular practice! Review the step-by-step solutions on your dashboard to solidify your weak areas.

Best regards,
AIR Practice Institute Team`;

    const bodyHtml = `
<div style="font-family: sans-serif; max-width: 580px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 14px;">
  <h2 style="color: #082f73; margin-top: 0;">AIR Practice Institute 🇮🇳 - Test Result</h2>
  <p>Dear <b>${studentName}</b>,</p>
  <p>Here is your performance summary for your latest practice test:</p>
  <div style="background: #f0f7ff; padding: 16px; border-radius: 10px; margin: 16px 0;">
    <p style="margin: 4px 0;"><b>Subject:</b> ${report.subject}</p>
    <p style="margin: 4px 0;"><b>Section:</b> ${report.section}</p>
    <p style="margin: 4px 0;"><b>Score:</b> ${report.score} / ${report.total}</p>
    <p style="margin: 4px 0;"><b>Accuracy:</b> <span style="color: ${report.accuracy >= 70 ? '#16a34a' : '#d97706'}; font-weight: bold;">${report.accuracy}%</span></p>
    <p style="margin: 4px 0;"><b>Time Spent:</b> ${report.timeSpent}</p>
  </div>
  <p>Keep up the great work and review the detailed solutions in your dashboard.</p>
</div>
`;

    return this.deliverEmail(to, subject, bodyText, bodyHtml);
  }

  /**
   * Internal deliver method: attempts real SMTP if configured, else records in system outbox
   */
  private async deliverEmail(
    to: string,
    subject: string,
    bodyText: string,
    bodyHtml?: string
  ): Promise<{ success: boolean; status: 'DELIVERED' | 'SIMULATED'; messageId?: string }> {
    let status: 'DELIVERED' | 'SIMULATED' = 'SIMULATED';
    let messageId: string | undefined = undefined;

    if (this.transporter) {
      try {
        const info = await this.transporter.sendMail({
          from: this.emailFrom,
          to,
          subject,
          text: bodyText,
          html: bodyHtml || bodyText.replace(/\n/g, '<br/>'),
        });
        status = 'DELIVERED';
        messageId = info.messageId;
        console.log(`[EmailService] Real SMTP email delivered to ${to} (MessageID: ${info.messageId})`);
      } catch (err) {
        console.error('[EmailService] SMTP delivery failed, falling back to verified simulated log:', err);
        status = 'SIMULATED';
      }
    }

    const logItem: SentEmailLog = {
      id: `email-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      to,
      subject,
      bodyText,
      bodyHtml,
      sentAt: new Date().toISOString(),
      status,
    };

    this.sentLogs.unshift(logItem);

    console.log(`\n================= [EMAIL DISPATCHED] =================`);
    console.log(`To: ${to}`);
    console.log(`From: ${this.emailFrom}`);
    console.log(`Subject: ${subject}`);
    console.log(`Status: ${status}`);
    console.log(`Time: ${logItem.sentAt}`);
    console.log(`======================================================\n`);

    return { success: true, status, messageId: logItem.id };
  }

  public getRecentEmails(toFilter?: string): SentEmailLog[] {
    if (toFilter) {
      return this.sentLogs.filter(e => e.to.toLowerCase() === toFilter.toLowerCase());
    }
    return this.sentLogs.slice(0, 30);
  }
}

export const emailService = new EmailService();
