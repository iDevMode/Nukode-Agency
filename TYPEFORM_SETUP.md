# Typeform Database & AI Audit Integration Setup Guide

This guide will walk you through setting up the complete automation pipeline from Typeform → Database → AI Audit.

## 📋 Overview

**Automation Flow:**
```
Typeform Submission → Webhook → Vercel API → Supabase DB → Gemini AI → Audit Report
```

## 🚀 Setup Steps

### 1. Supabase Database Setup

#### Create Supabase Project
1. Go to [https://supabase.com](https://supabase.com)
2. Sign up/Login and click "New Project"
3. Choose organization and set:
   - **Project Name:** `nukode-audits` (or your choice)
   - **Database Password:** (save this securely)
   - **Region:** Choose closest to your users (e.g., London)
4. Wait 2-3 minutes for project to initialize

#### Run Database Schema
1. In your Supabase dashboard, navigate to **SQL Editor** (left sidebar)
2. Click "New query"
3. Copy the entire contents of `supabase-schema.sql`
4. Paste into the SQL editor
5. Click "Run" (or press Cmd/Ctrl + Enter)
6. Verify tables created: Go to **Table Editor** and confirm you see:
   - `typeform_submissions`
   - `ai_audits`

#### Get API Credentials
1. Go to **Settings** → **API** (left sidebar)
2. Copy these values for your `.env` file:
   - **Project URL:** `SUPABASE_URL`
   - **service_role key** (under "Project API keys"): `SUPABASE_SERVICE_KEY`

   ⚠️ **Important:** Use the `service_role` key, NOT the `anon` key (service_role bypasses RLS)

### 2. Install Dependencies

```bash
npm install
```

This will install:
- `@supabase/supabase-js` - Supabase client
- `@google/generative-ai` - Gemini AI SDK
- `@vercel/node` - Vercel serverless functions types

### 3. Environment Variables

#### Local Development
1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in your credentials:
   ```env
   GEMINI_API_KEY=your_gemini_key
   SUPABASE_URL=https://xxxxx.supabase.co
   SUPABASE_SERVICE_KEY=your_service_role_key
   VERCEL_URL=localhost:3000
   ```

#### Production (Vercel)
1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add each variable:
   - `GEMINI_API_KEY`
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_KEY`
4. Click "Save"

### 4. Deploy to Vercel

```bash
# If not already logged in
npx vercel login

# Deploy
npx vercel --prod
```

After deployment, note your production URL (e.g., `https://nukode-agency.vercel.app`)

### 5. Configure Typeform Webhook

#### Get Your Webhook URL
Your webhook endpoint will be:
```
https://your-domain.vercel.app/api/typeform-webhook
```

#### Set Up in Typeform
1. Go to [Typeform Dashboard](https://admin.typeform.com)
2. Open your form (ID: `BYcoTN6c`)
3. Navigate to **Connect** → **Webhooks**
4. Click "Add a webhook"
5. Enter:
   - **Endpoint URL:** `https://your-domain.vercel.app/api/typeform-webhook`
   - **Secret:** (optional, for signature verification - save if used)
6. Click "Save webhook"
7. Click "Send test request" to verify it works

#### Verify Webhook
Check your Supabase database:
1. Go to **Table Editor** → `typeform_submissions`
2. You should see a test entry
3. Check `ai_audits` table for generated audit

### 6. Update Typeform Questions (IMPORTANT)

Your form needs specific questions for ROI calculation. Here's the recommended structure:

#### Required Questions:

1. **Welcome Screen**
   - Title: "Free AI Automation Audit"
   - Description: "Let's discover how AI can transform your business"

2. **Company Name** (Short text)
   - Field ref: `company_name`
   - Required: Yes

3. **Industry** (Dropdown)
   - Field ref: `industry`
   - Options:
     - SaaS / Technology
     - E-commerce / Retail
     - Professional Services
     - Healthcare
     - Manufacturing
     - Finance / Insurance
     - Marketing / Advertising
     - Other

4. **Company Size** (Multiple choice)
   - Field ref: `company_size`
   - Options: 1-10, 11-50, 51-200, 201-1000, 1000+

5. **Annual Revenue** (Multiple choice)
   - Field ref: `annual_revenue`
   - Options: <£100K, £100K-£500K, £500K-£2M, £2M-£10M, £10M+

6. **Primary Business Challenge** (Multiple choice, allow multiple)
   - Field ref: `primary_challenge`
   - Options:
     - High operational costs
     - Slow manual processes
     - Customer service bottlenecks
     - Data entry/processing inefficiencies
     - Poor lead qualification
     - Document processing delays
     - Other

7. **Time-Consuming Processes** (Multiple choice, allow multiple)
   - Field ref: `time_consuming_processes`
   - Options:
     - Customer support/inquiries
     - Data entry & management
     - Lead qualification & sales outreach
     - Document generation/processing
     - Reporting & analytics
     - Inventory/order management
     - Other

8. **Manual Hours per Week** (Number slider)
   - Field ref: `manual_hours_per_week`
   - Range: 0-100
   - Description: "How many hours/week are spent on repetitive tasks?"

9. **Employees on Repetitive Tasks** (Number)
   - Field ref: `employees_on_repetitive_tasks`
   - Description: "How many team members spend time on manual, repetitive work?"

10. **Hourly Cost per Employee** (Multiple choice)
    - Field ref: `hourly_cost_per_employee`
    - Options: £10-20, £20-40, £40-60, £60-100, £100+

11. **Current Tech Stack** (Multiple choice, allow multiple)
    - Field ref: `current_tech_stack`
    - Options:
      - CRM (Salesforce, HubSpot, etc.)
      - Project Management (Asana, Monday, etc.)
      - Communication (Slack, Teams, etc.)
      - Accounting (Xero, QuickBooks, etc.)
      - No significant tools
      - Other

12. **Desired Outcomes** (Multiple choice, allow multiple)
    - Field ref: `desired_outcomes`
    - Options:
      - Reduce operational costs
      - Save time on manual tasks
      - Improve customer response time
      - Increase sales conversion
      - Better data insights
      - Other

13. **Expected ROI Timeline** (Multiple choice)
    - Field ref: `expected_roi_timeline`
    - Options: 1-3 months, 3-6 months, 6-12 months, 12+ months

14. **Implementation Budget** (Multiple choice)
    - Field ref: `implementation_budget`
    - Options: <£5K, £5K-£15K, £15K-£50K, £50K+, Not sure yet

15. **Email** (Email field)
    - Field ref: `email`
    - Required: Yes

16. **Phone** (Phone field)
    - Field ref: `phone`
    - Required: No

17. **Best Time to Contact** (Multiple choice)
    - Field ref: `best_time_to_contact`
    - Options: Morning (9-12), Afternoon (12-5), Evening (5-7), Anytime

18. **Thank You Screen**
    - Title: "Thank you! Your audit is being generated..."
    - Description: "We'll send your personalized AI automation audit to your email within the next few minutes."

#### Map Field References
After creating questions in Typeform:
1. Click on each question
2. In the right sidebar, expand "Advanced"
3. Set the **Reference** field to match the field refs above
4. This ensures the webhook data maps correctly to database columns

### 7. Testing the Full Flow

#### Test Submission
1. Open your Typeform: `https://form.typeform.com/to/BYcoTN6c`
2. Fill out with test data
3. Submit the form

#### Verify in Supabase
1. Go to **Table Editor** → `typeform_submissions`
2. Find your test submission (check `email` field)
3. Verify `status` changes from `pending_audit` → `processing` → `completed`
4. Check `ai_audits` table for the generated audit

#### Check Logs (if issues)
1. In Vercel dashboard, go to **Deployments**
2. Click on your latest deployment
3. Click **Functions** tab
4. Check logs for `typeform-webhook` and `generate-audit` functions

## 🔍 Monitoring & Management

### View Submissions
Query all submissions with audits:
```sql
SELECT * FROM submission_audits ORDER BY submitted_at DESC;
```

### Check Processing Status
```sql
SELECT status, COUNT(*) as count
FROM typeform_submissions
GROUP BY status;
```

### Get Statistics
```sql
SELECT * FROM get_audit_stats();
```

### Reprocess Failed Audits
```sql
-- Find failed submissions
SELECT id, company_name, email FROM typeform_submissions WHERE status = 'failed';

-- Trigger reprocessing via API call
-- POST https://your-domain.vercel.app/api/generate-audit
-- Body: { "submission_id": "uuid-here" }
```

## 🎨 Optional Enhancements

### Email Delivery
To automatically send audit reports via email, integrate an email service:

1. **Resend** (recommended - simple & generous free tier)
   ```bash
   npm install resend
   ```

2. Add to `api/generate-audit.ts` after audit generation:
   ```typescript
   import { Resend } from 'resend';
   const resend = new Resend(process.env.RESEND_API_KEY);

   await resend.emails.send({
     from: 'audits@yourdomain.com',
     to: submission.email,
     subject: `Your AI Automation Audit - ${submission.company_name}`,
     html: `<div>${auditReport}</div>`
   });
   ```

3. Add `RESEND_API_KEY` to environment variables

### Dashboard for Viewing Audits
Create a simple admin dashboard:
- `/admin/audits` - List all submissions
- `/admin/audits/[id]` - View individual audit
- Use Supabase Row Level Security for protection

### Typeform Response Piping
Use Typeform's hidden fields to track source:
- Add hidden field `utm_source`, `utm_campaign`
- Analyze which marketing channels drive best leads

## 🐛 Troubleshooting

### Webhook not receiving data
- Check webhook URL is correct in Typeform
- Verify Vercel deployment is live
- Check Vercel function logs for errors

### Database errors
- Verify `SUPABASE_SERVICE_KEY` is correct (not anon key)
- Check SQL schema ran successfully
- Verify field names match Typeform field refs

### AI generation failing
- Verify `GEMINI_API_KEY` is valid
- Check API quota limits
- Review function logs for specific error messages

### Field mapping issues
- Ensure Typeform field refs match exactly (case-sensitive)
- Check `raw_data` column in Supabase to see actual field names
- Update `api/typeform-webhook.ts` mapping if needed

## 📊 ROI Calculation Logic

The AI agent calculates ROI based on:

1. **Current Annual Cost:**
   ```
   manual_hours_per_week × 52 weeks × employees × hourly_cost
   ```

2. **Automation Savings:**
   - Typically 40-60% reduction in repetitive task costs
   - Based on specific process automation opportunities

3. **Implementation Cost:**
   - Estimated based on complexity and scope
   - Typically £15K-£50K for SMBs

4. **ROI Percentage:**
   ```
   ((annual_savings - implementation_cost) / implementation_cost) × 100
   ```

5. **Payback Period:**
   ```
   implementation_cost / (annual_savings / 12)
   ```

The AI customizes these calculations based on industry, company size, and specific challenges.

## 📝 Next Steps

1. ✅ Set up Supabase database
2. ✅ Configure environment variables
3. ✅ Deploy to Vercel
4. ✅ Set up Typeform webhook
5. ✅ Update Typeform questions with field refs
6. ✅ Test full automation flow
7. 🎯 Add email delivery (optional)
8. 🎯 Create admin dashboard (optional)
9. 🎯 Monitor submissions and refine AI prompts

## 🆘 Need Help?

- **Supabase Docs:** https://supabase.com/docs
- **Vercel Docs:** https://vercel.com/docs
- **Typeform Webhooks:** https://developer.typeform.com/webhooks/
- **Gemini AI:** https://ai.google.dev/docs

---

**Questions or Issues?** Check the troubleshooting section or review the function logs in Vercel.
