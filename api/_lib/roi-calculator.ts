// ROI Calculator
// Calculates concrete ROI metrics from Typeform audit responses

import { TypeformAuditResponse } from './typeform-parser';

export interface ROIMetrics {
  weeklyLaborCost: number;
  monthlyLaborCost: number;
  annualLaborCost: number;
  potentialSavings30Percent: number;
  potentialSavings50Percent: number;
  hourlyRate: number;
  totalWeeklyHours: number;
}

// Parse hourly cost range string to midpoint value
function parseHourlyCost(hourlyCostRange: string): number {
  if (!hourlyCostRange) return 30; // Default fallback

  // Handle ranges like "£20-£40"
  const rangeMatch = hourlyCostRange.match(/£(\d+)\s*[-–]\s*£(\d+)/);
  if (rangeMatch) {
    const low = parseInt(rangeMatch[1], 10);
    const high = parseInt(rangeMatch[2], 10);
    return (low + high) / 2;
  }

  // Handle "£100+" case
  if (hourlyCostRange.includes('+')) {
    const plusMatch = hourlyCostRange.match(/£(\d+)\+/);
    if (plusMatch) {
      return parseInt(plusMatch[1], 10) * 1.2; // Assume 20% above base
    }
  }

  // Handle simple value like "£50"
  const simpleMatch = hourlyCostRange.match(/£(\d+)/);
  if (simpleMatch) {
    return parseInt(simpleMatch[1], 10);
  }

  return 30; // Default fallback
}

export function calculateROIMetrics(response: TypeformAuditResponse): ROIMetrics {
  const hourlyRate = parseHourlyCost(response.hourlyCostPerEmployee);
  const weeklyHours = response.hoursPerWeekOnManualTasks || 0;
  const employees = response.employeesOnRepetitiveTasks || 1;

  // Total weekly hours spent on manual tasks across all employees
  const totalWeeklyHours = weeklyHours * employees;

  // Calculate costs
  const weeklyLaborCost = hourlyRate * totalWeeklyHours;
  const monthlyLaborCost = weeklyLaborCost * 4.33; // Average weeks per month
  const annualLaborCost = weeklyLaborCost * 52;

  // Calculate potential savings at different automation levels
  const potentialSavings30Percent = annualLaborCost * 0.3;
  const potentialSavings50Percent = annualLaborCost * 0.5;

  return {
    weeklyLaborCost: Math.round(weeklyLaborCost * 100) / 100,
    monthlyLaborCost: Math.round(monthlyLaborCost * 100) / 100,
    annualLaborCost: Math.round(annualLaborCost * 100) / 100,
    potentialSavings30Percent: Math.round(potentialSavings30Percent * 100) / 100,
    potentialSavings50Percent: Math.round(potentialSavings50Percent * 100) / 100,
    hourlyRate,
    totalWeeklyHours,
  };
}

// Format currency for display in emails
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Generate a human-readable ROI summary
export function generateROISummary(metrics: ROIMetrics): string {
  return `Based on ${metrics.totalWeeklyHours} hours/week of manual work at ${formatCurrency(metrics.hourlyRate)}/hour, ` +
    `you're spending approximately ${formatCurrency(metrics.monthlyLaborCost)}/month on repetitive tasks. ` +
    `With AI automation, you could save ${formatCurrency(metrics.potentialSavings30Percent)} to ${formatCurrency(metrics.potentialSavings50Percent)} annually.`;
}
