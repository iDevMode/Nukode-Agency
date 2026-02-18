// Typeform Webhook Handler - All-in-one file for Vercel Serverless
// POST /api/typeform-webhook

import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as crypto from 'crypto';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { MailService } from '@sendgrid/mail';
import { analyzeBusinessComprehensive, ComprehensiveROIAnalysis } from './_lib/gemini-comprehensive';

// ============================================================================
// TYPES
// ============================================================================

interface TypeformAuditResponse {
  companyName: string;
  industry: string;
  companySize: string;
  annualRevenue: string;
  role: string;
  primaryChallenge: string[];
  timeConsumingProcesses: string[];
  biggestBottleneck: string;
  hoursPerWeekOnManualTasks: number;
  employeesOnRepetitiveTasks: number;
  hourlyCostPerEmployee: string;
  monthlyOperatingCosts: string;
  automationExperience: string;
  currentTechStack: string[];
  desiredOutcomes: string[];
  expectedROITimeline: string;
  implementationBudget: string;
  email: string;
  phone?: string;
  bestTimeToContact?: string;
}

interface TypeformAnswer {
  field: { id: string; ref: string; type: string };
  type: string;
  text?: string;
  email?: string;
  phone_number?: string;
  number?: number;
  choice?: { id: string; label: string };
  choices?: { labels: string[] };
}

interface TypeformWebhookPayload {
  event_id: string;
  event_type: string;
  form_response: {
    form_id: string;
    token: string;
    submitted_at: string;
    answers: TypeformAnswer[];
  };
}

interface ROIMetrics {
  weeklyLaborCost: number;
  monthlyLaborCost: number;
  annualLaborCost: number;
  potentialSavings30Percent: number;
  potentialSavings50Percent: number;
  hourlyRate: number;
  totalWeeklyHours: number;
}

// Backward-compat summary extracted from comprehensive analysis
interface ROIAnalysis {
  strategy: string;
  implementation: string;
  savings: string;
}

// ============================================================================
// TYPEFORM PARSER (ref-based mapping)
// ============================================================================

const FIELD_MAPPING: Record<string, keyof TypeformAuditResponse> = {
  'company_name': 'companyName',
  'industry': 'industry',
  'company_size': 'companySize',
  'annual_revenue': 'annualRevenue',
  'contact_role': 'role',
  'primary_challenge': 'primaryChallenge',
  'time_consuming_processes': 'timeConsumingProcesses',
  'biggest_bottleneck': 'biggestBottleneck',
  'hours_per_week_manual': 'hoursPerWeekOnManualTasks',
  'employees_repetitive_tasks': 'employeesOnRepetitiveTasks',
  'hourly_cost_employee': 'hourlyCostPerEmployee',
  'monthly_operating_costs': 'monthlyOperatingCosts',
  'automation_experience': 'automationExperience',
  'current_tech_stack': 'currentTechStack',
  'desired_outcomes': 'desiredOutcomes',
  'expected_roi_timeline': 'expectedROITimeline',
  'implementation_budget': 'implementationBudget',
  'email': 'email',
  'phone': 'phone',
  'best_time_contact': 'bestTimeToContact',
};

function extractAnswerValue(answer: TypeformAnswer): string | string[] | number | undefined {
  switch (answer.type) {
    case 'text':
    case 'long_text': return answer.text;
    case 'email': return answer.email;
    case 'phone_number': return answer.phone_number;
    case 'number': return answer.number;
    case 'choice': return answer.choice?.label;
    case 'choices': return answer.choices?.labels || [];
    default: return undefined;
  }
}

