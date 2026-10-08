import { GoogleGenAI } from "@google/genai";

export class Chat {
  private ai: GoogleGenAI;

  constructor() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set.");
  }
  this.ai = new GoogleGenAI({ apiKey });
}

  async ask(prompt: string): Promise<string> {
    const response = await this.ai.models.generateContent({
      model: process.env.GEMINI_MODEL || "gemini-3.5-flash",
      contents: prompt,
    });

    return response.text || "[]";
  }
}
