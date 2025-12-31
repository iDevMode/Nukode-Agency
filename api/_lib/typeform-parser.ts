// Typeform webhook payload parser
// Maps Typeform webhook responses to TypeformAuditResponse

export interface TypeformAuditResponse {
  companyName: string;
  industry: string;
  companySize: string;
  annualRevenue: string;
  primaryChallenge: string[];
  timeConsumingProcesses: string[];
  hoursPerWeekOnManualTasks: number;
  employeesOnRepetitiveTasks: number;
  hourlyCostPerEmployee: string;
  monthlyOperatingCosts: string;
  currentTechStack: string[];
  desiredOutcomes: string[];
  expectedROITimeline: string;
  implementationBudget: string;
  email: string;
  phone?: string;
  bestTimeToContact?: string;
}

// Typeform webhook payload types
interface TypeformAnswer {
  field: {
    id: string;
    ref: string;
    type: string;
  };
  type: string;
  text?: string;
  email?: string;
  phone_number?: string;
  number?: number;
  choice?: {
    id: string;
    label: string;
    ref?: string;
  };
  choices?: {
    ids?: string[];
    labels: string[];
    refs?: string[];
  };
}

interface TypeformWebhookPayload {
  event_id: string;
  event_type: string;
  form_response: {
    form_id: string;
    token: string;
    landed_at: string;
    submitted_at: string;
    definition: {
      id: string;
      title: string;
      fields: Array<{
        id: string;
        ref: string;
        type: string;
        title: string;
      }>;
    };
    answers: TypeformAnswer[];
  };
}

// Field ref to property mapping
const FIELD_MAPPING: Record<string, keyof TypeformAuditResponse> = {
  'company_name': 'companyName',
  'industry': 'industry',
  'company_size': 'companySize',
  'annual_revenue': 'annualRevenue',
  'primary_challenge': 'primaryChallenge',
  'time_consuming_processes': 'timeConsumingProcesses',
  'hours_per_week_manual': 'hoursPerWeekOnManualTasks',
  'employees_repetitive_tasks': 'employeesOnRepetitiveTasks',
  'hourly_cost_employee': 'hourlyCostPerEmployee',
  'monthly_operating_costs': 'monthlyOperatingCosts',
  'current_tech_stack': 'currentTechStack',
  'desired_outcomes': 'desiredOutcomes',
  'expected_roi_timeline': 'expectedROITimeline',
  'implementation_budget': 'implementationBudget',
  'email': 'email',
  'phone': 'phone',
  'best_time_contact': 'bestTimeToContact',
};

function extractAnswerValue(answer: TypeformAnswer): string | string[] | number | undefined {
  switch (answer.type) {
    case 'text':
      return answer.text;
    case 'email':
      return answer.email;
    case 'phone_number':
      return answer.phone_number;
    case 'number':
      return answer.number;
    case 'choice':
      return answer.choice?.label;
    case 'choices':
      return answer.choices?.labels || [];
    default:
      console.warn(`Unknown answer type: ${answer.type}`);
      return undefined;
  }
}

export function parseTypeformPayload(payload: TypeformWebhookPayload): TypeformAuditResponse {
  const answers = payload.form_response.answers;

  // Initialize with defaults
  const response: TypeformAuditResponse = {
    companyName: '',
    industry: '',
    companySize: '',
    annualRevenue: '',
    primaryChallenge: [],
    timeConsumingProcesses: [],
    hoursPerWeekOnManualTasks: 0,
    employeesOnRepetitiveTasks: 0,
    hourlyCostPerEmployee: '',
    monthlyOperatingCosts: '',
    currentTechStack: [],
    desiredOutcomes: [],
    expectedROITimeline: '',
    implementationBudget: '',
    email: '',
  };

  // Map each answer to the response
  for (const answer of answers) {
    const fieldRef = answer.field.ref;
    const propertyName = FIELD_MAPPING[fieldRef];

    if (!propertyName) {
      console.warn(`Unknown field ref: ${fieldRef}`);
      continue;
    }

    const value = extractAnswerValue(answer);

    if (value !== undefined) {
      // Type-safe assignment based on property type
      if (propertyName === 'hoursPerWeekOnManualTasks' || propertyName === 'employeesOnRepetitiveTasks') {
        (response as any)[propertyName] = typeof value === 'number' ? value : parseInt(String(value), 10) || 0;
      } else if (
        propertyName === 'primaryChallenge' ||
        propertyName === 'timeConsumingProcesses' ||
        propertyName === 'currentTechStack' ||
        propertyName === 'desiredOutcomes'
      ) {
        (response as any)[propertyName] = Array.isArray(value) ? value : [value];
      } else {
        (response as any)[propertyName] = String(value);
      }
    }
  }

  // Validate required fields
  if (!response.email) {
    throw new Error('Missing required field: email');
  }
  if (!response.companyName) {
    throw new Error('Missing required field: companyName');
  }

  return response;
}

export function getTypeformResponseId(payload: TypeformWebhookPayload): string {
  return payload.form_response.token;
}

export function getTypeformSubmittedAt(payload: TypeformWebhookPayload): string {
  return payload.form_response.submitted_at;
}

export type { TypeformWebhookPayload };