function parseTypeformPayload(payload: TypeformWebhookPayload): TypeformAuditResponse {
  const answers = payload.form_response.answers;
  const response: TypeformAuditResponse = {
    companyName: '',
    industry: '',
    companySize: '',
    annualRevenue: '',
    role: '',
    primaryChallenge: [],
    timeConsumingProcesses: [],
    biggestBottleneck: '',
    hoursPerWeekOnManualTasks: 0,
    employeesOnRepetitiveTasks: 0,
    hourlyCostPerEmployee: '',
    monthlyOperatingCosts: '',
    automationExperience: '',
    currentTechStack: [],
    desiredOutcomes: [],
    expectedROITimeline: '',
    implementationBudget: '',
    email: '',
  };

  for (const answer of answers) {
    const fieldRef = answer.field.ref;
    const propertyName = FIELD_MAPPING[fieldRef];
    if (!propertyName) continue;

    const value = extractAnswerValue(answer);
    if (value !== undefined) {
      if (propertyName === 'hoursPerWeekOnManualTasks') {
        const strValue = String(value);
        const match = strValue.match(/(\d+)/);
        (response as any)[propertyName] = match ? parseInt(match[1], 10) : typeof value === 'number' ? value : 10;
      } else if (propertyName === 'employeesOnRepetitiveTasks') {
        (response as any)[propertyName] = typeof value === 'number' ? value : parseInt(String(value), 10) || 1;
      } else if (['primaryChallenge', 'timeConsumingProcesses', 'currentTechStack', 'desiredOutcomes'].includes(propertyName)) {
        (response as any)[propertyName] = Array.isArray(value) ? value : [value];
      } else {
        (response as any)[propertyName] = String(value);
      }
    }
  }

  if (!response.email) throw new Error('Missing required field: email');
  if (!response.companyName) response.companyName = 'Unknown Company';
  if (!response.employeesOnRepetitiveTasks) response.employeesOnRepetitiveTasks = 1;

  return response;
}

// ============================================================================
// ROI CALCULATOR
// ============================================================================

function parseHourlyCost(hourlyCostRange: string): number {
  if (!hourlyCostRange) return 30;
  const rangeMatch = hourlyCostRange.match(/£(\d+)\s*[-–]\s*£(\d+)/);
  if (rangeMatch) return (parseInt(rangeMatch[1], 10) + parseInt(rangeMatch[2], 10)) / 2;
  if (hourlyCostRange.includes('+')) {
    const plusMatch = hourlyCostRange.match(/£(\d+)\+/);
    if (plusMatch) return parseInt(plusMatch[1], 10) * 1.2;
  }
  const simpleMatch = hourlyCostRange.match(/£(\d+)/);
  if (simpleMatch) return parseInt(simpleMatch[1], 10);
  return 30;
}

function calculateROIMetrics(response: TypeformAuditResponse): ROIMetrics {
  const hourlyRate = parseHourlyCost(response.hourlyCostPerEmployee);
  const weeklyHours = response.hoursPerWeekOnManualTasks || 0;
  const employees = response.employeesOnRepetitiveTasks || 1;
  const totalWeeklyHours = weeklyHours * employees;
  const weeklyLaborCost = hourlyRate * totalWeeklyHours;
  const monthlyLaborCost = weeklyLaborCost * 4.33;
  const annualLaborCost = weeklyLaborCost * 52;

  return {
    weeklyLaborCost: Math.round(weeklyLaborCost * 100) / 100,
    monthlyLaborCost: Math.round(monthlyLaborCost * 100) / 100,
    annualLaborCost: Math.round(annualLaborCost * 100) / 100,
    potentialSavings30Percent: Math.round(annualLaborCost * 0.3 * 100) / 100,
    potentialSavings50Percent: Math.round(annualLaborCost * 0.5 * 100) / 100,
    hourlyRate,
    totalWeeklyHours,
  };
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// ============================================================================
// SUPABASE
// ============================================================================

let supabase: SupabaseClient | null = null;

function getSupabaseClient(): SupabaseClient {
  if (!supabase) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) throw new Error('Missing Supabase credentials');
    supabase = createClient(url, key);
  }
  return supabase;
}

async function createSubmission(data: any): Promise<string> {
  const client = getSupabaseClient();
  const { data: result, error } = await client
    .from('audit_submissions')
    .insert({ ...data, email_sent: false, email_sent_at: null })
    .select('id')
    .single();
  if (error) throw new Error(`Supabase insert failed: ${error.message}`);
  return result.id;
}

async function updateSubmission(id: string, updates: any): Promise<void> {
  const client = getSupabaseClient();
  const { error } = await client.from('audit_submissions').update(updates).eq('id', id);
  if (error) throw new Error(`Supabase update failed: ${error.message}`);
}

async function getSubmissionByTypeformId(typeformId: string): Promise<any | null> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from('audit_submissions')
    .select('*')
    .eq('typeform_response_id', typeformId)
    .single();
  if (error && error.code !== 'PGRST116') throw new Error(`Supabase select failed: ${error.message}`);
  return data;
}

// ============================================================================
// REPORT TOKEN
// ============================================================================

function generateReportToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// ============================================================================
// SENDGRID EMAIL
// ============================================================================

