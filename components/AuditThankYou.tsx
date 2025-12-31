import React, { useEffect, useState } from 'react';
import { Sparkles, CheckCircle, Mail } from 'lucide-react';

interface AuditThankYouProps {
  // Props will be populated from URL query parameters
}

export const AuditThankYou: React.FC = () => {
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [auditId, setAuditId] = useState<string | null>(null);

  useEffect(() => {
    // Extract Typeform data from URL parameters
    const params = new URLSearchParams(window.location.search);

    // Typeform passes responses as query parameters when using redirect
    const formData = {
      company_name: params.get('company_name'),
      email: params.get('email'),
      industry: params.get('industry'),
      company_size: params.get('company_size'),
      annual_revenue: params.get('annual_revenue'),
      primary_challenge: params.get('primary_challenge'),
      time_consuming_processes: params.get('time_consuming_processes'),
      manual_hours_per_week: params.get('manual_hours_per_week'),
      employees_on_repetitive_tasks: params.get('employees_on_repetitive_tasks'),
      hourly_cost_per_employee: params.get('hourly_cost_per_employee'),
      monthly_operating_costs: params.get('monthly_operating_costs'),
      current_tech_stack: params.get('current_tech_stack'),
      desired_outcomes: params.get('desired_outcomes'),
      expected_roi_timeline: params.get('expected_roi_timeline'),
      implementation_budget: params.get('implementation_budget'),
      phone: params.get('phone'),
      best_time_to_contact: params.get('best_time_to_contact'),
    };

    // Only process if we have email (minimum required field)
    if (formData.email) {
      submitToSupabase(formData);
    } else {
      setStatus('error');
    }
  }, []);

  const submitToSupabase = async (formData: any) => {
    try {
      // Call your API endpoint that stores to Supabase
      const response = await fetch('/api/store-submission', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        setAuditId(result.audit_id);
        setStatus('success');
      } else {
        setStatus('error');
      }
    } catch (error) {
      console.error('Submission error:', error);
      setStatus('error');
    }
  };

  return (
    <section className="min-h-screen bg-gradient-to-b from-nukode-black to-nukode-dark flex items-center justify-center px-6">
      <div className="max-w-2xl w-full">
        <div className="bg-nukode-card border border-white/10 rounded-2xl p-12 text-center">
          {status === 'processing' && (
            <>
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white/5 rounded-full mb-6 animate-pulse">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl font-serif text-white mb-4 italic">
                Generating Your AI Audit...
              </h1>
              <p className="text-nukode-muted text-lg mb-8">
                Our AI is analyzing your business data and calculating your ROI potential.
              </p>
              <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                <div className="bg-white h-full rounded-full animate-[progress_2s_ease-in-out]" style={{
                  animation: 'progress 2s ease-in-out infinite'
                }}></div>
              </div>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500/10 rounded-full mb-6">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <h1 className="text-3xl font-serif text-white mb-4 italic">
                Your Audit is Ready!
              </h1>
              <p className="text-nukode-muted text-lg mb-8">
                We've sent a detailed AI automation audit to your email. Check your inbox (and spam folder) for:
              </p>
              <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-left mb-8">
                <ul className="space-y-3 text-nukode-muted">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Personalized ROI calculation for your business</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Specific automation opportunities identified</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Implementation roadmap and timeline</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Projected cost savings over 3 years</span>
                  </li>
                </ul>
              </div>
              <div className="flex items-center justify-center gap-2 text-sm text-nukode-muted">
                <Mail className="w-4 h-4" />
                <span>Didn't receive it? Check spam or contact us</span>
              </div>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="inline-flex items-center justify-center w-20 h-20 bg-red-500/10 rounded-full mb-6">
                <span className="text-4xl">⚠️</span>
              </div>
              <h1 className="text-3xl font-serif text-white mb-4 italic">
                Something Went Wrong
              </h1>
              <p className="text-nukode-muted text-lg mb-8">
                We couldn't process your submission. Please try again or contact us directly.
              </p>
              <button
                onClick={() => window.location.href = '/#consultant'}
                className="px-6 py-3 bg-white text-nukode-black rounded-lg font-medium hover:bg-white/90 transition-colors"
              >
                Try Again
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  );
};
