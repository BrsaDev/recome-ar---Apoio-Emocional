import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  console.warn("GEMINI_API_KEY is not defined. AI functionality will be limited.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY || '' });

export const chatWithAI = async (message: string, history: { role: string; parts: { text: string }[] }[]) => {
  if (!API_KEY) throw new Error("API Key missing");
  
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      ...history,
      { role: 'user', parts: [{ text: message }] }
    ],
    config: {
      systemInstruction: "Você é uma IA acolhedora e empática do App Recomeçar. Seu objetivo é ouvir, validar sentimentos e oferecer apoio emocional leve. Nunca substitua um profissional de saúde mental. Seja breve, use palavras gentis e evite jargões clínicos. Se o usuário estiver em crise grave, sugira procurar ajuda profissional ou o CVV (188 no Brasil).",
    },
  });

  return response.text || "Desculpe, não consegui processar sua mensagem agora.";
};
