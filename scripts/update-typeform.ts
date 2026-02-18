import { createClient } from '@typeform/api-client';
import dotenv from 'dotenv';
import {
  IndustryOptions,
  CompanySizeOptions,
  AnnualRevenueOptions,
  PrimaryChallengeOptions,
  TimeConsumingProcessOptions,
  HourlyCostOptions,
  MonthlyOperatingCostsOptions,
  TechStackOptions,
  DesiredOutcomesOptions,
  ROITimelineOptions,
  ImplementationBudgetOptions,
  BestTimeOptions,
} from './typeform-types';

// Load environment variables
dotenv.config();

const TYPEFORM_API_TOKEN = process.env.TYPEFORM_API_TOKEN;
const TYPEFORM_FORM_ID = process.env.TYPEFORM_FORM_ID || 'BYcoTN6c';

if (!TYPEFORM_API_TOKEN) {
  console.error('Error: TYPEFORM_API_TOKEN is not set in .env file');
  process.exit(1);
}

const typeformClient = createClient({ token: TYPEFORM_API_TOKEN });

async function updateTypeform() {
  try {
    console.log('Updating Typeform with 17 essential questions...\n');

    // First, get the current form to preserve some settings
    const currentForm = await typeformClient.forms.get({ uid: TYPEFORM_FORM_ID });

    const formUpdate = {
      title: 'AI Automation Audit - Nukode',
      settings: currentForm.settings,
      welcome_screens: [
        {
          title: 'Welcome to Your Free AI Automation Audit',
          properties: {
            description:
              "We'll analyze your business and show you exactly where AI can save time and reduce costs. This takes less than 2 minutes.",
            show_button: true,
            button_text: "Let's Start",
          },
        },
      ],
      thankyou_screens: [
        {
          title: 'Thank you! Your AI Automation Audit is being prepared.',
          properties: {
            description:
              "We'll analyze your responses and send you a detailed ROI report within 24-48 hours. Keep an eye on your inbox!",
            show_button: false,
            share_icons: false,
          },
        },
      ],
      fields: [

        // Business Fundamentals
        {
          title: 'What is your company name?',
          ref: 'company_name',
          type: 'short_text',
          validations: {
            required: true,
          },
        },
        {
          title: 'Which industry best describes your business?',
          ref: 'industry',
          type: 'dropdown',
          properties: {
            choices: IndustryOptions.map((option) => ({ label: option })),
          },
          validations: {
            required: true,
          },
        },
        {
          title: 'How many employees does your company have?',
          ref: 'company_size',
          type: 'dropdown',
          properties: {
            choices: CompanySizeOptions.map((option) => ({ label: option })),
          },
          validations: {
            required: true,
          },
        },
        {
          title: "What is your company's approximate annual revenue?",
          ref: 'annual_revenue',
          type: 'dropdown',
          properties: {
            choices: AnnualRevenueOptions.map((option) => ({ label: option })),
          },
          validations: {
            required: true,
          },
        },

        // Critical for ROI Calculation
        {
          title: 'What are your primary business challenges? (Select all that apply)',
          ref: 'primary_challenge',
          type: 'multiple_choice',
          properties: {
            allow_multiple_selection: true,
            choices: PrimaryChallengeOptions.map((option) => ({ label: option })),
          },
          validations: {
            required: true,
          },
        },
        {
          title: 'Which processes consume the most time for your team? (Select all that apply)',
          ref: 'time_consuming_processes',
          type: 'multiple_choice',
          properties: {
            allow_multiple_selection: true,
            choices: TimeConsumingProcessOptions.map((option) => ({ label: option })),
          },
          validations: {
            required: true,
          },
        },
        {
          title: 'Approximately how many hours per week does your team spend on manual/repetitive tasks?',
          ref: 'hours_per_week_manual',
          type: 'number',
          properties: {
            description: 'This helps us calculate potential time savings',
          },
          validations: {
            required: true,
            min_value: 0,
            max_value: 168,
          },
        },
        {
          title: 'How many employees regularly perform repetitive tasks?',
          ref: 'employees_repetitive_tasks',
          type: 'number',
          properties: {
            description: 'Estimate the number of team members who could benefit from automation',
          },
          validations: {
            required: true,
            min_value: 1,
          },
        },
        {
          title: 'What is the average hourly cost per employee (salary + benefits)?',
          ref: 'hourly_cost_employee',
          type: 'dropdown',
          properties: {
            description: 'This helps calculate your potential ROI',
            choices: HourlyCostOptions.map((option) => ({ label: option })),
          },
          validations: {
            required: true,
          },
        },

        // Context & Goals
        {
          title: 'What are your approximate monthly operating costs?',
          ref: 'monthly_operating_costs',
          type: 'dropdown',
          properties: {
            choices: MonthlyOperatingCostsOptions.map((option) => ({ label: option })),
          },
        },
        {
          title: 'What tools/platforms does your team currently use? (Select all that apply)',
          ref: 'current_tech_stack',
          type: 'multiple_choice',
          properties: {
            allow_multiple_selection: true,
            choices: TechStackOptions.map((option) => ({ label: option })),
          },
        },
        {
          title: 'What outcomes are you hoping to achieve with AI automation? (Select all that apply)',
          ref: 'desired_outcomes',
          type: 'multiple_choice',
          properties: {
            allow_multiple_selection: true,
            choices: DesiredOutcomesOptions.map((option) => ({ label: option })),
          },
          validations: {
            required: true,
          },
        },
        {
          title: 'What is your expected timeline for seeing ROI?',
          ref: 'expected_roi_timeline',
          type: 'dropdown',
          properties: {
            choices: ROITimelineOptions.map((option) => ({ label: option })),
          },
        },
        {
          title: 'What is your budget range for AI automation implementation?',
          ref: 'implementation_budget',
          type: 'dropdown',
          properties: {
            choices: ImplementationBudgetOptions.map((option) => ({ label: option })),
          },
        },

        // Contact Information
        {
          title: 'What is your email address?',
          ref: 'email',
          type: 'email',
          validations: {
            required: true,
          },
        },
        {
          title: 'What is your phone number? (Optional)',
          ref: 'phone',
          type: 'phone_number',
        },
        {
          title: 'When is the best time to contact you?',
          ref: 'best_time_contact',
          type: 'dropdown',
          properties: {
            choices: BestTimeOptions.map((option) => ({ label: option })),
          },
        },
      ],
    };

    console.log(`Updating form: ${TYPEFORM_FORM_ID}...`);
    await typeformClient.forms.update({ uid: TYPEFORM_FORM_ID, data: formUpdate as any });

    console.log('\n✅ Success! Your Typeform has been updated with 17 questions.');
    console.log(`\nView your form at: https://form.typeform.com/to/${TYPEFORM_FORM_ID}`);
    console.log(`Edit your form at: https://admin.typeform.com/form/${TYPEFORM_FORM_ID}/create`);
  } catch (error: any) {
    console.error('\n❌ Error updating Typeform:');
    console.error(error.message);
    if (error.response?.data) {
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
    if (error.response?.status) {
      console.error('Status code:', error.response.status);
    }
    console.error('\nFull error:', error);
    process.exit(1);
  }
}

updateTypeform();
