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
  ContactRoleOptions,
  AutomationExperienceOptions,
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

async function updateTypeform() {
  try {
    console.log('Updating Typeform with 20 essential questions...\n');

    const formUpdate = {
      title: 'AI Automation Audit - Nukode',
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
          title: 'Thank you! Your comprehensive AI Automation Audit Report is being prepared.',
          properties: {
            description:
              "Our AI is analyzing your responses right now. You'll receive an email within minutes with a link to view and download your personalised PDF report.",
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

        {
          title: 'What is your role in the company?',
          ref: 'contact_role',
          type: 'dropdown',
          properties: {
            choices: ContactRoleOptions.map((option) => ({ label: option })),
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
          title: 'In 2-3 sentences, describe the task or workflow that wastes the most time for your team.',
          ref: 'biggest_bottleneck',
          type: 'long_text',
          properties: {},
          validations: {
            required: true,
          },
        },
        {
          title: 'How many hours per week does EACH employee typically spend on manual/repetitive tasks?',
          ref: 'hours_per_week_manual',
          type: 'number',
          properties: {},
          validations: {
            required: true,
          },
        },
        {
          title: 'How many employees regularly perform repetitive tasks?',
          ref: 'employees_repetitive_tasks',
          type: 'number',
          properties: {},
          validations: {
            required: true,
          },
        },
        {
          title: 'What is the average hourly cost per employee (salary + benefits)?',
          ref: 'hourly_cost_employee',
          type: 'dropdown',
          properties: {
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
          title: 'Have you tried automating any processes before?',
          ref: 'automation_experience',
          type: 'dropdown',
          properties: {
            choices: AutomationExperienceOptions.map((option) => ({ label: option })),
          },
          validations: {
            required: true,
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

    // Fetch current form to preserve theme
    console.log(`Fetching current form to preserve theme...`);
    const currentFormResponse = await fetch(`https://api.typeform.com/forms/${TYPEFORM_FORM_ID}`, {
      headers: { 'Authorization': `Bearer ${TYPEFORM_API_TOKEN}` },
    });
    if (currentFormResponse.ok) {
      const currentForm = await currentFormResponse.json();
      if (currentForm.theme) {
        (formUpdate as any).theme = currentForm.theme;
        console.log(`Preserving theme: ${currentForm.theme.href}`);
      }
    }

    console.log(`Updating form: ${TYPEFORM_FORM_ID}...`);

    const response = await fetch(`https://api.typeform.com/forms/${TYPEFORM_FORM_ID}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${TYPEFORM_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formUpdate),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('\n❌ Error updating Typeform:');
      console.error('Status:', response.status);
      console.error('Details:', JSON.stringify(errorData, null, 2));
      process.exit(1);
    }

    const result = await response.json();
    console.log('\n✅ Success! Your Typeform has been updated with 20 questions.');
    console.log(`\nView your form at: https://form.typeform.com/to/${TYPEFORM_FORM_ID}`);
    console.log(`Edit your form at: https://admin.typeform.com/form/${TYPEFORM_FORM_ID}/create`);
  } catch (error: any) {
    console.error('\n❌ Error:');
    console.error(error.message);
    console.error(error);
    process.exit(1);
  }
}

updateTypeform();
