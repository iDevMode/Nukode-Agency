// Keep-Alive Endpoint - Prevents Supabase free tier from pausing
// GET /api/keep-alive
// Call this endpoint every 5-6 days to keep your database active

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Allow GET for easy cron job setup
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    console.error('Keep-alive: Missing Supabase credentials');
    return res.status(500).json({ error: 'Missing Supabase credentials' });
  }

  try {
    const supabase = createClient(url, key);

    // Simple query to keep the database active
    const { data, error } = await supabase
      .from('audit_submissions')
      .select('id')
      .limit(1);

    if (error) {
      console.error('Keep-alive: Supabase query failed:', error.message);
      return res.status(500).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }

    console.log('Keep-alive: Supabase pinged successfully');
    return res.status(200).json({
      success: true,
      message: 'Supabase is active',
      timestamp: new Date().toISOString()
    });

  } catch (err: any) {
    console.error('Keep-alive error:', err.message);
    return res.status(500).json({
      success: false,
      error: err.message,
      timestamp: new Date().toISOString()
    });
  }
}
