// SendGrid Email Service
// Sends personalized ROI analysis emails using dynamic templates

import { MailService } from '@sendgrid/mail';
import { TypeformAuditResponse } from './typeform-parser';
import { ROIMetrics, formatCurrency } from './roi-calculator';
import { ROIAnalysis } from './gemini-server';

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

interface EmailData {
  companyName: string;
  email: string;
  analysis: ROIAnalysis;
  metrics: ROIMetrics;
  auditResponse: TypeformAuditResponse;
}

// Create SendGrid mail service instance
const mailService = new MailService();

// Initialize SendGrid with API key
function initSendGrid(): void {
  const apiKey = process.env.SENDGRID_API_KEY;
  if (!apiKey) {
    throw new Error('Missing SENDGRID_API_KEY environment variable');
  }
  mailService.setApiKey(apiKey);
}

export async function sendROIEmail(data: EmailData): Promise<EmailResult> {
  try {
    initSendGrid();

    const fromEmail = process.env.SENDGRID_FROM_EMAIL || 'phil@nukode.co.uk';
    const templateId = process.env.SENDGRID_TEMPLATE_ID;

    // Build template data for SendGrid dynamic template
    const templateData = {
      company_name: data.companyName,
      industry: data.auditResponse.industry,

      // Current state metrics
      weekly_hours: data.metrics.totalWeeklyHours,
      employees_count: data.auditResponse.employeesOnRepetitiveTasks,
      hourly_rate: formatCurrency(data.metrics.hourlyRate),
      weekly_cost: formatCurrency(data.metrics.weeklyLaborCost),
      monthly_cost: formatCurrency(data.metrics.monthlyLaborCost),
      annual_cost: formatCurrency(data.metrics.annualLaborCost),

      // AI analysis results
      strategy_title: data.analysis.strategy,
      implementation_summary: data.analysis.implementation,
      projected_savings: data.analysis.savings,

      // Potential savings
      savings_low: formatCurrency(data.metrics.potentialSavings30Percent),
      savings_high: formatCurrency(data.metrics.potentialSavings50Percent),

      // Challenges and goals
      challenges: data.auditResponse.primaryChallenge,
      desired_outcomes: data.auditResponse.desiredOutcomes,

      // Call to action
      cta_url: 'https://nukode.co.uk/book-call',
    };

    // If template ID is set, use dynamic template
    if (templateId) {
      const msg = {
        to: data.email,
        from: {
          email: fromEmail,
          name: 'Phil Shields',
        },
        templateId: templateId,
        dynamicTemplateData: templateData,
      };

      const response = await mailService.send(msg);
      const messageId = response[0]?.headers?.['x-message-id'];

      return {
        success: true,
        messageId: messageId || 'sent',
      };
    }

    // Fallback: Send plain text email if no template ID
    const plainTextEmail = buildPlainTextEmail(templateData);

    const msg = {
      to: data.email,
      from: {
        email: fromEmail,
        name: 'Phil Shields',
      },
      subject: `Your AI Automation Audit Results - ${data.companyName}`,
      text: plainTextEmail.text,
      html: plainTextEmail.html,
    };

    const response = await mailService.send(msg);
    const messageId = response[0]?.headers?.['x-message-id'];

    return {
      success: true,
      messageId: messageId || 'sent',
    };
  } catch (error: any) {
    console.error('SendGrid error:', error?.response?.body || error.message);
    return {
      success: false,
      error: error?.message || 'Failed to send email',
    };
  }
}

// Build a plain text/HTML email as fallback when no template is configured
function buildPlainTextEmail(data: any): { text: string; html: string } {
  const text = `
AI Automation Audit Results for ${data.company_name}

Hello ${data.company_name} team,

Thank you for completing your AI Automation Audit. Based on your responses, here's what we found:

CURRENT STATE
-------------
- Weekly hours on manual tasks: ${data.weekly_hours} hours
- Employees on repetitive work: ${data.employees_count}
- Monthly labor cost: ${data.monthly_cost}
- Annual labor cost: ${data.annual_cost}

OUR RECOMMENDATION: ${data.strategy_title}
------------------------------------------
${data.implementation_summary}

PROJECTED SAVINGS
-----------------
${data.projected_savings}

With AI automation, you could save between ${data.savings_low} and ${data.savings_high} annually.

NEXT STEPS
----------
Ready to discuss how we can help ${data.company_name} achieve these savings?

Book a free strategy call: ${data.cta_url}

Best regards,
The Nukode Team

---
Nukode - AI Automation Agency
https://nukode.co.uk
`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your AI Automation Audit Results</title>
  <style>
    body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #050505; color: #fff; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .header h1 { margin: 0; font-size: 24px; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
    .metric-box { background: #fff; border: 1px solid #e5e5e5; border-radius: 6px; padding: 15px; margin: 10px 0; }
    .metric-label { color: #666; font-size: 12px; text-transform: uppercase; }
    .metric-value { color: #050505; font-size: 24px; font-weight: bold; }
    .strategy-box { background: #3b82f6; color: #fff; padding: 20px; border-radius: 6px; margin: 20px 0; }
    .strategy-title { font-size: 20px; font-weight: bold; margin-bottom: 10px; }
    .cta-button { display: inline-block; background: #3b82f6; color: #fff; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 20px; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Your AI Automation Audit Results</h1>
    <p style="margin: 10px 0 0; opacity: 0.8;">${data.company_name}</p>
  </div>

  <div class="content">
    <h2>Current State Analysis</h2>
    <p>Based on your responses, here's what we found about your manual processes:</p>

    <div class="metric-box">
      <div class="metric-label">Weekly Hours on Manual Tasks</div>
      <div class="metric-value">${data.weekly_hours} hours</div>
    </div>

    <div class="metric-box">
      <div class="metric-label">Monthly Labor Cost</div>
      <div class="metric-value">${data.monthly_cost}</div>
    </div>

    <div class="metric-box">
      <div class="metric-label">Annual Labor Cost</div>
      <div class="metric-value">${data.annual_cost}</div>
    </div>

    <div class="strategy-box">
      <div class="strategy-title">${data.strategy_title}</div>
      <p style="margin: 0;">${data.implementation_summary}</p>
    </div>

    <h2>Projected Savings</h2>
    <p><strong>${data.projected_savings}</strong></p>
    <p>With AI automation, you could save between <strong>${data.savings_low}</strong> and <strong>${data.savings_high}</strong> annually.</p>

    <div style="text-align: center; margin-top: 30px;">
      <a href="${data.cta_url}" class="cta-button">Book Your Free Strategy Call</a>
    </div>
  </div>

  <div class="footer">
    <p><strong>Nukode</strong> - AI Automation Agency</p>
    <p><a href="https://nukode.co.uk">nukode.co.uk</a></p>
  </div>
</body>
</html>
`;

  return { text, html };
}
