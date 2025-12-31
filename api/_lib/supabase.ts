import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Database types
export interface AuditSubmission {
  id?: string;
  created_at?: string;
  typeform_response_id: string;
  company_name: string;
  industry: string;
  company_size: string;
  annual_revenue: string | null;
  email: string;
  phone: string | null;
  primary_challenges: string[];
  time_consuming_processes: string[];
  hours_per_week_manual: number;
  employees_on_repetitive_tasks: number;
  hourly_cost_per_employee: string;
  desired_outcomes: string[];
  calculated_weekly_cost: number | null;
  calculated_monthly_cost: number | null;
  calculated_annual_cost: number | null;
  ai_strategy: string | null;
  ai_implementation: string | null;
  ai_savings: string | null;
  email_sent: boolean;
  email_sent_at: string | null;
  processing_status: 'pending' | 'processing' | 'completed' | 'failed';
}

let supabase: SupabaseClient | null = null;

function getSupabaseClient(): SupabaseClient {
  if (!supabase) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase credentials. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
    }

    supabase = createClient(supabaseUrl, supabaseKey);
  }
  return supabase;
}

export async function createSubmission(
  data: Omit<AuditSubmission, 'id' | 'created_at' | 'email_sent' | 'email_sent_at'>
): Promise<string> {
  const client = getSupabaseClient();

  const { data: result, error } = await client
    .from('audit_submissions')
    .insert({
      ...data,
      email_sent: false,
      email_sent_at: null,
    })
    .select('id')
    .single();

  if (error) {
    console.error('Supabase insert error:', error);
    throw new Error(`Failed to create submission: ${error.message}`);
  }

  return result.id;
}

export async function updateSubmission(
  id: string,
  updates: Partial<AuditSubmission>
): Promise<void> {
  const client = getSupabaseClient();

  const { error } = await client
    .from('audit_submissions')
    .update(updates)
    .eq('id', id);

  if (error) {
    console.error('Supabase update error:', error);
    throw new Error(`Failed to update submission: ${error.message}`);
  }
}

export async function getSubmissionByTypeformId(
  typeformResponseId: string
): Promise<AuditSubmission | null> {
  const client = getSupabaseClient();

  const { data, error } = await client
    .from('audit_submissions')
    .select('*')
    .eq('typeform_response_id', typeformResponseId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Supabase select error:', error);
    throw new Error(`Failed to get submission: ${error.message}`);
  }

  return data;
}
