import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || ''
);

interface TypeformAnswer {
  field: {
    id: string;
    type: string;
    ref: string;
  };
  type: string;
  text?: string;
  email?: string;
  phone_number?: string;
  number?: number;
  choice?: {
    label: string;
  };
  choices?: {
    labels: string[];
  };
}

interface TypeformWebhook {
  event_id: string;
  event_type: string;
  form_response: {
    form_id: string;
    token: string;
    submitted_at: string;
    landed_at: string;
    answers: TypeformAnswer[];
    variables?: Record<string, any>;
    calculated?: {
      score: number;
    };
  };
}

// Helper function to extract answer value
function extractAnswerValue(answer: TypeformAnswer): any {
  if (answer.text) return answer.text;
  if (answer.email) return answer.email;
  if (answer.phone_number) return answer.phone_number;
  if (answer.number !== undefined) return answer.number;
  if (answer.choice?.label) return answer.choice.label;
  if (answer.choices?.labels) return answer.choices.labels;
  return null;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const webhookData: TypeformWebhook = req.body;

    // Validate webhook signature (recommended for production)
    const signature = req.headers['typeform-signature'] as string;
    // TODO: Implement signature verification
    // https://www.typeform.com/developers/webhooks/secure-your-webhooks/

    const { form_response } = webhookData;
    const answers = form_response.answers;

    // Map answers to fields (you'll need to replace these with your actual field IDs)
    const formData: Record<string, any> = {};

    answers.forEach((answer) => {
      const ref = answer.field.ref;
      formData[ref] = extractAnswerValue(answer);
    });

    // Store submission in Supabase
    const { data: submission, error: dbError } = await supabase
      .from('typeform_submissions')
      .insert({
        typeform_id: form_response.token,
        form_id: form_response.form_id,
        submitted_at: form_response.submitted_at,
        raw_data: formData,
        company_name: formData.company_name,
        email: formData.email,
        industry: formData.industry,
        company_size: formData.company_size,
        annual_revenue: formData.annual_revenue,
        primary_challenge: formData.primary_challenge,
        time_consuming_processes: formData.time_consuming_processes,
        manual_hours_per_week: formData.manual_hours_per_week,
        employees_on_repetitive_tasks: formData.employees_on_repetitive_tasks,
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
    // We'll call another API endpoint to avoid timeout
    fetch(`${process.env.VERCEL_URL || req.headers.host}/api/generate-audit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ submission_id: submission.id })
    }).catch(err => console.error('Failed to trigger audit:', err));

    return res.status(200).json({
      success: true,
      message: 'Submission received and audit generation started',
      submission_id: submission.id
    });

  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
