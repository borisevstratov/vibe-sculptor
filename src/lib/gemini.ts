import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import type { Config } from "../App";

export const GeminiModels = [
    "gemini-3-pro-preview",
    "gemini-3-flash-preview",
    "gemini-2.5-pro",
    "gemini-2.5-flash",
    "gemini-2.5-flash-lite"
]

export const generateContentStream = async (config: Config, state: string, prompt: string) => {
    const ai = new GoogleGenAI({ apiKey: config.apiKey });
    const modelName = config.model ?? "gemini-2.5-flash";

    const response = await ai.models.generateContentStream({
        model: modelName,
        config: {
            systemInstruction:
                "You are a Vibe Sculptor. Update the provided code/text state based on instructions. Return ONLY the updated state.",
            thinkingConfig: modelName.includes("gemini-3")
                ? { thinkingLevel: modelName.includes("flash") ? ThinkingLevel.MINIMAL : ThinkingLevel.LOW }
                : { thinkingBudget: modelName.includes("flash") ? 0 : 128 }
        },
        contents: `Current State:\n${state}\n\nInstruction: ${prompt}`,
    });

    return response
}