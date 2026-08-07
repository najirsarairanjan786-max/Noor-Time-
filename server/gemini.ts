import { Router } from "express";
import { GoogleGenAI } from "@google/genai";

const router = Router();

let aiClient: GoogleGenAI | null = null;

function getAI(): GoogleGenAI {
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

router.post("/api/gemini/chat", async (req, res) => {
  try {
    const { prompt, history } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const ai = getAI();
    const chat = ai.chats.create({
      model: "gemini-3.6-flash",
      config: {
        systemInstruction: "You are Noor AI, a helpful and wise Islamic assistant. You provide guidance based on Islamic teachings with compassion and clarity. Always start or end with an Islamic greeting if appropriate. Keep your answers concise and supportive.",
      },
      history: history || [],
    });

    const response = await chat.sendMessage({ message: prompt });
    
    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Gemini API error:", error);
    res.status(500).json({ error: error.message || "Failed to generate response" });
  }
});

export default router;
