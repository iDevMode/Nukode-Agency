// Server-side Gemini AI Service
// Adapted for Vercel serverless functions with enhanced prompting

import { GoogleGenAI, Type } from '@google/genai';
import { TypeformAuditResponse } from './typeform-parser';
import { ROIMetrics, formatCurrency } from './roi-calculator';

export interface ROIAnalysis {
  strategy: string;
  implementation: string;
  savings: string;
}

export async function analyzeBusinessROI(
  auditResponse: TypeformAuditResponse,
  roiMetrics: ROIMetrics
): Promise<ROIAnalysis> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'your_api_key_here') {
    throw new Error('Missing or invalid GEMINI_API_KEY environment variable');
  }

  const ai = new GoogleGenAI({ apiKey });

  // Build a comprehensive prompt with all business context
  const prompt = `
You are a senior AI Automation Consultant for "Nukode", an agency specializing in AI chatbots and agentic workflows.

## Client Information
- **Company**: ${auditResponse.companyName}
- **Industry**: ${auditResponse.industry}
- **Company Size**: ${auditResponse.companySize}
- **Annual Revenue**: ${auditResponse.annualRevenue || 'Not disclosed'}

## Current Pain Points
- **Primary Challenges**: ${auditResponse.primaryChallenge.join(', ')}
- **Time-Consuming Processes**: ${auditResponse.timeConsumingProcesses.join(', ')}

## Manual Work Analysis
- **Hours per week on manual tasks**: ${auditResponse.hoursPerWeekOnManualTasks} hours
- **Employees on repetitive tasks**: ${auditResponse.employeesOnRepetitiveTasks} people
- **Hourly labor cost**: ${auditResponse.hourlyCostPerEmployee}
- **Current monthly cost of manual work**: ${formatCurrency(roiMetrics.monthlyLaborCost)}
- **Annual cost**: ${formatCurrency(roiMetrics.annualLaborCost)}

## Their Goals
- **Desired Outcomes**: ${auditResponse.desiredOutcomes.join(', ')}
- **Expected ROI Timeline**: ${auditResponse.expectedROITimeline || 'Not specified'}
- **Implementation Budget**: ${auditResponse.implementationBudget || 'Not specified'}

## Current Tech Stack
${auditResponse.currentTechStack?.length > 0 ? auditResponse.currentTechStack.join(', ') : 'Limited tech stack'}

---

Based on this information, propose ONE specific, pragmatic, high-ROI AI automation solution that addresses their biggest pain points.

We do not sell gimmicks; we sell measurable returns. Focus on:
1. A solution that can realistically deliver 30-50% time savings
2. Something that integrates with their existing tech stack if possible
3. A quick win that can show ROI within their expected timeline

Return your response as JSON with this exact schema:
{
  "strategy": "A catchy, specific title for the automation solution (max 6 words)",
  "implementation": "A 2-3 sentence description of exactly what we'll build and how it solves their problem. Be specific about the technology (AI chatbot, agentic workflow, integration, etc.)",
  "savings": "A realistic estimate of time and money saved, based on the numbers provided. Format: 'X hours/week saved, approximately £Y/month'"
}
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            strategy: { type: Type.STRING },
            implementation: { type: Type.STRING },
            savings: { type: Type.STRING },
          },
          required: ['strategy', 'implementation', 'savings'],
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error('No response from Gemini AI');
    }

    const analysis = JSON.parse(text) as ROIAnalysis;

    // Validate the response has the required fields
    if (!analysis.strategy || !analysis.implementation || !analysis.savings) {
      throw new Error('Incomplete response from Gemini AI');
    }

    return analysis;
  } catch (error) {
    console.error('Gemini API error:', error);
    throw error;
  }
}
