import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || ''
);

/**
 * POST /api/store-submission
 * Called from website after Typeform redirect with query parameters
 * Alternative to webhook approach - website acts as intermediary
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const formData = req.body;

    // Validate required fields
    if (!formData.email) {
      return res.status(400).json({
        error: 'Email is required'
      });
    }

    // Store submission in Supabase
    const { data: submission, error: dbError } = await supabase
      .from('typeform_submissions')
      .insert({
        typeform_id: `manual-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        form_id: 'website-redirect',
        submitted_at: new Date().toISOString(),
        raw_data: formData,
        company_name: formData.company_name,
        email: formData.email,
        industry: formData.industry,
        company_size: formData.company_size,
        annual_revenue: formData.annual_revenue,
        primary_challenge: formData.primary_challenge,
        time_consuming_processes: formData.time_consuming_processes,
        manual_hours_per_week: parseInt(formData.manual_hours_per_week) || null,
        employees_on_repetitive_tasks: parseInt(formData.employees_on_repetitive_tasks) || null,
        hourly_cost_per_employee: formData.hourly_cost_per_employee,
        monthly_operating_costs: formData.monthly_operating_costs,
        current_tech_stack: formData.current_tech_stack,
        desired_outcomes: formData.desired_outcomes,
        expected_roi_timeline: formData.expected_roi_timeline,
        implementation_budget: formData.implementation_budget,
        phone: formData.phone,
        best_time_to_contact: formData.best_time_to_contact,
        status: 'pending_audit'
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      return res.status(500).json({ error: 'Failed to store submission' });
    }

    // Trigger AI audit generation (async - don't wait)
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : `https://${req.headers.host}`;

    fetch(`${baseUrl}/api/generate-audit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ submission_id: submission.id })
    }).catch(err => console.error('Failed to trigger audit:', err));

    return res.status(200).json({
      success: true,
      message: 'Submission received and audit generation started',
      submission_id: submission.id,
      audit_id: null // Will be populated when audit completes
    });

  } catch (error) {
    console.error('Store submission error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
