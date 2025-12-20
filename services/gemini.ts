import { GoogleGenAI, Type } from "@google/genai";
import { ROIAnalysis } from "../types";

export const analyzeBusinessROI = async (
  businessType: string,
  bottleneck: string
): Promise<ROIAnalysis> => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey || apiKey === 'your_api_key_here') {
      throw new Error("Please add your Gemini API key to the .env file");
    }

    const ai = new GoogleGenAI({ apiKey });
    const prompt = `
      You are a senior AI Automation Consultant for an agency called "Nukode".
      The user runs a business of type: "${businessType}".
      Their biggest manual bottleneck is: "${bottleneck}".

      Propose a pragmatic, high-ROI AI automation solution. We do not sell gimmicks; we sell returns.
      
      Return the response in JSON format with the following schema:
      {
        "strategy": "A catchy title for the automation workflow (max 5 words)",
        "implementation": "A 2-sentence description of how we build this agentic workflow or chatbot to solve the problem.",
        "savings": "An estimate of hours saved per week or money saved per month (be realistic but optimistic)."
      }
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            strategy: { type: Type.STRING },
            implementation: { type: Type.STRING },
            savings: { type: Type.STRING },
          },
          required: ["strategy", "implementation", "savings"],
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    return JSON.parse(text) as ROIAnalysis;
  } catch (error) {
    console.error("Gemini Error:", error);
    throw error;
  }
};