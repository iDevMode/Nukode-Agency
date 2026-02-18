// Report Data API Endpoint
// GET /api/get-report-data?token={report_token}
// Returns summary JSON for the results web page

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSubmissionByReportToken } from './_lib/supabase.js';
import type { ComprehensiveROIAnalysis } from './_lib/gemini-comprehensive.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = req.query.token as string;
  if (!token) {
    return res.status(400).json({ error: 'Missing token parameter' });
  }

  try {
    const submission = await getSubmissionByReportToken(token);
    if (!submission) {
      return res.status(404).json({ error: 'Report not found' });
    }

    const analysis = submission.ai_full_analysis as ComprehensiveROIAnalysis | null;

    return res.status(200).json({
      companyName: submission.company_name,
      industry: submission.industry,
      companySize: submission.company_size,
      createdAt: submission.created_at,
      executiveSummary: analysis?.executiveSummary || {
        headline: submission.ai_strategy || 'Your AI Automation Audit',
        overview: submission.ai_implementation || '',
        toplineROI: submission.ai_savings || '',
      },
      metrics: {
        totalWeeklyHours: submission.hours_per_week_manual * (submission.employees_on_repetitive_tasks || 1),
        monthlyLaborCost: submission.calculated_monthly_cost,
        annualLaborCost: submission.calculated_annual_cost,
        potentialSavingsConservative: (submission.calculated_annual_cost || 0) * 0.3,
        potentialSavingsOptimistic: (submission.calculated_annual_cost || 0) * 0.5,
      },
      solutionCount: analysis?.recommendedSolutions?.length || 0,
      hasFullReport: !!analysis,
      token,
    });
  } catch (error: any) {
    console.error('Get report data error:', error);
    return res.status(500).json({ error: 'Failed to fetch report data' });
  }
}
