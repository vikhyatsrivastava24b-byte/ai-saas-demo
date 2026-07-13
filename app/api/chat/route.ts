import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const lastMessage = messages[messages.length - 1]?.content || 'Hello';
    
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'API key is missing from Vercel' }, { status: 500 });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: lastMessage }] }],
          safetySettings: [
            { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
          ]
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('Google API Error:', data);
      return NextResponse.json({ error: data.error?.message || 'Google API error' }, { status: response.status });
    }
    
    const candidate = data.candidates?.[0];
    
    // Check if Google actively blocked the prompt
    if (candidate && candidate.finishReason !== 'STOP') {
      return NextResponse.json({ reply: `Response blocked by Google. Reason: ${candidate.finishReason}` });
    }

    const replyText = candidate?.content?.parts?.[0]?.text || 'No response received.';
    return NextResponse.json({ reply: replyText });
    
  } catch (error: any) {
    console.error('Fetch Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}