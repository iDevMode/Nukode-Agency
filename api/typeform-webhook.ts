// Typeform Webhook Handler - All-in-one file for Vercel Serverless
// POST /api/typeform-webhook

import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as crypto from 'crypto';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { MailService } from '@sendgrid/mail';
import { GoogleGenAI, Type } from '@google/genai';

// ============================================================================
// TYPES
// ============================================================================

interface TypeformAuditResponse {
  companyName: string;
  industry: string;
  companySize: string;
  annualRevenue: string;
  primaryChallenge: string[];
  timeConsumingProcesses: string[];
  hoursPerWeekOnManualTasks: number;
  employeesOnRepetitiveTasks: number;
  hourlyCostPerEmployee: string;
  monthlyOperatingCosts: string;
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

interface ROIAnalysis {
  strategy: string;
  implementation: string;
  savings: string;
}

// ============================================================================
// TYPEFORM PARSER
// ============================================================================

const FIELD_MAPPING: Record<string, keyof TypeformAuditResponse> = {
  'company_name': 'companyName',
  'industry': 'industry',
  'company_size': 'companySize',
  'annual_revenue': 'annualRevenue',
  'primary_challenge': 'primaryChallenge',
  'time_consuming_processes': 'timeConsumingProcesses',
  'hours_per_week_manual': 'hoursPerWeekOnManualTasks',
  'employees_repetitive_tasks': 'employeesOnRepetitiveTasks',
  'hourly_cost_employee': 'hourlyCostPerEmployee',
  'monthly_operating_costs': 'monthlyOperatingCosts',
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
    case 'text': return answer.text;
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
    primaryChallenge: [],
    timeConsumingProcesses: [],
    hoursPerWeekOnManualTasks: 0,
    employeesOnRepetitiveTasks: 0,
    hourlyCostPerEmployee: '',
    monthlyOperatingCosts: '',
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
      if (propertyName === 'hoursPerWeekOnManualTasks' || propertyName === 'employeesOnRepetitiveTasks') {
        (response as any)[propertyName] = typeof value === 'number' ? value : parseInt(String(value), 10) || 0;
      } else if (['primaryChallenge', 'timeConsumingProcesses', 'currentTechStack', 'desiredOutcomes'].includes(propertyName)) {
        (response as any)[propertyName] = Array.isArray(value) ? value : [value];
      } else {
        (response as any)[propertyName] = String(value);
      }
    }
  }

  if (!response.email) throw new Error('Missing required field: email');
  if (!response.companyName) throw new Error('Missing required field: companyName');

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
// GEMINI AI
// ============================================================================

async function analyzeBusinessROI(auditResponse: TypeformAuditResponse, roiMetrics: ROIMetrics): Promise<ROIAnalysis> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('Missing GEMINI_API_KEY');

  const ai = new GoogleGenAI({ apiKey });
  const prompt = `
You are a senior AI Automation Consultant for "Nukode".

## Client Information
- Company: ${auditResponse.companyName}
- Industry: ${auditResponse.industry}
- Company Size: ${auditResponse.companySize}

## Pain Points
- Primary Challenges: ${auditResponse.primaryChallenge.join(', ')}
- Time-Consuming Processes: ${auditResponse.timeConsumingProcesses.join(', ')}

## Manual Work Analysis
- Hours per week: ${auditResponse.hoursPerWeekOnManualTasks}
- Employees affected: ${auditResponse.employeesOnRepetitiveTasks}
- Monthly cost: ${formatCurrency(roiMetrics.monthlyLaborCost)}

## Goals
- Desired Outcomes: ${auditResponse.desiredOutcomes.join(', ')}

Propose ONE specific, high-ROI AI automation solution.

Return JSON:
{
  "strategy": "Catchy title (max 6 words)",
  "implementation": "2-3 sentence description",
  "savings": "Realistic estimate based on numbers provided"
}`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          strategy: { type: Type.STRING },
          implementation: { type: Type.STRING },
          savings: { type: Type.STRING },
        },
        required: ['strategy', 'implementation', 'savings'],
      },
    },
  });

  const text = response.text;
  if (!text) throw new Error('No response from Gemini');
  return JSON.parse(text) as ROIAnalysis;
}

// ============================================================================
// SENDGRID EMAIL
// ============================================================================

async function sendROIEmail(data: {
  companyName: string;
  email: string;
  analysis: ROIAnalysis;
  metrics: ROIMetrics;
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const apiKey = process.env.SENDGRID_API_KEY;
  const fromEmail = process.env.SENDGRID_FROM_EMAIL || 'phil@nukode.co.uk';
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
    .cta-button { display: inline-block; background: #3b82f6; color: #fff; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; }
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
    <div style="text-align: center; margin-top: 30px;">
      <a href="https://nukode.co.uk/book-call" class="cta-button">Book Your Free Strategy Call</a>
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

// ============================================================================
// WEBHOOK HANDLER
// ============================================================================

function verifySignature(payload: string, signature: string | undefined): boolean {
  const secret = process.env.TYPEFORM_WEBHOOK_SECRET;
  if (!secret) return true; // Skip if no secret configured
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

    // Store in Supabase
    submissionId = await createSubmission({
      typeform_response_id: typeformResponseId,
      company_name: auditResponse.companyName,
      industry: auditResponse.industry,
      company_size: auditResponse.companySize,
      annual_revenue: auditResponse.annualRevenue || null,
      email: auditResponse.email,
      phone: auditResponse.phone || null,
      primary_challenges: auditResponse.primaryChallenge,
      time_consuming_processes: auditResponse.timeConsumingProcesses,
      hours_per_week_manual: auditResponse.hoursPerWeekOnManualTasks,
      employees_on_repetitive_tasks: auditResponse.employeesOnRepetitiveTasks,
      hourly_cost_per_employee: auditResponse.hourlyCostPerEmployee,
      desired_outcomes: auditResponse.desiredOutcomes,
      calculated_weekly_cost: roiMetrics.weeklyLaborCost,
      calculated_monthly_cost: roiMetrics.monthlyLaborCost,
      calculated_annual_cost: roiMetrics.annualLaborCost,
      ai_strategy: null,
      ai_implementation: null,
      ai_savings: null,
      processing_status: 'processing',
    });

    // Generate AI analysis
    let aiAnalysis: ROIAnalysis;
    try {
      aiAnalysis = await analyzeBusinessROI(auditResponse, roiMetrics);
      await updateSubmission(submissionId, {
        ai_strategy: aiAnalysis.strategy,
        ai_implementation: aiAnalysis.implementation,
        ai_savings: aiAnalysis.savings,
      });
    } catch (err) {
      console.error('AI analysis failed:', err);
      aiAnalysis = {
        strategy: 'Custom AI Automation Solution',
        implementation: 'Our team will analyze your challenges and design a tailored solution.',
        savings: `Estimated ${formatCurrency(roiMetrics.potentialSavings30Percent)}-${formatCurrency(roiMetrics.potentialSavings50Percent)} annually`,
      };
    }

    // Send email
    const emailResult = await sendROIEmail({
      companyName: auditResponse.companyName,
      email: auditResponse.email,
      analysis: aiAnalysis,
      metrics: roiMetrics,
    });

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
