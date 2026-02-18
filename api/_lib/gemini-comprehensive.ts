// Comprehensive Gemini AI Analysis
// Generates a full structured report from Typeform audit responses

import { GoogleGenAI, Type } from '@google/genai';
import { TypeformAuditResponse } from './typeform-parser';
import { ROIMetrics, formatCurrency } from './roi-calculator';

// ============================================================================
// TYPES
// ============================================================================

export interface ComprehensiveROIAnalysis {
  executiveSummary: {
    headline: string;
    overview: string;
    toplineROI: string;
  };
  currentStateAssessment: {
    operationalOverview: string;
    painPointAnalysis: Array<{
      painPoint: string;
      impact: string;
      estimatedCostPerYear: string;
    }>;
    processInefficiencies: string;
  };
  recommendedSolutions: Array<{
    solutionName: string;
    description: string;
    processesAddressed: string[];
    technologyStack: string;
    implementationComplexity: string;
    expectedTimeSavingsHoursPerWeek: number;
    expectedCostSavingsPerYear: string;
  }>;
  implementationRoadmap: {
    phase1: { name: string; duration: string; activities: string[]; deliverables: string[] };
    phase2: { name: string; duration: string; activities: string[]; deliverables: string[] };
    phase3: { name: string; duration: string; activities: string[]; deliverables: string[] };
  };
  financialAnalysis: {
    currentAnnualCostOfManualWork: string;
    projectedSavingsConservative: string;
    projectedSavingsOptimistic: string;
    estimatedImplementationCost: string;
    paybackPeriodMonths: number;
    threeYearROI: string;
    additionalBenefits: string[];
  };
  whyNukode: {
    industryExpertise: string;
    approachDifferentiator: string;
    nextSteps: string[];
  };
}

// ============================================================================
// GEMINI RESPONSE SCHEMA
// ============================================================================

const phaseSchema = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING },
    duration: { type: Type.STRING },
    activities: { type: Type.ARRAY, items: { type: Type.STRING } },
    deliverables: { type: Type.ARRAY, items: { type: Type.STRING } },
  },
  required: ['name', 'duration', 'activities', 'deliverables'],
};

const comprehensiveSchema = {
  type: Type.OBJECT,
  properties: {
    executiveSummary: {
      type: Type.OBJECT,
      properties: {
        headline: { type: Type.STRING },
        overview: { type: Type.STRING },
        toplineROI: { type: Type.STRING },
      },
      required: ['headline', 'overview', 'toplineROI'],
    },
    currentStateAssessment: {
      type: Type.OBJECT,
      properties: {
        operationalOverview: { type: Type.STRING },
        painPointAnalysis: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              painPoint: { type: Type.STRING },
              impact: { type: Type.STRING },
              estimatedCostPerYear: { type: Type.STRING },
            },
            required: ['painPoint', 'impact', 'estimatedCostPerYear'],
          },
        },
        processInefficiencies: { type: Type.STRING },
      },
      required: ['operationalOverview', 'painPointAnalysis', 'processInefficiencies'],
    },
    recommendedSolutions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          solutionName: { type: Type.STRING },
          description: { type: Type.STRING },
          processesAddressed: { type: Type.ARRAY, items: { type: Type.STRING } },
          technologyStack: { type: Type.STRING },
          implementationComplexity: { type: Type.STRING },
          expectedTimeSavingsHoursPerWeek: { type: Type.NUMBER },
          expectedCostSavingsPerYear: { type: Type.STRING },
        },
        required: [
          'solutionName', 'description', 'processesAddressed', 'technologyStack',
          'implementationComplexity', 'expectedTimeSavingsHoursPerWeek', 'expectedCostSavingsPerYear',
        ],
      },
    },
    implementationRoadmap: {
      type: Type.OBJECT,
      properties: {
        phase1: phaseSchema,
        phase2: phaseSchema,
        phase3: phaseSchema,
      },
      required: ['phase1', 'phase2', 'phase3'],
    },
    financialAnalysis: {
      type: Type.OBJECT,
      properties: {
        currentAnnualCostOfManualWork: { type: Type.STRING },
        projectedSavingsConservative: { type: Type.STRING },
        projectedSavingsOptimistic: { type: Type.STRING },
        estimatedImplementationCost: { type: Type.STRING },
        paybackPeriodMonths: { type: Type.NUMBER },
        threeYearROI: { type: Type.STRING },
        additionalBenefits: { type: Type.ARRAY, items: { type: Type.STRING } },
      },
      required: [
        'currentAnnualCostOfManualWork', 'projectedSavingsConservative', 'projectedSavingsOptimistic',
        'estimatedImplementationCost', 'paybackPeriodMonths', 'threeYearROI', 'additionalBenefits',
      ],
    },
    whyNukode: {
      type: Type.OBJECT,
      properties: {
        industryExpertise: { type: Type.STRING },
        approachDifferentiator: { type: Type.STRING },
        nextSteps: { type: Type.ARRAY, items: { type: Type.STRING } },
      },
      required: ['industryExpertise', 'approachDifferentiator', 'nextSteps'],
    },
  },
  required: [
    'executiveSummary', 'currentStateAssessment', 'recommendedSolutions',
    'implementationRoadmap', 'financialAnalysis', 'whyNukode',
  ],
};

// ============================================================================
// PROMPT BUILDER
// ============================================================================

