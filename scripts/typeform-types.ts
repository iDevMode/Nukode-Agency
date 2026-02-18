// TypeScript types for Typeform ROI Audit Form Response

export interface TypeformAuditResponse {
  companyName: string;
  industry: string;
  companySize: string;
  annualRevenue: string;
  role: string;
  primaryChallenge: string[];
  timeConsumingProcesses: string[];
  biggestBottleneck: string;
  hoursPerWeekOnManualTasks: number;
  employeesOnRepetitiveTasks: number;
  hourlyCostPerEmployee: string;
  monthlyOperatingCosts: string;
  automationExperience: string;
  currentTechStack: string[];
  desiredOutcomes: string[];
  expectedROITimeline: string;
  implementationBudget: string;
  email: string;
  phone?: string;
  bestTimeToContact?: string;
}

export const IndustryOptions = [
  'SaaS',
  'E-commerce',
  'Professional Services',
  'Healthcare',
  'Manufacturing',
  'Financial Services',
  'Real Estate',
  'Education',
  'Marketing/Advertising',
  'Retail',
  'Other'
];

export const CompanySizeOptions = [
  '1-10 employees',
  '11-50 employees',
  '51-200 employees',
  '201-1000 employees',
  '1000+ employees'
];

export const AnnualRevenueOptions = [
  'Less than £100K',
  '£100K - £500K',
  '£500K - £2M',
  '£2M - £10M',
  '£10M+',
  'Prefer not to say'
];

export const PrimaryChallengeOptions = [
  'High operational costs',
  'Too much manual data entry',
  'Slow customer response times',
  'Inconsistent quality control',
  'Difficulty scaling operations',
  'Complex reporting requirements',
  'Team spending time on repetitive tasks',
  'Other'
];

export const TimeConsumingProcessOptions = [
  'Data entry and processing',
  'Customer support/communication',
  'Report generation',
  'Document processing',
  'Email management',
  'Scheduling and calendar management',
  'Invoice/payment processing',
  'Inventory management',
  'Other'
];

export const HourlyCostOptions = [
  '£10-£20',
  '£20-£40',
  '£40-£60',
  '£60-£80',
  '£80-£100',
  '£100+'
];

export const MonthlyOperatingCostsOptions = [
  'Less than £10K',
  '£10K - £50K',
  '£50K - £100K',
  '£100K - £500K',
  '£500K+',
  'Prefer not to say'
];

export const TechStackOptions = [
  'CRM (Salesforce, HubSpot, etc.)',
  'Project Management (Asana, Monday, etc.)',
  'Accounting Software (QuickBooks, Xero, etc.)',
  'E-commerce Platform (Shopify, WooCommerce, etc.)',
  'Customer Support (Zendesk, Intercom, etc.)',
  'Marketing Automation (Mailchimp, ActiveCampaign, etc.)',
  'Other',
  'None - limited tech stack'
];

export const DesiredOutcomesOptions = [
  'Reduce operational costs',
  'Save employee time',
  'Improve customer satisfaction',
  'Scale without hiring',
  'Improve data accuracy',
  'Speed up processes',
  'Better insights/reporting',
  'Other'
];

export const ROITimelineOptions = [
  '1-3 months',
  '3-6 months',
  '6-12 months',
  '12+ months',
  'No specific timeline'
];

export const ImplementationBudgetOptions = [
  'Less than £5K',
  '£5K - £15K',
  '£15K - £50K',
  '£50K - £100K',
  '£100K+',
  'Not sure yet'
];

export const ContactRoleOptions = [
  'CEO / Founder',
  'Operations / COO',
  'IT / Technology',
  'Marketing',
  'Sales',
  'Finance',
  'Other'
];

export const AutomationExperienceOptions = [
  'Never tried',
  'Tried but unsuccessful',
  'Have some basic automation',
  'Have significant automation'
];

export const BestTimeOptions = [
  'Morning (9am-12pm)',
  'Afternoon (12pm-5pm)',
  'Evening (5pm-7pm)',
  'Flexible'
];
