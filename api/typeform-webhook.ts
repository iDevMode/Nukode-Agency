// Typeform Webhook Handler
// POST /api/typeform-webhook
// Receives Typeform submissions, processes with AI, stores in Supabase, sends email

import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as crypto from 'crypto';
import {
  parseTypeformPayload,
  getTypeformResponseId,
  TypeformWebhookPayload,
} from './_lib/typeform-parser';
import { createSubmission, updateSubmission, getSubmissionByTypeformId } from './_lib/supabase';
import { calculateROIMetrics } from './_lib/roi-calculator';
import { analyzeBusinessROI } from './_lib/gemini-server';
import { sendROIEmail } from './_lib/sendgrid';

// Verify Typeform webhook signature
function verifySignature(payload: string, signature: string | undefined): boolean {
  const secret = process.env.TYPEFORM_WEBHOOK_SECRET;

  // Skip verification if no secret is configured (development mode)
  if (!secret) {
    console.warn('TYPEFORM_WEBHOOK_SECRET not set - skipping signature verification');
    return true;
  }

  if (!signature) {
    console.error('No signature provided in request');
    return false;
  }

  // Typeform uses sha256 HMAC
  const expectedSignature = `sha256=${crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('base64')}`;

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get raw body for signature verification
  const rawBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
  const signature = req.headers['typeform-signature'] as string | undefined;

  // Verify signature
  if (!verifySignature(rawBody, signature)) {
    console.error('Invalid webhook signature');
    return res.status(401).json({ error: 'Invalid signature' });
  }

  let submissionId: string | undefined;

  try {
    // Parse the webhook payload
    const payload: TypeformWebhookPayload =
      typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

    // Get unique response ID from Typeform
    const typeformResponseId = getTypeformResponseId(payload);

    // Check for duplicate submissions
    const existingSubmission = await getSubmissionByTypeformId(typeformResponseId);
    if (existingSubmission) {
      console.log(`Duplicate submission detected: ${typeformResponseId}`);
      return res.status(200).json({
        success: true,
        message: 'Submission already processed',
        submissionId: existingSubmission.id,
      });
    }

    // Parse form data
    const auditResponse = parseTypeformPayload(payload);
    console.log(`Processing submission for: ${auditResponse.companyName} (${auditResponse.email})`);

    // Calculate ROI metrics
    const roiMetrics = calculateROIMetrics(auditResponse);
    console.log(`ROI calculated: ${roiMetrics.monthlyLaborCost}/month in manual labor`);

    // Create initial submission in Supabase
    submissionId = await createSubmission({
      typeform_response_id: typeformResponseId,
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

    console.log(`Submission created: ${submissionId}`);

    // Generate AI analysis
    let aiAnalysis;
    try {
      aiAnalysis = await analyzeBusinessROI(auditResponse, roiMetrics);
      console.log(`AI analysis generated: ${aiAnalysis.strategy}`);

      // Update submission with AI results
      await updateSubmission(submissionId, {
        ai_strategy: aiAnalysis.strategy,
        ai_implementation: aiAnalysis.implementation,
        ai_savings: aiAnalysis.savings,
      });
    } catch (aiError) {
      console.error('AI analysis failed:', aiError);
      // Continue without AI analysis - we can still send a basic email
      aiAnalysis = {
        strategy: 'Custom AI Automation Solution',
        implementation: 'Our team will analyze your specific challenges and design a tailored automation solution to reduce manual work and improve efficiency.',
        savings: `Estimated ${Math.round(roiMetrics.potentialSavings30Percent)}-${Math.round(roiMetrics.potentialSavings50Percent)} GBP annually`,
      };
    }

    // Send personalized email
    const emailResult = await sendROIEmail({
      companyName: auditResponse.companyName,
      email: auditResponse.email,
      analysis: aiAnalysis,
      metrics: roiMetrics,
      auditResponse,
    });

    if (emailResult.success) {
      console.log(`Email sent successfully: ${emailResult.messageId}`);
      await updateSubmission(submissionId, {
        email_sent: true,
        email_sent_at: new Date().toISOString(),
        processing_status: 'completed',
      });
    } else {
      console.error('Email sending failed:', emailResult.error);
      await updateSubmission(submissionId, {
        processing_status: 'failed',
      });
    }

    // Return success response
    return res.status(200).json({
      success: true,
      submissionId,
      emailSent: emailResult.success,
    });
  } catch (error: any) {
    console.error('Webhook processing error:', error);

    // Update submission status if we have an ID
    if (submissionId) {
      try {
        await updateSubmission(submissionId, {
          processing_status: 'failed',
        });
      } catch (updateError) {
        console.error('Failed to update submission status:', updateError);
      }
    }

    // Return 200 to prevent Typeform retries for non-transient errors
    // Typeform will retry on 4xx/5xx errors
    return res.status(200).json({
      success: false,
      error: error.message || 'Processing failed',
      submissionId,
    });
  }
}
