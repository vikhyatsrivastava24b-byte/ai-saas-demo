import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';

// Initialize the official Google Gen AI SDK using the key from your .env file
const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY });

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    
    // Get the text content of the very last user message
    const lastMessage = messages[messages.length - 1]?.content || 'Hello';

    // Call the Gemini 2.5 Flash model cleanly
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: lastMessage,
    });

    return NextResponse.json({ reply: response.text });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}