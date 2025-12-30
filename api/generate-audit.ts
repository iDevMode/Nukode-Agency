import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || ''
);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

interface ROICalculation {
  current_annual_cost: number;
  projected_annual_savings: number;
  implementation_cost: number;
  roi_percentage: number;
  payback_period_months: number;
  three_year_net_benefit: number;
  automation_opportunities: Array<{
    area: string;
    description: string;
    estimated_savings: number;
    complexity: 'Low' | 'Medium' | 'High';
    priority: 'High' | 'Medium' | 'Low';
  }>;
  recommended_next_steps: string[];
  risk_factors: string[];
}

// Helper function to parse hourly cost range
function parseHourlyCost(range: string): number {
  const costs: Record<string, number> = {
    '£10-20': 15,
    '£20-40': 30,
    '£40-60': 50,
    '£60-100': 80,
    '£100+': 120
  };
  return costs[range] || 30;
}

// Helper function to parse revenue range
function parseRevenue(range: string): number {
  const revenues: Record<string, number> = {
    '<£100K': 75000,
    '£100K-£500K': 300000,
    '£500K-£2M': 1250000,
    '£2M-£10M': 6000000,
    '£10M+': 15000000
  };
  return revenues[range] || 500000;
}

async function calculateROI(submissionData: any): Promise<ROICalculation> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

  const prompt = `You are an expert AI automation consultant specializing in ROI calculations for business process automation.

Analyze the following client data and provide a detailed ROI calculation:

**Client Information:**
- Company: ${submissionData.company_name}
- Industry: ${submissionData.industry}
- Company Size: ${submissionData.company_size}
- Annual Revenue: ${submissionData.annual_revenue}

**Current State:**
- Primary Challenges: ${submissionData.primary_challenge}
- Time-Consuming Processes: ${submissionData.time_consuming_processes}
- Manual Hours per Week: ${submissionData.manual_hours_per_week}
- Employees on Repetitive Tasks: ${submissionData.employees_on_repetitive_tasks}
- Hourly Cost per Employee: ${submissionData.hourly_cost_per_employee}
- Monthly Operating Costs: ${submissionData.monthly_operating_costs}
- Current Tech Stack: ${submissionData.current_tech_stack}

**Goals:**
- Desired Outcomes: ${submissionData.desired_outcomes}
- Expected ROI Timeline: ${submissionData.expected_roi_timeline}
- Implementation Budget: ${submissionData.implementation_budget}

**Your Task:**
Provide a comprehensive AI automation ROI analysis in JSON format with the following structure:

{
  "current_annual_cost": <number>,
  "projected_annual_savings": <number>,
  "implementation_cost": <number>,
  "roi_percentage": <number>,
  "payback_period_months": <number>,
  "three_year_net_benefit": <number>,
  "automation_opportunities": [
    {
      "area": "<process area>",
      "description": "<specific automation description>",
      "estimated_savings": <annual savings in GBP>,
      "complexity": "Low|Medium|High",
      "priority": "High|Medium|Low"
    }
  ],
  "recommended_next_steps": ["<step 1>", "<step 2>", ...],
  "risk_factors": ["<risk 1>", "<risk 2>", ...]
}

**Calculation Guidelines:**
1. Calculate current_annual_cost based on manual hours, employee count, and hourly costs
2. Identify 3-5 specific automation opportunities based on their challenges
3. Estimate realistic savings (typically 40-60% reduction in repetitive task costs)
4. Factor in implementation costs (typically £15K-£50K depending on scope)
5. Calculate ROI percentage: ((savings - implementation_cost) / implementation_cost) * 100
6. Determine payback period: implementation_cost / (monthly_savings)
7. Project 3-year net benefit accounting for ongoing costs (~10% of implementation annually)

**Important:** Be conservative in estimates but show clear value proposition. Focus on their specific pain points.

Return ONLY the JSON object, no additional text.`;

  const result = await model.generateContent(prompt);
  const response = result.response.text();

  // Extract JSON from response (handle markdown code blocks)
  const jsonMatch = response.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Failed to extract JSON from AI response');
  }

  const roiData: ROICalculation = JSON.parse(jsonMatch[0]);
  return roiData;
}

async function generateAuditReport(submissionData: any, roiData: ROICalculation): Promise<string> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

  const prompt = `Create a professional, personalized AI Automation Audit Report for ${submissionData.company_name}.

**ROI Data:**
${JSON.stringify(roiData, null, 2)}

**Client Context:**
- Industry: ${submissionData.industry}
- Challenges: ${submissionData.primary_challenge}
- Goals: ${submissionData.desired_outcomes}

Generate a compelling, executive-ready report (800-1200 words) with these sections:

# AI Automation Audit Report for ${submissionData.company_name}

## Executive Summary
[2-3 paragraphs highlighting key findings and headline ROI numbers]

## Current State Analysis
[Analysis of their current challenges and inefficiencies]

## Automation Opportunities
[Detail each automation opportunity with business impact]

## ROI Projection
[Present the financial case with specific numbers and timeline]

## Implementation Roadmap
[Phased approach with recommended next steps]

## Risk Mitigation
[Address potential concerns and how to mitigate them]

## Conclusion
[Strong call to action to move forward]

**Tone:** Professional, data-driven, consultative. Use UK English and GBP currency.`;

  const result = await model.generateContent(prompt);
  return result.response.text();
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { submission_id } = req.body;

    if (!submission_id) {
      return res.status(400).json({ error: 'submission_id required' });
    }

    // Fetch submission from database
    const { data: submission, error: fetchError } = await supabase
      .from('typeform_submissions')
      .select('*')
      .eq('id', submission_id)
      .single();

    if (fetchError || !submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    // Update status to processing
    await supabase
      .from('typeform_submissions')
      .update({ status: 'processing' })
      .eq('id', submission_id);

    // Calculate ROI using AI
    const roiData = await calculateROI(submission);

    // Generate full audit report
    const auditReport = await generateAuditReport(submission, roiData);

    // Store audit results
    const { data: audit, error: auditError } = await supabase
      .from('ai_audits')
      .insert({
        submission_id: submission_id,
        roi_calculation: roiData,
        audit_report: auditReport,
        generated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (auditError) {
      throw auditError;
    }

    // Update submission status
    await supabase
      .from('typeform_submissions')
      .update({
        status: 'completed',
        audit_id: audit.id
      })
      .eq('id', submission_id);

    // TODO: Send email with audit report
    // You can use SendGrid, Resend, or another email service here

    return res.status(200).json({
      success: true,
      audit_id: audit.id,
      roi_summary: {
        projected_savings: roiData.projected_annual_savings,
        roi_percentage: roiData.roi_percentage,
        payback_months: roiData.payback_period_months
      }
    });

  } catch (error) {
    console.error('Audit generation error:', error);

    // Update submission status to failed
    if (req.body.submission_id) {
      await supabase
        .from('typeform_submissions')
        .update({ status: 'failed' })
        .eq('id', req.body.submission_id);
    }

    return res.status(500).json({
      error: 'Failed to generate audit',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
