// Check Supabase for recent submissions
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function check() {
  console.log('Checking Supabase for submissions...\n');

  const { data, error } = await supabase
    .from('audit_submissions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);

  if (error) {
    console.log('❌ Error:', error.message);
    return;
  }

  console.log(`Found ${data?.length || 0} submissions:\n`);

  if (data && data.length > 0) {
    data.forEach((row: any) => {
      console.log('════════════════════════════════════════');
      console.log('ID:', row.id);
      console.log('Company:', row.company_name);
      console.log('Email:', row.email);
      console.log('Industry:', row.industry);
      console.log('Created:', row.created_at);
      console.log('Status:', row.processing_status);
      console.log('AI Strategy:', row.ai_strategy || 'N/A');
    });
  } else {
    console.log('No submissions found in the database.');
  }
}

check();
