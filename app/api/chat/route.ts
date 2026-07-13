import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const lastMessage = messages[messages.length - 1]?.content || 'Hello';
    
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'API key is missing from Vercel' }, { status: 500 });
    }

    // Using native fetch and the latest 2026 Gemini 3.5 Flash model
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: lastMessage }] }],
        }),
      }
    );

    const data = await response.json();

    // If Google rejects it, this will catch the exact error message
    if (!response.ok) {
      console.error('Google API Error:', data);
      return NextResponse.json({ error: data.error?.message || 'Google API error' }, { status: response.status });
    }
    
    const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response received.';
    return NextResponse.json({ reply: replyText });
    
  } catch (error: any) {
    console.error('Fetch Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}