async function sendROIEmail(data: {
  companyName: string;
  email: string;
  analysis: ROIAnalysis;
  metrics: ROIMetrics;
  reportUrl: string;
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const apiKey = process.env.SENDGRID_API_KEY;
  const fromEmail = process.env.SENDGRID_FROM_EMAIL || 'phil.shields92@gmail.com';
  if (!apiKey) throw new Error('Missing SENDGRID_API_KEY');

  const mailService = new MailService();
  mailService.setApiKey(apiKey);

  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #050505; color: #fff; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
    .metric-box { background: #fff; border: 1px solid #e5e5e5; border-radius: 6px; padding: 15px; margin: 10px 0; }
    .metric-label { color: #666; font-size: 12px; text-transform: uppercase; }
    .metric-value { color: #050505; font-size: 24px; font-weight: bold; }
    .strategy-box { background: #3b82f6; color: #fff; padding: 20px; border-radius: 6px; margin: 20px 0; }
    .report-box { background: #050505; color: #fff; padding: 25px; border-radius: 6px; margin: 20px 0; text-align: center; }
    .cta-button { display: inline-block; background: #3b82f6; color: #fff; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; }
    .cta-button-secondary { display: inline-block; background: #050505; color: #fff; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 15px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Your AI Automation Audit Results</h1>
    <p>${data.companyName}</p>
  </div>
  <div class="content">
    <h2>Current State</h2>
    <div class="metric-box">
      <div class="metric-label">Weekly Hours on Manual Tasks</div>
      <div class="metric-value">${data.metrics.totalWeeklyHours} hours</div>
    </div>
    <div class="metric-box">
      <div class="metric-label">Monthly Labor Cost</div>
      <div class="metric-value">${formatCurrency(data.metrics.monthlyLaborCost)}</div>
    </div>
    <div class="strategy-box">
      <h3>${data.analysis.strategy}</h3>
      <p>${data.analysis.implementation}</p>
      <p><strong>${data.analysis.savings}</strong></p>
    </div>
    <p>Potential annual savings: <strong>${formatCurrency(data.metrics.potentialSavings30Percent)} - ${formatCurrency(data.metrics.potentialSavings50Percent)}</strong></p>

    <div class="report-box">
      <h3 style="margin: 0 0 8px 0;">Your Comprehensive Report is Ready</h3>
      <p style="margin: 0 0 15px 0; opacity: 0.8; font-size: 14px;">View your full AI Automation Audit Report with detailed solutions, implementation roadmap, and financial projections.</p>
      <a href="${data.reportUrl}" class="cta-button">View & Download Your Report</a>
    </div>

    <div style="text-align: center; margin-top: 30px;">
      <a href="https://calendly.com/phil-shields92" class="cta-button-secondary">Book Your Free Strategy Call</a>
    </div>
  </div>
</body>
</html>`;

  try {
    const response = await mailService.send({
      to: data.email,
      from: { email: fromEmail, name: 'Phil Shields' },
      subject: `Your AI Automation Audit Results - ${data.companyName}`,
      html,
    });
    return { success: true, messageId: response[0]?.headers?.['x-message-id'] || 'sent' };
  } catch (err: any) {
    console.error('SendGrid error:', err?.response?.body || err.message);
    return { success: false, error: err?.message };
  }
}

async function sendAdminNotificationEmail(data: {
  companyName: string;
  email: string;
  phone?: string;
  role: string;
  industry: string;
  companySize: string;
  challenges: string[];
  processes: string[];
  biggestBottleneck: string;
  automationExperience: string;
  analysis: ROIAnalysis;
  metrics: ROIMetrics;
  reportUrl: string;
}): Promise<{ success: boolean; error?: string }> {
  const apiKey = process.env.SENDGRID_API_KEY;
  const fromEmail = process.env.SENDGRID_FROM_EMAIL || 'phil.shields92@gmail.com';
  const adminEmail = process.env.ADMIN_EMAIL || 'phil.shields92@gmail.com';
  if (!apiKey) return { success: false, error: 'Missing SENDGRID_API_KEY' };

  const mailService = new MailService();
  mailService.setApiKey(apiKey);

  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #1e40af; color: #fff; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
    .section { background: #fff; border: 1px solid #e5e5e5; border-radius: 6px; padding: 15px; margin: 15px 0; }
    .label { color: #666; font-size: 12px; text-transform: uppercase; margin-bottom: 5px; }
    .value { color: #050505; font-size: 16px; font-weight: 500; }
    .highlight { color: #1e40af; font-weight: bold; }
    ul { margin: 5px 0; padding-left: 20px; }
  </style>
</head>
<body>
  <div class="header">
    <h2 style="margin: 0;">New Audit Submission</h2>
    <p style="margin: 5px 0 0 0; opacity: 0.9;">${data.companyName}</p>
  </div>
  <div class="content">
    <div class="section">
      <div class="label">Contact Information</div>
      <div class="value">${data.email}</div>
      ${data.phone ? `<div class="value">${data.phone}</div>` : ''}
      ${data.role ? `<div class="value">Role: ${data.role}</div>` : ''}
    </div>

    <div class="section">
      <div class="label">Company Details</div>
      <div class="value">Industry: ${data.industry || 'Not specified'}</div>
      <div class="value">Size: ${data.companySize || 'Not specified'}</div>
      <div class="value">Automation Experience: ${data.automationExperience || 'Not specified'}</div>
    </div>

    <div class="section">
      <div class="label">Challenges</div>
      <ul>${data.challenges.map(c => `<li>${c}</li>`).join('')}</ul>
    </div>

    <div class="section">
      <div class="label">Time-Consuming Processes</div>
      <ul>${data.processes.map(p => `<li>${p}</li>`).join('')}</ul>
    </div>

    ${data.biggestBottleneck ? `
    <div class="section">
      <div class="label">Biggest Bottleneck (Their Words)</div>
      <div class="value" style="font-style: italic;">"${data.biggestBottleneck}"</div>
    </div>
    ` : ''}

    <div class="section">
      <div class="label">ROI Metrics</div>
      <div class="value">Weekly Hours: <span class="highlight">${data.metrics.totalWeeklyHours} hrs</span></div>
      <div class="value">Monthly Cost: <span class="highlight">${formatCurrency(data.metrics.monthlyLaborCost)}</span></div>
      <div class="value">Potential Savings: <span class="highlight">${formatCurrency(data.metrics.potentialSavings30Percent)} - ${formatCurrency(data.metrics.potentialSavings50Percent)}/year</span></div>
    </div>

    <div class="section">
      <div class="label">AI Recommendation</div>
      <div class="value" style="font-weight: bold; color: #1e40af;">${data.analysis.strategy}</div>
      <p style="margin: 10px 0;">${data.analysis.implementation}</p>
      <p style="margin: 0;"><strong>${data.analysis.savings}</strong></p>
    </div>

    <div style="text-align: center; margin-top: 20px;">
      <a href="${data.reportUrl}" style="display: inline-block; background: #050505; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-right: 10px;">View Client Report</a>
      <a href="https://calendly.com/phil-shields92" style="display: inline-block; background: #1e40af; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px;">View Calendly Bookings</a>
    </div>
  </div>
</body>
</html>`;

  try {
    console.log(`Sending admin notification to ${adminEmail} from ${fromEmail}`);
    const result = await mailService.send({
      to: adminEmail,
      from: { email: fromEmail, name: 'Nukode Audit System' },
      replyTo: data.email,
      subject: `🔔 New Audit Lead: ${data.companyName}`,
      html,
    });
    console.log('Admin notification sent successfully:', result[0]?.statusCode);
    return { success: true };
  } catch (err: any) {
    console.error('Admin notification error:', JSON.stringify(err?.response?.body || err.message));
    return { success: false, error: err?.message };
  }
}

// ============================================================================
// WEBHOOK HANDLER
// ============================================================================

function verifySignature(payload: string, signature: string | undefined): boolean {
  const secret = process.env.TYPEFORM_WEBHOOK_SECRET;
  if (!secret) return true;
  if (!signature) return false;
  const expected = `sha256=${crypto.createHmac('sha256', secret).update(payload).digest('base64')}`;
  try {
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  } catch {
    return false;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const rawBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
  const signature = req.headers['typeform-signature'] as string | undefined;

  if (!verifySignature(rawBody, signature)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  let submissionId: string | undefined;

  try {
    const payload: TypeformWebhookPayload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const typeformResponseId = payload.form_response.token;

    // Check for duplicate
    const existing = await getSubmissionByTypeformId(typeformResponseId);
    if (existing) {
      return res.status(200).json({ success: true, message: 'Already processed', submissionId: existing.id });
    }

    // Parse form data
    const auditResponse = parseTypeformPayload(payload);
    console.log(`Processing: ${auditResponse.companyName} (${auditResponse.email})`);

    // Calculate ROI
    const roiMetrics = calculateROIMetrics(auditResponse);

    // Generate report token
    const reportToken = generateReportToken();
    const baseUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : process.env.BASE_URL || 'https://nukode.co.uk';
    const reportUrl = `${baseUrl}/report?token=${reportToken}`;

    // Store in Supabase (with new fields)
    submissionId = await createSubmission({
      typeform_response_id: typeformResponseId,
      company_name: auditResponse.companyName,
      industry: auditResponse.industry,
      company_size: auditResponse.companySize,
      annual_revenue: auditResponse.annualRevenue || null,
      email: auditResponse.email,
      phone: auditResponse.phone || null,
      contact_role: auditResponse.role || null,
      biggest_bottleneck: auditResponse.biggestBottleneck || null,
      automation_experience: auditResponse.automationExperience || null,
      primary_challenges: auditResponse.primaryChallenge,
      time_consuming_processes: auditResponse.timeConsumingProcesses,
      hours_per_week_manual: auditResponse.hoursPerWeekOnManualTasks,
      employees_on_repetitive_tasks: auditResponse.employeesOnRepetitiveTasks,
      hourly_cost_per_employee: auditResponse.hourlyCostPerEmployee,
      monthly_operating_costs: auditResponse.monthlyOperatingCosts || null,
      implementation_budget: auditResponse.implementationBudget || null,
      desired_outcomes: auditResponse.desiredOutcomes,
      calculated_weekly_cost: roiMetrics.weeklyLaborCost,
      calculated_monthly_cost: roiMetrics.monthlyLaborCost,
      calculated_annual_cost: roiMetrics.annualLaborCost,
      ai_strategy: null,
      ai_implementation: null,
      ai_savings: null,
      ai_full_analysis: null,
      report_token: reportToken,
      processing_status: 'processing',
    });

    // Generate comprehensive AI analysis
    let comprehensiveAnalysis: ComprehensiveROIAnalysis | null = null;
    let aiSummary: ROIAnalysis;

    try {
      comprehensiveAnalysis = await analyzeBusinessComprehensive(auditResponse, roiMetrics);

      // Extract backward-compatible summary from executive summary
      aiSummary = {
        strategy: comprehensiveAnalysis.executiveSummary.headline,
        implementation: comprehensiveAnalysis.executiveSummary.overview,
        savings: comprehensiveAnalysis.executiveSummary.toplineROI,
      };

      await updateSubmission(submissionId, {
        ai_strategy: aiSummary.strategy,
        ai_implementation: aiSummary.implementation,
        ai_savings: aiSummary.savings,
        ai_full_analysis: comprehensiveAnalysis,
      });
    } catch (err) {
      console.error('Comprehensive AI analysis failed:', err);
      aiSummary = {
        strategy: 'Custom AI Automation Solution',
        implementation: 'Our team will analyze your challenges and design a tailored solution.',
        savings: `Estimated ${formatCurrency(roiMetrics.potentialSavings30Percent)}-${formatCurrency(roiMetrics.potentialSavings50Percent)} annually`,
      };
    }

    // Send client email (with report link)
    const emailResult = await sendROIEmail({
      companyName: auditResponse.companyName,
      email: auditResponse.email,
      analysis: aiSummary,
      metrics: roiMetrics,
      reportUrl,
    });

    // Send admin notification email (with new fields)
    const adminEmailResult = await sendAdminNotificationEmail({
      companyName: auditResponse.companyName,
      email: auditResponse.email,
      phone: auditResponse.phone,
      role: auditResponse.role,
      industry: auditResponse.industry,
      companySize: auditResponse.companySize,
      challenges: auditResponse.primaryChallenge,
      processes: auditResponse.timeConsumingProcesses,
      biggestBottleneck: auditResponse.biggestBottleneck,
      automationExperience: auditResponse.automationExperience,
      analysis: aiSummary,
      metrics: roiMetrics,
      reportUrl,
    });

    if (!adminEmailResult.success) {
      console.warn('Admin notification failed:', adminEmailResult.error);
    }

    await updateSubmission(submissionId, {
      email_sent: emailResult.success,
      email_sent_at: emailResult.success ? new Date().toISOString() : null,
      processing_status: emailResult.success ? 'completed' : 'failed',
    });

    return res.status(200).json({ success: true, submissionId, emailSent: emailResult.success });
  } catch (error: any) {
    console.error('Webhook error:', error);
    if (submissionId) {
      try {
        await updateSubmission(submissionId, { processing_status: 'failed' });
      } catch {}
    }
    return res.status(200).json({ success: false, error: error.message, submissionId });
  }
}
