// PDF Report Generation Endpoint
// GET /api/generate-report?token={report_token}

import type { VercelRequest, VercelResponse } from '@vercel/node';
import React from 'react';
import { renderToBuffer } from '@react-pdf/renderer';
import { getSubmissionByReportToken } from './_lib/supabase.js';
import { AuditReportDocument } from './_lib/pdf/report-document.js';
import type { ComprehensiveROIAnalysis } from './_lib/gemini-comprehensive.js';
import type { ROIMetrics } from './_lib/roi-calculator.js';

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
    if (!analysis) {
      return res.status(404).json({ error: 'Report analysis not yet available' });
    }

    const metrics: ROIMetrics = {
      weeklyLaborCost: submission.calculated_weekly_cost || 0,
      monthlyLaborCost: submission.calculated_monthly_cost || 0,
      annualLaborCost: submission.calculated_annual_cost || 0,
      potentialSavings30Percent: (submission.calculated_annual_cost || 0) * 0.3,
      potentialSavings50Percent: (submission.calculated_annual_cost || 0) * 0.5,
      hourlyRate: 0,
      totalWeeklyHours: submission.hours_per_week_manual * (submission.employees_on_repetitive_tasks || 1),
    };

    const generatedDate = new Date(submission.created_at || Date.now()).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    const doc = React.createElement(AuditReportDocument, {
      companyName: submission.company_name,
      analysis,
      metrics,
      generatedDate,
    });

    const buffer = await renderToBuffer(doc as any);

    const safeName = submission.company_name.replace(/[^a-zA-Z0-9]/g, '-').replace(/-+/g, '-');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="Nukode-AI-Audit-${safeName}.pdf"`);
    res.setHeader('Content-Length', buffer.length);
    return res.send(buffer);
  } catch (error: any) {
    console.error('PDF generation error:', error);
    return res.status(500).json({ error: 'Failed to generate report' });
  }
}
