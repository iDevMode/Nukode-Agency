export interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface PricingTier {
  name: string;
  price: string;
  description: string;
  features: string[];
  popular?: boolean;
}

export interface ROIAnalysis {
  strategy: string;
  savings: string;
  implementation: string;
}

export enum BotStatus {
  IDLE = 'IDLE',
  THINKING = 'THINKING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}