-- Supabase Database Schema for Typeform AI Audit Automation
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create typeform_submissions table
CREATE TABLE IF NOT EXISTS typeform_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    typeform_id VARCHAR(255) UNIQUE NOT NULL,
    form_id VARCHAR(255) NOT NULL,
    submitted_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    -- Raw data storage
    raw_data JSONB NOT NULL,

    -- Extracted fields for easy querying
    company_name VARCHAR(255),
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    industry VARCHAR(100),
    company_size VARCHAR(50),
    annual_revenue VARCHAR(50),

    -- Business details
    primary_challenge TEXT,
    time_consuming_processes TEXT,
    manual_hours_per_week INTEGER,
    employees_on_repetitive_tasks INTEGER,
    hourly_cost_per_employee VARCHAR(50),
    monthly_operating_costs VARCHAR(100),
    current_tech_stack TEXT,

    -- Goals and expectations
    desired_outcomes TEXT,
    expected_roi_timeline VARCHAR(50),
    implementation_budget VARCHAR(50),
    best_time_to_contact VARCHAR(50),

    -- Processing status
    status VARCHAR(50) DEFAULT 'pending_audit' CHECK (status IN ('pending_audit', 'processing', 'completed', 'failed')),
    audit_id UUID REFERENCES ai_audits(id),

    -- Indexes for common queries
    created_at_idx TIMESTAMPTZ
);

-- Create ai_audits table
CREATE TABLE IF NOT EXISTS ai_audits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    submission_id UUID NOT NULL REFERENCES typeform_submissions(id) ON DELETE CASCADE,

    -- ROI calculation results
    roi_calculation JSONB NOT NULL,

    -- Full audit report (markdown/html)
    audit_report TEXT NOT NULL,

    -- Timestamps
    generated_at TIMESTAMPTZ DEFAULT NOW(),
    sent_at TIMESTAMPTZ,

    -- Email delivery status
    email_sent BOOLEAN DEFAULT FALSE,
    email_error TEXT
);

-- Create indexes for performance
CREATE INDEX idx_submissions_email ON typeform_submissions(email);
CREATE INDEX idx_submissions_status ON typeform_submissions(status);
CREATE INDEX idx_submissions_created_at ON typeform_submissions(created_at DESC);
CREATE INDEX idx_audits_submission_id ON ai_audits(submission_id);
CREATE INDEX idx_audits_generated_at ON ai_audits(generated_at DESC);

-- Create a view for easy audit lookups
CREATE OR REPLACE VIEW submission_audits AS
SELECT
    s.id as submission_id,
    s.typeform_id,
    s.company_name,
    s.email,
    s.industry,
    s.company_size,
    s.submitted_at,
    s.status,
    a.id as audit_id,
    a.roi_calculation,
    a.audit_report,
    a.generated_at,
    a.email_sent
FROM typeform_submissions s
LEFT JOIN ai_audits a ON s.audit_id = a.id
ORDER BY s.created_at DESC;

-- Row Level Security (RLS) Policies
ALTER TABLE typeform_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_audits ENABLE ROW LEVEL SECURITY;

-- Allow service role to do everything (for API access)
CREATE POLICY "Service role has full access to submissions" ON typeform_submissions
    FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role has full access to audits" ON ai_audits
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Optional: Create a function to get audit statistics
CREATE OR REPLACE FUNCTION get_audit_stats()
RETURNS TABLE (
    total_submissions BIGINT,
    completed_audits BIGINT,
    pending_audits BIGINT,
    failed_audits BIGINT,
    avg_processing_time INTERVAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(*)::BIGINT as total_submissions,
        COUNT(CASE WHEN status = 'completed' THEN 1 END)::BIGINT as completed_audits,
        COUNT(CASE WHEN status = 'pending_audit' OR status = 'processing' THEN 1 END)::BIGINT as pending_audits,
        COUNT(CASE WHEN status = 'failed' THEN 1 END)::BIGINT as failed_audits,
        AVG(CASE
            WHEN status = 'completed' AND audit_id IS NOT NULL
            THEN (SELECT generated_at FROM ai_audits WHERE id = typeform_submissions.audit_id) - submitted_at
        END) as avg_processing_time
    FROM typeform_submissions;
END;
$$ LANGUAGE plpgsql;

-- Comments for documentation
COMMENT ON TABLE typeform_submissions IS 'Stores all Typeform submissions for AI audit requests';
COMMENT ON TABLE ai_audits IS 'Stores generated AI audit reports and ROI calculations';
COMMENT ON COLUMN typeform_submissions.status IS 'Current processing status: pending_audit, processing, completed, or failed';
COMMENT ON COLUMN ai_audits.roi_calculation IS 'JSON object containing detailed ROI calculations and automation opportunities';
