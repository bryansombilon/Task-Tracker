import { GoogleGenAI, Type } from "@google/genai";
import { Priority } from '../types';

const apiKey = process.env.API_KEY || '';
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const analyzeTaskPriority = async (taskName: string): Promise<Priority | null> => {
  if (!ai) return null;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Analyze the urgency and importance of this task name: "${taskName}". Suggest a priority level from the following options: Urgent, High, Medium, Low. Return ONLY the priority word.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            priority: {
              type: Type.STRING,
              enum: ["Urgent", "High", "Medium", "Low"]
            }
          }
        }
      }
    });

    const json = JSON.parse(response.text || '{}');
    return json.priority as Priority;
  } catch (error) {
    console.error("Gemini analysis failed:", error);
    return null;
  }
};
