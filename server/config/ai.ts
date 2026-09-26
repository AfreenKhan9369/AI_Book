import { GoogleGenAI } from "@google/genai";

let genAIClient: GoogleGenAI | null = null;
let lastResolvedKey: string | null = null;

export function resolveGeminiApiKey(): string | undefined {
  const candidateKeys = [
    process.env.GEMINI_API_KEY,
    process.env.GOOGLE_API_KEY,
    process.env.GOOGLE_GENAI_API_KEY,
    process.env.VITE_GEMINI_API_KEY,
    process.env.VITE_GOOGLE_API_KEY,
    process.env.NETLIFY_GEMINI_API_KEY,
    process.env.API_KEY,
  ];

  for (const raw of candidateKeys) {
    if (!raw) continue;
    const cleaned = String(raw).trim().replace(/^["']|["']$/g, "");
    if (
      cleaned &&
      cleaned !== "MY_GEMINI_API_KEY" &&
      cleaned !== "your_gemini_api_key" &&
      cleaned !== "undefined" &&
      cleaned !== "null" &&
      cleaned.length >= 10
    ) {
      return cleaned;
    }
  }

  return undefined;
}

export function hasGeminiKey(): boolean {
  return !!resolveGeminiApiKey();
}

export function getGeminiClient(): GoogleGenAI | null {
  const apiKey = resolveGeminiApiKey();
  if (!apiKey) {
    return null;
  }

  if (!genAIClient || lastResolvedKey !== apiKey) {
    genAIClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
    lastResolvedKey = apiKey;
  }

  return genAIClient;
}

