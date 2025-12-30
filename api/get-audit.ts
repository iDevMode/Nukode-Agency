import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || ''
);

/**
 * GET /api/get-audit?email=user@example.com
 * Retrieves the latest audit for a given email address
 *
 * Optional: Add authentication/authorization for production use
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, submission_id } = req.query;

    if (!email && !submission_id) {
      return res.status(400).json({
        error: 'Either email or submission_id parameter required'
      });
    }

    let query = supabase
      .from('submission_audits')
      .select('*');

    if (submission_id) {
      query = query.eq('submission_id', submission_id);
    } else if (email) {
      query = query.eq('email', email);
    }

    const { data, error } = await query
      .order('submitted_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          error: 'No audit found',
          message: 'No audit exists for the provided email or ID'
        });
      }
      throw error;
    }

    // Don't expose raw_data in response
    const { raw_data, ...safeData } = data;

    return res.status(200).json({
      success: true,
      data: safeData
    });

  } catch (error) {
    console.error('Get audit error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
