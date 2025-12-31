// Local test script for the Typeform webhook
// Run with: npx tsx scripts/test-webhook-local.ts

import 'dotenv/config';

// Import the webhook handler modules directly
import { parseTypeformPayload, TypeformAuditResponse } from '../api/_lib/typeform-parser';
import { createSubmission, updateSubmission } from '../api/_lib/supabase';
import { calculateROIMetrics } from '../api/_lib/roi-calculator';
import { analyzeBusinessROI } from '../api/_lib/gemini-server';
import { sendROIEmail } from '../api/_lib/sendgrid';

// Mock Typeform webhook payload
const mockTypeformPayload = {
  event_id: 'test-' + Date.now(),
  event_type: 'form_response',
  form_response: {
    form_id: 'BYcoTN6c',
    token: 'test-token-' + Date.now(),
    landed_at: new Date().toISOString(),
    submitted_at: new Date().toISOString(),
    definition: {
      id: 'BYcoTN6c',
      title: 'AI Automation Audit',
      fields: [],
    },
    answers: [
      { field: { id: '1', ref: 'company_name', type: 'short_text' }, type: 'text', text: 'Test Company Ltd' },
      { field: { id: '2', ref: 'industry', type: 'dropdown' }, type: 'choice', choice: { id: '1', label: 'E-commerce' } },
      { field: { id: '3', ref: 'company_size', type: 'dropdown' }, type: 'choice', choice: { id: '1', label: '11-50 employees' } },
      { field: { id: '4', ref: 'annual_revenue', type: 'dropdown' }, type: 'choice', choice: { id: '1', label: '£500K - £2M' } },
      { field: { id: '5', ref: 'primary_challenge', type: 'multiple_choice' }, type: 'choices', choices: { labels: ['Too much manual data entry', 'Slow customer response times'] } },
      { field: { id: '6', ref: 'time_consuming_processes', type: 'multiple_choice' }, type: 'choices', choices: { labels: ['Data entry and processing', 'Customer support/communication'] } },
      { field: { id: '7', ref: 'hours_per_week_manual', type: 'number' }, type: 'number', number: 25 },
      { field: { id: '8', ref: 'employees_repetitive_tasks', type: 'number' }, type: 'number', number: 4 },
      { field: { id: '9', ref: 'hourly_cost_employee', type: 'dropdown' }, type: 'choice', choice: { id: '1', label: '£20-£40' } },
      { field: { id: '10', ref: 'desired_outcomes', type: 'multiple_choice' }, type: 'choices', choices: { labels: ['Reduce operational costs', 'Save employee time', 'Scale without hiring'] } },
      { field: { id: '11', ref: 'email', type: 'email' }, type: 'email', email: 'phil@nukode.co.uk' },
    ],
  },
};

async function testWebhookLocally() {
  console.log('╔════════════════════════════════════════════╗');
  console.log('║   Local Webhook Test                       ║');
  console.log('╚════════════════════════════════════════════╝\n');

  try {
    // Step 1: Parse the payload
    console.log('1️⃣  Parsing Typeform payload...');
    const auditResponse = parseTypeformPayload(mockTypeformPayload as any);
    console.log(`   ✅ Parsed: ${auditResponse.companyName} (${auditResponse.industry})`);
    console.log(`   📧 Email: ${auditResponse.email}`);

    // Step 2: Calculate ROI
    console.log('\n2️⃣  Calculating ROI metrics...');
    const roiMetrics = calculateROIMetrics(auditResponse);
    console.log(`   ✅ Weekly hours: ${roiMetrics.totalWeeklyHours}h`);
    console.log(`   ✅ Monthly cost: £${roiMetrics.monthlyLaborCost.toFixed(2)}`);
    console.log(`   ✅ Annual cost: £${roiMetrics.annualLaborCost.toFixed(2)}`);

    // Step 3: Store in Supabase
    console.log('\n3️⃣  Storing in Supabase...');
    const submissionId = await createSubmission({
      typeform_response_id: mockTypeformPayload.form_response.token,
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
    console.log(`   ✅ Stored with ID: ${submissionId}`);

    // Step 4: Generate AI analysis
    console.log('\n4️⃣  Generating AI analysis with Gemini...');
    const aiAnalysis = await analyzeBusinessROI(auditResponse, roiMetrics);
    console.log(`   ✅ Strategy: "${aiAnalysis.strategy}"`);
    console.log(`   ✅ Savings: "${aiAnalysis.savings}"`);

    // Update submission with AI results
    await updateSubmission(submissionId, {
      ai_strategy: aiAnalysis.strategy,
      ai_implementation: aiAnalysis.implementation,
      ai_savings: aiAnalysis.savings,
    });
    console.log('   ✅ Updated Supabase with AI analysis');

    // Step 5: Send email
    console.log('\n5️⃣  Sending email via SendGrid...');
    const emailResult = await sendROIEmail({
      companyName: auditResponse.companyName,
      email: auditResponse.email,
      analysis: aiAnalysis,
      metrics: roiMetrics,
      auditResponse,
    });

    if (emailResult.success) {
      console.log(`   ✅ Email sent! Message ID: ${emailResult.messageId}`);
      await updateSubmission(submissionId, {
        email_sent: true,
        email_sent_at: new Date().toISOString(),
        processing_status: 'completed',
      });
    } else {
      console.log(`   ❌ Email failed: ${emailResult.error}`);
      await updateSubmission(submissionId, {
        processing_status: 'failed',
      });
    }

    // Summary
    console.log('\n════════════════════════════════════════════');
    console.log('✅ LOCAL TEST COMPLETE!');
    console.log('════════════════════════════════════════════');
    console.log(`\nCheck your Supabase table for submission: ${submissionId}`);
    console.log(`Check your inbox (${auditResponse.email}) for the ROI email.`);

  } catch (error: any) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

testWebhookLocally();