function buildComprehensivePrompt(
  auditResponse: TypeformAuditResponse,
  roiMetrics: ROIMetrics
): string {
  return `
You are a senior AI Automation Consultant producing a comprehensive audit report for "Nukode", an agency specialising in AI chatbots, agentic workflows, and business process automation.

Write a detailed, professional, and personalised analysis. Use concrete numbers, specific technology recommendations, and actionable advice. Write as if you are presenting this to the client's board.

## Client Profile
- **Company**: ${auditResponse.companyName}
- **Industry**: ${auditResponse.industry}
- **Company Size**: ${auditResponse.companySize}
- **Annual Revenue**: ${auditResponse.annualRevenue || 'Not disclosed'}
- **Contact Role**: ${auditResponse.role || 'Not specified'}
- **Monthly Operating Costs**: ${auditResponse.monthlyOperatingCosts || 'Not disclosed'}
- **Implementation Budget**: ${auditResponse.implementationBudget || 'Not specified'}
- **Automation Experience**: ${auditResponse.automationExperience || 'Not specified'}

## Current Pain Points
- **Primary Challenges**: ${auditResponse.primaryChallenge.join(', ')}
- **Time-Consuming Processes**: ${auditResponse.timeConsumingProcesses.join(', ')}
- **Biggest Bottleneck (in their own words)**: "${auditResponse.biggestBottleneck || 'Not provided'}"

## Manual Work Analysis
- **Hours per week per employee on manual tasks**: ${auditResponse.hoursPerWeekOnManualTasks} hours
- **Employees on repetitive tasks**: ${auditResponse.employeesOnRepetitiveTasks}
- **Total weekly hours across team**: ${roiMetrics.totalWeeklyHours} hours
- **Hourly labour cost**: ${auditResponse.hourlyCostPerEmployee}
- **Monthly cost of manual work**: ${formatCurrency(roiMetrics.monthlyLaborCost)}
- **Annual cost of manual work**: ${formatCurrency(roiMetrics.annualLaborCost)}

## Goals & Context
- **Desired Outcomes**: ${auditResponse.desiredOutcomes.join(', ')}
- **Expected ROI Timeline**: ${auditResponse.expectedROITimeline || 'Not specified'}
- **Current Tech Stack**: ${auditResponse.currentTechStack?.length > 0 ? auditResponse.currentTechStack.join(', ') : 'Limited tech stack'}

---

## Instructions

Produce a comprehensive JSON analysis covering these sections:

### 1. Executive Summary
- **headline**: A compelling, specific title for the report (8-12 words). Make it about THEIR business, not generic.
- **overview**: 2-3 paragraphs summarising the key findings and the opportunity. Reference their specific industry, challenges, and bottleneck description.
- **toplineROI**: A single punchy line about the key savings figure (e.g. "Projected to save £X/year with Y% ROI within Z months")

### 2. Current State Assessment
- **operationalOverview**: 2-3 detailed paragraphs analysing their current operations based on the data provided. Reference their bottleneck description, challenges, and processes. Be specific to their industry.
- **painPointAnalysis**: Array of 3-4 pain points with impact descriptions and estimated annual cost for each. Base costs on the labour metrics provided.
- **processInefficiencies**: A detailed paragraph about the systemic inefficiencies implied by their responses.

### 3. Recommended Solutions (2-3 solutions)
For each solution provide:
- A specific, named solution (e.g. "Intelligent Document Processing Pipeline", not "AI Solution 1")
- 3-5 sentence description of exactly what gets built
- Which of their processes it addresses
- Specific technology stack (mention actual tools: n8n, OpenAI, Zapier, etc.)
- Implementation complexity (Low/Medium/High)
- Realistic time savings in hours/week
- Realistic annual cost savings in GBP

### 4. Implementation Roadmap (3 phases)
- Phase 1: Quick wins (1-4 weeks)
- Phase 2: Core automation (4-8 weeks)
- Phase 3: Optimisation & scaling (8-12 weeks)
Each phase needs a name, duration, 3-4 activities, and 2-3 deliverables.

### 5. Financial Analysis
- Use the provided cost data to calculate realistic figures
- Conservative savings: 30% of annual manual cost
- Optimistic savings: 50% of annual manual cost
- Estimate implementation cost based on their budget range and solution complexity
- Calculate payback period in months
- Calculate 3-year ROI percentage
- List 3-4 additional non-financial benefits

### 6. Why Nukode
- **industryExpertise**: 2-3 sentences about Nukode's relevant expertise for their specific industry. Nukode specialises in AI chatbots, agentic AI workflows, and business process automation for SMEs.
- **approachDifferentiator**: 2-3 sentences about Nukode's approach (data-driven, ROI-focused, rapid deployment, ongoing support).
- **nextSteps**: 3-4 concrete next steps (e.g. "Book a free 30-minute strategy call", "We'll prepare a detailed technical specification", etc.)

IMPORTANT:
- All GBP amounts should use the format "£X,XXX" with proper formatting
- Be realistic and conservative with projections — credibility matters
- Reference the client's own words from their bottleneck description where relevant
- Tailor language to the contact's role (${auditResponse.role || 'business leader'})
- If they have automation experience, acknowledge it and build on it
`;
}

// ============================================================================
// MAIN FUNCTION
// ============================================================================

export async function analyzeBusinessComprehensive(
  auditResponse: TypeformAuditResponse,
  roiMetrics: ROIMetrics
): Promise<ComprehensiveROIAnalysis> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('Missing GEMINI_API_KEY');

  const ai = new GoogleGenAI({ apiKey });
  const prompt = buildComprehensivePrompt(auditResponse, roiMetrics);

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: comprehensiveSchema as any,
    },
  });

  const text = response.text;
  if (!text) throw new Error('No response from Gemini');

  return JSON.parse(text) as ComprehensiveROIAnalysis;
}
